import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { HomeIcon, LockKeyhole } from 'lucide-react';
import { motion } from 'motion/react';

export const Navbar = () => {
	return (
		<motion.nav
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ type: 'spring', stiffness: 100, damping: 20 }}
			className="w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50"
		>
			<div className="container mx-auto px-4 py-3">
				<div className="flex items-center justify-between">
					{/* Logo/Brand */}
					<motion.div
						className="flex items-center space-x-2"
						whileHover={{ scale: 1.05 }}
						transition={{ type: 'spring', stiffness: 400, damping: 10 }}
					>
						<motion.div
							animate={{
								rotate: [0, 10, -10, 0],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								repeatDelay: 3,
							}}
						>
							<LockKeyhole className="h-6 w-6 text-primary" />
						</motion.div>
						<span className="font-semibold text-lg bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
							Privacy Index Calculator
						</span>
					</motion.div>

					{/* Navigation Links */}
					<div className="flex items-center space-x-1">
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button variant="ghost" size="sm" asChild>
								<Link
									to="/"
									className="[&.active]:bg-accent [&.active]:text-accent-foreground relative overflow-hidden group"
								>
									<motion.div
										className="absolute inset-0 bg-linear-to-r from-primary/10 to-primary/5"
										initial={{ x: '-100%' }}
										whileHover={{ x: 0 }}
										transition={{ duration: 0.3 }}
									/>
									<HomeIcon className="h-4 w-4 mr-2 relative z-10" />
									<span className="relative z-10">Home</span>
								</Link>
							</Button>
						</motion.div>
					</div>
				</div>
			</div>

			{/* Animated border bottom */}
			<motion.div
				className="h-0.5 bg-linear-to-r from-transparent via-primary to-transparent"
				initial={{ scaleX: 0 }}
				animate={{ scaleX: 1 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			/>
		</motion.nav>
	);
};
