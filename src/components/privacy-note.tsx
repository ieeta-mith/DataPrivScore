import { motion } from "motion/react"

export const PrivacyNote = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
			transition={{ duration: 0.3, delay: 0.45 }}
			className="mt-6 text-center"
    >
			<p className="text-sm text-muted-foreground">
				🔒 All processing happens in your browser. No data is sent to external servers.
			</p>
    </motion.div>
  )
}
