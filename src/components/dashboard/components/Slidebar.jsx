import React from "react";

const Slidebar = ({ activeComponent, setActiveComponent }) => {
  const menuItems = ["Gammas", "Share", "Settings", "Contact", "Feedback"];

  return (
    <div className="w-64 bg-white text-black p-4 min-h-screen">
      <h2 className="text-lg font-bold mb-4">Dashboard</h2>
      <div className=" w-full m-2 p-1  outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
        <input
          type="text"
          placeholder="Jump to..."
          className="w-full p-2 outline-none border-none -gray-300 rounded-md "
        />
      </div>

      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li
            key={item}
            className={`p-2 cursor-pointer rounded-lg ${
              activeComponent === item ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveComponent(item)}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Slidebar;
