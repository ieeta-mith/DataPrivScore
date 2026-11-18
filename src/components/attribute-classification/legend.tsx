import { cn } from "@/lib/utils"
import { CONFIDENCE_COLOR } from "@/utils/constants"

export const ClassificationLegend = () => {
  return (
    <div className="flex flex-row gap-3 pt-3">
			{CONFIDENCE_COLOR.map((item, idx) => (
				<div className="flex items-center gap-2" key={idx}>
					<div key={idx} className={cn("flex items-center py-1 px-2 rounded-md", item.color)}>
						{item.label}
					</div>
					<span className="text-sm text-muted-foreground">
						{item.description}
					</span>
				</div>
			))}
		</div>
  )
}