import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { DonationRequest, Donation, User, DonationStatus } from '@/types/database';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LocationMap from '@/components/common/LocationMap';
import { SafeMapWrapper } from '@/components/common/SafeMapWrapper';
import ImpactCard from '@/components/stats/ImpactCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ChatWindow from '@/components/chat/ChatWindow';
import { toast } from 'sonner';
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Building2,
  Utensils,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RequestWithDetails extends Omit<DonationRequest, 'donation'> {
  donation?: Donation & { donor?: User };
}

export default function NgoDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isMarkingCollected, setIsMarkingCollected] = useState(false);

  const stats = {
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    acceptedRequests: requests.filter(r => r.status === 'accepted').length,
    totalRequests: requests.length,
    collectedFood: requests.filter(r => r.donation?.status === 'collected').length,
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
      // Poll unread counts
      const interval = setInterval(fetchUnreadCounts, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCounts = async () => {
    try {
      const res = await api.get('/chats/unread-counts');
      setUnreadCounts(res.data);
    } catch (error) {
      console.error('Failed to fetch unread counts', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests/my-requests');
      setRequests(res.data);
      fetchUnreadCounts();
    } catch (error) {
      console.error('Error fetching NGO requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkCollected = async () => {
    if (!selectedRequest?.donation) return;

    setIsMarkingCollected(true);

    try {
      await api.put(`/donations/${selectedRequest.donation.id}`, {
        status: 'collected'
      });

      toast.success('Marked as collected!');
      setShowDetailsModal(false);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsMarkingCollected(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'status-badge-requested',
      accepted: 'status-badge-accepted',
      rejected: 'status-badge-expired',
    };
    return colors[status] || '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30 py-8">
        <div className="container">
          {/* Welcome */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {user?.organizationName || user?.fullName}
              </h1>
              <p className="text-muted-foreground">Track your food requests and pickups</p>
            </div>
            <Button size="lg" onClick={() => navigate('/browse')}>
              <Search className="h-5 w-5" />
              Find Food
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <ImpactCard
              icon={<Clock className="h-6 w-6 text-secondary" />}
              value={stats.pendingRequests}
              label="Pending Requests"
            />
            <ImpactCard
              icon={<CheckCircle className="h-6 w-6 text-accent" />}
              value={stats.acceptedRequests}
              label="Accepted"
              gradient
            />
            <ImpactCard
              icon={<Utensils className="h-6 w-6 text-primary" />}
              value={stats.collectedFood}
              label="Food Collected"
            />
            <ImpactCard
              icon={<Building2 className="h-6 w-6 text-muted-foreground" />}
              value={stats.totalRequests}
              label="Total Requests"
            />
          </div>

          {/* Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <Utensils className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Browse available food donations and request what your organization needs.
                  </p>
                  <Button onClick={() => navigate('/browse')}>
                    Browse Food
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailsModal(true);
                      }}
                    >
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {request.donation?.imageUrl ? (
                          <img
                            src={request.donation.imageUrl}
                            alt={request.donation.foodName}
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <Utensils className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{request.donation?.foodName || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {request.donation?.location}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      {request.donation && unreadCounts[request.donation._id] > 0 && (
                        <Badge variant="destructive" className="ml-2 rounded-full h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {unreadCounts[request.donation._id]}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {/* Request Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              {selectedRequest?.status === 'accepted'
                ? 'Your request was accepted! Contact the donor to arrange pickup.'
                : selectedRequest?.status === 'rejected'
                  ? 'Unfortunately, this request was declined.'
                  : 'Waiting for the donor to respond to your request.'}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && !showChat && (
            <div className="space-y-4 py-2">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg ${selectedRequest.status === 'accepted' ? 'bg-accent/10 text-accent-foreground' :
                selectedRequest.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                  'bg-secondary/10 text-secondary-foreground'
                }`}>
                <div className="flex items-center gap-2">
                  {selectedRequest.status === 'accepted' && <CheckCircle className="h-5 w-5 text-accent" />}
                  {selectedRequest.status === 'rejected' && <XCircle className="h-5 w-5 text-destructive" />}
                  {selectedRequest.status === 'pending' && <Clock className="h-5 w-5 text-secondary" />}
                  <span className="font-medium capitalize">{selectedRequest.status}</span>
                </div>
              </div>

              {/* Food Details */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Food Details
                </h4>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <p className="font-medium">{selectedRequest.donation?.foodName}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {selectedRequest.donation?.quantity}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {selectedRequest.donation?.location}
                  </p>
                </div>
              </div>

              {/* Location Map */}
              {selectedRequest.donation?.location && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Pickup Location
                  </h4>
                  <SafeMapWrapper>
                    <LocationMap
                      className="h-[180px]"
                      location={selectedRequest.donation.location}
                      latitude={selectedRequest.donation.latitude ?? undefined}
                      longitude={selectedRequest.donation.longitude ?? undefined}
                    />
                  </SafeMapWrapper>
                </div>
              )}

              {/* Donor Contact - Only show if accepted */}
              {selectedRequest.status === 'accepted' && selectedRequest.donation?.donor && typeof selectedRequest.donation.donor !== 'string' && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Donor Contact
                  </h4>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                    <p className="font-medium">{(selectedRequest.donation.donor as User).fullName || 'N/A'}</p>
                    {(selectedRequest.donation.donor as User).organizationName && (
                      <p className="text-sm text-muted-foreground">
                        {(selectedRequest.donation.donor as User).organizationName}
                      </p>
                    )}
                    <p className="text-sm flex items-center gap-2">
                      <Mail className="h-3 w-3 text-primary" />
                      <a href={`mailto:${(selectedRequest.donation.donor as User).email}`} className="text-primary hover:underline">
                        {(selectedRequest.donation.donor as User).email}
                      </a>
                    </p>
                    {(selectedRequest.donation.donor as User).phone && (
                      <p className="text-sm flex items-center gap-2">
                        <Phone className="h-3 w-3 text-primary" />
                        <a href={`tel:${(selectedRequest.donation.donor as User).phone}`} className="text-primary hover:underline">
                          {(selectedRequest.donation.donor as User).phone}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}



          {selectedRequest && showChat && (
            <div className="py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(false)}
                className="mb-2"
              >
                ← Back to Details
              </Button>
              <ChatWindow
                donationId={selectedRequest.donation?.id || ''}
                onMessagesRead={() => {
                  if (selectedRequest.donation) {
                    setUnreadCounts(prev => ({ ...prev, [selectedRequest.donation.id]: 0 }));
                  }
                }}
              />
            </div>
          )}

          {!showChat && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              {selectedRequest?.status === 'accepted' && (
                <Button onClick={() => setShowChat(true)} variant="secondary">
                  Chat with Donor
                </Button>
              )}
              {selectedRequest?.status === 'accepted' && selectedRequest.donation?.status !== 'collected' && (
                <Button onClick={handleMarkCollected} disabled={isMarkingCollected}>
                  {isMarkingCollected ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Collected
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div >
  );
}
