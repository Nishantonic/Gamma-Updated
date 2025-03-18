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
import { toast, Toaster } from "sonner";

export function Header({ setGenerateAi, startPresentation, slides, slideDockers, setSlideDockers, presentationId, presentationDocumentId }) {
  const navigate = useNavigate();
  const [isDockerPopupOpen, setIsDockerPopupOpen] = useState(false);
  const [selectedLockerType, setSelectedLockerType] = useState("Banner");
  const [dockerForm, setDockerForm] = useState({
    documentId: null,
    lockerType: "Banner",
    image: null,
    video: null,
    html: "",
    autoresponder: "",
    ctaText: "",
    ctaUrl: "",
    title: "",
    description: "",
    slideNumber: "", // Will now store slide.id (e.g., "1107")
    allowClose: false,
    ctaBtnColor: "#000000",
    ctaBtnTxtColor: "#ffffff",
  });
  const [isLoadingLockers, setIsLoadingLockers] = useState(false);
  const [isSavingLocker, setIsSavingLocker] = useState(false);

  const isPresentationIdValid = presentationId;

  // Log slides prop for debugging
  console.log("Slides prop:", slides);

  useEffect(() => {
    if (isPresentationIdValid && isDockerPopupOpen) {
      fetchLockers();
    }
  }, [isPresentationIdValid, isDockerPopupOpen]);

  // Log slideDockers state changes
  useEffect(() => {
    console.log("Current slideDockers state:", slideDockers);
  }, [slideDockers]);

  const fetchLockers = async () => {
    if (!isPresentationIdValid) return;
    setIsLoadingLockers(true);
    const updatedDockers = {};

    try {
      console.log("Fetching lockers for presentationId:", presentationId);
      const response = await fetch(
        `https://presentaiapi.codesemic.com/api/locakers?filters[presentation]=${presentationId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setSlideDockers({});
          toast.info("No lockers found for this presentation.");
          return;
        }
        throw new Error(`Failed to fetch lockers: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetch lockers response:", data);
      const lockers = data.data || [];
      console.log('lockers',lockers )
      if (lockers.length === 0) {
        setSlideDockers({});
        toast.info("No lockers found for this presentation.");
        return;
      }

      lockers.forEach((locker) => {
        const slideId = locker.slide_number; // Now expecting slide.id (e.g., "1107")
        const slideExists = slides.some((slide) => slide.id === slideId);
        if (slideExists) {
          updatedDockers[slideId] = updatedDockers[slideId] || [];
          updatedDockers[slideId].push({
            documentId: locker.documentId,
            type: locker.type,
            title: locker.title,
            details: {
              image: locker.image,
              video: locker.type === "Video" ? locker.image : null,
              html: locker.code || "",
              autoresponder: locker.code || "",
              ctaText: locker.cta_text || "",
              ctaUrl: locker.cta_url || "",
              title: locker.title || "",
              description: locker.description || "",
              allowClose: !locker.disable_close,
              ctaBtnColor: locker.cta_btn_color || "#000000",
              ctaBtnTxtColor: locker.cta_btn_txt_color || "#ffffff",
            },
          });
        } else {
          console.warn(`No slide found with id ${slideId} for locker ${locker.documentId}`);
        }
      });

      console.log("Updated dockers:", updatedDockers);
      setSlideDockers(updatedDockers);
    } catch (error) {
      console.error("Error fetching lockers:", error);
      toast.error(`Failed to load lockers: ${error.message}`);
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
      console.log("Saving locker with presentationId:", presentationId);
      console.log("Docker form data:", dockerForm);

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
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          toast("Video size is High!")
          throw new Error(`Failed to upload file: ${uploadResponse.status} - ${errorText}`);
        }
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
          slide_number: dockerForm.slideNumber, // Use slide.id (e.g., "1107")
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

      console.log("Saving to endpoint:", endpoint);
      console.log("Payload:", payload);

      const response = await fetch(endpoint, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save locker: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log("Save locker response:", responseData);

      const slideId = dockerForm.slideNumber; // Use slide.id directly
      if (slideId) {
        const lockerDocumentId = dockerForm.documentId || responseData.data.documentId;
        const newDocker = {
          documentId: lockerDocumentId,
          type: dockerForm.lockerType,
          title: dockerForm.title || dockerForm.ctaText || dockerForm.lockerType,
          details: {
            ...dockerForm,
            image: imageUrl,
            video: dockerForm.lockerType === "Video" ? imageUrl : null,
            documentId: lockerDocumentId,
          },
        };

        setSlideDockers((prev) => ({
          ...prev,
          [slideId]: dockerForm.documentId
            ? (prev[slideId] || []).map((d) => (d.documentId === dockerForm.documentId ? newDocker : d))
            : [...(prev[slideId] || []), newDocker],
        }));
      }

      toast.success("Locker saved successfully!");
      resetForm();
      await fetchLockers();
    } catch (error) {
      console.error("Error saving locker:", error);
      toast.error(`Failed to save locker: ${error.message}`);
    } finally {
      setIsSavingLocker(false);
    }
  };

  const handleEditDocker = (slideId, docker) => {
    const details = docker.details || {};
    setDockerForm({
      documentId: docker.documentId,
      lockerType: docker.type || "Banner",
      image: details.image || null,
      video: details.video || null,
      html: details.html || "",
      autoresponder: details.autoresponder || "",
      ctaText: details.ctaText || "",
      ctaUrl: details.ctaUrl || "",
      title: details.title || docker.title || "",
      description: details.description || "",
      slideNumber: slideId, // Use slide.id (e.g., "1107")
      allowClose: details.allowClose ?? false,
      ctaBtnColor: details.ctaBtnColor || "#000000",
      ctaBtnTxtColor: details.ctaBtnTxtColor || "#ffffff",
    });
    setSelectedLockerType(docker.type || "Banner");
    setIsDockerPopupOpen(true);
  };

  const handleDeleteDocker = async (slideId, dockerDocumentId) => {
    try {
      console.log("Deleting locker with documentId:", dockerDocumentId);
      const response = await fetch(`https://presentaiapi.codesemic.com/api/locakers/${dockerDocumentId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete locker: ${response.status} - ${errorText}`);
      }
      console.log("Delete locker response:", await response.text());

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
      toast.success("Locker deleted successfully!");
    } catch (error) {
      console.error("Error deleting locker:", error);
      toast.error(`Failed to delete locker: ${error.message}`);
    }
  };

  const resetForm = () => {
    setDockerForm({
      documentId: null,
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
            <DialogTitle className="text-2xl">{dockerForm.documentId ? "Edit Locker" : "Add New Locker"}</DialogTitle>
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
                    slides.map((slide) => (
                      <DropdownMenu key={slide.id}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-left font-medium text-gray-700 hover:bg-gray-50 border-gray-200"
                          >
                            <span>{slide.titleContainer?.title.replace(/<[^>]*>/g, "") || `Slide ${slides.indexOf(slide) + 1}`}</span>
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-72 p-2 bg-white shadow-lg rounded-md">
                          {slideDockers[slide.id]?.length > 0 ? (
                            slideDockers[slide.id].map((docker) => (
                              <div
                                key={docker.documentId}
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
                    <Label className="mb-1 text-gray-700">Slide</Label>
                    <Select
                      value={dockerForm.slideNumber}
                      onValueChange={(value) => handleInputChange("slideNumber", value)}
                    >
                      <SelectTrigger className="w-full border-gray-300">
                        <SelectValue placeholder="Select slide" />
                      </SelectTrigger>
                      <SelectContent>
                        {slides.map((slide) => (
                          <SelectItem key={slide.id} value={String(slide.id)}> {/* Use slide.id as value */}
                            {slide.titleContainer?.title.replace(/<[^>]*>/g, "") || `Slide ${slides.indexOf(slide) + 1}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                        
                        {selectedLockerType === 'Whatsapp'? 
                        <>
                          <Label className="mb-1 text-gray-700">Phone Number</Label>
                          <Input
                          type="url"
                          placeholder="Enter Phone Number"
                          value={dockerForm.ctaUrl}
                          onChange={(e) => handleInputChange("ctaUrl", e.target.value)}
                          className="w-full border-gray-300"
                        /> </>  : 
                          <>
                          <Label className="mb-1 text-gray-700">Call to Action Button URL</Label>
                          <Input
                          type="url"
                          placeholder="https://example.com"
                          value={dockerForm.ctaUrl}
                          onChange={(e) => handleInputChange("ctaUrl", e.target.value)}
                          className="w-full border-gray-300"
                        />
                          </> }
                        
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
              ) : dockerForm.documentId ? (
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