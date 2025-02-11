

import CardThreeDot from "./CardThreeDot";
const Card = ({ slide, onClick, onDelete }) => {


  return (
    <div className="relative bg-white rounded-lg shadow-md p-4 w-64 cursor-pointer hover:shadow-lg transition-shadow duration-300">
      <div onClick={onClick}>
        {slide.imageContainer.image && (
          <img
            src={slide.imageContainer.image || "/placeholder.svg"}
            alt={slide.titleContainer.title.replace(/<[^>]*>/g, '') || "Slide"}
            className="w-full h-40 object-cover rounded-lg mb-2"
          />
        )}
        <h3 className="text-lg font-semibold mb-2">{slide.titleContainer.title.replace(/<[^>]*>/g, '') || "Untitled Slide"}</h3>
        <p className="text-sm text-gray-600 mb-4">
          {slide.descriptionContainer.description
            ? `${slide.descriptionContainer.description.replace(/<[^>]*>/g, '').substring(0, 100)}${slide.descriptionContainer.description.length > 100 ? "..." : ""}`
            : "No description available"}
        </p>
      </div>
      
      <div>
        <CardThreeDot onClick={onClick} onDelete={onDelete} />
      </div>
    </div>
  )
}

export default Card
