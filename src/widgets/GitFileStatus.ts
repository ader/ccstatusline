import type { RenderContext } from '../types/RenderContext';
import type { Settings } from '../types/Settings';
import type {
    CustomKeybind,
    Widget,
    WidgetEditorDisplay,
    WidgetItem
} from '../types/Widget';
import {
    isInsideGitWorkTree,
    runGit
} from '../utils/git';

import {
    getHideNoGitKeybinds,
    getHideNoGitModifierText,
    handleToggleNoGitAction,
    isHideNoGitEnabled
} from './shared/git-no-git';

export interface GitFileStatusCounts {
    staged: number;
    modified: number;
    untracked: number;
}

function getGitFileStatusCounts(context: RenderContext): GitFileStatusCounts {
    const output = runGit('status --porcelain', context);
    if (!output) {
        return { staged: 0, modified: 0, untracked: 0 };
    }

    let staged = 0;
    let modified = 0;
    let untracked = 0;

    for (const line of output.split('\n')) {
        if (line.length < 2) continue;
        const x = line[0];
        const y = line[1];

        // Staged: index has changes (not untracked, not ignored)
        if (x !== ' ' && x !== '?' && x !== '!') staged++;
        // Modified in worktree (unstaged changes)
        if (y === 'M' || y === 'D') modified++;
        // Untracked
        if (x === '?') untracked++;
    }

    return { staged, modified, untracked };
}

export class GitFileStatusWidget implements Widget {
    getDefaultColor(): string { return 'yellow'; }
    getDescription(): string { return 'Shows git file status counts (+staged ~modified ?untracked)'; }
    getDisplayName(): string { return 'Git File Status'; }
    getCategory(): string { return 'Git'; }
    getEditorDisplay(item: WidgetItem): WidgetEditorDisplay {
        return {
            displayText: this.getDisplayName(),
            modifierText: getHideNoGitModifierText(item)
        };
    }

    handleEditorAction(action: string, item: WidgetItem): WidgetItem | null {
        return handleToggleNoGitAction(action, item);
    }

    render(item: WidgetItem, context: RenderContext, _settings: Settings): string | null {
        const hideNoGit = isHideNoGitEnabled(item);

        if (context.isPreview) {
            return '+3 ~5 ?2';
        }

        if (!isInsideGitWorkTree(context)) {
            return hideNoGit ? null : '(no git)';
        }

        const counts = getGitFileStatusCounts(context);

        if (counts.staged === 0 && counts.modified === 0 && counts.untracked === 0) {
            return 'clean';
        }

        const parts: string[] = [];
        if (counts.staged > 0) parts.push(`+${counts.staged}`);
        if (counts.modified > 0) parts.push(`~${counts.modified}`);
        if (counts.untracked > 0) parts.push(`?${counts.untracked}`);

        return parts.join(' ');
    }

    getCustomKeybinds(): CustomKeybind[] {
        return getHideNoGitKeybinds();
    }

    supportsRawValue(): boolean { return false; }
    supportsColors(item: WidgetItem): boolean { return true; }
}
