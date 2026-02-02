import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Donation, DonationStatus } from '@/types/database';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DonationCard from '@/components/donations/DonationCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Filter, MapPin, Clock, Utensils, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Browse() {
  const { user, userRole } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [foodTypeFilter, setFoodTypeFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState('');

  // Request modal
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, []);

  useEffect(() => {
    filterDonations();
  }, [donations, searchTerm, foodTypeFilter, locationFilter]);

  const fetchDonations = async () => {
    try {
      const res = await api.get('/donations'); // Backend filters expired/available
      setDonations(res.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to load donations');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDonations = () => {
    let filtered = [...donations];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.foodName.toLowerCase().includes(term) ||
        d.description?.toLowerCase().includes(term) ||
        d.location.toLowerCase().includes(term)
      );
    }

    if (foodTypeFilter !== 'all') {
      filtered = filtered.filter(d => d.foodType === foodTypeFilter);
    }

    if (locationFilter) {
      filtered = filtered.filter(d =>
        d.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredDonations(filtered);
  };

  const handleRequestFood = (donation: Donation) => {
    if (!user) {
      toast.error('Please sign in to request food');
      return;
    }
    if (userRole !== 'ngo') {
      toast.error('Only NGOs can request food');
      return;
    }
    setSelectedDonation(donation);
    setShowRequestModal(true);
  };

  const submitRequest = async () => {
    if (!selectedDonation || !user) return;

    setIsSubmitting(true);

    try {
      await api.post('/requests', {
        donationId: selectedDonation.id,
        message: requestMessage
      });

      // Status update is handled by backend

      toast.success('Request sent successfully!');
      setShowRequestModal(false);
      setRequestMessage('');
      fetchDonations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-12">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Browse Available Food</h1>
            <p className="text-muted-foreground max-w-2xl">
              Discover food donations from generous donors in your area.
              Filter by location, food type, and more to find what your organization needs.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b border-border bg-background sticky top-16 z-40">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by food name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-4">
                <div className="relative w-48">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    placeholder="Location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={foodTypeFilter} onValueChange={setFoodTypeFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Food Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="veg">🥬 Vegetarian</SelectItem>
                    <SelectItem value="non_veg">🍖 Non-Veg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-8">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredDonations.length}</span> available donations
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="text-center py-20">
                <Utensils className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No donations found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters to find available food donations.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDonations.map((donation) => (
                  <DonationCard
                    key={donation.id}
                    donation={donation}
                    onRequest={() => handleRequestFood(donation)}
                    onViewDetails={() => handleViewDetails(donation)}
                    showDonorInfo={true} // Show donor info in browse
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Request Modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Food</DialogTitle>
            <DialogDescription>
              Send a request to the donor for "{selectedDonation?.foodName}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Message (Optional)</Label>
              <Textarea
                placeholder="Add a message to the donor..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium">What happens next?</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>The donor will review your request</li>
                <li>If accepted, you'll see their contact details</li>
                <li>Coordinate pickup directly with the donor</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestModal(false)}>
              Cancel
            </Button>
            <Button onClick={submitRequest} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedDonation?.foodName}</DialogTitle>
          </DialogHeader>

          {selectedDonation && (
            <div className="space-y-4">
              {selectedDonation.imageUrl && (
                <img
                  src={selectedDonation.imageUrl}
                  alt={selectedDonation.foodName}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <div className="flex gap-2">
                <Badge variant={selectedDonation.foodType === 'veg' ? 'default' : 'secondary'}>
                  {selectedDonation.foodType === 'veg' ? '🥬 Vegetarian' : '🍖 Non-Veg'}
                </Badge>
                <Badge variant="outline" className="status-badge-available">
                  Available
                </Badge>
              </div>

              {selectedDonation.description && (
                <p className="text-muted-foreground">{selectedDonation.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedDonation.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Utensils className="h-4 w-4 text-muted-foreground" />
                  <span>Quantity: {selectedDonation.quantity}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Available: {format(new Date(selectedDonation.availableFrom), 'MMM d, h:mm a')} -
                    Expires: {format(new Date(selectedDonation.expiresAt), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
            {userRole === 'ngo' && (
              <Button onClick={() => {
                setShowDetailsModal(false);
                if (selectedDonation) handleRequestFood(selectedDonation);
              }}>
                Request This Food
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
