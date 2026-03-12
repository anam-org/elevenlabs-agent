import ConversationView from "@/components/ConversationView";
import Header from "@/components/Header";

export type Preset = {
  label: string;
  avatarId: string;
  agentId: string;
  previewImage: string;
};

export default function Home() {
  const presets: Preset[] = [
    {
      label: process.env.PERSONA_1_NAME ?? "Persona 1",
      avatarId: process.env.PERSONA_1_AVATAR_ID ?? "",
      agentId: process.env.PERSONA_1_AGENT_ID ?? "",
      previewImage: "/avatar-preview-1.png",
    },
    {
      label: process.env.PERSONA_2_NAME ?? "Persona 2",
      avatarId: process.env.PERSONA_2_AVATAR_ID ?? "",
      agentId: process.env.PERSONA_2_AGENT_ID ?? "",
      previewImage: "/avatar-preview-2.png",
    },
    {
      label: process.env.PERSONA_3_NAME ?? "Persona 3",
      avatarId: process.env.PERSONA_3_AVATAR_ID ?? "",
      agentId: process.env.PERSONA_3_AGENT_ID ?? "",
      previewImage: "/avatar-preview-3.png",
    },
  ].filter((p) => p.avatarId && p.agentId);

  return (
    <main className="min-h-dvh flex flex-col">
      <Header />

      {/* Content section */}
      <div className="flex-1 flex flex-col items-center p-4 sm:p-8 pb-16 pt-24 sm:pt-28">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-black text-[20px] sm:text-[32px] font-medium tracking-[-0.4px] sm:tracking-[-0.64px] leading-[32px] sm:leading-[44px] flex items-baseline gap-1.5 sm:gap-2">
              Add a face to your
              <a
                href="https://elevenlabs.io/agents"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity inline-flex items-baseline"
              >
                <img
                  src="/elevenlabs-logo.svg"
                  alt="ElevenLabs"
                  className="h-[14px] sm:h-[22px] translate-y-[1px]"
                />
              </a>
              Agent
            </span>

          </div>
          <p className="text-black/70 text-[20px] sm:text-[32px] font-medium tracking-[-0.4px] sm:tracking-[-0.64px] leading-[32px] sm:leading-[44px] text-center">
            Expressive Voice Agents
          </p>
        </div>
        <ConversationView presets={presets} />
      </div>

      <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-2 sm:gap-8 py-4 sm:py-6 px-4 bg-[#F5F5F5] backdrop-blur-sm">
      <a
          href="https://lab.anam.ai/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black text-white hover:bg-gray transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
        >
          Create Anam API Key
        </a>
        <a
          href="https://anam.ai/cookbook/elevenlabs-expressive-voice-agents"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white text-black hover:bg-black hover:text-white transition-all text-xs sm:text-sm font-medium whitespace-nowrap"
        >
          Check out the Cookbook
        </a>
      
      </footer>
    </main>
  );
}
