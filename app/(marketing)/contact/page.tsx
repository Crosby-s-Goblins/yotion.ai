'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Send, CheckCircle, Loader2 } from "lucide-react";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const form = e.currentTarget;
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    access_key: "xk5b1-2q3b6-2k6z6-9v1b1",
                    fName: (form.elements.namedItem('fName') as HTMLInputElement)?.value,
                    lName: (form.elements.namedItem('lName') as HTMLInputElement)?.value,
                    email: (form.elements.namedItem('email') as HTMLInputElement)?.value,
                    message: (form.elements.namedItem('message') as HTMLInputElement)?.value,
                }),
            });

            const result = await response.json();
            
            if (result.success) {
                setIsSubmitted(true);
                toast.success("Message sent successfully! We'll get back to you soon.");
                form.reset();
                setTimeout(() => setIsSubmitted(false), 3000);
            } else {
                toast.error("Failed to send message. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again." + error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
            <Toaster />
            
            {/* Hero Header */}
            <div className="flex flex-col gap-4 items-center px-4 md:px-8 pt-12 md:pt-20">
                <h1 className="font-semibold text-2xl sm:text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
                    Contact Us
                </h1>
                <p className="text-muted-foreground text-center max-w-2xl text-sm md:text-base">
                    Get in touch with our team. We&apos;d love to hear from you and will respond as soon as possible.
                </p>
            </div>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 pb-8 md:pb-16">
                <div className="space-y-8">
                    
                    {/* Contact Form */}
                    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 md:p-8 shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fName" className="text-sm font-medium">
                                        First Name
                                    </Label>
                                    <Input
                                        id="fName"
                                        name="fName"
                                        type="text"
                                        required
                                        placeholder="Enter your first name"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lName" className="text-sm font-medium">
                                        Last Name
                                    </Label>
                                    <Input
                                        id="lName"
                                        name="lName"
                                        type="text"
                                        required
                                        placeholder="Enter your last name"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="Enter your email address"
                                    className="w-full"
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Message Field */}
                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-sm font-medium">
                                    Message
                                </Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={6}
                                    placeholder="Tell us how we can help you..."
                                    className="w-full resize-none"
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 text-base font-medium"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : isSubmitted ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Sent!
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Send Message
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Contact Information
                    <div className="text-center space-y-4 pt-8 border-t border-border/30">
                        <h3 className="text-lg font-semibold">Other Ways to Reach Us</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
                            <div className="space-y-1">
                                <p className="font-medium text-foreground">Email</p>
                                <p>hello@yotion.ai</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-foreground">Support</p>
                                <p>support@yotion.ai</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-foreground">Response Time</p>
                                <p>Within 24 hours</p>
                            </div>
                        </div>
                    </div> */}
                </div>
            </main>
        </div>
    );
}