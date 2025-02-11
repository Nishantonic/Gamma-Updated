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
  if (slides.length > 0) {
    const newEntry = {
      key: location.state?.key || Date.now(),
      slides: slides.map((slide) => {
        // Create a clean slide object without React components and unnecessary properties
        const cleanSlide = {
          id: slide.id,
          type: slide.type || "custom",
          title: slide.titleContainer?.title?.replace(/<[^>]*>/g, '') || "Untitled",
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
          }
        };

        // Add type-specific properties
        if (slide.type === "twoColumn" && slide.columns) {
          cleanSlide.columns = slide.columns.map(column => ({
            id: column.id || uuidv4(),
            content: column.content || "",
            styles: column.styles || {}
          }));
        }

        if (slide.type === "threeImgCard" && slide.cards) {
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

        return cleanSlide;
      })
    };

    setArraySlides((prevArraySlides) => {
      const existingIndex = prevArraySlides.findIndex(group => group.key === newEntry.key);
      let updatedArraySlides;

      if (existingIndex !== -1) {
        updatedArraySlides = prevArraySlides.map(group =>
          group.key === newEntry.key ? newEntry : group
        );
      } else {
        updatedArraySlides = [...prevArraySlides, newEntry];
      }

      // Save to localStorage
      localStorage.setItem("slides", JSON.stringify(updatedArraySlides));

      // Update trash if needed
      const trash = JSON.parse(localStorage.getItem("trash") || "[]");
      const updatedTrash = trash.filter(slide => slide.key !== newEntry.key);
      localStorage.setItem("trash", JSON.stringify(updatedTrash));

      return updatedArraySlides;
    });

    toast.success("Presentation saved successfully!");
    navigate("/home");
  } else {
    toast.error("No slides to save!");
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
    const savedSlides = location.state.slidesArray.map(slide => ({
      ...slide,
      titleContainer: {
        ...slide.titleContainer,
        styles: slide.titleContainer?.styles || {}
      },
      descriptionContainer: {
        ...slide.descriptionContainer,
        styles: slide.descriptionContainer?.styles || {}
      }
    }));

    setSlidesPreview(
      savedSlides.map((slide, index) => ({
        number: index + 1,
        id: slide.id,
        title: slide?.titleContainer?.title.replace(/<[^>]*>/g, '') || "Untitled",
        type: slide.type || "custom",
        content: renderSlideComponent(slide),
        onClick: () => setCurrentSlide(index + 1),
        titleContainer: slide.titleContainer,
        descriptionContainer: slide.descriptionContainer
      }))
    );

    setSlides(savedSlides);
    } else {
      // Default initialization for new presentation
      const initialSlides = [
        {
          number: 1,
          id: uuidv4(),
          title: "Customer Targeting Strategy",
          type: "custom",
          content: (
              <CardTemplates
                slidesPreview={slidesPreview}
                id={1}
                type="custom"
                setSlides={setSlides}
                setCurrentSlide={setCurrentSlide}
                setSlidesPreview={setSlidesPreview}
              />
          ),
          onClick: () => setCurrentSlide(1),
        },
      ]
      setSlidesPreview(initialSlides)
      setSlides(
        initialSlides.map((slide) => ({
          Slide: slide.content,
          id: slide.id,
          type: slide.type,
          title: slide.title,
        }))
      )
    }
    updateSlideImages()
  }, [location.state])

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
    //Implementation to convert image element to base64
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      imgElement.onload = () => {
        canvas.width = imgElement.width
        canvas.height = imgElement.height
        ctx.drawImage(imgElement, 0, 0)
        const base64 = canvas.toDataURL("image/png")
        resolve(base64)
      }
      imgElement.onerror = reject
      imgElement.src = imgElement.src // Trigger loading
    })
  }

  const downloadPPT = async () => {
  console.log("Starting PowerPoint generation...")
  try {
    const pptx = new pptxgen()

    // Helper function to parse styles from HTML content
    const parseStyles = (htmlContent, defaultStyles = {}) => {
      const styles = { ...defaultStyles }
      
      if (htmlContent?.includes('color:')) {
        const colorMatch = htmlContent.match(/color:\s*rgb\(([^)]+)\)/)
        if (colorMatch) {
          const [r, g, b] = colorMatch[1].split(',').map(n => parseInt(n.trim()))
          styles.color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
        }
      }
      
      if (htmlContent?.includes('<strong>')) styles.bold = true
      if (htmlContent?.includes('<em>')) styles.italic = true
      if (htmlContent?.includes('<sup>')) styles.superscript = true
      if (htmlContent?.includes('<sub>')) styles.subscript = true
      if (htmlContent?.includes('class="ql-align-center"')) styles.align = 'center'
      if (htmlContent?.includes('class="ql-align-right"')) styles.align = 'right'
      
      return styles
    }

    // Helper function to add text with styles
    const addStyledText = (pptSlide, text, htmlContent, options) => {
      if (text && typeof text === "string") {
        const styles = parseStyles(htmlContent)
        pptSlide.addText(text.trim(), {
          color: "#FFFFFF",
          fontFace: "Arial",
          fontSize: 12,
          ...styles,
          ...options,
        })
      }
    }

    for (let index = 0; index < slides.length; index++) {
      const slideData = slides[index]
      const type = slideData.type || "default"
      
      // Strip HTML but keep original HTML for style parsing
      const title = slideData.titleContainer?.title?.replace(/<[^>]+>/g, '') || ''
      const titleHtml = slideData.titleContainer?.title || ''
      const description = slideData.descriptionContainer?.description?.replace(/<[^>]+>/g, '') || ''
      const descriptionHtml = slideData.descriptionContainer?.description || ''

      const pptSlide = pptx.addSlide()
      pptSlide.background = { color: "#342c4e" }

      switch (type) {
        case "accentImage": {
          addStyledText(pptSlide, title, titleHtml, {
            x: 0.5,
            y: 0.5,
            w: "60%",
            h: 1,
            fontSize: 24
          })

          addStyledText(pptSlide, description, descriptionHtml, {
            x: 0.5,
            y: 1.5,
            w: "60%",
            h: 3,
            fontSize: 14
          })

          const imageUrl = slideData.imageContainer?.image
          if (imageUrl) {
            try {
              const base64Image = await getBase64FromImgElement(imageUrl)
              if (base64Image) {
                pptSlide.addImage({
                  data: base64Image,
                  x: 5.5,
                  y: 1.5,
                  w: 4,
                  h: 3,
                })
              }
            } catch (error) {
              console.error("Failed to add image:", error)
            }
          }
          break
        }

        case "twoColumn": {
          addStyledText(pptSlide, title, titleHtml, {
            x: 0.5,
            y: 0.5,
            w: "90%",
            h: 1,
            fontSize: 24
          })

          slideData.columns?.forEach((column, idx) => {
            const content = column.content?.replace(/<[^>]+>/g, '') || ''
            addStyledText(pptSlide, content, column.content, {
              x: idx === 0 ? 0.5 : 5.5,
              y: 1.5,
              w: "45%",
              h: 3,
              fontSize: 14
            })
          })
          break
        }

        case "threeImgCard": {
          // Add title with proper spacing
          addStyledText(pptSlide, title, titleHtml, {
            x: 0.5,
            y: 0.3,
            w: "90%",
            h: 0.8,
            align: 'center'
          })

          // Process cards synchronously to ensure all cards are added
          const processCards = async () => {
            const cardPromises = slideData.cards?.map(async (card, idx) => {
              const xOffset = 0.5 + (idx * 3.3)
              
              // Add image first
              if (card.image) {
                try {
                  const base64Image = await getBase64FromImgElement(card.image)
                  if (base64Image) {
                    pptSlide.addImage({
                      data: base64Image,
                      x: xOffset,
                      y: 1.3,
                      w: 2.8,
                      h: 2,
                    })
                  }
                } catch (error) {
                  console.error(`Failed to add image for card ${idx}:`, error)
                }
              }

              // Add heading
              const heading = card.headingContainer?.heading?.replace(/<[^>]+>/g, '') || ''
              addStyledText(pptSlide, heading, card.headingContainer?.heading, {
                x: xOffset,
                y: 3.4,
                w: 2.8,
                h: 0.6,
                align: 'center',
                fontSize: 14,
                bold: true
              })

              // Add description
              const cardDesc = card.descriptionContainer?.description?.replace(/<[^>]+>/g, '') || ''
              addStyledText(pptSlide, cardDesc, card.descriptionContainer?.description, {
                x: xOffset,
                y: 4.1,
                w: 2.8,
                h: 1,
                align: 'center',
                fontSize: 12
              })
            }) || []

            await Promise.all(cardPromises)
          }

          await processCards()
          break
        }

        default: {
          addStyledText(pptSlide, title, titleHtml, {
            x: 0.5,
            y: 0.5,
            w: "90%",
            h: 1,
            fontSize: 24
          })

          addStyledText(pptSlide, description, descriptionHtml, {
            x: 0.5,
            y: 1.5,
            w: "90%",
            h: 4,
            fontSize: 14
          })
        }
      }
    }

    console.log("Saving PowerPoint file...")
    await pptx.writeFile({ fileName: "generated_presentation.pptx" })
    console.log("PowerPoint generation completed successfully.")
  } catch (error) {
    console.error("PPT Generation Error:", error)
    throw new Error("Failed to generate PowerPoint. Please check console for details.")
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
  // Preserve all styling information when updating slides
  setSlides(prevSlides => 
    prevSlides.map(slide => {
      if (slide.id === slideId) {
        return {
          ...slide,
          ...updatedData,
          titleContainer: {
            ...slide.titleContainer,
            ...updatedData.titleContainer,
            styles: {
              ...slide.titleContainer?.styles,
              ...updatedData.titleContainer?.styles
            }
          },
          descriptionContainer: {
            ...slide.descriptionContainer,
            ...updatedData.descriptionContainer,
            styles: {
              ...slide.descriptionContainer?.styles,
              ...updatedData.descriptionContainer?.styles
            }
          }
        };
      }
      return slide;
    })
  );

  // Update preview with preserved styles
  setSlidesPreview(prevSlides =>
    prevSlides.map(slide => {
      if (slide.id === slideId) {
        const updatedSlide = {
          ...slide,
          ...updatedData,
          titleContainer: {
            ...slide.titleContainer,
            ...updatedData.titleContainer,
            styles: {
              ...slide.titleContainer?.styles,
              ...updatedData.titleContainer?.styles
            }
          },
          descriptionContainer: {
            ...slide.descriptionContainer,
            ...updatedData.descriptionContainer,
            styles: {
              ...slide.descriptionContainer?.styles,
              ...updatedData.descriptionContainer?.styles
            }
          }
        };
        return {
          ...updatedSlide,
          content: renderSlideComponent(updatedSlide)
        };
      }
      return slide;
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
