import { useState, useEffect } from "react";
import { Folders, Coins, Bell, Clipboard, Check, FolderOpen, Trash2, Share2, Grid, List, Star } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";
import ProfileMenu from "./ProfileMenu";

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

const Notification = ({ message, type = "error", onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 ${type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
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
  const [shareDialog, setShareDialog] = useState({ isOpen: false, url: "", presentationId: null });
  const [copied, setCopied] = useState(false);
  const [layout, setLayout] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        // Fetch presentations from API
        const presentationsResponse = await fetch(
          `https://presentaiapi.codesemic.com/api/presentations/user/${user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!presentationsResponse.ok) throw new Error('Failed to fetch presentations');
        const presentations = await presentationsResponse.json();

        // Fetch slides for each presentation
        const enrichedPresentations = await Promise.all(
          presentations.map(async (presentation) => {
            const slidesResponse = await fetch(
              `https://presentaiapi.codesemic.com/api/slides/presentation/${presentation.id}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              }
            );

            if (!slidesResponse.ok) {
              console.error(`Failed to fetch slides for presentation ${presentation.id}`);
              return { ...presentation, slides: [] }; // Fallback to empty slides
            }

            const slides = await slidesResponse.json();
            const normalizedSlides = slides.map(slide => ({
              id: slide.id,
              type: slide.type || "custom",
              titleContainer: slide.titleContainer ? JSON.parse(slide.titleContainer) : {
                titleId: uuidv4(),
                title: "Untitled",
                styles: {},
              },
              descriptionContainer: slide.descriptionContainer ? JSON.parse(slide.descriptionContainer) : {
                descriptionId: uuidv4(),
                description: "",
                styles: {},
              },
              imageContainer: slide.imageContainer ? JSON.parse(slide.imageContainer) : {
                imageId: uuidv4(),
                image: slide.image?.[0] || null,
                styles: { width: 300, height: 210 },
              },
              dropContainer: slide.dropContainer ? JSON.parse(slide.dropContainer) : {
                dropItems: slide.content ? JSON.parse(slide.content).dropItems || [] : [],
              },
              ...(slide.type === "twoColumn" && {
                columns: slide.columns ? JSON.parse(slide.columns) : [],
              }),
              ...(slide.type === "threeImgCard" && {
                cards: slide.cards ? JSON.parse(slide.cards) : [],
              }),
            }));

            return { ...presentation, slides: normalizedSlides };
          })
        );

        setArraySlides(enrichedPresentations);

        const savedFavorites = localStorage.getItem("favorites");
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        const savedLayout = localStorage.getItem("layout");
        if (savedLayout) {
          setLayout(savedLayout);
        }
        const savedFilter = localStorage.getItem("activeFilter");
        if (savedFilter) {
          setActiveFilter(savedFilter);
        }
      } catch (err) {
        showNotification("Failed to load presentations or slides. Please try again.", "error");
        console.error(err);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
          setTimeout(() => setIsInitialLoad(false), 600);
        }, 500);
      }
    };
    fetchPresentations();
  }, []);

  useEffect(() => {
    localStorage.setItem("layout", layout);
  }, [layout]);

  useEffect(() => {
    localStorage.setItem("activeFilter", activeFilter);
  }, [activeFilter]);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCardClick = async (presentationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      document.body.classList.add('transitioning');
      setTimeout(() => {
        navigate("/page", {
          state: {
            presentationId: presentationId,
          },
        });
        document.body.classList.remove('transitioning');
      }, 300);
    } catch (err) {
      showNotification("Failed to load presentation. Please try again.", "error");
      console.error('Error in handleCardClick:', err);
    }
  };

  const handleDeleteSlide = async (presentationId) => {
  try {
    const token = localStorage.getItem('token');
    const presentation = arraySlides.find(p => p.id === presentationId);
    
    if (!presentation) {
      throw new Error('Presentation not found');
    }

    let slides = [];
    try {
      const slidesResponse = await fetch(
        `https://presentaiapi.codesemic.com/api/slides/presentation/${presentationId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (slidesResponse.ok) {
        slides = await slidesResponse.json();
      } else {
        console.warn('No slides found for presentation, proceeding with presentation deletion');
      }
    } catch (slidesError) {
      console.warn('Error fetching slides, proceeding with presentation deletion:', slidesError);
    }

    // Only attempt to delete slides if any were found
    if (slides.length > 0) {
      const deleteSlidePromises = slides.map(slide => 
        fetch(`https://presentaiapi.codesemic.com/api/slides/${slide.documentId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        })
      );
      
      const slideDeletionResults = await Promise.allSettled(deleteSlidePromises);
      const failedDeletions = slideDeletionResults.filter(result => 
        result.status === 'rejected' || !result.value.ok
      );
      
      if (failedDeletions.length > 0) {
        console.error('Failed to delete some slides:', failedDeletions);
        throw new Error(`Failed to delete ${failedDeletions.length} slides`);
      }
    }

    // Always attempt to delete the presentation
    const deletePresentationResponse = await fetch(
      `https://presentaiapi.codesemic.com/api/presentations/${presentation.documentId}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );

    if (!deletePresentationResponse.ok) {
      throw new Error('Failed to delete presentation');
    }

    setArraySlides(prev => prev.filter(p => p.id !== presentationId));
    showNotification('Presentation deleted successfully', 'success');
    
  } catch (err) {
    console.error('Deletion error:', err);
    const errorMessage = err.message.startsWith('Failed to delete some slides') 
      ? 'Partially deleted - some slides could not be removed' 
      : 'Failed to delete presentation. Please try again.';
    
    showNotification(errorMessage, 'error');
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
          titleContainer: { title: slide.titleContainer?.title || '' },
          descriptionContainer: { description: slide.descriptionContainer?.description || '' },
          imageContainer: { image: slide.imageContainer?.image || '' }
        }))
      };
      return btoa(JSON.stringify(minimalData));
    }
    return btoa(jsonString);
  };

  const handleShare = async (presentationId) => {
  // Directly construct the URL without unnecessary API call
  const url = `${window.location.origin}/share/${presentationId}`;
  setShareDialog({
    isOpen: true,
    url,
    presentationId
  });
};

  const toggleFavorite = (presentationId) => {
    const newFavorites = favorites.includes(presentationId)
      ? favorites.filter(id => id !== presentationId)
      : [...favorites, presentationId];
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    showNotification(
      newFavorites.includes(presentationId) ? "Added to favorites" : "Removed from favorites",
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

  const filteredSlides = arraySlides.filter(presentation =>
    activeFilter === 'favorites' ? favorites.includes(presentation.id) : true
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

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
          <h3 className="text-xl font-semibold text-gray-800">Presentations</h3>
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
            className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700 font-medium"
          >
            <motion.div animate={{ rotate: [0, -10, 0] }} transition={{ delay: 2, duration: 0.5 }}>
              <FolderOpen className="w-5 h-5" />
            </motion.div>
            Create New Presentations
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        variants={filterVariants}
        className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm"
      >
        <div className="flex items-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeFilter === 'all'
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeFilter === 'favorites'
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

        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setLayout('grid')}
            className={`p-2 rounded-lg transition-colors ${layout === 'grid'
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
            className={`p-2 rounded-lg transition-colors ${layout === 'list'
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
            filteredSlides.map((presentation, index) => (
              <motion.div
                key={presentation.id}
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
                  presentation={presentation}
                  slideGroup={presentation}
                  onClick={handleCardClick}
                  onShare={() => handleShare(presentation.id)}
                  onDelete={() => handleDeleteSlide(presentation.id)}
                  onToggleFavorite={() => toggleFavorite(presentation.id)}
                  isFavorite={favorites.includes(presentation.id)}
                  layout={layout}
                />
              </motion.div>
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
    <a
      href={shareDialog.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-1 text-blue-600 hover:text-blue-800 underline truncate"
      onClick={(e) => e.stopPropagation()}
    >
      {shareDialog.url}
    </a>
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
