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
      try {
        const base64Data = await fileToBase64(file);
        setPreview(base64Data);
        onUpdate?.(base64Data, audioSize);
      } catch (error) {
        console.error("Error converting audio to base64:", error);
      }
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
      const newWidth = Math.max(initialSize.width + dx, 200);
      setAudioSize(prev => ({ ...prev, width: newWidth }));
      onUpdate?.(preview, { ...audioSize, width: newWidth });
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    const updateSize = () => {
      if (audioRef.current) {
        const height = audioRef.current.clientHeight;
        setAudioSize(prev => ({ ...prev, height }));
        onUpdate?.(preview, { ...prev, height });
      }
    };

    if (preview && audioRef.current) {
      const audioEl = audioRef.current;
      audioEl.addEventListener('loadedmetadata', updateSize);
      if (audioEl.readyState >= 1) updateSize();
      
      return () => audioEl.removeEventListener('loadedmetadata', updateSize);
    }
  }, [preview]);

  useEffect(() => {
    setPreview(initialData);
    setAudioSize(initialStyles);
  }, [initialData, initialStyles]);

  return (
    <div
      className="relative flex justify-center items-center w-full rounded-lg bg-[#2a2438] overflow-hidden group"
      style={{
        width: `${audioSize.width}px`,
        height: `${audioSize.height}px`,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {preview ? (
        <>
          <audio
            ref={audioRef}
            src={preview}
            controls
            className="w-full"
          >
            Your browser does not support the audio tag.
          </audio>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <label className="px-2 py-1 bg-white/90 rounded cursor-pointer text-sm">
              Replace
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioPreview}
              />
            </label>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full text-[#9d8ba7]">
          <span className="mb-2">Upload Audio</span>
          <label className="px-4 py-2 bg-purple-500 text-white rounded cursor-pointer">
            Choose File
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleAudioPreview}
            />
          </label>
        </div>
      )}

      <div
        className="absolute right-0 bottom-0 w-6 h-6 bg-white cursor-se-resize hover:bg-gray-200"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default ResponsiveAudio;