import React, { useState, useEffect } from "react"
import { Header } from "@/components/docView/Header"
import { ResizableSidebar } from "@/components/docView/ResizableSidebar"
import CardTemplates from "./slidesView/CardTemplates"
import { closestCorners, DndContext } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import Home from "../Home/Home"
import GenerateAi from "./GenerateAi/GenerateAi"
import { Download, Loader2, Save, Send } from "lucide-react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { PresentationMode } from "./PresentationMode"
// import ImpressPresentation from "./ImpressPresentation"
import AddButtonAi from "./GenerateAi/AiComponents/AddButtonAi"
import html2canvas from "html2canvas"
import { debounce } from "lodash"
import { Card, CardContent } from "../ui/card"
import pptxgen from "pptxgenjs"
import { toast, Toaster } from "sonner"

import { useLocation, useNavigate } from "react-router-dom"
import AccentImageAi from "./GenerateAi/AiComponents/AccentImageAi"
import TwoColumnAi from "./GenerateAi/AiComponents/TwoColumnAi"
import ImageTextAi from "./GenerateAi/AiComponents/ImageTextAi"
import ThreeColumnAi from "./GenerateAi/AiComponents/ThreeColumnAi"
import DefaultAi from "./GenerateAi/AiComponents/DefaultAi"
import { v4 as uuidv4 } from "uuid"
import { useDroppedItems } from "./DroppedItemsContext"
export default function Page() {
  const [currentSlide, setCurrentSlide] = useState(1)
  const [slidesPreview, setSlidesPreview] = useState([])
  const [slides, setSlides] = useState([])
  const [slideImages, setSlideImages] = useState([])
  const [generateAi, setGenerateAi] = useState(false)
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [presentationStartIndex, setPresentationStartIndex] = useState(0)
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(false) // Add this state

  const [isLoadingCopy, setIsLoadingCopy] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [aiInputData, setAiInputData] = useState("")
  const [isAiGenerated, setIsAiGenerated] = useState(false)
  const [isImpressPresent,setIsImpressPresent] = useState(false)
  const [ArraySlides, setArraySlides] = useState(() => {
    const savedSlides = JSON.parse(localStorage.getItem("slides")) || []
    return savedSlides
  })
  const location = useLocation()
  const { droppedItems } = useDroppedItems();

  // const { slidesArray } = location.state || {}; // Extract slidesArray
  // useEffect(() => {
  //   console.log(slidesArray)
  // },[])

  // useEffect(() => {
  //   if (slide && slide.length > 0) { // Ensure slide is not empty
  //     setSlides(slide);
  //     console.log("Slide updated:", slide);
  //     alert("Slide updated successfully!");
  //   }
  // }, [slide]);

  // useEffect(() => {
  //   console.log("Slides state updated:", slides);
  // }, [slides]);

  const [credits, setCradits] = useState(() => {
    // Initialize from localStorage or default to 50
    const savedCredits = localStorage.getItem("credits")
    return savedCredits !== null ? Number.parseInt(savedCredits) : 50
  })
  useEffect(() => {
    const slideElement = document.getElementById(`at-${currentSlide}`)
    if (slideElement) {
      slideElement.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentSlide])

  const handleSaveSlide = () => {
  try {
    // Validate slides before proceeding
    if (!slides || slides.length === 0) {
      toast.error("No slides to save!");
      return;
    }

    // Create a clean slide entry
    const newEntry = {
      key: location.state?.key || Date.now(),
      slides: slides.map((slide) => {
        // Validate and clean slide data
        if (!slide.id) {
          console.warn("Slide missing ID, generating new one:", slide);
          slide.id = uuidv4();
        }
        
        // Base slide structure
        const cleanSlide = {
          id: slide.id,
          type: slide.type || "custom",
          title: slide.titleContainer?.title || "Untitled",
          titleContainer: {
            titleId: slide.titleContainer?.titleId || uuidv4(),
            title: slide.titleContainer?.title || "",
            styles: slide.titleContainer?.styles || {}
          },
          descriptionContainer: {
            descriptionId: slide.descriptionContainer?.descriptionId || uuidv4(),
            description: slide.descriptionContainer?.description || "",
            styles: slide.descriptionContainer?.styles || {}
          },
          imageContainer: {
            imageId: slide.imageContainer?.imageId || uuidv4(),
            image: slide.imageContainer?.image || null,
            styles: slide.imageContainer?.styles || {}
          },
          dropContainer: {
            dropItems: (slide.dropContainer?.dropItems || []).map(item => ({
              id: item.id || uuidv4(), // Ensure ID exists
              type: item.type || "text", // Default type
              content: item.content || "",
              styles: item.styles || {}
            }))
          }
        };

        // Handle type-specific properties
        switch (slide.type) {
          case "twoColumn":
            if (slide.columns) {
              cleanSlide.columns = slide.columns.map(column => ({
                id: column.id || uuidv4(),
                content: column.content || "",
                styles: column.styles || {}
              }));
            }
            break;

          case "threeImgCard":
            if (slide.cards) {
              cleanSlide.cards = slide.cards.map(card => ({
                id: card.id || uuidv4(),
                headingContainer: {
                  heading: card.headingContainer?.heading || "",
                  styles: card.headingContainer?.styles || {}
                },
                descriptionContainer: {
                  description: card.descriptionContainer?.description || "",
                  styles: card.descriptionContainer?.styles || {}
                },
                image: card.image || null
              }));
            }
            break;

          default:
            // No additional processing for other types
            break;
        }

        return cleanSlide;
      })
    };

    // Update state and storage
    setArraySlides((prevArraySlides) => {
      const existingIndex = prevArraySlides.findIndex(group => group.key === newEntry.key);
      let updatedArraySlides;

      if (existingIndex !== -1) {
        // Update existing entry
        updatedArraySlides = prevArraySlides.map(group =>
          group.key === newEntry.key ? newEntry : group
        );
      } else {
        // Add new entry
        updatedArraySlides = [...prevArraySlides, newEntry];
      }

      // Save to localStorage with error handling
      try {
        localStorage.setItem("slides", JSON.stringify(updatedArraySlides));
        
        // Update trash collection
        const trash = JSON.parse(localStorage.getItem("trash") || "[]");
        const updatedTrash = trash.filter(slide => slide.key !== newEntry.key);
        localStorage.setItem("trash", JSON.stringify(updatedTrash));
      } catch (storageError) {
        console.error("Failed to save to localStorage:", storageError);
        toast.error("Failed to save presentation!");
        return prevArraySlides; // Return previous state if save fails
      }

      return updatedArraySlides;
    });

    // Success feedback and navigation
    toast.success("Presentation saved successfully!");
    navigate("/home");

  } catch (error) {
    console.error("Error saving presentation:", error);
    toast.error("Failed to save presentation!");
  }
};
  
  const renderSlideComponent = (slideData) => {
    if (!slideData) return null

    if (slideData.type === "custom") {
      return (
        <CardTemplates
          key={slideData.id}
          slidesPreview={slidesPreview}
          id={slideData.id}
          setSlides={setSlides}
          setCurrentSlide={setCurrentSlide}
          setSlidesPreview={setSlidesPreview}
        />
      )
    }

    const commonProps = {
      generateAi: {
        ...slideData,
        onEdit: (updated) => handleSlideUpdate(slideData.id, updated),
        onDelete: () => deleteSlide(slideData.id),
      }
    }

    const components = {
      accentImage: AccentImageAi,
      twoColumn: TwoColumnAi,
      imageCardText: ImageTextAi,
      threeImgCard: ThreeColumnAi,
      default: DefaultAi,
    }

    const Component = components[slideData.type] || components.default
    return <Component {...commonProps} key={slideData.id} />
  }
  
  useEffect(() => {
    if (location.state?.slidesArray) {
      const normalizedSlides = location.state.slidesArray.map(slide => ({
        id: slide.id || uuidv4(),
        type: slide.type || 'custom',
        titleContainer: {
          titleId: slide.titleContainer?.titleId || uuidv4(),
          title: slide.titleContainer?.title || 'Untitled',
          styles: slide.titleContainer?.styles || {}
        },
        descriptionContainer: {
          descriptionId: slide.descriptionContainer?.descriptionId || uuidv4(),
          description: slide.descriptionContainer?.description || '',
          styles: slide.descriptionContainer?.styles || {}
        },
        imageContainer: {
          imageId: slide.imageContainer?.imageId || uuidv4(),
          image: slide.imageContainer?.image || null,
          styles: {
            ...(slide.imageContainer?.styles || {}),
            width: slide.imageContainer?.styles?.width || 300,
            height: slide.imageContainer?.styles?.height || 210
          }
        },
        dropContainer: {
          dropItems: (slide.dropContainer?.dropItems || []).map(item => ({
            id: item.id || uuidv4(),
            type: item.type || 'text',
            content: item.content || '',
            styles: item.styles || {}
          }))
        },
        columns: slide.columns?.map(col => ({
      contentId: col.contentId || uuidv4(),
      content: col.content || '',
      styles: col.styles || {}
    })) || [],
    // For ThreeImgTextAi
    cards: slide.cards?.map(card => ({
      image: card.image,
      headingContainer: {
        headingId: card.headingContainer?.headingId || uuidv4(),
        heading: card.headingContainer?.heading,
        styles: card.headingContainer?.styles || {}
      },
      descriptionContainer: {
        descriptionId: card.descriptionContainer?.descriptionId || uuidv4(),
        description: card.descriptionContainer?.description,
        styles: card.descriptionContainer?.styles || {}
      }
    })) || []
      }));
  
      setSlides(normalizedSlides);
  
      const newSlidesPreview = normalizedSlides.map((slide, index) => ({
        number: index + 1,
        id: slide.id,
        title: slide.titleContainer?.title || 'Untitled',
        type: slide.type,
        content: renderSlideComponent(slide),
        onClick: () => setCurrentSlide(index + 1),
        titleContainer: slide.titleContainer,
        descriptionContainer: slide.descriptionContainer,
        imageContainer: slide.imageContainer,
        dropContainer: slide.dropContainer,
      }));
  
      setSlidesPreview(newSlidesPreview);
    } else {
      const defaultSlide = {
        id: uuidv4(),
        type: 'custom',
        titleContainer: {
          titleId: uuidv4(),
          title: 'New Presentation',
          styles: {}
        },
        descriptionContainer: {
          descriptionId: uuidv4(),
          description: '',
          styles: {}
        },
        imageContainer: {
          imageId: uuidv4(),
          image: null,
          styles: {
            width: 300,
            height: 210
          }
        },
        dropContainer: {
          dropItems: []
        }
      };
  
      setSlides([defaultSlide]);
      setSlidesPreview([{
        number: 1,
        id: defaultSlide.id,
        title: 'New Presentation',
        type: 'custom',
        content: renderSlideComponent(defaultSlide),
        onClick: () => setCurrentSlide(1),
        titleContainer: defaultSlide.titleContainer,
        descriptionContainer: defaultSlide.descriptionContainer,
        imageContainer: defaultSlide.imageContainer,
        dropContainer: defaultSlide.dropContainer
      }]);
    }
  }, [location.state?.slidesArray]);
  // console.log('Slides state updated:', slides);

// Add a verification useEffect
useEffect(() => {
  slides.length >0 ? console.log("Slide : ",slides):null;
}, [slides]);
  
  const handleDragEnd = (e) => {
  const { active, over } = e;
  if (!over || active.id === over.id) return;

  // Update main slides state
  setSlides((prev) => {
    const originalPos = prev.findIndex((item) => item.id === active.id);
    const newPos = prev.findIndex((item) => item.id === over.id);
    return arrayMove(prev, originalPos, newPos);
  });

  // Update slides preview state
  setSlidesPreview((prev) => {
    const originalPos = prev.findIndex((item) => item.id === active.id);
    const newPos = prev.findIndex((item) => item.id === over.id);
    return arrayMove(prev, originalPos, newPos);
  });
};      

useEffect(() => {
  // Update slide numbers in preview
  setSlidesPreview(prev => 
    prev.map((slide, index) => ({
      ...slide,
      number: index + 1,
      onClick: () => setCurrentSlide(index + 1)
    }))
  );
}, [slides.length]); // Trigger when slide count changes

  const handleAiPopupSubmit = () => {
    const currentCredits = Number.parseInt(localStorage.getItem("credits") || "50")
    if (currentCredits >= 40) {
      setIsGenerating(true)
      setIsLoadingCopy(true)
      setGenerateAi(true)
      const newCredits = currentCredits - 40
      setCradits(newCredits)
      localStorage.setItem("credits", newCredits)
      toast.success("Presentation generated successfully!")
    } else {
      toast.error("Insufficient credits. Please purchase more.")
    }
  }

  const startPresentation = (fromBeginning = true) => {
    setPresentationStartIndex(fromBeginning ? 0 : currentSlide - 1)
    setIsPresentationMode(true)
  }

  const getBase64FromImgElement = async (imgElement) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        const base64 = canvas.toDataURL("image/png")
        resolve(base64)
      }

      img.onerror = reject
      img.crossOrigin = "anonymous"
      img.src = imgElement
    })
  }

  const parseStyles = (content, styles = {}) => {
    const combinedStyles = { ...styles }

    if (content?.includes("color:")) {
      const colorMatch = content.match(/color:\s*rgb$$([^)]+)$$/)
      if (colorMatch) {
        const [r, g, b] = colorMatch[1].split(",").map((n) => Number.parseInt(n.trim()))
        combinedStyles.color = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
      }
    }

    if (content?.includes("<strong>") || styles.bold) combinedStyles.bold = true
    if (content?.includes("<em>") || styles.italic) combinedStyles.italic = true
    if (content?.includes("<u>") || styles.underline) combinedStyles.underline = true
    if (content?.includes('class="ql-align-center"')) combinedStyles.align = "center"
    if (content?.includes('class="ql-align-right"')) combinedStyles.align = "right"

    if (styles.header) {
      switch (styles.header) {
        case 1:
          combinedStyles.fontSize = 32
          break
        case 2:
          combinedStyles.fontSize = 18
          break
        case 3:
          combinedStyles.fontSize = 14
          break
        default:
          combinedStyles.fontSize = 12
      }
    }

    return combinedStyles
  }

  const addStyledText = (pptSlide, text, content, styles = {}, options = {}) => {
    if (text && typeof text === "string") {
      const parsedStyles = parseStyles(content, styles)
      pptSlide.addText(text.replace(/<[^>]+>/g, "").trim(), {
        color: "#FFFFFF",
        fontFace: "Arial",
        fontSize: 14,
        align: parsedStyles.align || "left",
        ...parsedStyles,
        ...options,
      })
    }
  }

  const processMainContent = async (pptSlide, slideData, type) => {
    const title = slideData.titleContainer?.title?.replace(/<[^>]+>/g, "") || ""
    const description = slideData.descriptionContainer?.description?.replace(/<[^>]+>/g, "") || ""

    switch (type) {
      case "accentImage":
        addStyledText(pptSlide, title, slideData.titleContainer?.title, slideData.titleContainer?.styles, {
          x: 0.5,
          y: 0.5,
          w: "60%",
          h: 1,
        })

        addStyledText(
          pptSlide,
          description,
          slideData.descriptionContainer?.description,
          slideData.descriptionContainer?.styles,
          {
            x: 0.5,
            y: 1.5,
            w: "60%",
            h: 3,
          },
        )

        if (slideData.imageContainer?.image) {
          try {
            const base64Image = await getBase64FromImgElement(slideData.imageContainer.image)
            pptSlide.addImage({
              data: base64Image,
              x: 5.5,
              y: 1.5,
              w: 4,
              h: 3,
            })
          } catch (error) {
            console.error("Failed to add image:", error)
          }
        }
        break

      case "threeImgCard":
        addStyledText(pptSlide, title, slideData.titleContainer?.title, slideData.titleContainer?.styles, {
          x: 0.5,
          y: 0.3,
          w: "90%",
          h: 0.8,
          align: "center",
        })

        if (slideData.cards) {
          for (let i = 0; i < slideData.cards.length; i++) {
            const card = slideData.cards[i]
            const xOffset = 0.5 + i * 3.3

            if (card.image) {
              try {
                const base64Image = await getBase64FromImgElement(card.image)
                pptSlide.addImage({
                  data: base64Image,
                  x: xOffset,
                  y: 1.3,
                  w: 2.8,
                  h: 2,
                })
              } catch (error) {
                console.error(`Failed to add card image ${i}:`, error)
              }
            }

            addStyledText(
              pptSlide,
              card.headingContainer?.heading,
              card.headingContainer?.heading,
              card.headingContainer?.styles,
              {
                x: xOffset,
                y: 3.4,
                w: 2.8,
                h: 0.6,
                align: "center",
                fontSize: 14,
                bold: true,
              },
            )

            addStyledText(
              pptSlide,
              card.descriptionContainer?.description,
              card.descriptionContainer?.description,
              card.descriptionContainer?.styles,
              {
                x: xOffset,
                y: 4.1,
                w: 2.8,
                h: 1,
                align: "center",
                fontSize: 12,
              },
            )
          }
        }
        break

      case "twoColumn":
        addStyledText(pptSlide, title, slideData.titleContainer?.title, slideData.titleContainer?.styles, {
          x: 0.5,
          y: 0.5,
          w: "90%",
          h: 1,
        })

        slideData.columns?.forEach((column, idx) => {
          const content = column.content?.replace(/<[^>]+>/g, "") || ""
          addStyledText(pptSlide, content, column.content, column.styles, {
            x: idx === 0 ? 0.5 : 5.5,
            y: 1.5,
            w: "45%",
            h: 3,
          })
        })
        break

      default:
        addStyledText(pptSlide, title, slideData.titleContainer?.title, slideData.titleContainer?.styles, {
          x: 0.5,
          y: 0.5,
          w: "90%",
          h: 1,
        })

        addStyledText(
          pptSlide,
          description,
          slideData.descriptionContainer?.description,
          slideData.descriptionContainer?.styles,
          {
            x: 0.5,
            y: 1.5,
            w: "90%",
            h: 4,
          },
        )
    }
  }

  const processDroppedItems = async (pptSlide, dropItems) => {
    let yOffset = 5

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
            // For video, we'll add a media object
            const width = item.styles?.width ? item.styles.width / 100 : 4;
            const height = item.styles?.height ? item.styles.height / 100 : 3;
            
            // Remove the data URL prefix to get just the base64 content
            
            
            pptSlide.addMedia({
              type: 'video',
              data: item.content,
              x: 0.5,
              y: yOffset,
              w: width,
              h: height,
              extension: '.mp4'
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
              type: 'audio',
              data: item.content,
              x: 0.5,
              y: yOffset,
              w: width,
              h: height,
              extension: '.mp3'
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
          const content = item.content?.replace(/<[^>]+>/g, "") || ""
          addStyledText(pptSlide, content, item.content, item.styles, {
            x: 0.5,
            y: yOffset,
            w: "90%",
            h: 0.8,
          })
          yOffset += 1
          break
      }
    }
  }

  const downloadPPT = async () => {
    console.log("Starting PowerPoint generation...")
    try {
      const pptx = new pptxgen()

      for (const slideData of slides) {
        const pptSlide = pptx.addSlide()
        pptSlide.background = { color: "#342c4e" }

        await processMainContent(pptSlide, slideData, slideData.type || "default")

        if (slideData.dropContainer?.dropItems) {
          await processDroppedItems(pptSlide, slideData.dropContainer.dropItems)
        }
      }

      console.log("Saving PowerPoint file...")
      await pptx.writeFile({ fileName: "presentation.pptx" })
      console.log("PowerPoint generation completed successfully.")
      toast.success("PowerPoint downloaded successfully!")
    } catch (error) {
      console.error("PPT Generation Error:", error)
      toast.error("Failed to generate PowerPoint. Please check console for details.")
    }
  }

  const generateSlidePreview = async (slideElement) => {
    if (slideElement) {
      const canvas = await html2canvas(slideElement, {
        scale: 1, // Increased from 0.2 for better quality
        logging: false,
        useCORS: true,
      })
      return canvas.toDataURL("image/png", 1.0) // Use PNG format with max quality
    }
    return null
  }

  const updateSlideImages = async () => {
    const newImages = await Promise.all(
      slides.map(async (slide) => {
        const element = document.getElementById(`at-${slide.id}`)
        return element ? await generateSlidePreview(element) : null
      }),
    )
    setSlideImages(newImages)
  }

  const debouncedUpdateSlideImages = debounce(updateSlideImages, 300)

  const addNewSlide = async (index) => {
    const newSlide = {
      number: index + 1,
      id: uuidv4(),
      type: "custom", // Add type identifier
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
    }

    setSlides(prev => [...prev.slice(0, index), newSlide, ...prev.slice(index)]);
    setSlidesPreview(prev => [...prev.slice(0, index), newSlide, ...prev.slice(index)]);
  }

  const deleteSlide = (slideId) => {
    setSlides(prevSlides => prevSlides.filter(slide => slide.id !== slideId))
    setSlidesPreview(prevSlides => prevSlides.filter(slide => slide.id !== slideId))
  }

  useEffect(() => {
    debouncedUpdateSlideImages()
  }, [slides])      

  useEffect(() => {
  const savedSlides = JSON.parse(localStorage.getItem("slides")) || [];
  setArraySlides(savedSlides.map(slideGroup => ({ 
    ...slideGroup,
    slides: slideGroup.slides.map(slide => ({
      type: slide.type || 'custom', // Handle legacy slides
      ...slide
    }))
  })));
}, []);

  // const startImpress = () => {
  //   setIsImpressPresent(true);
  // }

  const handleSlideUpdate = (slideId, updatedData) => {
    console.log("slide Update : ",slideId);
    
    setSlides(prevSlides =>
    prevSlides.map(slide => {
      if (slide.id === slideId) {
        return {
          ...slide,
          ...updatedData,
          // Merge existing titleContainer with updates
          titleContainer: {
            ...slide.titleContainer,
            ...updatedData.titleContainer,
            styles: {
              ...slide.titleContainer?.styles,
              ...updatedData.titleContainer?.styles,
            },
          },
          // Merge existing descriptionContainer with updates
          descriptionContainer: {
            ...slide.descriptionContainer,
            ...updatedData.descriptionContainer,
            styles: {
              ...slide.descriptionContainer?.styles,
              ...updatedData.descriptionContainer?.styles,
            },
          },
          // Merge existing imageContainer with updates
          imageContainer: {
            ...slide.imageContainer,
            ...updatedData.imageContainer,
            styles: {
              ...slide.imageContainer?.styles,
              ...updatedData.imageContainer?.styles,
            },
          },
          // Preserve existing dropItems if not in update
          dropContainer: {
            ...slide.dropContainer, // Preserve existing properties
            ...updatedData.dropContainer, // Merge new properties
            dropItems: 
              updatedData.dropContainer?.dropItems || // Use new dropItems if provided
              slide.dropContainer?.dropItems || [] // Fallback to existing or empty array
          },
        };
      }
      return slide;
    })
  );

    setSlidesPreview(prevPreviews =>
      prevPreviews.map(preview => {
        if (preview.id === slideId) {
          const updatedPreview = {
            ...preview,
            title: updatedData.titleContainer?.title || preview.title,
            titleContainer: {
              ...preview.titleContainer,
              ...updatedData.titleContainer,
              styles: {
                ...preview.titleContainer?.styles,
                ...updatedData.titleContainer?.styles
              }
            },
            descriptionContainer: {
              ...preview.descriptionContainer,
              ...updatedData.descriptionContainer,
              styles: {
                ...preview.descriptionContainer?.styles,
                ...updatedData.descriptionContainer?.styles
              }
            },
            imageContainer: {
              ...preview.imageContainer,
              ...updatedData.imageContainer,
              styles: {
                ...preview.imageContainer?.styles,
                ...updatedData.imageContainer?.styles
              }
            },
            dropContainer: {
              dropItems: updatedData.dropContainer?.dropItems || []
            }
          };
          return {
            ...updatedPreview,
            content: renderSlideComponent(updatedPreview)
          };
        }
        return preview;
      })
    );
  };


  return (
    <div className="h-screen flex flex-col bg-background">
      <Header setGenerateAi={() => setShowPopup(true)} startPresentation={startPresentation} />

      <Toaster position="top-right" richColors />
      {isPresentationMode && (
        <PresentationMode
          slides={slides}
          startIndex={presentationStartIndex}
          onClose={() => setIsPresentationMode(false)}
          renderSlide={renderSlideComponent} // Pass your existing render function
        />
      )}
      {/* {isImpressPresent && (
        <ImpressPresentation 
          slides={slides} 
          onClose={() => setIsImpressPresent(false)} 
        />
        )
      } */}
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
              setIsGenerating(false)
              setIsLoadingCopy(false)
              toast.error("Generation failed. Please try again.")
            }}
            onComplete={() => {
              setIsGenerating(false)
              setIsAiGenerated(true)
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
                <div className="flex justify-center align-middle justify-self-center ">
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

      {/* AI Input Dialog */}
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
                handleAiPopupSubmit()
                setShowPopup(false)
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
  )
}
