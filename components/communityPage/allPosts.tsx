'use client'

import { useEffect, useState } from "react";
import { Heart, MessageCircle, Share2, EllipsisVertical, Trophy } from "lucide-react";
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
} from "../ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import "../ui/shine.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Post {
  user_id: string;
  profiles?: {
    username?: string;
    avatar_url?: string;
    status_message?: string;
  };
  post_id: number;
  likes?: number;
  post_text: string;
  created_at?: string;
}

const POSTS_PER_PAGE = 4;

const AllPosts = ({ reloadKey }: { reloadKey?: number }) => {
  const user = useUser() as { id?: string } | null;
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [postedBy, setPostedBy] = useState<string>("all");
  const [last, setLast] = useState<string>("week");

  // Fetch posts and liked_posts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();
      // Build filters
      let fromQuery = supabase.from("community").select('*, profiles:profiles(id, username, avatar_url, status_message)');
      // postedBy filter
      if (postedBy === "myself" && user?.id) {
        fromQuery = fromQuery.eq("user_id", user.id);
      } else if (postedBy === "others" && user?.id) {
        fromQuery = fromQuery.neq("user_id", user.id);
      }
      // last filter
      let fromDate: Date | null = null;
      const now = new Date();
      if (last === "week") {
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      } else if (last === "month") {
        fromDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      } else if (last === "year") {
        fromDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      }
      if (fromDate) {
        fromQuery = fromQuery.gte("created_at", fromDate.toISOString());
      }
      fromQuery = fromQuery.order("likes", { ascending: false }).order("created_at", { ascending: false });
      // Fetch posts
      const { data: postsData } = await fromQuery;
      if (postsData) setPosts(postsData);
      // Fetch liked_posts for current user
      if (user?.id) {
        const { data: profileData } = await supabase
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
  }, [user?.id, postedBy, last, reloadKey]);

  const handleDeletePost = async (postId: number) => {
    if (!user?.id) return;
    const post = posts.find(p => p.post_id === postId);
    if (!post) return;
    if (post.user_id !== user.id) {
      alert("You can only delete your own posts.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase
      .from("community")
      .delete()
      .eq("post_id", postId);
    if (error) {
      alert("Failed to delete post: " + error.message);
      return;
    }
    setPosts(prev => prev.filter(p => p.post_id !== postId));
  };

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
  // Sort posts by most recent for display
  const sortedPosts = [...posts].sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime());

  // Featured post logic
  let featuredPost: Post | null = null;
  let displayPosts = sortedPosts;
  let hasFeatured = false;
  if (postedBy === "all" && sortedPosts.length > 0) {
    featuredPost = sortedPosts.reduce((max, post) => (post.likes && (!max || post.likes > (max.likes ?? -Infinity)) ? post : max), sortedPosts[0]);
    displayPosts = sortedPosts.filter((post) => post.post_id !== (featuredPost as Post).post_id);
    hasFeatured = true;
  }

  // Adjust totalPages so that the first page has POSTS_PER_PAGE - 1 posts if featured is present
  let totalPages = 1;
  if (hasFeatured) {
    if (displayPosts.length <= POSTS_PER_PAGE - 1) {
      totalPages = 1;
    } else {
      totalPages = 1 + Math.ceil((displayPosts.length - (POSTS_PER_PAGE - 1)) / POSTS_PER_PAGE);
    }
  } else {
    totalPages = Math.ceil(displayPosts.length / POSTS_PER_PAGE);
  }

  let paginatedPosts: Post[] = [];
  if (hasFeatured && currentPage === 1) {
    paginatedPosts = displayPosts.slice(0, POSTS_PER_PAGE - 1);
  } else if (hasFeatured) {
    // For pages after the first, adjust the slice to skip the first (POSTS_PER_PAGE - 1) posts
    const start = (POSTS_PER_PAGE - 1) + (currentPage - 2) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    paginatedPosts = displayPosts.slice(start, end);
  } else {
    paginatedPosts = displayPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);
  }

  if (loading) {
    return (
      <div className="lg:col-span-2 space-y-6">
        <Card className="w-full h-10 flex gap-7 flex justify-center items-center">
          <Skeleton className="bg-gray-300 w-12 h-4 rounded-full"></Skeleton>
          <Skeleton className="bg-gray-300 w-12 h-4 rounded-full"></Skeleton>
          <Skeleton className="bg-gray-300 w-12 h-4 rounded-full"></Skeleton>
        </Card>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card.glass border border-border/50 shadow-card overflow-hidden rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="bg-gray-300 w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="bg-gray-300 h-4 w-32 mb-2" />
                <Skeleton className="bg-gray-300 h-3 w-24" />
              </div>
              <Skeleton className="bg-gray-300 h-6 w-16 ml-auto" />
            </div>
            <Skeleton className="bg-gray-300 h-4 w-3/4 mb-2" />
            <Skeleton className="bg-gray-300 h-4 w-1/2 mb-4" />
            <div className="flex items-center gap-4">
              <Skeleton className="bg-gray-300 h-8 w-16" />
              <Skeleton className="bg-gray-300 h-8 w-16" />
              <Skeleton className="bg-gray-300 h-8 w-16" />
            </div>
            <div className="flex justify-end mt-2">
              <Skeleton className="bg-gray-300 h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 space-y-6" id="posts-section">
      <Card className="p-3 px-6 flex items-center justify-between">
        <h1 className="text-md">Filter Options:</h1>
        <div className="flex gap-4">
          <div className="flex text-sm items-center gap-1">
            posted by:
            <Select value={postedBy} onValueChange={setPostedBy}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="myself">Myself</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex text-sm items-center gap-1">
            Last:
            <Select value={last} onValueChange={setLast}>
              <SelectTrigger>
                <SelectValue placeholder="week" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
      {/* Featured Post (only if filter is 'all') */}
      {postedBy === "all" && featuredPost && currentPage === 1 && (
        (() => {
          const fp = featuredPost;
          const isYou = user?.id && fp.user_id === user.id;
          const username = fp.profiles?.username || "Unknown";
          const avatarUrl = fp.profiles?.avatar_url;
          const status = fp.profiles?.status_message;
          const liked = likedPosts.has(fp.post_id);
          return (
            <Card key={fp.post_id} className="bg-card.glass border border-border/50 shadow-card overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="avatar" />
                    ) : (
                      <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg flex justify-start items-center gap-1">
                      {isYou && <span className="text-green-700">[You] </span>}
                      {username}
                      <span className="relative inline-block ml-2 group">
                        <Badge
                          variant="secondary"
                          className="bg-yellow-300 text-yellow-800 text-xs font-medium dark:bg-yellow-900 dark:text-yellow-300 border-none overflow-hidden relative px-3 py-1 flex gap-2"
                        >
                          <Trophy size={12} />
                          <span className="relative z-10">Featured Post!</span>
                          <span
                            className="pointer-events-none absolute inset-0 z-0 block h-full w-full bg-[linear-gradient(45deg,transparent_40%,rgba(255,255,255,0.85)_48%,transparent_56%,transparent_100%)] bg-[length:250%_250%] bg-[position:-100%_0] bg-no-repeat animate-shine"
                            aria-hidden="true"
                          />
                        </Badge>
                      </span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{status}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="absolute top-4 right-2">
                  {isYou &&
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button><EllipsisVertical /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white" align="start">
                        <DropdownMenuItem>
                          <button onClick={() => handleDeletePost(fp.post_id)}>Delete Post</button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                </div>
                <p className="text-base text-muted-foreground mb-4 italic">
                  &quot;{fp.post_text}&quot;
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
                      onClick={() => handleLike(fp.post_id, liked)}
                    >
                      <Heart className="w-4 h-4 lg:mr-2" fill={liked ? "currentColor" : "none"} />
                      {fp.likes ?? 0}
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
                    {fp.created_at ? formatDistanceToNow(new Date(fp.created_at), { addSuffix: true }) : ""}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })()
      )}

      {paginatedPosts.map((p) => {
        const isYou = user?.id && p.user_id === user.id;
        const username = p.profiles?.username || "Unknown";
        const avatarUrl = p.profiles?.avatar_url;
        const status = p.profiles?.status_message;
        const liked = likedPosts.has(p.post_id);

        return (
          <Card key={p.post_id} className="bg-card.glass border border-border/50 shadow-card overflow-hidden">
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
                  <CardTitle className="text-lg flex justify-start items-center gap-1">
                    {isYou && <span className="text-green-700">[You] </span>}
                    {username}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{status}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="absolute top-4 right-2">
                {isYou &&
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button><EllipsisVertical /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white" align="start">
                      <DropdownMenuItem>
                        <button onClick={() => handleDeletePost(p.post_id)}>Delete Post</button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
              </div>
              <p className="text-base text-muted-foreground mb-4 italic">
                &quot;{p.post_text}&quot;
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
                    onClick={() => handleLike(p.post_id, liked)}
                  >
                    <Heart className="w-4 h-4 lg:mr-2" fill={liked ? "currentColor" : "none"} />
                    {p.likes ?? 0}
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
                  {p.created_at ? formatDistanceToNow(new Date(p.created_at), { addSuffix: true }) : ""}
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
