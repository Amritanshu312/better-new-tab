import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

/* ----------------- UNIT CONVERSION LOGIC ----------------- */

// Default densities (for approximate l↔kg conversions)
const defaultDensities = {
  water: 1, // 1 kg/L
  milk: 1.03,
  oil: 0.9,
  mercury: 13.6,
};

const conversions = {
  // Length
  mm: { base: "m", factor: 0.001 },
  cm: { base: "m", factor: 0.01 },
  m: { base: "m", factor: 1 },
  km: { base: "m", factor: 1000 },
  in: { base: "m", factor: 0.0254 },
  ft: { base: "m", factor: 0.3048 },
  yd: { base: "m", factor: 0.9144 },
  mi: { base: "m", factor: 1609.34 },

  // Mass
  mg: { base: "g", factor: 0.001 },
  g: { base: "g", factor: 1 },
  kg: { base: "g", factor: 1000 },
  oz: { base: "g", factor: 28.3495 },
  lb: { base: "g", factor: 453.592 },

  // Volume
  ml: { base: "l", factor: 0.001 },
  l: { base: "l", factor: 1 },
  gal: { base: "l", factor: 3.78541 },
  qt: { base: "l", factor: 0.946353 },

  // Temperature
  c: { type: "temp" },
  f: { type: "temp" },
  k: { type: "temp" },

  // Pressure
  pa: { base: "pa", factor: 1 },
  kpa: { base: "pa", factor: 1000 },
  bar: { base: "pa", factor: 100000 },
  atm: { base: "pa", factor: 101325 },

  // Energy
  j: { base: "j", factor: 1 },
  kj: { base: "j", factor: 1000 },
  cal: { base: "j", factor: 4.184 },
  kcal: { base: "j", factor: 4184 },

  // Speed
  "m/s": { base: "m/s", factor: 1 },
  "km/h": { base: "m/s", factor: 1000 / 3600 },
  mph: { base: "m/s", factor: 0.44704 },
};

function convertUnits(value, fromUnitRaw, toUnitRaw) {
  const fromUnit = fromUnitRaw.toLowerCase();
  const toUnit = toUnitRaw.toLowerCase();
  const from = conversions[fromUnit];
  const to = conversions[toUnit];

  if (!from || !to) return null;

  // Temperature conversion
  if (from.type === "temp" && to.type === "temp") {
    let celsius;
    if (fromUnit === "c") celsius = value;
    else if (fromUnit === "f") celsius = (value - 32) * (5 / 9);
    else if (fromUnit === "k") celsius = value - 273.15;

    if (toUnit === "c") return celsius;
    if (toUnit === "f") return celsius * (9 / 5) + 32;
    if (toUnit === "k") return celsius + 273.15;
  }

  // Normal same-base conversion
  if (from.base === to.base) {
    return (value * from.factor) / to.factor;
  }

  // 🌊 Cross-type: Volume ↔ Mass (use density)
  const density = defaultDensities.water;

  // Volume → Mass
  if (from.base === "l" && to.base === "g") {
    const liters = value * from.factor;
    return (liters * density * 1000) / to.factor;
  }

  // Mass → Volume
  if (from.base === "g" && to.base === "l") {
    const grams = value * from.factor;
    return grams / (density * 1000 * to.factor);
  }

  return null;
}

/* ----------------- SEARCH BAR ----------------- */

const SearchBar = () => {
  const [input, setInput] = useState("");
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState("general");
  const [specialResult, setSpecialResult] = useState(null);
  const isLowEndDevice = (navigator?.deviceMemory || 8) <= 4;

  /* ---------- GLOBAL SHORTCUT HANDLER ---------- */
  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = e.key.toLowerCase();
      const target = e.target;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (key === "escape" && visible) {
        setVisible(false);
        setInput("");
        setSpecialResult(null);
        return;
      }

      if (visible || typing) return;

      const modes = {
        "/": "general",
        g: "google",
        y: "youtube",
        r: "reddit",
        t: "twitter",
        i: "instagram",
        d: "discord",
        f: "facebook",
        k: "tiktok",
        h: "github",
        w: "twitch",
      };

      if (modes[key]) {
        e.preventDefault();
        setVisible(true);
        setMode(modes[key]);
        setInput("");
        setSpecialResult(null);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [visible]);

  /* ---------- COMMANDS: calculator, conversion, etc ---------- */
  useEffect(() => {
    if (mode !== "general" || !input) {
      setSpecialResult(null);
      return;
    }

    const t = input.trim();

    // Date/Time
    const infoMatch = t.match(/^(time|date|day)$/i);
    if (infoMatch) {
      const now = new Date();
      const cmd = infoMatch[1].toLowerCase();
      if (cmd === "time") setSpecialResult(`= ${now.toLocaleTimeString()}`);
      else if (cmd === "date") setSpecialResult(`= ${now.toLocaleDateString()}`);
      else if (cmd === "day")
        setSpecialResult(
          `= ${now.toLocaleDateString(undefined, { weekday: "long" })}`
        );
      return;
    }

    // Unit Conversion
    const match = t.match(/^([\d.-]+)\s*([a-zA-Z/]+)\s+(to|in)\s+([a-zA-Z/]+)$/i);
    if (match) {
      const [, val, from, , to] = match;
      const value = parseFloat(val);
      if (!isNaN(value)) {
        const res = convertUnits(value, from, to);
        if (res !== null) {
          const formatted =
            Math.abs(res) >= 1
              ? res.toFixed(3).replace(/\.?0+$/, "")
              : res.toExponential(3);
          setSpecialResult(`= ${formatted} ${to}`);
          return;
        }
      }
    }

    // Calculator
    try {
      const mathResult = new Function("return " + t.replace(/\^/g, "**"))();
      if (typeof mathResult === "number" && isFinite(mathResult)) {
        setSpecialResult(`= ${mathResult}`);
        return;
      }
    } catch { }

    setSpecialResult(null);
  }, [input, mode]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      setInput("");
      setVisible(false);
      setSpecialResult(null);
    }
  };

  /* ---------- STYLING CONFIG ---------- */
  const modeConfig = {
    general: {
      color: "text-gray-300",
      placeholder: "Try '1 l to kg', '2km to mi', or 'time'...",
    },
    google: { color: "text-blue-400", placeholder: "Google Search..." },
    youtube: { color: "text-red-400", placeholder: "YouTube Search..." },
    reddit: { color: "text-orange-400", placeholder: "Reddit Search..." },
    twitter: { color: "text-sky-400", placeholder: "Twitter Search..." },
    instagram: { color: "text-pink-400", placeholder: "Instagram Tags..." },
    discord: { color: "text-indigo-400", placeholder: "Discord Search..." },
    facebook: { color: "text-blue-500", placeholder: "Facebook Search..." },
    tiktok: { color: "text-gray-200", placeholder: "TikTok Search..." },
    github: { color: "text-green-400", placeholder: "GitHub Repositories..." },
    twitch: { color: "text-purple-400", placeholder: "Twitch Channels..." },
  };

  const motionProps = isLowEndDevice
    ? {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.98 },
      transition: { duration: 0.15 },
    }
    : {
      initial: { y: -60, opacity: 0, scale: 0.95 },
      animate: { y: 0, opacity: 1, scale: 1 },
      exit: { y: -60, opacity: 0, scale: 0.95 },
      transition: { duration: 0.3, ease: "easeOut" },
    };

  /* ---------- UI ---------- */
  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed top-[5%] left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
          <motion.div
            {...motionProps}
            className={clsx(
              "flex items-center justify-between gap-3 relative px-5 py-3 rounded-3xl",
              "border border-[#ffffff18] bg-gradient-to-br from-[#161616c9] to-[#0f0f0fb5]",
              "backdrop-blur-2xl text-white select-none shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
              input && !isLowEndDevice
                ? "shadow-[0_0_12px_2px_rgba(0,174,255,0.25)]"
                : ""
            )}
          >
            <Search
              size={20}
              className={clsx(
                "mr-2 transition-colors",
                modeConfig[mode]?.color || "text-blue-400"
              )}
            />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={modeConfig[mode]?.placeholder}
              autoFocus
              className={clsx(
                "bg-transparent flex-1 outline-none text-white text-sm md:text-base",
                "placeholder-gray-400",
                specialResult ? "pr-28" : "pr-4"
              )}
            />

            <AnimatePresence>
              {specialResult && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                  className="absolute right-6 text-gray-400 text-xs md:text-sm whitespace-nowrap"
                >
                  {specialResult}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchBar;
