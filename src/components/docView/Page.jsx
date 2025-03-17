import React, { useState, useEffect } from "react";
import { Header } from "@/components/docView/Header";
import { ResizableSidebar } from "@/components/docView/ResizableSidebar";
import CardTemplates from "./slidesView/CardTemplates";
import { closestCorners, DndContext } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import Home from "../Home/Home";
import GenerateAi from "./GenerateAi/GenerateAi";
import { Download, Loader2, Save, Send } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { PresentationMode } from "./PresentationMode";
import AddButtonAi from "./GenerateAi/AiComponents/AddButtonAi";
import html2canvas from "html2canvas";
import { debounce } from "lodash";
import { Card, CardContent } from "../ui/card";
import pptxgen from "pptxgenjs";
import { toast, Toaster } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import AccentImageAi from "./GenerateAi/AiComponents/AccentImageAi";
import TwoColumnAi from "./GenerateAi/AiComponents/TwoColumnAi";
import ImageTextAi from "./GenerateAi/AiComponents/ImageTextAi";
import ThreeColumnAi from "./GenerateAi/AiComponents/ThreeColumnAi";
import DefaultAi from "./GenerateAi/AiComponents/DefaultAi";
import { v4 as uuidv4 } from "uuid";
import { useDroppedItems } from "./DroppedItemsContext";

export default function Page() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [slidesPreview, setSlidesPreview] = useState([]);
  const [slides, setSlides] = useState([]);
  const [slideImages, setSlideImages] = useState([]);
  const [generateAi, setGenerateAi] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationStartIndex, setPresentationStartIndex] = useState(0);
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingCopy, setIsLoadingCopy] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [aiInputData, setAiInputData] = useState("");
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [isImpressPresent, setIsImpressPresent] = useState(false);
  const [ArraySlides, setArraySlides] = useState(() => {
    const savedSlides = JSON.parse(localStorage.getItem("slides")) || [];
    return savedSlides;
  });
  const location = useLocation();
  const { droppedItems } = useDroppedItems();
  const [presentationId, setPresentationId] = useState(null);
  const [presentationDocumentId, setPresentationDocumentId] = useState(null);

  const [credits, setCradits] = useState(() => {
    const savedCredits = localStorage.getItem("credits");
    return savedCredits !== null ? Number.parseInt(savedCredits) : 50;
  });

  const [slideDockers, setSlideDockers] = useState({});
  
  useEffect(() => {
    const slideElement = document.getElementById(`at-${currentSlide}`);
    if (slideElement) {
      slideElement.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentSlide]);

  const renderSlideComponent = (slideData) => {
    const safeSlide = {
      type: "custom",
      titleContainer: {},
      descriptionContainer: {},
      imageContainer: {},
      dropContainer: { dropItems: [] },
      ...slideData,
    };

    if (!slideData) return null;

    const commonProps = {
      generateAi: {
        ...safeSlide, // Use safeSlide to ensure defaults
        onEdit: (updated) => handleSlideUpdate(slideData.id, updated),
        onDelete: () => deleteSlide(slideData.id),
      },
    };

    if (slideData.type === "custom") {
      return (
        <CardTemplates
          {...commonProps}
          key={slideData.id}
          slidesPreview={slidesPreview}
          id={slideData.id}
          setSlides={setSlides}
          setCurrentSlide={setCurrentSlide}
          setSlidesPreview={setSlidesPreview}
        />
      );
    }
    const components = {
      accentImage: AccentImageAi,
      twoColumn: TwoColumnAi,
      imageCardText: ImageTextAi,
      threeImgCard: ThreeColumnAi,
      default: DefaultAi,
    };

    const Component = components[slideData.type] || components.default;
    return <Component {...commonProps} key={slideData.id} />;
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || null;
  };

  const createPresentation = async (title, description) => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error("User not authenticated");

      const response = await fetch("https://presentaiapi.codesemic.com/api/presentations", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          data: {
            title: title || "Untitled",
            description: description || "",
            image: null,
            user: userId,
          },
        }),
      });

      if (!response.ok) throw new Error(`Failed to create presentation: ${response.statusText}`);
      const result = await response.json();
      console.log("Created presentation:", result);
      return result.data.id;
    } catch (error) {
      console.error("Error creating presentation:", error);
      toast.error("Failed to create presentation");
      return null;
    }
  };

  const saveSlideToAPI = async (presentationId, slideData) => {
    try {
      const requestBody = {
        data: {
          titleContainer: JSON.stringify(slideData.titleContainer || {}),
          descriptionContainer: JSON.stringify(slideData.descriptionContainer || {}),
          presentation: presentationId, // Pass as direct ID
          type: slideData.type || "custom",
          content: slideData.content || JSON.stringify({ dropItems: [] }),
          //image: slideData.image || [],
          impress_settings: slideData.impress_settings || "",
          dropContainer: JSON.stringify(slideData.dropContainer || { dropItems: [] }),
          cards: JSON.stringify(slideData.cards || []),
          columns: JSON.stringify(slideData.columns || []),
          imageContainer: JSON.stringify(slideData.imageContainer || {}),
          locale: slideData.locale || "en",
        },
      };

      console.log("Saving slide with payload:", JSON.stringify(requestBody));

      const response = await fetch("https://presentaiapi.codesemic.com/api/slides", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save slide: ${response.status} - ${errorText}`);
      }

      const savedSlide = await response.json();
      console.log("Saved slide response:", savedSlide);
      return savedSlide;
    } catch (error) {
      console.error("Error saving slide:", error);
      toast.error("Failed to save slide");
      return null;
    }
  };

  const handleSaveSlide = async () => {
  let finalPresentationId = presentationId; // Use existing presentationId if available
  let finalPresentationDocumentId = presentationDocumentId; // Backend documentId for presentation
  let savedSlides = []; // Track saved/updated slides

  // Helper function to delete a presentation if something goes wrong
  const deletePresentation = async (presentationId) => {
    try {
      const deleteResponse = await fetch(
        `https://presentaiapi.codesemic.com/api/presentations/${presentationId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        console.error(`Failed to delete presentation: ${deleteResponse.status} - ${errorText}`);
        return false;
      }
      console.log("Deleted presentation:", presentationId);
      return true;
    } catch (error) {
      console.error("Error deleting presentation:", error);
      return false;
    }
  };

  try {
    // Validate slides array
    if (!slides || slides.length === 0) {
      toast.error("No slides to save!");
      return;
    }

    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to save presentation");
      navigate("/login");
      return;
    }

    const userId = getUserId();
    if (!userId) {
      toast.error("User not authenticated");
      navigate("/login");
      return;
    }

    // **Step 1: Handle Presentation (Create or Update)**
    if (!finalPresentationId) {
      // Create a new presentation if none exists
      console.log("No presentationId exists, creating a new presentation...");
      finalPresentationId = await createPresentation(
        slides[0].titleContainer?.title.replace(/<[^>]+>/g, "") || "Untitled",
        slides[0].descriptionContainer?.description.replace(/<[^>]+>/g, "") || ""
      );
      if (!finalPresentationId) {
        throw new Error("Failed to create presentation");
      }
      console.log("Created presentationId:", finalPresentationId);
      setPresentationId(finalPresentationId);
      finalPresentationDocumentId = finalPresentationId; // For new presentations
    } else {
      // Update existing presentation
      console.log("Updating existing presentation with ID:", finalPresentationId);
      const updateResponse = await fetch(
        `https://presentaiapi.codesemic.com/api/presentations/${presentationDocumentId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            data: {
              title: slides[0].titleContainer?.title.replace(/<[^>]+>/g, "") || "Untitled",
              description: slides[0].descriptionContainer?.description.replace(/<[^>]+>/g, "") || "",
              image: null,
              user: userId,
            },
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Failed to update presentation: ${updateResponse.status} - ${errorText}`);
      }
      const updatedPresentation = await updateResponse.json();
      finalPresentationDocumentId = updatedPresentation.data.documentId || finalPresentationId;
      console.log("Updated presentation, documentId:", finalPresentationDocumentId);
    }

    setPresentationDocumentId(finalPresentationDocumentId);

    // **Step 2: Handle Image Uploads**
    const base64ToBlob = (base64) => {
      const byteString = atob(base64.split(",")[1]);
      const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    };

    const uploadImage = async (base64Image, token) => {
      const imageBlob = base64ToBlob(base64Image);
      console.log("Uploading image blob:", imageBlob);

      const formData = new FormData();
      formData.append("files", imageBlob, "slide-image.jpg");

      const uploadResponse = await fetch("https://presentaiapi.codesemic.com/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`Image upload failed: ${uploadResponse.status} - ${errorData.error?.message || "Unknown error"}`);
      }

      const uploadResult = await uploadResponse.json();
      const thumbnailUrl = uploadResult[0].formats?.thumbnail?.url || uploadResult[0].url;
      return `https://presentaiapi.codesemic.com${thumbnailUrl}`;
    };

    const uploadPromises = [];
    const imageMap = new Map();

    slides.forEach((slide, slideIndex) => {
      if (!slide.id) slide.id = uuidv4(); // Ensure every slide has a frontend ID

      // ImageContainer image
      if (slide.imageContainer?.image?.startsWith("data:image")) {
        const promise = uploadImage(slide.imageContainer.image, token);
        uploadPromises.push(promise);
        imageMap.set(promise, { slideIndex, type: "imageContainer" });
      }

      // ThreeImgCard slide cards
      if (slide.type === "threeImgCard" && slide.cards?.length > 0) {
        slide.cards.forEach((card, cardIndex) => {
          if (card?.image?.startsWith("data:image")) {
            const promise = uploadImage(card.image, token);
            uploadPromises.push(promise);
            imageMap.set(promise, { slideIndex, type: "card", cardIndex });
          }
        });
      }

      // DropContainer dropItems
      if (slide.dropContainer?.dropItems?.length > 0) {
        slide.dropContainer.dropItems.forEach((item, itemIndex) => {
          if (item.type === "image" && item.content?.startsWith("data:image")) {
            const promise = uploadImage(item.content, token);
            uploadPromises.push(promise);
            imageMap.set(promise, { slideIndex, type: "dropItem", itemIndex });
          }
        });
      }
    });

    // Upload all images concurrently
    const uploadedImageUrls = await Promise.all(uploadPromises.map((p) => p.catch((e) => ({ error: e }))));

    // Map uploaded URLs back to slides
    const updatedSlides = slides.map((slide) => ({ ...slide })); // Deep copy
    uploadedImageUrls.forEach((result, idx) => {
      const promise = uploadPromises[idx];
      const { slideIndex, type, cardIndex, itemIndex } = imageMap.get(promise);

      if (result.error) {
        console.error(`Image upload failed for slide ${slideIndex}, ${type}:`, result.error);
        toast.error(`Failed to upload image for slide ${slideIndex + 1}`);
        return;
      }

      const url = result;
      if (type === "imageContainer") {
        updatedSlides[slideIndex].imageContainer.image = url;
      } else if (type === "card") {
        updatedSlides[slideIndex].cards[cardIndex].image = url;
      } else if (type === "dropItem") {
        updatedSlides[slideIndex].dropContainer.dropItems[itemIndex].content = url;
      }
    });

    // **Step 3: Save or Update Slides**
    for (const slide of updatedSlides) {
      console.log(`Processing slide ID: ${slide.id}, DocumentId: ${slide.documentId || "None"}`);

      const processedDropItems = slide.dropContainer?.dropItems || [];
      const uploadedCardImages = slide.type === "threeImgCard" && slide.cards?.length > 0 ? slide.cards : [];

      const cleanSlide = {
        titleContainer: {
          titleId: slide.titleContainer?.titleId || uuidv4(),
          title: slide.titleContainer?.title || "Untitled",
          styles: slide.titleContainer?.styles || {},
        },
        descriptionContainer: {
          descriptionId: slide.descriptionContainer?.descriptionId || uuidv4(),
          description: slide.descriptionContainer?.description || "",
          styles: slide.descriptionContainer?.styles || {},
        },
        type: slide.type || "custom",
        content: JSON.stringify({
          dropItems: processedDropItems,
          ...(slide.type === "twoColumn" && { columns: slide.columns || [] }),
          ...(slide.type === "threeImgCard" && { cards: uploadedCardImages || slide.cards || [] }),
        }),
        impress_settings: slide.impress_settings || "",
        dropContainer: { dropItems: processedDropItems },
        cards: uploadedCardImages.length > 0 ? uploadedCardImages : slide.cards || [],
        columns: slide.columns || [],
        imageContainer: {
          imageId: slide.imageContainer?.imageId || uuidv4(),
          image: slide.imageContainer?.image || null,
          styles: slide.imageContainer?.styles || {},
        },
        locale: "en",
      };

      let savedSlide;
      if (slide.documentId) {
        // Update existing slide
        console.log(`Updating slide with documentId: ${slide.documentId}`);
        const slideResponse = await fetch(
          `https://presentaiapi.codesemic.com/api/slides/${slide.documentId}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              data: {
                titleContainer: JSON.stringify(cleanSlide.titleContainer),
                descriptionContainer: JSON.stringify(cleanSlide.descriptionContainer),
                presentation: finalPresentationId,
                type: cleanSlide.type,
                content: cleanSlide.content,
                impress_settings: cleanSlide.impress_settings,
                dropContainer: JSON.stringify(cleanSlide.dropContainer),
                cards: JSON.stringify(cleanSlide.cards),
                columns: JSON.stringify(cleanSlide.columns),
                imageContainer: JSON.stringify(cleanSlide.imageContainer),
                locale: cleanSlide.locale,
              },
            }),
          }
        );

        if (!slideResponse.ok) {
          const errorText = await slideResponse.text();
          throw new Error(`Failed to update slide ${slide.documentId}: ${slideResponse.status} - ${errorText}`);
        }
        savedSlide = await slideResponse.json();
        console.log("Updated slide:", savedSlide.data);
      } else {
        // Create new slide
        console.log("Creating new slide for ID:", slide.id);
        savedSlide = await saveSlideToAPI(finalPresentationId, cleanSlide);
        if (savedSlide) {
          // Update local state with documentId for future updates
          setSlides((prev) =>
            prev.map((s) =>
              s.id === slide.id ? { ...s, documentId: savedSlide.data.documentId } : s
            )
          );
          console.log("New slide created with documentId:", savedSlide.data.documentId);
        }
      }

      if (savedSlide) {
        savedSlides.push(savedSlide);
      } else {
        throw new Error(`Failed to save slide ${slide.id}`);
      }
    }

    // **Step 4: Handle Save Results**
    const successfulSaves = savedSlides.filter((slide) => slide !== null).length;
    if (successfulSaves === slides.length) {
      toast.success("Presentation and slides saved successfully!");
      navigate("/home", { state: { presentationId: finalPresentationId } });
    } else {
      toast.warn("Some slides failed to save, but presentation was retained");
      navigate("/home", { state: { presentationId: finalPresentationId } });
    }
  } catch (error) {
    console.error("Error saving presentation/slides:", error);
    toast.error(`Failed to save: ${error.message}`);

    // Cleanup if a new presentation was created but no slides were saved
    if (finalPresentationId && !presentationId && savedSlides.length === 0) {
      console.log("Cleaning up failed presentation:", finalPresentationId);
      await deletePresentation(finalPresentationId);
      setPresentationId(null);
      setPresentationDocumentId(null);
    }
    navigate("/home");
  }
};

  useEffect(() => {
    const loadPresentation = async (presentationId) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please login to view presentation");
          navigate("/login");
          return;
        }

        setIsLoadingCopy(true);
        const response = await fetch(
          `https://presentaiapi.codesemic.com/api/slides/presentation/${presentationId}`,
          {
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) throw new Error(`Failed to fetch slides: ${response.status} ${response.statusText}`);

        const jsonResponse = await response.json();
        const documentId = jsonResponse[0]?.presentation?.documentId;
        setPresentationDocumentId(documentId);
        console.log("Raw API response in Page:", jsonResponse);

        if (!Array.isArray(jsonResponse)) {
          throw new Error("Invalid response format: Expected an array");
        }

        const normalizedSlides = jsonResponse.map((slide) => ({
          id: slide.id || uuidv4(),
          documentId:slide.documentId || uuidv4(),
          type: slide.type || "custom",
          titleContainer: slide.titleContainer
            ? JSON.parse(slide.titleContainer)
            : {
                titleId: uuidv4(),
                title: slide.title || "Untitled",
                styles: {},
              },
          descriptionContainer: slide.descriptionContainer
            ? JSON.parse(slide.descriptionContainer)
            : {
                descriptionId: uuidv4(),
                description: slide.description || "",
                styles: {},
              },
          imageContainer: slide.imageContainer
            ? JSON.parse(slide.imageContainer)
            : {
                imageId: uuidv4(),
                image: slide.image?.[0] || null,
                styles: { width: 300, height: 210 },
              },
          dropContainer: slide.dropContainer
            ? JSON.parse(slide.dropContainer)
            : {
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
        setSlidesPreview(
          normalizedSlides.map((slide, index) => ({
            number: index + 1,
            id: slide.id,
            documentId: slide.documentId, // Include in preview too if needed
            title: slide.titleContainer.title,
            type: slide.type,
            content: renderSlideComponent(slide),
            onClick: () => setCurrentSlide(index + 1),
            ...slide,
          }))
        );
        toast.success("Presentation loaded successfully!");
      } catch (error) {
        console.error("Error loading slides:", error);
        toast.error("Failed to load presentation");
      } finally {
        setIsLoadingCopy(false);
      }
    };

    if (location.state?.slidesArray) {
      setSlides(location.state.slidesArray);
      setSlidesPreview(
        location.state.slidesArray.map((slide, index) => ({
          number: index + 1,
          id: slide.id,
          title: slide.titleContainer?.title,
          type: slide.type,
          content: renderSlideComponent(slide),
          onClick: () => setCurrentSlide(index + 1),
          ...slide,
        }))
      );
    } else if (location.state?.presentationId) {
      setPresentationId(location.state.presentationId);
      loadPresentation(location.state.presentationId);
    } else {
      const defaultSlide = {
        id: uuidv4(),
        type: "custom",
        titleContainer: {
          titleId: uuidv4(),
          title: "New Presentation",
          styles: {},
        },
        descriptionContainer: {
          descriptionId: uuidv4(),
          description: "",
          styles: {},
        },
        imageContainer: {
          imageId: uuidv4(),
          image: null,
          styles: { width: 300, height: 210 },
        },
        dropContainer: {
          dropItems: [],
        },
      };

      setSlides([defaultSlide]);
      setSlidesPreview([
        {
          number: 1,
          id: defaultSlide.id,
          title: "New Presentation",
          type: "custom",
          content: renderSlideComponent(defaultSlide),
          onClick: () => setCurrentSlide(1),
          ...defaultSlide,
        },
      ]);
    }
  }, [location.state, navigate, toast]);

  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    setSlides((prev) => {
      const originalPos = prev.findIndex((item) => item.id === active.id);
      const newPos = prev.findIndex((item) => item.id === over.id);
      return arrayMove(prev, originalPos, newPos);
    });

    setSlidesPreview((prev) => {
      const originalPos = prev.findIndex((item) => item.id === active.id);
      const newPos = prev.findIndex((item) => item.id === over.id);
      return arrayMove(prev, originalPos, newPos);
    });
  };

  const handleAiPopupSubmit = () => {
    const currentCredits = Number.parseInt(localStorage.getItem("credits") || "50");
    if (currentCredits >= 40) {
      setIsGenerating(true);
      setIsLoadingCopy(true);
      setGenerateAi(true);
      const newCredits = currentCredits - 40;
      setCradits(newCredits);
      localStorage.setItem("credits", newCredits);
      toast.success("Presentation generated successfully!");
    } else {
      toast.error("Insufficient credits. Please purchase more.");
    }
  };

  const startPresentation = (fromBeginning = true) => {
    setPresentationStartIndex(fromBeginning ? 0 : currentSlide - 1);
    setIsPresentationMode(true);
  };

  const getBase64FromImgElement = async (imgElement) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL("image/png");
        resolve(base64);
      };

      img.onerror = reject;
      img.crossOrigin = "anonymous";
      img.src = imgElement;
    });
  };

  const parseStyles = (content, styles = {}) => {
    const combinedStyles = { ...styles };

    if (content?.includes("color:")) {
      const colorMatch = content.match(/color:\s*rgb$$([^)]+)$$/);
      if (colorMatch) {
        const [r, g, b] = colorMatch[1].split(",").map((n) => Number.parseInt(n.trim()));
        combinedStyles.color = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      }
    }

    if (content?.includes("<strong>") || styles.bold) combinedStyles.bold = true;
    if (content?.includes("<em>") || styles.italic) combinedStyles.italic = true;
    if (content?.includes("<u>") || styles.underline) combinedStyles.underline = true;
    if (content?.includes('class="ql-align-center"')) combinedStyles.align = "center";
    if (content?.includes('class="ql-align-right"')) combinedStyles.align = "right";

    if (styles.header) {
      switch (styles.header) {
        case 1:
          combinedStyles.fontSize = 32;
          break;
        case 2:
          combinedStyles.fontSize = 18;
          break;
        case 3:
          combinedStyles.fontSize = 14;
          break;
        default:
          combinedStyles.fontSize = 12;
      }
    }

    return combinedStyles;
  };

  const addStyledText = (pptSlide, text, content, styles = {}, options = {}) => {
    if (text && typeof text === "string") {
      const parsedStyles = parseStyles(content, styles);
      pptSlide.addText(text.replace(/<[^>]+>/g, "").trim(), {
        color: "#FFFFFF",
        fontFace: "Arial",
        fontSize: 14,
        align: parsedStyles.align || "left",
        ...parsedStyles,
        ...options,
      });
    }
  };

  const processMainContent = async (pptSlide, slideData, type) => {
    const title = slideData.titleContainer?.title?.replace(/<[^>]+>/g, "") || "";
    const description = slideData.descriptionContainer?.description?.replace(/<[^>]+>/g, "") || "";

    switch (type) {
      case "accentImage":
        addStyledText(pptSlide, title, slideData.titleContainer?.title, slideData.titleContainer?.styles, {
          x: 0.5,
          y: 0.5,
          w: "60%",
          h: 1,
        });

        addStyledText(pptSlide, description, slideData.descriptionContainer?.description, slideData.descriptionContainer?.styles, {
          x: 0.5,
          y: 1.5,
          w: "60%",
          h: 3,
        });

        if (slideData.imageContainer?.image) {
          try {
            const base64Image = await getBase64FromImgElement(slideData.imageContainer.image);
            pptSlide.addImage({
              data: base64Image,
              x: 5.5,
              y: 1.5,
              w: 4,
              h: 3,
            });
          } catch (error) {
            console.error("Failed to add image:", error);
          }
        }
        break;

      case "threeImgCard":
        addStyledText(pptSlide, title, slideData.titleContainer?.title, slideData.titleContainer?.styles, {
          x: 0.5,
          y: 0.3,
          w: "90%",
          h: 0.8,
          align: "center",
        });

        if (slideData.cards) {
          for (let i = 0; i < slideData.cards.length; i++) {
            const card = slideData.cards[i];
            const xOffset = 0.5 + i * 3.3;

            if (card.image) {
              try {
                const base64Image = await getBase64FromImgElement(card.image);
                pptSlide.addImage({
                  data: base64Image,
                  x: xOffset,
                  y: 1.3,
                  w: 2.8,
                  h: 2,
                });
              } catch (error) {
                console.error(`Failed to add card image ${i}:`, error);
              }
            }

            addStyledText(pptSlide, card.headingContainer?.heading, card.headingContainer?.heading, card.headingContainer?.styles, {
              x: xOffset,
              y: 3.4,
              w: 2.8,
              h: 0.6,
              align: "center",
              fontSize: 14,
              bold: true,
            });

            addStyledText(pptSlide, card.descriptionContainer?.description, card.descriptionContainer?.description, card.descriptionContainer?.styles, {
              x: xOffset,
              y: 4.1,
              w: 2.8,
              h: 1,
              align: "center",
              fontSize: 12,
            });
          }
        }
        break;

      case "twoColumn":
        addStyledText(pptSlide, title, slideData.titleContainer?.title, slideData.titleContainer?.styles, {
          x: 0.5,
          y: 0.5,
          w: "90%",
          h: 1,
        });

        slideData.columns?.forEach((column, idx) => {
          const content = column.content?.replace(/<[^>]+>/g, "") || "";
          addStyledText(pptSlide, content, column.content, column.styles, {
            x: idx === 0 ? 0.5 : 5.5,
            y: 1.5,
            w: "45%",
            h: 3,
          });
        });
        break;

      default:
        addStyledText(pptSlide, title, slideData.titleContainer?.title, slideData.titleContainer?.styles, {
          x: 0.5,
          y: 0.5,
          w: "90%",
          h: 1,
        });

        addStyledText(pptSlide, description, slideData.descriptionContainer?.description, slideData.descriptionContainer?.styles, {
          x: 0.5,
          y: 1.5,
          w: "90%",
          h: 4,
        });
    }
  };

  const processDroppedItems = async (pptSlide, dropItems) => {
    let yOffset = 5;

    for (const item of dropItems) {
      switch (item.type) {
        case "image":
          try {
            if (typeof item.content === "string") {
              const base64Image = await getBase64FromImgElement(item.content);
              const width = item.styles?.width ? item.styles.width / 100 : 3;
              const height = item.styles?.height ? item.styles.height / 100 : 2;
              pptSlide.addImage({
                data: base64Image,
                x: 0.5,
                y: yOffset,
                w: width,
                h: height,
              });
              yOffset += height + 0.5;
            }
          } catch (error) {
            console.error("Error processing image:", error);
          }
          break;

        case "video":
          try {
            if (typeof item.content === "string") {
              const width = item.styles?.width ? item.styles.width / 100 : 4;
              const height = item.styles?.height ? item.styles.height / 100 : 3;
              pptSlide.addMedia({
                type: "video",
                data: item.content,
                x: 0.5,
                y: yOffset,
                w: width,
                h: height,
                extension: ".mp4",
              });
              yOffset += height + 0.5;
            }
          } catch (error) {
            console.error("Failed to add dropped video:", error);
          }
          break;

        case "audio":
          try {
            if (typeof item.content === "string") {
              const width = item.styles?.width ? item.styles.width / 100 : 4;
              const height = item.styles?.height ? item.styles.height / 100 : 3;
              pptSlide.addMedia({
                type: "audio",
                data: item.content,
                x: 0.5,
                y: yOffset,
                w: width,
                h: height,
                extension: ".mp3",
              });
              yOffset += height + 0.5;
            }
          } catch (error) {
            console.error("Failed to add dropped audio:", error);
          }
          break;

        case "title":
        case "heading":
        case "paragraph":
          const content = item.content?.replace(/<[^>]+>/g, "") || "";
          addStyledText(pptSlide, content, item.content, item.styles, {
            x: 0.5,
            y: yOffset,
            w: "90%",
            h: 0.8,
          });
          yOffset += 1;
          break;
      }
    }
  };

  const downloadPPT = async () => {
    console.log("Starting PowerPoint generation...");
    try {
      const pptx = new pptxgen();

      for (const slideData of slides) {
        const pptSlide = pptx.addSlide();
        pptSlide.background = { color: "#342c4e" };

        await processMainContent(pptSlide, slideData, slideData.type || "default");

        if (slideData.dropContainer?.dropItems) {
          await processDroppedItems(pptSlide, slideData.dropContainer.dropItems);
        }
      }

      console.log("Saving PowerPoint file...");
      await pptx.writeFile({ fileName: "presentation.pptx" });
      console.log("PowerPoint generation completed successfully.");
      toast.success("PowerPoint downloaded successfully!");
    } catch (error) {
      console.error("PPT Generation Error:", error);
      toast.error("Failed to generate PowerPoint. Please check console for details.");
    }
  };

  const generateSlidePreview = async (slideElement) => {
    if (slideElement) {
      const canvas = await html2canvas(slideElement, {
        scale: 1,
        logging: false,
        useCORS: true,
      });
      return canvas.toDataURL("image/png", 1.0);
    }
    return null;
  };

  const updateSlideImages = async () => {
    const newImages = await Promise.all(
      slides.map(async (slide) => {
        const element = document.getElementById(`at-${slide.id}`);
        return element ? await generateSlidePreview(element) : null;
      })
    );
    setSlideImages(newImages);
  };

  const debouncedUpdateSlideImages = debounce(updateSlideImages, 300);

  const addNewSlide = async (index) => {
    const newSlide = {
      number: index + 1,
      id: uuidv4(),
      type: "custom",
      title: "New Slide",
      content: (
        <div className="flex justify-center">
          <CardTemplates
            slidesPreview={slidesPreview}
            id={Date.now()}
            setSlides={setSlides}
            setCurrentSlide={setCurrentSlide}
            setSlidesPreview={setSlidesPreview}
          />
        </div>
      ),
      onClick: () => setCurrentSlide(index + 1),
    };

    setSlides((prev) => [...prev.slice(0, index), newSlide, ...prev.slice(index)]);
    setSlidesPreview((prev) => [...prev.slice(0, index), newSlide, ...prev.slice(index)]);
  };

  const deleteSlide = (slideId) => {
    setSlides((prevSlides) => prevSlides.filter((slide) => slide.id !== slideId));
    setSlidesPreview((prevSlides) => prevSlides.filter((slide) => slide.id !== slideId));
  };

  useEffect(() => {
    debouncedUpdateSlideImages();
  }, [slides]);

  useEffect(() => {
    const savedSlides = JSON.parse(localStorage.getItem("slides")) || [];
    setArraySlides(
      savedSlides.map((slideGroup) => ({
        ...slideGroup,
        slides: slideGroup.slides.map((slide) => ({
          type: slide.type || "custom",
          ...slide,
        })),
      }))
    );
  }, []);

  const handleSlideUpdate = (slideId, updatedData) => {
    console.log("slide Update : ", slideId);

    setSlides((prevSlides) =>
      prevSlides.map((slide) => {
        if (slide.id === slideId) {
          return {
            ...slide,
            ...updatedData,
            titleContainer: {
              ...slide.titleContainer,
              ...updatedData.titleContainer,
              styles: {
                ...slide.titleContainer?.styles,
                ...updatedData.titleContainer?.styles,
              },
            },
            descriptionContainer: {
              ...slide.descriptionContainer,
              ...updatedData.descriptionContainer,
              styles: {
                ...slide.descriptionContainer?.styles,
                ...updatedData.descriptionContainer?.styles,
              },
            },
            imageContainer: {
              ...slide.imageContainer,
              ...updatedData.imageContainer,
              styles: {
                ...slide.imageContainer?.styles,
                ...updatedData.imageContainer?.styles,
              },
            },
            dropContainer: {
              ...slide.dropContainer,
              ...updatedData.dropContainer,
              dropItems: updatedData.dropContainer?.dropItems || slide.dropContainer?.dropItems || [],
            },
          };
        }
        return slide;
      })
    );

    setSlidesPreview((prevPreviews) =>
      prevPreviews.map((preview) => {
        if (preview.id === slideId) {
          const updatedPreview = {
            ...preview,
            title: updatedData.titleContainer?.title || preview.title,
            titleContainer: {
              ...preview.titleContainer,
              ...updatedData.titleContainer,
              styles: {
                ...preview.titleContainer?.styles,
                ...updatedData.titleContainer?.styles,
              },
            },
            descriptionContainer: {
              ...preview.descriptionContainer,
              ...updatedData.descriptionContainer,
              styles: {
                ...preview.descriptionContainer?.styles,
                ...updatedData.descriptionContainer?.styles,
              },
            },
            imageContainer: {
              ...preview.imageContainer,
              ...updatedData.imageContainer,
              styles: {
                ...preview.imageContainer?.styles,
                ...updatedData.imageContainer?.styles,
              },
            },
            dropContainer: {
              dropItems: updatedData.dropContainer?.dropItems || [],
            },
          };
          return {
            ...updatedPreview,
            content: renderSlideComponent(updatedPreview),
          };
        }
        return preview;
      })
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header slideDockers={slideDockers} setSlideDockers={setSlideDockers} presentationId={presentationId} presentationDocumentId={presentationDocumentId} slides={slides} setGenerateAi={() => setShowPopup(true)} startPresentation={startPresentation} />
      <Toaster position="top-right" richColors />
      {isPresentationMode && (
        <PresentationMode
          slides={slides}
          startIndex={presentationStartIndex}
          onClose={() => setIsPresentationMode(false)}
          renderSlide={renderSlideComponent}
          presentationId={presentationId} // Pass presentationId
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          {slidesPreview.length > 0 && (
            <ResizableSidebar
              setCurrentSlide={setCurrentSlide}
              slidesPreview={slidesPreview}
              setSlidesPreview={setSlidesPreview}
              deleteSlide={deleteSlide}
              slideImages={slideImages}
            />
          )}
        </DndContext>
        <main className="flex-1 overflow-y-auto">
          {generateAi ? (
            <div className="space-y-4">
              <GenerateAi
                inputData={aiInputData}
                setShowPopup={setShowPopup}
                setIsLoadingCopy={setIsLoadingCopy}
                setSlidesPreview={setSlidesPreview}
                setSlides={setSlides}
                setGenerateAi={setGenerateAi}
                onError={() => {
                  setIsGenerating(false);
                  setIsLoadingCopy(false);
                  toast.error("Generation failed. Please try again.");
                }}
                onComplete={() => {
                  setIsGenerating(false);
                  setIsAiGenerated(true);
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {slides.map((slideData, index) => (
                <div key={slideData.id} className="relative">
                  <div id={`slide-${slideData.id}`} className="mb-4">
                    {renderSlideComponent(slideData)}
                  </div>
                  <div className="flex justify-center align-middle justify-self-center">
                    <AddButtonAi index={index} addNewSlide={addNewSlide} />
                  </div>
                </div>
              ))}

              {slides.length > 0 && (
                <Card className="bg-white/10 backdrop-blur-lg border-0">
                  <CardContent className="p-6 flex justify-center gap-4">
                    <Button
                      onClick={downloadPPT}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Presentation
                    </Button>
                    <Button
                      onClick={handleSaveSlide}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>

      <Dialog open={showPopup} onOpenChange={(open) => setShowPopup(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate with Gemini AI</DialogTitle>
            <DialogDescription>Enter the prompt for AI generation:</DialogDescription>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter your prompt..."
            value={aiInputData}
            onChange={(e) => setAiInputData(e.target.value)}
          />
          <DialogFooter>
            <Button
              onClick={() => {
                handleAiPopupSubmit();
                setShowPopup(false);
              }}
              disabled={!aiInputData || isLoadingCopy}
            >
              {isLoadingCopy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Home />
    </div>
  );
}