import { LockKeyhole } from "lucide-react"
import { motion } from "motion/react"

export const PrivacyNote = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
			transition={{ duration: 0.3, delay: 0.45 }}
			className="mt-7 text-center"
    >
			<p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
			  <LockKeyhole className="h-5 w-5 text-yellow-600" /> All processing happens in your browser. No data is sent to external servers.
			</p>
    </motion.div>
  )
}
