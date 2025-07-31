"use client";
// Logic
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

// UI stuff
import { Input } from "@/components/ui/input";
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

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { FileUpload } from "@/components/ui/file-upload";

//Icons
import { Loader2Icon, Check, CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import PasswordAlteration from "../passwordChanger";

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
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
            <Toaster />
            
            {/* Hero Header */}
            <div className="flex flex-col gap-4 items-center px-4 md:px-8 pt-12 md:pt-20">
                <h1 className="font-semibold text-2xl sm:text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
                    Profile
                </h1>
                <p className="text-muted-foreground text-center max-w-2xl text-sm md:text-base">
                    Update your personal information and how others see you.
                </p>
            </div>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 pb-8 md:pb-16">
                <div className="space-y-8 md:space-y-16">
                    
                    {/* Profile Picture */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 md:py-6 border-b border-border/50 gap-4 md:gap-0">
                        <div className="flex-1 space-y-2 text-left">
                            <h3 className="text-xl font-semibold">Profile Picture</h3>
                            <p className="text-muted-foreground">
                                Upload a new profile picture for your account. Maximum file size is 5MB.
                            </p>
                        </div>
                        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                            <div className="w-32 md:w-48 aspect-square">
                                <FileUpload
                                    isLoading={loadingAvatar}
                                    onChange={handleAvatarUpload}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Username Change */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 md:py-6 border-b border-border/50 gap-4 md:gap-0">
                        <div className="flex-1 space-y-2 text-left">
                            <h3 className="text-xl font-semibold">Username</h3>
                            <p className="text-muted-foreground">
                                Change how your name appears on yotion.ai. Use letters and numbers only, 3-15 characters.
                            </p>
                        </div>
                        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full max-w-xs md:w-48">
                                        Edit Username
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Change Username</DialogTitle>
                                        <DialogDescription>
                                            Update how your name appears on yotion.ai. Use letters and numbers only, 3-15 characters.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form className="space-y-4" onSubmit={handleUsernameSubmit}>
                                        <Input
                                            placeholder="New username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            disabled={locked}
                                        />
                                        <div className="flex gap-3 justify-end">
                                            <DialogTrigger asChild>
                                                <Button variant="outline" type="button">
                                                    Cancel
                                                </Button>
                                            </DialogTrigger>
                                            <Button 
                                                type="submit" 
                                                disabled={loading || locked}
                                            >
                                                {loading ? (
                                                    <Loader2Icon className="animate-spin w-4 h-4" />
                                                ) : locked ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    "Update"
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Password Change */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 md:py-6 border-b border-border/50 gap-4 md:gap-0">
                        <div className="flex-1 space-y-2 text-left">
                            <h3 className="text-xl font-semibold">Password</h3>
                            <p className="text-muted-foreground">
                                Update your password to keep your account secure.
                            </p>
                        </div>
                        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                            <PasswordAlteration />
                        </div>
                    </div>

                    {/* Account Actions */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 md:py-6 gap-4 md:gap-0">
                        <div className="flex-1 space-y-2 text-left">
                            <h3 className="text-xl font-semibold">Account Actions</h3>
                            <p className="text-muted-foreground">
                                Sign out of your account or permanently delete your data.
                            </p>
                        </div>
                        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                            <div className="flex flex-col space-y-3 items-center md:items-end w-full max-w-xs md:max-w-none">
                                <Button 
                                    onClick={logout}
                                    variant="outline"
                                    className="w-full md:w-48"
                                >
                                    Sign Out
                                </Button>
                                
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button 
                                            variant="destructive"
                                            className="w-full md:w-48"
                                        >
                                            <CircleAlert className="w-4 h-4 mr-2" />
                                            Delete Account
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <div className="flex items-center gap-3 mb-2">
                                                <CircleAlert className="w-6 h-6 text-red-500" />
                                                <p className="font-bold text-red-500 text-2xl">WARNING!</p>
                                            </div>
                                            <AlertDialogTitle>
                                                Are you <span className="text-red-600">absolutely</span> sure?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="text-base">
                                                This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including your progress, posts, and profile information.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                                Yes, Delete My Account
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
