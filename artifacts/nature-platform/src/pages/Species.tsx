import { useState } from "react";
import { useListSpecies, getListSpeciesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, Leaf, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const KINGDOMS = ["All", "Animalia", "Plantae", "Fungi"];
const CONSERVATION_STATUSES = ["All", "LC", "NT", "VU", "EN", "CR", "EX"];

const statusColors: Record<string, string> = {
  LC: "bg-green-500 hover:bg-green-600 text-white",
  NT: "bg-yellow-500 hover:bg-yellow-600 text-white",
  VU: "bg-orange-500 hover:bg-orange-600 text-white",
  EN: "bg-red-500 hover:bg-red-600 text-white",
  CR: "bg-red-900 hover:bg-red-950 text-white",
  EX: "bg-gray-500 hover:bg-gray-600 text-white",
};

export default function Species() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [kingdom, setKingdom] = useState("All");
  const [conservationStatus, setConservationStatus] = useState("All");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const params = {
    kingdom: kingdom !== "All" ? kingdom : undefined,
    conservationStatus: conservationStatus !== "All" ? conservationStatus : undefined,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading } = useListSpecies(params, {
    query: {
      queryKey: getListSpeciesQueryKey(params),
    },
  });

  return (
    <div className="w-full bg-background pt-12 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6 tracking-tight">Species Spotlight</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Discover the remarkable diversity of life on Earth. Explore profiles of plants, animals, and fungi, and learn about their conservation status.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center justify-between bg-card p-6 border border-border">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground flex items-center mr-2">Kingdom:</span>
              {KINGDOMS.map((k) => (
                <button
                  key={k}
                  onClick={() => setKingdom(k)}
                  className={`px-3 py-1 text-sm font-medium transition-colors border ${
                    kingdom === k
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground flex items-center mr-2">Status:</span>
              {CONSERVATION_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setConservationStatus(status)}
                  className={`px-3 py-1 text-sm font-medium transition-colors border ${
                    conservationStatus === status
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative w-full lg:w-[300px] flex">
            <Input
              type="search"
              placeholder="Search species..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 bg-background rounded-r-none h-11"
            />
            <Button type="submit" variant="default" className="rounded-l-none h-11 px-4">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex items-center text-sm font-medium text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span>Showing {data?.length || 0} species</span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col space-y-4">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((species, index) => (
              <motion.div
                key={species.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="h-full flex flex-col border border-border/50 hover:border-primary/20 bg-card hover:shadow-md transition-all rounded-none"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {species.imageUrl ? (
                    <img
                      src={species.imageUrl}
                      alt={species.commonName}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary/20">
                      <Leaf className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-serif text-2xl font-bold mb-1 group-hover:text-primary transition-colors line-clamp-1">{species.commonName}</h3>
                  <p className="italic text-muted-foreground mb-4 line-clamp-1">{species.scientificName}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={statusColors[species.conservationStatus] || "bg-secondary text-secondary-foreground"}>
                      {species.conservationStatus}
                    </Badge>
                    <Badge variant="outline">{species.kingdom}</Badge>
                  </div>
                  
                  {species.habitat && (
                    <p className="text-sm text-foreground/80 mb-6 line-clamp-2 flex-grow">
                      <strong>Habitat:</strong> {species.habitat}
                    </p>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-border/50">
                    <Link href={`/species/${species.slug}`} className="inline-flex items-center text-primary hover:text-accent font-medium text-sm transition-colors w-full">
                      Read Profile <Search className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-muted/20 border border-dashed border-border flex flex-col items-center">
            <Info className="h-16 w-16 text-muted-foreground mb-6 opacity-40" />
            <h3 className="font-serif text-3xl text-foreground mb-3">No species found</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              We couldn't find any species matching your search criteria. Try adjusting your filters or search term.
            </p>
            {(search || kingdom !== "All" || conservationStatus !== "All") && (
              <Button 
                variant="outline" 
                className="mt-8"
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                  setKingdom("All");
                  setConservationStatus("All");
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
