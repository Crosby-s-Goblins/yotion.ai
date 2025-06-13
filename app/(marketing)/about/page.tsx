import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-dropdown-menu";

export default function aboutPage() {
    return (
        <main className="min-h-screen flex flex-col items-center items-fit">
            <div className="flex-1 w-full flex flex-col gap-10 items-center">
                <div className="flex flex-col gap-4 items-center px-4 md:px-8 pt-20">
                    <h1 className="font-medium text-2xl sm:text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
                        About
                    </h1>
                </div>
            </div>
        </main>
    )
}