import { cn } from "@/shared/lib/css";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { textVariants } from "../text";

const buttonVariants = cva(
  [
    "cursor-pointer inline-flex items-center justify-center whitespace-nowrap no-underline hover:no-underline",
    "transition-all disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 [&_svg]:shrink-0 outline-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-background-primary-inverse text-typography-inverse rounded-[4px]",
          "hairline [--hairline-radius:4px]",
          "hover:bg-background-secondary-inverse",
          "disabled:opacity-40",
        ],
        secondary: [
          "bg-background-primary text-typography-primary rounded-[4px]",
          "hairline [--hairline-radius:4px]",
          "hover:[--hairline-color:var(--color-stroke-primary)]",
          "disabled:bg-background-primary disabled:text-typography-secondary",
        ],
        tertiary: [
          "bg-background-secondary text-typography-primary rounded-[4px]",
          "hover:bg-background-primary",
          "active:bg-background-primary",
          "disabled:opacity-40",
        ],
        link: [
          "bg-transparent text-typography-primary",
          "hover:text-typography-secondary",
          "disabled:text-typography-secondary",
        ],
        "link-destructive": [
          "bg-transparent text-red-5",
          "hover:text-red-600",
          "active:text-red-700",
          "disabled:opacity-40",
        ],
        ghost: [
          "bg-transparent rounded-[4px] text-icon-primary",
          "hover:bg-background-primary",
          "disabled:opacity-40",
        ],
        "icon-button": [
          "rounded-[20px] bg-background-primary text-icon-primary",
          "hover:bg-background-secondary",
          "disabled:opacity-50",
        ],
        destructive: [
          "bg-red-0 text-red-500 rounded-[60px]",
          "hover:bg-red-100",
          "active:bg-red-200",
          "disabled:opacity-50",
        ],
        black: [
          "bg-background-secondary-inverse text-typography-inverse rounded-[4px]",
          "hover:bg-background-primary-inverse",
          "disabled:opacity-10",
        ],
        dashboard: [
          "rounded-[40px] border-[0.5px] border-stroke-secondary bg-background-primary-inverse text-typography-inverse",
          "hover:bg-background-secondary-inverse",
          "disabled:opacity-40",
        ],
        blue: [
          "bg-blue-5 text-typography-inverse rounded-[4px]",
          "hover:bg-blue-6",
          "disabled:opacity-10",
        ],
      },
      size: {
        "56": [
          textVariants({ variant: "title", color: "none" }),
          "h-14 px-6 py-3.5 gap-3",
        ],
        "44": [
          textVariants({ variant: "body", color: "none" }),
          "h-11 px-5 py-2.5 gap-3",
        ],
        "40": [
          textVariants({ variant: "label", color: "none" }),
          "h-10 px-4 py-2.5 gap-3",
        ],
        icon: "size-10 p-2.5",
        "icon-md": "size-9 p-1.5",
        "icon-sm": "size-8 px-3 py-2",
        icon_6: "size-6 p-0",
        icon_14: "size-14 p-0",
      },
      radius: {
        default: "",
        rounded: "rounded-[60px] [--hairline-radius:60px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "56",
      radius: "default",
    },
    compoundVariants: [
      {
        variant: ["link", "link-destructive"],
        className: [
          textVariants({ variant: "body", color: "none" }),
          "h-auto px-0 py-0 gap-2",
        ],
      },
      {
        variant: "dashboard",
        className: [
          textVariants({ variant: "label", color: "none" }),
          "h-auto min-h-0 gap-3 px-4 py-2.5",
        ],
      },
    ],
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant = "primary",
  size = "56",
  radius = "default",
  asChild = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, radius }),
        asChild &&
          disabled &&
          variant === "primary" &&
          "opacity-40 pointer-events-none",
        asChild &&
          disabled &&
          variant === "secondary" &&
          "bg-background-primary text-typography-secondary pointer-events-none",
        asChild &&
          disabled &&
          variant === "tertiary" &&
          "opacity-50 pointer-events-none",
        asChild &&
          disabled &&
          variant === "link" &&
          "text-gray-2 pointer-events-none",
        asChild &&
          disabled &&
          variant === "black" &&
          "opacity-10 pointer-events-none",
        asChild &&
          disabled &&
          variant === "dashboard" &&
          "opacity-40 pointer-events-none",
        asChild &&
          disabled &&
          variant === "blue" &&
          "opacity-10 pointer-events-none",
        className,
      )}
      disabled={disabled}
      aria-disabled={asChild && disabled ? true : undefined}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
