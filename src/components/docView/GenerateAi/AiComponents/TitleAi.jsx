import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";

function TitleAi({ slideId, inputId, onUpdate, initialData, initialStyles, isPresentationMode }) {
  const quillRef = useRef(null);

  const formattedInitialData = initialData || "Untitled";
  const [editorHtml, setEditorHtml] = useState(formattedInitialData);
  const [editorStyles, setEditorStyles] = useState(initialStyles || { header: 1 });



  // Apply initial header format when component mounts
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.formatText(0, quill.getLength(), "header", 1);
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
    <div className="w-full mx-auto p-4 relative z-0">
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
          placeholder="Enter title..."
          className="custom-quill-bubble w-full text-lg"
          style={{
            "--ql-toolbar-margin-left": "auto",
            border: isPresentationMode ? "none" : "2px solid gray",
            outline: isPresentationMode ? "none" : "1px",
            boxShadow: isPresentationMode ? "none" : "initial",
            background: "transparent",
            color: "inherit",
          }}
        />
      </div>
    </div>
  );
}

export default TitleAi;