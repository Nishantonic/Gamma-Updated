import { cn } from "@/lib/utils"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export function SlidePreview({ number, title, content, isActive, onClick, id, previewImage }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }
  return (
    <div
      onClick={onClick}
      className={cn("p-2 cursor-pointer hover:bg-accent/50 rounded-lg transition-colors", isActive && "bg-accent")}
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      style={style}
    >
      <div className="aspect-[16/9] bg-background border rounded-lg overflow-hidden">
        {previewImage ? (
          <img
            src={previewImage || "/placeholder.svg"}
            alt={`Slide ${number}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No preview</div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{number}</span>
        <span className="text-sm font-medium truncate flex-1">{title}</span>
      </div>
    </div>
  )
}

