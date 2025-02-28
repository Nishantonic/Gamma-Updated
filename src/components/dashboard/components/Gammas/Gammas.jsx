import { useState, useEffect } from "react";
import { Folders, Coins, Bell, Clipboard, Check, FolderOpen, Trash2, Share2, Grid, List, Star } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";
import ProfileMenu from "./ProfileMenu";

// Enhanced LoadingSkeleton component with animations
const LoadingSkeleton = () => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="w-full space-y-4"
  >
    <div className="flex items-center justify-between">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 w-full bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  </motion.div>
);

// Enhanced Notification component with animations
const Notification = ({ message, type = "error", onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
      type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
    }`}
  >
    <span>{message}</span>
    <motion.button 
      whileHover={{ scale: 1.1 }} 
      whileTap={{ scale: 0.95 }}
      onClick={onClose} 
      className="ml-2 text-gray-500 hover:text-gray-700"
    >
      ×
    </motion.button>
  </motion.div>
);

const Gammas = ({ credits = 0, setCredits }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [arraySlides, setArraySlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const [shareDialog, setShareDialog] = useState({ isOpen: false, url: "", slideKey: null });
  const [copied, setCopied] = useState(false);
  const [layout, setLayout] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      setIsLoading(true);
      const savedSlides = localStorage.getItem("slides");
      if (savedSlides) {
        setArraySlides(JSON.parse(savedSlides));
      }
      const savedFavorites = localStorage.getItem("favorites");
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
      // Load saved layout preference
      const savedLayout = localStorage.getItem("layout");
      if (savedLayout) {
        setLayout(savedLayout);
      }
      // Load saved filter preference
      const savedFilter = localStorage.getItem("activeFilter");
      if (savedFilter) {
        setActiveFilter(savedFilter);
      }
    } catch (err) {
      showNotification("Failed to load slides. Please try again.", "error");
    } finally {
      // Small delay to allow for smoother animation transitions
      setTimeout(() => {
        setIsLoading(false);
        // Allow initial load animations to play
        setTimeout(() => setIsInitialLoad(false), 600);
      }, 500);
    }
  }, []);

  // Save layout preference whenever it changes
  useEffect(() => {
    localStorage.setItem("layout", layout);
  }, [layout]);

  // Save filter preference whenever it changes
  useEffect(() => {
    localStorage.setItem("activeFilter", activeFilter);
  }, [activeFilter]);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCardClick = (slides, key) => {
    if (!slides?.length) return;
    
    const sanitizedSlides = slides.map((slide) => ({
      ...slide,
      dropContainer: {
        dropItems: slide.dropContainer?.dropItems || [],
      },
    }));

    // Add subtle page transition before navigation
    document.body.classList.add('transitioning');
    setTimeout(() => {
      navigate("/page", { state: { slidesArray: sanitizedSlides, key } });
      document.body.classList.remove('transitioning');
    }, 300);
  };

  const handleDeleteSlide = (id) => {
    try {
      const slideToDelete = arraySlides.find((slide) => slide.key === id);
      const updatedSlides = arraySlides.filter((slide) => slide.key !== id);
      
      setArraySlides(updatedSlides);
      localStorage.setItem("slides", JSON.stringify(updatedSlides));

      const trash = JSON.parse(localStorage.getItem("trash") || "[]");
      trash.push(slideToDelete);
      localStorage.setItem("trash", JSON.stringify(trash));

      showNotification("Slide moved to trash successfully", "success");
    } catch (err) {
      showNotification("Failed to delete slide. Please try again.", "error");
    }
  };

  const compressForSharing = (data) => {
    const jsonString = JSON.stringify(data);
    
    if (jsonString.length > 2000) {
      const minimalData = {
        key: data.key,
        slides: data.slides.map(slide => ({
          id: slide.id,
          type: slide.type,
          titleContainer: {
            title: slide.titleContainer?.title || ''
          },
          descriptionContainer: {
            description: slide.descriptionContainer?.description || ''
          },
          imageContainer: {
            image: slide.imageContainer?.image || ''
          }
        }))
      };
      return btoa(JSON.stringify(minimalData));
    }
    
    return btoa(jsonString);
  };

  const handleShare = (pptKey) => {
    const slideGroup = arraySlides.find((slide) => slide.key === pptKey);
    if (!slideGroup) {
      showNotification("Slide not found for sharing", "error");
      return;
    }

    try {
      const encodedData = compressForSharing(slideGroup);
      const url = `${window.location.origin}/share/${encodedData}`;
      
      setShareDialog({
        isOpen: true,
        url,
        slideKey: pptKey
      });
    } catch (err) {
      showNotification("Failed to generate share link. Please try again.", "error");
    }
  };

  const toggleFavorite = (slideKey) => {
    const newFavorites = favorites.includes(slideKey)
      ? favorites.filter(key => key !== slideKey)
      : [...favorites, slideKey];
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    showNotification(
      newFavorites.includes(slideKey) ? "Added to favorites" : "Removed from favorites",
      "success"
    );
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareDialog.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showNotification("Link copied to clipboard!", "success");
    } catch (err) {
      showNotification("Failed to copy to clipboard. Please try again.", "error");
    }
  };

  const filteredSlides = arraySlides.filter(slideGroup => 
    activeFilter === 'favorites' ? favorites.includes(slideGroup.key) : true
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Animation variants for various elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };
  
  const filterVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      initial={isInitialLoad ? "hidden" : false}
      animate="visible"
      variants={containerVariants}
      className="w-full space-y-6"
    >
      <AnimatePresence>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>

      <motion.div 
        variants={itemVariants} 
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Folders className="w-6 h-6 text-gray-700" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-800">Gammas</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 0.5, delay: 1, repeat: 0 }}
            >
              <Coins className="w-5 h-5 text-yellow-600" />
            </motion.div>
            <span className="font-medium">{credits} Credits</span>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-700" />
          </motion.button>
          <ProfileMenu />
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="bg-gray-50 p-6 rounded-xl border border-gray-200"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Link 
            to="/page" 
            className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-lg
                      border border-gray-300 hover:bg-gray-50 transition-colors
                      text-gray-700 font-medium"
          >
            <motion.div animate={{ rotate: [0, -10, 0] }} transition={{ delay: 2, duration: 0.5 }}>
              <FolderOpen className="w-5 h-5" />
            </motion.div>
            Create New Gamma
          </Link>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={filterVariants}
        className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm"
      >
        {/* Filter Controls */}
        <div className="flex items-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-white text-gray-900 font-medium shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              aria-label="Show all slides"
              aria-pressed={activeFilter === 'all'}
            >
              <Folders className="w-5 h-5" /> 
              <span>All</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter('favorites')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'favorites' 
                  ? 'bg-white text-gray-900 font-medium shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              aria-label="Show favorite slides"
              aria-pressed={activeFilter === 'favorites'}
            >
              <motion.div
                animate={activeFilter === 'favorites' ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Star className={`w-5 h-5 ${activeFilter === 'favorites' ? 'text-yellow-400' : 'text-gray-500'}`} /> 
              </motion.div>
              <span>Favorites</span>
            </motion.button>
          </div>
        </div>
        
        {/* Layout Controls */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setLayout('grid')}
            className={`p-2 rounded-lg transition-colors ${
              layout === 'grid' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            aria-label="Grid view"
            aria-pressed={layout === 'grid'}
          >
            <Grid className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setLayout('list')}
            className={`p-2 rounded-lg transition-colors ${
              layout === 'list' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            aria-label="List view"
            aria-pressed={layout === 'list'}
          >
            <List className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        <motion.div 
          className={layout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
          variants={containerVariants}
          layout
        >
          {filteredSlides.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="col-span-full text-center py-12"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.7, 1, 0.7] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
                className="mx-auto mb-4"
              >
                <Folders className="w-12 h-12 text-gray-400" />
              </motion.div>
              <p className="text-gray-500 text-lg">
                {activeFilter === 'favorites' ? 'No favorite slides yet' : 'No slides available'}
              </p>
            </motion.div>
          ) : (
            filteredSlides.map((slideGroup, index) => (
              slideGroup.slides?.length > 0 && (
                <motion.div
                  key={slideGroup.key}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ 
                    duration: 0.4,
                    delay: isInitialLoad ? index * 0.1 : 0,
                    type: "spring",
                    damping: 15
                  }}
                >
                  <Card
                    slide={slideGroup.slides[0] || {}}
                    slideGroup={slideGroup}
                    onClick={() => handleCardClick(slideGroup.slides, slideGroup.key)}
                    onShare={() => handleShare(slideGroup.key)}
                    onDelete={() => handleDeleteSlide(slideGroup.key)}
                    onToggleFavorite={() => toggleFavorite(slideGroup.key)}
                    isFavorite={favorites.includes(slideGroup.key)}
                    layout={layout}
                  />
                </motion.div>
              )
            ))
          )}
        </motion.div>
      </AnimatePresence>

      <Dialog open={shareDialog.isOpen} onOpenChange={(open) => setShareDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Gamma</DialogTitle>
          </DialogHeader>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg"
          >
            <input
              type="text"
              readOnly
              value={shareDialog.url}
              className="flex-1 bg-transparent border-none focus:outline-none text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {copied ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <Check className="w-4 h-4 text-green-500" />
                </motion.div>
              ) : (
                <Clipboard className="w-4 h-4 text-gray-500" />
              )}
            </motion.button>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Add global CSS for page transitions */}
      <style jsx global>{`
        body.transitioning {
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }
      `}</style>
    </motion.div>
  );
};

export default Gammas;