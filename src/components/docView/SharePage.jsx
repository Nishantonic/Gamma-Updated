import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { PresentationMode } from './PresentationMode';
import AccentImageAi from './GenerateAi/AiComponents/AccentImageAi';
import ImageTextAi from './GenerateAi/AiComponents/ImageTextAi';
import DefaultAi from './GenerateAi/AiComponents/DefaultAi';
import ThreeColumnAi from './GenerateAi/AiComponents/ThreeColumnAi';
import TwoColumnAi from './GenerateAi/AiComponents/TwoColumnAi';

const DirectPresentationMode = () => {
  const { shareId } = useParams();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setLoading(false);
      } catch (err) {
        setError('Presentation not found or sharing failed');
        console.error('Error loading shared presentation:', err);
        setLoading(false);
      }
    };

    loadSharedPresentation();
  }, [shareId]);

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
    return <Component {...commonProps} key={slideData.id} isPresentationMode={true} />;
  };

  const handleClosePresentation = () => {
    // Redirect to home or another appropriate page
    window.location.href = '/';
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
          <div className="text-red-500 mx-auto mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Presentation</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {slides.length > 0 && (
        <PresentationMode
          slides={slides}
          startIndex={0}
          onClose={handleClosePresentation}
          renderSlide={renderSlideComponent}
          presentationId={shareId}
        />
      )}
    </div>
  );
};

export default DirectPresentationMode;