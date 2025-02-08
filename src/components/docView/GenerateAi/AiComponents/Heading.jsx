import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";

function EditorToolsQuill({ slideId, inputId, onChange, initialData }) {
  const storageKey = `editor_${slideId}_${inputId}`;
  const quillRef = useRef(null);

  const formattedInitialData = initialData ? `<h2>${initialData}</h2>` : "";
  const [editorHtml, setEditorHtml] = useState(formattedInitialData);
  const [editorStyles, setEditorStyles] = useState({});

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem(storageKey));
    if (storedData) {
      setEditorHtml(storedData.content);
    }
  }, [storageKey]);

  const handleChange = (value) => {
    setEditorHtml(value);

    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const styles = quill.getFormat();
      localStorage.setItem(
        storageKey,
        JSON.stringify({ slideId, inputId, content: value, styles })
      );
      setEditorStyles(styles);
      if (onChange) onChange(value, styles);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
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
          placeholder="Compose an epic..."
          className="custom-quill-bubble w-full text-lg relative "
          style={{
            "--ql-toolbar-margin-left": "auto",
          }}
        />
      </div>
    </div>
  );
}

export default EditorToolsQuill;
