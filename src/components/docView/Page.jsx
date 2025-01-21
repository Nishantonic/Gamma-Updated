import React, { useState, useEffect } from "react";
import { Header } from "@/components/docView/Header";
import { ResizableSidebar } from "@/components/docView/ResizableSidebar";
import CardTemplates from "./slidesView/CardTemplates";
import { closestCorners, DndContext } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import AddButton from "./slidesView/AddButton";
import Home from "../Home/Home";
import GenerateAi from "./GenerateAi/GenerateAi";
import { Loader2, Send } from "lucide-react";
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

export default function Page() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [slidesPreview, setSlidesPreview] = useState([]);
  const [slides, setSlides] = useState([]);
  const [generateAi, setGenerateAi] = useState(false);
  const [isLoadingCopy, setIsLoadingCopy] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [aiInputData, setAiInputData] = useState("");

  useEffect(() => {
    const slideElement = document.getElementById(`at-${currentSlide}`);
    if (slideElement) {
      slideElement.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentSlide]);

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
              setCurrentSlide={setCurrentSlide}
              setSlidesPreview={setSlidesPreview}
            />
          </div>
        ),
        onClick: () => setCurrentSlide(1),
      },
    ];
    setSlidesPreview(initialSlides);
    setSlides(
      initialSlides.map((slide) => ({
        Slide: slide.content,
        id: slide.id,
      }))
    );
  }, []);

  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    setSlidesPreview((prev) => {
      const originalPos = prev.findIndex((item) => item.id === active.id);
      const currentPos = prev.findIndex((item) => item.id === over.id);
      const updatedPreview = arrayMove(prev, originalPos, currentPos);

      // Sync main slides
      setSlides(
        updatedPreview.map((item) => ({
          Slide: item.content,
          id: item.id,
        }))
      );

      return updatedPreview.map((item, index) => ({
        ...item,
        number: index + 1,
      }));
    });
  };

  const handleAiPopupSubmit = () => {
  
  setGenerateAi(true); // Show AI generation UI
  setIsLoadingCopy(true); // Indicate loading state
};


  return (
    <div className="h-screen flex flex-col bg-background">
      <Header setGenerateAi={() => setShowPopup(true)} />
      <div className="flex flex-1 overflow-hidden">
        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          {slidesPreview.length > 0 && (
            <ResizableSidebar
              setCurrentSlide={setCurrentSlide}
              slidesPreview={slidesPreview}
              setSlidesPreview={setSlidesPreview}
            />
          )}
        </DndContext>
        <main className="flex-1 overflow-y-auto">
          {generateAi ? (
            <GenerateAi key={`ai-${Date.now()}`} inputData={aiInputData} setShowPopup={setShowPopup} setIsLoadingCopy={setIsLoadingCopy} />
          ) : (
            <div>
              {slides.map(({ Slide, id }) => (
                <div key={id} id={`at-${id}`}>
                  {Slide}
                </div>
              ))}
              <div className="flex w-full justify-center items-center relative mt-5">
                <AddButton
                  setCurrentSlide={setCurrentSlide}
                  slidesPreview={slidesPreview}
                  setSlidesPreview={setSlidesPreview}
                  setSlides={setSlides}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* AI Input Dialog */}
      <Dialog open={showPopup} onOpenChange={(open) => setShowPopup(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate with Gemini AI</DialogTitle>
            <DialogDescription>
              Enter the prompt for AI generation:
            </DialogDescription>
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
                setShowPopup(false); // Close dialog after submission
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
              <Button variant="ghost" >Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Home />
    </div>
  );
}
