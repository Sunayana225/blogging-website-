import { useGetFeaturedArticles, useGetArticleStats, useSubscribeNewsletter, getGetFeaturedArticlesQueryKey, getGetArticleStatsQueryKey } from "@workspace/api-client-react";
import { ArticleCard } from "@/components/ui/article-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Leaf, Waves, Mountain, Bird, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { data: featuredArticles, isLoading: isLoadingFeatured } = useGetFeaturedArticles({ query: { queryKey: getGetFeaturedArticlesQueryKey() } });
  const { data: stats, isLoading: isLoadingStats } = useGetArticleStats({ query: { queryKey: getGetArticleStatsQueryKey() } });
  
  const subscribeMutation = useSubscribeNewsletter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    subscribeMutation.mutate({ data: { email } }, {
      onSuccess: () => {
        toast({
          title: "Subscribed successfully",
          description: "Welcome to The Verdant Page newsletter.",
        });
        setEmail("");
      },
      onError: () => {
        toast({
          title: "Subscription failed",
          description: "There was an error subscribing to the newsletter.",
          variant: "destructive",
        });
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-forest.png" 
            alt="Sunlight through forest canopy" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/80 md:bg-background/60 bg-gradient-to-r from-background via-background/90 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-3xl"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-primary/20 rounded-full bg-primary/5 text-primary text-sm font-medium tracking-wide uppercase">
              <Leaf className="h-4 w-4" />
              Science & Storytelling
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight text-foreground mb-6">
                Explore the <br className="hidden md:block" />
                <span className="italic text-primary">natural world</span>
              </h1>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
                Rigorous science wrapped in lyrical prose. Field notes, deep dives, and conservation stories from the wild edges of our planet.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <Link href="/articles" className="inline-flex items-center justify-center h-14 px-8 text-base font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Read Latest Essays
              </Link>
              <Link href="/about" className="inline-flex items-center justify-center h-14 px-8 text-base font-medium transition-colors bg-transparent border border-input hover:bg-accent hover:text-accent-foreground hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                About the Author
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Featured Writing</h2>
              <p className="text-lg text-muted-foreground max-w-2xl">Hand-picked essays that explore the complex relationships within ecosystems.</p>
            </div>
            <Link href="/articles" className="inline-flex items-center gap-2 text-primary font-medium hover:text-accent transition-colors group">
              View all articles <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-12">
            {isLoadingFeatured ? (
              <div className="space-y-12">
                {[1, 2].map(i => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border border-border p-0">
                    <Skeleton className="aspect-[4/3] md:aspect-[3/4] lg:aspect-square w-full rounded-none" />
                    <div className="space-y-6 p-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-5/6" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-6 w-40 mt-8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredArticles && featuredArticles.length > 0 ? (
              featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} featured={true} />
              ))
            ) : (
              <div className="text-center py-24 bg-muted/30 border border-dashed border-border">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-serif text-2xl text-foreground mb-2">No featured articles</h3>
                <p className="text-muted-foreground">Check back soon for new content.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats/Categories Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Exploring Every Ecosystem</h2>
            <p className="text-xl text-primary-foreground/80">
              A comprehensive library of natural history spanning the globe's most vital biomes.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-background/10 flex items-center justify-center">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <div className="font-serif text-4xl mb-1">
                  {isLoadingStats ? <Skeleton className="h-10 w-16 bg-primary-foreground/20 mx-auto" /> : 
                    stats?.total || 0}
                </div>
                <div className="text-sm font-medium tracking-wider uppercase text-primary-foreground/70">Articles</div>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-background/10 flex items-center justify-center">
                <Bird className="h-8 w-8" />
              </div>
              <div>
                <div className="font-serif text-4xl mb-1">
                  {isLoadingStats ? <Skeleton className="h-10 w-16 bg-primary-foreground/20 mx-auto" /> : 
                    stats?.byCategory.find(c => c.category === 'Animals')?.count || 0}
                </div>
                <div className="text-sm font-medium tracking-wider uppercase text-primary-foreground/70">Animal Behavior</div>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-background/10 flex items-center justify-center">
                <Leaf className="h-8 w-8" />
              </div>
              <div>
                <div className="font-serif text-4xl mb-1">
                  {isLoadingStats ? <Skeleton className="h-10 w-16 bg-primary-foreground/20 mx-auto" /> : 
                    stats?.byCategory.find(c => c.category === 'Plants')?.count || 0}
                </div>
                <div className="text-sm font-medium tracking-wider uppercase text-primary-foreground/70">Plant Life</div>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-background/10 flex items-center justify-center">
                <Waves className="h-8 w-8" />
              </div>
              <div>
                <div className="font-serif text-4xl mb-1">
                  {isLoadingStats ? <Skeleton className="h-10 w-16 bg-primary-foreground/20 mx-auto" /> : 
                    stats?.byCategory.find(c => c.category === 'Oceans')?.count || 0}
                </div>
                <div className="text-sm font-medium tracking-wider uppercase text-primary-foreground/70">Marine Ecosystems</div>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 col-span-2 md:col-span-1">
              <div className="h-16 w-16 rounded-full bg-background/10 flex items-center justify-center">
                <span className="font-serif text-2xl font-bold">👁</span>
              </div>
              <div>
                <div className="font-serif text-4xl mb-1">
                  {isLoadingStats ? <Skeleton className="h-10 w-16 bg-primary-foreground/20 mx-auto" /> : 
                    (stats as any)?.totalViews || 0}
                </div>
                <div className="text-sm font-medium tracking-wider uppercase text-primary-foreground/70">Total Views</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-card border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-muted/30 p-8 md:p-16 rounded-none border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Leaf className="h-48 w-48" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-4">
                <h2 className="font-serif text-3xl md:text-4xl text-foreground">Field Notes to Your Inbox</h2>
                <p className="text-muted-foreground text-lg">
                  Join a community of nature enthusiasts. Receive my latest essays, reading recommendations, and dispatches from the field twice a month.
                </p>
              </div>
              <div className="w-full md:w-[400px]">
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="space-y-2">
                    <Input 
                      type="email" 
                      placeholder="Your email address" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 bg-background"
                      disabled={subscribeMutation.isPending}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-base"
                    disabled={subscribeMutation.isPending}
                  >
                    {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    No spam. Unsubscribe at any time.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
