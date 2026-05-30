import { useGetFeaturedArticles, useGetArticleStats, useSubscribeNewsletter, getGetFeaturedArticlesQueryKey, getGetArticleStatsQueryKey } from "@workspace/api-client-react";
import { ArticleCard } from "@/components/ui/article-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Leaf, Waves, Bird, BookOpen } from "lucide-react";
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
        toast({ title: "Subscribed successfully", description: "Welcome to the Wildleaf Journal newsletter." });
        setEmail("");
      },
      onError: () => {
        toast({ title: "Subscription failed", description: "There was an error subscribing to the newsletter.", variant: "destructive" });
      }
    });
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } } as const;
  const itemVariants = { hidden: { y: 18, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: "easeOut" as const } } } as const;

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-forest.png"
            alt="Sunlight through forest canopy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-background/78 md:bg-background/60 bg-linear-to-r from-background via-background/88 to-transparent" />
        </div>

        <div className="container mx-auto flex justify-center px-4 sm:px-6 lg:px-8 z-10">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-3xl text-center md:text-left md:mr-auto">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-3 py-1 mb-6 rounded-full bg-primary/5 text-primary text-sm font-medium tracking-wide uppercase">
              NATURE • SCIENCE • STORYTELLING
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-serif text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
              Explore the living world
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-8">
              A journal of nature, ecology, and discovery. Through field notes, essays, and carefully researched stories, Wildleaf Journal explores the intricate connections that shape life on Earth.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link href="/articles" className="inline-flex items-center justify-center h-12 px-6 bg-primary text-primary-foreground rounded-md">Read Latest Essays</Link>
              <Link href="/articles" className="inline-flex items-center justify-center h-12 px-6 border border-input rounded-md">Explore the Journal</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl">Featured Essays</h2>
              <p className="text-muted-foreground">Selected stories that uncover the beauty, complexity, and wonder hidden within the natural world.</p>
            </div>
            <Link href="/articles" className="text-primary font-medium">View all <ArrowRight className="inline-block ml-2" /></Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoadingFeatured ? (
              [1,2].map(i => (
                <div key={i} className="border border-border p-4">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-10 w-full mb-4" />
                  <Skeleton className="h-6 w-5/6 mb-4" />
                </div>
              ))
            ) : featuredArticles && featuredArticles.length > 0 ? (
              featuredArticles.map(a => <ArticleCard key={a.id} article={a} featured />)
            ) : (
              <article className="border border-border p-6">
                <div className="text-xs uppercase text-muted-foreground mb-2">FIELD NOTES • 5 MIN READ</div>
                <h3 className="font-serif text-2xl mb-2">Reading the Forest After Rain</h3>
                <p className="text-muted-foreground mb-4">The forest changes after a storm. Sounds soften, scents deepen, and every trail tells a different story. A reflection on the quiet transformations that rain brings to woodland ecosystems.</p>
                <div className="text-sm text-muted-foreground">May 29, 2026</div>
                <Link href="/articles/reading-the-forest-after-rain" className="inline-block mt-4 text-primary">Read Essay</Link>
              </article>
            )}
          </div>
        </div>
      </section>

      {/* SPECIES & ECOSYSTEMS */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">Exploring Earth's Living Systems</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">A growing collection of essays, observations, and scientific explorations covering the diverse ecosystems, species, and natural processes that sustain our planet.</p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <div className="font-serif text-3xl">{isLoadingStats ? <Skeleton className="h-8 w-16 mx-auto" /> : stats?.total || 0}</div>
              <div className="text-sm text-muted-foreground uppercase">Articles Published</div>
            </div>
            <div>
              <div className="font-serif text-3xl">{isLoadingStats ? <Skeleton className="h-8 w-16 mx-auto" /> : stats?.byCategory.find(c => c.category === 'Animals')?.count || 0}</div>
              <div className="text-sm text-muted-foreground uppercase">Animal Behavior</div>
            </div>
            <div>
              <div className="font-serif text-3xl">{isLoadingStats ? <Skeleton className="h-8 w-16 mx-auto" /> : stats?.byCategory.find(c => c.category === 'Plants')?.count || 0}</div>
              <div className="text-sm text-muted-foreground uppercase">Plant Life</div>
            </div>
            <div>
              <div className="font-serif text-3xl">{isLoadingStats ? <Skeleton className="h-8 w-16 mx-auto" /> : stats?.byCategory.find(c => c.category === 'Oceans')?.count || 0}</div>
              <div className="text-sm text-muted-foreground uppercase">Marine Ecosystems</div>
            </div>
            <div>
              <div className="font-serif text-3xl">{isLoadingStats ? <Skeleton className="h-8 w-16 mx-auto" /> : (stats as any)?.totalViews || 0}</div>
              <div className="text-sm text-muted-foreground uppercase">Total Readers</div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto p-8 bg-muted/30 border border-border">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="font-serif text-2xl md:text-3xl">Field Notes to Your Inbox</h2>
                <p className="text-muted-foreground">Join a community of curious readers exploring the natural world through science, storytelling, and observation. Receive new essays, recommended reads, and occasional notes from the field.</p>
              </div>
              <form onSubmit={handleSubscribe} className="w-full md:w-96">
                <div className="flex gap-2">
                  <Input required placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Button type="submit">Subscribe</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Thoughtful updates only. No spam, ever.</p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-serif text-3xl md:text-4xl mb-4">About Wildleaf Journal</h2>
            <p className="text-muted-foreground leading-8">
              Wildleaf Journal is a space dedicated to observing, understanding, and celebrating the natural world.
              Driven by curiosity and a passion for thoughtful writing, the journal brings together science, ecology, conservation, and storytelling.
              Each essay seeks to bridge the gap between scientific understanding and everyday wonder, revealing the hidden relationships that connect landscapes, species, and people.
              From forests and coastlines to microscopic ecosystems and migratory journeys, Wildleaf Journal explores the stories that shape life on Earth.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

