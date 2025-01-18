import React, { useState } from "react";
import TitleAi from "./TitleAi.jsx";
import ParagraphAi from "./ParagraphAi.jsx";

function DefaultAi({ generateAi = {} }) {
  const [title, setTitle] = useState(generateAi.title || "Untitled Card");
  const [description, setDescription] = useState(generateAi.description || "Start typing...");

  return (
    <div className="min-h-screen w-full md:w-[60vw] md:mt-[3vh] md:mb-[3vh] rounded-lg px-6 py-4 bg-[#342c4e] text-white">
      <div className="flex flex-col gap-8">
        <TitleAi
          initialData={title}
          onUpdate={(newTitle) => setTitle(newTitle)}
        />
        <ParagraphAi
          initialData={description}
          onUpdate={(newDescription) => setDescription(newDescription)}
        />
      </div>
    </div>
  );
}

export default DefaultAi;
