import { useSubscribeNewsletter } from "@workspace/api-client-react";
import { useState } from "react";
import { Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Newsletter() {
  const { toast } = useToast();
  const subscribeMutation = useSubscribeNewsletter();
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    subscribeMutation.mutate({ data: { email, name: name || undefined } }, {
      onSuccess: () => {
        toast({
          title: "Subscribed successfully",
          description: "Welcome to the Wildleaf Journal newsletter.",
        });
        setEmail("");
        setName("");
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

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center bg-background py-20 px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-card border border-border overflow-hidden rounded-none shadow-xl">
        
        {/* Visual Side */}
        <div className="relative hidden md:block bg-primary overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/hero-forest.png" 
              alt="Forest canopy" 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-primary/40 mix-blend-multiply"></div>
          </div>
          <div className="relative z-10 p-12 h-full flex flex-col justify-between text-primary-foreground">
            <Leaf className="h-10 w-10 opacity-80" />
            <div>
              <blockquote className="font-serif text-2xl leading-snug mb-6 italic">
                "The clearest way into the Universe is through a forest wilderness."
              </blockquote>
              <p className="text-primary-foreground/70 uppercase tracking-widest text-xs font-bold">- John Muir</p>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="font-serif text-4xl text-foreground mb-4">Field Notes</h1>
            <p className="text-muted-foreground leading-relaxed">
              Twice a month, I send out a dispatch containing recent essays, field observations, recommended reading, and thoughts on ecology and conservation.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-foreground uppercase text-xs tracking-wider font-bold">First Name (Optional)</label>
              <Input 
                id="name"
                type="text" 
                placeholder="Jane" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 bg-background border-border/50"
                disabled={subscribeMutation.isPending}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-foreground uppercase text-xs tracking-wider font-bold">Email Address</label>
              <Input 
                id="email"
                type="email" 
                placeholder="jane@example.com" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-background border-border/50"
                disabled={subscribeMutation.isPending}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-base mt-2"
              disabled={subscribeMutation.isPending}
            >
              {subscribeMutation.isPending ? "Subscribing..." : "Subscribe to Field Notes"}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center pt-4">
              Your email is safe with me. I'll never sell your data or spam your inbox. You can unsubscribe with one click at any time.
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}

