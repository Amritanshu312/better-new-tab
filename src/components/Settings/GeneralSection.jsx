import { useEffect, useState } from "react";
import { useGeneralSettings } from "../../context/GeneralSettings";
import { Switch } from "@headlessui/react";

// 🎯 Reusable Toggle Component
const SettingToggle = ({ title, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#2e2b2b59] transition">
    <div>
      <h3 className="text-base font-medium">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
    <Switch
      checked={checked}
      onChange={onChange}
      className={`${checked ? "bg-blue-600" : "bg-gray-600"
        } relative inline-flex h-6 w-11 items-center rounded-full transition`}
    >
      <span
        className={`${checked ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
      />
    </Switch>
  </div>
);

const GeneralSection = () => {
  const { settings, toggleSetting, updateSetting, resetSettings } =
    useGeneralSettings();

  const [showRefreshPopup, setShowRefreshPopup] = useState(false);

  // Store initial states to detect if reverted
  const [initialValues] = useState({
    showAppbar: settings.showAppbar,
    showTodoList: settings.showTodoList,
    showTimeDate: settings.showTimeDate,
  });

  // Watch for specific setting changes and revert checks
  useEffect(() => {
    const changed =
      settings.showAppbar !== initialValues.showAppbar ||
      settings.showTodoList !== initialValues.showTodoList ||
      settings.showTimeDate !== initialValues.showTimeDate;

    setShowRefreshPopup(changed);
  }, [
    settings.showAppbar,
    settings.showTodoList,
    settings.showTimeDate,
    initialValues,
  ]);



  return (
    <div className="text-white space-y-8 mb-12">
      <h2 className="text-3xl font-semibold mb-6">🧩 General Settings</h2>

      {/* Toggles Section */}
      <div className="space-y-4">
        <SettingToggle
          title="Dimming Background"
          description="Show a dim overlay behind your live wallpaper."
          checked={settings.showBackground}
          onChange={() => toggleSetting("showBackground")}
        />

        <SettingToggle
          title="Image Borders"
          description="Display a subtle border around images in your UI."
          checked={settings.showBorder}
          onChange={() => toggleSetting("showBorder")}
        />

        <SettingToggle
          title="Show App Bar"
          description="Display the app bar at the home screen."
          checked={settings.showAppbar}
          onChange={() => toggleSetting("showAppbar")}
        />

        <SettingToggle
          title="Disable Global Search"
          description="Turn off the Spotlight search feature on your home screen."
          checked={!settings.global_search}
          onChange={() => toggleSetting("global_search")}
        />

        <SettingToggle
          title="Show Todo List"
          description="Enable the floating Todo List window on your home screen."
          checked={settings.showTodoList}
          onChange={() => toggleSetting("showTodoList")}
        />

        <SettingToggle
          title="Show Time & Date"
          description="Remove the Time and Date card from the home screen."
          checked={settings.showTimeDate}
          onChange={() => toggleSetting("showTimeDate")}
        />

        <SettingToggle
          title="Hide Lock Icon"
          description="Hide the lock icon when Locked mode is Disabled."
          checked={settings.hide_lock_icon}
          onChange={() => toggleSetting("hide_lock_icon")}
        />
      </div>

      {/* Playback Rate Slider */}
      <div className="space-y-3 p-3 rounded-xl hover:bg-[#2e2b2b59] transition">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium">Wallpaper Playback Speed</h3>
          <span className="text-sm text-gray-300">
            {settings.playbackRate.toFixed(2)}x
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Adjust how fast your live wallpaper video plays.
        </p>
        <input
          type="range"
          min="1"
          max="6"
          step="0.02"
          value={settings.playbackRate}
          onChange={(e) => updateSetting("playbackRate", Number(e.target.value))}
          className="w-full accent-blue-600"
        />
      </div>

      {/* Dimming Slider */}
      <div className="space-y-3 p-3 rounded-xl hover:bg-[#2e2b2b59] transition">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium">Wallpaper Dimming Level</h3>
          <span className="text-sm text-gray-300">
            {settings.wallpaperDimming}%
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Adjust the opacity of the dark overlay over your wallpaper.
        </p>
        <input
          type="range"
          min="10"
          max="80"
          value={settings.wallpaperDimming}
          onChange={(e) =>
            updateSetting("wallpaperDimming", Number(e.target.value))
          }
          className="w-full accent-blue-600"
        />
      </div>

      {/* Reset Button */}
      <div className="pt-4">
        <button
          onClick={resetSettings}
          className="w-full py-2 bg-red-600 rounded-lg text-base hover:bg-red-700 transition"
        >
          Reset to Default
        </button>
      </div>


      {showRefreshPopup && <div className="w-full h-12 bottom-12 sticky bg-[#2e2e2e] rounded-lg flex items-center px-2 justify-between">
        <p className="text-sm text-gray-400">⚙️ You’ve enabled a setting that needs a quick refresh to apply properly.</p>
        <button className="px-6 py-2 text-sm bg-[#242323b3] rounded-md hover:bg-[#1818188b] transition" onClick={() => window.location.reload()}>Refresh Now</button>
      </div>}
    </div>
  );
};

export default GeneralSection;
