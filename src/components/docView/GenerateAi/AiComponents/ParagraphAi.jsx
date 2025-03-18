import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";

function ParagraphAi({ slideId, inputId, onUpdate, initialData,initialStyles,isPresentationMode}) {
  const quillRef = useRef(null);

  const formattedInitialData = initialData || "Paragraph";
  const [editorHtml, setEditorHtml] = useState(formattedInitialData);
  const [editorStyles, setEditorStyles] = useState({ header : 3});

  useEffect(() => {
      // Apply initial H1 format when component mounts
      if (quillRef.current) {
        const quill = quillRef.current.getEditor();
        quill.formatText(0, quill.getLength(), 'header', 3);
      }
    }, []);

     useEffect(()=>{
        console.log("ispreisPresentationMode paragraph",isPresentationMode, isPresentationMode);
        
      })

  const handleChange = (value) => {
  // Add null check for quillRef
  if (!quillRef.current) return;
  
  const quill = quillRef.current.getEditor();
  const styles = quill.getFormat();
  
  setEditorHtml(value);
  setEditorStyles(styles);
  
  onUpdate(
    value, // Send plain text
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
          placeholder="Heading nishant"
          className="custom-quill-bubble w-full text-lg relative"
          style={{
            "--ql-toolbar-margin-left": "auto",
            border: isPresentationMode ? "none" : "2px solid gray",  // Ensures no border is applied
            outline: isPresentationMode ?  "none" : " 1px " , // Removes any focus outline
            boxShadow: isPresentationMode ?  "none" : "initial", // Prevents unwanted shadows
          }}
        />
      </div>
    </div> 
  );  
}

export default ParagraphAi;