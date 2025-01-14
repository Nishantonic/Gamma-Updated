import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "../../../ui/dialog"
  import { Card } from "../../../ui/card"
  
  import card1 from "../assets/card1.png"
  import { useState } from "react"
  import card2 from "../assets/card2.png"
  import ImageCradText from "../ImageCardText"
  

  
  export function TemplatesModal({ open, onOpenChange, ...props }) {
       
    const [showImageText, setShowImageText] = useState(false)

    if(showImageText){
        return <ImageCradText/>
    }

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl bg-[#2a2438] border-[#3a3347] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Choose a Template</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                      <Card
                        className="p-4 bg-[#2a2438] border-[#3a3347] hover:border-[#4a4357] cursor-pointer transition-colors relative group"
                        onClick={() => setShowImageText(true)}
                      >
                        <div className="h-20 flex items-center justify-center overflow-hidden">
                          <img
                            src={card1}
                            alt="Image And text"
                            className="w-full h-full object-contain rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                            <p className="text-white text-sm font-medium">Image and Text</p>
                          </div>
                        </div>
                      </Card>

                       <Card 
                                  className="p-4 bg-[#2a2438] border-[#3a3347] hover:border-[#4a4357] cursor-pointer transition-colors relative group"
                                  onClick={() => setShowTwoColumn(true)}
                                >
                                  <div className="h-24 flex items-center justify-center overflow-hidden">
                                    <img 
                                      src={card2}
                                      alt="Two Columns"
                                      className="w-full h-full object-contain rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                                      <p className="text-white text-sm ">Two Columns</p>
                                    </div>
                                  </div>
                     </Card>
          </div>
        </DialogContent>
      </Dialog>
    )
  }