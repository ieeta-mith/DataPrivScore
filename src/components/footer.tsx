import { FileCode, BookOpen } from "lucide-react";
import { motion } from "motion/react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full relative mt-auto border-t border-gray-200 bg-white overflow-hidden">
      {/* Subtle top gradient line for a premium feel */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Copyright Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-sm text-gray-500"
          >
            &copy; {currentYear} DataPrivScore a Privacy Analysis Tool. All rights reserved.
          </motion.div>

          {/* Navigation / Links Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="flex items-center gap-4 sm:gap-6"
          >
            <motion.a
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              href="https://github.com/ieeta-mith/DataPrivScore/tree/main"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <span className="flex items-center justify-center p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                <FileCode className="h-4 w-4 text-gray-600" />
              </span>
              <span>GitHub</span>
            </motion.a>
            
            <motion.a
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              href="https://ieeta-mith.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <span className="flex items-center justify-center p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                <BookOpen className="h-4 w-4 text-gray-600" />
              </span>
              <span>Documentation</span>
            </motion.a>
          </motion.div>
          
        </div>
      </div>
    </footer>
  );
}