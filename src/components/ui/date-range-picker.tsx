// src/components/ui/date-range-picker.tsx
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";

export type { DateRange };

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  presets?: { label: string; days: number; isMonth?: boolean }[];
  showCompare?: boolean;
  compareRange?: DateRange;
  onCompareRangeChange?: (dateRange: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  align?: "start" | "center" | "end";
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  presets = [
    { label: "Today", days: 0 },
    { label: "Yesterday", days: 1 },
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
    { label: "Last year", days: 365 },
    { label: "This month", days: 0, isMonth: true },
    { label: "Last month", days: 30, isMonth: true },
  ],
  showCompare = false,
  compareRange,
  onCompareRangeChange,
  minDate,
  maxDate,
  disabled = false,
  placeholder = "Pick a date range",
  className,
  align = "center",
  ...props
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    dateRange.from || new Date()
  );

  // Handle preset selection
  const handlePresetSelect = (preset: { label: string; days?: number; isMonth?: boolean; value?: string | { days: number } }) => {
    const today = new Date();
    let from: Date;
    let to: Date = today;

    if (preset.isMonth) {
      if (preset.label === "This month") {
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      } else {
        // Last month
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        from = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        to = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
      }
    } else {
      from = new Date(today);
      from.setDate(today.getDate() - preset.days);
    }

    onDateRangeChange({ from, to });

    // If compare mode is enabled, set the previous period for comparison
    if (showCompare && onCompareRangeChange) {
      const compareFrom = new Date(from);
      const compareTo = new Date(to);
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      compareFrom.setDate(compareFrom.getDate() - diffDays);
      compareTo.setDate(compareTo.getDate() - diffDays);

      onCompareRangeChange({ from: compareFrom, to: compareTo });
    }

    setIsOpen(false);
  };

  // Format display text
  const formatDisplayText = () => {
    if (!dateRange.from && !dateRange.to) {
      return placeholder;
    }

    if (dateRange.from && dateRange.to) {
      const fromStr = format(dateRange.from, "MMM dd, yyyy");
      const toStr = format(dateRange.to, "MMM dd, yyyy");
      
      if (fromStr === toStr) {
        return fromStr;
      }
      
      return `${fromStr} - ${toStr}`;
    }

    if (dateRange.from) {
      return `From ${format(dateRange.from, "MMM dd, yyyy")}`;
    }

    return placeholder;
  };

  // Calculate number of days in range
  const getDaysInRange = () => {
    if (!dateRange.from || !dateRange.to) return 0;
    const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Navigate months in calendar
  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDisplayText()}
            {dateRange.from && dateRange.to && (
              <span className="ml-auto text-xs text-muted-foreground">
                {getDaysInRange()} days
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="flex flex-col sm:flex-row">
            {/* Preset sidebar */}
            <div className="border-r p-4 bg-gray-50 dark:bg-gray-900">
              <div className="space-y-1">
                <h4 className="text-sm font-medium mb-3">Quick Select</h4>
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              
              {showCompare && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium mb-3">Compare With</h4>
                  <Select
                    defaultValue="previous"
                    onValueChange={(value) => {
                      if (value === "previous" && dateRange.from && dateRange.to) {
                        const diffTime = dateRange.to.getTime() - dateRange.from.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        const compareFrom = new Date(dateRange.from);
                        const compareTo = new Date(dateRange.to);
                        compareFrom.setDate(compareFrom.getDate() - diffDays);
                        compareTo.setDate(compareTo.getDate() - diffDays);
                        
                        onCompareRangeChange?.({
                          from: compareFrom,
                          to: compareTo,
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="previous">Previous Period</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                      <SelectItem value="none">No Comparison</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Calendar */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => navigateMonth("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                  {format(currentMonth, "MMMM yyyy")}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => navigateMonth("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      if (range) {
                        onDateRangeChange({
                          from: range.from ?? undefined,
                          to: range.to ?? undefined,
                        });
                      }
                    }}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    numberOfMonths={1}
                    className="p-0"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: cn(
                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                      ),
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell:
                        "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: cn(
                        "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                      ),
                      day_range_end: "day-range-end",
                      day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day_outside:
                        "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                      day_disabled: "text-muted-foreground opacity-50",
                      day_range_middle:
                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      day_hidden: "invisible",
                    }}
                  />
                </div>
                
                <div className="flex flex-col space-y-4">
                  {/* Selected range display */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Selected Range</h4>
                    <div className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">From:</span>
                        <span className="font-medium">
                          {dateRange.from ? format(dateRange.from, "PP") : "Not selected"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-muted-foreground">To:</span>
                        <span className="font-medium">
                          {dateRange.to ? format(dateRange.to, "PP") : "Not selected"}
                        </span>
                      </div>
                      {dateRange.from && dateRange.to && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Days:</span>
                            <span className="font-medium">{getDaysInRange()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        onDateRangeChange({ from: undefined, to: undefined });
                        if (showCompare) {
                          onCompareRangeChange?.({ from: undefined, to: undefined });
                        }
                        setIsOpen(false);
                      }}
                      variant="outline"
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        onDateRangeChange({ from: today, to: today });
                        setIsOpen(false);
                      }}
                    >
                      Apply Today
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Quick date picker variant (simpler)
interface QuickDatePickerProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  className?: string;
}

export function QuickDatePicker({ value, onChange, className }: QuickDatePickerProps) {
  const presets = [
    { label: "Today", value: { days: 0 } },
    { label: "Yesterday", value: { days: 1 } },
    { label: "Last 7d", value: { days: 7 } },
    { label: "Last 30d", value: { days: 30 } },
    { label: "Last 90d", value: { days: 90 } },
    { label: "Custom", value: "custom" },
  ];

  const handlePresetSelect = (preset: { label: string; value: { days: number } | string }) => {
    if (preset.value === "custom") {
      // Open full date range picker
      return;
    }

    const today = new Date();
    const from = new Date(today);
    const days = typeof preset.value === "object" ? preset.value.days : 0;
    from.setDate(today.getDate() - days);

    onChange({ from, to: today });
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {presets.map((preset) => {
        const isActive =
          preset.value !== "custom" &&
          value.from &&
          value.to &&
          typeof preset.value === "object" &&
          format(value.from, "yyyy-MM-dd") ===
            format(
              new Date(
                new Date().setDate(
                  new Date().getDate() - (preset.value.days || 0)
                )
              ),
              "yyyy-MM-dd"
            );

        return (
          <Button
            key={preset.label}
            variant={isActive ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => handlePresetSelect(preset)}
          >
            {preset.label}
          </Button>
        );
      })}
    </div>
  );
}