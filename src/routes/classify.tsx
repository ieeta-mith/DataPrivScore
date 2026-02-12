import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion } from 'motion/react';
import {
	ArrowLeft,
	ArrowRight,
	Download,
	FileSpreadsheet,
	Database,
	Columns,
	Rows,
	User,
	Users,
	Shield,
	FileText,
	TrendingUp,
	BarChart3,
	Loader2,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { AnimatedButton, Button } from '@/components/ui/button';
import { DatasetStats } from '@/components/classification-stats';

import { updateAttributeClassification } from '@/services/attribute-classifier';

import {
  updateClassificationResult,
	getClassificationData,
	clearClassificationData,
} from '@/lib/storage';

import type { AttributeType, ClassificationResult } from '@/types/attribute-classification';
import type { ParsedCSV } from '@/types/csv-parser';
import DragDropClassificationView from '@/components/drag-drop-classification-view';

export const Route = createFileRoute('/classify')({
	component: ClassifyPage,
});

function ClassifyPage() {
	const navigate = useNavigate();
	const [result, setResult] = useState<ClassificationResult | null>(null);
	const [parsedCSV, setParsedCSV] = useState<ParsedCSV | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [isCalculating, setIsCalculating] = useState(false);

	useEffect(() => {
		const data = getClassificationData();
		if (data.result && data.parsedCSV && data.fileName) {
			setResult(data.result);
			setParsedCSV(data.parsedCSV);
			setFileName(data.fileName);
		} else {
			navigate({ to: '/' });
		}
	}, [navigate]);

	const handleBack = () => {
		clearClassificationData();
		navigate({ to: '/' });
	};

	const handleUpdateAttribute = (name: string, type: AttributeType, reason?: string) => {
		if (!result) return;
		const updatedResult = updateAttributeClassification(result, name, type, reason);
		setResult(updatedResult);
		// Update stored data as well
		if (parsedCSV && fileName) updateClassificationResult(updatedResult);
	};

	const handleExportClassification = () => {
		if (!result) return;

		const exportData = {
			fileName,
			timestamp: result.timestamp,
			summary: result.summary,
			attributes: result.attributes.map((attr) => ({
				name: attr.name,
				type: attr.type,
				confidence: attr.confidence,
				isManualOverride: attr.isManualOverride,
				dataPattern: attr.dataPattern,
				reason: attr.classificationReason,
			})),
		};

		const blob = new Blob([JSON.stringify(exportData, null, 2)], {
			type: 'application/json',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `classification-${fileName?.replace('.csv', '')}-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	if (!result) {
		return (
			<div className="min-h-screen bg-linear-to-br from-background to-muted flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
					<p className="text-muted-foreground">Loading classification data...</p>
				</div>
			</div>
		);
	}

	const handleCalculatePrivacyIndex = async () => {
		if (!result || !parsedCSV || !fileName) return;

		setIsCalculating(true);

		// Use setTimeout to allow UI to update before heavy calculation
		// setTimeout(() => {
		//   try {
		//     const privacyResult = calculatePrivacyIndex({
		//       parsedCSV,
		//       classification: result,
		//     });

		//     setPrivacyResultData(privacyResult, result, parsedCSV, fileName);
		//     navigate({ to: "/results" });
		//   } catch (error) {
		//     console.error("Error calculating privacy index:", error);
		//     setIsCalculating(false);
		//   }
		// }, 100);
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-background to-muted">
			<div className="container mx-auto px-4 py-8">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="mb-8"
				>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
						<div className="flex items-center gap-4">
							<Button variant="ghost" size="sm" onClick={handleBack}>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Button>
							<div>
								<h1 className="text-2xl md:text-3xl font-bold">Attribute Classification</h1>
								<div className="flex items-center gap-2 text-muted-foreground">
									<FileSpreadsheet className="h-4 w-4" />
									<span>{fileName}</span>
									<span>•</span>
									<span>{result.summary.totalAttributes} attributes</span>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<AnimatedButton variant="outline" size="sm" onClick={handleExportClassification}>
								<Download className="h-4 w-4 mr-2" />
								Export
							</AnimatedButton>
						</div>
					</div>
				</motion.div>

				{/* Dataset Information Cards */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
					className="mb-6"
				>
					<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
						<Database className="h-5 w-5" />
						Dataset Overview
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<DatasetStats
							icon={Rows}
							label="Total Records"
							value={parsedCSV?.rows.length.toLocaleString() || 0}
							color="blue"
						/>
						<DatasetStats
							icon={Columns}
							label="Total Attributes"
							value={parsedCSV?.headers.length || 0}
							color="indigo"
						/>
						<DatasetStats
							icon={FileText}
							label="Total Cells"
							value={(
								(parsedCSV?.rows.length || 0) * (parsedCSV?.headers.length || 0)
							).toLocaleString()}
							color="cyan"
						/>
						<DatasetStats
							icon={TrendingUp}
							label="Avg. Confidence Classification"
							value={`${(result.summary.averageConfidence * 100).toFixed(0)}%`}
							color="teal"
						/>
					</div>
				</motion.div>

				{/* Classification Summary Cards */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.15 }}
					className="mb-6"
				>
					<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						Classification Summary
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<DatasetStats
							icon={User}
							label="Direct Identifiers"
							value={result.summary.directIdentifiers}
							color="red"
						/>
						<DatasetStats
							icon={Users}
							label="Quasi-Identifiers"
							value={result.summary.quasiIdentifiers}
							color="amber"
						/>
						<DatasetStats
							icon={Shield}
							label="Sensitive Attributes"
							value={result.summary.sensitiveAttributes}
							color="purple"
						/>
						<DatasetStats
							icon={FileText}
							label="Non-Sensitive Attributes"
							value={result.summary.nonSensitiveAttributes}
							color="green"
						/>
					</div>
				</motion.div>

				{/* Drag and Drop Classification View */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.25 }}
				>
					<DragDropClassificationView result={result} onUpdateAttribute={handleUpdateAttribute} />
				</motion.div>

				{/* Next Step */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.35 }}
					className="mt-8"
				>
					<Card className="p-6">
						<CardContent>
							<div className="flex flex-col md:flex-row items-center justify-between gap-4">
								<div>
									<h3 className="text-lg font-semibold">Ready to Calculate Privacy Index?</h3>
									<p className="text-sm text-muted-foreground">
										Once you're satisfied with the classifications, proceed to calculate the privacy
										index using k-anonymity, l-diversity, t-closeness, and privacy technique
										detection.
									</p>
								</div>
								<Button
									size="lg"
									onClick={handleCalculatePrivacyIndex}
									disabled={isCalculating}
									className="whitespace-nowrap"
								>
									{isCalculating ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Calculating...
										</>
									) : (
										<>
											Calculate Privacy Index
											<ArrowRight className="h-4 w-4 ml-2" />
										</>
									)}
								</Button>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Privacy Note */}
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
			</div>
		</div>
	);
}
