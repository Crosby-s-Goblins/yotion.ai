import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PracticePage() {
  return (
    <main className="flex flex-col items-center justify-center w-screen h-screen">
        <div>
            <h1 className="text-3xl font-semibold">yotion.ai</h1>
        </div>
        <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-6">
                <div className="flex flex-row gap-24 justify-between">
                    <Card className="flex flex-col justify-center items-center">
                    <a href="/selection">
                        <CardHeader className="flex flex-col justify-center items-center">
                        <CardTitle className="text-2xl">Train</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-center items-center">
                        <div className="bg-gray-200 w-48 h-48 rounded-lg mb-4 flex items-center justify-center">
                            <p className="text-sm text-gray-500">Image Placeholder</p>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            Choose from our curated list of poses and get real-time feedback on your form.
                        </p>
                        </CardContent>
                    </a>
                    </Card>

                    <Card className="flex flex-col justify-center items-center max-w-72">
                    <a href="/selection" className="w-full h-full">
                        <CardHeader className="flex flex-col justify-center items-center">
                        <CardTitle className="text-2xl">Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-center items-center">
                        <div className="bg-gray-200 w-48 h-48 rounded-lg mb-4 flex items-center justify-center">
                            <p className="text-sm text-gray-500">Image Placeholder</p>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            Choose from our curated list of poses and get real-time feedback on your form.
                        </p>
                        </CardContent>
                    </a>
                    </Card>

                    <Card className="flex flex-col justify-center items-center max-w-72">
                    <a href="/selection" className="w-full h-full">
                        <CardHeader className="flex flex-col justify-center items-center">
                        <CardTitle className="text-2xl">Community</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-center items-center">
                        <div className="bg-gray-200 w-48 h-48 rounded-lg mb-4 flex items-center justify-center">
                            <p className="text-sm text-gray-500">Image Placeholder</p>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            Choose from our curated list of poses and get real-time feedback on your form.
                        </p>
                        </CardContent>
                    </a>
                    </Card>

                    <Card className="flex flex-col justify-center items-center max-w-72">
                    <a href="/selection" className="w-full h-full">
                        <CardHeader className="flex flex-col justify-center items-center">
                        <CardTitle className="text-2xl">Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-center items-center">
                        <div className="bg-gray-200 w-48 h-48 rounded-lg mb-4 flex items-center justify-center">
                            <p className="text-sm text-gray-500">Image Placeholder</p>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            Choose from our curated list of poses and get real-time feedback on your form.
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