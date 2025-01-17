import React, { useState, useEffect, useContext } from "react";
import { CardMenu } from "../../slidesView/Menu/CardMenu";
import { DragContext } from "@/components/SidebarLeft/DragContext";
import TitleAi from "./TitleAi.jsx";
import ParagraphAi from "./ParagraphAi.jsx";

function CardTemplateTwoColumn({ generateAi = {}, ...props }) {
  const [title, setTitle] = useState(generateAi.title || "Untitled Card");
  const [columns, setColumns] = useState(generateAi.columns || [{ content: "" }, { content: "" }]);
  const { draggedElement } = useContext(DragContext);
  const [replacedTemplate, setReplacedTemplate] = useState(null);
  const [droppedItems, setDroppedItems] = useState([]);
  const [preview, setPreview] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 300, height: 210 });
  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [description1, setDescription1] = useState(generateAi.description1 || "Start typing the first paragraph...");
  const [description2, setDescription2] = useState(generateAi.description2 || "Start typing the second paragraph...");


  useEffect(() => {
    if (generateAi.image && isValidImageUrl(generateAi.image)) {
      setPreview(generateAi.image);
    }
  }, [generateAi.image]);

  const isValidImageUrl = (url) => {
    return url && url.match(/\.(jpeg|jpg|gif|png)$/) != null;
  };

  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setInitialSize({ width: imageSize.width, height: imageSize.height });
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const dx = e.clientX - initialMousePos.x;
      const dy = e.clientY - initialMousePos.y;

      setImageSize({
        width: Math.max(initialSize.width + dx, 100),
        height: Math.max(initialSize.height + dy, 100),
      });
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (draggedElement?.template && draggedElement.type === "CardTemplate") {
      setReplacedTemplate(draggedElement.template);
    } else if (draggedElement?.template) {
      setDroppedItems([...droppedItems, draggedElement.template]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleEdit = () => console.log("Edit clicked");
  const handleDelete = () => console.log("Delete clicked");
  const handleDuplicate = () => console.log("Duplicate clicked");
  const handleShare = () => console.log("Share clicked");
  const handleDownload = () => console.log("Download clicked");

  if (replacedTemplate) {
    return <div>{replacedTemplate}</div>;
  }

  return (
    <div
      className="min-h-screen w-full md:w-[60vw] md:min-h-[25vw] md:mt-[3vh] md:mb-[3vh] rounded-lg px-1 bg-[#342c4e] p-6 relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="absolute top-4 left-11">
        <CardMenu
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onShare={handleShare}
          onDownload={handleDownload}
        />
      </div>

      <div className="flex flex-col gap-8 mt-16">
        <TitleAi
          initialData={title}
          onUpdate={(newTitle) => setTitle(newTitle)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {columns.map((column, index) => (
            <ParagraphAi
              key={index}
              initialData={column.content}
              onUpdate={(newContent) => {
                const newColumns = [...columns];
                newColumns[index] = { ...newColumns[index], content: newContent };
                setColumns(newColumns);
              }}
            />
          ))}
        </div>
      </div>

      {droppedItems.length > 0 && (
        <div className="mt-6 space-y-4">
          {droppedItems.map((item, index) => (
            <div key={index} className="mb-4">
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CardTemplateTwoColumn;

