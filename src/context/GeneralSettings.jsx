import { createContext, useContext, useState, useEffect } from "react";

const GeneralSettingsContext = createContext();

export const GeneralSettingsProvider = ({ children }) => {
  // 🧠 Default values (add all new settings here)
  const defaultSettings = {
    showBackground: true,
    showBorder: true,
    showAppbar: true,
    showTimeDate: true,
    showTodoList: false,
    global_search: false,
    hide_lock_icon: true,
    wallpaperDimming: 32,
    playbackRate: 2,
    theme: "dark",
    accentColor: "#3b82f6",
    autoChangeWallpaper: false,
  };

  // ⚙️ Initialize from localStorage
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("generalSettings");
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // 💾 Auto-save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem("generalSettings", JSON.stringify(settings));
  }, [settings]);

  // 🔁 Sync across browser tabs
  useEffect(() => {
    const syncSettings = (event) => {
      if (event.key === "generalSettings" && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          setSettings(parsed);
        } catch { }
      }
    };
    window.addEventListener("storage", syncSettings);
    return () => window.removeEventListener("storage", syncSettings);
  }, []);

  // 🧩 Universal updater
  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // 🔁 Universal toggle
  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 🔄 Reset all settings to default
  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem("generalSettings", JSON.stringify(defaultSettings));
  };

  return (
    <GeneralSettingsContext.Provider
      value={{
        settings,
        updateSetting,
        toggleSetting,
        resetSettings,
      }}
    >
      {children}
    </GeneralSettingsContext.Provider>
  );
};

// 🔁 Hook for easy access
export const useGeneralSettings = () => {
  const context = useContext(GeneralSettingsContext);
  if (!context)
    throw new Error(
      "useGeneralSettings must be used within a GeneralSettingsProvider"
    );
  return context;
};
