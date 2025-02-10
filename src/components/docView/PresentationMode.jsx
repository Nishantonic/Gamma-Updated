import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, X, ZoomIn, ZoomOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PresentationMode({ 
  slides, 
  startIndex = 0, 
  onClose,
  renderSlide 
}) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(startIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [navigationDirection, setNavigationDirection] = useState(1);
  const containerRef = useRef(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Add this new animation variant
  const confirmVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Update handleClose to show confirmation dialog
  const handleCloseRequest = () => {
    setShowCloseConfirm(true);
  };

  // Actual close handler
  const confirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch(e.key) {
        case 'ArrowRight':
          goToNextSlide();
          break;
        case 'ArrowLeft':
          goToPreviousSlide();
          break;
        case 'Escape':
          handleCloseRequest();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlideIndex, slides.length]);


  // Prevent text selection and context menu
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const container = containerRef.current;

    container.addEventListener('contextmenu', handleContextMenu);
    return () => container.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const goToNextSlide = () => {
    setNavigationDirection(1);
    setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
  };

  const goToPreviousSlide = () => {
    setNavigationDirection(-1);
    setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
  };

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));

  // Enhanced close animation
  const handleClose = () => {
    onClose();
  };
  useEffect(() => {
    const cleanupEditable = () => {
      const container = containerRef.current;
      if (!container) return;

      // Disable contenteditable attributes
      container.querySelectorAll('[contenteditable]').forEach(el => {
        el.setAttribute('contenteditable', 'false');
      });

      // Disable text selection except for multimedia controls
      const style = document.createElement('style');
      style.textContent = `
        .presentation-content * {
          user-select: none !important;
          -webkit-user-select: none !important;
        }
        .presentation-content video,
        .presentation-content audio,
        .presentation-content [controls] {
          user-select: auto !important;
          -webkit-user-select: auto !important;
          pointer-events: auto !important;
        }
      `;
      container.appendChild(style);

      return () => container.removeChild(style);
    };

    const timer = setTimeout(cleanupEditable, 50);
    return () => clearTimeout(timer);
  }, [currentSlideIndex]);
  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? "-50%" : "50%",
      opacity: 0,
      scale: 0.9,
      transition: { 
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    })
  };

  const overlayVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={overlayVariants}
      className="fixed inset-0 z-50 bg-white flex flex-col touch-none"
      onMouseMove={() => setControlsVisible(true)}
      onMouseLeave={() => setControlsVisible(false)}
    >
      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={navigationDirection}>
          <motion.div
            key={currentSlideIndex}
            custom={navigationDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center p-8"
          >
            <div 
              className="presentation-content" 
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {renderSlide(slides[currentSlideIndex])}
            </div>
            <AnimatePresence>
    {showCloseConfirm && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        onClick={() => setShowCloseConfirm(false)}
      >
        <motion.div
          variants={confirmVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold mb-4">Close Presentation?</h3>
          <p className="text-gray-600 mb-6">Are you sure you want to exit presentation mode?</p>
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowCloseConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmClose}
            >
              Confirm
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enhanced Controls Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: controlsVisible ? 1 : 0 }}
        className="fixed inset-0 pointer-events-none"
        transition={{ duration: 0.2 }}
      >
        {/* Close Button with animation */}
        <motion.div 
          className="absolute top-4 right-4"
          whileHover={{ scale: 1.1 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-700 hover:bg-gray-100 shadow-lg pointer-events-auto backdrop-blur-sm"
            onClick={handleCloseRequest}
          >
            <X className="h-6 w-6" />
          </Button>
        </motion.div>

        {/* Navigation Controls with improved layout */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-white/90 shadow-xl backdrop-blur-sm rounded-full pointer-events-auto">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:bg-gray-100"
              onClick={goToPreviousSlide}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </motion.div>

          <motion.span 
            className="text-gray-700 font-medium min-w-[60px] text-center"
            key={currentSlideIndex}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            {currentSlideIndex + 1} / {slides.length}
          </motion.span>

          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:bg-gray-100"
              onClick={goToNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </motion.div>
        </div>

        {/* Zoom Controls with visual feedback */}
        <motion.div 
          className="absolute top-4 left-4 flex gap-2"
          animate={{ x: controlsVisible ? 0 : -60 }}
        >
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:bg-gray-100 shadow-lg pointer-events-auto backdrop-blur-sm"
              onClick={zoomIn}
            >
              <ZoomIn className="h-6 w-6" />
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:bg-gray-100 shadow-lg pointer-events-auto backdrop-blur-sm"
              onClick={zoomOut}
            >
              <ZoomOut className="h-6 w-6" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}