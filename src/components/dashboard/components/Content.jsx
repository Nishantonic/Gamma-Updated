// import React from 'react'

// const Content = () => {
//   return (
//     <div className='bg-[#f1eceb] h-screen w-full'>Content</div>
//   )
// }

// export default Content

import React from "react";

const Content = ({ children }) => {
  return <div className="p-6 min-h-screen flex-wrap bg-[#f7f2f2] shadow-lg rounded-lg">{children}</div>;
};

export default Content;
