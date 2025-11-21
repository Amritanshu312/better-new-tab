import React, { useState, useEffect, useCallback } from "react";
import { Rnd } from "react-rnd";
import { Settings2, Clock } from "lucide-react";
import clsx from "clsx";

const CountdownWidget = ({
  title,
  targetDate,
  storageKey,
  isCustomizationState,
}) => {

  const defaultStyle = {
    backgroundBlur: 12,
    bgBehindText: true,
    borderColor: "#ffffff",
    numberColor: "#ffffff",
    shadow: false,
    shadowIntensity: 1,
    textOutline: false,
    titleColor: "#ffffff",
    fontSize: 26,
  }

  /* 🎨 Style state */
  const [styleSettings, setStyleSettings] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(`${storageKey}_style`)) || defaultStyle
      );
    } catch {
      return defaultStyle;
    }
  });

  /* 📍 Position state */
  const [position, setPosition] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(`${storageKey}_position`)) || {
          x: (window.innerWidth - 300) / 2,
          y: -(window.innerHeight - 300 / 2),
        }
      );
    } catch {
      return {
        x: (window.innerWidth - 300) / 2,
        y: -(window.innerHeight - 300 / 2),
      };
    }
  });

  const defaultSize = { width: 300, height: 180 };

  /* ⏳ Countdown logic */
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const date = new Date(targetDate);
    const updateCountdown = () => {
      const now = new Date();
      const diff = date - now;
      if (diff <= 0) return;

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  /* 💾 Debounced localStorage saving */
  const debounceSave = (key) => {
    let timeout;
    return (value) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(value));
      }, 400);
    };
  };
  const saveStyle = useCallback(debounceSave(`${storageKey}_style`), []);
  const savePosition = useCallback(debounceSave(`${storageKey}_position`), []);

  useEffect(() => saveStyle(styleSettings), [styleSettings, saveStyle]);
  useEffect(() => savePosition(position), [position, savePosition]);

  /* ⚙️ Customization Panel */
  const [showControls, setShowControls] = useState(false);
  const stopDragOnInput = (e) => e.stopPropagation();

  return (
    <Rnd
      bounds="window"
      enableResizing={false}
      disableDragging={!isCustomizationState}
      position={position}
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      size={defaultSize}
      className="z-20"
    >
      <div
        className={clsx(
          "relative flex flex-col items-center justify-center rounded-2xl select-none font-[Poppins]",
          styleSettings.bgBehindText && "p-4"
        )}
        style={{
          background: styleSettings.bgBehindText
            ? "rgba(255,255,255,0.05)"
            : "transparent",
          backdropFilter: styleSettings.bgBehindText
            ? `blur(${styleSettings.backgroundBlur}px)`
            : "none",
          WebkitBackdropFilter: styleSettings.bgBehindText
            ? `blur(${styleSettings.backgroundBlur}px)`
            : "none",
          boxShadow: styleSettings.shadow
            ? `0 0 ${12 * styleSettings.shadowIntensity}px rgba(255,255,255,${0.25 * styleSettings.shadowIntensity
            })`
            : "none",
          border: "1px solid rgba(255,255,255,0.08)",
          transition: "all 0.3s ease",
        }}
      >
        {/* ⚙️ Settings Button */}
        {isCustomizationState && (
          <button
            onClick={() => setShowControls((p) => !p)}
            className="absolute -left-10 top-2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            <Settings2 className="w-5 h-5 text-white" />
          </button>
        )}

        {/* 🕒 Title */}
        <h2
          className="text-lg font-semibold mb-2 text-center flex items-center gap-2"
          style={{
            color: styleSettings.titleColor,
            WebkitTextStroke: styleSettings.textOutline
              ? `0.5px ${styleSettings.borderColor}`
              : "0",
            textShadow: styleSettings.shadow
              ? `0 0 ${6 * styleSettings.shadowIntensity}px rgba(255,255,255,${0.6 * styleSettings.shadowIntensity
              })`
              : "none",
          }}
        >
          <Clock className="w-5 h-5 text-white/70" />
          {title}
        </h2>

        {/* ⏳ Countdown Numbers */}
        <div className="flex gap-4 text-center font-medium">
          {Object.entries(timeLeft).map(([key, value]) => (
            <div key={key}>
              <span
                className="block font-bold"
                style={{
                  fontSize: `${styleSettings.fontSize}px`, // 🆕 dynamic font size
                  color: styleSettings.numberColor,
                  WebkitTextStroke: styleSettings.textOutline
                    ? `0.8px ${styleSettings.borderColor}`
                    : "0",
                  textShadow: styleSettings.shadow
                    ? `0 0 ${8 * styleSettings.shadowIntensity
                    }px rgba(255,255,255,${0.7 * styleSettings.shadowIntensity
                    })`
                    : "none",
                }}
              >
                {value}
              </span>
              <span className="text-xs text-[#dce9ff] capitalize">{key}</span>
            </div>
          ))}
        </div>

        {/* 🧩 Customization Panel */}
        {showControls && (
          <div
            className="absolute -left-[260px] top-0 bg-[#1a1a1a]/90 text-white p-4 rounded-lg w-56 space-y-3 shadow-lg backdrop-blur-xl border border-white/10"
            onMouseDown={stopDragOnInput}
          >
            <h3 className="font-semibold text-sm mb-2">
              🧩 Customize Countdown
            </h3>

            {/* 🎨 Color Pickers */}
            {[
              ["Title Color", "titleColor"],
              ["Number Color", "numberColor"],
              ["Border Color", "borderColor"],
            ].map(([label, key]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-xs">{label}</label>
                <input
                  type="color"
                  value={styleSettings[key]}
                  onChange={(e) =>
                    setStyleSettings({
                      ...styleSettings,
                      [key]: e.target.value,
                    })
                  }
                />
              </div>
            ))}

            {/* ⚙️ Sliders */}
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

            {/* 🆕 Font Size Control */}
            <div>
              <label className="text-xs">Font Size</label>
              <input
                type="range"
                min="12"
                max="40"
                step="1"
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

            {/* 🧩 Toggles */}
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

            {/* 🔁 Reset */}
            <button
              onClick={() => {
                localStorage.removeItem(`${storageKey}_style`);
                setStyleSettings(defaultStyle);
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
};

export default CountdownWidget;
