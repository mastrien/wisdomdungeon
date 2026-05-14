"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const backgrounds = {
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
      <div className={`
        flex items-center gap-3 px-6 py-3 rounded-2xl border-2 shadow-2xl
        ${backgrounds[type]}
      `}>
        {icons[type]}
        <span className="font-bold text-sm text-foreground">{message}</span>
      </div>
    </div>
  );
}
