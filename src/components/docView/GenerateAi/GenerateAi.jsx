import { useState } from "react";
import axios from "axios";
import { Send, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Card, CardContent } from "../../ui/card";
import AccentImageAi from "./AiComponents/AccentImageAi";

// import CardTemplateImgHeadingThree from "../slidesView/CardTemplateImgHeadingThree";
// import CardTemplateTwoColumn from "../slidesView/CardTempletTwoColumn";
// import ImageCardText from "../slidesView/ImageCardText";

import TwoColumnAi from "./AiComponents/TwoCloumnAi" ;
import ImageTextAi from './AiComponents/ImageTextAi'; 
import CardTemplates from "../slidesView/CardTemplates";
import ThreeColumnAi from './AiComponents/ThreeColumnAi'
export default function GenerateAi() {
  const [slides, setSlides] = useState([]); // Holds generated slides
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState("");

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

   Example:
   {
     "type": "accentImage",
     "title": "Introduction to AI",
     "description": "AI is the simulation of human intelligence in machines.",
     "image": "https://example.com/ai.jpg",
   }

2. **CardTemplateTwoColumn**:
   - Purpose: Displays two columns of content also use as comparision between two types or any thing else.
   - Fields:
     - **type**: "twoColumn".
     - **title**: Slide title.
     - **columns**: Array of two objects, each containing:
       - **content**: Column content.

   Example:
   {
     "type": "twoColumn",
     "title": "AI vs Machine Learning",
     "columns": [
       { "content": "Broad field of study." },
       { "content": "Subset of AI focused on algorithms." }
     ]
   }

3. **ImageCardText**:
   - Purpose: just layout changed it takes an image first and then the title and description purpose of this template is to explain content with image.
   - Fields:
     - **type**: "imageCardText".
     - **title**: Slide title.
     - **description**: Text content for the slide.
     - **image**: Direct URL of the image.

   Example:
   {
     "type": "imageCardText",
     "title": "Impact of Technology",
     "description": "Technology has reshaped industries globally.",
     "image": "https://example.com/tech.jpg"
   }

4. **CardTemplateImgHeadingThree**:
   - Purpose: Highlights three images with headings and descriptions.
   - Fields:
     - **type**: "threeImgCard".
     - **title**: Slide title.
     - **cards**: Array of three objects, each containing:
       - **image**: Direct URL of the image.
       - **heading**: Card heading.
       - **description**: Supporting text for the card.

   Example:
   {
     "type": "threeImgCard",
     "title": "Applications of AI",
     "cards": [
       {
         "image": "https://example.com/ai-health.jpg",
         "heading": "Healthcare",
         "description": "AI assists in diagnostics and treatment."
       },
       {
         "image": "https://example.com/ai-education.jpg",
         "heading": "Education",
         "description": "Personalized learning experiences."
       },
       {
         "image": "https://example.com/ai-transport.jpg",
         "heading": "Transportation",
         "description": "Autonomous vehicles and traffic management."
       }
     ]
   }

5. **Default**:
   - Purpose: General content for unmatched structures.
   - Fields:
     - **type**: "default".
     - **title**: Slide title.

   Example:
   {
     "type": "default",
     "title": "Conclusion",
     "description": "AI will continue to impact industries and society.,..."
   }

Return 6-8 slides in JSON format, ensuring each slide adheres to one of these templates. Do not include extra explanations or non-JSON text Note that the description's size 6 to 8 lines and point wised.
`;

  const cleanDescription = (description) => {
  // Remove bullet points and clean special characters
  return description
    .replace(/[*_~]/g, "") // Remove * _ ~ characters globally
    .split("\n") // Split by newlines if any exist
    .map((item) => item.trim()) // Trim each item
    .filter((item) => item.length > 0) // Remove empty items
    .join("\n"); // Join them back with newlines
};

const validateAndParseJson = (text) => {
  try {
    const jsonStartIndex = text.indexOf("[");
    const jsonEndIndex = text.lastIndexOf("]");
    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      throw new Error("No valid JSON found in the response.");
    }
    const jsonString = text.substring(jsonStartIndex, jsonEndIndex + 1);
    const slides = JSON.parse(jsonString);

    // Clean descriptions in each slide
    const cleanedSlides = slides.map((slide) => {
      if (slide.description) {
        // Clean the main slide description
        slide.description = cleanDescription(slide.description);
      }

      if (slide.cards) {
        // Clean descriptions in cards as well
        slide.cards = slide.cards.map((card) => {
          if (card.description) {
            card.description = cleanDescription(card.description);
          }
          return card;
        });
      }

      return slide;
    });

    return cleanedSlides;
  } catch (err) {
    throw new Error("Invalid JSON structure or missing required fields.");
  }
};




  const generateResponse = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCzVOUDgpnieFh5lJ1vY2sRImrVuZkM5zY",
        {
          contents: [{ parts: [{ text: enhancedPrompt }] }],
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const aiText = response.data.candidates[0].content.parts[0].text;
      const jsonSlides = validateAndParseJson(aiText);
      setSlides(jsonSlides);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSlide = (slide, index) => {
    console.log("Slide Data:", slide); // Debugging
    switch (slide.type) {
      case "accentImage":
        return <AccentImageAi key={index} generateAi={slide} />;
      case "twoColumn":
        return (
          <TwoColumnAi key={index} generateAi={slide} />
        );
      case "imageCardText":
        return (
          <ImageTextAi key={index} generateAi={slide} />
        );
      case "threeImgCard":
        return (
          <ThreeColumnAi key={index} generateAi={slide} />
        );
      default:
        return (
          <CardTemplates key={index} generateAi={slide} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-lg border-0">
          <CardContent className="p-6 space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your topic for presentation..."
              className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/50"
            />
            <Button
              onClick={generateResponse}
              disabled={isLoading || !prompt}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Slides...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate Presentation
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

        {slides.length > 0 && (
          <div className="mt-8 space-y-8">
            {slides.map((slide, index) => renderSlide(slide, index))}
          </div>
        )}
      </div>
    </div>
  );
}
