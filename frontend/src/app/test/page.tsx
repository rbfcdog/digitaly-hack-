"use client";

import { useState } from "react";

import { queryClientInfo } from "@/services/agentService";
import { ClientInfo } from "@/types";


export default function Page() {

	const [data, setData] = useState<ClientInfo | null>(null);

  const fetchClientData = async () => {
    const clientId = "P-0036";

    try {
      const response = await queryClientInfo(clientId);
      const data: ClientInfo = response.data;
      setData(data);
      console.log("Client Data:", data);
    } catch (error) {
      console.error("Failed to fetch client data:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <button
        onClick={fetchClientData}
        className="m-4 p-2 bg-blue-500 text-white rounded"
      >
        Fetch Client Data
      </button>

			{data && (
				<div className="m-4 p-4 bg-white rounded shadow">
					<h2 className="text-xl font-bold mb-2">Client Information</h2>
					<pre className="text-xl text-black">{JSON.stringify(data, null, 2)}</pre>
				</div>
			)}
    </div>
  );
}
