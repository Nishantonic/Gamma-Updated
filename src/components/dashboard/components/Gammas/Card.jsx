import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const Card = ({ image, name, time }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-64 bg-white rounded-xl shadow-lg p-4 relative">
            {/* Card Image */}
            <img src={image} alt={name} className="w-full h-40 object-cover rounded-lg" />

            {/* Card Name & Timestamp */}
            <div className="mt-3 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">{name}</h3>
                    <p className="text-gray-500 text-sm">{time}</p>
                </div>

                {/* Three-dot Dropdown Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-full hover:bg-gray-200 transition">
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => alert("Editing...")}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert("Deleting...")}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default Card;
