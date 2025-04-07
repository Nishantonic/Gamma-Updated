"use client";

import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import DataGrid from "react-data-grid"; // Import react-data-grid
import { CardMenu } from "../../slidesView/Menu/CardMenu";
import TitleAi from "./TitleAi.jsx";
import ParagraphAi from "./ParagraphAi.jsx";
import Heading from "./Heading";
import { DragContext } from "@/components/SidebarLeft/DragContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Move } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import ResponsiveImage from "@/components/SidebarLeft/components/ToolBarElements/ResponsiveImage";
import ResponsiveVideo from "@/components/SidebarLeft/components/ToolBarElements/ResponsiveVideo";
import ResponsiveAudio from "@/components/SidebarLeft/components/ToolBarElements/ResponsiveAudio";
import { Bar, Pie, Line } from "react-chartjs-2";

// Custom component for embedded URLs
const EmbeddedUrl = ({ url, name, initialStyles }) => {
  const styles = initialStyles || { width: 500, height: 500 };
  const [isIframeFailed, setIsIframeFailed] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const adjustIframeUrl = (url) => {
    if (!url) return url;
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
        const videoId =
          parsedUrl.searchParams.get("v") ||
          parsedUrl.pathname.split("/").filter(Boolean).pop();
        if (videoId) return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
      }
      if (hostname.includes("vimeo.com")) {
        const videoId = parsedUrl.pathname.split("/").filter(Boolean).pop();
        if (videoId) return `https://player.vimeo.com/video/${videoId}`;
      }
      return url;
    } catch (e) {
      console.error("Error parsing URL:", e);
      return url;
    }
  };

  const fetchPreviewData = useCallback(async (url) => {
    try {
      setPreviewData({
        title: name || "Preview Title",
        description: "This is a preview of the content at the provided URL.",
        image: "https://via.placeholder.com/300x200?text=Preview+Image",
      });
    } catch (e) {
      console.error("Error fetching preview data:", e);
      setPreviewData({
        title: name || "Unable to Load Preview",
        description: "Preview unavailable for this URL.",
        image: null,
      });
    }
  }, [name]);

  useEffect(() => {
    if (isIframeFailed && url) {
      fetchPreviewData(url);
    }
  }, [isIframeFailed, url, fetchPreviewData]);

  const iframeUrl = adjustIframeUrl(url);

  return (
    <div style={{ width: `${styles.width}px`, height: `${styles.height}px` }}>
      {!isIframeFailed ? (
        <iframe
          src={iframeUrl}
          title={name || "Embedded Content"}
          className="w-full h-full border-0 rounded-md"
          style={{ width: `${styles.width}px`, height: `${styles.height}px` }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-full-screen"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          onError={(e) => {
            console.error("Iframe failed to load:", iframeUrl, e);
            setIsIframeFailed(true);
          }}
          onLoad={() => console.log("Iframe loaded successfully:", iframeUrl)}
        />
      ) : previewData ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-md p-4">
          {previewData.image && (
            <img
              src={previewData.image}
              alt={previewData.title}
              className="max-w-full max-h-[50%] object-contain mb-2 rounded"
            />
          )}
          <p className="text-gray-800 font-semibold">{previewData.title}</p>
          <p className="text-gray-600 text-sm text-center">{previewData.description}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-blue-600 hover:underline"
          >
            Visit Site
          </a>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-md p-4">
          <p className="text-gray-600 mb-2">Loading preview...</p>
        </div>
      )}
    </div>
  );
};

// Custom Button Component for Dropped URLs
const CustomButton = ({ url, name, initialStyles }) => {
  const styles = initialStyles || { width: 150, height: 40 };

  const handleClick = () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      console.error("No URL provided for button");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      style={{ width: `${styles.width}px`, height: `${styles.height}px` }}
    >
      {name || "Open URL"}
    </button>
  );
};

// Matrix Component using react-data-grid
const Matrix = ({ initialData, initialStyles, onUpdate }) => {
  const { rows, cols, tableData } = initialData;
  const styles = initialStyles || { width: cols * 100, height: rows * 100 };

  // Generate columns dynamically based on cols
  const columns = Array.from({ length: cols }, (_, index) => ({
    key: `col-${index}`,
    name: `Column ${index + 1}`,
    editable: true,
    resizable: true,
  }));

  // Convert tableData to rows format for react-data-grid
  const [gridData, setGridData] = useState(
    tableData.map((row, rowIndex) =>
      row.reduce((acc, cell, colIndex) => {
        acc[`col-${colIndex}`] = cell;
        return acc;
      }, { id: rowIndex })
    )
  );

  const handleCellsChanged = (changes) => {
    const updatedData = [...gridData];
    changes.forEach(({ cell, rowIdx, updated }) => {
      updatedData[rowIdx] = { ...updatedData[rowIdx], ...updated };
    });
    setGridData(updatedData);

    // Convert back to tableData format for parent update
    const newTableData = updatedData.map(row =>
      columns.map(col => row[col.key] || "")
    );
    onUpdate?.(newTableData, styles);
  };

  return (
    <div style={{ width: `${styles.width}px`, height: `${styles.height}px` }}>
      <DataGrid
        columns={columns}
        rows={gridData}
        onRowsChange={setGridData}
        onCellsEdited={handleCellsChanged}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
};

function ImageTextAi({ generateAi = {}, isPresentationMode, ...props }) {
  const [preview, setPreview] = useState(generateAi.imageContainer?.image);
  const [imageSize, setImageSize] = useState(() => ({
    width: generateAi.imageContainer?.styles?.width || 300,
    height: generateAi.imageContainer?.styles?.height || 210,
  }));
  const [isResizing, setIsResizing] = useState(null);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [title, setTitle] = useState(generateAi.titleContainer?.title || "Untitled Card");
  const [titleStyles, setTitleStyles] = useState(generateAi.titleContainer?.styles || {});
  const [description, setDescription] = useState(
    generateAi.descriptionContainer?.description || "Start typing..."
  );
  const [descriptionStyles, setDescriptionStyles] = useState(
    generateAi.descriptionContainer?.styles || {}
  );
  const [isDeleted, setIsDeleted] = useState(false);
  const { draggedElement } = useContext(DragContext);
  const imageRef = useRef(null);
  const slideId = generateAi.id;

  const [tables, setTables] = useState(generateAi.tables || []);

  const COMPONENT_MAP = {
    title: TitleAi,
    paragraph: ParagraphAi,
    heading: Heading,
    image: ResponsiveImage,
    video: ResponsiveVideo,
    audio: ResponsiveAudio,
    "column-chart": Bar,
    "bar-chart": Bar,
    "pie-chart": Pie,
    "line-chart": Line,
    "embedded-url": EmbeddedUrl,
    "custom-button": CustomButton,
    matrix: Matrix, // Added matrix component
  };

  useEffect(() => {
    if (generateAi.imageContainer?.image && isValidImageUrl(generateAi.imageContainer.image)) {
      setPreview(generateAi.imageContainer.image);
    }
    if (generateAi.imageContainer?.styles) {
      setImageSize({
        width: generateAi.imageContainer.styles.width || 300,
        height: generateAi.imageContainer.styles.height || 210,
      });
    }
    if (generateAi.tables) {
      setTables(generateAi.tables);
    }
  }, [generateAi]);

  const isValidImageUrl = (url) => {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
  };

  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        updateParent({
          imageContainer: {
            ...generateAi.imageContainer,
            image: reader.result,
            styles: { ...generateAi.imageContainer?.styles, width: imageSize.width, height: imageSize.height },
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e, itemId = "image") => {
    setIsResizing(itemId);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    if (itemId === "image") {
      setInitialSize({ width: imageSize.width, height: imageSize.height });
    } else if (itemId.startsWith("table-")) {
      const [_, tableId, colIndex] = itemId.split("-");
      const table = tables.find((t) => t.id === tableId);
      setInitialSize({ width: table.columnWidths[parseInt(colIndex, 10)], height: 100 });
    } else {
      const item = generateAi.dropContainer?.dropItems.find((i) => i.id === itemId) || tables.find((t) => t.id === itemId);
      setInitialSize({ width: item?.styles?.width || item?.columnWidths?.reduce((a, b) => a + b, 0) || 300, height: item?.styles?.height || (item?.rows * 48) || 210 });
    }
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const dx = e.clientX - initialMousePos.x;
      const dy = e.clientY - initialMousePos.y;
      const newWidth = Math.max(initialSize.width + dx, 100);
      const newHeight = Math.max(initialSize.height + dy, 100);

      if (isResizing === "image") {
        setImageSize({ width: newWidth, height: newHeight });
        updateParent({
          imageContainer: {
            ...generateAi.imageContainer,
            styles: { ...generateAi.imageContainer?.styles, width: newWidth, height: newHeight },
          },
        });
      } else if (isResizing.startsWith("table-")) {
        const [_, tableId, colIndex] = isResizing.split("-");
        const tableIndex = tables.findIndex((t) => t.id === tableId);
        const newTables = [...tables];
        const table = newTables[tableIndex];
        const newWidths = [...table.columnWidths];
        newWidths[parseInt(colIndex, 10)] = newWidth;
        newTables[tableIndex] = { ...table, columnWidths: newWidths };
        setTables(newTables);
        updateParent({ tables: newTables });
      } else {
        const updatedItems = generateAi.dropContainer?.dropItems?.map((item) =>
          item.id === isResizing
            ? { ...item, styles: { ...item.styles, width: newWidth, height: newHeight } }
            : item
        ) || [];
        const updatedTables = tables.map((table) =>
          table.id === isResizing
            ? { ...table, styles: { ...table.styles, width: newWidth, height: newHeight } }
            : table
        );
        setTables(updatedTables);
        generateAi.onEdit?.({ ...generateAi, dropContainer: { dropItems: updatedItems }, tables: updatedTables });
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(null);
  };

  const updateParent = (updates) => {
    const updatedData = {
      ...generateAi,
      titleContainer: { ...generateAi.titleContainer, title, styles: titleStyles },
      descriptionContainer: { ...generateAi.descriptionContainer, description, styles: descriptionStyles },
      imageContainer: {
        ...generateAi.imageContainer,
        image: preview,
        styles: { ...generateAi.imageContainer?.styles, width: imageSize.width, height: imageSize.height },
      },
      tables,
      ...updates,
    };
    generateAi.onEdit?.(updatedData);
  };

  const handleTitleUpdate = (newTitle, styles) => {
    setTitle(newTitle);
    setTitleStyles(styles);
    updateParent({ titleContainer: { ...generateAi.titleContainer, title: newTitle, styles } });
  };

  const handleDescriptionUpdate = (newDescription, styles) => {
    setDescription(newDescription);
    setDescriptionStyles(styles);
    updateParent({ descriptionContainer: { ...generateAi.descriptionContainer, description: newDescription, styles } });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    console.log("Drop event triggered", draggedElement);

    if (draggedElement && draggedElement.columns && draggedElement.rows) {
      const newTable = {
        id: uuidv4(),
        columns: draggedElement.columns,
        rows: draggedElement.rows,
        columnWidths: Array(draggedElement.columns).fill(200),
        tableData: Array(draggedElement.rows)
          .fill()
          .map(() => Array(draggedElement.columns).fill("")),
        styles: { width: draggedElement.columns * 200, height: draggedElement.rows * 48 },
      };
      const newTables = [...tables, newTable];
      setTables(newTables);
      updateParent({ tables: newTables });
      console.log("Table added:", newTable);
    } else if (draggedElement && draggedElement.type === "embedded-url") {
      const newItem = {
        id: uuidv4(),
        type: "embedded-url",
        url: draggedElement.url,
        name: draggedElement.name,
        styles: draggedElement.styles || { width: 500, height: 500 },
      };
      const updatedData = {
        ...generateAi,
        dropContainer: { dropItems: [...(generateAi.dropContainer?.dropItems || []), newItem] },
      };
      console.log("Embedded URL added:", newItem);
      generateAi.onEdit?.(updatedData);
    } else if (draggedElement && draggedElement.type === "custom-button") {
      const newItem = {
        id: uuidv4(),
        type: "custom-button",
        url: draggedElement.url,
        name: draggedElement.name || "Open URL",
        styles: draggedElement.styles || { width: 150, height: 40 },
      };
      const updatedData = {
        ...generateAi,
        dropContainer: { dropItems: [...(generateAi.dropContainer?.dropItems || []), newItem] },
      };
      console.log("Custom button added:", newItem);
      generateAi.onEdit?.(updatedData);
    } else {
      try {
        const data = JSON.parse(event.dataTransfer.getData("application/json"));
        console.log("Parsed drag data:", data);
        if (data.type) {
          let newItem;
          if (["column-chart", "bar-chart", "pie-chart", "line-chart"].includes(data.type)) {
            newItem = {
              id: uuidv4(),
              type: data.type,
              chartData: data.data.chartData,
              options: data.data.options,
              styles: data.data.style || { width: 300, height: 210 },
            };
          } else if (data.type === "custom-button") {
            newItem = {
              id: uuidv4(),
              type: "custom-button",
              url: data.url,
              name: data.name || "Open URL",
              styles: data.styles || { width: 150, height: 40 },
            };
          } else if (data.type === "matrix") {
            newItem = {
              id: uuidv4(),
              type: "matrix",
              data: {
                rows: data.data.rows,
                cols: data.data.cols,
                tableData: data.data.tableData || Array(data.data.rows).fill().map(() => Array(data.data.cols).fill("")),
              },
              styles: data.data.styles || { width: data.data.cols * 100, height: data.data.rows * 100 },
            };
          } else {
            newItem = {
              id: uuidv4(),
              type: data.type,
              content: data.data.value || "",
              styles: { width: 300, height: 210 },
            };
          }
          const updatedData = {
            ...generateAi,
            dropContainer: { dropItems: [...(generateAi.dropContainer?.dropItems || []), newItem] },
          };
          generateAi.onEdit?.(updatedData);
          console.log("Other item added:", newItem);
        }
      } catch (e) {
        console.error("Error parsing drag data:", e);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDelete = useCallback(async (id) => {
    // Placeholder for delete logic (unchanged)
  }, []);

  const handleDeleteDroppedItem = (itemId) => {
    const updatedItems = generateAi.dropContainer?.dropItems?.filter((item) => item.id !== itemId) || [];
    generateAi.onEdit?.({ ...generateAi, dropContainer: { dropItems: updatedItems } });
  };

  const handleDeleteTable = (tableId) => {
    const updatedTables = tables.filter((table) => table.id !== tableId);
    setTables(updatedTables);
    updateParent({ tables: updatedTables });
  };

  const handleUpdateDroppedItem = (itemId, updates) => {
    const updatedItems = generateAi.dropContainer?.dropItems?.map((item) => {
      if (item.id === itemId) {
        if (item.type === "matrix") {
          return { ...item, data: { ...item.data, tableData: updates }, styles: item.styles };
        }
        return { ...item, content: updates, styles: item.styles };
      }
      return item;
    }) || [];
    generateAi.onEdit?.({ ...generateAi, dropContainer: { dropItems: updatedItems } });
  };

  const handleTableDataChange = (tableId, rowIndex, colIndex, value) => {
    const newTables = [...tables];
    const tableIndex = newTables.findIndex((t) => t.id === tableId);
    const newTableData = [...newTables[tableIndex].tableData];
    newTableData[rowIndex][colIndex] = value;
    newTables[tableIndex] = { ...newTables[tableIndex], tableData: newTableData };
    setTables(newTables);
    updateParent({ tables: newTables });
  };

  const renderDroppedItems = () => {
    return (generateAi.dropContainer?.dropItems || []).map((item) => {
      const Component = COMPONENT_MAP[item.type];
      if (!Component) {
        console.warn(`No component found for type: ${item.type}`);
        return null;
      }
      const itemStyles = item.styles || { width: 300, height: 210 };
      return (
        <div
          key={item.id}
          className="mb-4 relative group"
          style={{ width: `${itemStyles.width}px`, height: `${itemStyles.height}px`, position: "relative" }}
        >
          {["column-chart", "bar-chart", "pie-chart", "line-chart"].includes(item.type) ? (
            <div className="w-full h-full">
              <Component data={item.chartData} options={item.options} />
            </div>
          ) : item.type === "matrix" ? (
            <Component
              slideId={slideId}
              inputId={item.id}
              initialData={item.data}
              initialStyles={itemStyles}
              onUpdate={(newTableData, styles) => handleUpdateDroppedItem(item.id, newTableData, styles)}
            />
          ) : (
            <Component
              slideId={slideId}
              inputId={item.id}
              initialData={item.content}
              initialStyles={itemStyles}
              url={item.url}
              name={item.name}
              onUpdate={(value, styles) => handleUpdateDroppedItem(item.id, value, styles)}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleDeleteDroppedItem(item.id)}
          >
            ×
          </Button>
          <div
            className="absolute right-0 bottom-0 w-6 h-6 bg-white/90 cursor-se-resize hover:bg-white transition-colors duration-200"
            onMouseDown={(e) => handleMouseDown(e, item.id)}
          />
        </div>
      );
    });
  };

  const renderTable = () => {
    if (!tables || tables.length === 0) return null;
    return tables.map((table) => {
      const tableStyles = table.styles || {
        width: table.columnWidths.reduce((a, b) => a + b, 0),
        height: table.rows * 48,
      };
      return (
        <div
          key={table.id}
          className="mb-4 relative group"
          style={{ width: `${tableStyles.width}px`, height: `${tableStyles.height}px`, position: "relative" }}
        >
          <div className="w-full h-full" style={{ display: "grid" }}>
            <div
              style={{ gridTemplateColumns: table.columnWidths.map((w) => `${w}px`).join(" ") }}
              className="grid"
            >
              {Array.from({ length: table.columns }).map((_, colIndex) => (
                <div
                  key={`${table.id}-header-${colIndex}`}
                  className="relative bg-transparent border border-white p-0 h-12"
                >
                  <textarea
                    value={table.tableData[0][colIndex]}
                    onChange={(e) => handleTableDataChange(table.id, 0, colIndex, e.target.value)}
                    className="w-full h-full bg-transparent text-white resize-none border-none outline-none p-2"
                    placeholder=""
                  />
                  {colIndex < table.columns - 1 && (
                    <div
                      className="absolute right-0 bottom-0 w-6 h-6 bg-white/30 cursor-ew-resize hover:bg-white/50 transition-colors duration-200"
                      onMouseDown={(e) => handleMouseDown(e, `table-${table.id}-${colIndex}`)}
                    />
                  )}
                </div>
              ))}
            </div>
            {Array.from({ length: table.rows - 1 }).map((_, rowIndex) => (
              <div
                key={`${table.id}-${rowIndex + 1}`}
                style={{ gridTemplateColumns: table.columnWidths.map((w) => `${w}px`).join(" ") }}
                className="grid"
              >
                {Array.from({ length: table.columns }).map((_, colIndex) => (
                  <div
                    key={`${table.id}-${rowIndex + 1}-${colIndex}`}
                    className="relative bg-transparent border border-white p-0 h-12"
                  >
                    <textarea
                      value={table.tableData[rowIndex + 1][colIndex]}
                      onChange={(e) => handleTableDataChange(table.id, rowIndex + 1, colIndex, e.target.value)}
                      className="w-full h-full bg-transparent text-white resize-none border-none outline-none p-2"
                      placeholder=""
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleDeleteTable(table.id)}
          >
            ×
          </Button>
          <div
            className="absolute right-0 bottom-0 w-6 h-6 bg-white/90 cursor-se-resize hover:bg-white transition-colors duration-200"
            onMouseDown={(e) => handleMouseDown(e, table.id)}
          />
        </div>
      );
    });
  };

  return (
    <Card
      className="min-h-screen w-full md:min-h-[25vw] my-8 bg-[#342c4e] relative overflow-visible max-w-4xl mx-auto px-3 py-3 outline-none border-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="absolute top-4 left-11">
        {!isPresentationMode && (
          <CardMenu
            onDelete={() => {
              setIsDeleted(true);
              handleDelete(generateAi.id);
              generateAi.onDelete?.(generateAi.id);
            }}
            onDuplicate={() => console.log("Duplicate clicked")}
          />
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 ml-3 mt-16">
        <div
          className="relative flex justify-center items-center w-full md:w-[32%] rounded-lg bg-[#2a2438] overflow-hidden group"
          style={{ width: `${imageSize.width}px`, height: `${imageSize.height}px` }}
        >
          {preview ? (
            <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="flex items-center justify-center w-12 h-full text-[#9d8ba7]">
              <svg
                aria-hidden="true"
                focusable="false"
                className="w-12 h-12 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M464 448H48c-26.5 0-48-21.5-48-48V112c0-26.5 21.5-48 48-48h416c26.5 0 48 21.5 48 48v288c0 26.5-21.5 48-48 48zm-288-48h208c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H176c-8.8 0-16 7.2-16 16v256c0 8.8 7.2 16 16 16z"
                />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-white text-sm font-medium">Click to Upload Image</span>
          </div>
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleImagePreview}
          />
          <div
            className="absolute right-0 bottom-0 w-6 h-6 bg-white/90 cursor-se-resize hover:bg-white transition-colors duration-200"
            onMouseDown={(e) => handleMouseDown(e, "image")}
          />
        </div>

        <div className="flex flex-col gap-4 relative z-0" style={{ width: `calc(100% - ${imageSize.width}px - 2rem)` }}>
          <div className="w-full relative z-10">
            <TitleAi
              initialData={title}
              initialStyles={titleStyles}
              onUpdate={handleTitleUpdate}
              slideId={generateAi.id}
              inputId={generateAi.titleContainer?.titleId}
              isPresentationMode={isPresentationMode}
              className="text-3xl font-bold text-white mb-2"
            />
          </div>
          <div className="w-full relative z-0">
            <ParagraphAi
              initialData={description}
              initialStyles={descriptionStyles}
              onUpdate={handleDescriptionUpdate}
              slideId={generateAi.id}
              inputId={generateAi.descriptionContainer?.descriptionId}
              isPresentationMode={isPresentationMode}
              className="text-lg text-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 relative z-0">
        {renderDroppedItems()}
        {renderTable()}
      </div>
    </Card>
  );
}

export default ImageTextAi;