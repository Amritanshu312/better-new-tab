import React, { useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import { CalendarDays, Settings2 } from "lucide-react";
import clsx from "clsx";

export default function TimeDateCard({ isCustomizationState }) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [showControls, setShowControls] = useState(false);

  const [styleSettings, setStyleSettings] = useState(() => {
    const saved = localStorage.getItem("timeDateStyle");
    return (
      JSON.parse(saved) || {
        timeColor: "#ffffff",
        dateColor: "#cccccc",
        borderColor: "#ffffff", // 🆕 Added border color
        textOutline: true,
        bgBehindText: false,
        fontSize: 96,
        shadow: true,
      }
    );
  });

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("timeDatePosition");
    return saved ? JSON.parse(saved) : { x: 0, y: 0 };
  });

  // 🕒 Time and date updater
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setDate(
        now.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      );
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  // 💾 Save customization persistently
  useEffect(() => {
    localStorage.setItem("timeDateStyle", JSON.stringify(styleSettings));
  }, [styleSettings]);

  useEffect(() => {
    localStorage.setItem("timeDatePosition", JSON.stringify(position));
  }, [position]);

  // 🧠 Prevent drag when interacting with inputs
  const stopDragOnInput = (e) => e.stopPropagation();

  return (
    <Rnd
      bounds="window"
      enableResizing={false}
      disableDragging={!isCustomizationState}
      position={position}
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      className="z-20"
    >
      <div
        className={clsx(
          "relative flex flex-col items-center justify-center select-none font-['Poppins'] drag-area", // 👈 Added class
          styleSettings.bgBehindText ? "bg-white/5 p-4 rounded-xl backdrop-blur-md" : ""
        )}
      >
        {/* 🛠️ Edit icon (only when customization mode is on) */}
        {isCustomizationState && (
          <button
            onClick={() => setShowControls((prev) => !prev)}
            className="absolute -left-10 top-2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            <Settings2 className="w-5 h-5 text-white" />
          </button>
        )}

        {/* 📅 Date */}
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays className="w-4 h-4 text-white/70" />
          <p
            className="tracking-wide"
            style={{
              color: styleSettings.dateColor,
              textShadow: styleSettings.shadow
                ? "0 0 6px rgba(255,255,255,0.6)"
                : "none",
              WebkitTextStroke: styleSettings.textOutline
                ? `0.5px ${styleSettings.borderColor}`
                : "0",
            }}
          >
            {date}
          </p>
        </div>

        {/* ⏰ Time */}
        <h1
          className="leading-none font-semibold"
          style={{
            fontSize: `${styleSettings.fontSize}px`,
            color: styleSettings.timeColor,
            WebkitTextStroke: styleSettings.textOutline
              ? `1px ${styleSettings.borderColor}`
              : "0",
            textShadow: styleSettings.shadow
              ? "0 0 10px rgba(255,255,255,0.7)"
              : "none",
          }}
        >
          {time}
        </h1>

        {/* ⚙️ Customization Panel */}
        {showControls && (
          <div
            className="absolute -left-[260px] top-0 bg-[#1a1a1a]/90 text-white p-4 rounded-lg w-56 space-y-3 shadow-lg backdrop-blur-xl border border-white/10"
            onMouseDown={stopDragOnInput}
          >
            <h3 className="font-semibold text-sm mb-2">🧩 Customize Clock</h3>

            {/* Time Color */}
            <div className="flex items-center justify-between">
              <label className="text-xs">Time Color</label>
              <input
                type="color"
                value={styleSettings.timeColor}
                onChange={(e) =>
                  setStyleSettings({ ...styleSettings, timeColor: e.target.value })
                }
              />
            </div>

            {/* Date Color */}
            <div className="flex items-center justify-between">
              <label className="text-xs">Date Color</label>
              <input
                type="color"
                value={styleSettings.dateColor}
                onChange={(e) =>
                  setStyleSettings({ ...styleSettings, dateColor: e.target.value })
                }
              />
            </div>

            {/* 🆕 Border Color */}
            <div className="flex items-center justify-between">
              <label className="text-xs">Border Color</label>
              <input
                type="color"
                value={styleSettings.borderColor}
                onChange={(e) =>
                  setStyleSettings({ ...styleSettings, borderColor: e.target.value })
                }
              />
            </div>

            {/* Font Size */}
            <div>
              <label className="text-xs">Font Size</label>
              <input
                type="range"
                min="40"
                max="150"
                value={styleSettings.fontSize}
                onChange={(e) =>
                  setStyleSettings({
                    ...styleSettings,
                    fontSize: parseInt(e.target.value),
                  })
                }
                className="w-full"
                onMouseDown={stopDragOnInput}
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs flex items-center justify-between">
                Outline
                <input
                  type="checkbox"
                  checked={styleSettings.textOutline}
                  onChange={(e) =>
                    setStyleSettings({
                      ...styleSettings,
                      textOutline: e.target.checked,
                    })
                  }
                  onMouseDown={stopDragOnInput}
                />
              </label>

              <label className="text-xs flex items-center justify-between">
                Shadow
                <input
                  type="checkbox"
                  checked={styleSettings.shadow}
                  onChange={(e) =>
                    setStyleSettings({
                      ...styleSettings,
                      shadow: e.target.checked,
                    })
                  }
                  onMouseDown={stopDragOnInput}
                />
              </label>

              <label className="text-xs flex items-center justify-between">
                Background Behind Text
                <input
                  type="checkbox"
                  checked={styleSettings.bgBehindText}
                  onChange={(e) =>
                    setStyleSettings({
                      ...styleSettings,
                      bgBehindText: e.target.checked,
                    })
                  }
                  onMouseDown={stopDragOnInput}
                />
              </label>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                localStorage.removeItem("timeDateStyle");
                setStyleSettings({
                  timeColor: "#ffffff",
                  dateColor: "#cccccc",
                  borderColor: "#ffffff",
                  textOutline: true,
                  bgBehindText: false,
                  fontSize: 96,
                  shadow: true,
                });
              }}
              className="w-full bg-white/10 hover:bg-white/20 text-xs py-1 rounded-md transition mt-2"
            >
              Reset Defaults
            </button>
          </div>
        )}
      </div>
    </Rnd>
  );
}
