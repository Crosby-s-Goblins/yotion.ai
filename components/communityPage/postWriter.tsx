"use client";

import { Check, SendHorizonal, Loader } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useUser } from "../user-provider";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle } from "../ui/card";

interface Profile {
    username?: string;
    avatar_url?: string;
    status_message?: string;
}

const Posts = ({ onPostSubmit }: { onPostSubmit?: () => void }) => {
    const user = useUser() as { id?: string } | null;
    const [profile, setProfile] = useState<Profile | null>(null);
    const [postText, setPostText] = useState("");
    const [loading, setLoading] = useState(false);
    const [posted, setPosted] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from("profiles")
            .select("username, avatar_url, status_message")
            .eq("id", user?.id)
            .single()
            .then(({ data: profileData }) => {
                if (profileData) setProfile(profileData as Profile);
            });
    }, [user]);

    const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();
        if (!postText.trim() || !user?.id || loading) return;
        setLoading(true);
        const supabase = createClient();
        const { error } = await supabase.from("community").insert({
            user_id: user.id,
            post_text: postText.trim(),
        });
        setLoading(false);
        if (!error) {
            setPostText("");
            setPosted(true);
            if (onPostSubmit) onPostSubmit();
            setTimeout(() => setPosted(false), 1500);
        }
        else console.log(error);
    };

    return (
        <Card className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card mb-10">
            <CardHeader className="">
                <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                        <AvatarImage src={profile?.avatar_url} alt="avatar" />
                        <AvatarFallback>
                            {profile?.username ? profile.username[0]?.toUpperCase() : ''}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg"><span className="text-green-700">[You]</span> {profile?.username ?? ''}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {profile?.status_message ?? ''}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <div className="flex flex-col gap-4 items-center">
                <form className="relative flex-1 w-full flex gap-4" onSubmit={handleSubmit}>
                    <Input
                        className="w-full pl-4 pr-4 h-12 rounded-full border-2 bg-background/50 backdrop-blur-sm"
                        placeholder="Write a message..."
                        type="text"
                        value={postText}
                        onChange={e => setPostText(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                handleSubmit(e);
                            }
                        }}
                        disabled={loading || posted}
                    />
                    <Button type="submit" disabled={loading || posted || !postText.trim()}>
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader className="animate-spin w-4 h-4" />
                                <span className="hidden lg:flex">Posting...</span>
                            </span>
                        ) : posted ? (
                            <div className="flex gap-2">
                                <Check className="flex lg:hidden"/>
                                <span className="hidden lg:flex">Posted!</span>
                            </div>
                        ) : (
                            <div>
                                <SendHorizonal className="flex lg:hidden"/>
                                <span className="hidden lg:flex">Submit</span>
                            </div>
                        )}
                    </Button>
                </form>
            </div>
        </Card>
    );
};

export default Posts;
