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
        type: 'customElement'
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
    // Update main slides state
    setSlides((prevSlides) => {
      const updatedSlides = prevSlides.filter((slide) => slide.id !== id);
      localStorage.setItem('slides', JSON.stringify(updatedSlides));
      return updatedSlides;
    });

    // Update slides preview
    setSlidesPreview((prevSlidesPreview) => {
      const updatedPreview = prevSlidesPreview.filter((slide) => slide.id !== id);
      return updatedPreview.map((slide, index) => ({
        ...slide,
        number: index + 1
      }));
    });
  }, [id, setSlides, setSlidesPreview]);

  const updateSlidesPreview = useCallback((Component, templateType) => {
    setSlidesPreview((prevSlidesPreview) =>
      prevSlidesPreview.map((slide) => {
        if (slide.id === id) {
          const updatedSlide = {
            ...slide,
            type: templateType,
            content: (
              <div className="flex justify-center">
                <Component
                  {...props}
                  slidesPreview={prevSlidesPreview}
                  setSlides={setSlides}
                  id={slide.id}
                  setSlidesPreview={setSlidesPreview}
                />
              </div>
            ),
            onClick: () => setCurrentSlide(slide.id)
          };

          // Update main slides state with type
          setSlides(prevSlides => 
            prevSlides.map(s => 
              s.id === id ? {...s, type: templateType} : s
            )
          );

          return updatedSlide;
        }
        return slide;
      })
    );
  }, [id, setCurrentSlide, setSlides, setSlidesPreview, props]);

  // Template handlers with type management
  const handleTwoColumn = useCallback(() => {
    setShowTwoColumn(true);
    updateSlidesPreview(CardTemplateTwoColumn, 'twoColumnManual');
  }, [updateSlidesPreview]);

  const handleImageText = useCallback(() => {
    setShowImageText(true);
    updateSlidesPreview(ImageCardText, 'imageTextManual');
  }, [updateSlidesPreview]);

  const handleAccentImage = useCallback(() => {
    setShowAccentImage(true);
    updateSlidesPreview(AccentImage, 'accentImageManual');
  }, [updateSlidesPreview]);

  const handleThreeColumn = useCallback(() => {
    setShowThreeColumn(true);
    updateSlidesPreview(CardTemplateImgHeadingThree, 'threeColumnManual');
  }, [updateSlidesPreview]);

  if (showTwoColumn) {
    return <CardTemplateTwoColumn 
      {...props}
      id={id}
      slidesPreview={slidesPreview}
      setSlidesPreview={setSlidesPreview}
      setSlides={setSlides}
    />;
  }

  if (showImageText) {
    return <ImageCardText
      {...props}
      id={id}
      slidesPreview={slidesPreview}
      setSlidesPreview={setSlidesPreview}
      setSlides={setSlides}
    />;
  }

  if (showAccentImage) {
    console.log("AccentImage Clicked");
    
    return <AccentImage 
      {...props}
      type='accentImage'
      id={id}
      slidesPreview={slidesPreview}
      setSlidesPreview={setSlidesPreview}
      setSlides={setSlides}
    />;
  }

  if (showThreeColumn) {
    return <CardTemplateImgHeadingThree 
      {...props}
      id={id}
      slidesPreview={slidesPreview}
      setSlidesPreview={setSlidesPreview}
      setSlides={setSlides}
    />;
  }

  if (replacedTemplate) {
    return <div>{replacedTemplate}</div>;
  }
  const handleDuplicate = () =>{
    console.log("duplicate");
    
  }
  const handleShare = () =>{
    console.log("duplicate");
    
  }
  const handleDownload = () =>{
    console.log("duplicate");
    
  }

  return (
    <div onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className="min-h-screen w-full md:min-h-[25vw] md:mt-[3vh] md:mb-[3vh] rounded-lg px-1 bg-[#342c4e] p-6 relative max-w-4xl mx-auto">
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
          <TitleINput 
            initialData={title} 
            onUpdate={(newTitle) => {
              setTitle(newTitle);
              // Update title in slides state
              setSlides(prev => prev.map(slide => 
                slide.id === id ? {...slide, title: newTitle} : slide
              ));
            }}
          />
        </div>
        {droppedItems.length > 0 ? (
          <div className="mt-6 space-y-4">
            {droppedItems.map((item) => (
              <div key={item.id} className="relative">
                {React.cloneElement(item.content, {
                  onDelete: () => handleDeleteDroppedItem(item.id),
                  type: item.type
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
              {/* Updated template cards with type handling */}
              <Card
                className="p-4 bg-[#2a2438] border-[#3a3347] hover:border-[#4a4357] cursor-pointer transition-colors relative group"
                onClick={handleImageText}
              >
                <div className="h-24 flex items-center justify-center overflow-hidden">
                  <img
                    src={card1}
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
                onClick={handleTwoColumn}
              >
                <div className="h-24 flex items-center justify-center overflow-hidden">
                  <img
                    src={card2}
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
                onClick={handleAccentImage}
              >
                <div className="h-24 flex items-center justify-center overflow-hidden">
                  <img
                    src={card3}
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
                onClick={handleThreeColumn}
              >
                <div className="h-24 flex items-center justify-center overflow-hidden">
                  <img
                    src={card4}
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