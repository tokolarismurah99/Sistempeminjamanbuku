import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-slate-600 placeholder:text-gray-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 aria-invalid:ring-destructive/20 aria-invalid:border-destructive bg-slate-800 flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base text-gray-100 transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
