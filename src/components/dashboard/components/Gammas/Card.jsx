import React, { useState } from 'react';
import { Share2, Trash2, Star, MoreVertical } from 'lucide-react';

const Card = ({ 
  slide, 
  slideGroup,
  onClick, 
  onShare, 
  onDelete, 
  onToggleFavorite, 
  isFavorite,
  layout,
  Dropdown = true,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    const cleanText = text.replace(/<[^>]*>/g, '');
    if (cleanText.length <= maxLength) return cleanText;
    return `${cleanText.substring(0, maxLength)}...`;
  };

  const title = truncateText(slide?.titleContainer?.title, 50) || 'Untitled Slide';
  const description = truncateText(slide?.descriptionContainer?.description, 100) || 'No description available';
  
  const handleDropdownClick = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const DropdownMenu = () => (
    <div className="absolute right-0 w-48 bg-white rounded-lg shadow-lg py-1 z-[100]">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onShare();
          setShowDropdown(false);
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
          setShowDropdown(false);
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
          setShowDropdown(false);
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Star className={`w-4 h-4 mr-2 ${isFavorite ? 'text-yellow-400 fill-current' : ''}`} />
        {isFavorite ? 'Remove Favorites' : 'Add to Favorites'}
      </button>
    </div>
  );

  if (layout === 'list') {
    return (
      <div 
        onClick={onClick}
        className="flex items-stretch bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300  cursor-pointer group relative"
      >
        {/* Image Container */}
        <div className="relative w-48 h-32 flex-shrink-0 bg-gray-100 overflow-hidden">
          {slide?.imageContainer?.image ? (
            <img
              src={slide.imageContainer.image}
              alt={title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        {isFavorite && (
            <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0 absolute right-0 mt-2 mr-2" />
          )}
        <div className="flex-grow p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {description}
            </p>
          </div>
          
          {Dropdown && <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              {slideGroup?.slides?.length} slides
            </span>
            <div className="relative dropdown-container">
              <button
                onClick={handleDropdownClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              
              {showDropdown  && (
                <div className="absolute right-0 bottom-full mb-2">
                  <DropdownMenu />
                </div>
              )}
            </div>
          </div>}
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className="relative group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        {slide?.imageContainer?.image ? (
          <img
            src={slide.imageContainer.image}
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        
        {/* Action Button with Dropdown */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 dropdown-container">
          <button
            onClick={handleDropdownClick}
            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 z-10"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2">
              <DropdownMenu />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
            {title}
          </h3>
          {isFavorite && (
            <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">
          {description}
        </p>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 rounded-xl pointer-events-none" />
    </div>
  );
};

export default Card;