import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <main className="flex justify-center items-center h-screen">
            <Loader2 className="animate-spin size-10" />
        </main>
    )
}