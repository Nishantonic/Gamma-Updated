import { useState } from "react";
import { ChevronDown, FilePlus, Home, Share2, Sparkles, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export function Header({ setGenerateAi, startPresentation, slides }) {
  const navigate = useNavigate();
  const [isDockerPopupOpen, setIsDockerPopupOpen] = useState(false);
  const [selectedLockerType, setSelectedLockerType] = useState("Banner");
  const [dockerForm, setDockerForm] = useState({
    id: null, // For editing
    lockerType: "Banner",
    image: null,
    video: null,
    html: "",
    autoresponder: "",
    ctaText: "",
    ctaUrl: "",
    title: "",
    description: "",
    slideNumber: "",
    allowClose: false,
  });
  const [slideDockers, setSlideDockers] = useState({});

  const handleGenerateAiClick = () => {
    setGenerateAi(true);
  };

  const handelHome = (e) => {
    e.preventDefault();
    navigate('/home');
  };

  const handelDockerPopUp = () => {
    setIsDockerPopupOpen(true);
  };

  const handleInputChange = (field, value) => {
    setDockerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDocker = () => {
    const newDocker = {
      id: dockerForm.id || Date.now(),
      type: dockerForm.lockerType,
      title: dockerForm.title || dockerForm.ctaText || dockerForm.lockerType,
      details: { ...dockerForm },
    };

    const slideIndex = parseInt(dockerForm.slideNumber) - 1;
    const slideId = slides[slideIndex]?.id;

    if (slideId) {
      setSlideDockers((prev) => {
        const existingDockers = prev[slideId] || [];
        if (dockerForm.id) {
          // Edit existing docker
          return {
            ...prev,
            [slideId]: existingDockers.map((d) =>
              d.id === dockerForm.id ? newDocker : d
            ),
          };
        }
        // Add new docker
        return {
          ...prev,
          [slideId]: [...existingDockers, newDocker],
        };
      });
    }

    console.log("Saving docker configuration:", newDocker);
    resetForm();
  };

  const handleEditDocker = (slideId, docker) => {
    setDockerForm({
      id: docker.id,
      lockerType: docker.type,
      image: docker.details.image,
      video: docker.details.video,
      html: docker.details.html,
      autoresponder: docker.details.autoresponder,
      ctaText: docker.details.ctaText,
      ctaUrl: docker.details.ctaUrl,
      title: docker.details.title,
      description: docker.details.description,
      slideNumber: slides.findIndex((s) => s.id === slideId) + 1 + "",
      allowClose: docker.details.allowClose,
    });
    setSelectedLockerType(docker.type);
    setIsDockerPopupOpen(true);
  };

  const handleDeleteDocker = (slideId, dockerId) => {
    setSlideDockers((prev) => ({
      ...prev,
      [slideId]: prev[slideId].filter((d) => d.id !== dockerId),
    }));
  };

  const resetForm = () => {
    setDockerForm({
      id: null,
      lockerType: "Banner",
      image: null,
      video: null,
      html: "",
      autoresponder: "",
      ctaText: "",
      ctaUrl: "",
      title: "",
      description: "",
      slideNumber: "",
      allowClose: false,
    });
    setSelectedLockerType("Banner");
    setIsDockerPopupOpen(false);
  };

  const lockerTypes = [
    "Banner",
    "Image",
    "Video",
    "Custom HTML",
    "Autoresponder",
    "Click to Action",
    "Whatsapp",
  ];

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handelHome} size="icon">
            <Home className="h-5 w-5" />
          </Button>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium">Customer Targeting Strategy</span>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate with AI
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Generate With ChatGPT</DropdownMenuItem>
              <DropdownMenuItem onClick={handleGenerateAiClick}>
                Generate with Gemini AI
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={handelDockerPopUp} variant="ghost" size="sm">
            <FilePlus className="h-4 w-4 mr-2" />
            Add Docker
          </Button>
          
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="primary" size="sm">
                Present
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => startPresentation(true)}>
                From beginning
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => startPresentation(true)}>
                From current slide
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Docker Popup Dialog */}
      <Dialog open={isDockerPopupOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-5xl max-h-[90vh] my-8 overflow-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl">{dockerForm.id ? "Edit Docker" : "Add New Docker"}</DialogTitle>
            <DialogDescription>Configure your docker settings below</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-8 py-6">
            {/* Section 1: Slides with Dockers */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Slides</h3>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {slides.map((slide, index) => (
                    <DropdownMenu key={slide.id}>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full justify-between text-left font-medium text-gray-700 hover:bg-gray-50 border-gray-200"
                        >
                          <span>{slide.titleContainer?.title.replace(/<[^>]*>/g, '') || `Slide ${index + 1}`}</span>
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-72 p-2 bg-white shadow-lg rounded-md">
                        {slideDockers[slide.id]?.length > 0 ? (
                          slideDockers[slide.id].map((docker) => (
                            <div 
                              key={docker.id} 
                              className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md"
                            >
                              <span className="text-sm text-gray-700">
                                {docker.title} <span className="text-xs text-gray-500">({docker.type})</span>
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditDocker(slide.id, docker)}
                                  className="p-1"
                                >
                                  <Edit className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDocker(slide.id, docker.id)}
                                  className="p-1"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <DropdownMenuItem className="text-sm text-gray-500">No dockers added yet</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Docker Configuration Form */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Docker Configuration</h3>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                  <div>
                    <Label className="mb-1 text-gray-700">Locker Type</Label>
                    <Select 
                      value={selectedLockerType} 
                      onValueChange={(value) => {
                        setSelectedLockerType(value);
                        handleInputChange("lockerType", value);
                      }}
                    >
                      <SelectTrigger className="w-full border-gray-300">
                        <SelectValue placeholder="Select locker type" />
                      </SelectTrigger>
                      <SelectContent>
                        {lockerTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dynamic Form Fields */}
                  {(selectedLockerType === "Banner" || selectedLockerType === "Image") && (
                    <div>
                      <Label className="mb-1 text-gray-700">Image Upload</Label>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleInputChange("image", e.target.files[0])}
                        className="w-full border-gray-300"
                      />
                    </div>
                  )}

                  {selectedLockerType === "Video" && (
                    <div>
                      <Label className="mb-1 text-gray-700">Video Upload</Label>
                      <Input 
                        type="file" 
                        accept="video/*" 
                        onChange={(e) => handleInputChange("video", e.target.files[0])}
                        className="w-full border-gray-300"
                      />
                    </div>
                  )}

                  {selectedLockerType === "Custom HTML" && (
                    <div>
                      <Label className="mb-1 text-gray-700">HTML Content</Label>
                      <Textarea 
                        placeholder="Enter your HTML here..." 
                        value={dockerForm.html}
                        onChange={(e) => handleInputChange("html", e.target.value)}
                        className="w-full border-gray-300"
                      />
                    </div>
                  )}

                  {selectedLockerType === "Autoresponder" && (
                    <div>
                      <Label className="mb-1 text-gray-700">Autoresponder Form</Label>
                      <Textarea 
                        placeholder="Enter autoresponder code..." 
                        value={dockerForm.autoresponder}
                        onChange={(e) => handleInputChange("autoresponder", e.target.value)}
                        className="w-full border-gray-300"
                      />
                    </div>
                  )}

                  {(selectedLockerType === "Click to Action" || selectedLockerType === "Whatsapp" || selectedLockerType === "Banner") && (
                    <>
                      <div>
                        <Label className="mb-1 text-gray-700">Call to Action Button Text</Label>
                        <Input 
                          type="text" 
                          placeholder="Button text" 
                          value={dockerForm.ctaText}
                          onChange={(e) => handleInputChange("ctaText", e.target.value)}
                          className="w-full border-gray-300"
                        />
                      </div>
                      <div>
                        <Label className="mb-1 text-gray-700">Call to Action Button URL</Label>
                        <Input 
                          type="url" 
                          placeholder="https://example.com" 
                          value={dockerForm.ctaUrl}
                          onChange={(e) => handleInputChange("ctaUrl", e.target.value)}
                          className="w-full border-gray-300"
                        />
                      </div>
                    </>
                  )}

                  {selectedLockerType === "Banner" && (
                    <>
                      <div>
                        <Label className="mb-1 text-gray-700">Title</Label>
                        <Input 
                          type="text" 
                          placeholder="Banner title" 
                          value={dockerForm.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                          className="w-full border-gray-300"
                        />
                      </div>
                      <div>
                        <Label className="mb-1 text-gray-700">Description</Label>
                        <Textarea 
                          placeholder="Banner description" 
                          value={dockerForm.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          className="w-full border-gray-300"
                        />
                      </div>
                    </>
                  )}

                  {/* Common Fields */}
                  <div>
                    <Label className="mb-1 text-gray-700">Slide Number</Label>
                    <Select 
                      value={dockerForm.slideNumber}
                      onValueChange={(value) => handleInputChange("slideNumber", value)}
                    >
                      <SelectTrigger className="w-full border-gray-300">
                        <SelectValue placeholder="Select slide" />
                      </SelectTrigger>
                      <SelectContent>
                        {slides.map((slide, index) => (
                          <SelectItem key={slide.id} value={`${index + 1}`}>
                            {slide.titleContainer?.title.replace(/<[^>]*>/g, '') || `Slide ${index + 1}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow-close" className="mb-0 text-gray-700">Allow Close</Label>
                    <Switch 
                      id="allow-close" 
                      checked={dockerForm.allowClose}
                      onCheckedChange={(checked) => handleInputChange("allowClose", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex justify-end gap-2 border-t pt-4">
            <Button 
              onClick={handleSaveDocker} 
              disabled={!dockerForm.slideNumber}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {dockerForm.id ? "Update Docker" : "Save Docker"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="border-gray-300 text-gray-700">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}