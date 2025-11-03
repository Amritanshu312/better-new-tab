import Background from "./components/Background";
import AppBars from "./components/AppsBar";
import Images_Pdf_dumper from "./components/Images_Pdf_dumper";
import { useState } from "react";
import Settings from "./components/Settings/Settings";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomizationIcon from "./components/appicons/CustomizationIcon";
import LockIcon from "./components/appicons/LockIcon";

function App() {
  const [locked, setLocked] = useState(true);
  const [isCustomizationState, setIsCustomizationState] = useState(false);

  return (
    <>
      <Background />
      <div className="h-screen w-full bg-cover bg-center flex flex-col items-center justify-start p-6">
        <AppBars isCustomizationState={isCustomizationState} />
        <Images_Pdf_dumper locked={locked} setLocked={setLocked} />
        <Settings locked={locked} />
        <CustomizationIcon
          locked={locked}
          setIsCustomizationState={setIsCustomizationState}
          isCustomizationState={isCustomizationState}
        />
        <LockIcon locked={locked} setLocked={setLocked} />
      </div>

      <ToastContainer draggable theme="dark" />
    </>
  );
}

export default App;
