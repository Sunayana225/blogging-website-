import { useState } from "react";
import { useListArticles, getListArticlesQueryKey, useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { ArticleCard } from "@/components/ui/article-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function Articles() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const { data: categoriesData } = useListCategories({
    query: {
      queryKey: getListCategoriesQueryKey(),
    }
  });

  const categories = categoriesData ? ["All", ...categoriesData.map(c => c.name)] : ["All"];

  const { data, isLoading } = useListArticles(
    { 
      category: category !== "All" ? category : undefined,
      search: debouncedSearch || undefined
    },
    {
      query: {
        queryKey: getListArticlesQueryKey({
          category: category !== "All" ? category : undefined,
          search: debouncedSearch || undefined
        })
      }
    }
  );

  return (
    <div className="w-full bg-background pt-12 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6 tracking-tight">Essays & Field Notes</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            An archive of dispatches from the natural world. From deep dives into complex ecosystems to personal reflections on our relationship with the wild.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center justify-between bg-card p-6 border border-border">
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {categories.map((cat) => {
              const catData = categoriesData?.find(c => c.name === cat);
              return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 text-sm font-medium transition-colors border flex items-center gap-2 ${
                  category === cat 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {catData?.color && (
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catData.color }} />
                )}
                {cat}
              </button>
            )})}
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full lg:w-[300px] flex">
            <Input
              type="search"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 bg-background rounded-r-none h-11"
            />
            <Button type="submit" variant="default" className="rounded-l-none h-11 px-4">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center text-sm font-medium text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span>Showing {data?.total || 0} articles {category !== "All" && `in ${category}`}</span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col space-y-4">
                <Skeleton className="aspect-[3/2] w-full rounded-none" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-20 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.articles && data.articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="h-full"
              >
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-muted/20 border border-dashed border-border flex flex-col items-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-6 opacity-40" />
            <h3 className="font-serif text-3xl text-foreground mb-3">No articles found</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              We couldn't find any articles matching your search criteria. Try adjusting your filters or search term.
            </p>
            {(search || category !== "All") && (
              <Button 
                variant="outline" 
                className="mt-8"
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                  setCategory("All");
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
