import * as React from "react"
import { cn } from "cn"

/**
 * On the button's scale, so a field and the button beside it are one box:
 * 40px tall, `rounded-sm`, and inline padding at half the height, the same as
 * `buttonVariants`' default size. shadcn ships it at 32px and `rounded-lg`,
 * which on this project's 24px `--radius` drew a pill 8px shorter than the
 * Save next to it.
 *
 * The edge is `--border`, the hairline of a card and an outline button, not
 * `--input`: a field sat in a card drew the only dark line in it. Textarea
 * and the select's trigger take the same edge; `--input` stays for the
 * switch's track and the checkbox, which need the weight to read as controls.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-sm border border-border bg-transparent px-5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
