import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { applySeoMeta, SEO_DEFAULT_DESCRIPTION, SEO_SITE_NAME } from "@/lib/seo";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  useEffect(() => {
    const routeMeta = (() => {
      if (location === "/") {
        return {
          title: `${SEO_SITE_NAME} | Nature Writing, Field Notes, and Science Stories`,
          description: SEO_DEFAULT_DESCRIPTION,
        };
      }

      if (location === "/articles") {
        return {
          title: `${SEO_SITE_NAME} | Essays & Field Notes`,
          description: "Browse Wildleaf Journal's essays, field notes, and science writing archive.",
        };
      }

      if (location.startsWith("/articles/")) {
        return {
          title: `${SEO_SITE_NAME} | Article`,
          description: "Read an article from Wildleaf Journal's nature writing archive.",
        };
      }

      if (location === "/about") {
        return {
          title: `${SEO_SITE_NAME} | About`,
          description: "Learn more about Wildleaf Journal and the editorial mission behind the publication.",
        };
      }

      if (location === "/contact") {
        return {
          title: `${SEO_SITE_NAME} | Contact`,
          description: "Get in touch with Wildleaf Journal for commissions, editorial work, and collaborations.",
        };
      }

      if (location === "/newsletter") {
        return {
          title: `${SEO_SITE_NAME} | Newsletter`,
          description: "Subscribe to Wildleaf Journal for essays, field notes, and updates from the archive.",
        };
      }

      

      if (location === "/species" || location.startsWith("/species/")) {
        return {
          title: `${SEO_SITE_NAME} | Species`,
          description: "Discover species profiles and nature writing from Wildleaf Journal.",
        };
      }

      return {
        title: `${SEO_SITE_NAME} | Nature Writing Platform`,
        description: SEO_DEFAULT_DESCRIPTION,
      };
    })();

    applySeoMeta({
      ...routeMeta,
      canonicalPath: location,
    });
  }, [location]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

