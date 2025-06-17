import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, ChartNoAxesCombined, Flame } from 'lucide-react';

export default function PracticePage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen -mt-12 gap-24">
        <div>
            <h1 className="text-3xl font-semibold">yotion.ai</h1>
        </div>
        <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-6">
                <div className="flex flex-row gap-8 justify-center">
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
                    <a href="/selection" className="w-full h-full flex flex-col justify-center items-center">
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
                    <a href="/selection" className="w-full h-full flex flex-col justify-center items-center">
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
                    <a href="/selection" className="w-full h-full flex flex-col justify-center items-center">
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
            </div>
        </div>
    </main>
  );
} 