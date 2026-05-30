import { Leaf, BookOpen, Compass } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="w-full bg-background pt-12 pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6 tracking-tight">About</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            I am a science writer and journalist focused on the intersection of human culture and wild ecosystems.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-8 prose prose-lg dark:prose-invert prose-headings:font-serif prose-a:text-primary hover:prose-a:text-accent max-w-none">
            <p className="text-xl leading-relaxed text-foreground/90 font-medium">
              The natural world isn't a backdrop—it's the main character. For the past decade, I've traveled from the temperate rainforests of the Pacific Northwest to the coral reefs of the Indo-Pacific, documenting how ecosystems function and how they are changing.
            </p>
            
            <p>
              My work seeks to bridge the gap between academic research and public understanding. I believe that rigorous science does not have to be dry, and that lyrical, evocative writing does not have to sacrifice factual accuracy. The best science writing does both: it informs the mind while moving the heart.
            </p>

            <h3 className="text-3xl mt-12 mb-6">Philosophy</h3>
            <p>
              We protect what we love, and we love what we understand. My writing is driven by the conviction that when we look closely enough at any living thing—a slime mold, a pelagic shark, a coastal redwood—we find an astonishing story of adaptation and resilience. 
            </p>
            <p>
              In an era defined by ecological crisis, I try to write beyond the simple narratives of doom. While acknowledging the profound losses occurring across the globe, I focus on stories of endurance, novel conservation approaches, and the deep, abiding beauty that remains.
            </p>

            <h3 className="text-3xl mt-12 mb-6">Credentials & Background</h3>
            <p>
              I hold a degree in Ecology and Evolutionary Biology, followed by formal training in Science Communication. Before turning to journalism full-time, I worked as a field researcher studying avian migration patterns and later as a naturalist guide.
            </p>
            <p>
              My work has been recognized by the Society of Environmental Journalists and has appeared in anthologies of notable science writing. I am a member of the National Association of Science Writers (NASW).
            </p>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-12 lg:pl-8 lg:border-l border-border">
            
            {/* Quick Facts */}
            <div>
              <h3 className="font-serif text-2xl mb-6">At a Glance</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-2 text-primary border border-primary/20 shrink-0">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Base Camp</h4>
                    <p className="text-sm text-muted-foreground mt-1">Based in the Pacific Northwest, but often working from the field.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-2 text-primary border border-primary/20 shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Focus Areas</h4>
                    <p className="text-sm text-muted-foreground mt-1">Marine ecology, forest ecosystems, climate adaptation, rewilding.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-2 text-primary border border-primary/20 shrink-0">
                    <Leaf className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Mission</h4>
                    <p className="text-sm text-muted-foreground mt-1">To cultivate ecological literacy through narrative journalism.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="bg-card border border-border p-6 md:p-8">
              <h3 className="font-serif text-2xl mb-4">Work With Me</h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                I am available for freelance commissions, editorial consulting, and speaking engagements.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/contact" className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 w-full">
                  Get in Touch
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
