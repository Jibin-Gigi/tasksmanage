"use client";

import type React from "react";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
//import { useToast } from "@/hooks/use-toast"

export default function ContactPage() {
  //const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subject: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log(formData);

    // toast({
    //   title: "Message Sent",
    //   description: "We've received your message and will get back to you soon.",
    // })

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="container py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Have questions or feedback? We'd love to hear from you.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">Get in Touch</h2>
          <p className="mt-2 text-muted-foreground">
            Our team is here to help. Fill out the form and we'll get back to
            you as soon as possible.
          </p>

          <div className="mt-8 space-y-6">
            <div className="flex items-start">
              <Mail className="mr-4 h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground">support@taskmaster.com</p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="mr-4 h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="mr-4 h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Office</h3>
                <p className="text-muted-foreground">
                  123 Productivity Lane
                  <br />
                  San Francisco, CA 94105
                  <br />
                  United States
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold">Office Hours</h2>
            <p className="mt-2 text-muted-foreground">
              Monday - Friday: 9:00 AM - 6:00 PM (PST)
              <br />
              Saturday - Sunday: Closed
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-2xl font-bold">Send a Message</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                onValueChange={handleSelectChange}
                value={formData.subject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="support">Technical Support</SelectItem>
                  <SelectItem value="billing">Billing Question</SelectItem>
                  <SelectItem value="feedback">Product Feedback</SelectItem>
                  <SelectItem value="partnership">
                    Partnership Opportunity
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Send Message <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center">
          Frequently Asked Questions
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold">
              How do I reset my password?
            </h3>
            <p className="mt-2 text-muted-foreground">
              You can reset your password by clicking on the "Forgot Password"
              link on the login page. You'll receive an email with instructions
              to create a new password.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold">
              Can I upgrade or downgrade my plan?
            </h3>
            <p className="mt-2 text-muted-foreground">
              Yes, you can change your subscription plan at any time from your
              account settings. Changes will take effect at the start of your
              next billing cycle.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold">
              Is there a mobile app available?
            </h3>
            <p className="mt-2 text-muted-foreground">
              Yes, TaskMaster is available on iOS and Android. You can download
              the app from the App Store or Google Play Store.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold">
              How do I cancel my subscription?
            </h3>
            <p className="mt-2 text-muted-foreground">
              You can cancel your subscription from your account settings. Your
              account will remain active until the end of your current billing
              period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
