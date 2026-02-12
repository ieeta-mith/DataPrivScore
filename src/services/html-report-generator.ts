import type { PrivacyIndexResult, PrivacyRecommendation, RiskFactor, DetectedTechnique } from "@/types/privacy-analysis";

interface ReportOptions {
  fileName: string | null;
  timestamp: Date;
  includeDarkMode?: boolean;
}

export function generateHTMLReport(result: PrivacyIndexResult, options: ReportOptions): string {
  const { fileName, timestamp } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Analysis Report - ${fileName || "Dataset"}</title>
  ${generateStyles()}
</head>
<body>
  <div class="container">
    ${generateHeader(result, fileName, timestamp)}
    ${generateScoreCard(result)}
    ${generateMetricsBreakdown(result)}
    ${generateKAnonymitySection(result)}
    ${generateLDiversitySection(result)}
    ${generateTClosenessSection(result)}
    ${generateTechniquesSection(result)}
    ${generateRiskSection(result)}
    ${generateRecommendationsSection(result)}
    ${generateFooter(result, timestamp)}
  </div>
</body>
</html>`;
}

function generateStyles(): string {
  return `<style>
  :root {
    --color-background: #ffffff;
    --color-foreground: #1a1a1a;
    --color-muted: #f5f5f5;
    --color-muted-foreground: #737373;
    --color-border: #e5e5e5;
    --color-card: #ffffff;
    --color-card-foreground: #1a1a1a;
    
    --color-emerald-500: #10b981;
    --color-emerald-50: #ecfdf5;
    --color-green-500: #22c55e;
    --color-green-50: #f0fdf4;
    --color-yellow-500: #eab308;
    --color-yellow-50: #fefce8;
    --color-orange-500: #f97316;
    --color-orange-50: #fff7ed;
    --color-red-500: #ef4444;
    --color-red-50: #fef2f2;
    --color-blue-500: #3b82f6;
    --color-blue-50: #eff6ff;
    
    --radius: 0.625rem;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: linear-gradient(135deg, var(--color-background) 0%, var(--color-muted) 100%);
    color: var(--color-foreground);
    line-height: 1.6;
    min-height: 100vh;
    padding: 2rem 1rem;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Header */
  .header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .header h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-foreground);
  }

  .header .subtitle {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
  }

  /* Cards */
  .card {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    margin-bottom: 1.5rem;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .card-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .card-header h2 {
    font-size: 1.125rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .card-content {
    padding: 1.5rem;
  }

  /* Score Card */
  .score-card {
    margin-bottom: 2rem;
  }

  .score-card .grade-bar {
    height: 0.5rem;
  }

  .score-card-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    align-items: center;
  }

  @media (max-width: 768px) {
    .score-card-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }

  .score-circle-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .score-circle {
    position: relative;
    width: 160px;
    height: 160px;
  }

  .score-circle svg {
    transform: rotate(-90deg);
    width: 100%;
    height: 100%;
  }

  .score-circle-bg {
    fill: none;
    stroke: var(--color-muted);
    stroke-width: 12;
  }

  .score-circle-value {
    fill: none;
    stroke-width: 12;
    stroke-linecap: round;
  }

  .score-text {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .score-number {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1;
  }

  .score-label {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
  }

  .grade-letter {
    font-size: 3.75rem;
    font-weight: 700;
    margin-top: 1rem;
    line-height: 1;
  }

  .grade-label {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
    margin-top: 0.25rem;
  }

  /* Risk Level */
  .risk-level {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .risk-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius);
    font-weight: 600;
    text-transform: capitalize;
    font-size: 1.125rem;
  }

  .risk-probability {
    margin-top: 0.75rem;
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
  }

  /* Quick Stats */
  .quick-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .quick-stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: var(--color-muted);
    border-radius: calc(var(--radius) - 2px);
    font-size: 0.875rem;
  }

  .quick-stat-icon {
    width: 1rem;
    height: 1rem;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .stats-grid-4 {
    grid-template-columns: repeat(4, 1fr);
  }

  .stats-grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    .stats-grid-4,
    .stats-grid-3 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .stat-card {
    background: var(--color-muted);
    padding: 1rem;
    border-radius: calc(var(--radius) - 2px);
    text-align: center;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-foreground);
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--color-muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Badges */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 9999px;
    text-transform: capitalize;
  }

  .badge-safe {
    background: var(--color-emerald-50);
    color: var(--color-emerald-500);
    border: 1px solid var(--color-emerald-500);
  }

  .badge-violated {
    background: var(--color-red-50);
    color: var(--color-red-500);
    border: 1px solid var(--color-red-500);
  }

  .badge-quasi {
    background: var(--color-yellow-50);
    color: var(--color-yellow-500);
    border: 1px solid var(--color-yellow-500);
  }

  .badge-sensitive {
    background: var(--color-red-50);
    color: var(--color-red-500);
    border: 1px solid var(--color-red-500);
  }

  .badge-secondary {
    background: var(--color-muted);
    color: var(--color-foreground);
    border: 1px solid var(--color-border);
  }

  .badge-outline {
    background: transparent;
    color: var(--color-muted-foreground);
    border: 1px solid var(--color-border);
  }

  /* Metrics Grid */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
  }

  @media (max-width: 1024px) {
    .metrics-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 640px) {
    .metrics-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .metric-card {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 1rem;
  }

  .metric-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .metric-name {
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .metric-status {
    width: 1rem;
    height: 1rem;
  }

  .metric-score {
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .metric-bar {
    width: 100%;
    height: 0.5rem;
    background: var(--color-muted);
    border-radius: 9999px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .metric-bar-fill {
    height: 100%;
    border-radius: 9999px;
  }

  .metric-details {
    font-size: 0.75rem;
    color: var(--color-muted-foreground);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Info Cards */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .info-grid {
      grid-template-columns: 1fr;
    }
  }

  .info-card {
    background: var(--color-muted);
    border-radius: calc(var(--radius) - 2px);
    padding: 1rem;
  }

  .info-card h4 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .badge-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .distribution-list {
    max-height: 8rem;
    overflow-y: auto;
  }

  .distribution-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    padding: 0.25rem 0;
  }

  /* Warning Box */
  .warning-box {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    background: var(--color-orange-50);
    border: 1px solid var(--color-orange-500);
    border-radius: var(--radius);
    padding: 1rem;
  }

  .warning-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-orange-500);
    flex-shrink: 0;
  }

  .warning-content h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-orange-500);
    margin-bottom: 0.25rem;
  }

  .warning-content p {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
  }

  /* Technique Cards */
  .techniques-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .techniques-grid {
      grid-template-columns: 1fr;
    }
  }

  .technique-card {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 1rem;
  }

  .technique-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .technique-name {
    font-weight: 600;
    text-transform: capitalize;
  }

  .technique-description {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
    margin-bottom: 0.5rem;
  }

  .technique-confidence {
    font-size: 0.75rem;
    color: var(--color-muted-foreground);
    margin-top: 0.5rem;
  }

  /* Risk Factors */
  .risk-factors {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .risk-factors h4 {
    padding: 1rem;
    font-weight: 600;
    border-bottom: 1px solid var(--color-border);
  }

  .risk-factor {
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .risk-factor:last-child {
    border-bottom: none;
  }

  .risk-factor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .risk-factor-name {
    font-weight: 500;
    font-size: 0.875rem;
  }

  .risk-factor-description {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
    margin-bottom: 0.25rem;
  }

  .risk-factor-mitigation {
    font-size: 0.75rem;
    color: var(--color-blue-500);
  }

  /* Recommendations */
  .recommendations-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .recommendation-card {
    border-radius: var(--radius);
    border: 1px solid var(--color-border);
    border-left-width: 4px;
    padding: 1rem;
  }

  .recommendation-card.critical {
    border-left-color: var(--color-red-500);
    background: var(--color-red-50);
  }

  .recommendation-card.high {
    border-left-color: var(--color-orange-500);
    background: var(--color-orange-50);
  }

  .recommendation-card.medium {
    border-left-color: var(--color-yellow-500);
    background: var(--color-yellow-50);
  }

  .recommendation-card.low {
    border-left-color: var(--color-blue-500);
    background: var(--color-blue-50);
  }

  .recommendation-badges {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .recommendation-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .recommendation-description {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
    margin-bottom: 0.5rem;
  }

  .recommendation-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: var(--color-muted-foreground);
    margin-bottom: 0.75rem;
  }

  .recommendation-action {
    background: var(--color-muted);
    padding: 0.5rem;
    border-radius: calc(var(--radius) - 2px);
    font-size: 0.875rem;
  }

  /* Success Box */
  .success-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    border: 2px dashed var(--color-border);
    border-radius: var(--radius);
    text-align: center;
    color: var(--color-muted-foreground);
  }

  .success-icon {
    width: 2rem;
    height: 2rem;
    color: var(--color-green-500);
    margin-bottom: 0.5rem;
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    border: 2px dashed var(--color-border);
    border-radius: var(--radius);
    text-align: center;
    color: var(--color-muted-foreground);
  }

  .empty-icon {
    width: 2rem;
    height: 2rem;
    margin-bottom: 0.5rem;
  }

  /* Footer */
  .footer {
    text-align: center;
    padding: 1.5rem;
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
    border-top: 1px solid var(--color-border);
    margin-top: 2rem;
  }

  /* Color classes */
  .text-emerald { color: var(--color-emerald-500); }
  .text-green { color: var(--color-green-500); }
  .text-yellow { color: var(--color-yellow-500); }
  .text-orange { color: var(--color-orange-500); }
  .text-red { color: var(--color-red-500); }

  .bg-emerald { background-color: var(--color-emerald-500); }
  .bg-green { background-color: var(--color-green-500); }
  .bg-yellow { background-color: var(--color-yellow-500); }
  .bg-orange { background-color: var(--color-orange-500); }
  .bg-red { background-color: var(--color-red-500); }

  /* Risk level backgrounds */
  .risk-minimal {
    background: var(--color-emerald-50);
    color: var(--color-emerald-500);
  }
  .risk-low {
    background: var(--color-green-50);
    color: var(--color-green-500);
  }
  .risk-medium {
    background: var(--color-yellow-50);
    color: var(--color-yellow-500);
  }
  .risk-high {
    background: var(--color-orange-50);
    color: var(--color-orange-500);
  }
  .risk-critical {
    background: var(--color-red-50);
    color: var(--color-red-500);
  }

  /* Print styles */
  @media print {
    body {
      background: white;
      padding: 0;
    }
    .card {
      break-inside: avoid;
      box-shadow: none;
    }
  }
</style>`;
}

function getGradeColorClass(grade: string): string {
  const gradeColors: Record<string, string> = {
    A: "emerald",
    B: "green",
    C: "yellow",
    D: "orange",
    F: "red",
  };
  return gradeColors[grade] || "gray";
}

function getStatusColorClass(status: string): string {
  const statusColors: Record<string, string> = {
    pass: "green",
    warning: "yellow",
    fail: "red",
  };
  return statusColors[status] || "gray";
}

function getIcon(name: string, className: string = ""): string {
  const icons: Record<string, string> = {
    users: `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    pieChart: `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
    activity: `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>`,
    lock: `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    target: `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    lightbulb: `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
    barChart: `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
    shield: `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
    eyeOff: `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>`,
    trendingUp: `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  };
  return icons[name] || "";
}

function generateHeader(result: PrivacyIndexResult, fileName: string | null, timestamp: Date): string {
  return `
    <div class="header">
      <h1>🔐 Privacy Analysis Report</h1>
      <p class="subtitle">
        ${fileName || "Dataset"} • ${result.metadata.recordCount.toLocaleString()} records • ${result.metadata.attributeCount} attributes • Generated on ${timestamp.toLocaleString()}
      </p>
    </div>
  `;
}

function generateScoreCard(result: PrivacyIndexResult): string {
  const gradeColor = getGradeColorClass(result.grade);
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (circumference * result.overallScore) / 100;

  return `
    <div class="card score-card">
      <div class="grade-bar bg-${gradeColor}"></div>
      <div class="card-content">
        <div class="score-card-grid">
          <!-- Score Circle -->
          <div class="score-circle-container">
            <div class="score-circle">
              <svg viewBox="0 0 160 160">
                <circle class="score-circle-bg" cx="80" cy="80" r="70"/>
                <circle class="score-circle-value text-${gradeColor}" cx="80" cy="80" r="70"
                  stroke-dasharray="${circumference}"
                  stroke-dashoffset="${offset}"
                  style="stroke: var(--color-${gradeColor}-500)"/>
              </svg>
              <div class="score-text">
                <span class="score-number text-${gradeColor}">${result.overallScore}</span>
                <span class="score-label">out of 100</span>
              </div>
            </div>
            <div class="grade-letter text-${gradeColor}">${result.grade}</div>
            <p class="grade-label">Privacy Grade</p>
          </div>

          <!-- Risk Level -->
          <div class="risk-level">
            <div class="risk-badge risk-${result.riskLevel}">
              ${getIcon("shield", "quick-stat-icon")}
              ${result.riskLevel} Risk
            </div>
            <p class="risk-probability">
              Re-identification Probability: ${(result.reidentificationRisk.reidentificationProbability * 100).toFixed(1)}%
            </p>
          </div>

          <!-- Quick Stats -->
          <div class="quick-stats">
            <div class="quick-stat-item">
              ${getIcon("users", "quick-stat-icon")}
              <span>K=${result.kAnonymity.kValue}</span>
            </div>
            <div class="quick-stat-item">
              ${getIcon("pieChart", "quick-stat-icon")}
              <span>L=${result.lDiversity.lValue}</span>
            </div>
            <div class="quick-stat-item">
              ${getIcon("activity", "quick-stat-icon")}
              <span>T=${result.tCloseness.maxDistance.toFixed(3)}</span>
            </div>
            <div class="quick-stat-item">
              ${getIcon("lock", "quick-stat-icon")}
              <span>${result.techniqueDetection.detectedTechniques.length} Technique(s)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateMetricsBreakdown(result: PrivacyIndexResult): string {
  const metricsHtml = result.metricScores
    .map((metric) => {
      const statusColor = getStatusColorClass(metric.status);
      const statusIcon =
        metric.status === "pass" ? "check" : metric.status === "warning" ? "warning" : "x";

      return `
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-name">${metric.name}</span>
            ${getIcon(statusIcon, `metric-status text-${statusColor}`)}
          </div>
          <div class="metric-score">${metric.score}</div>
          <div class="metric-bar">
            <div class="metric-bar-fill bg-${statusColor}" style="width: ${metric.score}%"></div>
          </div>
          <p class="metric-details">${metric.details}</p>
        </div>
      `;
    })
    .join("");

  return `
    <div class="card">
      <div class="card-header">
        <h2>${getIcon("barChart", "quick-stat-icon")} Privacy Metrics Breakdown</h2>
      </div>
      <div class="card-content">
        <div class="metrics-grid">
          ${metricsHtml}
        </div>
      </div>
    </div>
  `;
}

function generateKAnonymitySection(result: PrivacyIndexResult): string {
  const k = result.kAnonymity;
  const statusBadge = k.satisfiesKAnonymity
    ? '<span class="badge badge-safe">Satisfied</span>'
    : '<span class="badge badge-violated">Violated</span>';

  const quasiIdentifiersHtml =
    k.quasiIdentifiers.length > 0
      ? k.quasiIdentifiers.map((qi) => `<span class="badge badge-quasi">${qi}</span>`).join("")
      : '<span style="color: var(--color-muted-foreground); font-size: 0.875rem;">No quasi-identifiers found</span>';

  const distributionHtml = Object.entries(k.sizeDistribution)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .slice(0, 10)
    .map(
      ([size, count]) => `
        <div class="distribution-item">
          <span>Size ${size}:</span>
          <span style="color: var(--color-muted-foreground);">${count} class(es)</span>
        </div>
      `
    )
    .join("");

  const warningHtml =
    k.violatingClasses.length > 0
      ? `
        <div class="warning-box">
          ${getIcon("warning", "warning-icon")}
          <div class="warning-content">
            <h4>⚠️ ${k.violatingClasses.length} Violating Equivalence Classes</h4>
            <p>These equivalence classes have fewer than ${k.kThreshold} records, making individuals potentially identifiable.</p>
          </div>
        </div>
      `
      : "";

  return `
    <div class="card">
      <div class="card-header">
        <h2>${getIcon("users", "quick-stat-icon")} K-Anonymity Analysis</h2>
        ${statusBadge}
      </div>
      <div class="card-content">
        <div class="stats-grid stats-grid-4">
          <div class="stat-card">
            <div class="stat-value">${k.kValue}</div>
            <div class="stat-label">K-Value Achieved</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${k.kThreshold}</div>
            <div class="stat-label">K-Threshold</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${k.equivalenceClassCount.toLocaleString()}</div>
            <div class="stat-label">Equivalence Classes</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${k.complianceRate.toFixed(1)}%</div>
            <div class="stat-label">Compliance Rate</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <h4>Quasi-Identifiers Analyzed</h4>
            <div class="badge-list">
              ${quasiIdentifiersHtml}
            </div>
          </div>
          <div class="info-card">
            <h4>Class Size Distribution</h4>
            <div class="distribution-list">
              ${distributionHtml}
            </div>
          </div>
        </div>

        ${warningHtml}
      </div>
    </div>
  `;
}

function generateLDiversitySection(result: PrivacyIndexResult): string {
  const l = result.lDiversity;
  const statusBadge = l.satisfiesLDiversity
    ? '<span class="badge badge-safe">Satisfied</span>'
    : '<span class="badge badge-violated">Violated</span>';

  const sensitiveAttributesHtml =
    l.sensitiveAttributes.length > 0
      ? l.sensitiveAttributes.map((sa) => `<span class="badge badge-sensitive">${sa}</span>`).join("")
      : '<span style="color: var(--color-muted-foreground); font-size: 0.875rem;">No sensitive attributes found</span>';

  const warningHtml =
    l.violatingClasses.length > 0
      ? `
        <div class="warning-box">
          ${getIcon("warning", "warning-icon")}
          <div class="warning-content">
            <h4>⚠️ ${l.violatingClasses.length} Violating Classes</h4>
            <p>These equivalence classes have insufficient diversity in sensitive attribute values.</p>
          </div>
        </div>
      `
      : "";

  return `
    <div class="card">
      <div class="card-header">
        <h2>${getIcon("pieChart", "quick-stat-icon")} L-Diversity Analysis</h2>
        ${statusBadge}
      </div>
      <div class="card-content">
        <div class="stats-grid stats-grid-4">
          <div class="stat-card">
            <div class="stat-value">${l.lValue}</div>
            <div class="stat-label">L-Value Achieved</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${l.lThreshold}</div>
            <div class="stat-label">L-Threshold</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${l.diversityType}</div>
            <div class="stat-label">Diversity Type</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${l.averageEntropy.toFixed(3)}</div>
            <div class="stat-label">Average Entropy</div>
          </div>
        </div>

        <div class="info-card" style="margin-bottom: 1rem;">
          <h4>Sensitive Attributes Analyzed</h4>
          <div class="badge-list">
            ${sensitiveAttributesHtml}
          </div>
        </div>

        ${warningHtml}
      </div>
    </div>
  `;
}

function generateTClosenessSection(result: PrivacyIndexResult): string {
  const t = result.tCloseness;
  const statusBadge = t.satisfiesTCloseness
    ? '<span class="badge badge-safe">Satisfied</span>'
    : '<span class="badge badge-violated">Violated</span>';

  const distributionHtml = Object.entries(t.globalDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(
      ([value, count]) => `
        <div class="distribution-item">
          <span>${value}:</span>
          <span style="color: var(--color-muted-foreground);">${(count * 100).toFixed(1)}%</span>
        </div>
      `
    )
    .join("");

  const warningHtml =
    t.violatingClasses.length > 0
      ? `
        <div class="warning-box">
          ${getIcon("warning", "warning-icon")}
          <div class="warning-content">
            <h4>⚠️ ${t.violatingClasses.length} Violating Classes</h4>
            <p>These equivalence classes exceed the t-closeness threshold for distribution distance.</p>
          </div>
        </div>
      `
      : "";

  return `
    <div class="card">
      <div class="card-header">
        <h2>${getIcon("activity", "quick-stat-icon")} T-Closeness Analysis</h2>
        ${statusBadge}
      </div>
      <div class="card-content">
        <div class="stats-grid stats-grid-4">
          <div class="stat-card">
            <div class="stat-value">${t.maxDistance.toFixed(3)}</div>
            <div class="stat-label">Max Distance</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${t.tThreshold}</div>
            <div class="stat-label">T-Threshold</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${t.averageDistance.toFixed(3)}</div>
            <div class="stat-label">Average Distance</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${t.complianceRate.toFixed(1)}%</div>
            <div class="stat-label">Compliance Rate</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <h4>Sensitive Attribute</h4>
            <div class="badge-list">
              <span class="badge badge-sensitive">${t.sensitiveAttribute || "None"}</span>
            </div>
          </div>
          <div class="info-card">
            <h4>Global Distribution</h4>
            <div class="distribution-list">
              ${distributionHtml || '<span style="color: var(--color-muted-foreground); font-size: 0.875rem;">No distribution data</span>'}
            </div>
          </div>
        </div>

        ${warningHtml}
      </div>
    </div>
  `;
}

function generateTechniquesSection(result: PrivacyIndexResult): string {
  const tech = result.techniqueDetection;

  const techniquesHtml =
    tech.detectedTechniques.length > 0
      ? `
        <div class="techniques-grid">
          ${tech.detectedTechniques.map((t) => generateTechniqueCard(t)).join("")}
        </div>
      `
      : `
        <div class="empty-state">
          ${getIcon("eyeOff", "empty-icon")}
          <p>No privacy techniques detected</p>
          <p style="font-size: 0.875rem; margin-top: 0.25rem;">
            Consider applying privacy-preserving techniques to protect sensitive data.
          </p>
        </div>
      `;

  return `
    <div class="card">
      <div class="card-header">
        <h2>${getIcon("lock", "quick-stat-icon")} Detected Privacy Techniques</h2>
        <span class="badge badge-secondary">${tech.detectedTechniques.length} technique(s)</span>
      </div>
      <div class="card-content">
        <div class="stats-grid stats-grid-3">
          <div class="stat-card">
            <div class="stat-value">${tech.detectedTechniques.length}</div>
            <div class="stat-label">Techniques Detected</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${(tech.techniqueCoverage * 100).toFixed(0)}%</div>
            <div class="stat-label">Coverage</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${tech.techniqueScore}</div>
            <div class="stat-label">Technique Score</div>
          </div>
        </div>

        ${techniquesHtml}
      </div>
    </div>
  `;
}

function generateTechniqueCard(technique: DetectedTechnique): string {
  const benefitClass =
    technique.privacyBenefit === "high"
      ? "badge-safe"
      : technique.privacyBenefit === "medium"
        ? "badge-quasi"
        : "badge-outline";

  const attributesBadges = technique.affectedAttributes
    .map((attr) => `<span class="badge badge-secondary" style="font-size: 0.75rem;">${attr}</span>`)
    .join("");

  return `
    <div class="technique-card">
      <div class="technique-header">
        <span class="technique-name">${technique.technique.replace(/-/g, " ")}</span>
        <span class="badge ${benefitClass}">${technique.privacyBenefit} benefit</span>
      </div>
      <p class="technique-description">${technique.description}</p>
      <div class="badge-list">
        ${attributesBadges}
      </div>
      <p class="technique-confidence">Confidence: ${(technique.confidence * 100).toFixed(0)}%</p>
    </div>
  `;
}

function generateRiskSection(result: PrivacyIndexResult): string {
  const risk = result.reidentificationRisk;

  const riskBadgeClass =
    risk.riskScore < 30 ? "badge-safe" : risk.riskScore < 60 ? "badge-quasi" : "badge-sensitive";

  const riskFactorsHtml =
    risk.riskFactors.length > 0
      ? `
        <div class="risk-factors">
          <h4>Risk Factors</h4>
          ${risk.riskFactors.map((factor, index) => generateRiskFactorItem(factor, index === risk.riskFactors.length - 1)).join("")}
        </div>
      `
      : "";

  return `
    <div class="card">
      <div class="card-header">
        <h2>${getIcon("target", "quick-stat-icon")} Re-identification Risk Assessment</h2>
        <span class="badge ${riskBadgeClass}">${risk.riskScore}% Risk</span>
      </div>
      <div class="card-content">
        <div class="stats-grid stats-grid-4">
          <div class="stat-card">
            <div class="stat-value">${risk.riskScore}%</div>
            <div class="stat-label">Overall Risk</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${risk.prosecutorRisk.toFixed(1)}%</div>
            <div class="stat-label">Prosecutor Risk</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${risk.journalistRisk.toFixed(1)}%</div>
            <div class="stat-label">Journalist Risk</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${risk.marketerRisk.toFixed(1)}%</div>
            <div class="stat-label">Marketer Risk</div>
          </div>
        </div>

        ${riskFactorsHtml}
      </div>
    </div>
  `;
}

function generateRiskFactorItem(factor: RiskFactor, isLast: boolean): string {
  const impactClass =
    factor.impact > 30 ? "badge-sensitive" : factor.impact > 15 ? "badge-quasi" : "badge-outline";

  return `
    <div class="risk-factor" ${isLast ? 'style="border-bottom: none;"' : ""}>
      <div class="risk-factor-header">
        <span class="risk-factor-name">${factor.factor}</span>
        <span class="badge ${impactClass}">Impact: ${factor.impact}%</span>
      </div>
      <p class="risk-factor-description">${factor.description}</p>
      <p class="risk-factor-mitigation">💡 ${factor.mitigation}</p>
    </div>
  `;
}

function generateRecommendationsSection(result: PrivacyIndexResult): string {
  const recommendationsHtml =
    result.recommendations.length > 0
      ? `
        <div class="recommendations-list">
          ${result.recommendations.map((rec) => generateRecommendationCard(rec)).join("")}
        </div>
      `
      : `
        <div class="success-box">
          ${getIcon("check", "success-icon")}
          <p>No recommendations - your dataset is well protected!</p>
        </div>
      `;

  return `
    <div class="card">
      <div class="card-header">
        <h2>${getIcon("lightbulb", "quick-stat-icon")} Recommendations</h2>
        <span class="badge badge-outline">${result.recommendations.length} action(s)</span>
      </div>
      <div class="card-content">
        ${recommendationsHtml}
      </div>
    </div>
  `;
}

function generateRecommendationCard(rec: PrivacyRecommendation): string {
  const priorityBadgeClass: Record<string, string> = {
    critical: "badge-sensitive",
    high: "badge-quasi",
    medium: "badge-secondary",
    low: "badge-outline",
  };

  return `
    <div class="recommendation-card ${rec.priority}">
      <div class="recommendation-badges">
        <span class="badge ${priorityBadgeClass[rec.priority]}">${rec.priority}</span>
        <span class="badge badge-outline">${rec.category}</span>
      </div>
      <h4 class="recommendation-title">${rec.title}</h4>
      <p class="recommendation-description">${rec.description}</p>
      <div class="recommendation-meta">
        <span>${getIcon("trendingUp", "quick-stat-icon")} Expected impact: +${rec.expectedImpact} points</span>
        ${rec.affectedAttributes.length > 0 ? `<span>Affects: ${rec.affectedAttributes.join(", ")}</span>` : ""}
      </div>
      <div class="recommendation-action">
        <strong>Action:</strong> ${rec.action}
      </div>
    </div>
  `;
}

function generateFooter(result: PrivacyIndexResult, timestamp: Date): string {
  return `
    <div class="footer">
      <p>Analysis completed in ${result.metadata.analysisDuration.toFixed(2)}ms • ${timestamp.toLocaleString()}</p>
      <p style="margin-top: 0.5rem;">Generated by Privacy Index Calculator</p>
    </div>
  `;
}

export function downloadHTMLReport(result: PrivacyIndexResult, fileName: string | null): void {
  const html = generateHTMLReport(result, {
    fileName,
    timestamp: result.timestamp,
  });

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `privacy-report-${fileName?.replace(".csv", "") || "dataset"}-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
