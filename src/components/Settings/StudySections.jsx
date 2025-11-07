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

const StudySections = () => {
  const { settings, toggleSetting, resetSettings } =
    useGeneralSettings();

  const [showRefreshPopup, setShowRefreshPopup] = useState(false);

  // Store initial states to detect if reverted
  const [initialValues] = useState({
    show_studyTracker: settings.show_studyTracker,
  });

  // Watch for specific setting changes and revert checks
  useEffect(() => {
    const changed =
      settings.show_studyTracker !== initialValues.show_studyTracker

    setShowRefreshPopup(changed);
  }, [
    settings.show_studyTracker,
  ]);



  return (
    <div className="text-white space-y-8 mb-12">
      <h2 className="text-3xl font-semibold mb-6">📚 Study</h2>

      {/* Toggles Section */}
      <div className="space-y-4">
        {/* 🧮 Exam Countdown Toggles */}
        <SettingToggle
          title="JEE Main Countdown – January Attempt"
          description="Show a widget that displays the countdown to the JEE Main (January) exam."
          checked={settings.show_jeeMainJanCountdown}
          onChange={() => toggleSetting("show_jeeMainJanCountdown")}
        />

        <SettingToggle
          title="JEE Main Countdown – April Attempt"
          description="Show a widget that displays the countdown to the JEE Main (April) exam."
          checked={settings.show_jeeMainAprilCountdown}
          onChange={() => toggleSetting("show_jeeMainAprilCountdown")}
        />

        <SettingToggle
          title="JEE Advanced Countdown"
          description="Show a widget that displays the countdown to the JEE Advanced exam."
          checked={settings.show_JeeAdvCountdown}
          onChange={() => toggleSetting("show_JeeAdvCountdown")}
        />

        <SettingToggle
          title="NEET Countdown"
          description="Show a widget that displays the countdown to the NEET exam."
          checked={settings.show_NeetAdvCountdown}
          onChange={() => toggleSetting("show_NeetAdvCountdown")}
        />

        <SettingToggle
          title="Study Tracker"
          description="Show a widget that displays a Study Tracker Where it will give you all the revison dates using x2 revision method."
          checked={settings.show_studyTracker}
          onChange={() => toggleSetting("show_studyTracker")}
        />


      </div>

      {showRefreshPopup && <div className="w-full h-12 bottom-12 sticky bg-[#2e2e2e] rounded-lg flex items-center px-2 justify-between">
        <p className="text-sm text-gray-400">⚙️ You’ve enabled a setting that needs a quick refresh to apply properly.</p>
        <button className="px-6 py-2 text-sm bg-[#242323b3] rounded-md hover:bg-[#1818188b] transition" onClick={() => window.location.reload()}>Refresh Now</button>
      </div>}
    </div>
  );
};

export default StudySections