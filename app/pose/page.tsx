'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PushUpCounter from "@/components/romeoPushUpCounter"
import FormCorrect from "@/components/romeoFormCorrect"

export default function poseDetection() {

    return (
        <div>
            <Tabs defaultValue="pose" className="w-full h-[100vh] p-10 flex items-center flex-col">
                <TabsList>
                    <TabsTrigger value="push">Push-Up Counter</TabsTrigger>
                    <TabsTrigger value="pose">Pose Helper</TabsTrigger>
                </TabsList>
                <TabsContent value="push">
                    <PushUpCounter/>
                </TabsContent>
                <TabsContent value="pose">
                    <FormCorrect/>
                </TabsContent>
            </Tabs>
        </div>
    );
}
