"use client";

import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import type { ComplexityResult } from "@/lib/complexity";

export function ComplexityBadge({ complexity }: { complexity: ComplexityResult }) {
  return (
    <Tooltip
      content={
        <div className="space-y-1">
          <div className="font-semibold">Complexity breakdown</div>
          <div>Rules: {complexity.breakdown.rules}</div>
          <div>Groups: {complexity.breakdown.groups}</div>
          <div>Depth: {complexity.breakdown.depth}</div>
          <div>Logic switches: {complexity.breakdown.logicSwitches}</div>
        </div>
      }
    >
      <Badge tone={complexity.label === "Simple" ? "success" : complexity.label === "Expert" ? "danger" : "warning"} className="gap-2">
        <span aria-hidden="true" className="grid grid-cols-4 gap-0.5">
          {Array.from({ length: 4 }, (_, index) => (
            <span
              key={index}
              className="h-3 w-1 rounded-full bg-current opacity-30 data-[active=true]:opacity-100"
              data-active={index < Math.ceil(complexity.score / 25)}
            />
          ))}
        </span>
        {complexity.label} {complexity.score}
      </Badge>
    </Tooltip>
  );
}
