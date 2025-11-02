import { useGeneralSettings } from "../../context/GeneralSettings";
import { Switch } from "@headlessui/react";

const GeneralSection = () => {
  const { settings, toggleSetting, updateSetting, resetSettings } = useGeneralSettings();

  return (
    <div className="text-white space-y-6">
      <h2 className="text-xl font-semibold">General Settings</h2>

      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Show Dimming Background</h3>
          <p className="text-xs text-gray-400">Enable or disable To Show Dimming Background overlay in Home Screen.</p>
        </div>
        <Switch
          checked={settings.showBackground}
          onChange={() => toggleSetting("showBackground")}
          className={`${settings.showBackground ? "bg-blue-600" : "bg-gray-600"
            } relative inline-flex h-6 w-11 items-center rounded-full transition`}
        >
          <span
            className={`${settings.showBackground ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </div>

      {/* Toggle Border*/}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Show Borders In Images</h3>
          <p className="text-xs text-gray-400">Enable or disable Borders In Images.</p>
        </div>
        <Switch
          checked={settings.showBorder}
          onChange={() => toggleSetting("showBorder")}
          className={`${settings.showBorder ? "bg-blue-600" : "bg-gray-600"
            } relative inline-flex h-6 w-11 items-center rounded-full transition`}
        >
          <span
            className={`${settings.showBorder ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </div>


      {/* Toggle App Bar hide or show*/}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Show App Bar</h3>
          <p className="text-xs text-gray-400">Enable or disable App Bats in Home Screen.</p>
        </div>
        <Switch
          checked={settings.showAppbar}
          onChange={() => toggleSetting("showAppbar")}
          className={`${settings.showAppbar ? "bg-blue-600" : "bg-gray-600"
            } relative inline-flex h-6 w-11 items-center rounded-full transition`}
        >
          <span
            className={`${settings.showAppbar ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Wallpaper Dimming</h3>
          <span className="text-sm text-gray-300">
            {settings.wallpaperDimming}%
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          value={settings.wallpaperDimming}
          onChange={(e) => updateSetting("wallpaperDimming", Number(e.target.value))}
          className="w-full accent-blue-600"
        />
      </div>

      {/* Reset */}
      <button
        onClick={resetSettings}
        className="mt-4 px-4 py-2 bg-red-600 rounded-lg text-sm hover:bg-red-700"
      >
        Reset to Default
      </button>
    </div>
  );
};

export default GeneralSection;
