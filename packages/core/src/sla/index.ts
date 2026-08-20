export type Severity = "P1" | "P2" | "P3" | "P4";

export const SLA_TARGETS: Record<Severity, { responseMin: number; resolutionMin: number }> = {
  P1: { responseMin: 30, resolutionMin: 240 },
  P2: { responseMin: 120, resolutionMin: 480 },
  P3: { responseMin: 480, resolutionMin: 2880 },
  P4: { responseMin: 1440, resolutionMin: 10080 },
};

export function isSlaBreached(severity: Severity, elapsedMin: number): boolean {
  return elapsedMin > SLA_TARGETS[severity].resolutionMin;
}
