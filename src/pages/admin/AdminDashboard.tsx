import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, Donation, User } from '@/types/database';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ImpactCard from '@/components/stats/ImpactCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Users,
  Utensils,
  Building2,
  HandHeart,
  TrendingUp,
  Shield,
  Ban,
  CheckCircle,
  Trash2,
  Loader2,
  Mail
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simple stats calculation based on loaded data
  // In a real app, you'd fetch stats separately or paginated data
  const stats = {
    totalUsers: users.length,
    totalDonors: users.filter(u => u.role === 'donor').length,
    totalNGOs: users.filter(u => u.role === 'ngo').length,
    totalDonations: donations.length,
    collectedDonations: donations.filter(d => d.status === 'collected').length,
    activeDonations: donations.filter(d => d.status === 'available').length,
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);

      const donationsRes = await api.get('/donations'); // Assuming admin can see all or we add /admin/donations
      setDonations(donationsRes.data);
    } catch (error) {
      console.error("Error fetching admin data", error);
      // Fallback or specific error handling
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockUser = async (block: boolean) => {
    if (!selectedUser) return;

    setIsProcessing(true);

    try {
      await api.put(`/admin/users/${selectedUser._id}/block`, { isBlocked: block });

      toast.success(block ? 'User blocked' : 'User unblocked');
      setShowUserModal(false);

      // Update local state
      setUsers(prev => prev.map(u =>
        u._id === selectedUser._id ? { ...u, isBlocked: block } : u
      ));
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteDonation = async () => {
    if (!selectedDonation) return;

    setIsProcessing(true);

    try {
      await api.delete(`/donations/${selectedDonation.id}`);

      toast.success('Donation deleted');
      setShowDonationModal(false);
      setDonations(prev => prev.filter(d => d.id !== selectedDonation.id));
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
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
    };
    return colors[status] || '';
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    const colors: Record<string, string> = {
      donor: 'bg-primary/10 text-primary border-primary/20',
      ngo: 'bg-secondary/10 text-secondary border-secondary/20',
      admin: 'bg-accent/10 text-accent border-accent/20',
    };
    return (
      <Badge variant="outline" className={colors[role]}>
        {role.toUpperCase()}
      </Badge>
    );
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage users, donations, and platform statistics</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <ImpactCard
              icon={<Users className="h-5 w-5 text-primary" />}
              value={stats.totalUsers}
              label="Total Users"
            />
            <ImpactCard
              icon={<HandHeart className="h-5 w-5 text-primary" />}
              value={stats.totalDonors}
              label="Donors"
            />
            <ImpactCard
              icon={<Building2 className="h-5 w-5 text-secondary" />}
              value={stats.totalNGOs}
              label="NGOs"
            />
            <ImpactCard
              icon={<Utensils className="h-5 w-5 text-accent" />}
              value={stats.totalDonations}
              label="Total Donations"
            />
            <ImpactCard
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              value={stats.activeDonations}
              label="Active"
            />
            <ImpactCard
              icon={<CheckCircle className="h-5 w-5 text-accent" />}
              value={stats.collectedDonations}
              label="Collected"
              gradient
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="donations">Donations</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.map((userData) => (
                      <div
                        key={userData._id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedUser(userData);
                          setShowUserModal(true);
                        }}
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {userData.fullName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{userData.fullName}</p>
                          <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {userData.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRoleBadge(userData.role)}
                          {userData.isBlocked && (
                            <Badge variant="destructive">Blocked</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Donations Tab */}
            <TabsContent value="donations">
              <Card>
                <CardHeader>
                  <CardTitle>All Donations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {donations.map((donation) => (
                      <div
                        key={donation.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedDonation(donation);
                          setShowDonationModal(true);
                        }}
                      >
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
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
                            {donation.location}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(donation.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(donation.status)}>
                          {donation.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* User Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user account
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {selectedUser.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold">{selectedUser.fullName}</p>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  {selectedUser.organizationName && (
                    <p className="text-sm text-muted-foreground">{selectedUser.organizationName}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {getRoleBadge(selectedUser.role)}
                {selectedUser.isBlocked && (
                  <Badge variant="destructive">Blocked</Badge>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                Joined {formatDistanceToNow(new Date(selectedUser.createdAt || new Date()), { addSuffix: true })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserModal(false)}>
              Close
            </Button>
            {selectedUser?.role !== 'admin' && (
              <Button
                variant={selectedUser?.isBlocked ? 'default' : 'destructive'}
                onClick={() => handleBlockUser(!selectedUser?.isBlocked)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : selectedUser?.isBlocked ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Unblock
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    Block User
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Donation Modal */}
      <Dialog open={showDonationModal} onOpenChange={setShowDonationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Donation Details</DialogTitle>
            <DialogDescription>
              View and manage donation
            </DialogDescription>
          </DialogHeader>

          {selectedDonation && (
            <div className="space-y-4 py-4">
              {selectedDonation.imageUrl && (
                <img
                  src={selectedDonation.imageUrl}
                  alt={selectedDonation.foodName}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <div>
                <h3 className="text-lg font-semibold">{selectedDonation.foodName}</h3>
                <Badge variant="outline" className={getStatusColor(selectedDonation.status)}>
                  {selectedDonation.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <p><strong>Quantity:</strong> {selectedDonation.quantity}</p>
                <p><strong>Location:</strong> {selectedDonation.location}</p>
                <p><strong>Type:</strong> {selectedDonation.foodType === 'veg' ? 'Vegetarian' : 'Non-Veg'}</p>
                {selectedDonation.description && (
                  <p><strong>Description:</strong> {selectedDonation.description}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDonationModal(false)}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDonation}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Donation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
