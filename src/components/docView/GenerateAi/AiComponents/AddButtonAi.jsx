import React from "react"

const AddButton = ({ index, addNewSlide }) => {
  const handlePlusClick = () => {
    console.log("Add button clicked, index:", index)
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
        marginBottom: "10px",
        width: "100%",
      }}
      onClick={handlePlusClick}
    >
      +
    </button>
  )
}

export default AddButton

