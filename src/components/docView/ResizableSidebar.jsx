import { useState, useRef, useEffect } from "react";
import { MinimizeIcon as ResizeIcon } from "lucide-react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { SlidePreview } from "./SlidePreview";

const MIN_WIDTH = 150;
const MAX_WIDTH = 300;
const DEFAULT_WIDTH = 200;

export function ResizableSidebar({ setCurrentSlide, slidesPreview, deleteSlide, renderSlideComponent }) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const newWidth = Math.min(Math.max(e.clientX, MIN_WIDTH), MAX_WIDTH);
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const Row = ({ index, style }) => {
    const slide = slidesPreview[index];
    return (
      <div style={style}>
        <SlidePreview
          slide={slide}
          index={index}
          onClick={() => setCurrentSlide(index + 1)}
          onDelete={() => deleteSlide(slide.id)}
          renderSlideComponent={renderSlideComponent}
        />
      </div>
    );
  };

  return (
    <div 
      ref={sidebarRef} 
      className="relative h-[calc(100vh-48px)] border-r bg-background flex" 
      style={{ width }}
    >
      <div className="flex-1 overflow-hidden">
        <SortableContext items={slidesPreview} strategy={verticalListSortingStrategy}>
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeList
                height={height}
                itemCount={slidesPreview.length}
                itemSize={140}
                width={width}
                overscanCount={2}
              >
                {Row}
              </FixedSizeList>
            )}
          </AutoSizer>
        </SortableContext>
      </div>

      <div
        onMouseDown={() => setIsResizing(true)}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize group hover:w-2 transition-all"
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 -translate-x-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity bg-accent flex items-center justify-center">
          <ResizeIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}