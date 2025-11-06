import { useGeneralSettings } from "../../context/GeneralSettings";
import AppBars from "./AppsBar";
import ExamWidgets from "./exam/ExamWidget";
import StudyTracker from "./exam/StudyTracker";
import TimeDateCard from "./TimeDateCard";
import TodoList from "./TodoList";

const WidgetManager = ({ isCustomizationState, locked }) => {
  const { settings } = useGeneralSettings();
  return (
    <>
      {settings.showAppbar ? (
        <AppBars isCustomizationState={isCustomizationState} />
      ) : null}
      {settings.showTimeDate ? (
        <TimeDateCard isCustomizationState={isCustomizationState} />
      ) : null}

      {settings.showTodoList ? <TodoList locked={locked} /> : null}

      {settings.show_jeeMainJanCountdown ||
        settings.show_jeeMainAprilCountdown ||
        settings.show_JeeAdvCountdown ||
        settings.show_NeetAdvCountdown ? (
        <ExamWidgets
          isCustomizationState={isCustomizationState}
          settings={settings}
        />
      ) : null}

      <StudyTracker />
    </>
  );
};

export default WidgetManager;
