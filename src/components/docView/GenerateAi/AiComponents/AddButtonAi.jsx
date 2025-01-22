import React, { useState } from "react";
import CardTemplates from "../../slidesView/CardTemplates";


const AddButtonAi = ({ index, addNewSlide }) => {
  const handlePlusClick = () => {
    const newSlide = {
      number: index + 1, // Dynamically determine the slide's number
      id: index + 1,     // Dynamically determine the slide's ID
      type: "default",   // Default slide type (can be customized)
      title: `Slide ${index + 1}`, // Title for the new slide
      description: "This is a new slide. Edit as needed.", // Description placeholder
    };

    // Add a new slide at the specified index
    addNewSlide(newSlide, index + 1);
  };

  return (
    <button
      style={{
        color: "white",
        fontSize: "18px",
        padding: "8px 12px",
        textAlign: "center",
        cursor: "pointer",
        border: "1px solid #555",
        borderRadius: "4px",
        backgroundColor: "#342c4e",
        marginTop: "10px",
      }}
      onClick={handlePlusClick}
    >
      +
    </button>
  );
};

export default AddButtonAi;




