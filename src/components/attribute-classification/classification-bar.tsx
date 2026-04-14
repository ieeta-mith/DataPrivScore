import { motion } from 'motion/react';

import { AnimatedButton } from '@/components/ui/button';
import { HelpDialogClassification } from '@/components/help-dialogs/classification';

import { 
	HelpCircle, 
	Lock, 
	Unlock,
} from 'lucide-react';


interface ClassificationBarProps {
	editMode: boolean;
	setEditMode: (editMode: boolean) => void;
	helpDialogOpen: boolean;
	setHelpDialogOpen: (open: boolean) => void;
}

export const ClassificationBar = ( {
	editMode,
	setEditMode,
	helpDialogOpen,
	setHelpDialogOpen,
}: ClassificationBarProps) => {
  return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 0.2 }}
			className='flex flex-row justify-between w-full'
		>
			<div className="flex items-center w-full justify-between p-3 bg-muted/30 rounded-lg border">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span>
							{editMode 
								? 'Select a new type to reclassify attributes' 
								: 'Enable edit mode to modify classifications'}
						</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<AnimatedButton
						variant="ghost"
						size="sm"
						onClick={() => setHelpDialogOpen(true)}
						className="gap-2"
					>
						<HelpCircle className="h-4 w-4" />
						Help Guide
					</AnimatedButton>
					<AnimatedButton
						variant={editMode ? 'default' : 'outline'}
						size="sm"
						onClick={() => setEditMode(!editMode)}
						className={`gap-2 transition-all ${editMode ? 'shadow-md' : ''}`}
					>
						{editMode ? (
							<>
								<Unlock className="h-4 w-4" />
								Editing
							</>
						) : (
							<>
								<Lock className="h-4 w-4" />
								Edit Mode
							</>
						)}
					</AnimatedButton>
				</div>
			</div>
			<HelpDialogClassification 
        helpDialogOpen={helpDialogOpen}
        setHelpDialogOpen={setHelpDialogOpen}
      />
		</motion.div>
  );
}