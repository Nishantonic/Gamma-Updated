import React, { useState, useEffect } from "react"
import { Header } from "@/components/docView/Header"
import { ResizableSidebar } from "@/components/docView/ResizableSidebar"
import CardTemplates from "./slidesView/CardTemplates"
import { closestCorners, DndContext } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import AddButton from "./slidesView/AddButton"
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
import AddButtonAi from "./GenerateAi/AiComponents/AddButtonAi"
import html2canvas from "html2canvas"
import { debounce } from "lodash"
import { Card, CardContent } from "../ui/card"
import pptxgen from "pptxgenjs"
import { v4 as uuidv4 } from "uuid"
import js from "@eslint/js"
import { toast, Toaster } from "sonner"

import {  useLocation, useNavigate } from "react-router-dom"

export default function Page() {
  const [currentSlide, setCurrentSlide] = useState(1)
  const [slidesPreview, setSlidesPreview] = useState([])
  const [slides, setSlides] = useState([])
  const [slideImages, setSlideImages] = useState([])
  const [generateAi, setGenerateAi] = useState(false)
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [presentationStartIndex, setPresentationStartIndex] = useState(0)
  const navigate = useNavigate();

 



  const [isGenerating, setIsGenerating] = useState(false); // Add this state
  
  const [isLoadingCopy, setIsLoadingCopy] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [aiInputData, setAiInputData] = useState("")
  const [isAiGenerated, setIsAiGenerated] = useState(false)

  const [ArraySlides, setArraySlides] = useState(() => {
    const savedSlides = JSON.parse(localStorage.getItem("slides")) || [];
    return savedSlides;
});
const location = useLocation();
  const { slide } = location.state || {};


  

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
      const savedCredits = localStorage.getItem('credits');
      return savedCredits !== null ? parseInt(savedCredits) : 50;
    });
  useEffect(() => {
    const slideElement = document.getElementById(`at-${currentSlide}`)
    if (slideElement) {
      slideElement.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentSlide])

  const handleSaveSlide = () => {
    if (slides.length > 0) {
      const newEntry =  {key: Date.now(), slides} ; // Create a new slide group with a unique key
      const updatedSlides = [...ArraySlides, newEntry]; // Append the new group
      setArraySlides(updatedSlides);
      setSlides(updatedSlides)
      localStorage.setItem("slides", JSON.stringify(updatedSlides));
  }
  navigate("/home");
  };

 
  useEffect(() => {
    const initialSlides = [
      {
        number: 1,
        id: 1,
        title: "Customer Targeting Strategy",
        content: (
          <div className="flex justify-center">
            <CardTemplates
              slidesPreview={slidesPreview}
              id={1}
              setSlides={setSlides}
              setCurrentSlide={setCurrentSlide}
              setSlidesPreview={setSlidesPreview}
            />
          </div>
        ),
        onClick: () => setCurrentSlide(1),
      },
    ]
    setSlidesPreview(initialSlides)
    setSlides(
      initialSlides.map((slide) => ({
        Slide: slide.content,
        id: slide.id,
      })),
    )
    updateSlideImages()
  }, [])

  const handleDragEnd = (e) => {
    const { active, over } = e
    if (!over || active.id === over.id) return

    setSlidesPreview((prev) => {
      const originalPos = prev.findIndex((item) => item.id === active.id)
      const currentPos = prev.findIndex((item) => item.id === over.id)
      const updatedPreview = arrayMove(prev, originalPos, currentPos)

      // Sync main slides
      setSlides(
        updatedPreview.map((item) => ({
          Slide: item.content,
          id: item.id,
        })),
      )

      return updatedPreview.map((item, index) => ({
        ...item,
        number: index + 1,
      }))
    })
  }

  const handleAiPopupSubmit = () => {
    // if (isGenerating) return;
    const currentCredits = parseInt(localStorage.getItem('credits') || '50');
    if (currentCredits >= 40) {
      setIsGenerating(true);
      setIsLoadingCopy(true);
      setGenerateAi(true);
      const newCredits = currentCredits - 40;
      setCradits(newCredits);
      localStorage.setItem('credits', newCredits);
      toast.success("Presentation generated successfully!");
    } else {
      toast.error("Insufficient credits. Please purchase more.");
    }
  };

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
  console.log("Initial slides data:", JSON.stringify(slides, null, 2));

  console.log("Starting PowerPoint generation...");
  try {
    const pptx = new pptxgen();

    for (let index = 0; index < slides.length; index++) {
      const slideData = slides[index];
      const generateAi = slideData.Slide?.props?.generateAi || {};
      const slideType = generateAi.type || 'default';

      // Debug logging for slide data
      console.log(`Slide ${index + 1} data:`, {
        slideId: slideData.id,
        type: slideType,
        generateAi: generateAi,
        title: generateAi.title,
        description: generateAi.description,
      });

      const pptSlide = pptx.addSlide();
      pptSlide.background = { color: "#342c4e" };

      const addStyledText = (text, options) => {
        if (text && typeof text === "string") {
          console.log("Adding text to slide:", text);
          pptSlide.addText(text, {
            color: "#FFFFFF",
            fontFace: "Arial",
            fontSize: 12,
            ...options,
          });
        } else {
          console.log("Skipping empty or invalid text:", text);
        }
      };

      // Get title and description from generateAi
      const title = generateAi.title || "";
      const description = generateAi.description || "";

      switch (slideType) {
        case "accentImage": {
          console.log("Processing accentImage slide:", { title, description });

          addStyledText(title, {
            x: 0.5,
            y: 0.5,
            w: "50%",
            h: 1,
          });

          addStyledText(description, {
            x: 0.5,
            y: 1.5,
            w: "50%",
            h: 3,
          });

          if (generateAi.image) {
            try {
              const base64Image = await getBase64FromImgElement(generateAi.image);
              if (base64Image) {
                pptSlide.addImage({
                  data: base64Image,
                  x: 5.5,
                  y: 1.5,
                  w: 4,
                  h: 3,
                });
              }
            } catch (error) {
              console.error("Failed to add image:", error);
            }
          }
          break;
        }

        case "twoColumn": {
          console.log("Processing twoColumn slide:", { title, description });

          addStyledText(title, {
            x: 0.5,
            y: 0.5,
            w: "90%",
            h: 1,
          });

          if (generateAi.columns?.[0]?.content) {
            addStyledText(generateAi.columns[0].content, {
              x: 0.5,
              y: 1.5,
              w: "45%",
              h: 3,
            });
          }

          if (generateAi.columns?.[1]?.content) {
            addStyledText(generateAi.columns[1].content, {
              x: 5.5,
              y: 1.5,
              w: "45%",
              h: 3,
            });
          }
          break;
        }

        case "imageCardText": {
          console.log("Processing imageCardText slide:", { title, description });

          if (generateAi.image) {
            try {
              const base64Image = await getBase64FromImgElement(generateAi.image);
              if (base64Image) {
                pptSlide.addImage({
                  data: base64Image,
                  x: 0.5,
                  y: 0.5,
                  w: 4,
                  h: 3,
                });
              }
            } catch (error) {
              console.error("Failed to add image:", error);
            }
          }

          addStyledText(title, {
            x: 5.5,
            y: 0.5,
            w: "45%",
            h: 1,
          });

          addStyledText(description, {
            x: 5.5,
            y: 1.5,
            w: "45%",
            h: 3,
          });
          break;
        }

        case "threeImgCard": {
          console.log("Processing threeImgCard slide:", { title });

          addStyledText(title, {
            x: 0.5,
            y: 0.5,
            w: "90%",
            h: 1,
          });

          if (generateAi.cards) {
            for (let i = 0; i < generateAi.cards.length; i++) {
              const card = generateAi.cards[i];
              const xOffset = i * 3.3;

              if (card.image) {
                try {
                  const base64Image = await getBase64FromImgElement(card.image);
                  if (base64Image) {
                    pptSlide.addImage({
                      data: base64Image,
                      x: 0.5 + xOffset,
                      y: 1.5,
                      w: 3,
                      h: 2,
                    });
                  }
                } catch (error) {
                  console.error("Failed to add card image:", error);
                }
              }

              addStyledText(card.heading, {
                x: 0.5 + xOffset,
                y: 3.5,
                w: 3,
                h: 0.5,
              });

              addStyledText(card.description, {
                x: 0.5 + xOffset,
                y: 4,
                w: 3,
                h: 1,
              });
            }
          }
          break;
        }

        default: {
          console.log("Processing default slide:", { title, description });

          addStyledText(title, {
            x: 0.5,
            y: 0.5,
            w: "90%",
            h: 1,
          });

          addStyledText(description, {
            x: 0.5,
            y: 1.5,
            w: "90%",
            h: 4,
          });
        }
      }
    }

    console.log("Saving PowerPoint file...");
    await pptx.writeFile({ fileName: "generated_presentation.pptx" });
    console.log("PowerPoint generation completed successfully.");
  } catch (error) {
    console.error("PPT Generation Error:", error);
    throw new Error("Failed to generate PowerPoint. Please check console for details.");
  }
};


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
      id: Date.now(),
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

    setSlidesPreview((prevSlides) => {
      const updatedSlides = [
        ...prevSlides.slice(0, index),
        newSlide,
        ...prevSlides.slice(index).map((slide) => ({ ...slide, number: slide.number + 1 })),
      ]
      return updatedSlides
    })

    setSlides((prevSlides) => {
      const newSlides = [
        ...prevSlides.slice(0, index),
        { Slide: newSlide.content, id: newSlide.id },
        ...prevSlides.slice(index),
      ]
      debouncedUpdateSlideImages()
      return newSlides
    })
  }

  const deleteSlide = (id) => {
    setSlidesPreview((prevSlides) => prevSlides.filter((slide) => slide.id !== id))
    setSlides((prevSlides) => {
      const newSlides = prevSlides.filter((slide) => slide.id !== id)
      debouncedUpdateSlideImages()
      return newSlides
    })
  }

  useEffect(() => {
    debouncedUpdateSlideImages()
  }, [slides])

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header setGenerateAi={() => setShowPopup(true)} startPresentation={startPresentation} />
      

      <Toaster position="top-right" richColors />
      {isPresentationMode && (
        <PresentationMode
          slides={slides}
          slideImages={slideImages}
          startIndex={presentationStartIndex}
          onClose={() => setIsPresentationMode(false)}
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
            <GenerateAi
              key={`ai-${aiInputData}-${Date.now()}`}
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
            />
          ) : (
            <div>
              {slides.map(({ Slide, id }, index) => (
                <React.Fragment key={id}>
                  <div id={`at-${id}`}>{Slide}</div>
                  <div className="flex justify-center align-middle justify-self-center ">
                    <AddButtonAi index={index} addNewSlide={addNewSlide} />
                  </div>
                </React.Fragment >
              )) }
              {/* {isAiGenerated && ( */}
                <Card className="bg-white/10 backdrop-blur-lg border-0">
                  <CardContent className="p-6 flex justify-center">
                    <Button onClick={downloadPPT} className="bg-green-600 hover:bg-green-700 text-white" size="lg">
                      <Download className="mr-2 h-4 w-4" />
                      Download Presentation
                    </Button>

                    <Button onClick={handleSaveSlide} className="bg-green-600 hover:bg-green-700 ml-2 text-white" size="lg" 

                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </CardContent>
                </Card>
              {/* )} */}
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