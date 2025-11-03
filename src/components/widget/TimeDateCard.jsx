import React, { useEffect, useState, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import { CalendarDays, Settings2 } from "lucide-react";
import clsx from "clsx";
import { useGeneralSettings } from "../../context/GeneralSettings";

export default function TimeDateCard({ isCustomizationState }) {
  const { settings } = useGeneralSettings()

  const [visible, setVisible] = useState(settings?.showTimeDate ?? false);

  // ✅ React to changes in settings.showTimeDate
  useEffect(() => {
    setVisible(!!settings?.showTimeDate);
  }, [settings?.showTimeDate]);

  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [date, setDate] = useState(() =>
    new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  );
  const [showControls, setShowControls] = useState(false);

  const [styleSettings, setStyleSettings] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("timeDateStyle")) || {
          timeColor: "#ffffff",
          dateColor: "#cccccc",
          borderColor: "#ffffff",
          textOutline: true,
          bgBehindText: false,
          fontSize: 96,
          shadow: false,
          backgroundBlur: 8,
          shadowIntensity: 0.7,
        }
      );
    } catch {
      return {
        timeColor: "#ffffff",
        dateColor: "#cccccc",
        borderColor: "#ffffff",
        textOutline: true,
        bgBehindText: false,
        fontSize: 96,
        shadow: false,
        backgroundBlur: 100,
        shadowIntensity: 0.7,
      };
    }
  });

  const positionRef = useRef(
    JSON.parse(localStorage.getItem("timeDatePosition") || JSON.stringify(
      { "x": (window.innerWidth - 416) / 1.03, "y": -(window.innerHeight / 1.2) }
    ))
  );
  const [position, setPosition] = useState(positionRef.current);

  // 🕒 Efficient time updater (once per minute)
  useEffect(() => {
    if (!visible) return;

    console.log("Time updater started");

    const updateTime = () => {
      const now = new Date();

      const newTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setTime((prev) => (prev !== newTime ? newTime : prev));

      const newDate = now.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      setDate((prev) => (prev !== newDate ? newDate : prev));
    };

    updateTime(); // update immediately once
    const interval = setInterval(updateTime, 60000); // update every 1 minute

    return () => {
      clearInterval(interval);
      console.log("Time updater stopped");
    };
  }, [visible]);


  // 💾 Debounced saves
  const debounceSave = (key) => {
    let timeout;
    return (value) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(value));
      }, 400);
    };
  };

  const saveStyle = useCallback(debounceSave("timeDateStyle"), []);
  const savePosition = useCallback(debounceSave("timeDatePosition"), []);

  useEffect(() => saveStyle(styleSettings), [styleSettings, saveStyle]);
  useEffect(() => savePosition(position), [position, savePosition]);

  const stopDragOnInput = (e) => e.stopPropagation();

  return (
    <Rnd
      bounds="window"
      enableResizing={false}
      disableDragging={!isCustomizationState}
      position={position}
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      className="z-20"
      style={{ display: visible ? "block" : "none" }}
    >
      <div
        className={clsx(
          "relative flex flex-col items-center justify-center select-none font-['Poppins']",
          styleSettings.bgBehindText && "p-4 rounded-xl"
        )}
        style={{
          background: styleSettings.bgBehindText ? "rgba(255,255,255,0.05)" : "transparent",
          backdropFilter: styleSettings.bgBehindText
            ? `blur(${styleSettings.backgroundBlur}px)`
            : "none",
          WebkitBackdropFilter: styleSettings.bgBehindText
            ? `blur(${styleSettings.backgroundBlur}px)`
            : "none",
          boxShadow: styleSettings.shadow
            ? `0 0 ${12 * styleSettings.shadowIntensity}px rgba(255,255,255,${0.2 * styleSettings.shadowIntensity
            })`
            : "none",
          transition: "all 0.3s ease",
        }}
      >
        {/* ⚙️ Settings button */}
        {isCustomizationState && (
          <button
            onClick={() => setShowControls((p) => !p)}
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
                ? `0 0 ${6 * styleSettings.shadowIntensity}px rgba(255,255,255,${0.6 * styleSettings.shadowIntensity
                })`
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
              ? `0 0 ${10 * styleSettings.shadowIntensity}px rgba(255,255,255,${0.7 * styleSettings.shadowIntensity
              })`
              : "none",
          }}
        >
          {time}
        </h1>

        {/* ⚙️ Customization panel */}
        {showControls && (
          <div
            className="absolute -left-[260px] top-0 bg-[#1a1a1a]/90 text-white p-4 rounded-lg w-56 space-y-3 shadow-lg backdrop-blur-xl border border-white/10"
            onMouseDown={stopDragOnInput}
          >
            <h3 className="font-semibold text-sm mb-2">🧩 Customize Clock</h3>

            {[
              ["Time Color", "timeColor", "color"],
              ["Date Color", "dateColor", "color"],
              ["Border Color", "borderColor", "color"],
            ].map(([label, key, type]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-xs">{label}</label>
                <input
                  type={type}
                  value={styleSettings[key]}
                  onChange={(e) =>
                    setStyleSettings({ ...styleSettings, [key]: e.target.value })
                  }
                />
              </div>
            ))}

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

            {/* 🆕 Background blur intensity */}
            <div>
              <label className="text-xs">Backdrop Blur</label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={styleSettings.backgroundBlur}
                onChange={(e) =>
                  setStyleSettings({
                    ...styleSettings,
                    backgroundBlur: parseInt(e.target.value),
                  })
                }
                className="w-full"
                onMouseDown={stopDragOnInput}
              />
            </div>

            {/* 🆕 Shadow intensity */}
            <div>
              <label className="text-xs">Shadow Intensity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={styleSettings.shadowIntensity}
                onChange={(e) =>
                  setStyleSettings({
                    ...styleSettings,
                    shadowIntensity: parseFloat(e.target.value),
                  })
                }
                className="w-full"
                onMouseDown={stopDragOnInput}
              />
            </div>

            {/* Toggles */}
            {[
              ["Outline", "textOutline"],
              ["Shadow", "shadow"],
              ["Background Behind Text", "bgBehindText"],
            ].map(([label, key]) => (
              <label
                key={key}
                className="text-xs flex items-center justify-between"
              >
                {label}
                <input
                  type="checkbox"
                  checked={styleSettings[key]}
                  onChange={(e) =>
                    setStyleSettings({
                      ...styleSettings,
                      [key]: e.target.checked,
                    })
                  }
                  onMouseDown={stopDragOnInput}
                />
              </label>
            ))}

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
                  backgroundBlur: 8,
                  shadowIntensity: 0.7,
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
