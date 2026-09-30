/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, RotateCcw, Loader2, FileSpreadsheet, Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button, AnimatedButton } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { getAllUIExtensions } from '@/core/ui-registry';
import { getPluginRegistry } from '@/core/plugin-registry';
import { usePrivacyStore } from '@/lib/storage';

import { MetricsSection } from '@/components/configuration/metrics-section';
import { WeightsSection } from '@/components/configuration/weights-section';
import { tabVariants } from '@/utils/constants';
import { PageHeader } from '@/components/page-header';

export const Route = createFileRoute('/configure')({
  component: ConfigurePage,
});

function ConfigurePage() {
  const navigate = useNavigate();
  const { parsedCSV, classificationResult: result, fileName, setPrivacyResultData } = usePrivacyStore();

  const { 
    enabledPlugins, 
    pluginConfigs, 
    pluginWeights, 
    initializeConfiguration,
    setPluginEnabled, 
    setPluginConfig, 
    setPluginWeight,
    normalizeWeights,
    resetConfiguration 
  } = usePrivacyStore();

  const [isCalculating, setIsCalculating] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('metrics');

  const uiExtensions = useMemo(() => getAllUIExtensions(), []);
  
  const enabledPluginsCount = useMemo(
    () => Object.values(enabledPlugins).filter(Boolean).length,
    [enabledPlugins]
  );

  useEffect(() => {
    initializeConfiguration();
  }, [initializeConfiguration]);

  useEffect(() => {
    if (!result || !parsedCSV || !fileName) navigate({ to: '/' });
  }, [result, parsedCSV, fileName, navigate]);

  const dynamicTabs = useMemo(() => {
    return uiExtensions
      .filter(ui => enabledPlugins[ui.id] && ui.ConfigTab)
      .map(ui => ({
        id: ui.id,
        label: ui.ConfigTab!.label,
        count: ui.ConfigTab!.getBadgeCount?.(pluginConfigs[ui.id]) ?? null,
        Component: ui.ConfigTab!.Component
      }));
  }, [uiExtensions, enabledPlugins, pluginConfigs]);

  const navigationTabs = [
    { id: 'metrics', label: 'Privacy Metrics', count: enabledPluginsCount },
    ...dynamicTabs,
    { id: 'weights', label: 'Score Weights', count: null },
  ];

  const handleCalculatePrivacyIndex = async () => {
    if (!result || !parsedCSV || !fileName) return;
    setIsCalculating(true);

    setTimeout(() => {
      try {
        const pluginRegistry = getPluginRegistry();
        
        Object.entries(enabledPlugins).forEach(([id, enabled]) => {
          pluginRegistry.setPluginEnabled(id, enabled);
          if (enabled) {
            pluginRegistry.setPluginConfig(id, pluginConfigs[id]);
            pluginRegistry.setPluginWeight(id, pluginWeights[id]);
          }
        });

        const executionResult = pluginRegistry.executeAll({
          parsedCSV,
          classification: result,
          globalConfig: { includeDetailedAnalysis: true }
        });

        const formattedResult = {
          overallScore: executionResult.overallScore,
          riskLevel: 'medium', // Generate via your standard risk lookup
          grade: 'B', // Generate via your standard grade lookup
          metricScores: executionResult.results.map(r => ({
            id: r.pluginId,
            name: r.pluginName,
            score: r.output.score,
            weight: r.weight,
            weightedScore: r.weightedScore,
            status: r.output.status,
            details: r.output.details,
          })),
          pluginData: Object.fromEntries(executionResult.results.map(r => [r.pluginId, r.output.result])),
          recommendations: executionResult.results.flatMap(r => r.output.insights || []),
          timestamp: new Date(),
          metadata: { recordCount: parsedCSV.rows.length, attributeCount: parsedCSV.headers.length, config: {} as any }
        };

        setPrivacyResultData(formattedResult as any, result, parsedCSV, fileName);
        navigate({ to: '/results' });
      } catch (error) {
        console.error('Error calculating privacy index:', error);
        setIsCalculating(false);
      }
    }, 1000);
  };

  const enabledWeightSum = Object.entries(pluginWeights)
    .filter(([key]) => enabledPlugins[key])
    .reduce((sum, [, weight]) => sum + weight, 0);

  const totalPercentage = Math.round(enabledWeightSum * 100);
  const weightError = totalPercentage !== 100 
    ? `Enabled metric weights sum to ${totalPercentage}%. Consider adjusting to total 100%.` 
    : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Privacy Analysis Configuration"
          backDescription="Back to Classification"
          handleFunc={() => navigate({ to: '/classify' })}
          subTitle={
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{fileName}</span>
            </div>
          }
          actionSection={
            <Button variant="outline" size="sm" onClick={resetConfiguration}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Defaults
            </Button>
          }
        />

        <motion.div className="mb-6">
          <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit overflow-x-auto">
            {navigationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  activeSection === tab.id
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <Badge variant="secondary" className="text-xs">{tab.count}</Badge>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeSection === 'metrics' && (
            <motion.div key="metrics" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
              <MetricsSection
                uiExtensions={uiExtensions}
                enabledPlugins={enabledPlugins}
                pluginConfigs={pluginConfigs}
                onTogglePlugin={setPluginEnabled}
                onConfigChange={setPluginConfig}
              />
            </motion.div>
          )}

          {activeSection === 'weights' && (
            <motion.div key="weights" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
              <WeightsSection
                uiExtensions={uiExtensions}
                enabledPlugins={enabledPlugins}
                pluginWeights={pluginWeights}
                onWeightChange={setPluginWeight}
                onNormalize={normalizeWeights}
                warning={weightError}
              />
            </motion.div>
          )}

          {/* Render Active Plugin Configuration Tab */}
          {dynamicTabs.map((tab) => {
            if (activeSection !== tab.id) return null;
            const DynamicComponent = tab.Component;
            return (
              <motion.div key={tab.id} variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                <DynamicComponent 
                  config={pluginConfigs[tab.id]} 
                  onChange={(newConfig) => setPluginConfig(tab.id, newConfig)} 
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Action Footer */}
        <motion.div className="mt-8">
          <Card className="p-6">
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Ready to Calculate Privacy Index?</h3>
                  <p className="text-sm text-muted-foreground">
                    {enabledPluginsCount} plugins will be evaluated.
                  </p>
                </div>
                <AnimatedButton
                  size="lg"
                  onClick={handleCalculatePrivacyIndex}
                  disabled={isCalculating || enabledPluginsCount === 0 || weightError !== null}
                >
                  {isCalculating ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Calculating...</>
                  ) : (
                    <><Calculator className="h-4 w-4 mr-2" />Calculate Privacy Index<ArrowRight className="h-4 w-4 ml-2" /></>
                  )}
                </AnimatedButton>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default ConfigurePage;