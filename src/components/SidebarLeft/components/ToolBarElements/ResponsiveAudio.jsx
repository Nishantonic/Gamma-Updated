import { fileToBase64 } from "@/components/utils/fileToBase64";
import React, { useEffect, useState, useRef } from "react";

const ResponsiveAudio = ({ initialData = null, initialStyles = { width: 400, height: 100 }, onUpdate, onDelete }) => {
  const [preview, setPreview] = useState(initialData);
  const [audioSize, setAudioSize] = useState(initialStyles);
  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const audioRef = useRef(null);

  const handleAudioPreview = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      const base64Data = await fileToBase64(file);
      setPreview(base64Data);
      onUpdate?.(base64Data, audioSize);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setInitialSize({ width: audioSize.width, height: audioSize.height });
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const dx = e.clientX - initialMousePos.x;
      const dy = e.clientY - initialMousePos.y;
      const newWidth = Math.max(initialSize.width + dx, 200);
      const newHeight = Math.max(initialSize.height + dy, 50);
      setAudioSize({ width: newWidth, height: newHeight });
      onUpdate?.(preview, { width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => setIsResizing(false);

  useEffect(() => {
    if (initialData !== preview) setPreview(initialData);
    if (initialStyles.width !== audioSize.width || initialStyles.height !== audioSize.height) {
      setAudioSize(initialStyles);
    }
  }, [initialData, initialStyles]);

  return (
    <div
      className="relative flex justify-center items-center w-full rounded-lg bg-[#2a2438] overflow-hidden group"
      style={{ width: `${audioSize.width}px`, height: `${audioSize.height}px` }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {preview ? (
        <>
          <audio ref={audioRef} src={preview} controls className="w-full h-full object-contain" />
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          
            <button
              className="px-2 py-1 bg-red-500 text-white rounded text-sm"
              onClick={() => {
                setPreview(null);
                onDelete?.();
              }}
            >
              X
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full text-[#9d8ba7]">
          <span className="mb-2">Upload Audio</span>
          <label className="px-4 py-2 bg-purple-500 text-white rounded cursor-pointer">
            Choose File
            <input type="file" accept="audio/*" className="hidden" onChange={handleAudioPreview} />
          </label>
        </div>
      )}
      <div
        className="absolute right-0 bottom-0 w-6 h-6 bg-white cursor-se-resize hover:bg-gray-200 flex items-center justify-center"
        onMouseDown={handleMouseDown}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M0 12L12 0" stroke="black" strokeWidth="2" />
          <path d="M4 12L12 4" stroke="black" strokeWidth="2" />
          <path d="M8 12L12 8" stroke="black" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

export default ResponsiveAudio;