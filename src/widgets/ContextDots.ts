import type { RenderContext } from '../types/RenderContext';
import type { Settings } from '../types/Settings';
import type {
    CustomKeybind,
    Widget,
    WidgetEditorDisplay,
    WidgetItem
} from '../types/Widget';
import { getContextWindowMetrics } from '../utils/context-window';
import {
    getContextConfig,
    getModelContextIdentifier
} from '../utils/model-context';
import { applyColors } from '../utils/colors';
import { getColorLevelString } from '../types/ColorLevel';

import {
    getContextInverseModifierText,
    handleContextInverseAction,
    isContextInverse
} from './shared/context-inverse';
import { formatRawOrLabeledValue } from './shared/raw-or-labeled';

const FILLED_DOT = '●';
const EMPTY_DOT = '○';
const DEFAULT_DOT_COUNT = 10;

function getDotColor(dotIndex: number, filledCount: number, totalDots: number): string {
    // Each dot represents a percentage range
    const dotPercent = ((dotIndex + 1) / totalDots) * 100;

    if (dotPercent <= 50) return 'green';
    if (dotPercent <= 70) return 'yellow';
    return 'red';
}

function getDotCount(item: WidgetItem): number {
    const count = item.metadata?.dots;
    if (count) {
        const parsed = parseInt(count, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 20) return parsed;
    }
    return DEFAULT_DOT_COUNT;
}

function makeColoredDotBar(
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

function getThresholdColor(percentage: number): string {
    if (percentage < 50) return 'green';
    if (percentage < 70) return 'yellow';
    return 'red';
}

export class ContextDotsWidget implements Widget {
    getDefaultColor(): string { return 'green'; }
    getDescription(): string { return 'Shows context usage as colored dots (green → yellow → red)'; }
    getDisplayName(): string { return 'Context Dots'; }
    getCategory(): string { return 'Context'; }

    getEditorDisplay(item: WidgetItem): WidgetEditorDisplay {
        return {
            displayText: this.getDisplayName(),
            modifierText: getContextInverseModifierText(item)
        };
    }

    handleEditorAction(action: string, item: WidgetItem): WidgetItem | null {
        return handleContextInverseAction(action, item);
    }

    getDynamicColor(item: WidgetItem, context: RenderContext, _settings: Settings): string | null {
        const isInverse = isContextInverse(item);
        const contextWindowMetrics = getContextWindowMetrics(context.data);

        let usedPercentage: number | null = null;

        if (contextWindowMetrics.usedPercentage !== null) {
            usedPercentage = contextWindowMetrics.usedPercentage;
        } else if (context.tokenMetrics) {
            const modelIdentifier = getModelContextIdentifier(context.data?.model);
            const contextConfig = getContextConfig(modelIdentifier, contextWindowMetrics.windowSize);
            usedPercentage = Math.min(100, (context.tokenMetrics.contextLength / contextConfig.maxTokens) * 100);
        }

        if (usedPercentage === null) return null;

        const thresholdPercentage = isInverse ? usedPercentage : usedPercentage;
        return getThresholdColor(thresholdPercentage);
    }

    render(item: WidgetItem, context: RenderContext, settings: Settings): string | null {
        const isInverse = isContextInverse(item);
        const totalDots = getDotCount(item);
        const colorLevel = getColorLevelString((settings.colorLevel as number) as (0 | 1 | 2 | 3));

        if (context.isPreview) {
            const previewUsed = isInverse ? 9.3 : 9.3;
            const previewDisplay = isInverse ? 90.7 : 9.3;
            const dotBar = makeColoredDotBar(previewUsed, totalDots, colorLevel);
            const pctColor = getThresholdColor(previewUsed);
            const coloredPct = applyColors(`${previewDisplay.toFixed(1)}%`, pctColor, undefined, false, colorLevel);
            const label = `${dotBar} ${coloredPct}`;
            return formatRawOrLabeledValue(item, 'Ctx: ', label);
        }

        const contextWindowMetrics = getContextWindowMetrics(context.data);

        let usedPercentage: number | null = null;

        if (contextWindowMetrics.usedPercentage !== null) {
            usedPercentage = contextWindowMetrics.usedPercentage;
        } else if (context.tokenMetrics) {
            const modelIdentifier = getModelContextIdentifier(context.data?.model);
            const contextConfig = getContextConfig(modelIdentifier, contextWindowMetrics.windowSize);
            usedPercentage = Math.min(100, (context.tokenMetrics.contextLength / contextConfig.maxTokens) * 100);
        }

        if (usedPercentage === null) return null;

        const displayPercentage = isInverse ? (100 - usedPercentage) : usedPercentage;
        const dotBar = makeColoredDotBar(usedPercentage, totalDots, colorLevel);
        const pctColor = getThresholdColor(usedPercentage);
        const coloredPct = applyColors(`${displayPercentage.toFixed(1)}%`, pctColor, undefined, false, colorLevel);
        const label = `${dotBar} ${coloredPct}`;
        return formatRawOrLabeledValue(item, 'Ctx: ', label);
    }

    getCustomKeybinds(): CustomKeybind[] {
        return [
            { key: 'u', label: '(u)sed/remaining', action: 'toggle-inverse' }
        ];
    }

    supportsRawValue(): boolean { return true; }
    // Colors are embedded in the dot bar, so widget-level color only affects the percentage text
    supportsColors(item: WidgetItem): boolean { return true; }
}
