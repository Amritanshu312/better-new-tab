import { useState } from "react"
import SettingsIcon from "./SettingsIcon"
import SettingsPopUp from "./SettingsPopUp"

const Settings = ({ locked }) => {
  const [isSettingsToggled, setIsSettingsToggled] = useState(false)

  return (
    <>
      {isSettingsToggled ?
        <SettingsPopUp
          isSettingsToggled={isSettingsToggled}
          setIsSettingsToggled={setIsSettingsToggled}
        /> : null}

      {/* settings icon for popup */}
      <SettingsIcon
        locked={locked}
        setIsSettingsToggled={setIsSettingsToggled}
      />
    </>
  )
}

export default Settings