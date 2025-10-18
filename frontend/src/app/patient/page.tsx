"use client";

import ChatBox from "@/components/ChatBox/ChatBox";
import HeaderBar from "@/components/HeaderBar/Headerbar"; // import do novo header

export default function Page() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <HeaderBar />

      {/* Chat centralizado */}
      <div className="flex justify-center items-center flex-1">
        <ChatBox
          title="Atendimento Virtual"
          style={{ width: "500px", height: "500px" }}
        />
      </div>
    </div>
  );
}
