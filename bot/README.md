# BookingHub Telegram Bot

VIP 貴賓廳訂房管理系統 — Telegram Bot 後端

## 快速開始

### 1. 建立 Telegram Bot

1. 在 Telegram 中搜尋 `@BotFather`
2. 發送 `/newbot`
3. 按照提示設定 Bot 名稱和使用者名稱
4. 取得 Bot Token（格式如 `123456789:ABCdefGHIjklMNOpqrSTUvwxYZ`）

### 2. 啟動 Bot

```bash
# 設定環境變數
set TELEGRAM_BOT_TOKEN=你的Bot_Token

# 啟動
node bot/bot.js
```

### 3. 使用 Bot

在 Telegram 中找到你的 Bot，發送 `/start` 開始使用。

## 功能

| 指令 | 說明 |
|------|------|
| `/start` | 啟動 Bot，顯示主選單 |
| `/book` | 開始新增訂房 |
| `/help` | 顯示使用說明 |
| `/cancel` | 取消當前操作 |

### 訂房流程（按鈕式）

```
/book → 選擇體系 → 選擇酒店 → 選擇房型
→ 輸入客人姓名 → 入住日期 → 退房日期 → 房間數
→ 選擇補償類型 → 選擇接送 → 輸入手機 → 航班 → 備註
→ 確認送出
```

送出後資料即時寫入 Firebase RTDB，管理系統即時同步顯示。

## 技術特性

- **零依賴** — 僅使用 Node.js 內建模組（https, crypto）
- **Long-polling** — 無需公開 URL，不需 webhook
- **InlineKeyboard** — 按鈕式對話流程，員工無需打字即可操作
- **Firebase REST API** — 直接寫入 RTDB，與 Web 端共用同一資料庫
- **路徑隔離** — 使用 `booking_data/` 前綴，與 v13 的 `macau_data/` 完全隔離
- **操作日誌** — 每次操作寫入 `botLogs/` 路徑，Web 端 Bot 日誌頁即時顯示

## 與 Web 系統的關係

```
Telegram Bot (員工)  ──→  Firebase RTDB  ←──  Web App (管理員)
     bot/bot.js              booking_data/         src/sync/firebase.js
```

- Bot 寫入的訂房記錄，Web 端透過 watchers 即時接收
- Web 端的修改也會透過 Firebase 即時同步
- 兩端共用同一個 Firebase 專案，路徑完全隔離

## 授權控制

在 `bot/bot.js` 的 `CONFIG.AUTHORIZED_USERS` 中填入允許使用的 Telegram User ID：

```javascript
AUTHORIZED_USERS: [123456789, 987654321],
```

空陣列表示允許所有人使用（不建議在正式環境使用）。

取得你的 User ID：在 Telegram 中訊息 `@userinfobot`。
