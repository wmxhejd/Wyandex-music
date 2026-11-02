import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";

export default function WindowControls() {
  const appWindow = getCurrentWindow();

  return (
    <div className="flex items-center space-x-1 select-none">
    <button
    onClick={() => appWindow.minimize()}
    className="w-8 h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition"
    >
    <Minus size={14} />
    </button>

    <button
    onClick={() => appWindow.toggleMaximize()}
    className="w-8 h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition"
    >
    <Square size={12} />
    </button>

    <button
    onClick={() => appWindow.close()}
    className="w-8 h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-red-500/80 transition"
    >
    <X size={15} />
    </button>
    </div>
  );
}
