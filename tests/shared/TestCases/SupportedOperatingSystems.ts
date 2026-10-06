import { OperatingSystem } from '@/domain/OperatingSystem';

export type SupportedOperatingSystem = OperatingSystem.Windows
| OperatingSystem.Linux
| OperatingSystem.macOS
| OperatingSystem.Android
| OperatingSystem.GrapheneOS;

export const AllSupportedOperatingSystems: readonly (
  OperatingSystem & SupportedOperatingSystem
)[] = [
  OperatingSystem.Windows,
  OperatingSystem.Linux,
  OperatingSystem.macOS,
  OperatingSystem.Android,
  OperatingSystem.GrapheneOS,
] as const;
