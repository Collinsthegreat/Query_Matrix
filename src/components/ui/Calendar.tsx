"use client";

import { Input } from "./Input";

type CalendarProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  "aria-describedby"?: string;
};

export function Calendar({ id, value, onChange, className, "aria-describedby": ariaDescribedBy }: CalendarProps) {
  return (
    <Input
      id={id}
      type="date"
      className={className}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-describedby={ariaDescribedBy}
    />
  );
}
