import { cn } from "@/shared/lib/css";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const textVariants = cva("font-light font-bureau", {
  variants: {
    variant: {
      // New variants (STK Bureau Sans)
      h1: "text-[40px] leading-[1.1] tracking-[-0.8px]", // STK/Heading (40)
      h2: "text-[28px] leading-[1.2]", // STK/Heading-2 (28)
      h3: "text-[24px] leading-[1.2]", // STK/Heading-3 (24)
      title: "text-[20px] leading-[1.2]", // STK/Title (20)
      subtitle: "text-[18px] leading-[1.2]", // STK/Subtitle (18)
      body: "text-[16px] leading-[1.2]", // STK/Body (16)
      label: "text-[14px] leading-[1.2]", // STK/Lable (14)
      caption: "text-[12px] leading-[1.2] font-normal", // STK/Caption (12)
      small: "text-[10px] leading-[1.2] font-normal", // STK/Small (10)
    },
    weight: {
      light: "font-light", // 300
      regular: "font-normal", // 400
      bold: "font-bold", // 700
    },
    color: {
      primary: "text-typography-primary",
      secondary: "text-typography-secondary",
      inverse: "text-typography-inverse",
      darkGray: "text-gray-4", // #373737
      error: "text-red-5",
      disabled: "text-gray-2",
      none: "",
      blue5: "text-blue-5",
    },
  },
  defaultVariants: {
    variant: "body",
    weight: "light",
    color: "primary",
  },
});

export interface TextProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof textVariants> {
  as?:
    | "p"
    | "span"
    | "div"
    | "label"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "caption";
  asChild?: boolean;
  ref?: React.Ref<HTMLElement>;
}

// Use polymorphic component pattern with createElement or Slot for asChild
const Text = ({
  className,
  variant,
  weight,
  color,
  as = "p",
  asChild = false,
  ref,
  ...props
}: TextProps) => {
  const Comp = asChild ? Slot : as;

  return React.createElement(Comp, {
    ref,
    className: cn(textVariants({ variant, weight, color }), className),
    ...props,
  });
};

export { Text, textVariants };
