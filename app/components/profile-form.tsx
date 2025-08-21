import { useState, useRef } from "react";
import { Form, useSubmit } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { User, Upload, X } from "lucide-react";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
}

interface ProfileFormProps {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    websiteUrl: string | null;
    avatarUrl: string | null;
  };
  onClose: () => void;
}

export function ProfileForm({ user, onClose }: ProfileFormProps) {
  const submit = useSubmit();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatarUrl);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    bio: user.bio || "",
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    state: user.state || "",
    country: user.country || "",
    linkedinUrl: user.linkedinUrl || "",
    githubUrl: user.githubUrl || "",
    websiteUrl: user.websiteUrl || "",
  });

  // No longer needed - using uncontrolled inputs with defaultValue

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPEG, PNG, and WebP images are allowed');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(user.avatarUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // No custom handleSubmit needed - let React Router handle form submission

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Form method="post" encType="multipart/form-data">
            {/* Avatar Section */}
            <div className="mb-6">
              <Label className="text-sm font-medium">Profile Picture</Label>
              <div className="mt-2 flex items-center space-x-4">
                <div className="relative">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {selectedFile ? 'Change Image' : 'Upload Image'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG, WebP up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={formData.firstName}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={formData.lastName}
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <Label htmlFor="bio">Bio</Label>
                              <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={formData.bio}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  name="phone"
                  defaultValue={formData.phone}
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={formData.address}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={formData.city}
                />
              </div>
              
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue={formData.state}
                />
              </div>
              
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={formData.country}
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  name="linkedinUrl"
                  defaultValue={formData.linkedinUrl}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              
              <div>
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  name="githubUrl"
                  defaultValue={formData.githubUrl}
                  placeholder="https://github.com/..."
                />
              </div>
              
              <div>
                <Label htmlFor="websiteUrl">Personal Website</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  name="websiteUrl"
                  defaultValue={formData.websiteUrl}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Hidden action field */}
            <input type="hidden" name="_action" value="updateProfile" />
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
