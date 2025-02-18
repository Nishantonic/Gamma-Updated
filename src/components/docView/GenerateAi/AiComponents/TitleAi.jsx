import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";

function TitleAi({ slideId, inputId, onUpdate, initialData, initialStyles }) {
  const quillRef = useRef(null);

  // Don't wrap in h1 tags
  const formattedInitialData = initialData || "Untitled";
  const [editorHtml, setEditorHtml] = useState(formattedInitialData);
  const [editorStyles, setEditorStyles] = useState({ header: 1 }); // Set default style

  useEffect(() => {
    // Apply initial H1 format when component mounts
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.formatText(0, quill.getLength(), 'header', 1);
    }
  }, []);

  const handleChange = (value) => {
    if (!quillRef.current) return;
    
    const quill = quillRef.current.getEditor();
    const styles = quill.getFormat();
    
    setEditorHtml(value);
    setEditorStyles(styles);
    
    onUpdate(
      value,
      styles,
      slideId,
      inputId
    );
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
    <div className="w-full mx-auto p-4">
      <div className="border border-none p-2 bg-transparent outline rounded  text-white/50 ">
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
          placeholder="Untitled"
          className="custom-quill-bubble w-full text-lg relative "
          style={{
            "--ql-toolbar-margin-left": "auto",
          }}
        />
      </div>
    </div>
  );  
}

export default TitleAi;