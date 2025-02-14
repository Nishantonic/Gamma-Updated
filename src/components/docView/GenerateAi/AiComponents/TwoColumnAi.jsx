
import { useState, useEffect, useRef, useContext } from "react"
import { CardMenu } from "../../slidesView/Menu/CardMenu"
import ParagraphAi from "./ParagraphAi.jsx"
import { DragContext } from "@/components/SidebarLeft/DragContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Move } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import TitleAi from './TitleAi'
import Heading from "./Heading"

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
  
  const slideId = generateAi.id

  const COMPONENT_MAP = {
    title: TitleAi,
    paragraph: ParagraphAi,
    heading: Heading,
  }

  //const { draggedElement } = useContext(DragContext);
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

  const handleDrop = (event) => {
    event.preventDefault()
    const data = JSON.parse(event.dataTransfer.getData("application/json"))

    if (data.type) {
      const newItem = {
        id: uuidv4(),
        type: data.type,
        content: "",
        styles: {},
      }

      const updatedData = {
        ...generateAi,
        dropContainer: {
          dropItems: [...(generateAi.dropContainer?.dropItems || []), newItem]
        }
      }
      generateAi.onEdit?.(updatedData)
    }
  }

  const handleUpdateDroppedItem = (itemId, updates) => {
    const updatedItems = generateAi.dropContainer?.dropItems?.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ) || []

    generateAi.onEdit?.({
      ...generateAi,
      dropContainer: { dropItems: updatedItems }
    })
  }

  const handleDeleteDroppedItem = (itemId) => {
    const updatedItems = generateAi.dropContainer?.dropItems?.filter(item => item.id !== itemId) || []
    generateAi.onEdit?.({
      ...generateAi,
      dropContainer: { dropItems: updatedItems }
    })
  }

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDelete = () => {
    setIsDeleted(true);
    if (generateAi.onDelete) {
      generateAi.onDelete(generateAi.id);
    }
  };

  const renderDroppedItems = () => {
    return (generateAi.dropContainer?.dropItems || []).map((item) => {
      const Component = COMPONENT_MAP[item.type]
      if (!Component) return null

      return (
        <div key={item.id} className="mb-4 relative group">
          <Component
            slideId={slideId}
            inputId={item.id}
            initialData={item.content}
            initialStyles={item.styles}
            onUpdate={(value, styles) => {
              handleUpdateDroppedItem(item.id, { 
                content: value,
                styles: styles 
              })
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleDeleteDroppedItem(item.id)}
          >
            ×
          </Button>
        </div>
      )
    })
  }

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

      <div className="mt-8">
          {renderDroppedItems()}
        </div>
    </Card>
  );
}

export default CardTemplateTwoColumn;