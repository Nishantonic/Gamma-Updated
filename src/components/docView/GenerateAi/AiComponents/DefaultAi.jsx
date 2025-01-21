import React, { useState } from "react"
import TitleAi from "./TitleAi.jsx"
import ParagraphAi from "./ParagraphAi.jsx"

function DefaultAi({ generateAi = {}, index }) {
  const [title, setTitle] = useState(generateAi.title || "Untitled Card")
  const [description, setDescription] = useState(generateAi.description || "Start typing...")

  const handleUpdate = (type, newContent, newStyles) => {
    if (type === "title") {
      setTitle(newContent)
    } else if (type === "description") {
      setDescription(newContent)
    }
    if (generateAi.onEdit) {
      generateAi.onEdit({
        ...generateAi,
        [type]: newContent,
        [`${type}Styles`]: newStyles,
      })
    }
  }

  return (
    <div
      id={`slide-${index}`}
      className=" w-full md:mt-[3vh] md:mb-[3vh] rounded-lg px-6 py-4 bg-[#342c4e] text-white max-w-4xl mx-auto"
    >
      <div className="flex flex-col gap-8">
        <TitleAi
          initialData={title}
          onUpdate={(newContent, newStyles) => handleUpdate("title", newContent, newStyles)}
          index={index}
        />
        <ParagraphAi
          initialData={description}
          onUpdate={(newContent, newStyles) => handleUpdate("description", newContent, newStyles)}
          index={index}
        />
      </div>
    </div>
  )
}

export default DefaultAi

