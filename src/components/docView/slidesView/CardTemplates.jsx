import React, { useContext, useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "../../ui/card";
import { Grid2X2, Sparkles } from 'lucide-react';
import { DragContext } from "@/components/SidebarLeft/DragContext";
import { CardMenu } from "./Menu/CardMenu";
import TwoColumnAi from "../GenerateAi/AiComponents/TwoColumnAi";
import CardTemplateImgHeadingThree from "./CardTemplateImgHeadingThree";
import ImageCardText from "./ImageCardText";
import AccentImage from "./AccentImage";
import TitleAi from "../GenerateAi/AiComponents/TitleAi";
import card1 from "./assets/card1.png";
import card2 from "./assets/card2.png";
import card3 from "./assets/card3.png";
import card4 from "./assets/card4.png";
import { v4 as uuidv4 } from 'uuid';
import ImageTextAi from "../GenerateAi/AiComponents/ImageTextAi";
import AccentImageAi from "../GenerateAi/AiComponents/AccentImageAi";
import ThreeImgTextAi from "../GenerateAi/AiComponents/ThreeColumnAi";
import { useDroppedItems } from "../DroppedItemsContext";
import Heading from "../GenerateAi/AiComponents/Heading";
import ParagraphAi from "../GenerateAi/AiComponents/ParagraphAi";

export default function CardTemplates({ 
  children, 
  slidesPreview, 
  setSlidesPreview, 
  id, 
  setCurrentSlide, 
  generateAi = {}, 
  setSlides, 
  ...props 
}) {
  // Add dropped items context
  const { droppedItems, addDroppedItem, removeDroppedItem, updateDroppedItem } = useDroppedItems();
  const [showTwoColumn, setShowTwoColumn] = useState(false);
  const [showImageText, setShowImageText] = useState(false);
  const [showThreeColumn, setShowThreeColumn] = useState(false);
  const [showAccentImage, setShowAccentImage] = useState(false);
  const [replacedTemplate, setReplacedTemplate] = useState(null);
  const [title, setTitle] = useState(generateAi.titleContainer?.title || "Untitled Card");
  const [titleStyles, setTitleStyles] = useState(generateAi.titleContainer?.styles || {});
  const [isDeleted, setIsDeleted] = useState(false) // Added state for deletion
  const { draggedElement } = useContext(DragContext);
  const slideId = id || generateAi.id || uuidv4();

  const handleTemplateDrop = (templateType) => {
  switch (templateType) {
    case "imageText":
      handleImageText();
      break;
    case "twoColumn":
      handleTwoColumn();
      break;
    case "accentImage":
      handleAccentImage();
      break;
    case "threeImgCard":
      handleThreeColumn();
      break;
    default:
      break;
  }
};
  const handleDrop = (event) => {
  event.preventDefault();
  const dataStr = event.dataTransfer.getData("application/json");
  if (!dataStr) return;

  const data = JSON.parse(dataStr);

  if (data.type === "template") {
    handleTemplateDrop(data.templateType);
  } else if (data.type) {
    // Existing element drop logic
    const newItem = { /* ... */ };
    addDroppedItem(slideId, newItem);
    updateParentWithDroppedItems();
  }
};

  const handleDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
};

  const handleDeleteDroppedItem = (itemId) => {
    removeDroppedItem(slideId, itemId);
    updateParentWithDroppedItems();
  };

  const updateParentWithDroppedItems = () => {
    const updatedJson = {
      ...generateAi,
      droppedItems: droppedItems[slideId] || []
    };

    if (generateAi.onEdit) {
      generateAi.onEdit(updatedJson);
    }
  };

  useEffect(() => {
    if (generateAi.titleContainer) {
      setTitle(generateAi.titleContainer.title || "Untitled Card");
      setTitleStyles(generateAi.titleContainer.styles || {});
    }
    
    // Initialize dropped items from generateAi
    if (generateAi.droppedItems) {
      generateAi.droppedItems.forEach(item => {
        addDroppedItem(slideId, item);
      });
    }
  }, [generateAi.titleContainer, generateAi.droppedItems]);


  // Initialize titleContainer with proper IDs if not present
  useEffect(() => {
  const shouldInitialize = !generateAi.titleContainer?.titleId || !generateAi.id;
  
  if (shouldInitialize) {
    const updatedGenerateAi = {
      ...generateAi,
      id: id || generateAi.id || uuidv4(),
      titleContainer: {
        ...generateAi.titleContainer,
        titleId: generateAi.titleContainer?.titleId || uuidv4(),
        title: generateAi.titleContainer?.title || title,
        styles: generateAi.titleContainer?.styles || titleStyles
      }
    };
    
    if (generateAi.onEdit) {
      generateAi.onEdit(updatedGenerateAi);
    }
  }
}, [id, generateAi]);

  const updateGenerateAiJson = (slideId, inputId, newData) => {
  const updatedJson = {
    ...generateAi,
    id: slideId,
    titleContainer: {
      ...generateAi.titleContainer,
      titleId: inputId,
      ...newData
    }
  };

  if (generateAi.onEdit) {
    generateAi.onEdit(updatedJson);
  }
};

const handleTitleUpdate = (newTitle, styles) => {
  const titleId = generateAi.titleContainer?.titleId || uuidv4();
  const slideId = id || generateAi.id || uuidv4();
  
  // Update local state immediately
  setTitle(newTitle);
  setTitleStyles(styles);
  
  // Propagate changes to parent
  updateGenerateAiJson(slideId, titleId, {
    title: newTitle,
    styles: styles
  });
};

  const updateSlidesPreview = useCallback((Component, templateType) => {
  setSlidesPreview(prevSlidesPreview => 
    prevSlidesPreview.map(slide => {
      if (slide.id === (id || generateAi.id)) {
        const updatedSlide = {
          ...slide,
          type: templateType,
          titleContainer: {
            titleId: generateAi.titleContainer?.titleId || uuidv4(),
            title: title,
            styles: titleStyles
          },
          content: (
            <Component
              {...props}
              id={slide.id}
              generateAi={{
                ...generateAi,
                id: slide.id,
                titleContainer: {
                  titleId: generateAi.titleContainer?.titleId || uuidv4(),
                  title: title,
                  styles: titleStyles
                },
                imageContainer: {
                imageId: uuidv4(),
                image: slide.image || "",
                styles: {}
              },
              }}
            />
          )
        };

        // Update main slides state
        setSlides(prevSlides => 
          prevSlides.map(s => 
            s.id === updatedSlide.id ? updatedSlide : s
          )
        );

        return updatedSlide;
      }
      return slide;
    })
  );
}, [id, generateAi, title, titleStyles, setSlides, setSlidesPreview]);

  // Template handlers
  const handleTwoColumn = useCallback(() => {
    setShowTwoColumn(true);
    updateSlidesPreview(TwoColumnAi, 'twoColumn');
  }, [updateSlidesPreview]);

  const handleImageText = useCallback(() => {
    setShowImageText(true);
    updateSlidesPreview(ImageCardText, 'imageCardText');
  }, [updateSlidesPreview]);

  const handleAccentImage = useCallback(() => {
    setShowAccentImage(true);
    updateSlidesPreview(AccentImage, 'accentImage');
  }, [updateSlidesPreview]);

  const handleThreeColumn = useCallback(() => {
    setShowThreeColumn(true);
    updateSlidesPreview(CardTemplateImgHeadingThree, 'threeImgCard');
  }, [updateSlidesPreview]);

  const handleDelete = () => {
    setIsDeleted(true)
    if (generateAi.onDelete) {
      generateAi.onDelete(generateAi.id)
    }
  }

if (showTwoColumn) return <TwoColumnAi {...props} id={id} slidesPreview={slidesPreview} setSlidesPreview={setSlidesPreview} setSlides={setSlides} generateAi={generateAi} />;
if (showImageText) return <ImageTextAi {...props} id={id} slidesPreview={slidesPreview} setSlidesPreview={setSlidesPreview} setSlides={setSlides} generateAi={generateAi} />;
if (showAccentImage) return <AccentImageAi {...props} id={id} slidesPreview={slidesPreview} setSlidesPreview={setSlidesPreview} setSlides={setSlides} generateAi={generateAi} />;
if (showThreeColumn) return <ThreeImgTextAi {...props} id={id} slidesPreview={slidesPreview} setSlidesPreview={setSlidesPreview} setSlides={setSlides} generateAi={generateAi} />;
if (replacedTemplate) return <div>{replacedTemplate}</div>;

// Then check if deleted
if (isDeleted) {
  return null;
}

  return (
    <div>
      <Card onDragOver={handleDragOver} onDrop={handleDrop} className="min-h-screen w-full md:min-h-[25vw] md:mt-[3vh] md:mb-[3vh] rounded-lg px-1 bg-[#342c4e] p-6 relative max-w-4xl mx-auto">
        <div className="absolute top-4 left-11">
          <CardMenu
            onDelete={handleDelete}
          />
        </div>
        <CardContent>
          <div className="relative overflow-visible z-50 w-full   ">
            <TitleAi
              initialData={generateAi.titleContainer?.title || title}
              initialStyles={generateAi.titleContainer?.styles || titleStyles}
              onUpdate={handleTitleUpdate}
              slideId={id || generateAi.id}
              inputId={generateAi.titleContainer?.titleId}
              className="title text-3xl font-bold text-white mb-4 relative overflow-visible"
            />
            </div>
        </CardContent>
        {droppedItems[slideId]?.length > 0 ? (
        <div className="mt-6 space-y-4">
          {(droppedItems[slideId] || []).map((item) => {
            let Component;
            switch (item.type) {
              case "title":
                Component = TitleAi;
                break;
              case "heading":
                Component = Heading;
                break;
              case "paragraph":
                Component = ParagraphAi;
                break;
              default:
                return null;
            }

            return (
              <div key={item.id} className="relative">
                <Component
                  slideId={slideId}
                  inputId={item.id}
                  onChange={(value, styles) => {
                    updateDroppedItem(slideId, item.id, { 
                      ...item, 
                      content: value, 
                      styles 
                    });
                    updateParentWithDroppedItems();
                  }}
                  onDelete={() => handleDeleteDroppedItem(item.id)}
                />
              </div>
            );
          })}
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
      </Card>
    </div>
  );
}