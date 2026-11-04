import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LogOut, Sun, Image as ImageIcon, ArrowLeft, ChevronRight, Radio, Heart, ListMusic, History, Search, Settings as SettingsIcon, Sparkles, Activity, Gauge, Maximize2, Mic2, Check } from "lucide-react";

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
    glowEnabled: boolean;
    cosmosEnabled: boolean;
    brightness: number;
}

type TabKey = "wave" | "expanded" | "liked" | "playlists" | "history" | "search" | "settings" | "lyrics";

const DEFAULT_CONFIGS: Record<Exclude<TabKey, "lyrics">, TabGlowConfig> = {
    wave: { glowEnabled: true, cosmosEnabled: true, brightness: 100 },
    expanded: { glowEnabled: true, cosmosEnabled: true, brightness: 100 },
    liked: { glowEnabled: true, cosmosEnabled: true, brightness: 100 },
    playlists: { glowEnabled: true, cosmosEnabled: true, brightness: 100 },
    history: { glowEnabled: true, cosmosEnabled: true, brightness: 100 },
    search: { glowEnabled: true, cosmosEnabled: true, brightness: 100 },
    settings: { glowEnabled: true, cosmosEnabled: true, brightness: 100 },
};

export default function SettingsView({ onLogout }: SettingsViewProps) {
    const [account, setAccount] = useState<AccountData | null>(null);
    const [currentSubpage, setCurrentSubpage] = useState<"main" | TabKey>("main");

    const [masterEnabled, setMasterEnabled] = useState<boolean>(() => {
        const saved = localStorage.getItem("wyandexmusic_aura_master_enabled");
        return saved !== null ? saved === "true" : true;
    });

    const [cosmosEnabled, setCosmosEnabled] = useState<boolean>(() => {
        const saved = localStorage.getItem("wyandexmusic_cosmos_enabled");
        return saved !== null ? saved === "true" : true;
    });

    const [masterBrightness, setMasterBrightness] = useState<number>(() => {
        const saved = localStorage.getItem("wyandexmusic_aura_brightness");
        return saved !== null ? parseInt(saved, 10) : 100;
    });

    const [coverBrightness, setCoverBrightness] = useState<number>(() => {
        const saved = localStorage.getItem("wyandexmusic_cover_brightness");
        return saved !== null ? parseInt(saved, 10) : 100;
    });

    const [transitionDuration, setTransitionDuration] = useState<number>(() => {
        const saved = localStorage.getItem("wyandexmusic_aura_transition");
        return saved !== null ? parseFloat(saved) : 1.5;
    });

    const [animSpeed, setAnimSpeed] = useState<number>(() => {
        const saved = localStorage.getItem("wyandexmusic_aura_anim_speed");
        return saved !== null ? parseFloat(saved) : 1.0;
    });

    const [preferredProvider, setPreferredProvider] = useState<string>(() => {
        return localStorage.getItem("wyandexmusic_preferred_lyrics_provider") || "lrclib";
    });

    const [tabConfigs, setTabConfigs] = useState<Record<string, TabGlowConfig>>(() => {
        const saved = localStorage.getItem("wyandexmusic_tab_glow_configs");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const result: Record<string, TabGlowConfig> = {};
                for (const [k, v] of Object.entries(parsed)) {
                    const item = v as any;
                    result[k] = {
                        glowEnabled: item.glowEnabled !== undefined ? item.glowEnabled : (item.enabled !== undefined ? item.enabled : true),
                                                                                cosmosEnabled: item.cosmosEnabled !== undefined ? item.cosmosEnabled : true,
                                                                                brightness: item.brightness ?? 100,
                    };
                }
                return { ...DEFAULT_CONFIGS, ...result };
            } catch {}
        }
        return DEFAULT_CONFIGS;
    });

    useEffect(() => {
        invoke<AccountData>("get_account_info")
        .then((data) => setAccount(data))
        .catch(() => {});
    }, []);

    const handleMasterToggle = () => {
        const next = !masterEnabled;
        setMasterEnabled(next);
        localStorage.setItem("wyandexmusic_aura_master_enabled", String(next));
        window.dispatchEvent(new Event("aura-settings-updated"));
    };

    const handleCosmosToggle = () => {
        const next = !cosmosEnabled;
        setCosmosEnabled(next);
        localStorage.setItem("wyandexmusic_cosmos_enabled", String(next));
        window.dispatchEvent(new Event("aura-settings-updated"));
    };

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

    const handleTransitionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setTransitionDuration(val);
        localStorage.setItem("wyandexmusic_aura_transition", String(val));
        window.dispatchEvent(new Event("aura-settings-updated"));
    };

    const handleAnimSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setAnimSpeed(val);
        localStorage.setItem("wyandexmusic_aura_anim_speed", String(val));
        window.dispatchEvent(new Event("aura-settings-updated"));
    };

    const handleSelectPreferredProvider = (src: string) => {
        setPreferredProvider(src);
        localStorage.setItem("wyandexmusic_preferred_lyrics_provider", src);
    };

    const updateTabConfig = (tab: string, partial: Partial<TabGlowConfig>) => {
        const current = tabConfigs[tab] || { glowEnabled: true, cosmosEnabled: true, brightness: 100 };
        const updated = {
            ...tabConfigs,
            [tab]: { ...current, ...partial },
        };
        setTabConfigs(updated);
        localStorage.setItem("wyandexmusic_tab_glow_configs", JSON.stringify(updated));
        window.dispatchEvent(new Event("aura-settings-updated"));
    };

    const name = account?.displayName || account?.login || "Пользователь";

    const subpages: { key: TabKey; label: string; icon: any }[] = [
        { key: "wave", label: "Моя волна", icon: Radio },
        { key: "expanded", label: "Полноэкранный плеер", icon: Maximize2 },
        { key: "lyrics", label: "Тексты и караоке", icon: Mic2 },
        { key: "liked", label: "Любимые треки", icon: Heart },
        { key: "playlists", label: "Плейлисты", icon: ListMusic },
        { key: "history", label: "История", icon: History },
        { key: "search", label: "Поиск", icon: Search },
        { key: "settings", label: "Настройки", icon: SettingsIcon },
    ];

    const lyricsProvidersList = [
        { id: "lrclib", name: "LRCLIB (Основной FOSS-архив с караоке)" },
        { id: "netease", name: "NetEase Cloud (Синхронизированные таймкоды)" },
        { id: "kugou", name: "KuGou Music (Большая база LRC)" },
        { id: "karalyr", name: "Karalyr (Построчные тайминги)" },
        { id: "lyricsovh", name: "Lyrics.ovh (Текстовая база)" },
    ];

    if (currentSubpage === "lyrics") {
        return (
            <div className="max-w-xl space-y-6 sm:space-y-8 select-none pt-4 pb-20">
            <button
            onClick={() => setCurrentSubpage("main")}
            className="flex items-center space-x-2 text-white/50 hover:text-white transition-colors"
            >
            <ArrowLeft className="w-4 h-4 aspect-square shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Назад к настройкам</span>
            </button>

            <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-[#ffcc00] shrink-0">
            <Mic2 className="w-5 h-5 aspect-square shrink-0" />
            </div>
            <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Тексты и караоке</h1>
            <p className="text-[11px] sm:text-xs text-white/40 mt-0.5">Выбор приоритетного провайдера текста</p>
            </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
            <span className="text-xs uppercase tracking-wider text-white/40 font-bold block mb-2">
            Приоритетный источник
            </span>

            <div className="space-y-1.5 sm:space-y-2">
            {lyricsProvidersList.map((p) => {
                const isSelected = preferredProvider === p.id;
                return (
                    <div
                    key={p.id}
                    onClick={() => handleSelectPreferredProvider(p.id)}
                    className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                        ? "bg-white/[0.08] text-white border border-white/15"
                        : "bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent"
                    }`}
                    >
                    <span className="text-xs sm:text-sm font-semibold">{p.name}</span>
                    {isSelected && <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 aspect-square text-[#ffcc00] shrink-0" />}
                    </div>
                );
            })}
            </div>
            </div>
            </div>
        );
    }

    if (currentSubpage !== "main") {
        const activeInfo = subpages.find((s) => s.key === currentSubpage)!;
        const Icon = activeInfo.icon;
        const rawCfg = tabConfigs[currentSubpage];
        const currentCfg = {
            glowEnabled: rawCfg?.glowEnabled ?? true,
            cosmosEnabled: rawCfg?.cosmosEnabled ?? true,
            brightness: rawCfg?.brightness ?? 100,
        };

        return (
            <div className="max-w-xl space-y-6 sm:space-y-8 select-none pt-4 pb-20">
            <button
            onClick={() => setCurrentSubpage("main")}
            className="flex items-center space-x-2 text-white/50 hover:text-white transition-colors"
            >
            <ArrowLeft className="w-4 h-4 aspect-square shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Назад к настройкам</span>
            </button>

            <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-[#ffcc00] shrink-0">
            <Icon className="w-5 h-5 aspect-square shrink-0" />
            </div>
            <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{activeInfo.label}</h1>
            <p className="text-[11px] sm:text-xs text-white/40 mt-0.5">Индивидуальные параметры раздела</p>
            </div>
            </div>

            <div className="space-y-4 sm:space-y-6 pt-4 border-t border-white/[0.06]">
            <div
            onClick={() => updateTabConfig(currentSubpage, { glowEnabled: !currentCfg.glowEnabled })}
            className="flex items-center justify-between py-2 cursor-pointer"
            >
            <div className="flex items-center space-x-3">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 aspect-square text-[#ffcc00] shrink-0" />
            <div>
            <span className="text-xs sm:text-sm text-white font-semibold block">Фоновое свечение</span>
            <p className="text-[11px] sm:text-xs text-white/40 mt-0.5">Эффект цветной ауры раздела</p>
            </div>
            </div>

            <div
            className={`w-10 sm:w-11 h-5 sm:h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
                currentCfg.glowEnabled ? "bg-[#ffcc00]" : "bg-white/10"
            }`}
            >
            <div
            className={`w-3.5 sm:w-4 h-3.5 sm:h-4 aspect-square rounded-full bg-black transition-transform ${
                currentCfg.glowEnabled ? "translate-x-4 sm:translate-x-5" : "translate-x-0 bg-white/40"
            }`}
            />
            </div>
            </div>

            <div
            onClick={() => updateTabConfig(currentSubpage, { cosmosEnabled: !currentCfg.cosmosEnabled })}
            className="flex items-center justify-between py-2 cursor-pointer"
            >
            <div className="flex items-center space-x-3">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 aspect-square text-[#ffcc00] shrink-0" />
            <div>
            <span className="text-xs sm:text-sm text-white font-semibold block">Фоновый космос</span>
            <p className="text-[11px] sm:text-xs text-white/40 mt-0.5">Звездное небо во время тишины или без ауры</p>
            </div>
            </div>

            <div
            className={`w-10 sm:w-11 h-5 sm:h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
                currentCfg.cosmosEnabled ? "bg-[#ffcc00]" : "bg-white/10"
            }`}
            >
            <div
            className={`w-3.5 sm:w-4 h-3.5 sm:h-4 aspect-square rounded-full bg-black transition-transform ${
                currentCfg.cosmosEnabled ? "translate-x-4 sm:translate-x-5" : "translate-x-0 bg-white/40"
            }`}
            />
            </div>
            </div>

            {currentCfg.glowEnabled && (
                <div className="space-y-2.5 sm:space-y-3 pt-2">
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
                className="w-full h-1 sm:h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 sm:[&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ffcc00] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,204,0,0.5)]"
                />
                </div>
            )}
            </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl space-y-8 sm:space-y-10 select-none pt-4 pb-20">
        <div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
        Настройки
        </h1>
        </div>

        <div className="flex items-center space-x-4 sm:space-x-5">
        {account?.avatarUrl ? (
            <img
            src={account.avatarUrl}
            alt={name}
            className="w-12 h-12 sm:w-16 sm:h-16 aspect-square rounded-full object-cover shadow-[0_0_25px_rgba(255,255,255,0.15)] border border-white/20 shrink-0"
            />
        ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 aspect-square rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-black font-extrabold text-xl sm:text-2xl shadow-[0_0_25px_rgba(255,204,0,0.4)] shrink-0">
            {name.charAt(0).toUpperCase()}
            </div>
        )}
        <div>
        <h2 className="text-lg sm:text-xl font-bold text-white">
        {name}
        </h2>
        <p className="text-[11px] sm:text-xs text-white/50 font-mono mt-0.5">
        UID: {account?.uid || "—"}
        </p>
        </div>
        </div>

        <div className="space-y-4 sm:space-y-6 pt-4 border-t border-white/[0.06]">
        <div
        onClick={handleMasterToggle}
        className="flex items-center justify-between py-2 cursor-pointer"
        >
        <div className="flex items-center space-x-3">
        <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5 aspect-square text-[#ffcc00] shrink-0" />
        <div>
        <span className="text-sm sm:text-base text-white font-bold block">Фоновое свечение (Аура)</span>
        <p className="text-[11px] sm:text-xs text-white/40 mt-0.5">Главный выключатель эффекта во всём приложении</p>
        </div>
        </div>

        <div
        className={`w-10 sm:w-11 h-5 sm:h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
            masterEnabled ? "bg-[#ffcc00]" : "bg-white/10"
        }`}
        >
        <div
        className={`w-3.5 sm:w-4 h-3.5 sm:h-4 aspect-square rounded-full bg-black transition-transform ${
            masterEnabled ? "translate-x-4 sm:translate-x-5" : "translate-x-0 bg-white/40"
        }`}
        />
        </div>
        </div>

        <div
        onClick={handleCosmosToggle}
        className="flex items-center justify-between py-2 cursor-pointer"
        >
        <div className="flex items-center space-x-3">
        <Radio className="w-4.5 h-4.5 sm:w-5 sm:h-5 aspect-square text-[#ffcc00] shrink-0" />
        <div>
        <span className="text-sm sm:text-base text-white font-bold block">Фоновый космос</span>
        <p className="text-[11px] sm:text-xs text-white/40 mt-0.5">Главный переключатель звездного неба</p>
        </div>
        </div>

        <div
        className={`w-10 sm:w-11 h-5 sm:h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
            cosmosEnabled ? "bg-[#ffcc00]" : "bg-white/10"
        }`}
        >
        <div
        className={`w-3.5 sm:w-4 h-3.5 sm:h-4 aspect-square rounded-full bg-black transition-transform ${
            cosmosEnabled ? "translate-x-4 sm:translate-x-5" : "translate-x-0 bg-white/40"
        }`}
        />
        </div>
        </div>

        {masterEnabled && (
            <div className="space-y-2 sm:space-y-3 pt-1">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white/80">
            <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 aspect-square text-[#ffcc00] shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">Общая яркость фонового свечения</span>
            </div>
            <span className="text-xs font-mono font-bold text-white/70">{masterBrightness}%</span>
            </div>

            <input
            type="range"
            min="0"
            max="100"
            value={masterBrightness}
            onChange={handleMasterBrightnessChange}
            className="w-full h-1 sm:h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 sm:[&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ffcc00] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,204,0,0.5)]"
            />
            </div>
        )}

        <div className="space-y-2 sm:space-y-3 pt-1">
        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white/80">
        <ImageIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 aspect-square text-[#ffcc00] shrink-0" />
        <span className="text-xs sm:text-sm font-semibold">Яркость обложек треков</span>
        </div>
        <span className="text-xs font-mono font-bold text-white/70">{coverBrightness}%</span>
        </div>

        <input
        type="range"
        min="0"
        max="100"
        value={coverBrightness}
        onChange={handleCoverBrightnessChange}
        className="w-full h-1 sm:h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 sm:[&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ffcc00] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,204,0,0.5)]"
        />
        </div>

        {masterEnabled && (
            <>
            <div className="space-y-2 sm:space-y-3 pt-1">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white/80">
            <Activity className="w-4 h-4 sm:w-4.5 sm:h-4.5 aspect-square text-[#ffcc00] shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">Скорость смены цвета фона</span>
            </div>
            <span className="text-xs font-mono font-bold text-white/70">{transitionDuration} сек</span>
            </div>

            <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={transitionDuration}
            onChange={handleTransitionChange}
            className="w-full h-1 sm:h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 sm:[&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ffcc00] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,204,0,0.5)]"
            />
            </div>

            <div className="space-y-2 sm:space-y-3 pt-1">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white/80">
            <Gauge className="w-4 h-4 sm:w-4.5 sm:h-4.5 aspect-square text-[#ffcc00] shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">Скорость анимации движения ауры</span>
            </div>
            <span className="text-xs font-mono font-bold text-white/70">{animSpeed}x</span>
            </div>

            <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.25"
            value={animSpeed}
            onChange={handleAnimSpeedChange}
            className="w-full h-1 sm:h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 sm:[&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ffcc00] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,204,0,0.5)]"
            />
            </div>
            </>
        )}

        <div className="space-y-2 pt-4 border-t border-white/[0.06]">
        <span className="text-xs uppercase tracking-wider text-white/40 font-bold block mb-2 sm:mb-3">
        Настройки разделов
        </span>

        <div className="space-y-1">
        {subpages.map((item) => {
            const Icon = item.icon;
            return (
                <div
                key={item.key}
                onClick={() => setCurrentSubpage(item.key)}
                className="flex items-center justify-between py-2 sm:py-2.5 px-2 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer group"
                >
                <div className="flex items-center space-x-3 sm:space-x-4">
                <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 aspect-square text-white/40 group-hover:text-[#ffcc00] transition-colors shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                {item.label}
                </span>
                </div>

                <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 aspect-square text-white/20 group-hover:text-white group-hover:translate-x-0.5 transition shrink-0" />
                </div>
            );
        })}
        </div>
        </div>
        </div>

        <div className="pt-4 border-t border-white/[0.06]">
        <button
        onClick={onLogout}
        className="group flex items-center space-x-2.5 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 transition-all duration-200 border border-red-500/15"
        >
        <LogOut className="w-4 h-4 aspect-square transition-transform group-hover:-translate-x-0.5 shrink-0" />
        <span>Выйти из аккаунта</span>
        </button>
        </div>
        </div>
    );
}
