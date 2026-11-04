import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";

export default function WindowControls() {
  const appWindow = getCurrentWindow();

  return (
    <div className="flex items-center space-x-1 select-none">
    <button
    onClick={() => appWindow.minimize()}
    className="w-7 sm:w-8 h-6 sm:h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition shrink-0"
    >
    <Minus className="w-3.5 h-3.5 aspect-square shrink-0" />
    </button>

    <button
    onClick={() => appWindow.toggleMaximize()}
    className="w-7 sm:w-8 h-6 sm:h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition shrink-0"
    >
    <Square className="w-3 h-3 aspect-square shrink-0" />
    </button>

    <button
    onClick={() => appWindow.close()}
    className="w-7 sm:w-8 h-6 sm:h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-red-500/80 transition shrink-0"
    >
    <X className="w-3.5 h-3.5 aspect-square shrink-0" />
    </button>
    </div>
  );
}
