import Background from "./components/Background"
import AppBars from "./components/AppsBar"
import Images_dumper from "./components/Images_dumper"
import { useState } from "react";
import Settings from "./components/Settings/Settings";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [locked, setLocked] = useState(true);

  return (
    <>
      <Background />
      <div className="h-screen w-full bg-cover bg-center flex flex-col items-center justify-start p-6">
        <AppBars />
        <Images_dumper
          locked={locked}
          setLocked={setLocked}
        />
        <Settings
          locked={locked}
        />
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </>
  )
}

export default App
