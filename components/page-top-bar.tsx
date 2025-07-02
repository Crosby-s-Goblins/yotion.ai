import { ArrowLeftFromLine } from "lucide-react";
import Link from "next/link";

export default function PageTopBar({ title, description, backHref }: { title: string; description?: string; backHref?: string }) {
  return (
    <header className="w-full mx-auto px-12 pt-12 mb-12">
      <div className="flex items-center gap-4 mb-2">
        {backHref && (
          <Link href={backHref} className="flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeftFromLine className="w-6 h-6" />
          </Link>
        )}
        <h1 className="text-2xl font-bold flex-1 text-center">{title}</h1>
        {/* Spacer for symmetry */}
        {backHref && <div className="w-6 h-6" />}
      </div>
      {description && <p className="text-muted-foreground text-center">{description}</p>}
    </header>
  );
} 