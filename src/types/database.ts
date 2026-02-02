// Custom types for the Food Waste Reduction Platform

export type AppRole = 'donor' | 'ngo' | 'admin';
export type UserRole = AppRole; // Alias for compatibility
export type FoodType = 'veg' | 'non_veg';
export type DonationStatus = 'available' | 'requested' | 'accepted' | 'collected' | 'expired';
export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface User {
  _id: string;
  id?: string; // Virtual
  email: string;
  fullName: string;
  phone?: string;
  organizationName?: string;
  address?: string;
  role: AppRole;
  isApproved: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

// For backward compatibility or simplification, we alias User to Profile if needed,
// but better to use User everywhere.
export interface Profile extends User { }

export interface Donation {
  _id: string;
  id?: string;
  donor: string | User; // Can be ID or populated object
  foodName: string;
  foodType: FoodType;
  quantity: string;
  description?: string;
  location: string;
  availableFrom: string;
  expiresAt: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DonationRequest {
  _id: string;
  id?: string;
  donation: string | Donation;
  requester: string | User;
  status: RequestStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  id?: string; // Mongoose virtual
  user: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedDonation?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ImpactStats {
  totalDonations: number;
  foodCollected: number;
  activeDonors: number;
  activeNGOs: number;
  peopleFed: number;
}
