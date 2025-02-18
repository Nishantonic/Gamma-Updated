import { useState, useEffect } from "react";
import { Folders, Coins, Bell, Clipboard, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GammaFunction from "./GammaFunction";
import Card from "./Card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Gammas = ({ credits, setCredits }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ArraySlides, setArraySlides] = useState([]);
  const navigate = useNavigate();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const savedSlides = localStorage.getItem("slides");
    if (savedSlides) {
      setArraySlides(JSON.parse(savedSlides));
    }
  }, []);

  const handleCardClick = (slides, key) => {
    if (!slides || slides.length === 0) return;
    navigate("/page", {
      state: {
        slidesArray: slides.map((slide) => ({
          ...slide,
          dropContainer: {
            dropItems: slide.dropContainer?.dropItems || [],
          },
        })),
        key: key,
      },
    });
  };

  const handleDeleteSlide = (id) => {
    const slideToDelete = ArraySlides.find((slide) => slide.key === id);
    const updatedSlides = ArraySlides.filter((slide) => slide.key !== id);
    setArraySlides(updatedSlides);
    localStorage.setItem("slides", JSON.stringify(updatedSlides));

    const trash = JSON.parse(localStorage.getItem("trash") || "[]");
    trash.push(slideToDelete);
    localStorage.setItem("trash", JSON.stringify(trash));
  };

  const handleShare = (pptKey) => {
    const url = `http://localhost:5173/share/${pptKey}`;
    setShareUrl(url);
    setIsShareOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Folders className="w-6 h-6 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-800">Gammas</h3>
        </div>
        <div className="flex items-center gap-4 text-gray-600">
          <Coins className="w-6 h-6 text-gray-700" />
          <span>{credits} Credits</span>
          <Bell className="w-6 h-6 text-gray-700 cursor-pointer" onClick={() => setIsOpen(!isOpen)} />
        </div>
      </div>
      <div className="p-4 bg-gray-100 rounded-md">
        <Link to="/page" className="border border-gray-300 bg-white px-4 py-2 rounded-md shadow-sm hover:bg-gray-200">
          + New Gamma Blank
        </Link>
      </div>
      <GammaFunction />
      <div className="flex flex-wrap gap-4 mt-4">
        {ArraySlides.length === 0 ? (
          <p className="text-gray-500">No slides available</p>
        ) : (
          ArraySlides.map((slideGroup) => (
            slideGroup.slides && slideGroup.slides.length > 0 ? (
              <>
                <Card
                  key={slideGroup.key}
                  slide={slideGroup.slides[0] || {}}
                  onClick={() => handleCardClick(slideGroup.slides, slideGroup.key)}
                  onDelete={() => handleDeleteSlide(slideGroup.key)}
                  Share={() => handleShare(slideGroup.key)}
                />
                <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                  <DialogContent className="sm:max-w-md bg-white shadow-lg rounded-lg p-6 border border-gray-200 backdrop-blur-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold text-gray-800">Share Gamma</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-between gap-4 mt-4 bg-gray-50 p-3 rounded-md">
                      <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate">
                        {shareUrl}
                      </a>
                      <button onClick={copyToClipboard} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
                        {copied ? <Check className="text-green-600" /> : <Clipboard className="text-gray-600" />}
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : null
          ))
        )}
      </div>
    </div>
  );
};

export default Gammas;