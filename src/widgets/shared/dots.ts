import type { WidgetItem } from '../../types/Widget';
import { applyColors } from '../../utils/colors';

export const FILLED_DOT = '●';
export const EMPTY_DOT = '○';
export const DEFAULT_DOT_COUNT = 10;

export function getDotCount(item: WidgetItem): number {
    const count = item.metadata?.dots;
    if (count) {
        const parsed = parseInt(count, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 20) return parsed;
    }
    return DEFAULT_DOT_COUNT;
}

export function getThresholdColor(percentage: number): string {
    if (percentage < 50) return 'green';
    if (percentage < 70) return 'yellow';
    return 'red';
}

export function makeColoredDotBar(
    percentage: number,
    totalDots: number,
    colorLevel: 'ansi16' | 'ansi256' | 'truecolor'
): string {
    const filledCount = Math.round((percentage / 100) * totalDots);
    const color = getThresholdColor(percentage);
    let result = '';

    for (let i = 0; i < totalDots; i++) {
        if (i < filledCount) {
            result += applyColors(FILLED_DOT, color, undefined, false, colorLevel);
        } else {
            result += applyColors(EMPTY_DOT, 'brightBlack', undefined, false, colorLevel);
        }
    }

    return result;
}
