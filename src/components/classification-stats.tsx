import { createElement } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { DatasetStatsProps } from "@/types/props";

export const DatasetStats = ({
    icon,
    label,
    value,
    color,
}: DatasetStatsProps) => {
    const colorMap = {
    blue: {
      border: "border-l-blue-500",
      bg: "bg-blue-500/10",
      text: "text-blue-500",
    },
    indigo: {
      border: "border-l-indigo-500",
      bg: "bg-indigo-500/10",
      text: "text-indigo-500",
    },
    cyan: {
      border: "border-l-cyan-500",
      bg: "bg-cyan-500/10",
      text: "text-cyan-500",
    },
    teal: {
      border: "border-l-teal-500",
      bg: "bg-teal-500/10",
      text: "text-teal-500",
    },
    amber: {
      border: "border-l-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-500",
    },
    purple: {
      border: "border-l-purple-500",
      bg: "bg-purple-500/10",
      text: "text-purple-500",
    },
    red: {
      border: "border-l-red-500",
      bg: "bg-red-500/10",
      text: "text-red-500",
    },
    green: {
      border: "border-l-green-500",
      bg: "bg-green-500/10",
      text: "text-green-500",
    },
  };
	const colors = colorMap[color as keyof typeof colorMap];
	return (
		<Card className={`border-l-4 ${colors.border}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            {createElement(icon, { className: `h-6 w-6 ${colors.text}` })}
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
	)
}