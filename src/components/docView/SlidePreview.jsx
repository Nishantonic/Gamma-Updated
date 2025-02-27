import { memo, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

const createReadOnlySlide = (slide) => {
  const baseSlide = {
    id: slide.id,
    type: slide.type,
    title: slide.title,
    titleContainer: slide.titleContainer ? {
      ...slide.titleContainer,
      onEdit: undefined
    } : undefined,
    descriptionContainer: slide.descriptionContainer ? {
      ...slide.descriptionContainer,
      onEdit: undefined
    } : undefined,
    imageContainer: slide.imageContainer ? {
      ...slide.imageContainer,
      onEdit: undefined
    } : undefined,
    dropContainer: {
      dropItems: slide.dropContainer?.dropItems || []
    }
  };

  // Handle specific slide types
  switch (slide.type) {
    case 'twoColumn':
      return {
        ...baseSlide,
        columns: slide.columns?.map(column => ({
          ...column,
          onEdit: undefined
        })) || []
      };

    case 'threeImgCard':
      return {
        ...baseSlide,
        cards: slide.cards?.map(card => ({
          ...card,
          onEdit: undefined
        })) || []
      };

    case 'imageCardText':
    case 'accentImage':
    default:
      return baseSlide;
  }
};

export const SlidePreview = memo(({ slide, index, onClick, onDelete, renderSlideComponent }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Create memoized read-only version of the slide
  const readOnlySlide = useMemo(() => {
    const cleanSlide = createReadOnlySlide(slide);
    
    // Create a clean version of generateAi prop structure
    return {
      ...cleanSlide,
      // Remove all callback functions that could cause updates
      onEdit: undefined,
      onDelete: undefined,
      onChange: undefined,
      // Maintain the generateAi structure needed by components
      generateAi: {
        ...cleanSlide,
        onEdit: undefined,
        onDelete: undefined,
        onChange: undefined
      }
    };
  }, [
    slide.id,
    slide.type,
    slide.title,
    slide.titleContainer?.title,
    slide.descriptionContainer?.description,
    slide.imageContainer?.image,
    // Stringify complex objects to properly track changes
    JSON.stringify(slide.columns),
    JSON.stringify(slide.cards),
    JSON.stringify(slide.dropContainer?.dropItems)
  ]);

  // Error boundary to catch any rendering issues
  const PreviewContent = () => {
    try {
      return renderSlideComponent(readOnlySlide);
    } catch (error) {
      console.error('Preview rendering error:', error);
      return (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          Preview unavailable
        </div>
      );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "p-2 cursor-pointer hover:bg-accent/50 rounded-lg transition-colors border border-border",
        "group relative"
      )}
      onClick={onClick}
    >
      <div className="preview-container relative w-full aspect-[16/9] rounded bg-muted overflow-hidden">
        <div className="preview-scaler absolute top-0 left-0 w-[400%] h-[400%] origin-top-left" style={{ transform: 'scale(0.25)' }}>
          <div className="w-full h-full bg-white pointer-events-none">
            <PreviewContent />
          </div>
        </div>
      </div>
      
      <div className="mt-2 flex items-center gap-2">
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
          {index + 1}
        </span>
        <span className="text-xs font-medium truncate flex-1">
          {slide.titleContainer?.title?.replace(/<[^>]*>/g, '') || 'Untitled'}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-1 right-1 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
});

SlidePreview.displayName = "SlidePreview";

// Add to your global CSS
const styles = `
.preview-container {
  isolation: isolate;
  contain: strict;
}

.preview-scaler {
  transform-origin: top left;
  pointer-events: none;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
`;