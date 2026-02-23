interface SwitchExampleProps { 
	setShowAnonymized: (value: boolean) => void;
	showAnonymized: boolean;
	option1: string;
	option2: string;
}

const SwitchExample = ({ setShowAnonymized, showAnonymized, option1, option2 }: SwitchExampleProps) => {
  return (
    <div className='flex items-center justify-between'>
			<h4>Visual Example</h4>
			<div className='flex items-center gap-2'>
				<span className='text-sm text-muted-foreground'>Show:</span>
				<button
					onClick={() => setShowAnonymized(false)}
					className={`px-3 py-1 text-sm rounded-l-md border transition-colors ${
						!showAnonymized 
							? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300" 
							: "bg-muted border-muted-foreground/20"
					}`}
				>
					{option1}
				</button>
				<button
					onClick={() => setShowAnonymized(true)}
					className={`px-3 py-1 text-sm rounded-r-md border transition-colors ${
						showAnonymized 
							? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300" 
							: "bg-muted border-muted-foreground/20"
					}`}
				>
					{option2}
				</button>
			</div>
		</div>
  )
}

export default SwitchExample