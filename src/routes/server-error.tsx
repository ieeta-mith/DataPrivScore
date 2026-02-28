import { motion, type Variants } from 'motion/react'
import { AlertCircle, Home } from 'lucide-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { AnimatedButton } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/server-error')({
  component: ServerErrorComponent,
})

export function ServerErrorComponent() {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate({ to: '/' })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-destructive/5 p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <motion.div
          className="relative mb-8 flex justify-center"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-destructive/20 to-destructive/5 rounded-full blur-3xl" />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10"
          >
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-linear-to-br from-destructive/30 to-destructive/10 rounded-full" />
              <AlertCircle size={80} className="text-destructive" />
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border border-destructive/20 shadow-lg p-4">
            <CardHeader className="text-center">
              <motion.div variants={itemVariants}>
                <CardTitle className="text-2xl sm:text-3xl mb-2">
                  500 - Server Error
                </CardTitle>
              </motion.div>
              <motion.div variants={itemVariants}>
                <CardDescription className="text-base leading-relaxed">
                  Something went wrong on our end. We're working to fix it.
                  Please try again in a moment.
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className='flex justify-center items-center'>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.div
                    className="flex-1"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <AnimatedButton
                      onClick={handleGoHome}
                      variant="default"
                      className="gap-2"
                      size="lg"
                    >
                      <Home size={18} />
                      Reload Page
                    </AnimatedButton>
                  </motion.div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 bg-destructive/5 rounded-full blur-3xl"
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-40 h-40 bg-destructive/5 rounded-full blur-3xl"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  )
}
