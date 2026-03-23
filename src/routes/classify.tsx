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
	Settings2,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { AnimatedButton } from '@/components/ui/button';
import { DatasetStats } from '@/components/classification-stats';

import { updateAttributeClassification } from '@/services/attribute-classifier';

import {
  updateClassificationResult,
	getClassificationData,
	clearClassificationData,
} from '@/lib/storage';

import type { AttributeType, ClassificationResult } from '@/types/attribute-classification';
import type { ParsedCSV } from '@/types/csv-parser';
import { TabView } from '@/components/attribute-classification/tab-view';

export const Route = createFileRoute('/classify')({
	component: ClassifyPage,
});

function ClassifyPage() {
	const navigate = useNavigate();
	const [result, setResult] = useState<ClassificationResult | null>(null);
	const [parsedCSV, setParsedCSV] = useState<ParsedCSV | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [editMode, setEditMode] = useState(false);
	const [helpDialogOpen, setHelpDialogOpen] = useState(false);

	useEffect(() => {
		const data = getClassificationData();
		if (data.result && data.parsedCSV && data.fileName) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
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

	const handleProceedToConfiguration = () => {
		navigate({ to: '/configure' });
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
							<AnimatedButton variant="ghost" size="sm" onClick={handleBack}>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</AnimatedButton>
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
					<Card className="bg-card shadow-xs border-muted">
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
								<div className="flex justify-center gap-6 py-3 text-muted-foreground">
									<span className='flex gap-2 items-center'>
										<Rows className="h-4 w-4" />
										<p className="text-md font-medium">Total Records</p>
									</span>
									<span className="text-2xl font-bold text-foreground">
										{parsedCSV?.rows.length.toLocaleString() || 0}
									</span>
								</div>
								<div className="flex justify-center gap-6 py-3 text-muted-foreground">
									<span className='flex gap-2 items-center'>
										<Columns className="h-4 w-4" />
										<p className="text-md font-medium">Total Attributes</p>
									</span>
									<span className="text-2xl font-bold text-foreground">
										{parsedCSV?.headers.length || 0}
									</span>
								</div>
								<div className="flex justify-center gap-6 py-3 text-muted-foreground">
									<span className='flex gap-2 items-center'>
										<FileText className="h-4 w-4" />
										<span className="text-md font-medium">Total Cells</span>
									</span>
									<span className="text-2xl font-bold text-foreground">
										{((parsedCSV?.rows.length || 0) * (parsedCSV?.headers.length || 0)).toLocaleString()}
									</span>
								</div>
								<div className="flex justify-center gap-6 py-3 text-muted-foreground">
									<span className='flex gap-2 items-center'>
										<TrendingUp className="h-4 w-4" />
										<span className="text-md font-medium">Avg. Confidence</span>
									</span>
									<span className="text-2xl font-bold text-foreground">
										{`${(result.summary.averageConfidence * 100).toFixed(0)}%`}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
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

				{/* Classification Views */}
				<TabView
					result={result}
					handleUpdateAttribute={handleUpdateAttribute}
					editMode={editMode}
					setEditMode={setEditMode}
					helpDialogOpen={helpDialogOpen}
					setHelpDialogOpen={setHelpDialogOpen}
				/>
				{/* Next Step */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.35 }}
					className="mt-8"
				>
					<Card className="border-2 border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
						<CardContent className="p-6">
							<div className="flex flex-col md:flex-row items-center justify-between gap-4">
								<div className="flex items-center gap-4">
									<motion.div
										className="p-3 rounded-xl bg-primary/10"
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										<Settings2 className="h-6 w-6 text-primary" />
									</motion.div>
									<div>
										<h3 className="text-lg font-semibold">Configure Privacy Analysis</h3>
										<p className="text-sm text-muted-foreground">
											Customize thresholds, select metrics, and choose which privacy techniques to detect before calculating the privacy index.
										</p>
									</div>
								</div>
								<AnimatedButton
									size="lg"
									onClick={handleProceedToConfiguration}
									className="whitespace-nowrap"
								>
									Configure & Calculate
									<ArrowRight className="h-4 w-4 ml-2" />
								</AnimatedButton>
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
