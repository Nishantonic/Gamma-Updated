import { useState } from "react";
import axios from "axios";
import { Send, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent } from "../ui/card";

export default function GenerateAi() {
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState("");

  const enhancedPrompt = `${prompt}

  Create a professional PowerPoint presentation with the following structure:
  - Each slide should include:
    1. A *Title*.
    2. A *Description* in bullet points for each slide which summarizing the topic
    3. A *direct image URL* related to the topic.

  Example Output (JSON format):
  [
    {
      "title": "Pollution",
      "description": [
        "Pollution is a global issue.",
        "It affects health and the environment.",
        ...
      ],
      "image": "https://example.com/image1.jpg"
    },
    {
      "title": "Causes of Pollution",
      "description": [
        "Pollution is caused by human activities like industrialization and deforestation.",
        "Air and water contamination are major consequences.",
        ...
      ],
      "image": "https://example.com/image2.jpg"
    }
  ]

  Generate 8 slides with similar structure based on the topic provided.
  Return only JSON data in this format without additional explanation or text.
  `;

  const validateAndParseJson = (text) => {
    try {
      const jsonStartIndex = text.indexOf("[");
      const jsonEndIndex = text.lastIndexOf("]");
      if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        throw new Error("No valid JSON found in the response.");
      }
      const jsonString = text.substring(jsonStartIndex, jsonEndIndex + 1);
      return JSON.parse(jsonString);
    } catch (err) {
      throw new Error("Invalid JSON data received from the API.");
    }
  };

  const generateResponse = async () => {
  setIsLoading(true);
  setError(null);

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
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const aiText = response.data.candidates[0].content.parts[0].text;

    const jsonSlides = validateAndParseJson(aiText);

    // Randomly adjust description points per slide
    const adjustedSlides = jsonSlides.map((slide) => {
      const randomPointsCount = Math.floor(Math.random() * 4) + 3; // Random number between 3 and 6
      const randomDescription = slide.description.slice(0, randomPointsCount); // Slice to random number of points
      return { ...slide, description: randomDescription };
    });

    setSlides(adjustedSlides);
  } catch (err) {
    console.error("Error:", err);
    setError(err.message || "An unexpected error occurred.");
  } finally {
    setIsLoading(false);
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
            {slides.map((slide, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-lg border-0">
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-2xl font-bold text-white">{slide.title}</h2>
                  <div className="space-y-2">
                    {slide.description.map((point, i) => (
                      <p key={i} className="text-white/90 text-lg">
                        {point}
                      </p>
                    ))}
                  </div>
                  <div className="mt-4 h-[200px] flex  items-center">
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
                        onError={(e) => {
                            e.target.style.display = "none"; 
                            e.target.closest('div').style.display = "none"; // Remove the container that holds the image
                        }}
                    />

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
