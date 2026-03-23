import type { RenderContext } from '../types/RenderContext';
import type { Settings } from '../types/Settings';
import type {
    CustomKeybind,
    Widget,
    WidgetEditorDisplay,
    WidgetItem
} from '../types/Widget';
import { getColorLevelString } from '../types/ColorLevel';
import { applyColors } from '../utils/colors';
import { getUsageErrorMessage } from '../utils/usage';

import { formatRawOrLabeledValue } from './shared/raw-or-labeled';
import {
    getDotCount,
    getThresholdColor,
    makeColoredDotBar
} from './shared/dots';
import {
    getContextInverseModifierText,
    handleContextInverseAction,
    isContextInverse
} from './shared/context-inverse';

function formatResetDate(resetAt: string | undefined): string | null {
    if (!resetAt) return null;
    const date = new Date(resetAt);
    if (isNaN(date.getTime())) return null;
    const datePart = new Intl.DateTimeFormat(undefined, { month: '2-digit', day: '2-digit' }).format(date);
    const hh = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${datePart} ${hh}:${min}`;
}

export class WeeklyUsageDotsWidget implements Widget {
    getDefaultColor(): string { return 'green'; }
    getDescription(): string { return 'Shows weekly (7d) usage as colored dots with reset date'; }
    getDisplayName(): string { return 'Weekly Usage Dots'; }
    getCategory(): string { return 'Usage'; }

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
        const data = context.usageData ?? {};
        if (data.error || data.weeklyUsage === undefined) return null;
        const percent = Math.max(0, Math.min(100, data.weeklyUsage));
        return getThresholdColor(percent);
    }

    render(item: WidgetItem, context: RenderContext, settings: Settings): string | null {
        const isInverse = isContextInverse(item);
        const totalDots = getDotCount(item);
        const colorLevel = getColorLevelString((settings.colorLevel as number) as (0 | 1 | 2 | 3));

        if (context.isPreview) {
            const previewPercent = 25;
            const displayPercent = isInverse ? 100 - previewPercent : previewPercent;
            const dotBar = makeColoredDotBar(previewPercent, totalDots, colorLevel);
            const pctColor = getThresholdColor(previewPercent);
            const coloredPct = applyColors(`${displayPercent.toFixed(1)}%`, pctColor, undefined, false, colorLevel);
            const resetDate = applyColors('03/29 02:59', pctColor, undefined, false, colorLevel);
            return formatRawOrLabeledValue(item, 'Weekly: ', `${dotBar} ${coloredPct} ${resetDate}`);
        }

        const data = context.usageData ?? {};
        if (data.error) return getUsageErrorMessage(data.error);
        if (data.weeklyUsage === undefined) return null;

        const percent = Math.max(0, Math.min(100, data.weeklyUsage));
        const displayPercent = isInverse ? 100 - percent : percent;
        const dotBar = makeColoredDotBar(percent, totalDots, colorLevel);
        const pctColor = getThresholdColor(percent);
        const coloredPct = applyColors(`${displayPercent.toFixed(1)}%`, pctColor, undefined, false, colorLevel);

        const resetDateStr = formatResetDate(data.weeklyResetAt);
        const resetPart = resetDateStr
            ? ' ' + applyColors(resetDateStr, pctColor, undefined, false, colorLevel)
            : '';

        return formatRawOrLabeledValue(item, 'Weekly: ', `${dotBar} ${coloredPct}${resetPart}`);
    }

    getCustomKeybinds(): CustomKeybind[] {
        return [
            { key: 'u', label: '(u)sed/remaining', action: 'toggle-inverse' }
        ];
    }

    supportsRawValue(): boolean { return true; }
    supportsColors(item: WidgetItem): boolean { return true; }
}
