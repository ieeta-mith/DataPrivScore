import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion } from 'motion/react';
import {
	ArrowRight,
	Download,
	FileSpreadsheet,
	User,
	Users,
	Shield,
	FileText,
	BarChart3,
	Settings2,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { AnimatedButton } from '@/components/ui/button';
import { DatasetStats } from '@/components/classification-stats';

import { usePrivacyStore } from '@/lib/storage';

import { TabView } from '@/components/attribute-classification/tab-view';
import { PageHeader } from '@/components/page-header';
import { PrivacyNote } from '@/components/privacy-note';

export const Route = createFileRoute('/classify')({
	component: ClassifyPage,
});

function ClassifyPage() {
	const navigate = useNavigate();
	const {
		parsedCSV,
		classificationResult: result,
		fileName,
		clearClassificationData,
		updateAttribute
	} = usePrivacyStore();

	const [editMode, setEditMode] = useState(false);
	const [helpDialogOpen, setHelpDialogOpen] = useState(false);


	useEffect(() => {
		if (!result || !parsedCSV || !fileName) {
			navigate({ to: '/' });
		}
	}, [result, parsedCSV, fileName, navigate]);

	const handleBack = () => {
		clearClassificationData();
		navigate({ to: '/' });
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
				dataPattern: attr.dataPattern
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
				<PageHeader
					title="Attribute Classification"
					backDescription="Back to Home"
					handleFunc={handleBack}
					subTitle={
						<div className="flex items-center gap-2 text-muted-foreground">
							<FileSpreadsheet className="h-4 w-4" />
							<span>{fileName}</span>
							<span>•</span>
							<span>{result.summary.totalAttributes} attributes</span>
						</div>
					}
					actionSection={
						<AnimatedButton variant="outline" size="sm" onClick={handleExportClassification}>
							<Download className="h-4 w-4 mr-2" />
							Export
						</AnimatedButton>
					}
				/>

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

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.35 }}
				>
					<TabView
						result={result}
						handleUpdateAttribute={updateAttribute}
						editMode={editMode}
						setEditMode={setEditMode}
						helpDialogOpen={helpDialogOpen}
						setHelpDialogOpen={setHelpDialogOpen}
					/>
				</motion.div>
				<PrivacyNote />
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
									Configure
									<ArrowRight className="h-4 w-4 ml-2" />
								</AnimatedButton>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}
