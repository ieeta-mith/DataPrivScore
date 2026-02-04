import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, InfoIcon, Loader2 } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';

import type { ProcessingStateProps } from '@/types/props';

const alertConfig = {
	processing: {
		icon: Loader2,
		variant: 'info' as const,
		defaultMessage: 'Processing...',
	},
	completed: {
		icon: CheckCircle2,
		variant: 'success' as const,
		defaultMessage: 'Operation completed successfully.',
	},
	error: {
		icon: AlertCircle,
		variant: 'destructive' as const,
		defaultMessage: 'An error occurred.',
	},
	info: {
		icon: InfoIcon,
		variant: 'info' as const,
		defaultMessage: '',
	},
};

export const AnimatedAlert = ({
	status,
	message,
	successMessage,
	errorMessage,
	loadingMessage,
}: ProcessingStateProps) => {
	if (status === 'idle') return null;

	const config = alertConfig[status as keyof typeof alertConfig];

	const displayMessage =
		message ||
		(status === 'completed'
			? successMessage
			: status === 'error'
				? errorMessage
				: status === 'processing'
					? loadingMessage
					: config.defaultMessage);

	return (
		<AnimatePresence mode="wait">
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.2 }}
			>
				<Alert variant={config.variant}>
					<config.icon className={`h-4 w-4 ${status === 'processing' ? 'animate-spin' : ''}`} />
					<AlertDescription>{displayMessage}</AlertDescription>
				</Alert>
			</motion.div>
		</AnimatePresence>
	);
};
