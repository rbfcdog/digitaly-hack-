"use client";

import React, { useEffect, useState } from "react";

interface NotificationProps {
  message: string;
  duration?: number; // tempo em ms
  visible: boolean; // se deve estar visível
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  duration = 3000,
  visible,
  onClose,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // espera animação acabar
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: show ? "20px" : "-100px", // animação de subida/descida
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#4caf50", // verde suave
        color: "#fff",
        padding: "12px 24px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        fontWeight: 600,
        transition: "top 0.3s ease-in-out",
        zIndex: 9999,
        maxWidth: "80%",
        textAlign: "center",
        pointerEvents: "none", // não bloqueia cliques
      }}
    >
      {message}
    </div>
  );
};

export default Notification;
