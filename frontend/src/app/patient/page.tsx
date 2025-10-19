"use client";

import ChatBox from "@/components/ChatBox/ChatBox";
import HeaderBar from "@/components/HeaderBar/Headerbar";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();

  const session_id = searchParams.get("session") || "";
  const role = "patient";
  const patient_id = searchParams.get("id") || undefined;

  return (
    <div
      className="flex flex-col h-screen"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      {/* Header */}
      <HeaderBar />

      {/* Chat centralizado */}
      <div className="flex justify-center items-center flex-1">
        <ChatBox
          title="Atendimento Virtual"
          style={{
            width: "750px",
            height: "750px",
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#ffffff",
            padding: "0.5rem",
          }}
          session_id={session_id}
          role={role}
          patient_id={patient_id}
        />
      </div>
    </div>
  );
}
