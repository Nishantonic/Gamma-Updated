import { useState, useRef } from "react"
import axios from "axios"
import { Send, Loader2, Download } from "lucide-react"
import { Button } from "../../ui/button"
import { Textarea } from "../../ui/textarea"
import { Card, CardContent } from "../../ui/card"
import AccentImageAi from "./AiComponents/AccentImageAi"
import TwoColumnAi from "./AiComponents/TwoColumnAi"
import ImageTextAi from "./AiComponents/ImageTextAi"
import ThreeColumnAi from "./AiComponents/ThreeColumnAi"
import pptxgen from "pptxgenjs"
import DefaultAi from "./AiComponents/DefaultAi"
import { useEffect } from "react"
import AddButtonAi from "./AiComponents/AddButtonAi"
import PreviewBar from "./PreviewBar"
import { v4 as uuidv4 } from "uuid"



export default function GenerateAi({
  inputData,
  setShowPopup,
  setIsLoadingCopy,
  setSlidesPreview,
  setSlides,
  setGenerateAi,
}) {
  const [slides, setSlidesState] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [prompt, setPrompt] = useState(inputData)
  const [editableSlides, setEditableSlides] = useState([])
  const enhancedPrompt = `
${prompt}

Generate a JSON response for ${prompt} for a presentation using the following predefined templates. Each template has specific requirements:

1. **AccentImage**:
   - Purpose: Emphasizes an image with a supporting description.
   - Fields:
     - **type**: "accentImage".
     - **title**: Slide title.
     - **description**: Text supporting the image.
     - **image**: Direct URL of the image.

2. **CardTemplateTwoColumn**:
   - Purpose: Displays two columns of content also use as comparison between two types or anything else.
   - Fields:
     - **type**: "twoColumn".
     - **title**: Slide title.
     - **columns**: Array of two objects, each containing:
       - **content**: Column content.

3. **ImageCardText**:
   - Purpose: just layout changed it takes an image first and then the title and description purpose of this template is to explain content with image.
   - Fields:
     - **type**: "imageCardText".
     - **title**: Slide title.
     - **description**: Text content for the slide.
     - **image**: Direct URL of the image.

4. **CardTemplateImgHeadingThree**:
   - Purpose: Highlights three images with headings and descriptions.
   - Fields:
     - **type**: "threeImgCard".
     - **title**: Slide title.
     - **cards**: Array of three objects, each containing:
       - **image**: Direct URL of the image.
       - **heading**: Card heading.
       - **description**: Supporting text for the card.

5. **Default**:
   - Purpose: General content for slide  note that it contains title and description it use as giving conclusion.
   - Fields:
     - **type**: "default".
     - **title**: Slide 
     -**description**:slide description.title.

Return 8-10 slides in JSON format, ensuring each slide adheres to one of these templates. Do not include extra explanations or non-JSON text Note that the description's size 6 to 8 sentences and also don't bold any text just give normal text for title and description and also must note that provide only must available and apropreate to the topic image url reuired
the images must related to the topic and image is must availabele 
enerate a profetional text for each slide 
ensure the user's requirement for perticular slide
use all templates in ppt
Note : the content foe each slide managed your self because each templates height and width is width: '1024px', height: '768px'.**give midium content for each slide and each templates in specially accentImage template  but make sure the content is profatinal**.**for CardTemplateImgHeadingThree template description must be shorter and all 3 column which present in this templates these description's word size also must same** and  Ensure all images are accessible, relevant, and high-quality for the topic image url must available if not change url and provide only accessable image url.
the last slide must be conclusion slide in default template
`

  const validateAndParseJson = (text) => {
    try {
      const jsonStartIndex = text.indexOf("[")
      const jsonEndIndex = text.lastIndexOf("]")
      if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        throw new Error("No valid JSON found in the response.")
      }
      const jsonString = text.substring(jsonStartIndex, jsonEndIndex + 1)
      const slides = JSON.parse(jsonString)
      return slides.map((slide) => ({ ...slide, id: uuidv4() }))
    } catch (err) {
      throw new Error("Invalid JSON structure or missing required fields.")
    }
  }

  const generateResponse = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCzVOUDgpnieFh5lJ1vY2sRImrVuZkM5zY",
        {
          contents: [{ parts: [{ text: enhancedPrompt }] }],
        },
        { headers: { "Content-Type": "application/json" } },
      )

      const aiText = response.data.candidates[0].content.parts[0].text
      const jsonSlides = validateAndParseJson(aiText)
      setSlidesState(jsonSlides)
      setEditableSlides(jsonSlides)
      
      setSlidesPreview(
        jsonSlides.map((slide, index) => ({
          number: index + 1,
          id: slide.id,
          title: slide.title,
          content: renderSlide(slide, index),
          onClick: () => setCurrentSlide(index + 1),
        })),
      )

      setSlides(
        jsonSlides.map((slide) => ({
          Slide: renderSlide(slide, slide.number - 1),
          id: slide.id,
        })),
      )

      setGenerateAi(false)
    } catch (err) {
      console.error("Error:", err)
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
      setShowPopup(false)
      setIsLoadingCopy(false)
    }
  }

  const handleEdit = (index, updatedSlide) => {
    setEditableSlides((prevSlides) => {
      const newSlides = [...prevSlides]
      newSlides[index] = updatedSlide
      return newSlides
    })
  }
  const handleDelete = (id) => {
    // Update editableSlides
    setEditableSlides((prevSlides) => {
      const updatedSlides = prevSlides.filter((slide) => slide.id !== id)
      console.log("Updated editableSlides:", updatedSlides)
      return updatedSlides
    })

    // Update slides
    setSlides((prevSlides) => {
      const updatedSlides = prevSlides.filter((slide) => slide.id !== id)
      console.log("Updated slides:", updatedSlides)
      return updatedSlides
    })

    // Update slidesPreview
    setSlidesPreview((prevSlides) => {
      const updatedSlides = prevSlides.filter((slide) => slide.id !== id)
      console.log("Updated slidesPreview:", updatedSlides)
      return updatedSlides
    })
  }

  const addNewSlide = (insertIndex) => {
    setEditableSlides((prevSlides) => {
      const updatedSlides = [...prevSlides]

      const newSlide = {
        type: "default",
        title: "Untitled Card",
        description: "This is a new slide. Edit as needed.",
        id: uuidv4(),
        number: insertIndex + 1,
      }

      updatedSlides.splice(insertIndex, 0, newSlide)

      return updatedSlides.map((slide, idx) => ({
        ...slide,
        number: idx + 1,
        id: slide.id || `slide-${Date.now()}-${idx}`,
      }))
    })
  }

  const renderSlide = (slide, index) => {
    const slideProps = {
      ...slide,
      index,
      onEdit: (updatedSlide) => handleEdit(index, updatedSlide),
      onDelete: () => handleDelete(slide.id),
    }

    switch (slide.type) {
      case "accentImage":
        return <AccentImageAi generateAi={slideProps} />
      case "twoColumn":
        return <TwoColumnAi generateAi={slideProps} />
      case "imageCardText":
        return <ImageTextAi generateAi={slideProps} />
      case "threeImgCard":
        return <ThreeColumnAi generateAi={slideProps} />
      default:
        return <DefaultAi generateAi={slideProps} />
    }
  }

  useEffect(() => {
    if (prompt) {
      setSlidesState([])
      setEditableSlides([])
      generateResponse()
    }
  }, [prompt])

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {error && (
          <Card className="mt-4 bg-red-500/10 border-red-500/20 text-red-200">
            <CardContent className="p-4">Error: {error}</CardContent>
          </Card>
        )}
        {editableSlides.length > 0 && (
          <div className="mt-8 space-y-8">
            {editableSlides.slice().map((slide, index) => renderSlide(slide, index,))}
            
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center mt-10">
            <Loader2 className="h-6 w-6 animate-spin text-black" />
          </div>
        )}
      </div>
    </div>
  )
}