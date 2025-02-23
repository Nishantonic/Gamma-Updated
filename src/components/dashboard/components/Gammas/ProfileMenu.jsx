import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const defaultProfile = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
};

const ProfileMenu = () => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profileData, setProfileData] = useState(defaultProfile);
  const [tempProfileData, setTempProfileData] = useState(profileData);

  useEffect(() => {
    const savedProfile = localStorage.getItem("profileData");
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfileData(parsedProfile);
      setTempProfileData(parsedProfile);
    }
  }, []);

  const handleSaveProfile = () => {
    setProfileData(tempProfileData);
    localStorage.setItem("profileData", JSON.stringify(tempProfileData));
    setIsEditOpen(false);
  };

  const handleLogout = () => {
    // Clear profile data from localStorage
    localStorage.removeItem("profileData");
    
    // Reset state to default (optional, since we're redirecting)
    setProfileData(defaultProfile);
    setTempProfileData(defaultProfile);
    
    // Redirect to home page
    window.location.href = "http://localhost:5173/";
  };

  const handleAvatarClick = (e) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setTempProfileData(prev => ({
            ...prev,
            avatar: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center focus:outline-none">
            <Avatar className="w-10 h-10 border-2 border-gray-200">
              <AvatarImage src={profileData.avatar} alt="Profile picture" />
              <AvatarFallback>
                {profileData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex flex-col items-center gap-2 p-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profileData.avatar} alt="Profile picture" />
              <AvatarFallback>
                {profileData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-sm font-medium">{profileData.name}</p>
              <p className="text-xs text-gray-500">{profileData.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24 cursor-pointer hover:opacity-90 transition-opacity" onClick={handleAvatarClick}>
                  <AvatarImage src={tempProfileData.avatar} alt="Profile picture" />
                  <AvatarFallback>
                    {tempProfileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-full">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </Avatar>
                <p className="text-xs text-gray-500 text-center mt-2">Click to change photo</p>
              </div>
              <div className="grid w-full gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={tempProfileData.name}
                    onChange={(e) => setTempProfileData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={tempProfileData.email}
                    onChange={(e) => setTempProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileMenu;