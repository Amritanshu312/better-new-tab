import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { useGeneralSettings } from "../context/GeneralSettings";
import SearchBar from "../utils/Search";

export default function AppBars({ isCustomizationState }) {
  const { settings } = useGeneralSettings();
  const containerRef = useRef(null);

  // 🔹 Helper to calculate centered position once we know container width
  const calculateCenter = (width = 400) => {
    const centerX = (window.innerWidth - width) / 2;
    const centerY = -(window.innerHeight - window.innerHeight * 0.10); // roughly top-[16%]
    return { x: centerX, y: centerY };
  };

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("appbarPosition");
    return saved ? JSON.parse(saved) : calculateCenter();
  });

  // 🧭 After mount, measure actual width and recenter dynamically
  useEffect(() => {
    const element = containerRef.current;
    if (element) {
      const rect = element.getBoundingClientRect();
      // Only reset position if nothing was saved before
      const saved = localStorage.getItem("appbarPosition");
      if (!saved) setPosition(calculateCenter(rect.width));
    }
  }, []);

  // 💾 Auto-save position changes
  useEffect(() => {
    localStorage.setItem("appbarPosition", JSON.stringify(position));
  }, [position]);

  const handleReset = () => {
    const element = containerRef.current;
    const rectWidth = element ? element.getBoundingClientRect().width : 400;
    const def = calculateCenter(rectWidth);
    setPosition(def);
    localStorage.removeItem("appbarPosition");
  };

  const apps = [
    { name: "Reddit", icon: "/icons/reddit.png", link: "https://www.reddit.com" },
    { name: "YouTube", icon: "/icons/youtube.png", link: "https://www.youtube.com" },
    { name: "Telegram", icon: "/icons/telegram.png", link: "https://web.telegram.org" },
    { name: "Instagram", icon: "/icons/instagram.png", link: "https://www.instagram.com" },
    { name: "ChatGPT", icon: "/icons/chatgpt.webp", link: "https://chat.openai.com" },
    { name: "Inbox (3,779)", icon: "/icons/gmail.png", link: "https://mail.google.com" },
  ];

  return (
    <>

      <Rnd
        bounds="window"
        size="auto"
        position={position}
        onDragStop={(e, d) => {
          if (isCustomizationState) {
            setPosition({ x: d.x, y: d.y });
          }
        }}
        enableResizing={false}
        disableDragging={!isCustomizationState}
        className="z-20"
      >
        <div ref={containerRef} className="relative">
          {settings.showAppbar && (
            <div className="flex space-x-6 bg-black/10 rounded-2xl p-4 backdrop-blur-md">
              {apps.map((app, index) => (
                <a
                  href={app.link}
                  key={index}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="bg-[#e5e7eb50] hover:bg-[#e5e7eb69] cursor-pointer p-3 rounded-2xl shadow-md transition">
                    <img src={app.icon} alt={app.name} className="w-8 h-8" />
                  </div>
                  <p className="text-white text-sm font-medium">{app.name}</p>
                </a>
              ))}
            </div>
          )}

          {isCustomizationState && (
            <button
              onClick={handleReset}
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white bg-[#1a1a1a52] backdrop-blur-lg hover:bg-[#1a1a1a7c] border border-[#ffffff0c] px-3 py-1 rounded-lg text-sm shadow-md transition"
            >
              Reset Position
            </button>
          )}
        </div>
      </Rnd>

      {settings.global_search ? <SearchBar /> : null}
    </>
  );
}
