import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* 🌄 Components */
import Background from "./components/Background";
import Images_Pdf_dumper from "./components/Images_Pdf_dumper";
import Settings from "./components/Settings/Settings";
import AppBars from "./components/widget/AppsBar";
import TimeDateCard from "./components/widget/TimeDateCard";

/* 🧩 Icons */
import CustomizationIcon from "./components/appicons/CustomizationIcon";
import LockIcon from "./components/appicons/LockIcon";
import WidgetManager from "./components/widget/WidgetManager";
import AppIconManager from "./components/appicons/AppIconManager";

function App() {
  const [locked, setLocked] = useState(true);
  const [isCustomizationState, setIsCustomizationState] = useState(false);

  useEffect(() => {
    if (locked && isCustomizationState) {
      setIsCustomizationState(false);
    }
  }, [locked]);

  return (
    <>
      <Background />

      <div className="h-screen w-full bg-cover bg-center flex flex-col items-center justify-start p-6">
        <WidgetManager isCustomizationState={isCustomizationState} locked={locked} />
        <AppIconManager
          locked={locked}
          setLocked={setLocked}
          setIsCustomizationState={setIsCustomizationState}
          isCustomizationState={isCustomizationState}
        />

        <Images_Pdf_dumper locked={locked} setLocked={setLocked} />
        {/* <Settings locked={locked} /> */}
      </div>

      <ToastContainer draggable theme="dark" />
    </>
  );
}

export default App;
