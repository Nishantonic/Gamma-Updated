import { useState, useEffect } from "react";
import { ChevronDown, FilePlus, Home, Share2, Sparkles, Edit, Trash2, Loader2 } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Header({ setGenerateAi, startPresentation, slides, slideDockers, setSlideDockers, presentationId }) {
  const navigate = useNavigate();
  const [isDockerPopupOpen, setIsDockerPopupOpen] = useState(false);
  const [selectedLockerType, setSelectedLockerType] = useState("Banner");
  const [dockerForm, setDockerForm] = useState({
    documentId: null,  // Changed from 'id' to 'documentId'
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
    ctaBtnColor: "#000000",
    ctaBtnTxtColor: "#ffffff",
  });
  const [isLoadingLockers, setIsLoadingLockers] = useState(false);
  const [isSavingLocker, setIsSavingLocker] = useState(false);

  const isPresentationIdValid = !!presentationId;

  useEffect(() => {
    if (isPresentationIdValid && isDockerPopupOpen) {
      fetchLockers();
    }
  }, [isPresentationIdValid, isDockerPopupOpen]);

  const fetchLockers = async () => {
    if (!isPresentationIdValid) return;
    setIsLoadingLockers(true);
    try {
      const response = await fetch(`https://presentaiapi.codesemic.com/api/locakers/${presentationId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch lockers");
      const data = await response.json();
      const updatedDockers = {};
      
      data.data.forEach((locker) => {
        const slideIndex = locker.attributes.slide_number - 1;
        const slideId = slides[slideIndex]?.id;
        if (slideId) {
          updatedDockers[slideId] = updatedDockers[slideId] || [];
          updatedDockers[slideId].push({
            documentId: locker.id,  // Changed from 'id' to 'documentId'
            type: locker.attributes.type,
            title: locker.attributes.title,
            details: {
              image: locker.attributes.image,
              video: locker.attributes.type === "Video" ? locker.attributes.image : null,
              html: locker.attributes.code || "",
              autoresponder: locker.attributes.code || "",
              ctaText: locker.attributes.cta_text || "",
              ctaUrl: locker.attributes.cta_url || "",
              title: locker.attributes.title || "",
              description: locker.attributes.description || "",
              allowClose: !locker.attributes.disable_close,
              ctaBtnColor: locker.attributes.cta_btn_color || "#000000",
              ctaBtnTxtColor: locker.attributes.cta_btn_txt_color || "#ffffff",
            },
          });
        }
      });
      setSlideDockers(updatedDockers);
    } catch (error) {
      console.error("Error fetching lockers:", error);
    } finally {
      setIsLoadingLockers(false);
    }
  };

  const handleGenerateAiClick = () => setGenerateAi(true);

  const handelHome = (e) => {
    e.preventDefault();
    navigate("/home");
  };

  const handelDockerPopUp = () => {
    if (isPresentationIdValid) {
      setIsDockerPopupOpen(true);
    }
  };

  const handleInputChange = (field, value) => {
    setDockerForm((prev) => ({ ...prev, [field]: value }));
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  const handleSaveDocker = async () => {
    setIsSavingLocker(true);
    try {
      let imageUrl = dockerForm.image;
      const needsFileUpload = ["Banner", "Image", "Video"].includes(dockerForm.lockerType);
      const fileToUpload = dockerForm.lockerType === "Video" ? dockerForm.video : dockerForm.image;

      if (needsFileUpload && fileToUpload && fileToUpload instanceof File) {
        const formData = new FormData();
        formData.append("files", fileToUpload);
        const uploadResponse = await fetch("https://presentaiapi.codesemic.com/api/upload", {
          method: "POST",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error("Failed to upload file");
        const uploadData = await uploadResponse.json();
        if (uploadData && uploadData.length > 0) {
          imageUrl = `https://presentaiapi.codesemic.com${uploadData[0].url}`;
        }
      }

      const payload = {
        data: {
          title: dockerForm.title || dockerForm.ctaText || dockerForm.lockerType,
          type: dockerForm.lockerType,
          description: dockerForm.description || null,
          code: null,
          slide_number: parseInt(dockerForm.slideNumber),
          disable_close: !dockerForm.allowClose,
          presentation: presentationId,
          locale: "en",
          cta_text: dockerForm.ctaText || null,
          cta_url: dockerForm.ctaUrl || null,
          image: imageUrl || null,
          cta_btn_color: dockerForm.ctaBtnColor,
          cta_btn_txt_color: dockerForm.ctaBtnTxtColor,
        },
      };

      if (dockerForm.lockerType === "Custom HTML" || dockerForm.lockerType === "Autoresponder") {
        payload.data.code = dockerForm[dockerForm.lockerType === "Custom HTML" ? "html" : "autoresponder"] || null;
      }

      const endpoint = dockerForm.documentId
        ? `https://presentaiapi.codesemic.com/api/locakers/${dockerForm.documentId}`
        : "https://presentaiapi.codesemic.com/api/locakers";
      const method = dockerForm.documentId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save locker");

      const responseData = await response.json();
      const slideIndex = parseInt(dockerForm.slideNumber) - 1;
      const slideId = slides[slideIndex]?.id;

      if (slideId) {
        const lockerDocumentId = dockerForm.documentId || responseData.data.documentId;  // Use documentId from response
        const newDocker = {
          documentId: lockerDocumentId,  // Changed from 'id' to 'documentId'
          type: dockerForm.lockerType,
          title: dockerForm.title || dockerForm.ctaText || dockerForm.lockerType,
          details: {
            ...dockerForm,
            image: imageUrl,
            video: dockerForm.lockerType === "Video" ? imageUrl : null,
            documentId: lockerDocumentId,  // Changed from 'id' to 'documentId'
          },
        };

        setSlideDockers((prev) => ({
          ...prev,
          [slideId]: dockerForm.documentId
            ? (prev[slideId] || []).map((d) => (d.documentId === dockerForm.documentId ? newDocker : d))
            : [...(prev[slideId] || []), newDocker],
        }));
      }

      resetForm();
      // setIsDockerPopupOpen(false);
    } catch (error) {
      console.error("Error saving locker:", error);
    } finally {
      setIsSavingLocker(false);
    }
  };

  const handleEditDocker = (slideId, docker) => {
    const details = docker.details || {};
    setDockerForm({
      documentId: docker.documentId,  // Changed from 'id' to 'documentId'
      lockerType: docker.type || "Banner",
      image: details.image || null,
      video: details.video || null,
      html: details.html || "",
      autoresponder: details.autoresponder || "",
      ctaText: details.ctaText || "",
      ctaUrl: details.ctaUrl || "",
      title: details.title || docker.title || "",
      description: details.description || "",
      slideNumber: (slides.findIndex((s) => s.id === slideId) + 1).toString() || "",
      allowClose: details.allowClose ?? false,
      ctaBtnColor: details.ctaBtnColor || "#000000",
      ctaBtnTxtColor: details.ctaBtnTxtColor || "#ffffff",
    });
    setSelectedLockerType(docker.type || "Banner");
    setIsDockerPopupOpen(true);
  };

  const handleDeleteDocker = async (slideId, dockerDocumentId) => {  // Changed parameter name
    try {
      const response = await fetch(`https://presentaiapi.codesemic.com/api/locakers/${dockerDocumentId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete locker");

      setSlideDockers((prev) => {
        const updatedDockers = { ...prev };
        if (updatedDockers[slideId]) {
          updatedDockers[slideId] = updatedDockers[slideId].filter((d) => d.documentId !== dockerDocumentId);
          if (updatedDockers[slideId].length === 0) {
            delete updatedDockers[slideId];
          }
        }
        return updatedDockers;
      });
    } catch (error) {
      console.error("Error deleting locker:", error);
    }
  };

  const resetForm = () => {
    setDockerForm({
      documentId: null,  // Changed from 'id' to 'documentId'
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
      ctaBtnColor: "#000000",
      ctaBtnTxtColor: "#ffffff",
    });
    setSelectedLockerType("Banner");
  };

  const lockerTypes = ["Banner", "Image", "Video", "Custom HTML", "Autoresponder", "Click to Action", "Whatsapp"];

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
              <DropdownMenuItem onClick={handleGenerateAiClick}>Generate with Gemini AI</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handelDockerPopUp}
                  variant="ghost"
                  size="sm"
                  className={isPresentationIdValid ? "" : "opacity-50 cursor-not-allowed"}
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  Add Locker
                </Button>
              </TooltipTrigger>
              {!isPresentationIdValid && (
                <TooltipContent>
                  <p>Please save the presentation first to add lockers</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

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
              <DropdownMenuItem onClick={() => startPresentation(true)}>From beginning</DropdownMenuItem>
              <DropdownMenuItem onClick={() => startPresentation(true)}>From current slide</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Dialog open={isDockerPopupOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-5xl max-h-[90vh] my-8 overflow-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl">{dockerForm.id ? "Edit Locker" : "Add New Locker"}</DialogTitle>
            <DialogDescription>Configure your locker settings below</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-8 py-6">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Slides</h3>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {isLoadingLockers ? (
                    <p className="text-gray-500">Loading lockers...</p>
                  ) : (
                    slides.map((slide, index) => (
                      <DropdownMenu key={slide.id}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-left font-medium text-gray-700 hover:bg-gray-50 border-gray-200"
                          >
                            <span>{slide.titleContainer?.title.replace(/<[^>]*>/g, "") || `Slide ${index + 1}`}</span>
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
                                    onClick={() => handleDeleteDocker(slide.id, docker.documentId)}
                                    className="p-1"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <DropdownMenuItem className="text-sm text-gray-500">No Lockers added yet</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Locker Configuration</h3>
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
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(selectedLockerType === "Banner" || selectedLockerType === "Image") && (
                    <div>
                      <Label className="mb-1 text-gray-700">Image Upload</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleInputChange("image", e.target.files[0])}
                        className="w-full border-gray-300"
                      />
                      {dockerForm.image && typeof dockerForm.image === "string" && (
                        <p className="text-sm text-gray-500 mt-1">Current: {dockerForm.image}</p>
                      )}
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
                      {dockerForm.video && typeof dockerForm.video === "string" && (
                        <p className="text-sm text-gray-500 mt-1">Current: {dockerForm.video}</p>
                      )}
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

                  {(selectedLockerType === "Click to Action" ||
                    selectedLockerType === "Whatsapp" ||
                    selectedLockerType === "Banner") && (
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
                      <div>
                        <Label className="mb-1 text-gray-700">CTA Button Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={dockerForm.ctaBtnColor}
                            onChange={(e) => handleInputChange("ctaBtnColor", e.target.value)}
                            className="w-12 h-12 p-0 border-none"
                          />
                          <Input
                            type="text"
                            value={dockerForm.ctaBtnColor}
                            onChange={(e) => handleInputChange("ctaBtnColor", e.target.value)}
                            className="w-full border-gray-300"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="mb-1 text-gray-700">CTA Button Text Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={dockerForm.ctaBtnTxtColor}
                            onChange={(e) => handleInputChange("ctaBtnTxtColor", e.target.value)}
                            className="w-12 h-12 p-0 border-none"
                          />
                          <Input
                            type="text"
                            value={dockerForm.ctaBtnTxtColor}
                            onChange={(e) => handleInputChange("ctaBtnTxtColor", e.target.value)}
                            className="w-full border-gray-300"
                            placeholder="#ffffff"
                          />
                        </div>
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
                            {slide.titleContainer?.title.replace(/<[^>]*>/g, "") || `Slide ${index + 1}`}
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
              disabled={!dockerForm.slideNumber || isSavingLocker}
              className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
            >
              {isSavingLocker ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : dockerForm.id ? (
                "Update Locker"
              ) : (
                "Save Locker"
              )}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setIsDockerPopupOpen(false)} className="border-gray-300 text-gray-700">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}