import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LogOut, Sun, Image as ImageIcon, ArrowLeft, ChevronRight, Radio, Heart, ListMusic, Search, Settings as SettingsIcon, Sparkles } from "lucide-react";

interface SettingsViewProps {
    onLogout: () => void;
}

interface AccountData {
    uid: number | string;
    login: string;
    displayName?: string;
    avatarUrl?: string;
}

interface TabGlowConfig {
    enabled: boolean;
    brightness: number;
}

type TabKey = "wave" | "liked" | "playlists" | "search" | "settings";

const DEFAULT_CONFIGS: Record<TabKey, TabGlowConfig> = {
    wave: { enabled: true, brightness: 100 },
    liked: { enabled: true, brightness: 100 },
    playlists: { enabled: true, brightness: 100 },
    search: { enabled: true, brightness: 100 },
    settings: { enabled: true, brightness: 100 },
};

export default function SettingsView({ onLogout }: SettingsViewProps) {
    const [account, setAccount] = useState<AccountData | null>(null);
    const [currentSubpage, setCurrentSubpage] = useState<"main" | TabKey>("main");

    const [masterBrightness, setMasterBrightness] = useState<number>(() => {
        const saved = localStorage.getItem("wyandexmusic_aura_brightness");
        return saved !== null ? parseInt(saved, 10) : 100;
    });

    const [coverBrightness, setCoverBrightness] = useState<number>(() => {
        const saved = localStorage.getItem("wyandexmusic_cover_brightness");
        return saved !== null ? parseInt(saved, 10) : 100;
    });

    const [tabConfigs, setTabConfigs] = useState<Record<TabKey, TabGlowConfig>>(() => {
        const saved = localStorage.getItem("wyandexmusic_tab_glow_configs");
        if (saved) {
            try {
                return { ...DEFAULT_CONFIGS, ...JSON.parse(saved) };
            } catch {}
        }
        return DEFAULT_CONFIGS;
    });

    useEffect(() => {
        invoke<AccountData>("get_account_info")
        .then((data) => setAccount(data))
        .catch(() => {});
    }, []);

    const handleMasterBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        setMasterBrightness(val);
        localStorage.setItem("wyandexmusic_aura_brightness", String(val));
        window.dispatchEvent(new Event("aura-settings-updated"));
    };

    const handleCoverBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        setCoverBrightness(val);
        localStorage.setItem("wyandexmusic_cover_brightness", String(val));
        window.dispatchEvent(new Event("cover-settings-updated"));
    };

    const updateTabConfig = (tab: TabKey, partial: Partial<TabGlowConfig>) => {
        const updated = {
            ...tabConfigs,
            [tab]: { ...tabConfigs[tab], ...partial },
        };
        setTabConfigs(updated);
        localStorage.setItem("wyandexmusic_tab_glow_configs", JSON.stringify(updated));
        window.dispatchEvent(new Event("aura-settings-updated"));
    };

    const name = account?.displayName || account?.login || "Пользователь";

    const subpages: { key: TabKey; label: string; icon: any }[] = [
        { key: "wave", label: "Моя волна", icon: Radio },
        { key: "liked", label: "Любимые треки", icon: Heart },
        { key: "playlists", label: "Плейлисты", icon: ListMusic },
        { key: "search", label: "Поиск", icon: Search },
        { key: "settings", label: "Настройки", icon: SettingsIcon },
    ];

    if (currentSubpage !== "main") {
        const activeInfo = subpages.find((s) => s.key === currentSubpage)!;
        const Icon = activeInfo.icon;
        const currentCfg = tabConfigs[currentSubpage] || DEFAULT_CONFIGS[currentSubpage];

        return (
            <div className="max-w-xl space-y-8 select-none pt-4 pb-20">
            <button
            onClick={() => setCurrentSubpage("main")}
            className="flex items-center space-x-2 text-white/50 hover:text-white transition-colors"
            >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Назад к настройкам</span>
            </button>

            <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-[#ffcc00]">
            <Icon size={22} />
            </div>
            <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{activeInfo.label}</h1>
            <p className="text-xs text-white/40 mt-0.5">Индивидуальные параметры раздела</p>
            </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-white/[0.06]">
            <div
            onClick={() => updateTabConfig(currentSubpage, { enabled: !currentCfg.enabled })}
            className="flex items-center justify-between py-2 cursor-pointer"
            >
            <div className="flex items-center space-x-3">
            <Sparkles size={18} className="text-[#ffcc00]" />
            <div>
            <span className="text-sm text-white font-semibold block">Фоновое свечение</span>
            <p className="text-xs text-white/40 mt-0.5">Эффект цветной ауры для этой вкладки</p>
            </div>
            </div>

            <div
            className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                currentCfg.enabled ? "bg-[#ffcc00]" : "bg-white/10"
            }`}
            >
            <div
            className={`w-4 h-4 rounded-full bg-black transition-transform ${
                currentCfg.enabled ? "translate-x-5" : "translate-x-0 bg-white/40"
            }`}
            />
            </div>
            </div>

            {currentCfg.enabled && (
                <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Яркость свечения</span>
                <span className="text-xs font-mono font-bold text-white/70">{currentCfg.brightness}%</span>
                </div>
                <input
                type="range"
                min="0"
                max="100"
                value={currentCfg.brightness}
                onChange={(e) => updateTabConfig(currentSubpage, { brightness: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ffcc00] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,204,0,0.5)]"
                />
                </div>
            )}
            </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl space-y-10 select-none pt-4 pb-20">
        <div>
        <h1 className="text-4xl font-black text-white tracking-tight">
        Настройки
        </h1>
        </div>

        <div className="flex items-center space-x-5">
        {account?.avatarUrl ? (
            <img
            src={account.avatarUrl}
            alt={name}
            className="w-16 h-16 rounded-full object-cover shadow-[0_0_25px_rgba(255,255,255,0.15)] border border-white/20"
            />
        ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-black font-extrabold text-2xl shadow-[0_0_25px_rgba(255,204,0,0.4)]">
            {name.charAt(0).toUpperCase()}
            </div>
        )}
        <div>
        <h2 className="text-xl font-bold text-white">
        {name}
        </h2>
        <p className="text-xs text-white/50 font-mono mt-0.5">
        UID: {account?.uid || "—"}
        </p>
        </div>
        </div>

        <div className="space-y-6 pt-4 border-t border-white/[0.06]">
        <div className="space-y-3">
        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white/80">
        <Sun size={18} className="text-[#ffcc00]" />
        <span className="text-sm font-semibold">Общая яркость фонового свечения</span>
        </div>
        <span className="text-xs font-mono font-bold text-white/70">{masterBrightness}%</span>
        </div>

        <input
        type="range"
        min="0"
        max="100"
        value={masterBrightness}
        onChange={handleMasterBrightnessChange}
        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ffcc00] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,204,0,0.5)]"
        />
        </div>

        <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white/80">
        <ImageIcon size={18} className="text-[#ffcc00]" />
        <span className="text-sm font-semibold">Яркость обложек треков</span>
        </div>
        <span className="text-xs font-mono font-bold text-white/70">{coverBrightness}%</span>
        </div>

        <input
        type="range"
        min="0"
        max="100"
        value={coverBrightness}
        onChange={handleCoverBrightnessChange}
        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ffcc00] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,204,0,0.5)]"
        />
        </div>

        <div className="space-y-2 pt-4 border-t border-white/[0.06]">
        <span className="text-xs uppercase tracking-wider text-white/40 font-bold block mb-3">
        Настройки разделов
        </span>

        <div className="space-y-1">
        {subpages.map((item) => {
            const Icon = item.icon;
            return (
                <div
                key={item.key}
                onClick={() => setCurrentSubpage(item.key)}
                className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer group"
                >
                <div className="flex items-center space-x-4">
                <Icon size={20} className="text-white/40 group-hover:text-[#ffcc00] transition-colors" />
                <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                {item.label}
                </span>
                </div>

                <ChevronRight size={18} className="text-white/20 group-hover:text-white group-hover:translate-x-0.5 transition" />
                </div>
            );
        })}
        </div>
        </div>
        </div>

        <div className="pt-4 border-t border-white/[0.06]">
        <button
        onClick={onLogout}
        className="group flex items-center space-x-3 px-6 py-3 rounded-2xl text-sm font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 transition-all duration-200 border border-red-500/15"
        >
        <LogOut size={17} className="transition-transform group-hover:-translate-x-0.5" />
        <span>Выйти из аккаунта</span>
        </button>
        </div>
        </div>
    );
}
