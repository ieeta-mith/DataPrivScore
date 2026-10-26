import type { ReIdentificationRiskResult } from './types';
import type { MetricStatus } from '@/types/privacy-plugins';

export function calculateRisks(
	kMin: number,
	kAvg: number,
	nData: number,
	nPop?: number
): ReIdentificationRiskResult {
	// Prosecuter risk
	const rp = kMin > 0 ? (1 / kMin) * 100 : 100;

	// Journalist risk
	let rho = 1.0;
	if (nPop && nPop >= nData) {
		rho = nData / nPop;
	}

	const rj = rp * rho;

	// Marketer risk
	const rm = kAvg > 0 ? (1 / kAvg) * 100 : 100;

	const maxRisk = Math.max(rp, rj, rm);
	const score = Math.max(0, 100 - maxRisk);

	return {
		prosecutorRisk: rp,
		journalistRisk: rj,
		marketerRisk: rm,
		maxRisk,
		samplingFraction: rho,
		score,
		kMin,
		kAvg,
	};
}

export function getRiskStatus(score: number): MetricStatus {
	if (score >= 70) return 'pass';
	if (score >= 40) return 'warning';
	return 'fail';
}

export function generateRiskInsights(result: ReIdentificationRiskResult): string[] {
	const insights: string[] = [];

	if (result.maxRisk === result.prosecutorRisk) {
		insights.push(`Prosecutor risk is the primary vulnerability (${result.prosecutorRisk.toFixed(1)}%).`);
  }

	if (result.samplingFraction === 1.0) {
		insights.push(`Using worst-case baseline for Journalist risk (population size undefined).`);
	} else {
		insights.push(`Journalist risk scaled by dataset sampling fraction (${(result.samplingFraction * 100).toFixed(4)}%).`);
	}

	return insights;
}
