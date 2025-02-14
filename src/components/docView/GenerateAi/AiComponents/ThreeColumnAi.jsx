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

const DEFAULT_CARD = {
  image: null,
  heading: "Heading",
  headingStyles: {},
  description: "Description",
  descriptionStyles: {},
  headingId: "",
  descriptionId: ""
};

const generateDefaultCards = () => {
  return Array(3).fill(null).map((_, index) => ({
    ...DEFAULT_CARD,
    heading: `Heading ${index + 1}`,
    description: `Description ${index + 1}`,
    headingId: `heading-${Date.now()}-${index + 1}`,
    descriptionId: `desc-${Date.now()}-${index + 1}`
  }));
};

const ThreeImgTextAi = ({ generateAi = {}, ...props }) => {
  const [state, setState] = useState({
    title: generateAi.titleContainer?.title || "Untitled Card",
    titleStyles: generateAi.titleContainer?.styles || {},
    isDeleted: false,
    replacedTemplate: null,
    droppedItems: []
  });

  const slideId = generateAi.id

  const COMPONENT_MAP = {
    title: TitleAi,
    paragraph: ParagraphAi,
    heading: Heading,
  }

  const [cards, setCards] = useState(() => {
    if (generateAi.cards?.length) {
      return generateAi.cards.map(card => ({
        image: card.image || null,
        heading: card.headingContainer?.heading || "Heading",
        headingStyles: card.headingContainer?.styles || {},
        description: card.descriptionContainer?.description || "Description",
        descriptionStyles: card.descriptionContainer?.styles || {},
        headingId: card.headingContainer?.headingId || `heading-${Date.now()}-${Math.random()}`,
        descriptionId: card.descriptionContainer?.descriptionId || `desc-${Date.now()}-${Math.random()}`
      }));
    }
    return generateDefaultCards();
  });

  //const { draggedElement } = useContext(DragContext);

  const updateParent = (updates = {}) => {
    const updatedData = {
      ...generateAi,
      titleContainer: {
        ...generateAi.titleContainer,
        title: state.title,
        styles: state.titleStyles,
      },
      cards: cards.map(card => ({
        image: card.image,
        headingContainer: {
          heading: card.heading,
          styles: card.headingStyles,
          headingId: card.headingId,
        },
        descriptionContainer: {
          description: card.description,
          styles: card.descriptionStyles,
          descriptionId: card.descriptionId,
        },
      })),
      ...updates,
    };

    generateAi.onEdit?.(updatedData);
  };

  const updateGenerateAiJson = (slideId, inputId, newData) => {
    if (!slideId || !inputId) {
      console.error("slideId and inputId are required to update JSON.");
      return;
    }

    const currentSlideId = String(slideId);
    const currentInputId = String(inputId);

    if (String(generateAi.id) === currentSlideId) {
      if (String(generateAi.titleContainer?.titleId) === currentInputId) {
        setState(prev => ({
          ...prev,
          title: newData.title || newData.content,
          titleStyles: newData.styles
        }));
        return;
      }

      const cardIndex = cards.findIndex(card => 
        String(card.headingId) === currentInputId || 
        String(card.descriptionId) === currentInputId
      );

      if (cardIndex !== -1) {
        const isHeading = String(cards[cardIndex].headingId) === currentInputId;
        const updatedCards = [...cards];
        
        updatedCards[cardIndex] = {
          ...updatedCards[cardIndex],
          ...(isHeading 
            ? { 
                heading: newData.heading || newData.content,
                headingStyles: newData.styles,
              }
            : {
                description: newData.description || newData.content,
                descriptionStyles: newData.styles,
              }
          )
        };
        
        setCards(updatedCards);
      }
    }
  };

  const handleImagePreview = (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCards(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], image: reader.result };
        return updated;
      });
    };
    reader.readAsDataURL(file);
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

  const handleDelete = () => {
    setState(prev => ({ ...prev, isDeleted: true }));
    generateAi.onDelete?.(generateAi.id);
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

  if (state.isDeleted) return null;
  if (state.replacedTemplate) return <div>{state.replacedTemplate}</div>;

  return (
    <Card
      className="min-h-screen w-full md:min-h-[25vw] my-8 bg-[#342c4e] relative overflow-visible max-w-4xl mx-auto px-3 py-3 outline-none border-none"
      onDragOver={(e) => e.preventDefault()}
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

      <div className="mt-16 space-y-6">
        <TitleAi
          initialData={state.title}
          initialStyles={state.titleStyles}
          onUpdate={(newTitle, styles) => {
            setState(prev => ({ ...prev, title: newTitle, titleStyles: styles }));
            updateGenerateAiJson(generateAi.id, generateAi.titleContainer?.titleId, {
              title: newTitle,
              styles
            });
          }}
          slideId={generateAi.id}
          inputId={generateAi.titleContainer?.titleId}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-10">
          {cards.map((card, index) => (
            <div
              key={card.headingId}
              className="flex flex-col bg-[#2a2438] rounded-lg p-4 shadow-lg"
            >
              <div className="relative w-full h-40 bg-[#342c4e] rounded-lg overflow-hidden group mb-4 flex items-center justify-center">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={`Card ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center text-[#9d8ba7] text-sm">
                    <svg
                      className="w-8 h-8 mb-2"
                      viewBox="0 0 512 512"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="currentColor"
                        d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h96 32H424c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"
                      />
                    </svg>
                    <span>Click to Upload</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleImagePreview(e, index)}
                />
              </div>

              <Heading
                initialData={card.heading}
                initialStyles={card.headingStyles}
                onUpdate={(newHeading, newStyles) => {
                  updateGenerateAiJson(generateAi.id, card.headingId, {
                    heading: newHeading,
                    styles: newStyles
                  });
                }}
                slideId={generateAi.id}
                inputId={card.headingId}
              />
              
              <ParagraphAi
                initialData={card.description}
                initialStyles={card.descriptionStyles}
                onUpdate={(newDescription, newStyles) => {
                  updateGenerateAiJson(generateAi.id, card.descriptionId, {
                    description: newDescription,
                    styles: newStyles
                  });
                }}
                slideId={generateAi.id}
                inputId={card.descriptionId}
              />
            </div>
          ))}
        </div>
      </div>

       <div className="mt-8">
          {renderDroppedItems()}
        </div>
    </Card>
  );
};

export default ThreeImgTextAi;