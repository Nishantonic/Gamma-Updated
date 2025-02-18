import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";

function TitleAi({ slideId, inputId, onUpdate, initialData,initialStyles}) {
  const quillRef = useRef(null);

  const strippedInitialData = initialData?.replace(/<\/?[^>]+(>|$)/g, "") || "";
  const formattedInitialData = strippedInitialData 
    ? `<h1>${strippedInitialData}</h1>`
    : `<h1>Title</h1>`;

  const [editorHtml, setEditorHtml] = useState(formattedInitialData);
  const [editorStyles, setEditorStyles] = useState(initialStyles || {});

  // Trigger initial update to parent
  useEffect(() => {
    handleChange(formattedInitialData);
  }, []); // Empty dependency array ensures this runs once on mount
  
  const handleChange = (value) => {
  if (!quillRef.current) return;

  const quill = quillRef.current.getEditor();
  
  // Ensure we always maintain at least an H1 tag
  let cleanedValue = value;
  if (!/<h1>/.test(value)) {
    cleanedValue = `<h1>${value.replace(/<\/?[^>]+(>|$)/g, "")}</h1>`;
    quill.root.innerHTML = cleanedValue;
  }

  const styles = quill.getFormat();
  
  setEditorHtml(cleanedValue);
  setEditorStyles(styles);
  
  onUpdate(
    cleanedValue,
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
          placeholder="Paragraph"
          className="custom-quill-bubble w-full text-lg relative "
          style={{
            "--ql-toolbar-margin-left": "auto",
          }}
        />
      </div>
    </div>
  );  
}

export default TitleAi ;