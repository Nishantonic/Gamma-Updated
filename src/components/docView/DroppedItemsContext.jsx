// DroppedItemsContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

export const DroppedItemsContext = createContext();

export const DroppedItemsProvider = ({ children }) => {
  const [droppedItems, setDroppedItems] = useState(() => {
    const saved = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('droppedItems') || '{}') 
      : {};
    return saved;
  });

  const saveToStorage = (items) => {
    localStorage.setItem('droppedItems', JSON.stringify(items));
  };

  const addDroppedItem = (slideId, item) => {
    setDroppedItems((prev) => {
      const newItems = {
        ...prev,
        [slideId]: [...(prev[slideId] || []), item], // Add the new item to the slide
      };
  
      // Save to local storage
      localStorage.setItem("droppedItems", JSON.stringify(newItems));
      return newItems;
    });
  };

  const updateDroppedItem = (slideId, itemId, updates) => {
    console.log("Updating dropped item:", { slideId, itemId, updates });
    setDroppedItems((prev) => {
      const updatedItems = {
        ...prev,
        [slideId]: prev[slideId].map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      };
  
      // Save to local storage
      localStorage.setItem("droppedItems", JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  useEffect(() => {
    console.log("Dropped Items:", droppedItems);
  }, [droppedItems]);

  const removeDroppedItem = (slideId, itemId) => {
    setDroppedItems(prev => {
      const newItems = {
        ...prev,
        [slideId]: (prev[slideId] || []).filter(item => item.id !== itemId)
      };
      saveToStorage(newItems);
      return newItems;
    });
  };

  return (
    <DroppedItemsContext.Provider
  value={{ droppedItems, addDroppedItem, removeDroppedItem, updateDroppedItem }}
>
  {children}
</DroppedItemsContext.Provider>
  );
};

export const useDroppedItems = () => useContext(DroppedItemsContext);