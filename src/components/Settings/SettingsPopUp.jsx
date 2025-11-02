import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import BackgroundSections from "./BackgroundSections";
import GeneralSection from "./GeneralSection";

/* ---------- Sidebar Component ---------- */
const SettingsSidebar = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="w-60 border-r border-[#ffffff10] p-3 flex flex-col gap-1 bg-[#181818c7]">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`text-left px-4 py-2 rounded-md transition-colors ${activeTab === tab
            ? "bg-[#33333390] text-white"
            : "text-gray-300 hover:bg-[#2a2a2a80]"
            }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

/* ---------- Content Component ---------- */
const SettingsContent = ({ activeTab, setIsSettingsToggled }) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
      {activeTab === "Wallpaper" ? <BackgroundSections setIsSettingsToggled={setIsSettingsToggled} /> :
        activeTab === "General" ? <GeneralSection /> : null
      }
    </div>
  );
};

/* ---------- Main Popup Component ---------- */
const SettingsPopUp = ({ isSettingsToggled, setIsSettingsToggled }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState("General");

  const tabs = [
    "General",
    "Wallpaper"
  ];

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
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-[3px]"
            onClick={() => setIsSettingsToggled(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Popup container */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 130, damping: 15 }}
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className={`relative ${isMaximized ? "w-[95vw] h-[90vh]" : "w-[80rem] h-[40rem]"
              } bg-[#1f1f1fdc] backdrop-blur-[6px] border border-[#ffffff20] rounded-xl shadow-2xl text-white font-['poppins'] overflow-hidden`}
          >
            {/* Header */}
            <div className="flex justify-between px-4 py-3 items-center border-b border-[#ffffff15]">
              <h2 className="text-lg font-semibold flex items-center">
                Settings
              </h2>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>

                <button
                  onClick={() => setIsSettingsToggled(false)}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Main Layout */}
            <div className="flex h-full">
              <SettingsSidebar
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <SettingsContent activeTab={activeTab} setIsSettingsToggled={setIsSettingsToggled} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsPopUp;
