import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import ImpactCard from '@/components/stats/ImpactCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Leaf,
  Heart,
  Users,
  Utensils,
  ArrowRight,
  HandHeart,
  Building2,
  Sprout,
  TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ImpactStats } from '@/types/database';

export default function Home() {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [stats, setStats] = useState<ImpactStats>({
    totalDonations: 0,
    foodCollected: 0,
    activeDonors: 0,
    activeNGOs: 0,
    peopleFed: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDonateClick = () => {
    if (!user) {
      navigate('/register?role=donor');
    } else if (userRole === 'donor') {
      navigate('/donate');
    } else {
      navigate('/register?role=donor');
    }
  };

  const handleRequestClick = () => {
    if (!user) {
      navigate('/register?role=ngo');
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjk5NTQiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

          <div className="container relative py-24 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-fade-in">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Sprout className="h-4 w-4" />
                  Reducing Food Waste Together
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-balance">
                  Share Food,{' '}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Share Hope
                  </span>
                </h1>

                <p className="text-lg text-muted-foreground max-w-lg">
                  Connect surplus food with those who need it most. Our platform bridges food donors
                  with NGOs and community organizations to reduce waste and fight hunger.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="xl" variant="hero" onClick={handleDonateClick}>
                    <HandHeart className="h-5 w-5" />
                    Donate Food
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button size="xl" variant="accent" onClick={handleRequestClick}>
                    <Building2 className="h-5 w-5" />
                    Request Food
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-card rounded-2xl p-6 shadow-elevated animate-float">
                      <Leaf className="h-10 w-10 text-primary mb-3" />
                      <p className="font-semibold">Eco-Friendly</p>
                      <p className="text-sm text-muted-foreground">Reduce carbon footprint</p>
                    </div>
                    <div className="bg-card rounded-2xl p-6 shadow-elevated animate-float" style={{ animationDelay: '0.5s' }}>
                      <Users className="h-10 w-10 text-secondary mb-3" />
                      <p className="font-semibold">Community</p>
                      <p className="text-sm text-muted-foreground">Connect & collaborate</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="bg-card rounded-2xl p-6 shadow-elevated animate-float" style={{ animationDelay: '0.25s' }}>
                      <Heart className="h-10 w-10 text-destructive mb-3" />
                      <p className="font-semibold">Impact</p>
                      <p className="text-sm text-muted-foreground">Feed those in need</p>
                    </div>
                    <div className="bg-card rounded-2xl p-6 shadow-elevated animate-float" style={{ animationDelay: '0.75s' }}>
                      <Utensils className="h-10 w-10 text-accent mb-3" />
                      <p className="font-semibold">Fresh Food</p>
                      <p className="text-sm text-muted-foreground">Quality donations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every donation makes a difference. See how our community is working together
                to reduce food waste and feed those in need.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ImpactCard
                icon={<Utensils className="h-6 w-6 text-primary" />}
                value={stats.totalDonations}
                label="Total Donations"
                description="Food items shared"
              />
              <ImpactCard
                icon={<TrendingUp className="h-6 w-6 text-accent" />}
                value={stats.foodCollected}
                label="Food Collected"
                description="Successfully delivered"
              />
              <ImpactCard
                icon={<HandHeart className="h-6 w-6 text-secondary" />}
                value={stats.activeDonors}
                label="Active Donors"
                description="Contributing regularly"
              />
              <ImpactCard
                icon={<Building2 className="h-6 w-6 text-primary" />}
                value={stats.activeNGOs}
                label="Partner NGOs"
                description="Serving communities"
                gradient
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Getting started is easy. Whether you're donating or requesting food,
                our platform makes the connection seamless.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Register',
                  description: 'Sign up as a Food Donor or NGO/Receiver. Complete your profile with contact details.',
                  icon: <Users className="h-8 w-8" />,
                },
                {
                  step: '02',
                  title: 'Connect',
                  description: 'Donors post available food. NGOs browse and request what they need.',
                  icon: <HandHeart className="h-8 w-8" />,
                },
                {
                  step: '03',
                  title: 'Impact',
                  description: 'Once accepted, coordinate pickup. Food reaches those who need it most.',
                  icon: <Heart className="h-8 w-8" />,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="relative bg-card rounded-2xl p-8 shadow-soft hover:shadow-elevated transition-shadow"
                >
                  <div className="absolute -top-4 left-8 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
                    {item.step}
                  </div>
                  <div className="mb-4 text-primary">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 gradient-hero">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Join our growing community of food donors and NGOs working together
              to reduce waste and fight hunger in our communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="xl"
                variant="secondary"
                onClick={() => navigate('/register')}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                Get Started Today
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
