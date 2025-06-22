'use client'
// Logic
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
// UI stuff
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Button } from "./ui/button";
import { FileUpload } from "@/components/ui/file-upload";
//Icons
import { ExternalLink, Loader2Icon, Check } from "lucide-react"

interface SettingsProps {
    user: any;
}

const Settings = ({ user }: SettingsProps) => {
    const [username, setUsername] = useState<string>('');
    
    // states for the username input too lazy to change the names 
    const [loading, setLoading] = useState<boolean>(false);
    const [locked, setLocked] = useState<boolean>(false);

    // states for the avatar input
    const [loadingAvatar, setLoadingAvatar] = useState<boolean>(false);

    const changeUsername = async (newName : string) => {
        setLoading(true);
        const supabase = await createClient();

        try {
            if (newName.length < 3) {
                throw ("Username must be above 3 characters!")
            } else if (newName.length > 15){
                throw ("Username must be under 15 characters!")
            } else if (!/^[a-zA-Z0-9]+$/.test(newName)){
                throw "Username can only contain letters and numbers!";
            }

            const { error } = await supabase
                .from('profiles')
                .update({username: newName})
                .eq('id', user?.id)
    
            setLocked(true)
            toast("Success! Changes will be applied shortly.")
        } catch (e) {
            toast(`${e}`);
        }
        setLoading(false)
    }

    const changeAvatar = async (newAvatarUrl: string) => {
        const supabase = await createClient();
      
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: newAvatarUrl })
          .eq('id', user?.id);
      
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
            const filePath = `${user?.id}`;

            const { error: uploadError } = await supabase
                .storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                toast(`Failed to upload avatar: ${uploadError.message} (5MB limit)`);
                console.log(uploadError);
                return;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const publicUrl = data?.publicUrl ? `${data.publicUrl}?v=${Date.now()}` : undefined;

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
        setUsername('');
    };

    return (
        <div>
            <Toaster/>
            <div className="w-full flex flex-col items-center">
                <div className="my-8 w-[80%] max-w-[450px]">
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">Manage Settings</h1>
                    <h1 className="leading-7">Welcome, fellow Yogi!</h1>
                </div>
                <Tabs defaultValue="profile" className="flex items-center w-[80%] max-w-[450px]">
                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="app">App</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="w-full">
                        <Card>
                            <CardHeader className="flex flex-col gap-5">
                                <div className="flex items-center">
                                    <div className="w-full">
                                        <div className="flex flex-col gap-1 flex-1">
                                            <CardTitle>Change Avatar</CardTitle>
                                            <CardDescription>Upload a new profile picture for your account.</CardDescription>
                                        </div>
                                    </div>
                                    <FileUpload isLoading={loadingAvatar} onChange={handleAvatarUpload}/>
                                </div>
                                <Separator/>
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-1">
                                        <CardTitle>Change Username</CardTitle>
                                        <CardDescription>Change the way your name appears on Yogai.</CardDescription>
                                    </div>
                                    <form className="flex gap-2" onSubmit={handleUsernameSubmit}>
                                        <Input 
                                            placeholder="New username" 
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            disabled={locked}
                                        />
                                        <Button type="submit" disabled={loading || locked}>
                                            {
                                                loading ? (<Loader2Icon className="animate-spin"/>) : (locked ? (<Check></Check>) : ("Submit"))
                                            }
                                        </Button>
                                    </form>
                                </div>
                                <Separator/>
                                <div className="flex flex-col gap-2">
                                    <CardTitle>Change Password</CardTitle>
                                    <CardDescription>Change the password associated with your account.</CardDescription>
                                    <Button variant="outline" asChild><a href="/update-password"><ExternalLink/>Edit Password</a></Button>
                                </div>
                            </CardHeader>
                        </Card>
                    </TabsContent>
                    <TabsContent value="account">
                        <div className="mb-2 py-4">
                            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">Account Settings</h1>
                            <h1 className="leading-7">Manage your profile settings</h1>
                        </div>
                    </TabsContent>
                    <TabsContent value="app">
                        <h1>App Settings</h1>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
 
export default Settings;