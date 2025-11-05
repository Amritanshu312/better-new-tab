import React, { useState, useEffect, memo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2 } from "lucide-react";
import BackgroundSections from "./BackgroundSections";
import GeneralSection from "./GeneralSection";

/* ----------------- Device Performance Detector ----------------- */
const useIsLowEndDevice = () => {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 2;
    const mem = navigator.deviceMemory || 4;

    // quick FPS test
    let frameCount = 0;
    let startTime = performance.now();
    let lastFPS = 60;

    const checkFPS = () => {
      frameCount++;
      const now = performance.now();
      if (now - startTime >= 1000) {
        lastFPS = frameCount;
        frameCount = 0;
        startTime = now;
      }
      requestAnimationFrame(checkFPS);
    };
    requestAnimationFrame(checkFPS);

    setTimeout(() => {
      // classify as low-end if < 40 FPS or weak hardware
      if (lastFPS < 40 || cores <= 4 || mem <= 4) {
        setIsLowEnd(true);
      }
    }, 1500);
  }, []);

  return isLowEnd;
};

/* ----------------- Sidebar Component ----------------- */
const SettingsSidebar = memo(({ tabs, activeTab, setActiveTab, isLowEnd }) => (
  <aside
    className={`w-56 border-r p-3 flex flex-col gap-1 ${isLowEnd ? "bg-[#1b1b1b]" : "bg-[#181818c7] border-[#ffffff10]"
      }`}
  >
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`text-left px-4 py-2 text-base rounded-md transition-colors ${activeTab === tab
          ? "bg-[#33333390] text-white"
          : "text-gray-300 hover:bg-[#2a2a2a80]"
          }`}
      >
        {tab}
      </button>
    ))}
  </aside>
));

/* ----------------- Content Component ----------------- */
const SettingsContent = memo(({ activeTab, setIsSettingsToggled }) => (
  <div className="flex-1 p-5 overflow-y-auto no-scrollbar relative">
    <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
      {activeTab === "Wallpaper" ? (
        <BackgroundSections setIsSettingsToggled={setIsSettingsToggled} />
      ) : activeTab === "General" ? (
        <GeneralSection />
      ) : null}
    </Suspense>
  </div>
));

/* ----------------- Main Settings Component ----------------- */
const Settings = ({ isSettingsToggled, setIsSettingsToggled }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState("General");
  const isLowEnd = useIsLowEndDevice();

  const tabs = ["General", "Wallpaper"];

  /* 🎬 Animations — choose based on performance */
  const motionProps = isLowEnd
    ? {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.18, ease: "easeOut" },
    }
    : {
      layout: true,
      initial: { opacity: 0, scale: 0.9, y: -20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.9, y: -20 },
      transition: { type: "spring", stiffness: 130, damping: 15 },
    };

  return (
    <AnimatePresence>
      {isSettingsToggled && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Background overlay */}
          <div
            className={
              isLowEnd
                ? "absolute inset-0 bg-[#000000b3]"
                : "absolute inset-0 bg-black/30 backdrop-blur-[3px]"
            }
            onClick={() => setIsSettingsToggled(false)}
          />

          {/* Popup */}
          <motion.div
            {...motionProps}
            className={`relative ${isMaximized ? "w-[95vw] h-[90vh]" : "w-[80rem] h-[40rem]"
              } ${isLowEnd
                ? "bg-[#1a1a1a] shadow-lg border border-[#ffffff25]"
                : "bg-[#1f1f1fdc] backdrop-blur-[6px] border border-[#ffffff20] shadow-2xl"
              } rounded-xl text-white font-['poppins'] overflow-hidden`}
          >
            {/* Header */}
            <div
              className={`flex justify-between px-4 py-3 items-center border-b border-[#ffffff15] ${isLowEnd ? "bg-[#1b1b1b]" : "bg-[#111111b3]"
                }`}
            >
              <h2 className="text-lg font-semibold tracking-wide">Settings</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {isMaximized ? (
                    <Minimize2 size={18} />
                  ) : (
                    <Maximize2 size={18} />
                  )}
                </button>
                <button
                  onClick={() => setIsSettingsToggled(false)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Main Layout */}
            <div className="flex h-full">
              <SettingsSidebar
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isLowEnd={isLowEnd}
              />
              <SettingsContent
                activeTab={activeTab}
                setIsSettingsToggled={setIsSettingsToggled}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(Settings);
