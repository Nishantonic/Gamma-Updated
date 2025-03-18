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
  const [currentLockerIndex, setCurrentLockerIndex] = useState(0); // Track current locker in sequence
  const [lockersQueue, setLockersQueue] = useState([]); // Queue of lockers for current slide
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

  // Manage locker queue for the current slide
  useEffect(() => {
    const currentSlideId = slides[currentSlideIndex]?.id;
    const lockers = slideDockers[currentSlideId] || [];
    setLockersQueue(lockers); // Set all lockers for the current slide
    setCurrentLockerIndex(0); // Start with the first locker
    if (lockers.length > 0) {
      setShowLockerPopup(true);
    } else {
      setShowLockerPopup(false);
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

    const handleTaskCompletion = (url) => {
      if (url) {
        window.open(url, "_blank");
      }
      proceedToNextLocker();
    };

    const handleWhatsappClick = () => {
      const phoneNumber = details.ctaUrl;
      const message = encodeURIComponent("Hello! This is a predefined message from PresentAI.");
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(whatsappUrl, "_blank");
      proceedToNextLocker();
    };

    const proceedToNextLocker = () => {
      if (currentLockerIndex + 1 < lockersQueue.length) {
        // Move to the next locker in the queue
        setCurrentLockerIndex((prev) => prev + 1);
      } else {
        // No more lockers, show the slide
        setShowLockerPopup(false);
      }
    };

    const handleCloseLocker = () => {
      if (details.allowClose) {
        proceedToNextLocker();
      }
    };

    switch (type) {
      case "Banner":
        return (
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-200">
            {details.image && (
              <img
                src={details.image}
                alt={details.title}
                className="w-full h-56 object-cover rounded-lg mb-6 shadow-md"
              />
            )}
            <h3 className="text-3xl font-bold text-gray-900 mb-3">{details.title}</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">{details.description}</p>
            {details.ctaText && details.ctaUrl && (
              <Button
                style={{
                  backgroundColor: details.ctaBtnColor,
                  color: details.ctaBtnTxtColor,
                }}
                className="w-full py-3 rounded-lg text-lg font-semibold hover:opacity-85 transition-all shadow-sm"
                onClick={() => handleTaskCompletion(details.ctaUrl)}
              >
                {details.ctaText}
              </Button>
            )}
          </div>
        );
      case "Image":
        return (
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-200">
            <img
              src={details.image}
              alt="Locker Image"
              className="w-full max-h-72 object-contain rounded-lg shadow-md"
            />
            {!details.allowClose && (
              <Button
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition-all shadow-sm"
                onClick={() => handleTaskCompletion(details.image)}
              >
                Continue
              </Button>
            )}
          </div>
        );
      case "Video":
        return (
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-200">
            <video
              controls
              className="w-full max-h-72 rounded-lg shadow-md"
              onEnded={() => handleTaskCompletion(details.video)}
            >
              <source src={details.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case "Custom HTML":
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 overflow-auto max-h-[85vh]">
      <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: details.html }} />
      {!details.allowClose && (
        <Button
          className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition-all shadow-sm"
          onClick={() => handleTaskCompletion(null)} // No URL, just proceed
        >
          Submit
        </Button>
      )}
    </div>
  );
      case "Autoresponder":
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 overflow-auto max-h-[85vh]">
      <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: details.autoresponder }} />
      {!details.allowClose && (
        <Button
          className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition-all shadow-sm"
          onClick={() => handleTaskCompletion(null)} // No URL, just proceed
        >
          Submit 
        </Button>
      )}
    </div>
  );
      case "Click to Action":
        return (
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-200">
            <Button
              style={{
                backgroundColor: details.ctaBtnColor,
                color: details.ctaBtnTxtColor,
              }}
              className="w-full py-4 rounded-lg text-xl font-semibold hover:opacity-85 transition-all shadow-sm"
              onClick={() => handleTaskCompletion(details.ctaUrl)}
            >
              {details.ctaText}
            </Button>
          </div>
        );
      case "Whatsapp":
        return (
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-200">
            <Button
              style={{
                backgroundColor: details.ctaBtnColor,
                color: details.ctaBtnTxtColor,
              }}
              className="w-full py-4 rounded-lg text-xl font-semibold hover:opacity-85 transition-all shadow-sm"
              onClick={handleWhatsappClick}
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
              className="w-full h-full flex items-center justify-center"
            >
              <div
                className="presentation-content bg-white w-full p-6 rounded-lg"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {renderSlide(slides[currentSlideIndex])}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Locker Popup */}
        <AnimatePresence>
          {showLockerPopup && lockersQueue.length > 0 && currentLockerIndex < lockersQueue.length && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={lockerPopupVariants}
              className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1001]"
            >
              {renderLocker(lockersQueue[currentLockerIndex])}
              {lockersQueue[currentLockerIndex].details.allowClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-white hover:bg-gray-700/80 rounded-full"
                  onClick={() => {
                    const currentLocker = lockersQueue[currentLockerIndex];
                    if (currentLocker.details.allowClose) {
                      if (currentLockerIndex + 1 < lockersQueue.length) {
                        setCurrentLockerIndex((prev) => prev + 1);
                      } else {
                        setShowLockerPopup(false);
                      }
                    }
                  }}
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
              className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[1001]"
              onClick={() => setShowCloseConfirm(false)}
            >
              <motion.div
                variants={confirmVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4 border border-gray-200"
              >
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Close Presentation?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to exit presentation mode?
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-100"
                    onClick={() => setShowCloseConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={confirmClose}
                  >
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
              className="text-black hover:bg-gray-200 shadow-lg pointer-events-auto backdrop-blur-sm rounded-full"
              onClick={handleCloseRequest}
            >
              <X className="h-6 w-6" />
            </Button>
          </motion.div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-white/90 shadow-xl backdrop-blur-sm rounded-full pointer-events-auto text-gray-800 border border-gray-200">
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
                className="text-gray-700 hover:bg-gray-100"
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
                className="text-black hover:bg-gray-200 shadow-lg pointer-events-auto backdrop-blur-sm rounded-full"
                onClick={zoomIn}
              >
                <ZoomIn className="h-6 w-6" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-black hover:bg-gray-200 shadow-lg pointer-events-auto backdrop-blur-sm rounded-full"
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