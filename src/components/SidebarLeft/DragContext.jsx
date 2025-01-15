import React, { createContext, useState } from "react";

export const DragContext = createContext();

export const DragProvider = ({ children }) => {
  const [draggedElement, setDraggedElement] = useState(null);

  return (
    <DragContext.Provider value={{ draggedElement, setDraggedElement }}>
      {children}
    </DragContext.Provider>
  );
};
