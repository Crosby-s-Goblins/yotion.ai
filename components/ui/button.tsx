import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-50 shadow-card [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-tr from-primary to-accent text-white shadow-glass hover:from-primary/90 hover:to-accent/90 active:scale-95",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 active:scale-95",
        outline:
          "border border-primary bg-background text-primary shadow-sm hover:bg-primary/10 active:scale-95",
        secondary:
          "bg-background text-primary border border-border shadow-card hover:bg-primary/5 active:scale-95",
        ghost: "bg-transparent text-primary hover:bg-primary/10 active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-gradient-to-tr from-premium to-yellow-200 text-yellow-900 shadow-card hover:from-premium/90 hover:to-yellow-200/90 active:scale-95",
      },
      size: {
        default: "h-11 px-6 py-2 text-base",
        sm: "h-9 rounded-full px-4 text-sm",
        lg: "h-14 rounded-full px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
