import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import { Card, CardContent } from "../../../ui/card";


export default function TitleInput({ slideId, inputId, onDelete, onChange }) {
  const storageKey = `editor_${slideId}_${inputId}`;
  const quillRef = useRef(null);
  const [editorHtml, setEditorHtml] = useState(null);
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
    <Card
      className="w-full flex justify-start max-auto mb-2 bg-transparent relative border-transparent"
    >
      <CardContent className="w-full p-4 bg-transparent border-none rounded-lg ">
        <ReactQuill
          ref={quillRef}
          value={editorHtml}
          onChange={handleChange}
          modules={modules}
          theme="bubble"
          placeholder="Compose an epic..."
          className="custom-quill-bubble w-full  text-lg"
        />
      </CardContent>
    </Card>
  );
}
