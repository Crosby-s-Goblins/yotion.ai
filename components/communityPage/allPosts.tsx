'use client'

import { useEffect, useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "../user-provider";
import clsx from "clsx";
import { Skeleton } from "../ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "../ui/pagination";

const POSTS_PER_PAGE = 3;

const AllPosts = () => {
  const user = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch posts and liked_posts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from("community")
        .select('*, profiles:profiles(id, username, avatar_url, status_message)')
        .order("likes", { ascending: false })
        .order("created_at", { ascending: false });
      if (postsData) setPosts(postsData);
      // Fetch liked_posts for current user
      if (user?.id) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("liked_posts")
          .eq("id", user.id)
          .single();
        if (profileData?.liked_posts) {
          setLikedPosts(new Set(profileData.liked_posts));
        } else {
          setLikedPosts(new Set());
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user?.id]);

  // Like/unlike handler
  const handleLike = async (postId: number, currentlyLiked: boolean) => {
    if (!user?.id) return;
    // Optimistically update UI
    setPosts(prev =>
      prev.map(p =>
        p.post_id === postId
          ? { ...p, likes: (p.likes ?? 0) + (currentlyLiked ? -1 : 1) }
          : p
      )
    );
    setLikedPosts(prev => {
      const updated = new Set(prev);
      if (currentlyLiked) {
        updated.delete(postId);
      } else {
        updated.add(postId);
      }
      return updated;
    });
    // Update liked_posts in profile
    const supabase = createClient();
    let newLikedPosts: number[] = Array.from(likedPosts);
    if (currentlyLiked) {
      newLikedPosts = newLikedPosts.filter(id => id !== postId);
    } else {
      newLikedPosts = [...newLikedPosts, postId];
    }
    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ liked_posts: newLikedPosts })
      .eq("id", user.id);
    // Directly update likes in community table using the optimistic value
    const updatedPost = posts.find(p => p.post_id === postId);
    const newLikes = (updatedPost?.likes ?? 0) + (currentlyLiked ? -1 : 1);
    const { error: postError } = await supabase
      .from("community")
      .update({ likes: newLikes })
      .eq("post_id", postId);
    if (profileError || postError) {
      console.error("Error updating like:", profileError?.message, postError?.message);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="lg:col-span-2 space-y-6" id="posts-section">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card.glass border border-border/50 shadow-card overflow-hidden rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16 ml-auto" />
            </div>
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
            <div className="flex justify-end mt-2">
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 space-y-6" id="posts-section">
      {paginatedPosts.map((post, idx) => {
        const isFeatured = (currentPage - 1) * POSTS_PER_PAGE + idx === 0;
        const isYou = user?.id && post.user_id === user.id;
        const username = post.profiles?.username || "Unknown";
        const avatarUrl = post.profiles?.avatar_url;
        const status = post.profiles?.status_message;
        const liked = likedPosts.has(post.post_id);

        return (
          <Card key={post.post_id} className="bg-card.glass border border-border/50 shadow-card overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="avatar" />
                  ) : (
                    <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {isYou && <span className="text-green-700">[YOU] </span>}
                    {username}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{status}</p>
                </div>
                {isFeatured && (
                  <Badge variant="secondary" className="ml-auto">Featured</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground mb-4 italic">
                "{post.post_text}"
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0 lg:gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={clsx(
                      "hover:text-primary",
                      liked ? "text-red-500" : "text-muted-foreground"
                    )}
                    onClick={() => handleLike(post.post_id, liked)}
                  >
                    <Heart className="w-4 h-4 lg:mr-2" fill={liked ? "currentColor" : "none"} />
                    {post.likes ?? 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    <MessageCircle className="w-4 h-4 lg:mr-2" />
                    0
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    <Share2 className="w-4 h-4 lg:mr-2" />
                    <span className="hidden lg:flex">Share</span>
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">
                  {post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : ""}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-disabled={currentPage === 1}
                  tabIndex={currentPage === 1 ? -1 : 0}
                  href="#"
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={e => { e.preventDefault(); setCurrentPage(i + 1); }}
                    href="#"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-disabled={currentPage === totalPages}
                  tabIndex={currentPage === totalPages ? -1 : 0}
                  href="#"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default AllPosts;
