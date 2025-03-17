import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, X, ZoomIn, ZoomOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export function PresentationMode({
  slides,
  startIndex = 0,
  onClose,
  renderSlide,
  presentationId,
}) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(startIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [navigationDirection, setNavigationDirection] = useState(1);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [slideDockers, setSlideDockers] = useState({});
  const [isLoadingLockers, setIsLoadingLockers] = useState(false);
  const [showLockerPopup, setShowLockerPopup] = useState(false);
  const [currentLocker, setCurrentLocker] = useState(null);
  const [taskCompleted, setTaskCompleted] = useState(false); // Moved to top level
  const containerRef = useRef(null);

  const confirmVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const lockerPopupVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  const handleCloseRequest = () => setShowCloseConfirm(true);
  const confirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchLockers = async () => {
    if (!presentationId) return;
    setIsLoadingLockers(true);
    const updatedDockers = {};

    try {
      console.log("Fetching lockers for presentationId:", presentationId);
      const response = await fetch(
        `https://presentaiapi.codesemic.com/api/locakers?filters[presentation]=${presentationId}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setSlideDockers({});
          toast.info("No lockers found for this presentation.");
          return;
        }
        throw new Error(`Failed to fetch lockers: ${response.status}`);
      }

      const data = await response.json();
      const lockers = data.data || [];

      lockers.forEach((locker) => {
        const slideId = locker.slide_number;
        const slideExists = slides.some((slide) => slide.id === slideId);
        if (slideExists) {
          updatedDockers[slideId] = updatedDockers[slideId] || [];
          updatedDockers[slideId].push({
            documentId: locker.documentId,
            type: locker.type,
            title: locker.title,
            details: {
              image: locker.image,
              video: locker.type === "Video" ? locker.image : null,
              html: locker.code || "",
              autoresponder: locker.code || "",
              ctaText: locker.cta_text || "",
              ctaUrl: locker.cta_url || "",
              title: locker.title || "",
              description: locker.description || "",
              allowClose: !locker.disable_close,
              ctaBtnColor: locker.cta_btn_color || "#000000",
              ctaBtnTxtColor: locker.cta_btn_txt_color || "#ffffff",
            },
          });
        }
      });

      setSlideDockers(updatedDockers);
    } catch (error) {
      console.error("Error fetching lockers:", error);
      toast.error(`Failed to load lockers: ${error.message}`);
    } finally {
      setIsLoadingLockers(false);
    }
  };

  useEffect(() => {
    if (presentationId) {
      fetchLockers();
    }
  }, [presentationId]);

  // Check for lockers and reset taskCompleted on slide change
  useEffect(() => {
    const currentSlideId = slides[currentSlideIndex]?.id;
    const lockers = slideDockers[currentSlideId] || [];
    setTaskCompleted(false); // Reset task completion for new slide
    if (lockers.length > 0) {
      setCurrentLocker(lockers[0]);
      setShowLockerPopup(true);
    } else {
      setShowLockerPopup(false);
      setCurrentLocker(null);
    }
  }, [currentSlideIndex, slideDockers]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showLockerPopup) return;
      switch (e.key) {
        case "ArrowRight":
          goToNextSlide();
          break;
        case "ArrowLeft":
          goToPreviousSlide();
          break;
        case "Escape":
          handleCloseRequest();
          break;
        case "+":
        case "=":
          zoomIn();
          break;
        case "-":
          zoomOut();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSlideIndex, slides.length, showLockerPopup]);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const container = containerRef.current;
    container.addEventListener("contextmenu", handleContextMenu);
    return () => container.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  const goToNextSlide = () => {
    setNavigationDirection(1);
    setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const goToPreviousSlide = () => {
    setNavigationDirection(-1);
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  };

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));

  useEffect(() => {
    const cleanupEditable = () => {
      const container = containerRef.current;
      if (!container) return;

      container.querySelectorAll("[contenteditable]").forEach((el) => {
        el.setAttribute("contenteditable", "false");
      });

      const style = document.createElement("style");
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
      document.body.style.overflow = "hidden";

      return () => {
        container.removeChild(style);
        document.body.style.overflow = "";
      };
    };

    const timer = setTimeout(cleanupEditable, 50);
    return () => clearTimeout(timer);
  }, [currentSlideIndex]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (direction) => ({
      x: direction > 0 ? "-50%" : "50%",
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
    }),
  };

  const overlayVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  // Enhanced locker rendering with better UI
  const renderLocker = (locker) => {
    const { type, details } = locker;

    const handleTaskCompletion = () => {
      setTaskCompleted(true);
      setShowLockerPopup(false);
    };

    switch (type) {
      case "Banner":
        return (
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
            {details.image && (
              <img
                src={details.image}
                alt={details.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{details.title}</h3>
            <p className="text-gray-600 mb-4">{details.description}</p>
            {details.ctaText && details.ctaUrl && (
              <Button
                style={{
                  backgroundColor: details.ctaBtnColor,
                  color: details.ctaBtnTxtColor,
                }}
                className="w-full py-2 rounded-lg hover:opacity-90 transition-opacity"
                onClick={handleTaskCompletion}
              >
                {details.ctaText}
              </Button>
            )}
          </div>
        );
      case "Image":
        return (
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
            <img
              src={details.image}
              alt="Locker Image"
              className="w-full max-h-64 object-contain rounded-lg"
            />
            {!details.allowClose && (
              <Button
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleTaskCompletion}
              >
                Continue
              </Button>
            )}
          </div>
        );
      case "Video":
        return (
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
            <video
              controls
              className="w-full max-h-64 rounded-lg"
              onEnded={handleTaskCompletion}
            >
              <source src={details.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case "Custom HTML":
        return (
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full overflow-auto max-h-[80vh]">
            <div dangerouslySetInnerHTML={{ __html: details.html }} />
            {!details.allowClose && (
              <Button
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleTaskCompletion}
              >
                Submit
              </Button>
            )}
          </div>
        );
      case "Autoresponder":
        return (
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full overflow-auto max-h-[80vh]">
            <div dangerouslySetInnerHTML={{ __html: details.autoresponder }} />
            {!details.allowClose && (
              <Button
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleTaskCompletion}
              >
                Submit Form
              </Button>
            )}
          </div>
        );
      case "Click to Action":
      case "Whatsapp":
        return (
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
            <Button
              style={{
                backgroundColor: details.ctaBtnColor,
                color: details.ctaBtnTxtColor,
              }}
              className="w-full py-3 rounded-lg hover:opacity-90 transition-opacity text-lg font-semibold"
              onClick={handleTaskCompletion}
            >
              {details.ctaText}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={overlayVariants}
      className="fixed inset-0 z-[1000] bg-white flex flex-col touch-none"
      onMouseMove={() => setControlsVisible(true)}
      onMouseLeave={() => setControlsVisible(false)}
      style={{ isolation: "isolate" }}
    >
      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden bg-white flex items-center justify-center p-8">
        {!showLockerPopup && (
          <AnimatePresence initial={false} custom={navigationDirection}>
            <motion.div
              key={currentSlideIndex}
              custom={navigationDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-full flex items-center  justify-center"
            >
              <div
                className="presentation-content bg-white w-full p-6 rounded-lg "
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {renderSlide(slides[currentSlideIndex])}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Locker Popup */}
        <AnimatePresence>
          {showLockerPopup && currentLocker && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={lockerPopupVariants}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1001]"
            >
              {renderLocker(currentLocker)}
              {currentLocker.details.allowClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-white hover:bg-gray-700"
                  onClick={() => setShowLockerPopup(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close Confirmation */}
        <AnimatePresence>
          {showCloseConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1001]"
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
                <p className="text-gray-600 mb-6">
                  Are you sure you want to exit presentation mode?
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowCloseConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmClose}>
                    Confirm
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Overlay */}
      {!showLockerPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: controlsVisible ? 1 : 0 }}
          className="fixed inset-0 pointer-events-none z-[1001]"
          transition={{ duration: 0.2 }}
        >
          <motion.div className="absolute top-4 right-4" whileHover={{ scale: 1.1 }}>
            <Button
              variant="ghost"
              size="icon"
              className="text-black hover:bg-gray-700 shadow-lg pointer-events-auto backdrop-blur-sm"
              onClick={handleCloseRequest}
            >
              <X className="h-6 w-6" />
            </Button>
          </motion.div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-gray-800/90 shadow-xl backdrop-blur-sm rounded-full pointer-events-auto text-white">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-gray-700"
                onClick={goToPreviousSlide}
                disabled={currentSlideIndex === 0}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </motion.div>
            <motion.span
              className="font-medium min-w-[60px] text-center"
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
                className="text-white hover:bg-gray-700"
                onClick={goToNextSlide}
                disabled={currentSlideIndex === slides.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="absolute top-4 left-4 flex gap-2"
            animate={{ x: controlsVisible ? 0 : -60 }}
          >
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-black hover:bg-gray-700 shadow-lg pointer-events-auto backdrop-blur-sm"
                onClick={zoomIn}
              >
                <ZoomIn className="h-6 w-6" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-black hover:bg-gray-700 shadow-lg pointer-events-auto backdrop-blur-sm"
                onClick={zoomOut}
              >
                <ZoomOut className="h-6 w-6" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}