export function calculateManualWeight(girth: number | string | null | undefined, type: string): number | null {
  if (!girth) return null;
  const x = Number(girth);
  if (isNaN(x) || x <= 0) return null;
  
  if (type === 'กระบือ') {
    return Number(((0.0228 * x * x) - (2.7061 * x) + 108.62).toFixed(1));
  } else {
    // Default to cow formula
    return Number(((5.854 * x) - 595.98).toFixed(1));
  }
}
