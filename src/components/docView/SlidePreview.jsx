import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState, useRef } from "react";

export function SlidePreview({ number, onDoubleClick, title, isActive, onClick, id }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        "p-1 bg-[#2a2438]/100 cursor-pointer mt-5 ml-2 rounded-lg transition-all border border-gray-200 shadow-md",
        isActive && "bg-accent"
      )}
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      style={style}
    >
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="text-white py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
          {number}
        </span>
        <span className="flex-1 py-1 text-sm font-medium truncate text-white">
          {title.replace(/<[^>]*>/g, '')}
        </span>
      </div>
    </div>
  );
}