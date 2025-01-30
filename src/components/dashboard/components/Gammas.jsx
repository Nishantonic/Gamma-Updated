import React  from "react";
import { Folders } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "./Card";

const Gammas = () => {

  const cardsData = [
    {
      imageUrl: "https://via.placeholder.com/300",
      title: "Card 1",
      profileImageUrl: "https://via.placeholder.com/150",
      createdBy: "Created by You",
    },
    {
      imageUrl: "https://via.placeholder.com/300",
      title: "Card 2",
      profileImageUrl: "https://via.placeholder.com/150",
      createdBy: "Created by You",
    },
    {
      imageUrl: "https://via.placeholder.com/300",
      title: "Card 3",
      profileImageUrl: "https://via.placeholder.com/150",
      createdBy: "Created by You",
    },
    {
      imageUrl: "https://via.placeholder.com/300",
      title: "Card 4",
      profileImageUrl: "https://via.placeholder.com/150",
      createdBy: "Created by You",
    },
    {
      imageUrl: "https://via.placeholder.com/300",
      title: "Card 5",
      profileImageUrl: "https://via.placeholder.com/150",
      createdBy: "Created by You",
    },
    {
      imageUrl: "https://via.placeholder.com/300",
      title: "Card 6",
      profileImageUrl: "https://via.placeholder.com/150",
      createdBy: "Created by You",
    },
  ];

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between">
        {/* Icon + Title */}
        <div className="flex items-center gap-1">
          <div className="p-1 ">
            <Folders className="w-6 h-6 text-gray-700" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Gammas</h3>
        </div>

        {/* Image Placeholder */}
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 text-white text-lg">
            S
          </div>
      </div>

      <div className="p-3">
        <Link to="/page" className="border p-2 bg-white mr-2">+ New Gamma Blank</Link>
        <Link to="/generate-ai" className="border p-2 bg-white mr-2">+ Generate with AI</Link>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-8 max-w-7xl mx-auto">
      {cardsData.map((card, index) => (
        <Card
          key={index}
          imageUrl={card.imageUrl}
          title={card.title}
          profileImageUrl={card.profileImageUrl}
          createdBy={card.createdBy}
        />
      ))}
    </div>

    </div>
  );
};

export default Gammas;
