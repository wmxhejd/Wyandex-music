import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Sparkles } from "lucide-react";
import WindowControls from "./player/WindowControls";
import appLogo from "../../src-tauri/icons/app-icon.png";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const STARS = [
  { x: 12, y: 18, size: 2, delay: 0.5, duration: 3.2, opacity: 0.8 },
{ x: 25, y: 72, size: 1.5, delay: 1.2, duration: 2.8, opacity: 0.6 },
{ x: 84, y: 23, size: 2.5, delay: 2.1, duration: 4.0, opacity: 0.9 },
{ x: 67, y: 81, size: 1.5, delay: 0.8, duration: 3.5, opacity: 0.7 },
{ x: 42, y: 15, size: 2, delay: 1.7, duration: 2.5, opacity: 0.5 },
{ x: 91, y: 64, size: 1.5, delay: 2.5, duration: 3.8, opacity: 0.8 },
{ x: 8, y: 88, size: 2, delay: 0.2, duration: 4.2, opacity: 0.6 },
{ x: 53, y: 44, size: 1.5, delay: 1.9, duration: 3.0, opacity: 0.5 },
{ x: 78, y: 39, size: 2, delay: 0.9, duration: 2.7, opacity: 0.7 },
{ x: 33, y: 62, size: 2.5, delay: 2.4, duration: 3.6, opacity: 0.9 },
{ x: 19, y: 35, size: 1.5, delay: 1.5, duration: 4.5, opacity: 0.4 },
{ x: 62, y: 12, size: 2, delay: 0.4, duration: 3.1, opacity: 0.8 },
{ x: 74, y: 92, size: 1.5, delay: 2.2, duration: 2.9, opacity: 0.6 },
{ x: 88, y: 8, size: 2.5, delay: 1.1, duration: 4.1, opacity: 0.7 },
{ x: 5, y: 51, size: 1.5, delay: 0.7, duration: 3.3, opacity: 0.5 },
{ x: 47, y: 85, size: 2, delay: 2.0, duration: 3.7, opacity: 0.8 },
{ x: 95, y: 45, size: 1.5, delay: 1.4, duration: 2.6, opacity: 0.6 },
{ x: 29, y: 94, size: 2, delay: 0.6, duration: 4.4, opacity: 0.7 },
{ x: 38, y: 28, size: 1.5, delay: 2.3, duration: 3.2, opacity: 0.5 },
{ x: 81, y: 73, size: 2, delay: 1.8, duration: 3.9, opacity: 0.9 },
];

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unlisten = listen("auth-success", () => {
      setLoading(false);
      onLoginSuccess();
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [onLoginSuccess]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await invoke("open_auth_window");
    } catch (err) {
      console.error(err);
      setError(String(err) || "Не удалось открыть окно авторизации");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen w-screen overflow-hidden bg-[#07070a] select-none">
    <div data-tauri-drag-region className="absolute top-0 left-0 right-16 h-10 z-30" />
    <div className="absolute top-2.5 right-3.5 z-40 flex items-center pointer-events-auto">
    <WindowControls />
    </div>

    <div className="absolute inset-0 pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#121026] to-[#07070a]" />
    <div className="absolute top-1/4 left-1/4 w-[26rem] h-[26rem] bg-[#ffcc00]/12 rounded-full blur-[140px]" />
    <div
    className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-purple-600/18 rounded-full blur-[150px]"
    style={{ animationDelay: "1s" }}
    />
    <div
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-pink-500/10 rounded-full blur-[160px]"
    style={{ animationDelay: "2s" }}
    />

    <div className="absolute inset-0 opacity-45">
    {STARS.map((star, i) => (
      <div
      key={i}
      className="absolute bg-white rounded-full animate-pulse"
      style={{
        width: `${star.size}px`,
        height: `${star.size}px`,
        left: `${star.x}%`,
        top: `${star.y}%`,
        opacity: star.opacity,
        animationDelay: `${star.delay}s`,
        animationDuration: `${star.duration}s`,
      }}
      />
    ))}
    </div>
    </div>

    <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center text-center px-4">
    <div className="relative mb-4 flex items-center justify-center">
    <img
    src={appLogo}
    alt="Wyandexmusic"
    className="w-16 h-16 sm:w-20 sm:h-20 aspect-square object-contain drop-shadow-[0_0_30px_rgba(255,204,0,0.35)] shrink-0"
    />
    </div>

    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-8">
    Wyandexmusic
    </h1>

    {error && (
      <div className="mb-6 w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-3.5 text-red-400 text-xs sm:text-sm animate-in fade-in">
      {error}
      </div>
    )}

    <button
    onClick={handleLogin}
    disabled={loading}
    className="w-full bg-[#ffcc00] hover:bg-[#ffd633] active:scale-95 text-black font-extrabold py-3.5 sm:py-4 px-6 rounded-2xl transition-all duration-200 shadow-[0_0_35px_rgba(255,204,0,0.4)] hover:shadow-[0_0_45px_rgba(255,204,0,0.6)] disabled:opacity-50 disabled:cursor-not-allowed border-none outline-none flex items-center justify-center space-x-2 text-sm sm:text-base cursor-pointer"
    >
    {loading ? (
      <div className="flex items-center space-x-2">
      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin shrink-0" />
      <span>Открываем окно входа...</span>
      </div>
    ) : (
      <div className="flex items-center space-x-2">
      <span>Войти через Яндекс</span>
      <Sparkles className="w-4 h-4 aspect-square shrink-0" />
      </div>
    )}
    </button>

    <p className="text-[11px] sm:text-xs text-white/40 leading-relaxed max-w-xs mt-6 select-none">
    Для входа используются ваши учетные данные Яндекс.
    <br />
    Токены хранятся локально и не передаются третьим лицам.
    </p>
    </div>
    </div>
  );
}
