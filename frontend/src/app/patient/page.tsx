"use client";

import ChatBox from "@/components/ChatBox/ChatBox";
import HeaderBar from "@/components/HeaderBar/Headerbar";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();

  // Get parameters from URL
  const session_id = searchParams.get("session") || "";
  const role = "patient";
  const patient_id = searchParams.get("id") || undefined;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <HeaderBar />

      {/* Chat centralizado */}
      <div className="flex justify-center items-center flex-1">
        <ChatBox
          title="Atendimento Virtual"
          style={{ width: "500px", height: "500px" }}
          session_id={session_id}
          role={role}
          patient_id={patient_id}
        />
      </div>
    </div>
  );
}
