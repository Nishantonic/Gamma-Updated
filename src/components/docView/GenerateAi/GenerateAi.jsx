import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Send, Loader2 } from "lucide-react"
import { Button } from "../../ui/button"
import { Textarea } from "../../ui/textarea"
import { Card, CardContent } from "../../ui/card"
import AccentImageAi from "./AiComponents/AccentImageAi"
import TwoColumnAi from "./AiComponents/TwoColumnAi"
import ImageTextAi from "./AiComponents/ImageTextAi"
import ThreeColumnAi from "./AiComponents/ThreeColumnAi"
import DefaultAi from "./AiComponents/DefaultAi"
import { v4 as uuidv4 } from "uuid"

export default function GenerateAi({
  inputData,
  setShowPopup,
  setIsLoadingCopy,
  setSlidesPreview,
  setSlides: setParentSlides,
  setGenerateAi,
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [prompt, setPrompt] = useState(inputData)
  const [hasGenerated, setHasGenerated] = useState(false)

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
     - **title**: Slide title.
     - **description**: slide description.

Return 8-10 slides in JSON format, ensuring each slide adheres to one of these templates. Do not include extra explanations or non-JSON text Note that the description's size 6 to 8 sentences and also don't bold any text just give normal text for title and description and also must note that provide only must available and apropreate to the topic image url reuired
the images must related to the topic and image is must availabele 
enerate a profetional text for each slide 
ensure the user's requirement for perticular slide
use all templates in ppt
Note : the content foe each slide managed your self because each templates height and width is width: '1024px', height: '768px'.**give midium content for each slide and each templates in specially accentImage template  but make sure the content is profatinal**.**for CardTemplateImgHeadingThree template description must be shorter and all 3 column which present in this templates these description's word size also must same** and  Ensure all images are accessible, relevant, and high-quality for the topic image url must available if not change url and provide only accessable image url.
the last slide must be conclusion slide in default template`

  const validateAndParseJson = useCallback((text) => {
    try {
      // First, try to find JSON array in the response
      const jsonRegex = /\[[\s\S]*\]/
      const match = text.match(jsonRegex)
      
      if (!match) {
        throw new Error("No JSON array found in the response")
      }

      const jsonString = match[0]
      const slides = JSON.parse(jsonString)

      if (!Array.isArray(slides) || slides.length === 0) {
        throw new Error("Invalid slides data structure")
      }

      return slides.map((slide) => {
        if (!slide.type) {
          throw new Error("Slide type is required")
        }

        const baseSlide = {
          id: uuidv4(),
          type: slide.type,
        }

        switch (slide.type) {
          case "accentImage":
            return {
              ...baseSlide,
              titleContainer: {
                titleId: uuidv4(),
                title: slide.title || "",
                styles: {}
              },
              descriptionContainer: {
                descriptionId: uuidv4(),
                description: slide.description || "",
                styles: {}
              },
              imageContainer: {
                imageId: uuidv4(),
                image: slide.image || "",
                styles: {}
              },
            }

          case "twoColumn":
            if (!Array.isArray(slide.columns) || slide.columns.length !== 2) {
              throw new Error("Two columns are required for twoColumn type")
            }
            return {
              ...baseSlide,
              titleContainer: {
                titleId: uuidv4(),
                title: slide.title || "",
                styles: {}
              },
              columns: slide.columns.map((column) => ({
                contentId: uuidv4(),
                content: column.content || "",
                styles: {}
              })),
            }

          case "imageCardText":
            return {
              ...baseSlide,
              titleContainer: {
                titleId: uuidv4(),
                title: slide.title || "",
                styles: {}
              },
              descriptionContainer: {
                descriptionId: uuidv4(),
                description: slide.description || "",
                styles: {}
              },
              imageContainer: {
                imageId: uuidv4(),
                image: slide.image || "",
                styles: {}
              },
            }

          case "threeImgCard":
            if (!Array.isArray(slide.cards) || slide.cards.length !== 3) {
              throw new Error("Three cards are required for threeImgCard type")
            }
            return {
              ...baseSlide,
              titleContainer: {
                titleId: uuidv4(),
                title: slide.title || "",
                styles: {}
              },
              cards: slide.cards.map((card) => ({
                cardId: uuidv4(),
                image: card.image || "",
                headingContainer: {
                  headingId: uuidv4(),
                  heading: card.heading || "",
                  styles: {}
                },
                descriptionContainer: {
                  descriptionId: uuidv4(),
                  description: card.description || "",
                  styles: {}
                },
              })),
            }

          case "default":
            return {
              ...baseSlide,
              titleContainer: {
                titleId: uuidv4(),
                title: slide.title || "",
                styles: {}
              },
              descriptionContainer: {
                descriptionId: uuidv4(),
                description: slide.description || "",
                styles: {}
              },
            }

          default:
            throw new Error(`Unknown slide type: ${slide.type}`)
        }
      })
    } catch (err) {
      console.error("JSON Parsing Error:", err)
      throw new Error(`Invalid JSON structure or missing required fields: ${err.message}`)
    }
  }, [])

  const renderSlide = useCallback((slide, index) => {
    const slideProps = {
      ...slide,
      index,
      onEdit: (updatedSlide) => handleEdit(slide.id, updatedSlide),
      onDelete: () => handleDelete(slide.id),
    }

    const components = {
      accentImage: AccentImageAi,
      twoColumn: TwoColumnAi,
      imageCardText: ImageTextAi,
      threeImgCard: ThreeColumnAi,
      default: DefaultAi,
    }

    const Component = components[slide.type] || components.default
    return <Component generateAi={slideProps} />
  }, [])

  const handleEdit = useCallback((id, updatedSlide) => {
    const updateSlides = (prevSlides) =>
      prevSlides.map((slide) =>
        slide.id === id ? { ...slide, ...updatedSlide } : slide
      )

    setParentSlides(updateSlides)
    setSlidesPreview((prevSlides) =>
      prevSlides.map((slide) =>
        slide.id === id
          ? {
              ...slide,
              ...updatedSlide,
              content: renderSlide({ ...slide, ...updatedSlide }, slide.number - 1),
            }
          : slide
      )
    )
  }, [setParentSlides, setSlidesPreview, renderSlide])

  const handleDelete = useCallback((id) => {
    const filterSlides = (prevSlides) =>
      prevSlides
        .filter((slide) => slide.id !== id)
        .map((slide, index) => ({ ...slide, number: index + 1 }))

    setParentSlides(filterSlides)
    setSlidesPreview(filterSlides)
  }, [setParentSlides, setSlidesPreview])

  const generateResponse = useCallback(async () => {
    if (isLoading || !prompt) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCzVOUDgpnieFh5lJ1vY2sRImrVuZkM5zY",
        {
          contents: [
            {
              parts: [
                {
                  text: enhancedPrompt,
                },
              ],
            },
          ],
        }
      )

      const aiText = response.data.candidates[0].content.parts[0].text
      const jsonSlides = validateAndParseJson(aiText)
      // console.log(jsonSlides);
      
      if (jsonSlides.length > 0) {
        const enhancedSlides = jsonSlides.map((slide, index) => ({
          ...slide,
          number: index + 1,
        }))
        // console.log(enhancedSlides);
        
        setSlidesPreview(
          enhancedSlides.map((slide, index) => ({
            number: index + 1,
            id: slide.id,
            type: slide.type,
            title: slide.titleContainer?.title,
            content: renderSlide(slide, index),
          }))
        )

        setParentSlides(
          enhancedSlides.map((slide) => ({
            ...slide,
            Slide: renderSlide(slide, slide.number - 1),
          }))
        )
      } else {
        throw new Error("No valid slides generated.")
      }
    } catch (err) {
      console.error("Error:", err)
      setError(err.message || "An unexpected error occurred.")
      setGenerateAi(false)
    } finally {
      setIsLoading(false)
      setShowPopup(false)
      setIsLoadingCopy(false)
      setGenerateAi(false)
    }
  }, [
    prompt,
    enhancedPrompt,
    isLoading,
    validateAndParseJson,
    renderSlide,
    setSlidesPreview,
    setParentSlides,
    setGenerateAi,
    setShowPopup,
    setIsLoadingCopy,
  ])

  useEffect(() => {
    if (prompt && inputData && !hasGenerated) {
      generateResponse()
      setHasGenerated(true)
    }
  }, [prompt, inputData, hasGenerated, generateResponse])

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardContent className="p-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your presentation topic..."
              className="mb-4"
            />
            <Button onClick={generateResponse} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate Slides
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="mt-4 bg-red-500/10 border-red-500/20 text-red-200">
            <CardContent className="p-4">Error: {error}</CardContent>
          </Card>
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