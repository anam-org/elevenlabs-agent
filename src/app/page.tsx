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
      {/* Content section */}
      <div className="flex-1 flex flex-col items-center px-3 sm:px-6 py-4 sm:py-8 gap-2 sm:gap-3">
        <ConversationView presets={presets} />
      </div>
    </main>
  );
}
