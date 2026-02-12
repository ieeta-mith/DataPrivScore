import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  className?: string;
}

/**
 * A simple stat card component for displaying key metrics
 */
export function StatCard({ label, value, className = "" }: StatCardProps) {
  return (
    <div className={`p-3 rounded-lg bg-muted/50 ${className}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

interface StatCardWithIconProps extends StatCardProps {
  icon: React.ReactNode;
}

/**
 * Stat card with an icon
 */
export function StatCardWithIcon({ label, value, icon, className = "" }: StatCardWithIconProps) {
  return (
    <div className={`p-3 rounded-lg bg-muted/50 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

/**
 * A responsive grid for displaying stat cards
 */
export function StatGrid({ children, columns = 4, className = "" }: StatGridProps) {
  const colsClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
  };

  return (
    <div className={`grid grid-cols-2 ${colsClass[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
}

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A card for displaying additional information with a title
 */
export function InfoCard({ title, children, className = "" }: InfoCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <h4 className="font-medium mb-2">{title}</h4>
        {children}
      </CardContent>
    </Card>
  );
}

interface WarningCardProps {
  title: string;
  count: number;
  description: string;
  icon?: React.ReactNode;
}

/**
 * A warning card for displaying violations or alerts
 */
export function WarningCard({ title, count, description, icon }: WarningCardProps) {
  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardContent className="p-4">
        <h4 className="font-medium mb-2 flex items-center gap-2 text-orange-600 dark:text-orange-400">
          {icon}
          {title} ({count})
        </h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
