import { Donation, User } from '@/types/database';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Utensils, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DonationCardProps {
  donation: Donation;
  onRequest?: () => void;
  onViewDetails?: () => void;
  showActions?: boolean;
  showDonorInfo?: boolean;
}

export default function DonationCard({
  donation,
  onRequest,
  onViewDetails,
  showActions = true,
  showDonorInfo = false,
}: DonationCardProps) {
  const isExpired = new Date(donation.expiresAt) < new Date();
  const isAvailable = donation.status === 'available' && !isExpired;

  const getStatusBadge = () => {
    const status = isExpired ? 'expired' : donation.status;
    const statusConfig: Record<string, { label: string; className: string }> = {
      available: { label: 'Available', className: 'status-badge-available' },
      requested: { label: 'Requested', className: 'status-badge-requested' },
      accepted: { label: 'Accepted', className: 'status-badge-accepted' },
      collected: { label: 'Collected', className: 'status-badge-collected' },
      expired: { label: 'Expired', className: 'status-badge-expired' },
    };

    const config = statusConfig[status] || statusConfig.available;
    return (
      <Badge variant="outline" className={cn('border', config.className)}>
        {config.label}
      </Badge>
    );
  };

  const donor = typeof donation.donor === 'object' ? (donation.donor as User) : null;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {donation.imageUrl ? (
          <img
            src={donation.imageUrl}
            alt={donation.foodName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Utensils className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {getStatusBadge()}
          <Badge variant={donation.foodType === 'veg' ? 'default' : 'secondary'} className="capitalize">
            {donation.foodType === 'veg' ? '🥬 Veg' : '🍖 Non-Veg'}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold line-clamp-1">{donation.foodName}</h3>
        {donation.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{donation.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-2 pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="line-clamp-1">{donation.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>Qty: {donation.quantity}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span className={cn(isExpired ? 'text-destructive' : 'text-muted-foreground')}>
            {isExpired
              ? `Expired ${formatDistanceToNow(new Date(donation.expiresAt), { addSuffix: true })}`
              : `Expires ${format(new Date(donation.expiresAt), 'MMM d, h:mm a')}`}
          </span>
        </div>

        {showDonorInfo && donor && (
          <div className="pt-2 border-t border-border">
            <p className="text-sm font-medium">{donor.fullName}</p>
            {donor.organizationName && (
              <p className="text-xs text-muted-foreground">{donor.organizationName}</p>
            )}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="pt-0 gap-2">
          <Button variant="outline" className="flex-1" onClick={onViewDetails}>
            Details
          </Button>
          {isAvailable && onRequest && (
            <Button className="flex-1" onClick={onRequest}>
              Request Food
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
