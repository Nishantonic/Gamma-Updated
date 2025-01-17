import React, { useState, useEffect, useContext } from "react";
import { CardMenu } from "../../slidesView/Menu/CardMenu";
import Heading from "./Heading";
import ParagraphAi from "./ParagraphAi.jsx";
import { DragContext } from "@/components/SidebarLeft/DragContext";

function ThreeImgTextAi({ generateAi = {}, ...props }) {
  const [title, setTitle] = useState(generateAi.title || "Untitled Card");
  const [cards, setCards] = useState(
    generateAi.cards || [
      { image: null, heading: "Heading 1", description: "Description 1" },
      { image: null, heading: "Heading 2", description: "Description 2" },
      { image: null, heading: "Heading 3", description: "Description 3" },
    ]
  );
  const [replacedTemplate, setReplacedTemplate] = useState(null);
  const [droppedItems, setDroppedItems] = useState([]);
  const { draggedElement } = useContext(DragContext);

  useEffect(() => {
    const updatedCards = cards.map((card, index) => {
      if (generateAi.cards && generateAi.cards[index] && generateAi.cards[index].image) {
        return { ...card, image: generateAi.cards[index].image };
      }
      return card;
    });
    setCards(updatedCards);
  }, [generateAi.cards]);

  const handleImagePreview = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const updatedCards = [...cards];
        updatedCards[index] = { ...updatedCards[index], image: reader.result };
        setCards(updatedCards);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => console.log("Edit clicked");
  const handleDelete = () => console.log("Delete clicked");
  const handleDuplicate = () => console.log("Duplicate clicked");
  const handleShare = () => console.log("Share clicked");
  const handleDownload = () => console.log("Download clicked");

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

  if (replacedTemplate) {
    return <div>{replacedTemplate}</div>;
  }

  return (
    <div
      className="min-h-screen w-full md:w-[60vw] md:min-h-[25vw] md:mt-[3vh] md:mb-[3vh] rounded-lg px-1 bg-[#342c4e] p-6 relative"
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
        <Heading
          initialData={title}
          onUpdate={(newTitle) => setTitle(newTitle)}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-10">
          {cards.map((card, index) => (
            <div
              key={index}
              className="flex flex-col bg-[#2a2438] rounded-lg p-4 shadow-lg"
            >
              <div className="relative w-full h-40 bg-[#342c4e] rounded-lg overflow-hidden group mb-4 flex items-center justify-center">
                {card.image ? (
                  <img
                    src={card.image || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center text-[#9d8ba7] text-sm">
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fad"
                      data-icon="image"
                      className="svg-inline--fa fa-image fa-fw w-8 h-8 mb-2"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <g>
                        <path
                          className="fa-secondary"
                          fill="currentColor"
                          d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h96 32H424c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"
                        />
                      </g>
                    </svg>
                    <span>Click to Upload</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-white text-sm font-medium">Click to Upload Image</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleImagePreview(e, index)}
                />
              </div>

              <Heading 
                initialData={card.heading}
                onUpdate={(newHeading) => {
                  const updatedCards = [...cards];
                  updatedCards[index] = { ...updatedCards[index], heading: newHeading };
                  setCards(updatedCards);
                }}
              />

              <ParagraphAi
                initialData={card.description}
                onUpdate={(newDescription) => {
                  const updatedCards = [...cards];
                  updatedCards[index] = { ...updatedCards[index], description: newDescription };
                  setCards(updatedCards);
                }}
              />
            </div>
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

export default ThreeImgTextAi;

