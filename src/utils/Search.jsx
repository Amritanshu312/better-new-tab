import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ------------------ NEW: GLOBAL CONVERSION LOGIC ------------------

/**
 * Configuration for unit conversions.
 * Each unit has a 'base' unit (e.g., 'm' for length) and a 'factor'
 * to convert it to that base.
 * Temperature is handled as a special 'type'.
 */
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
  qt: { base: "l", factor: 0.946353 }, // US Liquid Quart
  gal: { base: "l", factor: 3.78541 }, // US Liquid Gallon

  // Time
  ms: { base: "s", factor: 0.001 },
  s: { base: "s", factor: 1 },
  min: { base: "s", factor: 60 },
  h: { base: "s", factor: 3600 },
  day: { base: "s", factor: 86400 },

  // Data (using 1024 base for KiB, MiB, etc. as is common)
  b: { base: "b", factor: 1 },
  kb: { base: "b", factor: 1024 },
  mb: { base: "b", factor: 1024 ** 2 },
  gb: { base: "b", factor: 1024 ** 3 },
  tb: { base: "b", factor: 1024 ** 4 },

  // Temperature (special type)
  c: { type: "temp" },
  f: { type: "temp" },
  k: { type: "temp" },
};

/**
 * Converts a value from one unit to another.
 * @param {number} value - The numeric value to convert.
 * @param {string} fromUnitRaw - The unit to convert from (e.g., "cm").
 * @param {string} toUnitRaw - The unit to convert to (e.g., "in").
 * @returns {number|null} The converted value, or null if conversion is not possible.
 */
function convertUnits(value, fromUnitRaw, toUnitRaw) {
  const fromUnit = fromUnitRaw.toLowerCase();
  const toUnit = toUnitRaw.toLowerCase();

  const from = conversions[fromUnit];
  const to = conversions[toUnit];

  // Check if units are known
  if (!from || !to) return null;

  // --- Handle Temperature Conversion ---
  if (from.type === "temp" && to.type === "temp") {
    let valInC;
    // 1. Convert input value to Celsius
    if (fromUnit === "c") valInC = value;
    else if (fromUnit === "f") valInC = (value - 32) * (5 / 9);
    else if (fromUnit === "k") valInC = value - 273.15;
    else return null; // Should not happen

    // 2. Convert from Celsius to target unit
    if (toUnit === "c") return valInC;
    if (toUnit === "f") return (valInC * 9) / 5 + 32;
    if (toUnit === "k") return valInC + 273.15;
    return null; // Should not happen
  }

  // --- Handle Standard Base/Factor Conversion ---
  // Check for incompatible types (e.g., length to mass)
  if (from.type === "temp" || to.type === "temp" || from.base !== to.base) {
    return null;
  }

  // 1. Convert 'from' value to base unit
  const valueInBase = value * from.factor;

  // 2. Convert from base unit to 'to' unit
  const valueInTarget = valueInBase / to.factor;

  return valueInTarget;
}

// ------------------ SEARCH BAR COMPONENT ------------------

const SearchBar = () => {
  const [input, setInput] = useState("");
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState("general");
  const [specialResult, setSpecialResult] = useState(null);

  // ------------------ GLOBAL SHORTCUT HANDLER ------------------
  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = e.key.toLowerCase();
      const target = e.target;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (key === "escape" && visible) {
        e.preventDefault();
        setVisible(false);
        setInput("");
        setMode("general");
        setSpecialResult(null);
        return;
      }

      if (visible || isTyping) return;

      const openMode = (m) => {
        e.preventDefault();
        setVisible(true);
        setMode(m);
        setInput("");
        setSpecialResult(null);
      };

      switch (key) {
        case "/":
          openMode("general");
          break;
        case "g":
          openMode("google");
          break;
        case "y":
          openMode("youtube");
          break;
        case "r":
          e.preventDefault();
          openMode("reddit");
          break;
        case "t":
          openMode("twitter");
          break;
        case "i":
          openMode("instagram");
          break;
        case "d":
          openMode("discord");
          break;
        case "f":
          openMode("facebook");
          break;
        case "k":
          openMode("tiktok");
          break;
        case "h":
          openMode("github");
          break;
        case "w":
          openMode("twitch");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [visible]);

  // ------------------ SPECIAL COMMAND HANDLER (MODIFIED) ------------------
  useEffect(() => {
    // These features only work in "general" mode
    if (mode !== "general" || !input) {
      setSpecialResult(null);
      return;
    }

    const trimmedInput = input.trim();

    // 📅 3. Quick Info (Checked first)
    const infoMatch = trimmedInput.match(/^(time|date|day)$/i);
    if (infoMatch) {
      const cmd = infoMatch[1].toLowerCase();
      const now = new Date();
      if (cmd === "time") {
        setSpecialResult(`= ${now.toLocaleTimeString()}`);
      } else if (cmd === "date") {
        setSpecialResult(`= ${now.toLocaleDateString()}`);
      } else if (cmd === "day") {
        setSpecialResult(
          `= ${now.toLocaleDateString(undefined, { weekday: "long" })}`
        );
      }
      return;
    }

    // --- START MODIFICATION ---
    // 🌡️ 2. Unit Conversion (Using new global function)
    const convertMatch = trimmedInput.match(
      /^([\d.-]+)\s*([a-zA-Z]+)\s+(to|in)\s+([a-zA-Z]+)$/i
    );
    if (convertMatch) {
      const [, valueStr, fromUnitRaw, , toUnitRaw] = convertMatch;
      const value = parseFloat(valueStr);

      if (!isNaN(value)) {
        const result = convertUnits(value, fromUnitRaw, toUnitRaw);

        if (result !== null) {
          // Format to 2 decimal places, but remove .00
          const formattedResult = Number.isInteger(result)
            ? result
            : result.toFixed(2).replace(/\.00$/, "");
          setSpecialResult(`= ${formattedResult} ${toUnitRaw}`);
          return;
        }
      }
    }
    // --- END MODIFICATION ---

    // 🧮 1. Built-in Calculator
    const mathInput = trimmedInput.replace(/\^/g, "**");
    const mathRegex = /^[\d\s()+\-*/%*.]+$/;

    if (mathRegex.test(mathInput)) {
      try {
        const mathResult = new Function("return " + mathInput)();
        if (typeof mathResult === "number" && isFinite(mathResult)) {
          setSpecialResult(`= ${mathResult}`);
          return;
        }
      } catch (e) {
        // Not valid math, fall through
      }
    }

    // No special command matched
    setSpecialResult(null);
  }, [input, mode]);

  // ------------------ SEARCH HANDLER ------------------
  const handleSearch = () => {
    if (specialResult && mode === "general") {
      const resultToCopy = specialResult.startsWith("= ")
        ? specialResult.substring(2)
        : specialResult;

      // Use execCommand as a fallback for clipboard write
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(resultToCopy);
        } else {
          // Fallback for environments where clipboard API is not available
          const textArea = document.createElement("textarea");
          textArea.value = resultToCopy;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }

      setInput("");
      setVisible(false);
      setSpecialResult(null);
      return;
    }

    const query = input.trim();
    let url = "";
    const encode = encodeURIComponent;

    if (!query) {
      switch (mode) {
        case "google":
          url = "https://www.google.com/";
          break;
        case "youtube":
          url = "https://www.youtube.com/";
          break;
        case "reddit":
          url = "https://www.reddit.com/";
          break;
        case "twitter":
          url = "https://x.com/";
          break;
        case "instagram":
          url = "https://www.instagram.com/";
          break;
        case "discord":
          url = "https://discord.com/";
          break;
        case "facebook":
          url = "https://www.facebook.com/";
          break;
        case "tiktok":
          url = "https://www.tiktok.com/";
          break;
        case "github":
          url = "https://github.com/";
          break;
        case "twitch":
          url = "https://www.twitch.tv/";
          break;
        default:
          url = "https://www.google.com/";
          break;
      }
    } else {
      switch (mode) {
        case "google":
          url = `https://www.google.com/search?q=${encode(query)}`;
          break;
        case "youtube":
          url = `https://www.youtube.com/results?search_query=${encode(query)}`;
          break;
        case "reddit":
          url = `https://www.reddit.com/search/?q=${encode(query)}`;
          break;
        case "twitter":
          url = `https://x.com/search?q=${encode(query)}`;
          break;
        case "instagram":
          url = `https://www.instagram.com/explore/tags/${encode(query)}/`;
          break;
        case "discord":
          url = `https://discord.com/search?query=${encode(query)}`;
          break;
        case "facebook":
          url = `https://www.facebook.com/search/top?q=${encode(query)}`;
          break;
        case "tiktok":
          url = `https://www.tiktok.com/search?q=${encode(query)}`;
          break;
        case "github":
          url = `https://github.com/search?q=${encode(query)}`;
          break;
        case "twitch":
          url = `https://www.twitch.tv/search?term=${encode(query)}`;
          break;
        default:
          url = `https://www.google.com/search?q=${encode(query)}`;
          break;
      }
    }

    if (url) window.open(url, "_blank");
    setInput("");
    setVisible(false);
    setSpecialResult(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // ------------------ MODE VISUAL CONFIG ------------------
  const modeConfig = {
    general: {
      color: "text-gray-300",
      placeholder: "Type math, '10cm to in', '5kg to lb', 'time'...", // <-- Updated placeholder
    },
    google: { color: "text-blue-400", placeholder: "Google Search..." },
    youtube: { color: "text-red-400", placeholder: "YouTube Search..." },
    reddit: { color: "text-orange-400", placeholder: "Reddit Search..." },
    twitter: { color: "text-sky-400", placeholder: "Twitter (X) Search..." },
    instagram: { color: "text-pink-400", placeholder: "Instagram Tags..." },
    discord: { color: "text-indigo-400", placeholder: "Discord Search..." },
    facebook: { color: "text-blue-500", placeholder: "Facebook Search..." },
    tiktok: { color: "text-gray-200", placeholder: "TikTok Search..." },
    github: { color: "text-green-400", placeholder: "GitHub Repositories..." },
    twitch: { color: "text-purple-400", placeholder: "Twitch Channels..." },
  };

  // ------------------ UI ------------------
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-[14.5rem] left-[38%] -translate-x-1/2 flex items-center bg-black/60 p-4 backdrop-blur-lg text-white rounded-3xl w-[90%] max-w-md z-50 shadow-2xl"
        >
          <Search size={20} className={`mr-3 ${modeConfig[mode].color}`} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={modeConfig[mode].placeholder}
            className={`bg-transparent w-full outline-none placeholder-gray-400 text-white ${specialResult ? "pr-32" : "pr-4" // Adjusted padding for longer results
              }`}
            autoFocus
          />
          <AnimatePresence>
            {specialResult && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute right-5 text-gray-400 text-sm whitespace-nowrap"
              >
                {specialResult}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchBar;
