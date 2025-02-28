import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import axios from "axios";
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
import { toast } from "react-toastify";

const defaultProfile = {
  name: "Guest User",
  email: "guest@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
  id: null
};

const ProfileMenu = () => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profileData, setProfileData] = useState(defaultProfile);
  const [tempProfileData, setTempProfileData] = useState(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      
      try {
        // First check if we have user data in localStorage from login
        const storedUser = localStorage.getItem("user");
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Create profile data from stored user
          const userProfile = {
            id: userData.id,
            name: userData.username || userData.name || defaultProfile.name,
            email: userData.email || defaultProfile.email,
            avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username || userData.email}`
          };
          
          setProfileData(userProfile);
          setTempProfileData(userProfile);
        } else {
          // If no data in localStorage, try fetching from API
          const token = localStorage.getItem("token");
          
          if (token) {
            const response = await axios.get("https://presentaiapi.codesemic.com/api/users/me", {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            const userData = response.data;
            
            // Create profile data from API response
            const userProfile = {
              id: userData.id,
              name: userData.username || userData.name || defaultProfile.name,
              email: userData.email || defaultProfile.email,
              avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username || userData.email}`
            };
            
            setProfileData(userProfile);
            setTempProfileData(userProfile);
            
            // Update localStorage with this data for future use
            localStorage.setItem("user", JSON.stringify(userData));
          } else {
            // Check for any previously saved profile data
            const savedProfile = localStorage.getItem("profileData");
            if (savedProfile) {
              const parsedProfile = JSON.parse(savedProfile);
              setProfileData(parsedProfile);
              setTempProfileData(parsedProfile);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data");
        
        // Check for any previously saved profile data as fallback
        const savedProfile = localStorage.getItem("profileData");
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          setProfileData(parsedProfile);
          setTempProfileData(parsedProfile);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveProfile = async () => {
    // Don't proceed if no user ID is available
    if (!profileData.id) {
      toast.warning("Cannot update profile: User ID not available");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      // Prepare the data to be sent to the API
      const updateData = {
        username: tempProfileData.name,  // assuming backend expects username
        email: tempProfileData.email
      };
      
      // If avatar was changed and is a data URL, we need to handle it differently
      if (tempProfileData.avatar && tempProfileData.avatar.startsWith('data:')) {
        // For this example, we'll just note that avatar handling would require
        // additional file upload functionality to the API
        console.log("Avatar upload would need separate file handling");
        // In a real implementation, you would upload the avatar file to the server
      }
      
      // Make the PUT request to update the user
      const response = await axios.put(
        `https://presentaiapi.codesemic.com/api/users/${profileData.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      // Update the local state with the response data
      const updatedUserData = response.data;
      
      const updatedProfile = {
        id: updatedUserData.id,
        name: updatedUserData.username || updatedUserData.name,
        email: updatedUserData.email,
        avatar: updatedUserData.avatar || tempProfileData.avatar // Keep the current avatar if API doesn't return one
      };
      
      setProfileData(updatedProfile);
      
      // Update the localStorage with the new data
      localStorage.setItem("user", JSON.stringify(updatedUserData));
      localStorage.setItem("profileData", JSON.stringify(updatedProfile));
      
      toast.success("Profile updated successfully");
      setIsEditOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
      
      // Fallback to local storage if API fails
      setProfileData(tempProfileData);
      localStorage.setItem("profileData", JSON.stringify(tempProfileData));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    // Clear all auth data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profileData");
    
    // Reset state to default
    setProfileData(defaultProfile);
    setTempProfileData(defaultProfile);
    
    // Redirect to login page
    window.location.href = "/";
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

  if (isLoading) {
    return (
      <Avatar className="w-10 h-10 border-2 border-gray-200 animate-pulse">
        <AvatarFallback>...</AvatarFallback>
      </Avatar>
    );
  }

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
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileMenu;