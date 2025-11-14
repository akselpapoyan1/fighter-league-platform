import { useState, ChangeEvent, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/apiClient";
import UploadPhoto from "@/components/UploadPhoto";
import { Division, Fighter } from "@/types/fighter";
import { supabase } from "@/lib/supabaseClient";
import { X } from "lucide-react";

const FighterForm = () => {
  const { toast } = useToast();

  const initialFormState: Partial<Fighter> = {
    name: "",
    country: "",
    walletAddress: "",
    weight: undefined,
    gender: undefined,
    division: "",
    wins: 0,
    losses: 0,
    draws: 0,
    image: "",
    bio: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [divisions, setDivisions] = useState<Division[]>([]);

  const [achievements, setAchievements] = useState<string[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState("");

  useEffect(() => {
    apiClient
      .get<Division[]>("/divisions")
      .then((res) => setDivisions(res.data))
      .catch((err) => console.error("Failed to fetch divisions", err));
  }, []);

  const handleChange = (field: string, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const handleAddAchievement = () => {
    if (currentAchievement.trim() === "") return;
    setAchievements([...achievements, currentAchievement.trim()]);
    setCurrentAchievement("");
  };

  const handleRemoveAchievement = (indexToRemove: number) => {
    setAchievements(achievements.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formData.name ||
      !formData.country ||
      !formData.gender ||
      !formData.weight ||
      !formData.division ||
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

    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${formData.name!.replace(
        / /g,
        "_"
      )}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("fighter-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const payload = {
        ...formData,
        image: uploadData.path,
        achievements: achievements,
      };

      const response = await apiClient.post("/fighters/register", payload);

      toast({
        title: "Registration Submitted!",
        description:
          response.data.message || "We'll review and contact you soon.",
      });

      setFormData(initialFormState);
      setPreview(null);
      setImageFile(null);
      setAchievements([]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred.";
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableDivisions = divisions.filter(
    (d) => !formData.gender || d.gender === formData.gender
  );

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name ?? ""}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="walletAddress">Wallet Address (Optional)</Label>
          <Input
            id="walletAddress"
            value={formData.walletAddress ?? ""}
            onChange={(e) => handleChange("walletAddress", e.target.value)}
            placeholder="Your 0x... wallet address"
          />
          <p className="text-xs text-muted-foreground">
            Link your profile to a user account (optional).
          </p>
        </div>

        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            value={formData.country ?? ""}
            onChange={(e) => handleChange("country", e.target.value)}
            placeholder="Enter your country"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 flex flex-col items-start">
            <Label htmlFor="gender">Gender *</Label>
            <Select
              value={formData.gender ?? ""}
              onValueChange={(value) => handleChange("gender", value)}
              required
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex flex-col items-start">
            <Label htmlFor="weight">Weight (lbs) *</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight ?? ""}
              onChange={(e) => handleChange("weight", Number(e.target.value))}
              placeholder="Enter weight"
              required
            />
          </div>
        </div>

        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="division">Division *</Label>
          <Select
            value={formData.division ?? ""}
            onValueChange={(value) => handleChange("division", value)}
            disabled={!formData.gender || divisions.length === 0}
            required
          >
            <SelectTrigger id="division">
              <SelectValue
                placeholder={
                  !formData.gender ? "Select gender first" : "Select division"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableDivisions.map((division) => (
                <SelectItem key={division.id} value={division.name}>
                  {division.name} ({division.min_weight} -{division.max_weight}{" "}
                  lbs)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="fileUpload">Profile Image *</Label>
          <UploadPhoto
            preview={preview}
            removeImage={removeImage}
            handleFileChange={handleFileChange}
          />
        </div>

        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="bio">Biography</Label>
          <Textarea
            id="bio"
            value={formData.bio ?? ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Tell us about your fighting background..."
            rows={5}
          />
        </div>

        <div className="space-y-4 flex flex-col items-start">
          <Label>Achievements</Label>
          <div className="flex gap-2 w-full">
            <Input
              value={currentAchievement}
              onChange={(e) => setCurrentAchievement(e.target.value)}
              placeholder="e.g., National Champion 2023"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddAchievement}
            >
              Add
            </Button>
          </div>
          <div className="flex items-start justify-start gap-1 flex-wrap">
            {achievements.map((ach, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 text-sm bg-muted rounded-md"
              >
                <span>{ach}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAchievement(index)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2 flex flex-col items-start">
            <Label htmlFor="wins">Wins *</Label>
            <Input
              id="wins"
              type="number"
              value={formData.wins ?? 0}
              onChange={(e) => handleChange("wins", Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2 flex flex-col items-start">
            <Label htmlFor="losses">Losses *</Label>
            <Input
              id="losses"
              type="number"
              value={formData.losses ?? 0}
              onChange={(e) => handleChange("losses", Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2 flex flex-col items-start">
            <Label htmlFor="draws">Draws *</Label>
            <Input
              id="draws"
              type="number"
              value={formData.draws ?? 0}
              onChange={(e) => handleChange("draws", Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-gold hover:opacity-90 transition-opacity"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Registration"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          By registering, you agree to our terms and conditions.
        </p>
      </form>
    </Card>
  );
};

export default FighterForm;
