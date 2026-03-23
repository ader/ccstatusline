import type { RenderContext } from '../types/RenderContext';
import type { Settings } from '../types/Settings';
import type {
    Widget,
    WidgetEditorDisplay,
    WidgetItem
} from '../types/Widget';

const DEFAULT_INTERVAL_SECONDS = 60;
const DEFAULT_QUOTES = [
    'Stay focused',
    'Keep it simple',
    'Ship it!',
    'One step at a time',
    'Code with purpose'
];

function getQuotes(item: WidgetItem): string[] {
    const raw = item.metadata?.quotes;
    if (raw) {
        const parsed = raw.split('|').map(s => s.trim()).filter(Boolean);
        if (parsed.length > 0) return parsed;
    }
    return DEFAULT_QUOTES;
}

function getInterval(item: WidgetItem): number {
    const raw = item.metadata?.interval;
    if (raw) {
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return DEFAULT_INTERVAL_SECONDS;
}

/**
 * Use a multi-round hash of the time-window index to deterministically
 * pick a quote. Same window = same quote, even across process restarts.
 */
function getQuoteIndex(quotes: string[], intervalSeconds: number): number {
    let h = Math.floor(Date.now() / (intervalSeconds * 1000));
    // xmur3-style integer hash for better distribution
    h = ((h >>> 16) ^ h) * 0x45d9f3b | 0;
    h = ((h >>> 16) ^ h) * 0x45d9f3b | 0;
    h = (h >>> 16) ^ h;
    return ((h >>> 0) % quotes.length);
}

export class RandomQuoteWidget implements Widget {
    getDefaultColor(): string { return 'brightCyan'; }
    getDescription(): string { return 'Displays random quotes/phrases, rotating on a timer'; }
    getDisplayName(): string { return 'Random Quote'; }
    getCategory(): string { return 'Custom'; }

    getEditorDisplay(item: WidgetItem): WidgetEditorDisplay {
        const quotes = getQuotes(item);
        return { displayText: `${this.getDisplayName()} (${quotes.length} quotes)` };
    }

    render(item: WidgetItem, context: RenderContext, _settings: Settings): string | null {
        const quotes = getQuotes(item);
        const interval = getInterval(item);

        if (context.isPreview) {
            return quotes[0] ?? '';
        }

        const index = getQuoteIndex(quotes, interval);
        return quotes[index] ?? quotes[0] ?? '';
    }

    supportsRawValue(): boolean { return false; }
    supportsColors(item: WidgetItem): boolean { return true; }
}
