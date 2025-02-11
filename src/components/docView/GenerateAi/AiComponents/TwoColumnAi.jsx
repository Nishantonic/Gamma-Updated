import React, { useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { CardMenu } from "../../slidesView/Menu/CardMenu";
import { DragContext } from "@/components/SidebarLeft/DragContext";
import TitleAi from "./TitleAi.jsx";
import ParagraphAi from "./ParagraphAi.jsx";
import { Card } from "@/components/ui/card";

function CardTemplateTwoColumn({ generateAi = {}, ...props }) {
  const [title, setTitle] = useState(generateAi.titleContainer?.title || "Untitled Card");
  const [titleStyles, setTitleStyles] = useState(generateAi.titleContainer?.styles || {});
  const [isDeleted, setIsDeleted] = useState(false);
  
  const [columns, setColumns] = useState(
    generateAi.columns?.map(col => ({
      content: col.content || "",
      styles: col.styles || {},
      columnId: col.columnId || uuidv4()
    })) || [
      { content: "", styles: {}, columnId: uuidv4() },
      { content: "", styles: {}, columnId: uuidv4() }
    ]
  );
  
  const { draggedElement } = useContext(DragContext);
  const [droppedItems, setDroppedItems] = useState([]);

  const updateParent = (updates) => {
    const updatedData = {
      ...generateAi,
      titleContainer: {
        ...generateAi.titleContainer,
        title: title,
        styles: titleStyles,
      },
      columns: columns.map((col, index) => ({
        ...col,
        contentId: col.columnId,
      })),
      ...updates,
    };

    if (generateAi.onEdit) {
      generateAi.onEdit(updatedData);
    }
  };

  useEffect(() => {
    updateParent({
      titleContainer: { styles: titleStyles },
      columns: columns
    });
  }, [titleStyles, columns]);

  const updateGenerateAiJson = (slideId, inputId, newData) => {
    if (!slideId || !inputId) {
      console.error("slideId and inputId are required to update JSON.");
      return;
    }

    const updatedJson = { ...generateAi };
    const currentSlideId = String(slideId);
    const currentInputId = String(inputId);

    if (String(updatedJson.id) === currentSlideId) {
      if (String(updatedJson.titleContainer?.titleId) === currentInputId) {
        updatedJson.titleContainer = {
          ...updatedJson.titleContainer,
          ...newData,
        };
      } else {
        const columnIndex = updatedJson.columns.findIndex(
          col => String(col.contentId) === currentInputId
        );
        if (columnIndex !== -1) {
          updatedJson.columns[columnIndex] = {
            ...updatedJson.columns[columnIndex],
            ...newData,
          };
        }
      }
    }

    if (generateAi.onEdit) {
      generateAi.onEdit(updatedJson);
    }
  };

  const handleTitleUpdate = (newTitle, styles) => {
    setTitle(newTitle);
    setTitleStyles(styles);
    const titleId = generateAi.titleContainer?.titleId;
    updateGenerateAiJson(generateAi.id, titleId, {
      title: newTitle,
      styles: styles
    });
  };

  const handleColumnUpdate = (index, newContent, newStyles) => {
    setColumns(prevColumns => {
      const newColumns = prevColumns.map((col, i) =>
        i === index ? { ...col, content: newContent, styles: newStyles } : col
      );
      
      const columnId = columns[index].columnId;
      updateGenerateAiJson(generateAi.id, columnId, {
        content: newContent,
        styles: newStyles
      });

      return newColumns;
    });
  };

  const handleDeleteDroppedItem = (id) => {
    setDroppedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (draggedElement?.template) {
      const newItem = {
        id: Date.now(),
        content: draggedElement.template,
      };
      setDroppedItems((prev) => [...prev, newItem]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDelete = () => {
    setIsDeleted(true);
    if (generateAi.onDelete) {
      generateAi.onDelete(generateAi.id);
    }
  };

  if (isDeleted) {
    return null;
  }

  return (
    <Card
      className="min-h-screen w-full md:min-h-[25vw] my-8 bg-[#342c4e] relative overflow-visible max-w-4xl mx-auto px-3 py-3 outline-none border-none"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="absolute top-4 left-11">
        <CardMenu
          onEdit={() => console.log("Edit clicked")}
          onDelete={handleDelete}
          onDuplicate={() => console.log("Duplicate clicked")}
          onShare={() => console.log("Share clicked")}
          onDownload={() => console.log("Download clicked")}
        />
      </div>

      <div className="flex flex-col gap-8 mt-16">
        <TitleAi
          initialData={title}
          initialStyles={titleStyles}
          onUpdate={handleTitleUpdate}
          slideId={generateAi.id}
          inputId={generateAi.titleContainer?.titleId}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {columns.map((column, index) => (
            <ParagraphAi
              key={column.columnId}
              initialData={column.content}
              initialStyles={column.styles}
              onUpdate={(newContent, newStyles) => 
                handleColumnUpdate(index, newContent, newStyles)
              }
              slideId={generateAi.id}
              inputId={column.columnId}
            />
          ))}
        </div>
      </div>

      {droppedItems.length > 0 && (
        <div className="mt-6 space-y-4">
          {droppedItems.map((item) => (
            <div key={item.id} className="relative bg-[#2a2438] p-4 rounded-lg shadow-md">
              {React.cloneElement(item.content, {
                onDelete: () => handleDeleteDroppedItem(item.id),
              })}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default CardTemplateTwoColumn;