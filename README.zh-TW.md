<div align="center">

<pre>
              _        _             _ _
  ___ ___ ___| |_ __ _| |_ _   _ ___| (_)_ __   ___
 / __/ __/ __| __/ _` | __| | | / __| | | '_ \ / _ \
| (_| (__\__ \ || (_| | |_| |_| \__ \ | | | | |  __/
 \___\___|___/\__\__,_|\__|\__,_|___/_|_|_| |_|\___|

</pre>

# @ader-hwang/ccstatusline

**自訂版 [ccstatusline](https://github.com/sirmalloc/ccstatusline) — 新增多個實用 widget**

[![npm version](https://img.shields.io/npm/v/@ader-hwang/ccstatusline.svg)](https://www.npmjs.com/package/@ader-hwang/ccstatusline)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/ader/ccstatusline/blob/main/LICENSE)
[![Node.js Version](https://img.shields.io/node/v/@ader-hwang/ccstatusline.svg)](https://nodejs.org)

**[English](README.md)**

</div>

## 關於此 Fork

本專案 fork 自 [sirmalloc/ccstatusline](https://github.com/sirmalloc/ccstatusline)，新增自訂 widget 及動態顏色機制。

![Screenshot](https://raw.githubusercontent.com/ader/ccstatusline/main/screenshots/ccusageExt.png)

### 新增 Widget

#### Context Dots（彩色圓點進度條）

以圓點視覺化顯示 context 使用率，依門檻自動變色：

- `< 50%`：綠色
- `50% ~ 70%`：黃色
- `>= 70%`：紅色

顯示效果：`Ctx: ●●●●●○○○○○ 46.0%`

| 參數 | 說明 | 預設值 |
|------|------|--------|
| `metadata.dots` | 圓點總數 | `10` |

#### Git File Status（檔案狀態計數）

顯示 git 工作區的檔案狀態計數，與 `git-changes`（顯示行數增刪）互補。

顯示效果：`+3 ~2 ?1`（3 個 staged、2 個 modified、1 個 untracked）

無變更時顯示 `clean`。

#### Random Quote（隨機格言）

定時隨機顯示自訂詞句，同一時間窗口內顯示同一句（跨 process 一致）。

顯示效果：`保持專注`

| 參數 | 說明 | 預設值 |
|------|------|--------|
| `metadata.quotes` | 自訂詞句，以 `\|` 分隔 | 5 句英文預設語 |
| `metadata.interval` | 切換間隔（秒） | `60` |

### getDynamicColor（動態顏色機制）

Widget 介面新增可選方法 `getDynamicColor()`，讓 widget 依據執行狀態動態決定顏色，覆寫靜態設定的 `color`。目前 Context Dots 和 Context Percentage 使用此機制。

## 安裝

```bash
# 使用 npx
npx -y @ader-hwang/ccstatusline@latest

# 使用 bunx
bunx -y @ader-hwang/ccstatusline@latest
```

在 `~/.claude/settings.json` 中設定：

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx -y @ader-hwang/ccstatusline@latest",
    "padding": 0
  }
}
```

設定檔位於 `~/.config/ccstatusline/settings.json`，可手動編輯或透過 TUI 設定。

### 設定範例

兩行式佈局 — **第一行**：Model | Thinking Effort | Context Dots | Random Quote，**第二行**：Git Root Dir | Git Branch | Git File Status | Git Changes

將以下內容複製到 `~/.config/ccstatusline/settings.json`（亦可參考 `config/settings.example.json`）：

```json
{
  "version": 3,
  "lines": [
    [
      { "id": "1", "type": "model", "color": "cyan" },
      { "id": "2", "type": "separator" },
      { "id": "3", "type": "thinking-effort" },
      { "id": "4", "type": "separator" },
      { "id": "5", "type": "context-dots" },
      { "id": "6", "type": "separator" },
      {
        "id": "7",
        "type": "random-quote",
        "color": "brightCyan",
        "metadata": {
          "quotes": "每天進步一點點|保持專注|簡單就是美|先求有再求好|寫程式要開心|少即是多|程式是寫給人看的|今天也要全力以赴|不急，但不停|做完比做好更重要|重構是一種善良|好的命名勝過註解|別過度設計|一次只做一件事|休息是為了走更長的路|先跑起來再說|Bug 是學習的機會|測試是你最好的朋友|Coffee 加載中...|Keep Calm & Code On|享受解題的過程",
          "interval": "300"
        }
      }
    ],
    [
      { "id": "8", "type": "git-root-dir" },
      { "id": "9", "type": "separator" },
      { "id": "10", "type": "git-branch", "color": "magenta" },
      { "id": "11", "type": "separator" },
      { "id": "12", "type": "git-file-status", "color": "brightBlue" },
      { "id": "13", "type": "separator" },
      { "id": "14", "type": "git-changes", "color": "blue" }
    ],
    []
  ],
  "flexMode": "full-minus-40",
  "compactThreshold": 60,
  "colorLevel": 2,
  "inheritSeparatorColors": false,
  "globalBold": false,
  "powerline": {
    "enabled": false,
    "separators": [""],
    "separatorInvertBackground": [false],
    "startCaps": [],
    "endCaps": [],
    "autoAlign": false
  }
}
```

---

## 原始 ccstatusline 文件

完整原始文件請參考 [README.md](README.md)。
