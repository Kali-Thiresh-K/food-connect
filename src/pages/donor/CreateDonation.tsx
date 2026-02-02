import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FoodType } from '@/types/database';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Clock,
  Utensils,
  ImagePlus,
  Calendar,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { format, addHours } from 'date-fns';

export default function CreateDonation() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    foodName: '',
    foodType: 'veg' as FoodType,
    quantity: '',
    description: '',
    location: '',
    availableFrom: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    expiresAt: format(addHours(new Date(), 6), "yyyy-MM-dd'T'HH:mm"),
    imageUrl: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        toast.success('Location fetched successfully!');
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Failed to get location. Please enable location services.');
        setIsGettingLocation(false);
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in to create a donation');
      return;
    }

    // Validate expiry time
    if (new Date(formData.expiresAt) <= new Date(formData.availableFrom)) {
      setError('Expiry time must be after available time');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/donations', {
        foodName: formData.foodName,
        foodType: formData.foodType,
        quantity: formData.quantity,
        description: formData.description,
        location: formData.location,
        availableFrom: new Date(formData.availableFrom),
        expiresAt: new Date(formData.expiresAt),
        imageUrl: formData.imageUrl,
        latitude: formData.latitude,
        longitude: formData.longitude
      });

      toast.success('Donation created successfully!');
      navigate('/donor/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create donation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30 py-8">
        <div className="container max-w-2xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="text-2xl">Create Food Donation</CardTitle>
              <CardDescription>
                Share your surplus food with those who need it. Fill in the details below.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Food Type */}
                <div className="space-y-3">
                  <Label>Food Type</Label>
                  <RadioGroup
                    value={formData.foodType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, foodType: value as FoodType }))}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="veg" id="veg" className="peer sr-only" />
                      <Label
                        htmlFor="veg"
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                      >
                        <span className="text-2xl">🥬</span>
                        <span className="font-semibold">Vegetarian</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="non_veg" id="non_veg" className="peer sr-only" />
                      <Label
                        htmlFor="non_veg"
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                      >
                        <span className="text-2xl">🍖</span>
                        <span className="font-semibold">Non-Veg</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Food Name */}
                <div className="space-y-2">
                  <Label htmlFor="foodName">Food Name *</Label>
                  <div className="relative">
                    <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="foodName"
                      name="foodName"
                      placeholder="e.g., Rice and Curry, Fresh Vegetables"
                      value={formData.foodName}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    placeholder="e.g., Serves 20 people, 5 kg"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Add any additional details about the food..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>



                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Pickup Location *</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        name="location"
                        placeholder="Full address for pickup"
                        value={formData.location}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      title="Use Current Location"
                    >
                      {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                    </Button>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Location coordinates captured
                    </p>
                  )}
                </div>

                {/* Time */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availableFrom">Available From *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="availableFrom"
                        name="availableFrom"
                        type="datetime-local"
                        value={formData.availableFrom}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Expires At *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="expiresAt"
                        name="expiresAt"
                        type="datetime-local"
                        value={formData.expiresAt}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                  <Label htmlFor="image">Food Image (Optional)</Label>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="w-full sm:w-auto"
                        disabled={isLoading}
                      >
                        <ImagePlus className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const formData = new FormData();
                          formData.append('image', file);

                          try {
                            const toastId = toast.loading('Uploading image...');
                            const res = await api.post('/upload', formData, {
                              headers: {
                                'Content-Type': 'multipart/form-data',
                              },
                            });
                            setFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
                            toast.dismiss(toastId);
                            toast.success('Image uploaded!');
                          } catch (err) {
                            console.error('Upload failed:', err);
                            toast.error('Failed to upload image');
                          }
                        }}
                      />
                    </div>

                    {formData.imageUrl && (
                      <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-border">
                        <img
                          src={formData.imageUrl}
                          alt="Food preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Upload a photo of the food (Max 5MB).
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Donation'
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      </main >

      <Footer />
    </div >
  );
}
