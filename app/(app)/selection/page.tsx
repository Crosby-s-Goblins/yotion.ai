import * as React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function PracticePage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome to Your Practice</h1>
        <p className="text-muted-foreground mt-2">
          Start your yoga journey with AI-powered guidance
        </p>
      </div>

      <div>
         <Carousel className="w-full gap-6"
                    opts={({
                        align: "start",
                        loop: true,
                        dragFree: true,
                    })}>
            <CarouselContent>
                {Array.from({ length: 10 }).map((_, index) => ( //Can Use the Array to have the pose names
                <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/5">
                    <div className="p-1">
                    <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-6">
                        <span className="text-4xl font-semibold">
                            <a href="/pose">
                                Pose {index + 1}
                            </a>
                        </span>
                        </CardContent>
                    </Card>
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious/>
            <CarouselNext/>
        </Carousel>
        {/* <Card>
          <a href="/pose">
            <CardHeader>
            <CardTitle>Just a thought</CardTitle>
            <CardDescription>Are we passing values in to same "pose" page for it to be properly selected or multiple pages -- May cause bloat?</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Just think about it.
            </p>
          </CardContent>
          </a>
        </Card> */}
      </div>
    </div>
  );
} 