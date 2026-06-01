"use client";

import { Input } from "./Input";

type CalendarProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  "aria-describedby"?: string;
};

export function Calendar({ id, value, onChange, "aria-describedby": ariaDescribedBy }: CalendarProps) {
  return (
    <Input
      id={id}
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-describedby={ariaDescribedBy}
    />
  );
}
