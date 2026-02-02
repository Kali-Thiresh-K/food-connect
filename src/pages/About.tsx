import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Heart, Users, Globe, Target, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 py-20">
          <div className="container text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Leaf className="h-4 w-4" />
              Our Mission
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Fighting Hunger,{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Reducing Waste
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              FoodShare is a platform dedicated to connecting surplus food with those who need it most. 
              We believe that no good food should go to waste while people in our communities go hungry.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                <p className="text-muted-foreground mb-4">
                  FoodShare was born from a simple observation: while tons of perfectly good food gets thrown away daily, 
                  millions of people struggle to put food on their tables. We saw an opportunity to bridge this gap.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our platform connects food donors—restaurants, grocery stores, event organizers, and individuals—with 
                  NGOs and community organizations that distribute food to those in need.
                </p>
                <p className="text-muted-foreground">
                  Through technology and community collaboration, we're creating a more sustainable and equitable food system, 
                  one donation at a time.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Globe className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <p className="text-2xl font-bold">1.3B</p>
                    <p className="text-sm text-muted-foreground">Tons of food wasted globally each year</p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/5 border-secondary/20">
                  <CardContent className="p-6 text-center">
                    <Users className="h-10 w-10 mx-auto mb-3 text-secondary" />
                    <p className="text-2xl font-bold">828M</p>
                    <p className="text-sm text-muted-foreground">People facing hunger worldwide</p>
                  </CardContent>
                </Card>
                <Card className="bg-accent/5 border-accent/20">
                  <CardContent className="p-6 text-center">
                    <Target className="h-10 w-10 mx-auto mb-3 text-accent" />
                    <p className="text-2xl font-bold">SDG 2</p>
                    <p className="text-sm text-muted-foreground">Zero Hunger Goal</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Heart className="h-10 w-10 mx-auto mb-3 text-destructive" />
                    <p className="text-2xl font-bold">∞</p>
                    <p className="text-sm text-muted-foreground">Lives we can impact together</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These core principles guide everything we do at FoodShare.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Leaf className="h-8 w-8 text-primary" />,
                  title: 'Sustainability',
                  description: 'We believe in reducing waste and protecting our environment for future generations.',
                },
                {
                  icon: <Heart className="h-8 w-8 text-destructive" />,
                  title: 'Compassion',
                  description: 'Every person deserves access to nutritious food. We serve with empathy and care.',
                },
                {
                  icon: <Users className="h-8 w-8 text-secondary" />,
                  title: 'Community',
                  description: 'Together, we are stronger. We foster connections that strengthen our communities.',
                },
                {
                  icon: <Award className="h-8 w-8 text-accent" />,
                  title: 'Excellence',
                  description: 'We strive for the highest standards in food safety and service delivery.',
                },
                {
                  icon: <Globe className="h-8 w-8 text-primary" />,
                  title: 'Transparency',
                  description: 'Open communication and honest practices build trust with our partners.',
                },
                {
                  icon: <Target className="h-8 w-8 text-secondary" />,
                  title: 'Impact',
                  description: 'Every action we take is measured by its positive effect on people and planet.',
                },
              ].map((value, index) => (
                <Card key={index} className="text-center hover:shadow-elevated transition-shadow">
                  <CardContent className="p-8">
                    <div className="mx-auto mb-4">{value.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 gradient-hero text-center">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Join Our Mission
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Whether you have surplus food to share or need food for your community, 
              FoodShare connects you with the right people. Let's make a difference together.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
