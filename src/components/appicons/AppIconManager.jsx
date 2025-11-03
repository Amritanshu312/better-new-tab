import { useState } from "react"
import CustomizationIcon from "./CustomizationIcon"
import LockIcon from "./LockIcon"
import SettingsIcon from "./SettingsIcon"
import Settings from "../Settings/Settings"

const AppIconManager = ({
  locked,
  setIsCustomizationState,
  isCustomizationState,
  setLocked
}) => {

  const [isSettingsToggled, setIsSettingsToggled] = useState(false)


  return (
    <>
      <CustomizationIcon
        locked={locked}
        setIsCustomizationState={setIsCustomizationState}
        isCustomizationState={isCustomizationState}
      />

      <LockIcon locked={locked} setLocked={setLocked} />

      {/* settings icon for popup */}
      <SettingsIcon
        locked={locked}
        setIsSettingsToggled={setIsSettingsToggled}
      />

      {/* pop up settings when is setting toggled is enabled */}
      {isSettingsToggled ?
        <Settings
          isSettingsToggled={isSettingsToggled}
          setIsSettingsToggled={setIsSettingsToggled}
        /> : null}
    </>
  )
}

export default AppIconManager