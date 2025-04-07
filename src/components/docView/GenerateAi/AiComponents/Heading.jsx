import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";

function Heading({ slideId, inputId, onUpdate, initialData, initialStyles, isPresentationMode }) {
  const quillRef = useRef(null);

  const formattedInitialData = initialData || "Heading";
  const [editorHtml, setEditorHtml] = useState(formattedInitialData);
  const [editorStyles, setEditorStyles] = useState(initialStyles || { header: 2 });



  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.formatText(0, quill.getLength(), "header", 2);
    }
  }, []);

  const handleChange = (value) => {
    if (!quillRef.current) return;

    const quill = quillRef.current.getEditor();
    const styles = quill.getFormat();

    setEditorHtml(value);
    setEditorStyles(styles);

    onUpdate(value, styles, slideId, inputId);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: [] }],
      ["image", "video"],
    ],
    clipboard: { matchVisual: false },
  };

  return (
    <div className="w-full mx-auto p-4 relative z-10">
      <div className="p-2 bg-transparent outline-none rounded text-white/50">
        <ReactQuill
          ref={quillRef}
          value={editorHtml}
          onChange={handleChange}
          modules={modules}
          formats={[
            "header",
            "bold",
            "italic",
            "underline",
            "strike",
            "list",
            "bullet",
            "script",
            "align",
            "blockquote",
            "code-block",
            "color",
            "background",
            "image",
            "video",
          ]}
          theme="bubble"
          placeholder="Enter heading..."
          className="custom-quill-bubble w-full text-lg"
          style={{
            border: isPresentationMode ? "none" : "2px solid gray",
            outline: isPresentationMode ? "none" : "1px",
            boxShadow: isPresentationMode ? "none" : "initial",
            background: "transparent",
            color: "inherit",
          }}
        />
      </div>
      <style jsx global>{`
        .ql-tooltip {
          z-index: 9999 !important; /* Ensure toolbar stays above all components */
          position: absolute;
          top: -40px; /* Position above the editor */
          transform: translateX(-50%);
          left: 50%; /* Center horizontally */
        }
        .ql-container {
          position: relative;
          z-index: 1; /* Editor content below toolbar */
        }
      `}</style>
    </div>
  );
}

export default Heading;