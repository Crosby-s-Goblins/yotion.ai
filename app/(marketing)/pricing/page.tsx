import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
        <div className="flex-1 w-full flex flex-col gap-10 items-center">
            <div className="flex flex-col gap-4 items-center px-4 md:px-8 pt-20">
                <h1 className="font-medium text-2xl sm:text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
                    Pricing Plans
                </h1>
            </div>
            <div className="flex flex-row gap-4">
                <Card className="w-[350px] h-[500px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-2xl">Free</CardTitle>
                        <p>$0 / mo</p>
                        <CardDescription>A no-commitment to experience the Yotion yoga experience!</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="flex gap-2"><Check />Access to 3 free poses</p>
                        <p className="flex gap-2"><Check />Post-training AI insights</p>
                    </CardContent>
                    <CardAction>
                        <Link href="/auth/sign-up" className="w-full">
                            <Button className="w-full h-10" variant="outline">Sign up now</Button>
                        </Link>
                    </CardAction>
                </Card>
                <Card className="w-[350px] h-[500px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-2xl">Premier</CardTitle>
                        <p>$10 / mo</p>
                        <CardDescription>Enjoy the full experience loaded with extra features!</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="flex gap-2"><Check />Access to all 20+ yoga poses</p>
                        <p className="flex gap-2"><Check />Mindfulness features</p>
                        <p className="flex gap-2"><Check />Personal progress tracking</p>
                        <p className="flex gap-2"><Check />Community-based competition</p>
                    </CardContent>
                    <CardContent className="flex-grow">
                        <p className="mb-2">Coming Soon!</p>
                        <ul className="list-disc pl-4 text-muted-foreground">
                            <li>Avatar selection</li>
                            <li>Personal progress tracking</li>
                            <li>Community-based competition</li>
                        </ul>
                    </CardContent>
                    <CardAction>
                        <Link href="/auth/sign-up" className="w-full">
                            <Button className="w-full h-10">Sign up now</Button>
                        </Link>
                    </CardAction>
                </Card>
            </div>
        </div>
    </main>
  );
} 