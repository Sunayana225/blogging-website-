import { useListPortfolioClips, getListPortfolioClipsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ExternalLink, Award, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Portfolio() {
  const { data: clips, isLoading } = useListPortfolioClips(undefined, {
    query: { queryKey: getListPortfolioClipsQueryKey() }
  });

  // Group clips by category
  const groupedClips = clips?.reduce((acc, clip) => {
    if (!acc[clip.category]) {
      acc[clip.category] = [];
    }
    acc[clip.category].push(clip);
    return acc;
  }, {} as Record<string, typeof clips>) || {};

  return (
    <div className="w-full bg-background pt-12 pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6 tracking-tight">Published Work</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A selection of feature articles, essays, and scientific communication published across various magazines, journals, and digital platforms.
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-16">
            {[1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="h-8 w-48 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((j) => (
                    <Card key={j} className="rounded-none border-border">
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-3" />
                        <Skeleton className="h-4 w-1/2 mb-6" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : clips && clips.length > 0 ? (
          <div className="space-y-20">
            {Object.entries(groupedClips).map(([category, categoryClips], groupIdx) => (
              <motion.div 
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: groupIdx * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border/50">
                  <h2 className="font-serif text-3xl text-foreground capitalize tracking-wide">{category}</h2>
                  <span className="text-muted-foreground font-mono text-sm bg-muted px-2 py-1">{categoryClips.length}</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {categoryClips.map((clip) => {
                    const clipDate = clip.date ? new Date(clip.date) : new Date(clip.createdAt);
                    
                    return (
                      <a 
                        key={clip.id} 
                        href={clip.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group block"
                      >
                        <Card className="h-full rounded-none border border-border/50 bg-card hover:bg-muted/10 transition-colors hover:border-primary/30">
                          <CardContent className="p-6 md:p-8 flex flex-col h-full">
                            <h3 className="font-serif text-xl md:text-2xl mb-2 group-hover:text-primary transition-colors flex items-start justify-between gap-4">
                              <span>{clip.title}</span>
                              <ExternalLink className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                            </h3>
                            <div className="text-primary font-medium mb-6">
                              {clip.publication}
                            </div>
                            <div className="mt-auto pt-6 border-t border-border/40 flex items-center justify-between text-sm text-muted-foreground">
                              <span className="flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Feature Article
                              </span>
                              <span>{format(clipDate, "MMM yyyy")}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-muted/20 border border-dashed border-border flex flex-col items-center">
            <Award className="h-16 w-16 text-muted-foreground mb-6 opacity-40" />
            <h3 className="font-serif text-3xl text-foreground mb-3">No portfolio items yet</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Check back later to see published work from various publications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
