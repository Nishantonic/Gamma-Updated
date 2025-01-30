import React from "react";

const Card = ({ imageUrl, title, profileImageUrl, createdBy }) => {
  return (
    <div className="w-full bg-white rounded-lg overflow-hidden shadow-md">
      {/* Image on top with darker background */}
      <div className="bg-gray-100 p-2 border-b border-gray-200 shadow-sm">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover rounded-md border border-gray-200"
        />
      </div>

      {/* Card Body */}
      <div className="p-4 text-left">
        {/* Title aligned to the left */}
        <h5 className="text-xl font-bold mb-2">{title}</h5>

        {/* Profile Icon and "Created by You" aligned to the left */}
        <div className="flex items-center mt-4">
          <div className="border border-gray-200 rounded-full p-1 shadow-sm">
            <img
              src={profileImageUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <span className="text-sm text-gray-600 ml-2">{createdBy}</span>
        </div>
      </div>
    </div>
  );
};

export default Card;
