import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Upload, Lock } from 'lucide-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedButton } from '@/components/ui/button'
import { FeaturesCard } from '@/components/features-card'
import { AnimatedAlert } from '@/components/custom-alert'
import { FileUploader } from '@/components/file-uploader'

import { classifyDataset } from '@/services/attribute-classifier'

import { features } from '@/utils/constants'
import { parseCSV } from '@/utils/csv-parser'
import { setClassificationData } from '@/lib/storage'

import type { ProcessingStatus } from '@/types/props'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle')

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setProcessingStatus('idle')
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    setProcessingStatus('idle')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setProcessingStatus('error');
      return;
    }

    try {
      setProcessingStatus('processing');
      
      // Read and parse the CSV file
      const text = await selectedFile.text();
      const parsedCSV = parseCSV(text, 1000); // Parse up to 1000 rows for analysis
      
      // Classify the attributes
      const result = classifyDataset(parsedCSV);
      
      // Store data and navigate to classification page
      setClassificationData(parsedCSV, result, selectedFile.name);
      setProcessingStatus('completed');
      
      // Navigate to classification page
      navigate({ to: '/classify' });

    } catch (error) {
      console.error('Error processing file:', error);
      setProcessingStatus('error');
    }
  }


  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-6"
          >
            <Lock className="h-20 w-20 text-primary" />
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">DataPrivScore</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyze and quantify the privacy level of your datasets using advanced
            privacy-preserving models
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <FeaturesCard feature={feature} key={index} />
          ))}
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Card className="max-w-2xl mx-auto p-6">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Upload className="h-6 w-6" />
                Upload Your Dataset
              </CardTitle>
              <CardDescription>
                Upload a CSV file to begin analyzing your data's privacy level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <FileUploader
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  selectedFile={selectedFile}
                  disabled={processingStatus === 'processing'}
                />

                <AnimatedAlert
                  status={processingStatus}
                  message={undefined}
                  successMessage={`File "${selectedFile?.name}" processed successfully!`}
                  loadingMessage="Processing your dataset..."
                />

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <AnimatedButton
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={!selectedFile || processingStatus === 'processing'}
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    {processingStatus === 'processing' ? 'Processing...' : 'Analyze Privacy'}
                  </AnimatedButton>
                </motion.div>
              </form>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Your data is processed entirely in your browser. No data
                  is sent to external servers.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}