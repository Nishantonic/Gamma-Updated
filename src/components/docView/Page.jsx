import React, { useState, useEffect } from "react";
import { Header } from "@/components/docView/Header";
import { ResizableSidebar } from "@/components/docView/ResizableSidebar";
// import { Slide1 } from "@/components/docView/Slides";
import CardTemplates from "./slidesView/CardTemplates";
import { closestCorners, DndContext } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import AddButton from "./slidesView/AddButton";
import Home from "../Home/Home";
export default function Page() {
  const [currentSlide, setCurrentSlide] = useState(1);

  useEffect(() => {
    const slideElement = document.getElementById(`at-${currentSlide}`);
    if (slideElement) {
      slideElement.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentSlide]);

  const [slidesPreview, setSlidesPreview] = useState();

  useEffect(() => {
    setSlidesPreview([
      {
        number: 1,
        id: 1,
        title: "Customer Targeting Strategy",
        content: <div className="flex justify-center">
        <CardTemplates slidesPreview={slidesPreview} setCurrentSlide={setCurrentSlide} id={1} setSlidesPreview={setSlidesPreview} />
      </div>,
        onClick: () => setCurrentSlide(1),
      },
    ])
    setSlides([
      {
        id: 1,
        Slide: <div className="flex justify-center">
        <CardTemplates slidesPreview={slidesPreview} setCurrentSlide={setCurrentSlide} id={1} setSlidesPreview={setSlidesPreview} />
      </div>,
      },
    ])
  },[])
  const [slides, setSlides] = useState();

  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (active.id === over.id) return;

    setSlidesPreview((prev) => {
      const originalPos = prev.findIndex((item) => item.id === active.id);
      const currentPos = prev.findIndex((item) => item.id === over.id);
      const updated = arrayMove(prev, originalPos, currentPos);

      return updated.map((item, index) => ({
        ...item,
        number: index + 1,
      }));
    });
  };

  useEffect(() => {
    setSlides(
      slidesPreview?.map((p) => ({
        Slide: p.content,
        id: p.id,
      }))
    );
  }, [slidesPreview]);

  return (
    <>

    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          {slidesPreview&&<ResizableSidebar
            setCurrentSlide={setCurrentSlide}
            slidesPreview={slidesPreview}
            setSlidesPreview={setSlidesPreview}
          />}
        </DndContext>
        <main className="flex-1 overflow-y-auto">
          <div>
            {slides?.map(({ Slide, id }, index) => (
              <div key={index} className="" id={`at-${id}`}>
                {Slide}
              </div>
            ))}
            <div
              className="flex w-full justify-center items-center relative"
              style={{ position: "relative", marginTop: "20px" }}
            >
              <AddButton
                setCurrentSlide={setCurrentSlide}
                slidesPreview={slidesPreview}
                setSlidesPreview={setSlidesPreview}
              />
            </div>
          </div>
        </main>
      </div>
    </div>

    <Home />
    </>
  );
}
