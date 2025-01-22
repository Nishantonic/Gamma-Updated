import React from "react"

const AddButtonAi = ({ index, addNewSlide }) => {
  const handlePlusClick = () => {
    // Simply pass the index where we want to insert the new slide
    addNewSlide(index + 1)
  }

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
  )
}

export default AddButtonAi

