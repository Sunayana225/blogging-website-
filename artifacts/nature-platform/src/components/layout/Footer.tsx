import { Link } from "wouter";
import { Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center">
              <img src="/logo.png.png" alt="Wildleaf Journal" className="h-16 w-auto origin-left scale-110 object-contain md:h-20 md:scale-125" />
            </Link>
            <p className="text-muted-foreground max-w-sm text-sm/relaxed">
              Lyrical storytelling meets rigorous science. Exploring the intricate connections between humans and the natural world through essays, field notes, and deep dives.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-serif text-lg">Explore</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/articles" className="hover:text-primary-foreground transition-colors">Latest Articles</Link></li>
              
              <li><Link href="/about" className="hover:text-primary-foreground transition-colors">About the Author</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-lg">Connect</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-primary-foreground transition-colors">Contact</Link></li>
              <li><Link href="/newsletter" className="hover:text-primary-foreground transition-colors">Newsletter</Link></li>
            </ul>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="text-muted-foreground hover:text-primary-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:hello@example.com" className="text-muted-foreground hover:text-primary-foreground transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-background/10 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Wildleaf Journal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

