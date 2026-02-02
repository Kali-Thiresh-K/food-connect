import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ImpactCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  description?: string;
  className?: string;
  gradient?: boolean;
}

export default function ImpactCard({
  icon,
  value,
  label,
  description,
  className,
  gradient = false,
}: ImpactCardProps) {
  return (
    <Card className={cn(
      'overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1',
      gradient && 'gradient-hero text-primary-foreground',
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            gradient ? 'bg-primary-foreground/20' : 'bg-primary/10'
          )}>
            {icon}
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{value}</p>
            <p className={cn(
              'text-sm font-medium',
              gradient ? 'text-primary-foreground/80' : 'text-muted-foreground'
            )}>
              {label}
            </p>
            {description && (
              <p className={cn(
                'text-xs',
                gradient ? 'text-primary-foreground/60' : 'text-muted-foreground/80'
              )}>
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
