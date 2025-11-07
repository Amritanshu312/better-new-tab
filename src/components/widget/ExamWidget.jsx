import CountdownWidget from "./components/CountdownWidget";

export default function ExamWidgets({ isCustomizationState, settings }) {
  return (
    <>
      {settings.show_jeeMainJanCountdown ? (
        <CountdownWidget
          title="JEE Main – January Attempt"
          targetDate="2026-01-21T09:00:00"
          storageKey="jeeMainJan"
          isCustomizationState={isCustomizationState}
        />
      ) : null}

      {settings.show_jeeMainAprilCountdown ? (
        <CountdownWidget
          title="JEE Main – April Attempt"
          targetDate="2026-04-01T09:00:00"
          storageKey="jeeMainApril"
          isCustomizationState={isCustomizationState}
        />
      ) : null}

      {settings.show_JeeAdvCountdown ? (
        <CountdownWidget
          title="JEE Advanced"
          targetDate="2026-05-18T09:00:00"
          storageKey="jeeAdvanced"
          isCustomizationState={isCustomizationState}
        />
      ) : null}

      {settings.show_NeetAdvCountdown ? (
        <CountdownWidget
          title="NEET"
          targetDate="2026-05-05T09:00:00"
          storageKey="neet"
          isCustomizationState={isCustomizationState}
        />
      ) : null}
    </>
  );
}
