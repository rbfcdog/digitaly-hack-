"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { startSession } from "@/services/sessionService";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const initSession = async () => {
      try {
        const patient_id = "P-0057"; // Example patient ID
        const res = await startSession(patient_id);
        const session = res.session_id;

        if (!session) throw new Error("Session not returned");

        // Redirect to /doctor with session and patient ID
        router.replace(`/doctor?session=${session}&id=${patient_id}`);
      } catch (err) {
        console.error("Failed to create session:", err);
      }
    };

    initSession();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-gray-600">
      Initializing session...
    </div>
  );
}
