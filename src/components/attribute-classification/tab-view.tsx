import { motion } from "motion/react"
import { LayoutGrid, List } from "lucide-react"

import DragDropClassificationView from "@/components/attribute-classification/drag-drop-classification-view"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TableClassificationView } from "@/components/attribute-classification/table-classification-view"

import type { AttributeType, ClassificationResult } from "@/types/attribute-classification";
import { ClassificationBar } from "@/components/attribute-classification/classification-bar";

interface TabViewProps {
	result: ClassificationResult;
	handleUpdateAttribute: (name: string, type: AttributeType, reason?: string) => void;
	editMode: boolean;
	setEditMode: (value: boolean) => void;
	helpDialogOpen: boolean;
	setHelpDialogOpen: (value: boolean) => void;
}

export const TabView = ({
	result,
	handleUpdateAttribute,
	editMode,
	setEditMode,
	helpDialogOpen,
	setHelpDialogOpen,
}: TabViewProps) => {
	return (
		<Tabs defaultValue="card">
			<div className="flex flex-row w-full justify-between space-x-10 items-center">
				<TabsList className="py-7 px-3">
					<TabsTrigger value="card" className="p-5">
						<LayoutGrid className="h-4 w-4" />
						Grid View
					</TabsTrigger>
					<TabsTrigger value="table" className="p-5">
						<List className="h-4 w-4" />
						Table View
					</TabsTrigger>
				</TabsList>
				<ClassificationBar
					editMode={editMode}
					setEditMode={setEditMode}
					helpDialogOpen={helpDialogOpen} 
					setHelpDialogOpen={setHelpDialogOpen} 
				/>
			</div>
			<TabsContent value="card">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.25 }}
					className="pt-4"
				>
					<DragDropClassificationView 
						result={result} 
						onUpdateAttribute={handleUpdateAttribute} 
						editMode={editMode} 
					/>
				</motion.div>
			</TabsContent>
			<TabsContent value="table">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.25 }}
					className="pt-4"
				>
					<TableClassificationView 
						result={result} 
						onUpdateAttribute={handleUpdateAttribute} 
						editMode={editMode} 
					/>
				</motion.div>
			</TabsContent>
		</Tabs>
	)
}