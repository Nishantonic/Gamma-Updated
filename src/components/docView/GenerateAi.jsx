import { useState, useCallback } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Send, Loader2, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

export default function GenerateAi() {
  const [slides, setSlides] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const cleanText = (text) => {
    return text
      .replace(/[#*\-•]/g, '')
      .replace(/^\d+\.\s*/, '') 
      .replace(/^\s+|\s+$/g, '') 
      .replace(/\n{3,}/g, '\n\n') 
  }

  const generateResponse = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCzVOUDgpnieFh5lJ1vY2sRImrVuZkM5zY',
        {
          contents: [{
            parts: [{
              text: `${prompt}
              
              Create a presentation with:
              - First slide as title slide
              - Each subsequent slide should have a clear heading
              - Each slide should have 2-3 main points
              - No bullet points, numbers, or special characters
              - Use simple, clean text formatting
              - Total 4-5 slides`
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      const aiText = result.data.candidates[0].content.parts[0].text
      
      // Split text into slides based on double newlines
      const slideBlocks = aiText.split(/\n{2,}/).filter(block => block.trim())
      
      const newSlides = slideBlocks.map(block => {
        const lines = block.split('\n').map(line => cleanText(line)).filter(line => line)
        
        return {
          title: lines[0] || '',
          content: lines.slice(1) || [],
          timestamp: new Date().toLocaleString(),
          prompt
        }
      })

      setSlides(prev => [...prev, ...newSlides])
      setCurrentSlide(slides.length)
      setPrompt('')
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    }
  }, [currentSlide, slides.length])

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
  }, [currentSlide])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      nextSlide()
    } else if (e.key === 'ArrowLeft') {
      prevSlide()
    }
  }, [nextSlide, prevSlide])

  useState(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className={`${isFullscreen ? 'p-0' : 'p-6'} transition-all duration-300`}>
        {!isFullscreen && (
          <div className="max-w-4xl mx-auto mb-8">
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
                <CardContent className="p-4">
                  Error: {error}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {slides.length > 0 && (
          <div className={`relative ${isFullscreen ? 'h-screen' : 'h-[600px]'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full flex items-center justify-center px-4"
              >
                <Card className={`
                  bg-white/10 backdrop-blur-lg border-0 shadow-xl w-full
                  ${isFullscreen ? 'max-w-6xl' : 'max-w-4xl'}
                `}>
                  <CardContent className="p-12">
                    <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-white/80 text-sm">
                      {currentSlide + 1} / {slides.length}
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-8"
                    >
                      {!isFullscreen && (
                        <div className="text-purple-300 text-sm mb-4">
                          {slides[currentSlide].timestamp}
                        </div>
                      )}
                      
                      <div className="space-y-8">
                        <h1 className="text-4xl font-bold text-white text-center mb-8 tracking-tight">
                          {slides[currentSlide].title}
                        </h1>
                        
                        <div className="space-y-6">
                          {slides[currentSlide].content.map((point, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + index * 0.1 }}
                              className="flex items-start gap-4"
                            >
                              <div className="w-3 h-3 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                              <p className="text-white/90 text-xl leading-relaxed">{point}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-6 w-6" />
                ) : (
                  <Maximize2 className="h-6 w-6" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className="rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white disabled:opacity-50"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
              <motion.div
                className="h-full bg-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}