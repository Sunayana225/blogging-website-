import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";
import type { Article, Tag } from "@workspace/api-client-react/src/generated/api.schemas";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ArticleCardProps {
  article: Article & { tags?: Tag[] };
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const publishedDate = article.publishedAt ? new Date(article.publishedAt) : new Date(article.createdAt);

  if (featured) {
    return (
      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <Link href={`/articles/${article.slug}`} className="block group">
          <Card className="overflow-hidden border-none shadow-none rounded-none bg-transparent">
            <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="aspect-[4/3] md:aspect-[3/4] lg:aspect-square overflow-hidden bg-muted">
                {article.imageUrl ? (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary/20">
                    <span className="font-serif text-4xl">TVP</span>
                  </div>
                )}
              </div>
              <div className="space-y-6 flex flex-col justify-center h-full py-4 pr-4">
                <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-accent">
                  <span>{article.category}</span>
                  <span className="text-muted-foreground">&bull;</span>
                  <span className="text-muted-foreground">{article.readTime} min read</span>
                </div>
                <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.tags.map(tag => (
                      <Badge key={tag.id} variant="secondary" className="text-[10px] uppercase tracking-wider">{tag.name}</Badge>
                    ))}
                  </div>
                )}
                <p className="text-muted-foreground text-lg leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="pt-4 flex items-center justify-between border-t border-border">
                  <time className="text-sm text-muted-foreground">
                    {format(publishedDate, "MMMM d, yyyy")}
                  </time>
                  <span className="inline-flex items-center text-sm font-medium text-primary group-hover:text-accent transition-colors gap-1">
                    Read Essay <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
      <Link href={`/articles/${article.slug}`} className="block group h-full">
        <Card className="h-full overflow-hidden border border-border/50 hover:border-primary/20 hover:shadow-md transition-all rounded-none bg-card flex flex-col">
          <div className="aspect-[3/2] overflow-hidden bg-muted">
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary/20">
                <span className="font-serif text-2xl">TVP</span>
              </div>
            )}
          </div>
          <CardContent className="p-6 flex flex-col flex-grow space-y-4">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider">
              <span className="text-accent">{article.category}</span>
              <span className="text-muted-foreground">{article.readTime} min read</span>
            </div>
            <h3 className="font-serif text-xl md:text-2xl leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h3>
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {article.tags.map(tag => (
                  <Badge key={tag.id} variant="secondary" className="text-[10px] uppercase tracking-wider">{tag.name}</Badge>
                ))}
              </div>
            )}
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-grow">
              {article.excerpt}
            </p>
            <div className="pt-4 mt-auto border-t border-border/50 flex items-center justify-between">
              <time className="text-xs text-muted-foreground">
                {format(publishedDate, "MMM d, yyyy")}
              </time>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
