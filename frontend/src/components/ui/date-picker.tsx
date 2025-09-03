"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
  maxDate?: string;
  minDate?: string;
}

export function DatePicker({
  value = "",
  onChange,
  placeholder = "Selecione uma data",
  className,
  maxDate,
  minDate
}: DatePickerProps) {
  const dateValue = value ? new Date(value + "T00:00:00") : undefined;

  const maxDateObj = maxDate ? new Date(maxDate + "T00:00:00") : undefined;
  const minDateObj = minDate ? new Date(minDate + "T00:00:00") : undefined;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const isoString = selectedDate.toISOString().split('T')[0];
      onChange?.(isoString);
    } else {
      onChange?.("");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-10 pl-3 pr-3 justify-start text-left font-normal",
            !dateValue && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {dateValue ? (
              format(dateValue, "dd/MM/yyyy", { locale: ptBR })
            ) : (
              placeholder
            )}
          </span>
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleDateSelect}
          locale={ptBR}
          disabled={(date) => {
            if (maxDateObj && date > maxDateObj) return true;
            if (minDateObj && date < minDateObj) return true;
            return false;
          }}
          initialFocus
          captionLayout="dropdown"
          fromYear={minDateObj?.getFullYear() || 1920}
          toYear={maxDateObj?.getFullYear() || new Date().getFullYear()}
          labels={{
            labelMonthDropdown: () => "Mês",
            labelYearDropdown: () => "Ano",
          }}
          classNames={{
            caption: "flex items-center justify-center gap-2",
            caption_label: "sr-only",
            head_cell: "w-8 text-[0.75rem] text-muted-foreground",
            day: "h-8 w-8 p-0",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            nav_button_previous: "absolute left-3",
            nav_button_next: "absolute right-3",
          }}
        />
      </PopoverContent>
    </Popover>
  )
}