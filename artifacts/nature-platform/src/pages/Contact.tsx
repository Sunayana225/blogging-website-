import { useSubmitContact } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Send } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const submitContact = useSubmitContact();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    submitContact.mutate({ data }, {
      onSuccess: () => {
        toast({
          title: "Message sent",
          description: "Thank you for reaching out. I'll get back to you soon.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          title: "Error sending message",
          description: "There was a problem sending your message. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="w-full bg-background pt-12 pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6 tracking-tight">Contact</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Whether you have a commission, a question about an article, or just want to say hello—I'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-10">
            <div>
              <h3 className="font-serif text-2xl mb-6">Direct Inquiries</h3>
              <p className="text-muted-foreground mb-6">
                For urgent assignments or time-sensitive editorial inquiries, you can reach me directly via email.
              </p>
              <div className="flex items-center gap-3 text-foreground font-medium">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:hello@theverdantpage.com" className="hover:text-primary transition-colors">hello@theverdantpage.com</a>
              </div>
            </div>

            <div className="pt-10 border-t border-border">
              <h3 className="font-serif text-2xl mb-6">Location</h3>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p>
                  Based in the Pacific Northwest.<br/>
                  Available for assignments globally.
                </p>
              </div>
            </div>
            
            <div className="pt-10 border-t border-border bg-card p-6 border border-border mt-8">
              <h3 className="font-serif text-xl mb-3">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Prefer to just follow along? Join the newsletter for regular updates from the field.
              </p>
              <a href="/newsletter" className="text-sm font-medium text-primary hover:text-accent flex items-center gap-2">
                Subscribe <Send className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border p-6 md:p-10">
              <h2 className="font-serif text-3xl mb-8">Send a Message</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground uppercase text-xs tracking-wider font-bold">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" className="h-12 bg-background border-border/50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground uppercase text-xs tracking-wider font-bold">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="jane@example.com" type="email" className="h-12 bg-background border-border/50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground uppercase text-xs tracking-wider font-bold">Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Freelance inquiry, speaking engagement, etc." className="h-12 bg-background border-border/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground uppercase text-xs tracking-wider font-bold">Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="How can I help you?" 
                            className="min-h-[200px] resize-y bg-background border-border/50 p-4" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="h-14 px-10 text-base mt-4"
                    disabled={submitContact.isPending}
                  >
                    {submitContact.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
