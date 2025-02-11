import React, { useEffect, useRef, useState } from "react";
import "impress.js";
import "impress.js/css/impress-demo.css"; // Import required CSS
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"; // Import icons
import html2canvas from "html2canvas";

const ImpressPresentation = ({ slides, onClose }) => {
  const impressRef = useRef(null);
  const [slideImages, setSlideImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false); // Track closing animation state

  // Capture slide images when entering presentation mode
  useEffect(() => {
    const captureSlides = async () => {
      setIsLoading(true);
      const images = await Promise.all(
        slides.map(async (slide) => {
          const element = document.getElementById(`at-${slide.id}`);
          if (element) {
            const canvas = await html2canvas(element, {
              scale: 2, // Increase the scale for higher resolution
              useCORS: true, // Ensure cross-origin images are handled
              backgroundColor: null, // Remove white background
            });
            return canvas.toDataURL("image/png");
          }
          return "";
        }),
      );
      setSlideImages(images);
      setIsLoading(false);
    };

    captureSlides();
  }, [slides]);

  useEffect(() => {
    const initializeImpress = () => {
      if (typeof window !== "undefined" && window.impress) {
        // Destroy the existing impress instance if it exists
        if (impressRef.current) {
          const impressRoot = document.getElementById("impress");
          if (impressRoot) {
            impressRoot.innerHTML = ""; // Clear the container
          }
          impressRef.current = null;
        }

        // Initialize a new impress instance
        const impress = window.impress();
        impressRef.current = impress;
        impress.init();

        // Re-initialize after first render to ensure proper calculations
        setTimeout(() => impress.goto(0), 100);
      }
    };

    if (!isLoading) {
      initializeImpress();
    }

    // Keyboard navigation handler
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowRight":
        case "PageDown":
          impressRef.current?.next();
          break;
        case "ArrowLeft":
        case "PageUp":
          impressRef.current?.prev();
          break;
        case "Escape":
          handleClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // Clean up impress instance on unmount
      if (impressRef.current) {
        impressRef.current = null;
      }
    };
  }, [slides, isLoading]); // Reinitialize when slides or loading state changes

  const handleClose = () => {
    setIsClosing(true); // Start closing animation
    setTimeout(() => {
      onClose(); // Call onClose after animation is done
    }, 1500); // Increased to 1500ms for a more gradual and smooth transition
  };

  return (
    <div
      className={`min-h-screen fixed inset-0 z-50 bg-black flex flex-col transition-all duration-1500 ease-in-out ${
        isClosing
          ? "opacity-0 translate-y-10 scale-90" // Fade, slide down, and shrink when closing
          : "opacity-100 translate-y-0 scale-100"
      }`}
    >
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
          <p>Loading slides...</p>
        </div>
      ) : (
        <div id="impress" className="h-full w-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              id={`slide-${slide.id}`}
              className="step"
              data-x={index * 1600} 
              data-y={0} 
              data-z={-index * 1000} 
              data-rotate-y={index * 90} 
              data-scale={1} 
            >
              <div className="slide-content absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                            w-[90vw] h-[90vh] bg-transparent flex items-center justify-center overflow-hidden">
                {slideImages[index] ? (
                  <img
                    src={slideImages[index]}
                    alt={`Slide ${index + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">{slide.Slide}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-all z-50"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation Controls */}
      <div className="fixed bottom-8 left-4">
        <button
          onClick={() => impressRef.current?.prev()}
          className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg shadow-lg transition-all"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      </div>
      <div className="fixed bottom-8 right-4">
        <button
          onClick={() => impressRef.current?.next()}
          className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg shadow-lg transition-all"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
};

export default ImpressPresentation;