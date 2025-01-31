import React, { useState, useContext, useCallback } from "react";
import TitleInput from "./CardComponents/TitleInput";
import ParagraphInput from "./CardComponents/ParagraphInput";
import { CardMenu } from "./Menu/CardMenu";
import AddButton from "./AddButton";
import { DragContext } from "@/components/SidebarLeft/DragContext";
import CardTemplateImgHeadingThree from "./CardTemplateImgHeadingThree";
import ImageCardText from "./ImageCardText";

function CardTemplateTwoColumn({
  setSlidesPreview,
  slidesPreview,
  id,
  setSlides,
  children,
  ...props
}) {
  const [replacedTemplate, setReplacedTemplate] = useState(null); // Track replaced template
  const [droppedItems, setDroppedItems] = useState([]);
  const { draggedElement } = useContext(DragContext);
  
  const handleDrop = (event) => {
    event.preventDefault();
    if (draggedElement?.template && draggedElement.type === "CardTemplate") {
      setReplacedTemplate(draggedElement.template); // Set the dropped template
    } else if (draggedElement?.template) {
      const newElement = {
        id: Date.now(),
        content: draggedElement.template,
      };
      setDroppedItems((prev) => [...prev, newElement]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDeleteDroppedItem = (id) => {
    setDroppedItems((prev) => prev.filter((item) => item.id !== id));
  };


  const handleEdit = () => {
    console.log("Edit clicked");
  };

  const handleDelete = useCallback(() => {
    setSlides((prevSlides) => prevSlides.filter((slide) => slide.id !== id));
    
    setSlidesPreview((prevSlidesPreview) => prevSlidesPreview.filter((slide) => slide.id !== id));

  }, [id, setSlides]);

  const handleDuplicate = () => {
    console.log("Duplicate clicked");
  };

  const handleShare = () => {
    console.log("Share clicked");
  };

  const handleDownload = () => {
    console.log("Download clicked");
  };

  // If a new template is dropped, render it instead
  if (replacedTemplate) {
    return <div>{replacedTemplate}</div>;
  }

  return (
    <div className="flex flex-col items-center ">
      <div
        className="min-h-screen w-full md:w-[60vw] md:min-h-[25vw] md:mt-[3vh] md:mb-[3vh] rounded-lg bg-[#342c4e] p-6 relative"
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

        <div className="mt-16 space-y-6">
          <TitleInput />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <ParagraphInput
                  placeholder="Start typing the first paragraph..."
                  className="h-full min-h-[30px] bg-[#2a2438] text-[#9d8ba7] border border-[#3a3347] hover:border-[#4a4357] focus:border-[#4a4357] rounded-lg p-4 transition-colors"
                />
              </div>
              <div className="w-full">
                <ParagraphInput placeholder="Start typing the second paragraph..." />
              </div>
            </div>
          {/* {currentTemplate === "ImageText" && <ImageCardText />}
          {currentTemplate === "ThreeColumn" && <CardTemplateImgHeadingThree />} */}
        </div>
        {droppedItems.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {droppedItems.map((item) => (
                      <div key={item.id} className="relative">
                        {React.cloneElement(item.content, {
                          onDelete: () => handleDeleteDroppedItem(item.id),
                        })}
                      </div>
                    ))}
                  </div>
                )}
      </div>
      
    </div>
  );
}

export default CardTemplateTwoColumn;
