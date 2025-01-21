import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const PreviewBar = ({ slides, selectedSlideIndex, onSelectSlide }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 overflow-x-auto">
      <div className="flex space-x-4">
        {slides.map((slide, index) => (
          <Card
            key={index}
            className={`flex-shrink-0 w-32 h-24 cursor-pointer ${
              selectedSlideIndex === index ? "ring-2 ring-purple-500" : ""
            }`}
            onClick={() => onSelectSlide(index)}
          >
            <CardContent className="p-2">
              <div className="text-xs font-bold truncate">{slide.title}</div>
              {slide.type === "accentImage" && (
                <img
                  src={slide.image || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-12 object-cover mt-1"
                />
              )}
              {slide.type === "twoColumn" && (
                <div className="flex mt-1">
                  <div className="w-1/2 h-12 bg-gray-200"></div>
                  <div className="w-1/2 h-12 bg-gray-300"></div>
                </div>
              )}
              {slide.type === "imageCardText" && (
                <div className="flex mt-1">
                  <img
                    src={slide.image || "/placeholder.svg"}
                    alt="Preview"
                    className="w-1/2 h-12 object-cover"
                  />
                  <div className="w-1/2 h-12 bg-gray-200"></div>
                </div>
              )}
              {slide.type === "threeImgCard" && (
                <div className="flex mt-1">
                  {slide.cards.map((card, i) => (
                    <img
                      key={i}
                      src={card.image || "/placeholder.svg"}
                      alt="Preview"
                      className="w-1/3 h-12 object-cover"
                    />
                  ))}
                </div>
              )}
              {slide.type === "default" && (
                <div className="w-full h-12 bg-gray-200 mt-1"></div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PreviewBar;
