// import { useState } from "react"
// import { MoreVertical } from "lucide-react"
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
// import { Trash2 } from "lucide-react"

// const Card = ({ key, slide, onClick , ondelete}) => {
//   const [isOpen, setIsOpen] = useState(false)

//   return (
//     <div className="w-64 bg-white rounded-xl shadow-lg p-4 relative m-2 cursor-pointer" onClick={() => onClick(slide)}>
//       {/* Card Image */}
//       <img src={slide.image || "/placeholder.svg"} alt={slide.name} className="w-full h-40 object-cover rounded-lg" />

//       {/* Card Name & Timestamp */}
//       <div className="mt-3 flex justify-between items-center">
//         <div>
//           <h3 className="text-lg font-semibold">{slide.name}</h3>
//           <p className="text-gray-500 text-sm">{slide.title}</p>
//         </div>

//         {/* {slides.slides} */}

//         {/* Three-dot Dropdown Menu */}
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <button className="p-2 rounded-full hover:bg-gray-200 transition">
//               <MoreVertical className="w-5 h-5 text-gray-600" />
//             </button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuItem onClick={() => alert("Editing...")}>Edit</DropdownMenuItem>
//             <DropdownMenuItem >
//             <button
//         onClick={(e) => {ondelete}
//         className="absolute top-2 right-2 p-1 bg-red-100 rounded-full hover:bg-red-200 transition-colors duration-200"
//       >
//         <Trash2 className="w-4 h-4 text-red-600" />
//       </button>
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     </div>
//   )
// }

// export default Card

import { Trash2 } from "lucide-react"

const Card = ({ slide, onClick, onDelete }) => {
  return (
    <div className="relative bg-white rounded-lg shadow-md p-4 w-64 cursor-pointer hover:shadow-lg transition-shadow duration-300">
      <div onClick={onClick}>
      {slide.image && (
      <img src={slide.image || "/placeholder.svg"} alt={slide.name} className="w-full h-40 object-cover rounded-lg" />
)}
        <h3 className="text-lg font-semibold mb-2">{slide.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{slide.description.substring(0, 100)}...</p>
        
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute top-2 right-2 p-1 bg-red-100 rounded-full hover:bg-red-200 transition-colors duration-200"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    </div>
  )
}

export default Card

