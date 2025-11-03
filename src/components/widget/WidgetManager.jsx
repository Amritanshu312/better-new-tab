import { useGeneralSettings } from "../../context/GeneralSettings"
import AppBars from "./AppsBar"
import TimeDateCard from "./TimeDateCard"
import TodoList from "./TodoList"

const WidgetManager = ({
  isCustomizationState,
  locked
}) => {

  const { settings } = useGeneralSettings()
  return (
    <>
      <AppBars isCustomizationState={isCustomizationState} />
      <TimeDateCard isCustomizationState={isCustomizationState} />
      {settings.showTodoList ? <TodoList locked={locked} /> : null}
    </>
  )
}

export default WidgetManager