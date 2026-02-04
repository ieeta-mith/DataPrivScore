import type { LucideIcon } from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface ProcessingStateProps {
  status: ProcessingStatus;
  message?: string;
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
}

export interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile?: File | null;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
}

export interface DatasetStatsProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color: string;
}