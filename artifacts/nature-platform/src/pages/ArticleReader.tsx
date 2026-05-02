import { useParams, Link } from "wouter";
import { useGetArticle, getGetArticleQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ArrowLeft, Clock, Calendar, Tag, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ArticleReader() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  const { toast } = useToast();

  const { data: article, isLoading, error } = useGetArticle(slug, {
    query: {
      enabled: !!slug,
      queryKey: getGetArticleQueryKey(slug)
    }
  });

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Article link copied to clipboard.",
    });
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background pt-12 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Skeleton className="h-4 w-24 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-3/4 mb-8" />
          <div className="flex gap-4 mb-12">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="aspect-[21/9] w-full mb-12 rounded-none" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full mt-8" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="font-serif text-4xl font-bold mb-4">Article not found</h1>
          <p className="text-muted-foreground mb-8">The essay you're looking for doesn't exist or has been moved.</p>
          <Link href="/articles">
            <Button variant="default">Back to all articles</Button>
          </Link>
        </div>
      </div>
    );
  }

  const publishedDate = article.publishedAt ? new Date(article.publishedAt) : new Date(article.createdAt);

  return (
    <article className="w-full bg-background pt-12 pb-32">
      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="mb-8">
          <Link href="/articles" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to articles
          </Link>
        </div>

        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-foreground mb-6">
          {article.title}
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8 font-serif italic">
          {article.excerpt}
        </p>

        <div className="flex flex-wrap items-center gap-y-4 gap-x-8 py-6 border-y border-border text-sm font-medium text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            {format(publishedDate, "MMMM d, yyyy")}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            {article.readTime} min read
          </div>
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-2 text-primary" />
            <span className="uppercase tracking-wider text-xs">{article.category}</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {article.imageUrl && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="aspect-[21/9] w-full overflow-hidden bg-muted relative">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Content & Sidebar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12 relative">
        {/* Share Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col gap-4 sticky top-32 h-fit w-12 shrink-0">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 rotate-180" style={{ writingMode: 'vertical-rl' }}>Share</div>
          <div className="w-[1px] h-12 bg-border mx-auto mb-2"></div>
          <button onClick={copyLink} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Copy Link">
            <LinkIcon className="h-5 w-5" />
          </button>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-[#1DA1F2] transition-colors" title="Share on Twitter">
            <Twitter className="h-5 w-5" />
          </a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-[#0A66C2] transition-colors" title="Share on LinkedIn">
            <Linkedin className="h-5 w-5" />
          </a>
        </aside>

        {/* Main Content */}
        <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-h2:text-3xl prose-h3:text-2xl prose-a:text-primary hover:prose-a:text-accent prose-img:rounded-none max-w-none w-full">
          {/* We would render markdown here if the API returned markdown, 
              but since it returns plain text string in our schema, we'll format it simply */}
          <div className="whitespace-pre-wrap font-sans text-foreground/90 leading-relaxed text-[17px] md:text-[19px]">
            {article.content}
          </div>
        </div>
      </div>

      {/* Mobile Share (Bottom) */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-border lg:hidden">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Share this essay:</span>
          <button onClick={copyLink} className="p-2 rounded-full border border-border hover:bg-muted transition-colors">
            <LinkIcon className="h-4 w-4" />
          </button>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border hover:bg-muted transition-colors">
            <Twitter className="h-4 w-4" />
          </a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border hover:bg-muted transition-colors">
            <Linkedin className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
