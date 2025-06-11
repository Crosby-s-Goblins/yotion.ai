import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function Hero() {
  return (
    <main className="min-h-screen flex flex-col items-center">
        <div className="flex-1 w-full flex flex-col gap-10 items-center">
            <div className="flex flex-col gap-4 items-center px-4 md:px-8 pt-20">
                <h1 className="font-medium text-2xl sm:text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
                    Pricing Plans
                </h1>
            </div>
            <div className="flex flex-row gap-4">
                <Card className="w-[300px] h-[500px]">
                    <CardHeader>
                        <CardTitle>Free</CardTitle>
                        <p>$0 / mo</p>
                        <CardDescription>A no-commitment to experience the Yotion yoga experience!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="flex gap-2"><Check />Hello</p>
                        <p className="flex gap-2"><Check />Hello</p>
                        <p className="flex gap-2"><Check />Hello</p>
                        <p className="flex gap-2"><Check />Hello</p>
                    </CardContent>
                </Card>
                <Card className="w-[300px]">
                    <CardHeader>
                        <CardTitle>Premier</CardTitle>
                        <p>$10 / mo</p>
                        <CardDescription>Access our full range of poses and many extra features!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="flex gap-2"><Check />Hello</p>
                        <p className="flex gap-2"><Check />Hello</p>
                        <p className="flex gap-2"><Check />Hello</p>
                        <p className="flex gap-2"><Check />Hello</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </main>
  );
}
