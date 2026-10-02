import * as React from "react";
import KanbanDropdown from "../dropdown/Dropdown";
import { BoardContext } from "../../context/board-context";
import { useContext, useMemo } from "react";
import { getStrings } from "../../lib/strings";

const CommandBar = () => {
  const { views, activeView, setActiveView, locale } = useContext(BoardContext);

  return ( 
    <div className="kanban-commandar-bar">
      <KanbanDropdown 
        key="view-dropdown" 
        label={getStrings(locale).viewByLabel}
        options={views} 
        selectedOption={activeView}
        onOptionSelected={setActiveView}/>
    </div>
  );
}

export default CommandBar;
