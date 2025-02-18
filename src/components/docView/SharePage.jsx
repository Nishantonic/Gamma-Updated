import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import AccentImageAi from './GenerateAi/AiComponents/AccentImageAi';
import ImageTextAi from './GenerateAi/AiComponents/ImageTextAi';
import DefaultAi from './GenerateAi/AiComponents/DefaultAi';
import ThreeColumnAi from './GenerateAi/AiComponents/ThreeColumnAi';
import TwoColumnAi from './GenerateAi/AiComponents/TwoColumnAi';
import { PresentationMode } from './PresentationMode';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';

const SharePage = () => {
  const { shareId } = useParams();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationStartIndex, setPresentationStartIndex] = useState(0);

  useEffect(() => {
    const savedSlides = JSON.parse(localStorage.getItem('slides')) || [];
    const presentation = savedSlides.find((ppt) => String(ppt.key) === String(shareId));
    
    if (presentation) {
      setSlides(presentation.slides);
    } else {
      setError('Presentation not found');
    }
    setLoading(false);
  }, [shareId]);

  useEffect(() => {
    const cleanupEditable = () => {
      const container = containerRef.current;
      if (!container) return;

      container.querySelectorAll('[contenteditable]').forEach(el => {
        el.setAttribute('contenteditable', 'false');
      });

      const style = document.createElement('style');
      style.textContent = `
        .share-content * {
          user-select: none !important;
          -webkit-user-select: none !important;
          pointer-events: none !important;
          font-family: 'Bree Serif', serif;
        }
        .share-content video,
        .share-content audio,
        .share-content [controls] {
          user-select: auto !important;
          -webkit-user-select: auto !important;
          pointer-events: auto !important;
          cursor: pointer !important;
        }
      `;
      document.head.appendChild(style);

      return () => document.head.removeChild(style);
    };

    const timer = setTimeout(cleanupEditable, 50);
    return () => clearTimeout(timer);
  }, [slides]);

  const renderSlideComponent = (slideData) => {
    if (!slideData) return null;

    const commonProps = {
      generateAi: {
        ...slideData,
        isPreview: true,
        onEdit: () => {},
        onDelete: () => {}
      }
    };

    const components = {
      accentImage: AccentImageAi,
      twoColumn: TwoColumnAi,
      imageCardText: ImageTextAi,
      threeImgCard: ThreeColumnAi,
      default: DefaultAi
    };

    const Component = components[slideData.type] || components.default;
    return <Component {...commonProps} key={slideData.id} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-gray-800 text-xl font-bree-serif"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-red-500 text-xl font-bree-serif"
        >
          {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div ref={containerRef} className="max-w-6xl mx-auto px-4 py-8">
        {isPresentationMode && (
          <PresentationMode
            slides={slides}
            startIndex={presentationStartIndex}
            onClose={() => setIsPresentationMode(false)}
            renderSlide={renderSlideComponent}
          />
        )}
        
        <div className="mb-8 flex justify-between items-center relative z-50">
          <h1 className="text-3xl font-bree-serif text-gray-900">Presentation</h1>
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="flex items-center gap-2 text-lg font-bree-serif bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-200"
                >
                  Present
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 mt-2 p-1 bg-white rounded-lg shadow-xl border border-gray-200"
                style={{ zIndex: 1000 }}
              >
                <DropdownMenuItem 
                  className="px-4 py-3 text-lg font-bree-serif cursor-pointer hover:bg-blue-50 rounded-md transition-colors duration-150"
                  onClick={() => {
                    setPresentationStartIndex(0);
                    setIsPresentationMode(true);
                  }}
                >
                  From beginning
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="px-4 py-3 text-lg font-bree-serif cursor-pointer hover:bg-blue-50 rounded-md transition-colors duration-150"
                  onClick={() => {
                    setPresentationStartIndex(Math.max(0, slides.length - 1));
                    setIsPresentationMode(true);
                  }}
                >
                  From current slide
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {slides.map((slideData, index) => (
              <motion.div
                key={slideData.id || uuidv4()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="share-content bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-8">
                  {renderSlideComponent(slideData)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SharePage;