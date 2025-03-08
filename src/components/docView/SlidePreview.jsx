import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState, useRef } from "react";

export function SlidePreview({ number,onDoubleClick, title, isActive, onClick, id, previewImage }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const [scale, setScale] = useState(1);
  const imgRef = useRef(null);

/*   useEffect(() => {
    if (!imgRef.current) return;

    const updateScale = () => {
      const parentHeight = imgRef.current.parentElement.clientHeight;
      const imgHeight = imgRef.current.clientHeight;
      if (imgHeight > parentHeight) {
        setScale(parentHeight / imgHeight);
      } else {
        setScale(1); // Reset if no scaling needed
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => window.removeEventListener("resize", updateScale);
  }, [previewImage]); */

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        "p-1 bg-[#2a2438]/100 cursor-pointer  rounded-lg transition-all border border-gray-200 shadow-md",
        isActive && "bg-accent"
      )}
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      style={style}
    >
      {/* Image Container with Auto-Scaling */}
      {/* <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg border bg-gray-100 flex justify-center items-center">
        {previewImage ? (
          <img
            ref={imgRef}
            src={previewImage}
            alt={`Slide ${number}`}
            className="object-contain transition-transform"
            style={{ transform: `scale(${scale})` }}
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-500">
            No Preview
          </div>
        )}
      </div> */}

      {/* Slide Number & Title */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className=" text-white py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
          {number}
        </span>
        <span className="flex-1 py-1 text-sm font-medium truncate text-white">{title.replace(/<[^>]*>/g, '')}</span>
      </div>
    </div>
  );
}