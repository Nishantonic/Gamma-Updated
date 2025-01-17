import React, { useState } from "react";

const ResponsiveAudio = ({ initialAudio = null }) => {
  const [preview, setPreview] = useState(initialAudio);
  const [audioSize, setAudioSize] = useState({ width: 400, height: 100 });
  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [isUploading, setIsUploading] = useState(!initialAudio);

  const handleAudioPreview = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      const audioURL = URL.createObjectURL(file);
      setPreview(audioURL);
      setIsUploading(false); // Switch to audio playback mode after upload
    }
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setInitialSize({ width: audioSize.width, height: audioSize.height });
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const dx = e.clientX - initialMousePos.x;
      setAudioSize({
        width: Math.max(initialSize.width + dx, 200),
        height: audioSize.height, // Height is fixed for audio
      });
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleUploadClick = () => {
    if (!preview) {
      setIsUploading(true); // Allow upload if no audio is uploaded yet
    }
  };

  return (
    <span
      className="relative flex flex-col justify-center items-center w-full rounded-lg bg-[#2a2438] overflow-hidden group"
      style={{
        width: `${audioSize.width}px`,
        height: `${audioSize.height}px`,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {preview ? (
        <audio
          src={preview}
          controls
          className="w-full object-cover rounded-lg"
          onClick={(e) => e.stopPropagation()} // Prevent click events on the audio from triggering upload
        >
          Your browser does not support the audio tag.
        </audio>
      ) : (
        <div
          className="flex items-center justify-center w-full h-full text-[#9d8ba7] cursor-pointer"
          onClick={handleUploadClick}
        >
          <span>Click to Upload</span>
        </div>
      )}

      {isUploading && (
        <input
          type="file"
          accept="audio/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleAudioPreview}
        />
      )}

      <div
        className="absolute right-0 bottom-0 w-6 h-6 bg-white cursor-se-resize hover:bg-gray-200"
        onMouseDown={handleMouseDown}
      />
    </span>
  );
};

export default ResponsiveAudio;
