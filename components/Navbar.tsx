import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
    return (
        <nav className="flex items-center px-8 py-4">
            {/* Left section */}
            <div className="w-1/3">
                <Link href="/page.tsx" className="font-bold">yotion.ai</Link>
            </div>

            {/* Center section */}
            <div className="w-1/3 flex justify-center gap-8">
                <Link href="/about" className="font-semibold">About</Link>
                <Link href="/pricing" className="font-semibold">Pricing</Link>
                <Link href="/contact" className="font-semibold">Contact</Link>
            </div>

            {/* Right section */}
            <div className="w-1/3 flex justify-end gap-2">
                <Button className="w-[125px]">Login</Button>
                <Button variant="outline" className="w-[125px]">Sign Up</Button>
            </div>  
        </nav>
    )
}