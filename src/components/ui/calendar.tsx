"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react@0.487.0";
import { DayPicker } from "react-day-picker@8.10.1";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium text-gray-100",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600 hover:text-gray-100 p-0 opacity-70 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-gray-400 rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm text-gray-100 focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-slate-700 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal text-gray-100 hover:bg-slate-700 hover:text-emerald-400 aria-selected:opacity-100",
        ),
        day_range_start:
          "day-range-start aria-selected:bg-emerald-600 aria-selected:text-white",
        day_range_end:
          "day-range-end aria-selected:bg-emerald-600 aria-selected:text-white",
        day_selected:
          "bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white focus:bg-emerald-600 focus:text-white",
        day_today: "bg-slate-700 text-emerald-400 border border-emerald-500/50",
        day_outside:
          "day-outside text-gray-600 aria-selected:text-gray-500",
        day_disabled: "text-gray-600 opacity-50",
        day_range_middle:
          "aria-selected:bg-slate-700 aria-selected:text-emerald-400",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
