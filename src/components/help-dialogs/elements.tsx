import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface InformationSectionProps {
  icon?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  colorVariant: string;
}

export const InformationSection = ({
  icon,
  title,
  description,
  colorVariant,
}: InformationSectionProps) => {

	const colorMap = {
		muted: {
			bg: "bg-muted/50",
      border: "",
      titleColor: "text-black",
			desc: "text-muted-foreground",
		},
		sucess: {
			bg: "bg-green-50",
      titleColor: "text-green-700",
			border: "border-green-200",
      desc: "text-green-600",
		},
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      titleColor: "text-red-700",
      desc: "text-red-600",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      titleColor: "text-amber-700",
      desc: "text-amber-600",
    }
	}

  const colors = colorMap[colorVariant as keyof typeof colorMap];

  return (
    <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
      {icon ? (
        <div className="flex items-center gap-3">
          {icon} 
          <h4 className={`font-bold ${colors.titleColor}`}>
            {title}
          </h4>
        </div>
      ) : (
        <h4 className={`font-bold ${colors.titleColor}`}>{title}</h4>
      )}
      <p className={`text-sm ${colors.desc} mt-1`}>{description}</p>
    </div>
  );
};

export const HelpDialogHeader = ({
  title,
  icon,
  description,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
}) => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-xl">
        {icon}
        {title}
      </DialogTitle>
      <DialogDescription>
        {description}
      </DialogDescription>
    </DialogHeader>
  );
}

export const VisualExampleButtonExchange = () => {
  return (
    <div></div>
  )
}