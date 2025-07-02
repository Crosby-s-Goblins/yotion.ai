import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, ChartNoAxesCombined, Flame } from 'lucide-react';

export default function PracticePage() {
  return (
    <main className="flex py-7 flex-col items-center justify-center w-full md:h-screen md:items-center 2xl:h-screen 2xl:items-center gap-8">
        <div>
            <h1 className="text-3xl font-semibold"><a href='/'>yotion.ai</a></h1>
        </div>
        <div className="flex flex-col gap-5 md:grid md:grid-cols-2 2xl:grid-cols-4">
            <Card className="flex flex-col justify-center items-center w-80 h-80 aspect-square transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-gray-200/50 cursor-pointer">
            <a href="/selection" className="w-full h-full flex flex-col justify-center items-center">
                <CardHeader className="flex flex-col justify-center items-center">
                    <CardTitle className="text-2xl">Train</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-center items-center">
                    <div className="w-32 h-32 rounded-lg mb-4 flex items-center justify-center">
                        <Flame className="w-32 h-32"/>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        Choose from our curated list of poses and get real-time feedback on your form.
                    </p>
                </CardContent>
            </a>
            </Card>

            <Card className="flex flex-col justify-center items-center w-80 h-80 aspect-square transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-gray-200/50 cursor-pointer">
            <a href="/performance" className="w-full h-full flex flex-col justify-center items-center">
                <CardHeader className="flex flex-col justify-center items-center">
                    <CardTitle className="text-2xl">Performance</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-center items-center">
                    <div className="w-32 h-32 rounded-lg mb-4 flex items-center justify-center">
                        <ChartNoAxesCombined className="w-32 h-32"/>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        Track your progress and see improvements over time.
                    </p>
                </CardContent>
            </a>
            </Card>

            <Card className="flex flex-col justify-center items-center w-80 h-80 aspect-square transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-gray-200/50 cursor-pointer">
            <a href="/community" className="w-full h-full flex flex-col justify-center items-center">
                <CardHeader className="flex flex-col justify-center items-center">
                    <CardTitle className="text-2xl">Community</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-center items-center">
                    <div className="w-32 h-32 rounded-lg mb-4 flex items-center justify-center">
                        <Users className="w-32 h-32"/>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        Connect with other yoga practitioners and share experiences.
                    </p>
                </CardContent>
            </a>
            </Card>

            <Card className="flex flex-col justify-center items-center w-80 h-80 aspect-square transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-gray-200/50 cursor-pointer">
            <a href="/appSettings" className="w-full h-full flex flex-col justify-center items-center">
                <CardHeader className="flex flex-col justify-center items-center">
                    <CardTitle className="text-2xl">Settings</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-center items-center">
                    <div className="w-32 h-32 rounded-lg mb-4 flex items-center justify-center">
                        <Settings className="w-32 h-32"/>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        Customize your experience and manage your preferences.
                    </p>
                </CardContent>
            </a>
            </Card>
        </div>
    </main>
  );
} 