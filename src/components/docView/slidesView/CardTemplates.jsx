import React, { useContext, useState, useCallback } from "react";
import { Card } from "../../ui/card";
import { Grid2X2, Sparkles } from 'lucide-react';
import CardTemplateTwoColumn from "./CardTempletTwoColumn";
import CardTemplateImgHeadingThree from "./CardTemplateImgHeadingThree";
import ImageCardText from "./ImageCardText";
import { CardMenu } from "./Menu/CardMenu";
import card1 from "./assets/card1.png";
import card2 from "./assets/card2.png";
import card3 from "./assets/card3.png";
import card4 from "./assets/card4.png";
import { DragContext } from "@/components/SidebarLeft/DragContext";
import AccentImage from "./AccentImage";
import TitleAi from "../GenerateAi/AiComponents/TitleAi";
import TitleINput from "./CardComponents/TitleInput";

export default function CardTemplates({ children, slidesPreview, setSlidesPreview, id, setCurrentSlide, generateAi = {}, setSlides, ...props }) {
  const [showTwoColumn, setShowTwoColumn] = useState(false);
  const [showImageText, setShowImageText] = useState(false);
  const [title, setTitle] = useState(generateAi.title || "Untitled Card");
  const [showThreeColumn, setShowThreeColumn] = useState(false);
  const [showAccentImage, setShowAccentImage] = useState(false);
  const [replacedTemplate, setReplacedTemplate] = useState(null);
  const [droppedItems, setDroppedItems] = useState([]);
  const { draggedElement } = useContext(DragContext);
    
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    if (draggedElement?.template && draggedElement.type === "CardTemplate") {
      setReplacedTemplate(draggedElement.template);
    } else if (draggedElement?.template) {
      const newElement = {
        id: Date.now(),
        content: draggedElement.template,
      };
      setDroppedItems((prev) => [...prev, newElement]);
    }
  }, [draggedElement]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDeleteDroppedItem = useCallback((id) => {
    setDroppedItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleEdit = useCallback(() => {
    console.log("Edit clicked");
  }, []);

  const handleDelete = useCallback(() => {
    setSlides((prevSlides) => prevSlides.filter((slide) => slide.id !== id));
    setSlidesPreview((prevSlidesPreview) => prevSlidesPreview.filter((slide) => slide.id !== id));
  }, [id, setSlides]);

  const handleDuplicate = useCallback(() => {
    console.log("Duplicate clicked");
  }, []);

  const handleShare = useCallback(() => {
    console.log("Share clicked");
  }, []);

  const handleDownload = useCallback(() => {
    console.log("Download clicked");
  }, []);

  const updateSlidesPreview = useCallback((Component) => {
    setSlidesPreview((slidesPreview) =>
      slidesPreview.map((slide) => {
        if (slide.id === id) {
          return {
            ...slide,
            content: (
              <div className="flex justify-center">
                <Component
                  slidesPreview={slidesPreview}
                  setSlides={setSlides}
                  id={slide.id} // Pass id explicitly
                  setSlidesPreview={setSlidesPreview}
                />
              </div>
            ),
            onClick: () => setCurrentSlide(slide.id),
          };
        }
        return slide;
      })
    );
  }, [id, setCurrentSlide, setSlides, setSlidesPreview]);
  
  if (showTwoColumn) {
    updateSlidesPreview(CardTemplateTwoColumn);
    return <CardTemplateTwoColumn 
      id={id} // Pass id explicitly
      slidesPreview={slidesPreview}
      setSlidesPreview={setSlidesPreview}
      setSlides={setSlides}
    />;
  }

  if (showImageText) {
    updateSlidesPreview(ImageCardText);
    return <ImageCardText
      id={id} // Pass id explicitly
      slidesPreview={slidesPreview}
      setSlidesPreview={setSlidesPreview}
      setSlides={setSlides}
    />;
  }

  if (showAccentImage) {
    updateSlidesPreview(AccentImage);
    return <AccentImage 
      id={id} // Pass id explicitly
      slidesPreview={slidesPreview}
      setSlidesPreview={setSlidesPreview}
      setSlides={setSlides}
    />;
  }

  if (showThreeColumn) {
    updateSlidesPreview(CardTemplateImgHeadingThree);
    return <CardTemplateImgHeadingThree 
      id={id} // Pass id explicitly
      slidesPreview={slidesPreview}
      setSlidesPreview={setSlidesPreview}
      setSlides={setSlides}
    />;
  }

  if (replacedTemplate) {
    return <div>{replacedTemplate}</div>;
  }

  return (
    <div onDragOver={handleDragOver} onDrop={handleDrop} >
      <div className="min-h-screen w-full md:w-[60vw] md:min-h-[25vw] md:mt-[3vh] md:mb-[3vh] rounded-lg px-1 bg-[#342c4e] p-6 relative">
        <div className="absolute top-4 left-11">
          <CardMenu
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onShare={handleShare}
            onDownload={handleDownload}
          />
        </div>
        <div className="mt-10">
          <TitleINput initialData={title} onUpdate={(newTitle) => setTitle(newTitle)} />
        </div>
        {droppedItems.length > 0 ? (
          <div className="mt-6 space-y-4">
            {droppedItems.map((item) => (
              <div key={item.id} className="relative">
                {React.cloneElement(item.content, {
                  onDelete: () => handleDeleteDroppedItem(item.id),
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-[#9d8ba7] text-lg px-10">
              Or start with a template
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-10">
              <Card
                className="p-4 bg-[#2a2438] border-[#3a3347] hover:border-[#4a4357] cursor-pointer transition-colors relative group"
                onClick={() => setShowImageText(true)}
              >
                <div className="h-24 flex items-center justify-center overflow-hidden">
                  <img
                    src={card1 || "/placeholder.svg"}
                    alt="Image And text"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                    <p className="text-white text-sm font-medium">
                      Image and Text
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className="p-4 bg-[#2a2438] border-[#3a3347] hover:border-[#4a4357] cursor-pointer transition-colors relative group"
                onClick={() => setShowTwoColumn(true)}
              >
                <div className="h-24 flex items-center justify-center overflow-hidden">
                  <img
                    src={card2 || "/placeholder.svg"}
                    alt="Two Column"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                    <p className="text-white text-sm font-medium">
                      Two Columns
                    </p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 bg-[#2a2438] border-[#3a3347] hover:border-[#4a4357] cursor-pointer transition-colors relative group"
                onClick={() => setShowAccentImage(true)}
              >
                <div className="h-24 flex items-center justify-center overflow-hidden">
                  <img
                    src={card3 || "/placeholder.svg"}
                    alt="Accent right"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                    <p className="text-white text-sm font-medium">
                      Accent right
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className="p-4 bg-[#2a2438] border-[#3a3347] hover:border-[#4a4357] cursor-pointer transition-colors relative group"
                onClick={() => setShowThreeColumn(true)}
              >
                <div className="h-24 flex items-center justify-center overflow-hidden">
                  <img
                    src={card4 || "/placeholder.svg"}
                    alt="3 Image Column"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                    <p className="text-white text-sm font-medium">
                      3 Image Column
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-[#2a2438] border-[#3a3347] hover:border-[#4a4357] cursor-pointer transition-colors">
                <div className="h-24 flex flex-col items-center justify-center gap-2">
                  <Grid2X2 className="w-6 h-6 text-[#9d8ba7]" />
                  <span className="text-[#9d8ba7] text-sm">Templates</span>
                </div>
              </Card>

              <Card className="p-4 bg-[#2a2438] border-[#3a3347] hover:border-[#4a4357] cursor-pointer transition-colors">
                <div className="h-24 flex flex-col items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#9d8ba7]" />
                  <span className="text-[#9d8ba7] text-sm">Generate</span>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
