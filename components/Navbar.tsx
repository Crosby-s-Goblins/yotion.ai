import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
    return (
        <nav className="flex items-center px-8 py-4 sticky top-0 z-50 shadow bg-white">
            {/* Left section */}
            <div className="w-1/3">
                <Link href="/page.tsx" className="font-bold">yotion.ai</Link>
            </div>

            {/* Center section */}
            <div className="w-1/3 flex justify-center gap-8">
                <Link href="/about" className="font-medium">About</Link>
                <Link href="/pricing" className="font-medium">Pricing</Link>
                <Link href="/contact" className="font-medium">Contact</Link>
            </div>

            {/* Right section */}
            <div className="w-1/3 flex justify-end gap-8">
            <Link href="/" className="">Login</Link>
            <Link href="/" className="">Sign Up</Link>
            </div>  
        </nav>
    )
}