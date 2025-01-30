"use client"
import axios from "axios"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Download, Expand, Sparkle, Trash2, Loader2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import Masonry from "react-masonry-css"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

export default function AiImages() {
  const aspectRatioMap = {
    square: "square_hd",
    portrait: "portrait",
    landscape: "landscape"
  };
  const [isOpen, setIsOpen] = useState(false)
  const [images, setImages] = useState([])
  const [prompt, setPrompt] = useState("")
  const [aspectRatio, setAspectRatio] = useState("square")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a description")
      return
    }
    
    setIsGenerating(true)
    setError("")

    try {
      const response = await axios.post(
        "https://fal.run/fal-ai/fast-sdxl",
        {
          prompt: prompt,
          image_size: aspectRatioMap[aspectRatio]
        },
        { 
          headers: { 
            "Authorization": "Key 695211bf-74de-4864-9e7a-9eb254f63508:bc32a1373fd24dc225b7d0955f5e1ac6",
            "Content-Type": "application/json"
          } 
        }
      )

      if (!response.data?.images?.[0]?.url) {
        throw new Error("No image URL returned from API")
      }

      setImages(prev => [...prev, {
        id: uuidv4(),
        url: response.data.images[0].url,
        prompt,
        aspectRatio
      }])
      toast.success("Image generated successfully!")
    } catch (err) {
      console.error("Error generating image:", err)
      const errorMessage = err.response?.data?.detail || "Failed to generate image. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsGenerating(false)
      setIsOpen(false)
      setPrompt("")
    }
  }

  const handleDelete = (id) => {
    setImages(prev => prev.filter(img => img.id !== id))
    toast.success("Image deleted successfully!")
  }

  const handleDownload = async (url) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `ai-image-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Download started successfully!")
    } catch (err) {
      console.error("Download failed:", err)
      toast.error("Failed to download image")
    }
  }

  const breakpointColumnsObj = {
    default: 3,
    1280: 3,
    1024: 2,
    768: 1
  };
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto ">
      <Toaster
  position="top-right"
  richColors
  toastOptions={{
    duration: 5000,
    style: {
      backgroundColor: '#fff',  // Change to your desired background color
      color: '#000',  // Set text color to white
      borderRadius: '8px',  // Rounded corners
      padding: '12px',  // Padding inside the toast
      fontSize: '14px',  // Font size
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',  // Soft shadow
    },
  }}
/>
      <div className="flex items-center mb-8">
        <Sparkle className="h-5 w-5 text-purple-600" />
        <h1 className="pl-2 font-bold text-xl lg:text-2xl">AI Images</h1>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
        >
          <Sparkle className="mr-2 h-4 w-4" />
          Generate New Image
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Generate AI Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <Textarea
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] text-base"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                <Select 
                  value={aspectRatio} 
                  onValueChange={setAspectRatio}
                  defaultValue="square"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square (1:1)</SelectItem>
                    <SelectItem value="portrait">Portrait (3:4)</SelectItem>
                    <SelectItem value="landscape">Landscape (4:3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : 'Generate Image'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Keep header and dialog the same */}

      {images.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No images generated yet. Start creating with the button above!
        </div>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex gap-4 md:gap-6"
          columnClassName="masonry-column"
        >
          {images.map((image) => (
            <div 
              key={image.id} 
              className="mb-4 md:mb-6 relative group rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800"
            >
              <div className={`
                ${image.aspectRatio === 'square' ? 'aspect-square' : 
                  image.aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'}
                relative bg-gray-100 dark:bg-gray-700
              `}>
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-full object-cover transition-opacity"
                  loading="lazy"
                />
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 backdrop-blur-sm"
                    onClick={() => handleDownload(image.url)}
                    aria-label="Download"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 backdrop-blur-sm"
                    onClick={() => handleDelete(image.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 backdrop-blur-sm"
                    onClick={() => window.open(image.url, '_blank')}
                    aria-label="Expand"
                  >
                    <Expand className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {image.prompt}
                </p>
              </div>
            </div>
          ))}
        </Masonry>
      )}
    </div>
  )
}