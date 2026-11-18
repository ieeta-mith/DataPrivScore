import { Archive, Eye, EyeOff, Hash, Layers, UserX, Waves } from "lucide-react";

export const TECHNIQUE_INFO: Record<string, { name: string; description: string; icon: React.ElementType }> = {
  generalization: { name: 'Generalization', description: 'Replaces specific values with broader categories', icon: Layers },
  suppression: { name: 'Suppression', description: 'Removes or replaces sensitive values with placeholders', icon: EyeOff },
  masking: { name: 'Masking', description: 'Partially hides values while preserving some info', icon: Eye },
  hashing: { name: 'Hashing', description: 'Transforms values into fixed-length cryptographic hashes', icon: Hash },
  pseudonymization: { name: 'Pseudonymization', description: 'Replaces identifiers with artificial pseudonyms', icon: UserX },
  noiseAddition: { name: 'Noise Addition', description: 'Adds random statistical noise to numerical values', icon: Waves },
  bucketing: { name: 'Bucketing', description: 'Groups continuous values into discrete bins', icon: Archive },
};