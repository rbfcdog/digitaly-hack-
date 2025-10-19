"use client";

import ChatBox from "@/components/ChatBox/ChatBox";
import HeaderBar from "@/components/HeaderBar/Headerbar"; // import do novo header

export default function Page() {
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
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(0,0,0,0.1)",
            backgroundColor: "#fafafa",
            borderRadius: "12px",
          }}
        />
      </div>
    </div>
  );
}
