import { useGeneralSettings } from "../../context/GeneralSettings";
import { Switch } from "@headlessui/react";

const GeneralSection = () => {
  const { settings, toggleSetting, updateSetting, resetSettings } = useGeneralSettings();

  return (
    <div className="text-white space-y-6 mb-12">
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



      {/* Toggle Global Search*/}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Disable Global Search (Spotlight)</h3>
          <p className="text-xs text-gray-400">Disable Global Search from Home Screen.</p>
        </div>
        <Switch
          checked={!settings.global_search}
          onChange={() => toggleSetting("global_search")}
          className={`${!settings.global_search ? "bg-blue-600" : "bg-gray-600"
            } relative inline-flex h-6 w-11 items-center rounded-full transition`}
        >
          <span
            className={`${!settings.global_search ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </div>


      {/* Toggle lock icon hide or show when state is locked*/}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Hide Lock Icon</h3>
          <p className="text-xs text-gray-400">Enable To Hide Lock Icon When Editing State Is Locked, Disable To Show Lock Icon even when Editing State is locked.</p>
        </div>
        <Switch
          checked={settings.hide_lock_icon}
          onChange={() => toggleSetting("hide_lock_icon")}
          className={`${settings.hide_lock_icon ? "bg-blue-600" : "bg-gray-600"
            } relative inline-flex h-6 w-11 items-center rounded-full transition`}
        >
          <span
            className={`${settings.hide_lock_icon ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </div>

      {/* Toggle lock icon hide or show when state is locked*/}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Hide Time and Date</h3>
          <p className="text-xs text-gray-400">Enable or Disable To Hide Time And Date Card From Home Page.</p>
        </div>
        <Switch
          checked={!settings.showTimeDate}
          onChange={() => toggleSetting("showTimeDate")}
          className={`${!settings.showTimeDate ? "bg-blue-600" : "bg-gray-600"
            } relative inline-flex h-6 w-11 items-center rounded-full transition`}
        >
          <span
            className={`${!settings.showTimeDate ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </div>


      {/* Playback rate */}
      <div className="space-y-2">
        <div>

          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Live Wallpaper Playback Rate</h3>
            <span className="text-sm text-gray-300">
              {settings.playbackRate}
            </span>
          </div>
          <p className="text-xs text-gray-400">Slide the Slider to change the speed of live wallpaper video.</p>
        </div>

        <input
          type="range"
          min="1"
          step="0.02"
          max="16"
          value={settings.playbackRate}
          onChange={(e) => updateSetting("playbackRate", Number(e.target.value))}
          className="w-full accent-blue-600"
        />
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <div>

          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Wallpaper Dimming</h3>
            <span className="text-sm text-gray-300">
              {settings.wallpaperDimming}%
            </span>
          </div>
          <p className="text-xs text-gray-400">Slide the Slider to change the opacity of overlay in live wallpaper.</p>

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
