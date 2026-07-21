import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-black uppercase transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border-2 select-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary-fixed text-on-primary-fixed border-background brutalist-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none",
        outline:
          "border-outline text-on-surface hover:bg-surface-container",
        destructive:
          "bg-error text-on-error border-background brutalist-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none",
        secondary:
          "bg-secondary text-on-secondary border-background brutalist-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none",
        ghost: "border-transparent hover:bg-surface-container",
        link: "border-transparent text-primary-fixed underline hover:text-primary-fixed/90",
      },
      size: {
        default: "px-6 py-2 h-10 text-sm",
        sm: "px-4 py-1.5 h-8 text-xs",
        lg: "px-8 py-3 h-12 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
//exporting buttons
export { Button, buttonVariants }
