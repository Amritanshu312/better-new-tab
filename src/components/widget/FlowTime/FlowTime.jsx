import React, { useEffect, useState, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import {
  BarChart3,
  Settings2,
  RotateCcw,
  Pause,
  Play,
  Flame,
  CalendarDays,
  Clock,
} from "lucide-react";
import clsx from "clsx";

export default function FlowTimeCard() {
  let isCustomizationState = true;

  /* -------------------- 🎯 Core States -------------------- */
  const [seconds, setSeconds] = useState(
    () => Number(localStorage.getItem("focusSeconds")) || 0
  );
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [longestFocus, setLongestFocus] = useState(
    () => Number(localStorage.getItem("longestFocusSeconds")) || 0
  );

  /* -------------------- 🧭 Position (persisted) -------------------- */
  const [position, setPosition] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("focusPosition")) || {
          x: (window.innerWidth - 420) / 2,
          y: (window.innerHeight - 400) / 2,
        }
      );
    } catch {
      return { x: (window.innerWidth - 420) / 2, y: (window.innerHeight - 400) / 2 };
    }
  });

  const savePositionDebounced = useCallback(() => {
    let timeout;
    return (value) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.setItem("focusPosition", JSON.stringify(value));
      }, 300);
    };
  }, []);
  const savePosition = savePositionDebounced();

  /* -------------------- 📅 Stats & Streak -------------------- */
  const [streak, setStreak] = useState(
    () => Number(localStorage.getItem("focusStreak")) || 0
  );
  const [dailyStats, setDailyStats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("focusDailyStats")) || [];
    } catch {
      return [];
    }
  });

  /* -------------------- 🕓 Session Mode -------------------- */
  const [sessionDuration, setSessionDuration] = useState(25 * 60);
  const [sessionRemaining, setSessionRemaining] = useState(sessionDuration);
  const [isSessionMode, setIsSessionMode] = useState(false);

  /* -------------------- 🎨 Style Settings (persisted) -------------------- */
  const [styleSettings, setStyleSettings] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("focusStyle")) || {
          gradientFrom: "#7cffc8",
          gradientVia: "#ff68c4",
          gradientTo: "#ff5eae",
          bgBehindText: true,
          backgroundBlur: 12,
          shadow: true,
          borderColor: "#ffffff",
          shadowIntensity: 0.6,
        }
      );
    } catch {
      return {
        gradientFrom: "#7cffc8",
        gradientVia: "#ff68c4",
        gradientTo: "#ff5eae",
        bgBehindText: true,
        backgroundBlur: 12,
        shadow: true,
        borderColor: "#ffffff",
        shadowIntensity: 0.6,
      };
    }
  });

  const saveStyleDebounced = useCallback(() => {
    let timeout;
    return (value) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.setItem("focusStyle", JSON.stringify(value));
      }, 250);
    };
  }, []);
  const saveStyle = saveStyleDebounced();

  useEffect(() => {
    saveStyle(styleSettings);
  }, [styleSettings, saveStyle]);

  /* -------------------- 💾 Reset & Load Logic -------------------- */
  useEffect(() => {
    const lastReset = localStorage.getItem("lastResetDate");
    const now = new Date();

    if (!lastReset || new Date(lastReset).toDateString() !== now.toDateString()) {
      handleDailyReset();
      localStorage.setItem("lastResetDate", now.toISOString());
    }
  }, []);

  const handleDailyReset = () => {
    const today = new Date().toISOString().split("T")[0];

    const updatedStats = [...dailyStats, { date: today, seconds }];
    setDailyStats(updatedStats);
    localStorage.setItem("focusDailyStats", JSON.stringify(updatedStats));

    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const hadYesterday = updatedStats.some((d) => d.date === yesterday && d.seconds > 0);
    const newStreak = seconds > 0 ? (hadYesterday ? streak + 1 : 1) : 0;
    setStreak(newStreak);
    localStorage.setItem("focusStreak", newStreak);

    setSeconds(0);
    localStorage.setItem("focusSeconds", 0);
  };

  /* -------------------- ⏱️ Timer Logic -------------------- */
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
        if (isSessionMode) {
          setSessionRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsRunning(false);
              setSessionRemaining(0);
              alert("Session Complete! Great job 👏");
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isSessionMode]);

  /* -------------------- 💾 Local Save Logic -------------------- */
  useEffect(() => {
    if (hasStarted) {
      localStorage.setItem("focusSeconds", seconds);
      if (seconds > longestFocus) {
        setLongestFocus(seconds);
        localStorage.setItem("longestFocusSeconds", seconds);
      }
    }
  }, [seconds, hasStarted, longestFocus]);

  /* -------------------- 📊 Computations -------------------- */
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const format = (n) => String(n).padStart(2, "0");

  const progress =
    longestFocus === 0 ? 0 : Math.min((seconds / longestFocus) * 100, 100);

  const stopDrag = (e) => e.stopPropagation();
  const recentStats = dailyStats.slice(-7);

  /* -------------------- 🪟 Floating PiP Timer Window -------------------- */
  const popupRef = useRef(null);

  // Send updates to popup
  useEffect(() => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.postMessage({ seconds, isRunning }, "*");
    }
  }, [seconds, isRunning]);

  useEffect(() => {
    const handleBlur = () => {
      if (isRunning && (!popupRef.current || popupRef.current.closed)) {
        popupRef.current = window.open(
          "",
          "FocusPiPTimer",
          "width=240,height=160,top=80,right=80,alwaysOnTop=yes"
        );

        if (popupRef.current) {
          popupRef.current.document.write(`
            <html>
              <head>
                <title>Focus Timer</title>
                <style>
                  body {
                    margin: 0;
                    font-family: system-ui, sans-serif;
                    background: rgba(15,15,18,0.95);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    border-radius: 12px;
                    backdrop-filter: blur(12px);
                  }
                  h1 {
                    font-size: 32px;
                    margin: 0;
                    color: #00ff99;
                    text-shadow: 0 0 8px #00ff9960;
                  }
                  p {
                    font-size: 14px;
                    margin-top: 4px;
                    color: #bbb;
                  }
                </style>
              </head>
              <body>
                <h1 id="time">00:00:00</h1>
                <p>Focus session running...</p>
                <script>
                  window.addEventListener("message", (e) => {
                    const { seconds, isRunning } = e.data;
                    if (!isRunning) return;
                    const h = Math.floor(seconds / 3600);
                    const m = Math.floor((seconds % 3600) / 60);
                    const s = seconds % 60;
                    const format = (n) => String(n).padStart(2, "0");
                    document.getElementById("time").textContent = \`\${format(h)}:\${format(m)}:\${format(s)}\`;
                  });
                </script>
              </body>
            </html>
          `);
        }
      }
    };

    const handleFocus = () => {
      if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
    };

    // Register listeners for tab visibility and window focus
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) handleBlurOrHide();
      else handleFocus();
    });
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", () => {
        if (document.hidden) handleBlur();
        else handleFocus();
      });
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isRunning]);

  /* -------------------- 🎨 UI -------------------- */
  return (
    <Rnd
      bounds="window"
      enableResizing={true}
      disableDragging={!isCustomizationState}
      position={position}
      onDragStop={(e, d) => {
        const newPos = { x: d.x, y: d.y };
        setPosition(newPos);
        savePosition(newPos);
      }}
      className="z-20 font-[poppins]"
    >
      <div
        className={clsx(
          "relative w-[420px] text-white rounded-2xl p-5 select-none transition-all duration-300",
          styleSettings.bgBehindText && "backdrop-blur-2xl"
        )}
        style={{
          background: styleSettings.bgBehindText
            ? ""
            : "transparent",
          boxShadow: styleSettings.shadow
            ? `0 0 ${25 * styleSettings.shadowIntensity}px rgba(255,255,255,${0.1 * styleSettings.shadowIntensity})`
            : "none",
          border: `1px solid ${styleSettings.borderColor}20`,
          backdropFilter: styleSettings.bgBehindText
            ? `blur(${styleSettings.backgroundBlur}px)`
            : "none",
        }}
      >
        {/* ⚙️ Settings Button */}
        {isCustomizationState && (
          <button
            onClick={() => setShowControls((p) => !p)}
            className="absolute -left-10 top-2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
            title="Customize"
          >
            <Settings2 className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-[#00ff99]" />
            <span className="text-gray-300 font-medium tracking-wide">
              Focus Tracker
            </span>
          </div>
          <div className="text-sm text-[#00ff99] font-semibold bg-[#003b2e] px-2 py-[1px] rounded-md">
            {progress.toFixed(0)}%
          </div>
        </div>

        {/* Timer */}
        <div className="text-center my-5">
          <h2
            className="text-5xl font-semibold bg-clip-text text-transparent tracking-wide"
            style={{
              backgroundImage: `linear-gradient(to right, ${styleSettings.gradientFrom}, ${styleSettings.gradientVia}, ${styleSettings.gradientTo})`,
              textShadow: `0 0 8px ${styleSettings.gradientVia}80`,
            }}
          >
            {`${format(hours)}:${format(minutes)}:${format(secs)}`}
          </h2>
          <p className="text-gray-400 mt-2 text-sm">Total Focus Time</p>
        </div>

        {/* 🔥 Streak */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Flame className="text-orange-400 w-4 h-4" />
          <span className="text-gray-300 text-sm">
            Streak: <span className="text-white font-semibold">{streak}</span> days
          </span>
        </div>

        {/* 📅 Weekly Stats */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-1 text-sm text-gray-400">
            <CalendarDays size={14} /> Weekly Focus (last 7 days)
          </div>
          <div className="flex justify-between items-end gap-1 h-16">
            {recentStats.map((day, i) => {
              const h = Math.min((day.seconds / 3600 / 10) * 100, 100);
              return (
                <div
                  key={i}
                  className="flex-1 bg-[#1b1b1f] rounded relative group"
                  style={{ height: `${h}%` }}
                  title={`${day.date}: ${(day.seconds / 3600).toFixed(1)}h`}
                >
                  <div className="absolute inset-0 rounded bg-gradient-to-t from-[#ff5eae80] to-[#7cffc880] group-hover:brightness-125 transition" />
                </div>
              );
            })}
          </div>
        </div>

        {/* 🕓 Session Mode */}
        <div className="mt-5 text-sm text-gray-300">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Clock size={14} /> Session Mode
            </span>
            <select
              value={sessionDuration}
              onChange={(e) => {
                const v = Number(e.target.value);
                setSessionDuration(v);
                setSessionRemaining(v);
              }}
              className="bg-[#222] border border-[#333] rounded-md text-gray-300 text-xs px-2 py-1"
              onMouseDown={stopDrag}
            >
              <option value={25 * 60}>25 min</option>
              <option value={45 * 60}>45 min</option>
              <option value={60 * 60}>60 min</option>
            </select>
          </div>
          <div className="mt-2 text-gray-400 text-xs">
            Remaining: {Math.floor(sessionRemaining / 60)}m {sessionRemaining % 60}s
          </div>
          <button
            onClick={() => {
              setIsSessionMode((p) => !p);
              setIsRunning((p) => !p);
              setHasStarted(true);
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-[#18181b] border border-[#2c2c2c] text-gray-300 text-xs hover:bg-[#222] flex items-center gap-1"
          >
            {isRunning ? (
              <>
                <Pause size={12} /> Pause Session
              </>
            ) : (
              <>
                <Play size={12} /> Start Session
              </>
            )}
          </button>
        </div>

        {/* 🔄 Reset */}
        <button
          onClick={() => {
            setSeconds(0);
            setIsRunning(false);
            setHasStarted(false);
            setSessionRemaining(sessionDuration);
            localStorage.setItem("focusSeconds", 0);
          }}
          className="mt-4 w-full bg-white/10 hover:bg-white/20 text-xs py-2 rounded-md transition"
        >
          <RotateCcw size={12} className="inline mr-1" /> Reset Timer
        </button>

        {/* 🎨 Customization Popup */}
        {showControls && (
          <div
            className="absolute -left-[260px] top-0 bg-[#1a1a1a]/90 text-white p-4 rounded-lg w-56 space-y-3 shadow-lg backdrop-blur-xl border border-white/10"
            onMouseDown={stopDrag}
          >
            <h3 className="font-semibold text-sm mb-2">🎨 Customize Focus Card</h3>
            {[
              ["Gradient Start", "gradientFrom"],
              ["Gradient Mid", "gradientVia"],
              ["Gradient End", "gradientTo"],
              ["Border Color", "borderColor"],
            ].map(([label, key]) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <label className="text-xs">{label}</label>
                <input
                  type="color"
                  value={styleSettings[key]}
                  onChange={(e) =>
                    setStyleSettings({ ...styleSettings, [key]: e.target.value })
                  }
                  className="w-8 h-4 rounded outline-none cursor-pointer"
                  onMouseDown={stopDrag}
                />
              </div>
            ))}

            <div>
              <label className="text-xs">Backdrop Blur</label>
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                value={styleSettings.backgroundBlur}
                onChange={(e) =>
                  setStyleSettings({
                    ...styleSettings,
                    backgroundBlur: parseInt(e.target.value),
                  })
                }
                className="w-full"
                onMouseDown={stopDrag}
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
                onMouseDown={stopDrag}
              />
            </div>

            {[
              ["Background Behind Text", "bgBehindText"],
              ["Enable Shadow", "shadow"],
            ].map(([label, key]) => (
              <label key={key} className="text-xs flex items-center justify-between">
                {label}
                <input
                  type="checkbox"
                  checked={!!styleSettings[key]}
                  onChange={(e) =>
                    setStyleSettings({
                      ...styleSettings,
                      [key]: e.target.checked,
                    })
                  }
                  onMouseDown={stopDrag}
                />
              </label>
            ))}

            <button
              onClick={() => {
                localStorage.removeItem("focusStyle");
                setStyleSettings({
                  gradientFrom: "#7cffc8",
                  gradientVia: "#ff68c4",
                  gradientTo: "#ff5eae",
                  bgBehindText: true,
                  backgroundBlur: 12,
                  shadow: true,
                  borderColor: "#ffffff",
                  shadowIntensity: 0.6,
                });
              }}
              className="w-full bg-white/10 hover:bg-white/20 text-xs py-1.5 rounded-md transition"
            >
              Reset Defaults
            </button>
          </div>
        )}
      </div>
    </Rnd>
  );
}
