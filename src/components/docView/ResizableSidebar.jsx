import { useState, useRef, useEffect } from "react";
import { SlidePreview } from "./SlidePreview";
import { MinimizeIcon as ResizeIcon } from "lucide-react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";

const MIN_WIDTH = 150;
const MAX_WIDTH = 300;
const DEFAULT_WIDTH = 200;

export function ResizableSidebar({ setCurrentSlide, slidesPreview, deleteSlide, slideImages }) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX, MIN_WIDTH), MAX_WIDTH);
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleDoubleClick = (slideId) => {
    const slideIndex = slidesPreview.findIndex((slide) => slide.id === slideId);
    if (slideIndex >= 0) {
      setCurrentSlide(slideIndex + 1);
      const slideElement = document.getElementById(`slide-${slideId}`);
      if (slideElement) {
        slideElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const Row = ({ index, style }) => {
    const slide = slidesPreview[index];
    return (
      <div style={style} onDoubleClick={() => handleDoubleClick(slide.id)}>
        <SlidePreview
          {...slide}
          number={index + 1}
          onClick={() => setCurrentSlide(index + 1)}
          slideImage={slideImages[index]}
        />
      </div>
    );
  };

  return (
    <div
      ref={sidebarRef}
      className="relative h-[calc(100vh-48px)] shadow-lg flex flex-col"
      style={{ width, minWidth: MIN_WIDTH }}
    >
      <div className="flex-1 scrollbar-custom">
        <SortableContext items={slidesPreview} strategy={verticalListSortingStrategy}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={slidesPreview.length}
                itemSize={80}
                width={width}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </SortableContext>
      </div>

      <div
        onMouseDown={() => setIsResizing(true)}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize group hover:w-2 transition-all"
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 -translate-x-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity bg-gray-500 flex items-center justify-center">
          <ResizeIcon className="h-4 w-4 text-gray-300" />
        </div>
      </div>
    </div>
  );
}