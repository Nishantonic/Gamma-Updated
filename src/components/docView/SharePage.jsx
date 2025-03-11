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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, AlertTriangle } from 'lucide-react';

const SharePage = () => {
  const { shareId } = useParams();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationStartIndex, setPresentationStartIndex] = useState(0);

  useEffect(() => {
    const loadSharedPresentation = async () => {
      try {
        const response = await fetch(
          `https://presentaiapi.codesemic.com/api/slides/presentation/${shareId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) throw new Error('Presentation not found');
        const slidesData = await response.json();

        const normalizedSlides = slidesData.map(slide => ({
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

        setSlides(normalizedSlides);
      } catch (err) {
        setError('Presentation not found or sharing failed');
        console.error('Error loading shared presentation:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSharedPresentation();
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-bree-serif">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Presentation</h2>
          <p className="text-gray-600">{error}</p>
        </div>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="primary" 
                className="flex items-center gap-2 text-lg font-bree-serif bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-200"
              >
                Present
                <ChevronDown className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 mt-2 p-1 bg-white rounded-lg shadow-xl border border-gray-200"
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