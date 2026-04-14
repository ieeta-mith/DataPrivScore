import type { ReactNode } from "react";
import { motion } from "motion/react"
import { AnimatedButton } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
	title: string;
	handleFunc: () => void;
	backDescription: string;
	subTitle: ReactNode;
	actionSection: ReactNode;
}

export const PageHeader = ({ title, backDescription, handleFunc, subTitle, actionSection }: PageHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="mb-8"
    >
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
				<div className="flex items-center gap-4">
					<AnimatedButton variant="ghost" size="sm" onClick={handleFunc}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						{backDescription}
					</AnimatedButton>
					<div>
						<h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
						{subTitle}
					</div>
				</div>
				<div className="flex items-center gap-2">
					{actionSection}
				</div>
			</div>
    </motion.div>
  )
}