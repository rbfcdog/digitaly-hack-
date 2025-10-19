"use client";
import React, { useEffect, useState } from "react";

interface NotificationProps {
  message: string;
  duration?: number;
  visible: boolean;
  onClose: () => void;
  color?: string;
  offsetY?: number; // 🆕 deslocamento vertical (em pixels)
}

const Notification: React.FC<NotificationProps> = ({
  message,
  duration = 3000,
  visible,
  onClose,
  color = "green",
  offsetY = 20, // 🆕 padrão: 20px do topo
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  const backgroundColor =
    color === "red"
      ? "#f44336"
      : color === "blue"
      ? "#2196f3"
      : color === "orange"
      ? "#ff9800"
      : color === "green"
      ? "#4caf50"
      : color;

  return (
    <div
      style={{
        position: "fixed",
        top: show ? `${offsetY}px` : "-100px", 
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor,
        color: "#fff",
        padding: "12px 24px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        fontWeight: 600,
        transition: "top 0.3s ease-in-out",
        zIndex: 9999,
        maxWidth: "80%",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      {message}
    </div>
  );
};

export default Notification;
