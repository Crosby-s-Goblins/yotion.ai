"use client";
// Logic
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

// UI stuff
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { FileUpload } from "@/components/ui/file-upload";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Badge } from "@/components/ui/badge";

//Icons
import { Loader2Icon, Check, CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import PasswordAlteration from "./passwordChanger";

interface SettingsProps {
    user: User;
}

interface User {
    id: string;
}

const Settings = ({ user }: SettingsProps) => {
    const [username, setUsername] = useState<string>("");

    // states for the username input too lazy to change the names
    const [loading, setLoading] = useState<boolean>(false);
    const [locked, setLocked] = useState<boolean>(false);

    // states for the avatar input
    const [loadingAvatar, setLoadingAvatar] = useState<boolean>(false);
    const router = useRouter();

    const changeUsername = async (newName: string) => {
        setLoading(true);
        const supabase = await createClient();

        try {
            if (newName.length < 3) {
                throw "Username must be above 3 characters!";
            } else if (newName.length > 15) {
                throw "Username must be under 15 characters!";
            } else if (!/^[a-zA-Z0-9]+$/.test(newName)) {
                throw "Username can only contain letters and numbers!";
            }

            await supabase
                .from("profiles")
                .update({ username: newName })
                .eq("id", user.id);

            setLocked(true);
            toast("Success! Changes will be applied shortly.");
        } catch (e) {
            toast(`${e}`);
        }
        setLoading(false);
    };

    const changeAvatar = async (newAvatarUrl: string) => {
        const supabase = await createClient();

        const { error } = await supabase
            .from("profiles")
            .update({ avatar_url: newAvatarUrl })
            .eq("id", user.id);
        if (error) {
            toast(`Error updating avatar: ${error}`);
        } else {
            toast("Avatar updated!");
        }
    };

    const handleAvatarUpload = async (files: File[]) => {
        setLoadingAvatar(true);
        const file = files[0];

        if (!file) {
            setLoadingAvatar(false);
            return;
        }

        try {
            const supabase = await createClient();
            const filePath = `${user.id}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                toast(`Failed to upload avatar: ${uploadError.message} (5MB limit)`);
                console.log(uploadError);
                return;
            }

            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
            const publicUrl = data?.publicUrl
                ? `${data.publicUrl}?v=${Date.now()}`
                : undefined;

            if (!publicUrl) {
                toast("Failed to retrieve image URL.");
                return;
            }

            await changeAvatar(publicUrl);
        } catch (error) {
            toast("An error occurred while uploading the avatar.");
            console.error(error);
        } finally {
            setLoadingAvatar(false);
        }
    };

    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await changeUsername(username);
        setUsername("");
    };

    const logout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <div>
            <Toaster />
            <div className="w-full flex flex-col items-center">
                <div className="my-8 w-[80%] max-w-[450px]">
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                        Manage Settings
                    </h1>
                    <h1 className="leading-7">Welcome, fellow Yogi!</h1>
                </div>
                <Tabs
                    defaultValue="profile"
                    className="flex items-center w-[80%] max-w-[450px] mb-10"
                >
                    <TabsList className="bg-gray-200 rounded-md">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        {/* <TabsTrigger value="details">Details</TabsTrigger> */}
                    </TabsList>

                    <TabsContent value="profile" className="w-full">
                        <div>
                            <p className="text-lg font-bold my-3">Account Preferences</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Card>
                                <CardHeader className="flex flex-col gap-5">
                                    <div className="flex items-center">
                                        <div className="w-full">
                                            <div className="flex flex-col gap-1 flex-1">
                                                <CardTitle>Change Avatar</CardTitle>
                                                <CardDescription>
                                                    Upload a new profile picture for your account.
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <FileUpload
                                            isLoading={loadingAvatar}
                                            onChange={handleAvatarUpload}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1">
                                            <CardTitle>Change Username</CardTitle>
                                            <CardDescription>
                                                Change the way your name appears on Yogai.
                                            </CardDescription>
                                        </div>
                                        <form
                                            className="flex gap-2"
                                            onSubmit={handleUsernameSubmit}
                                        >
                                            <Input
                                                placeholder="New username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                disabled={locked}
                                            />
                                            <Button type="submit" disabled={loading || locked}>
                                                {loading ? (
                                                    <Loader2Icon className="animate-spin" />
                                                ) : locked ? (
                                                    <Check></Check>
                                                ) : (
                                                    "Submit"
                                                )}
                                            </Button>
                                        </form>
                                    </div>
                                    <Separator />
                                    <div className="flex flex-col gap-2">
                                        <CardTitle>Change Password</CardTitle>
                                        <CardDescription>
                                            Change the password associated with your account.
                                        </CardDescription>
                                        <PasswordAlteration />
                                    </div>
                                    <Separator />
                                    <div className="flex flex-col gap-3">
                                        <CardTitle>User Settings</CardTitle>
                                        <Button onClick={logout}>
                                            Logout
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive"><CircleAlert/>Delete account</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <p className="font-bold text-red-500 text-2xl">WARNING!</p>
                                                    <AlertDialogTitle>Are you <span className="text-red-600">absolutely</span> sure?</AlertDialogTitle>
                                                    <AlertDialogDescription> This action cannot be undone. This will permanently delete your account and remove your data from our servers.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardHeader>
                            </Card>
                        </div>
                    </TabsContent>
                    {/* <TabsContent value="details" className="w-full">
                        <div className="w-full">
                            <div className="flex items-center gap-3">
                                <p className="text-lg font-bold my-3">Account Details</p>
                                <Badge variant="destructive" className="flex gap-1">
                                    <CircleAlert size={11} />
                                    Advanced
                                </Badge>
                            </div>
                            <ScrollArea className="py-4 h-[500px] rounded-md border bg-muted">
                                <pre className="text-xs whitespace-pre-wrap">
                                    {JSON.stringify(user, null, 2)}
                                </pre>
                            </ScrollArea>
                        </div>
                    </TabsContent> */}
                </Tabs>
            </div>
        </div>
    );
};

export default Settings;
