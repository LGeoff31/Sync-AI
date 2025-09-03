import { useEffect, useState } from "react";
import { FiCheck, FiX, FiExternalLink } from "react-icons/fi";

export interface ToastProps {
  isVisible: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "info";
  actionLabel?: string;
  actionUrl?: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  isVisible,
  title,
  message,
  type,
  actionLabel,
  actionUrl,
  onClose,
  duration = 5000,
}: ToastProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !isAnimating) return null;

  const bgColor =
    type === "success"
      ? "bg-gradient-to-r from-emerald-500/90 to-green-500/90"
      : type === "error"
      ? "bg-gradient-to-r from-red-500/90 to-rose-500/90"
      : "bg-gradient-to-r from-blue-500/90 to-indigo-500/90";

  const iconColor =
    type === "success"
      ? "text-emerald-100"
      : type === "error"
      ? "text-red-100"
      : "text-blue-100";

  return (
    <div className="fixed top-20 right-4 z-[60] max-w-md">
      <div
        className={`transform transition-all duration-300 ease-out ${
          isVisible
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-full opacity-0 scale-95"
        }`}
      >
        <div
          className={`${bgColor} backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl shadow-black/20 p-6`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`rounded-full p-2 ${
                type === "success" ? "bg-white/20" : "bg-white/20"
              }`}
            >
              {type === "success" && (
                <FiCheck className={`h-5 w-5 ${iconColor}`} />
              )}
              {type === "error" && <FiX className={`h-5 w-5 ${iconColor}`} />}
              {type === "info" && (
                <FiExternalLink className={`h-5 w-5 ${iconColor}`} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-lg mb-1">{title}</h3>
              <p className="text-white/90 text-sm leading-relaxed">{message}</p>

              {actionLabel && actionUrl && (
                <div className="mt-4">
                  <a
                    href={actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                  >
                    {actionLabel}
                    <FiExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
