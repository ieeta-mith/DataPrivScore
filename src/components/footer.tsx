import { motion } from 'motion/react';
import { Github, Shield } from 'lucide-react';

export const Footer = () => {
	const currentYear = new Date().getFullYear();

	const socialLinks = [
		{ icon: Github, href: 'https://github.com/ieeta-mith', label: 'GitHub' },
	];

	return (
		<footer className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 mt-auto">
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
					{/* Brand Section */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<motion.div
								animate={{
									rotate: [0, 10, -10, 0],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									repeatDelay: 5,
								}}
							>
								<Shield className="h-6 w-6 text-primary" />
							</motion.div>
							<span className="font-semibold text-lg">Privacy Index Calculator</span>
						</div>
						<p className="text-sm text-muted-foreground">
							Empowering data privacy through advanced analysis and quantification.
						</p>
					</div>

					{/* Quick Links */}
					<div className="space-y-4">
						<h3 className="font-semibold">Quick Links</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<motion.a
									href="/"
									className="hover:text-primary transition-colors"
									whileHover={{ x: 5 }}
								>
									Home
								</motion.a>
							</li>
							<li>
								<motion.a
									href="/about"
									className="hover:text-primary transition-colors"
									whileHover={{ x: 5 }}
								>
									About
								</motion.a>
							</li>
							<li>
								<motion.a
									href="#"
									className="hover:text-primary transition-colors"
									whileHover={{ x: 5 }}
								>
									Documentation
								</motion.a>
							</li>
						</ul>
					</div>

					{/* Social Links */}
					<div className="space-y-4">
						<h3 className="font-semibold">Connect</h3>
						<div className="flex space-x-4">
							{socialLinks.map((social) => (
								<motion.a
									key={social.label}
									href={social.href}
									aria-label={social.label}
									className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
									whileHover={{ scale: 1.1, rotate: 5 }}
									whileTap={{ scale: 0.95 }}
								>
									<social.icon className="h-5 w-5" />
								</motion.a>
							))}
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<motion.div
					className="pt-6 border-t text-center text-sm text-muted-foreground"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
				>
					<p>© {currentYear} Privacy Index Calculator. Built with ❤️ for data privacy.</p>
				</motion.div>
			</div>
		</footer>
	);
};
