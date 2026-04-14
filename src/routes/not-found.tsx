import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { Home } from 'lucide-react';

import { AnimatedButton } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { containerVariants, itemVariants } from '@/utils/constants';

export const Route = createFileRoute('/not-found')({
	component: NotFoundComponent,
});

export function NotFoundComponent() {
	const navigate = useNavigate();
	const handleGoHome = () => {
		navigate({ to: '/' });
	};
	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="w-full max-w-md"
			>
				<motion.div
					className="relative mb-8 flex justify-center"
					animate={{ rotate: 360 }}
					transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
				>
					<div className="absolute inset-0 bg-linear-to-r from-primary/20 to-primary/5 rounded-full blur-3xl" />
					<motion.div
						animate={{ y: [0, -20, 0] }}
						transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
						className="relative z-10"
					>
						<div className="relative w-40 h-40 flex items-center justify-center">
							<div className="absolute inset-0 bg-linear-to-br from-primary/30 to-primary/10 rounded-full" />
							<div className="text-7xl font-black text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">
								404
							</div>
						</div>
					</motion.div>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className="border border-primary/20 shadow-lg p-4">
						<CardHeader className="text-center">
							<motion.div variants={itemVariants}>
								<CardTitle className="text-2xl sm:text-3xl mb-2">Page Not Found</CardTitle>
							</motion.div>
							<motion.div variants={itemVariants}>
								<CardDescription className="text-base leading-relaxed">
									Oops! The page you're looking for doesn't exist.
								</CardDescription>
							</motion.div>
						</CardHeader>

						<CardContent className="flex items-center justify-center">
							<motion.div
								variants={containerVariants}
								initial="hidden"
								animate="visible"
								className="space-y-3"
							>
								<div className="flex flex-col sm:flex-row gap-3">
									<motion.div
										className="flex-1"
										variants={itemVariants}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<AnimatedButton onClick={handleGoHome} className="gap-2" size="lg">
											<Home size={18} />
											Back Home
										</AnimatedButton>
									</motion.div>
								</div>
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>
		</div>
	);
}
