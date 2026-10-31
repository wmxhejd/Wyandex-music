import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Music, Sparkles, Radio } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState("");

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
      console.error("Login error:", err);
      setError(String(err) || "Failed to open authentication window");
      setLoading(false);
    }
  };

  const handleManualTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;

    setLoading(true);
    setError("");

    try {
      await invoke("save_token", { token: manualToken.trim() });
      onLoginSuccess();
    } catch (err) {
      console.error("Token save error:", err);
      setError("Invalid token or authentication failed");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen overflow-hidden bg-[#050508]">
    <div className="absolute inset-0">
    <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]" />
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-purple/20 rounded-full blur-[120px] animate-pulse-glow"
    style={{ animationDelay: "1s" }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-pink/10 rounded-full blur-[150px] animate-pulse"
    style={{ animationDelay: "2s" }} />

    <div className="absolute inset-0 opacity-30">
    {[...Array(20)].map((_, i) => (
      <div
      key={i}
      className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
      style={{
        left: `${Math.random() * 100}%`,
                                   top: `${Math.random() * 100}%`,
                                   animationDelay: `${Math.random() * 3}s`,
                                   animationDuration: `${2 + Math.random() * 2}s`,
      }}
      />
    ))}
    </div>
    </div>

    <div className="relative z-10 w-full max-w-md mx-4">
    <div className="glass-strong rounded-3xl p-10 shadow-2xl border border-white/20">
    <div className="flex flex-col items-center space-y-6 mb-8">
    <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-r from-primary via-cyber-pink to-cyber-purple blur-xl opacity-75 group-hover:opacity-100 transition-opacity rounded-full" />
    <div className="relative bg-gradient-to-br from-primary to-cyber-purple p-6 rounded-2xl transform group-hover:scale-105 transition-transform">
    <Music size={56} className="text-white" strokeWidth={2.5} />
    </div>
    <div className="absolute -top-2 -right-2">
    <Sparkles size={24} className="text-primary animate-pulse" />
    </div>
    </div>

    <div className="text-center space-y-3">
    <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-cyber-pink to-cyber-purple bg-clip-text text-transparent animate-pulse">
    Wyandexmusic
    </h1>
    <p className="text-[var(--text-secondary)] text-base flex items-center justify-center gap-2">
    <Radio size={16} className="text-cyber-purple" />
    Modern Music Experience
    </p>
    </div>
    </div>

    {error && (
      <div className="mb-6 bg-red-500/10 border border-red-500/30 backdrop-blur-sm rounded-xl p-4 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start gap-3">
      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5" />
      <p>{error}</p>
      </div>
      </div>
    )}

    <button
    onClick={handleLogin}
    disabled={loading}
    className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg glow-primary mb-4"
    >
    {loading ? (
      <div className="flex items-center justify-center space-x-3">
      <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" />
      <span>Открываем окно входа...</span>
      </div>
    ) : (
      <div className="flex items-center justify-center space-x-2">
      <span>Войти через Яндекс</span>
      <Sparkles size={18} />
      </div>
    )}
    </button>

    <button
    onClick={() => setShowManualInput(!showManualInput)}
    className="w-full text-[var(--text-secondary)] hover:text-white text-sm py-2 transition-colors"
    >
    {showManualInput ? "Скрыть ручной ввод" : "Ввести токен вручную"}
    </button>

    {showManualInput && (
      <form onSubmit={handleManualTokenSubmit} className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
      <input
      type="text"
      value={manualToken}
      onChange={(e) => setManualToken(e.target.value)}
      placeholder="y0_AgA..."
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
      />
      <button
      type="submit"
      disabled={loading || !manualToken.trim()}
      className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
      Сохранить токен
      </button>
      </form>
    )}

    <div className="mt-8 pt-6 border-t border-white/10">
    <p className="text-xs text-center text-[var(--text-secondary)] leading-relaxed">
    Для входа используются ваши учетные данные Яндекс.
    <br />
    Токены хранятся локально и не передаются третьим лицам.
    </p>
    </div>
    </div>

    <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyber-purple/10 rounded-full blur-3xl animate-pulse"
    style={{ animationDelay: "1.5s" }} />
    </div>
    </div>
  );
}
