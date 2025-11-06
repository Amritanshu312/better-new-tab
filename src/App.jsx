import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* 🌄 Components */
import Background from "./components/Background";
import Images_Pdf_dumper from "./components/Images_Pdf_dumper";

/* 🧩 Icons */
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

        {/* <Images_Pdf_dumper locked={locked} setLocked={setLocked} /> */}
      </div>

      <ToastContainer draggable theme="dark" />
    </>
  );
}

export default App;
