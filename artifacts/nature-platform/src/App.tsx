import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import Articles from "@/pages/Articles";
import ArticleReader from "@/pages/ArticleReader";
import Species from "@/pages/Species";
import SpeciesProfile from "@/pages/SpeciesProfile";
import Portfolio from "@/pages/Portfolio";
import Services from "@/pages/Services";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Newsletter from "@/pages/Newsletter";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/articles" component={Articles} />
        <Route path="/articles/:slug" component={ArticleReader} />
        <Route path="/species" component={Species} />
        <Route path="/species/:slug" component={SpeciesProfile} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/services" component={Services} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/newsletter" component={Newsletter} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
