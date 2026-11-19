import { useLocation, useNavigate } from "@tanstack/react-router";

import {
	Check,
	Upload,
	FileText,
	Settings2,
	BarChart3,
	type LucideIcon
} from 'lucide-react';

import { usePrivacyStore } from "@/lib/storage";

interface NavItem {
	path: string;
	label: string;
	icon: LucideIcon;
	isAccessible: boolean;
	isCompleted: boolean;
}

export function Navbar() {
	const navigate = useNavigate();
	const location = useLocation();
	const store = usePrivacyStore();

	const hasBaseData = !!store.parsedCSV && !!store.classificationResult;
  const hasPrivacyData = !!store.privacyResult;

	const elements: NavItem[] = [
    {
      path: '/',
      label: 'Upload',
      icon: Upload,
      isAccessible: true, 
      isCompleted: hasBaseData && location.pathname !== '/',
    },
    {
      path: '/classify',
      label: 'Classification',
      icon: FileText,
      isAccessible: hasBaseData,
      isCompleted: hasBaseData && (location.pathname === '/configure' || location.pathname === '/results'),
    },
    {
      path: '/configure',
      label: 'Configuration',
      icon: Settings2,
      isAccessible: hasBaseData,
      isCompleted: hasBaseData && hasPrivacyData && location.pathname === '/results',
    },
    {
      path: '/results',
      label: 'Results',
      icon: BarChart3,
      isAccessible: hasBaseData && hasPrivacyData && location.pathname === '/configure',
      isCompleted: false, 
    },
	];

	const handleNavigation = (path: string, isAccessible: boolean) => {
		if (!isAccessible) return;

		if (path === '/') store.clearClassificationData();

		navigate({ to: path });
	}

	return (
		<div className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-md border-b border-border/50 py-4 shadow-sm">
      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="relative flex justify-between items-start">
          <div className="absolute left-8 right-8 top-[1.35rem] h-0.75 bg-slate-200 -z-10 rounded-full" />

          {elements.map((step) => {
            const isActive = location.pathname === step.path;
            const StepIcon = step.icon;
            
            let circleClasses = "";
            let textClasses = "";
            
            if (isActive) {
              circleClasses = "border-indigo-600 bg-indigo-600 text-white shadow-md ring-4 ring-indigo-600/20";
              textClasses = "text-indigo-950 font-bold";
            } else if (step.isCompleted) {
              circleClasses = "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 hover:border-emerald-600 shadow-sm cursor-pointer";
              textClasses = "text-emerald-700 font-semibold";
            } else if (step.isAccessible) {
              circleClasses = "border-slate-300 bg-white text-slate-500 hover:border-indigo-400 hover:text-indigo-500 shadow-sm cursor-pointer";
              textClasses = "text-slate-600 font-medium";
            } else {
              circleClasses = "border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed";
              textClasses = "text-slate-400 font-medium";
            }
            
            return (
              <div key={step.path} className="relative z-10 flex flex-col items-center w-24">
                <div className="bg-background/80 backdrop-blur-sm rounded-full p-1 mb-2">
                  <button
                    onClick={() => handleNavigation(step.path, step.isAccessible)}
                    disabled={!step.isAccessible}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ease-out ${circleClasses}`}
                  >
                    {step.isCompleted && !isActive ? (
                      <Check className="h-5 w-5" strokeWidth={3} />
                    ) : (
                      <StepIcon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                    )}
                  </button>
                </div>

                <span className={`text-xs md:text-sm text-center tracking-wide transition-colors duration-300 ${textClasses}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
	);
}