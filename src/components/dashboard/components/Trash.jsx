import { useState, useEffect } from "react";
import { Trash2, RefreshCw, LayoutGrid, List } from "lucide-react";
import Card from "./Gammas/Card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Trash() {
  const [trashedSlides, setTrashedSlides] = useState([]);
  const [layout, setLayout] = useState("grid"); // grid or list
  const navigate = useNavigate();

  useEffect(() => {
    const trash = JSON.parse(localStorage.getItem("trash") || "[]");
    setTrashedSlides(trash);
  }, []);

  const handleCardClick = (slides) => {
    if (!slides || slides.length === 0) return;
    navigate("/page", {
      state: {
        slidesArray: slides.map((slide) => ({
          type: slide?.Slide?.props?.generateAi?.type,
          ...slide?.Slide?.props?.generateAi,
          id: slide?.id,
          Slide: slide?.Slide,
        })),
      },
    });
  };

  const handleRestoreSlide = (id) => {
    const slideToRestore = trashedSlides.find((slide) => slide.key === id);
    const updatedTrash = trashedSlides.filter((slide) => slide.key !== id);
    setTrashedSlides(updatedTrash);
    localStorage.setItem("trash", JSON.stringify(updatedTrash));

    // Restore the slide to the main slides array
    const slides = JSON.parse(localStorage.getItem("slides") || "[]");
    slides.push(slideToRestore);
    localStorage.setItem("slides", JSON.stringify(slides));
  };

  const handlePermanentDelete = (id) => {
    const updatedTrash = trashedSlides.filter((slide) => slide.key !== id);
    setTrashedSlides(updatedTrash);
    localStorage.setItem("trash", JSON.stringify(updatedTrash));
  };

  const handleEmptyTrash = () => {
    setTrashedSlides([]);
    localStorage.setItem("trash", JSON.stringify([]));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Trash</h2>
          <p className="text-sm text-gray-500 mt-1">
            {trashedSlides.length} {trashedSlides.length === 1 ? 'item' : 'items'} in trash
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setLayout("grid")}
              className={`p-2 rounded ${
                layout === "grid" ? "bg-white shadow" : "hover:bg-gray-200"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout("list")}
              className={`p-2 rounded ${
                layout === "list" ? "bg-white shadow" : "hover:bg-gray-200"
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          {trashedSlides.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEmptyTrash}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Empty Trash
            </Button>
          )}
        </div>
      </div>

      {trashedSlides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
          <Trash2 className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No items in trash</p>
          <p className="text-gray-400 text-sm mt-1">Deleted items will appear here</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          layout === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        }`}>
          {trashedSlides.map((slideGroup) => (
            <div key={slideGroup.key} className="group relative">
              <Card
                slide={slideGroup.slides[0]}
                slideGroup={slideGroup}
                layout={layout}
                // onClick={() => handleCardClick(slideGroup.slides)}
                Dropdown = {false}
              />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => handleRestoreSlide(slideGroup.key)}
                  className="p-2 bg-white rounded-full hover:bg-green-50 transition-colors duration-200 shadow-lg"
                  title="Restore"
                >
                  <RefreshCw className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={() => handlePermanentDelete(slideGroup.key)}
                  className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors duration-200 shadow-lg"
                  title="Delete Permanently"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Trash;