import { useState, useEffect } from "react";
import { Folders, Coins, Bell, Clipboard, Check, FolderOpen, Trash2, Share2, Grid, List, Star } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Card from "./Card";
import ProfileMenu from "./ProfileMenu";

// LoadingSkeleton component remains the same
const LoadingSkeleton = () => (
  <div className="w-full space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 w-full bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  </div>
);

// Notification component remains the same
const Notification = ({ message, type = "error", onClose }) => (
  <div
    className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg transition-opacity duration-300 flex items-center gap-2 ${
      type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
    }`}
  >
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-700">×</button>
  </div>
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
  const [activeFilter, setActiveFilter] = useState('all'); // New state for active filter

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
    } catch (err) {
      showNotification("Failed to load slides. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

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

    navigate("/page", { state: { slidesArray: sanitizedSlides, key } });
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

  // Add this utility function to compress large presentation data
const compressForSharing = (data) => {
  // Convert to JSON string
  const jsonString = JSON.stringify(data);
  
  // If the encoded string would be too long, create a reduced version
  if (jsonString.length > 2000) {
    // Create a minimized version with essential data only
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
  
  // If not too long, use full data
  return btoa(jsonString);
};

// Update the handleShare function in Gammas component
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

  return (
    <div className="w-full space-y-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folders className="w-6 h-6 text-gray-700" />
          <h3 className="text-xl font-semibold text-gray-800">Gammas</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <Coins className="w-5 h-5 text-yellow-600" />
            <span className="font-medium">{credits} Credits</span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-700" />
          </button>
          <ProfileMenu />

        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <Link 
          to="/page" 
          className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-lg
                     border border-gray-300 hover:bg-gray-50 transition-colors
                     text-gray-700 font-medium"
        >
          <FolderOpen className="w-5 h-5" />
          Create New Gamma
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="flex gap-6 text-gray-700 font-medium">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-2 cursor-pointer transition px-4 py-2 rounded-lg ${
                activeFilter === 'all' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <Folders className="w-5 h-5" /> 
              <span>All</span>
            </button>
            <button 
              onClick={() => setActiveFilter('favorites')}
              className={`flex items-center gap-2 cursor-pointer transition px-4 py-2 rounded-lg ${
                activeFilter === 'favorites' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <Star className={`w-5 h-5 ${activeFilter === 'favorites' ? 'text-yellow-400' : ''}`} /> 
              <span>Favorites</span>
            </button>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setLayout('grid')}
              className={`p-2 rounded-lg transition-colors ${
                layout === 'grid' 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-2 rounded-lg transition-colors ${
                layout === 'list' 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className={layout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {filteredSlides.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Folders className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {activeFilter === 'favorites' ? 'No favorite slides yet' : 'No slides available'}
            </p>
          </div>
        ) : (
          filteredSlides.map((slideGroup) => (
            slideGroup.slides?.length > 0 && (
              <Card
                key={slideGroup.key}
                slide={slideGroup.slides[0] || {}}
                slideGroup={slideGroup}
                onClick={() => handleCardClick(slideGroup.slides, slideGroup.key)}
                onShare={() => handleShare(slideGroup.key)}
                onDelete={() => handleDeleteSlide(slideGroup.key)}
                onToggleFavorite={() => toggleFavorite(slideGroup.key)}
                isFavorite={favorites.includes(slideGroup.key)}
                layout={layout}
              />
            )
          ))
        )}
      </div>

      <Dialog open={shareDialog.isOpen} onOpenChange={(open) => setShareDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Gamma</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
            <input
              type="text"
              readOnly
              value={shareDialog.url}
              className="flex-1 bg-transparent border-none focus:outline-none text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Clipboard className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gammas;