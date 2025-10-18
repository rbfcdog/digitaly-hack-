"use client";

import ChatBox from "@/components/ChatBox/ChatBox";

export default function Page() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <ChatBox
        title="Atendimento Virtual"
        style={{ width: "500px", height: "500px" }}
      />
    </div>
  );
}
