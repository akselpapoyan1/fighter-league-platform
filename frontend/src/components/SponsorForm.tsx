import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/apiClient";
import UploadPhoto from "@/components/UploadPhoto";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

interface SponsorProfile {
  company_name: string;
  website: string;
  logo_url: string;
  contact_email: string;
  description: string;
  tier: "Gold" | "Silver" | "Bronze" | "Partner";
}

const SponsorForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    tier: "Partner" as SponsorProfile["tier"],
  });

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tier: value as SponsorProfile["tier"] }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !imageFile
    ) {
      toast({
        title: "Missing required fields",
        description:
          "Please fill in all * required fields and upload an image.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const fileExt = imageFile!.name.split(".").pop();
      const fileName = `${formData.name!.replace(
        / /g,
        "_"
      )}_logo_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("sponsor-logos")
        .upload(filePath, imageFile!);

      if (uploadError) {
        throw new Error(`Logo upload failed: ${uploadError.message}`);
      }
      const logoUrl = uploadData.path;

      const registerPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        user_type: "SPONSOR",
        logo_url: logoUrl,
        tier: formData.tier,
      };

      const registerRes = await apiClient.post(
        "/auth/register",
        registerPayload
      );

      toast({
        title: "Sponsor Registration Complete!",
        description:
          registerRes.data.message ||
          "Welcome! Please log in to your new account.",
      });

      navigate("/login");

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        tier: "Partner",
      });
      setPreview(null);
      setImageFile(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setImageFile(null);
  };

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            placeholder="Enter your company name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="companyName">Logo *</Label>
          <UploadPhoto
            preview={preview}
            removeImage={removeImage}
            handleFileChange={handleFileChange}
          />
        </div>
        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="email">Work Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="confirmPassword">Confirm password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="sponsorLevel">Sponsorship Tier</Label>
          <Select value={formData.tier} onValueChange={handleSelectChange}>
            <SelectTrigger id="tier">
              <SelectValue placeholder="Select Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Platinum">Platinum</SelectItem>
              <SelectItem value="Gold">Gold</SelectItem>
              <SelectItem value="Silver">Silver</SelectItem>
              <SelectItem value="Bronze">Bronze</SelectItem>
              <SelectItem value="Partner">Partner (Default)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="pt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default SponsorForm;
