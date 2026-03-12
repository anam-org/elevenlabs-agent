/**
 * ConversationView — starts an Anam avatar session backed by an ElevenLabs
 * voice agent running server-side on the engine.
 *
 * The client only deals with the Anam SDK — mic audio is captured over
 * WebRTC, and the avatar video + audio are streamed back. All ElevenLabs
 * STT → LLM → TTS orchestration happens on the engine.
 */
"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { AnamEvent, createClient, type AnamClient } from "@anam-ai/js-sdk";
import type { Preset } from "@/app/page";

type Status = "idle" | "connecting" | "connected" | "error";

type Message = {
  id: string;
  role: "user" | "persona";
  content: string;
  interrupted?: boolean;
};

export default function ConversationView({
  presets,
}: {
  presets: Preset[];
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");

  const anamClientRef = useRef<AnamClient | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript to bottom when new messages arrive
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages]);

  const start = useCallback(async () => {
    setStatus("connecting");
    setError(null);
    setMessages([]);

    try {
      const { avatarId, agentId } = presets[selectedIndex];

      const res = await fetch("/api/anam-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarId, agentId }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to get session token");
      }

      const { sessionToken } = await res.json();

      // Debug: decode JWT to inspect token type
      try {
        const payload = JSON.parse(atob(sessionToken.split(".")[1]));
        console.log("Token payload:", payload);
      } catch {}

      const anamClient = createClient(sessionToken, {
        ...(process.env.NEXT_PUBLIC_ANAM_API_URL && {
          api: { baseUrl: process.env.NEXT_PUBLIC_ANAM_API_URL },
        }),
      });
      anamClientRef.current = anamClient;

      // Stream events fire on every chunk; accumulate into messages by id
      anamClient.addListener(
        AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED,
        (evt: {
          id: string;
          content: string;
          role: string;
          endOfSpeech: boolean;
          interrupted: boolean;
        }) => {
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === evt.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = {
                ...next[idx],
                content: next[idx].content + evt.content,
                interrupted: evt.interrupted,
              };
              return next;
            }
            return [
              ...prev,
              {
                id: evt.id,
                role: evt.role as "user" | "persona",
                content: evt.content,
                interrupted: evt.interrupted,
              },
            ];
          });
        }
      );

      anamClient.addListener(AnamEvent.CONNECTION_CLOSED, () => {
        setStatus("idle");
      });

      await anamClient.streamToVideoElement("avatar-video");
      setStatus("connected");
    } catch (err) {
      console.error("Start error:", err);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null
            ? JSON.stringify(err)
            : String(err);
      setError(message);
      setStatus("error");
    }
  }, [presets, selectedIndex]);

  const stop = useCallback(async () => {
    try {
      await anamClientRef.current?.stopStreaming();
    } catch {}
    anamClientRef.current = null;
    setStatus("idle");
  }, []);

  const sendText = useCallback((text: string) => {
    if (!text.trim() || !anamClientRef.current) return;

    try {
      // Manually add user message to transcript (sendUserMessage doesn't trigger events)
      const userMessageId = `user-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId,
          role: "user",
          content: text,
        },
      ]);

      // Send user message programmatically
      anamClientRef.current.sendUserMessage(text);
      setTextInput("");
    } catch (err) {
      console.error("Error sending text:", err);
    }
  }, []);

  const handleSendText = useCallback(() => {
    sendText(textInput);
  }, [textInput, sendText]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendText();
      }
    },
    [handleSendText]
  );

  return (
    <div className="w-full flex flex-col items-center gap-4 pb-24">
      {/* Video player and persona selector row */}
      <div className="w-full flex justify-center items-start">
        <div className="relative w-full max-w-lg lg:max-w-xl">
          {/* Avatar video - centered */}
          <div
            className={`relative w-full aspect-[720/480] rounded-[32px] overflow-hidden ${
              status === "idle" ? "cursor-pointer" : ""
            }`}
            onClick={status === "idle" ? start : undefined}
          >
        <video
          id="avatar-video"
          autoPlay
          playsInline
          className="w-full h-full object-cover bg-black"
        />
        {status === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={presets[selectedIndex].previewImage}
              alt={presets[selectedIndex].label}
              className="w-full h-full object-cover"
            />
            
          </div>
        )}
        {status === "connecting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="flex items-center gap-3 text-white">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="font-medium">Connecting...</span>
            </div>
          </div>
        )}
      </div>

          {/* Persona selector — hidden when only one preset */}
          {presets.length > 1 && (
            <div className="absolute left-[calc(100%+16px)] top-0 hidden lg:flex lg:flex-col gap-2">
              {presets.map((preset, i) => {
                const labelMatch = preset.label.match(/^(.+?)\s*(\[.+?\])?$/);
                const mainText = labelMatch?.[1] || preset.label;
                const badge = labelMatch?.[2] || "";

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    disabled={status === "connecting" || status === "connected"}
                    className={`inline-flex items-start justify-center transition-colors disabled:opacity-50 whitespace-nowrap border border-dashed ${
                      i === selectedIndex
                        ? "border-[#FF6200] gap-0.5"
                        : "border-transparent gap-[3px]"
                    }`}
                    style={{ padding: "2px 3px 2px 4px" }}
                  >
                    <span
                      className="font-medium"
                      style={{
                        color: "rgba(0, 0, 0, 0.65)",
                        fontFamily: "Inter",
                        fontSize: "18px",
                        fontWeight: 500,
                        letterSpacing: "-0.36px",
                      }}
                    >
                      {mainText}
                    </span>
                    {badge && (
                      <span
                        style={{
                          color: "#FF6200",
                          fontFamily: '"Geist Mono"',
                          fontSize: "10px",
                          fontWeight: 400,
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile persona selector - below video */}
      {presets.length > 1 && (
        <div className="flex flex-row lg:hidden gap-2 justify-center">
          {presets.map((preset, i) => {
            const labelMatch = preset.label.match(/^(.+?)\s*(\[.+?\])?$/);
            const mainText = labelMatch?.[1] || preset.label;
            const badge = labelMatch?.[2] || "";

            return (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                disabled={status === "connecting" || status === "connected"}
                className={`inline-flex items-start justify-center transition-colors disabled:opacity-50 whitespace-nowrap border border-dashed ${
                  i === selectedIndex
                    ? "border-[#FF6200] gap-0.5"
                    : "border-transparent gap-[3px]"
                }`}
                style={{ padding: "2px 3px 2px 4px" }}
              >
                <span
                  className="font-medium"
                  style={{
                    color: "rgba(0, 0, 0, 0.65)",
                    fontFamily: "Inter",
                    fontSize: "18px",
                    fontWeight: 500,
                    letterSpacing: "-0.36px",
                  }}
                >
                  {mainText}
                </span>
                {badge && (
                  <span
                    style={{
                      color: "#FF6200",
                      fontFamily: '"Geist Mono"',
                      fontSize: "10px",
                      fontWeight: 400,
                    }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col items-center gap-3 w-full max-w-lg lg:max-w-xl">
        {status === "idle" || status === "error" ? (
          <button
            onClick={start}
            className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-accent text-white font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            Start Conversation
          </button>
        ) : status === "connecting" ? (
          <button
            disabled
            className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-gray text-white font-medium cursor-not-allowed opacity-50 text-sm sm:text-base"
          >
            Connecting...
          </button>
        ) : (
          <button
            onClick={stop}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white text-black hover:opacity-90 transition-all text-xs sm:text-sm font-medium whitespace-nowrap"
          >
            End Conversation
          </button>
        )}

        {status === "error" && error && (
          <span className="text-xs sm:text-sm text-accent">Error: {error}</span>
        )}
      </div>

      {/* Transcript - show when connected or when there are messages */}
      {(status === "connected" || messages.length > 0) && (
        <div
          ref={transcriptRef}
          className="w-full max-w-lg lg:max-w-xl max-h-64 overflow-y-auto rounded-[32px] bg-white p-4 sm:p-6 space-y-3 scroll-smooth"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <span className="text-[10px] sm:text-xs text-gray uppercase tracking-wide font-medium">
                {msg.role === "user" ? "YOU" : "AGENT"}
              </span>
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-[16px] px-3 py-2 sm:px-4 sm:py-3 ${
                  msg.role === "user"
                    ? "bg-black text-white"
                    : "bg-gray-light text-black"
                }`}
              >
                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    msg.interrupted ? "italic opacity-70" : ""
                  }`}
                >
                  {msg.content}
                  {msg.interrupted && (
                    <span className="ml-2 text-[10px] sm:text-xs opacity-60">
                      (interrupted)
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Text Input - only show when connected */}
      {status === "connected" && (
        <div className="w-full max-w-lg lg:max-w-xl">
          <div className="flex gap-2 items-center bg-white rounded-full px-4 py-3 shadow-md border border-gray-light focus-within:border-accent transition-colors">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 outline-none text-sm sm:text-base bg-transparent placeholder:text-gray"
            />
            <button
              type="button"
              onClick={handleSendText}
              disabled={!textInput.trim()}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-accent text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm whitespace-nowrap"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
