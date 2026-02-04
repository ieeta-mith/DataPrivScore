import type { AttributeTypeInfo } from "@/types/attribute-classification";
import { BarChart3, FileSpreadsheet, ShieldCheck, Lock, User, Users, Shield, FileText } from "lucide-react";

export const features = [
  {
    icon: FileSpreadsheet,
    title: 'CSV Upload',
    description: 'Upload your dataset in CSV format for analysis',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Attribute Classification',
    description: 'Automatically identify and classify data attributes',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy Models',
    description: 'Apply multiple privacy-preserving techniques',
    color: 'from-rose-500 to-orange-500',
  },
  {
    icon: Lock,
    title: 'Privacy Index',
    description: 'Get a quantitative privacy score for your dataset',
    color: 'from-orange-500 to-purple-500',
  },
];

export const HIGH_CONFIDENCE_THRESHOLD = 0.8;

export const attributeTypes: AttributeTypeInfo[] = [
  {
    title: 'Direct Identifier',
    label: 'direct',
    icon: User,
    short: 'Uniquely identifies an individual on its own',
    examples: 'Name, SSN, Email, Phone, Patient ID',
    color: {
      bg: 'bg-red-100 dark:bg-red-950',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-300 dark:border-red-800',
    }
  },
  {
    title: 'Quasi-Identifier',
    label: 'quasi',
    icon: Users,
    short: 'Can be combined to re-identify individuals',
    examples: 'Age, Gender, ZIP Code, Birth Data, Occupation',
    color: {
      bg: 'bg-amber-100 dark:bg-amber-950',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-800',
    }
  },
  {
    title: 'Sensitive Attribute',
    label: 'sensitive',
    icon: Shield,
    short: 'Contains sensitive personal information',
    examples: 'Health Conditions, Salary, Religion, Health Data',
    color: {
      bg: 'bg-purple-100 dark:bg-purple-950',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-800',
    }
  },
  {
    title: 'Non-Sensitive Attribute',
    label: 'non-sensitive',
    icon: FileText,
    short: 'Non-identifying, public, or administrative data',
    examples: 'Timestamps, Status Flags, Hashes, Categories',
    color: {
      bg: 'bg-green-100 dark:bg-green-950',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-300 dark:border-green-800',
    }
  }
];