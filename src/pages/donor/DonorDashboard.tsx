import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Donation, DonationRequest, User, RequestStatus } from '@/types/database';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ImpactCard from '@/components/stats/ImpactCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ChatWindow from '@/components/chat/ChatWindow';
import { toast } from 'sonner';
import {
  Plus,
  Utensils,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Mail,
  Building2,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Correct types for populated requests
interface RequestWithDetails extends Omit<DonationRequest, 'donation' | 'requester'> {
  donation: Donation;
  requester: User;
}

export default function DonorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithDetails | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const stats = {
    totalDonations: donations.length,
    activeDonations: donations.filter(d => d.status === 'available').length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    completedDonations: donations.filter(d => d.status === 'collected').length,
  };

  useEffect(() => {
    if (user) {
      fetchData();
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

  const fetchData = async () => {
    try {
      // Fetch donations
      const donationsRes = await api.get('/donations/my-donations');
      setDonations(donationsRes.data);

      // Fetch received requests
      const requestsRes = await api.get('/requests/received');
      setRequests(requestsRes.data);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setIsLoading(false);
    }
  };

  const handleRequestAction = async (action: 'accept' | 'reject') => {
    if (!selectedRequest || !user) return;

    setIsProcessing(true);

    try {
      const newStatus: RequestStatus = action === 'accept' ? 'accepted' : 'rejected';

      await api.put(`/requests/${selectedRequest.id}`, { status: newStatus });

      toast.success(action === 'accept' ? 'Request accepted!' : 'Request declined');
      setShowRequestModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'status-badge-available',
      requested: 'status-badge-requested',
      accepted: 'status-badge-accepted',
      collected: 'status-badge-collected',
      expired: 'status-badge-expired',
      pending: 'status-badge-requested',
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
              <h1 className="text-3xl font-bold mb-1">Welcome, {user?.fullName}!</h1>
              <p className="text-muted-foreground">Manage your food donations and requests</p>
            </div>
            <Button size="lg" onClick={() => navigate('/donate')}>
              <Plus className="h-5 w-5" />
              New Donation
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <ImpactCard
              icon={<Utensils className="h-6 w-6 text-primary" />}
              value={stats.totalDonations}
              label="Total Donations"
            />
            <ImpactCard
              icon={<Clock className="h-6 w-6 text-accent" />}
              value={stats.activeDonations}
              label="Active Listings"
            />
            <ImpactCard
              icon={<TrendingUp className="h-6 w-6 text-secondary" />}
              value={stats.pendingRequests}
              label="Pending Requests"
              gradient
            />
            <ImpactCard
              icon={<CheckCircle className="h-6 w-6 text-primary" />}
              value={stats.completedDonations}
              label="Completed"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Donations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Donations</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/donor/donations')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {donations.length === 0 ? (
                  <div className="text-center py-8">
                    <Utensils className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No donations yet</p>
                    <Button className="mt-4" onClick={() => navigate('/donate')}>
                      Create Your First Donation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {donations.slice(0, 5).map((donation) => (
                      <div
                        key={donation.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          {donation.imageUrl ? (
                            <img
                              src={donation.imageUrl}
                              alt={donation.foodName}
                              className="h-full w-full object-cover rounded-lg"
                            />
                          ) : (
                            <Utensils className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{donation.foodName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(donation.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(donation.status)}>
                          {donation.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Pickups (Accepted) */}
            <Card>
              <CardHeader>
                <CardTitle>Active Pickups</CardTitle>
              </CardHeader>
              <CardContent>
                {requests.filter(r => r.status === 'accepted').length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No active pickups</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests
                      .filter(r => r.status === 'accepted')
                      .slice(0, 5)
                      .map((request) => (
                        <div
                          key={request.id}
                          className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRequestModal(true);
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="font-medium">
                                {request.requester?.organizationName || request.requester?.fullName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Picking up: {request.donation?.foodName}
                              </p>
                            </div>
                            <Badge variant="outline" className="status-badge-accepted ml-2">
                              Accepted
                            </Badge>
                            {request.donation && unreadCounts[request.donation._id] > 0 && (
                              <Badge variant="destructive" className="ml-2 rounded-full h-5 w-5 flex items-center justify-center p-0 text-xs">
                                {unreadCounts[request.donation._id]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {requests.filter(r => r.status === 'pending').length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests
                      .filter(r => r.status === 'pending')
                      .slice(0, 5)
                      .map((request) => (
                        <div
                          key={request.id}
                          className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRequestModal(true);
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="font-medium">
                                {request.requester?.organizationName || request.requester?.fullName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Requesting: {request.donation?.foodName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <Badge variant="outline" className="status-badge-requested">
                              Pending
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      {/* Request Details Modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Food Request</DialogTitle>
            <DialogDescription>
              Review and respond to this request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && !showChat && (
            <div className="space-y-6 py-4">
              {/* Requester Info */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Requester
                </h4>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <p className="font-medium">
                    {selectedRequest.requester?.organizationName || selectedRequest.requester?.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {selectedRequest.requester?.email}
                  </p>
                </div>
              </div>

              {/* Food Details */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Requested Food
                </h4>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <p className="font-medium">{selectedRequest.donation?.foodName}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {selectedRequest.donation?.location}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {selectedRequest.donation?.quantity}
                  </p>
                </div>
              </div>

              {/* Message */}
              {selectedRequest.message && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Message from Requester</h4>
                  <p className="text-sm text-muted-foreground bg-muted rounded-lg p-4">
                    "{selectedRequest.message}"
                  </p>
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
                  // Clear badge locally
                  if (selectedRequest.donation) {
                    setUnreadCounts(prev => ({ ...prev, [selectedRequest.donation!._id]: 0 }));
                  }
                }}
              />
            </div>
          )}

          {!showChat && (

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => handleRequestAction('reject')}
                disabled={isProcessing}
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
              <Button onClick={() => handleRequestAction('accept')} disabled={isProcessing}>
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept
                  </>
                )}
              </Button>
              {selectedRequest?.status === 'accepted' && (
                <Button onClick={() => setShowChat(true)} variant="secondary" className="ml-2">
                  Chat with NGO
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div >
  );
}
