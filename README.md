# YT-Converter (YouTube to M4A/MP3 Converter)

這是一個簡單、高效且支援跨平台（Windows & macOS）的 YouTube 音訊轉換桌面應用程式。

## 🌟 核心功能

- **多工處理**：支援同時下載與轉換多個 YouTube 連結。
- **高品質音訊**：提供「高品質 (256kbps+)」與「標準音質 (128kbps)」選擇。
- **跨平台支援**：同時支援 Windows (x64) 與 macOS (Apple Silicon)。
- **內建工具**：內建獨立的 `yt-dlp` 與 `ffmpeg`，使用者不需要額外安裝 Python 或其他依賴環境，開箱即用。
- **純隱私下載**：所有下載與轉檔操作皆在本機進行，不經過任何外部伺服器。

## 🚀 使用方法

1. **選擇儲存路徑**：點擊「變更」按鈕選擇您想儲存音樂的資料夾（預設為下載資料夾）。
2. **貼上連結**：將 YouTube 網址貼入輸入框中。
3. **選擇音質**：根據需求選擇標準或高品質。
4. **加入列表**：點擊「加入列表」後，程式會自動開始解析、下載並轉檔。
5. **完成**：轉檔完成後，檔案會出現在您設定的資料夾中。

## 🛠 開發與打包說明

本專案基於 **Electron** 開發。如果您想自行打包執行檔，請參考以下步驟：

### 1. 安裝依賴
```bash
npm install
```

### 2. 準備二進位檔
為了確保跨平台穩定性，專案需要將對應平台的 `yt-dlp` 與 `ffmpeg` 放入 `bin/` 目錄：
- `bin/yt-dlp` (macOS)
- `bin/yt-dlp.exe` (Windows)
- `bin/ffmpeg` (macOS)
- `bin/ffmpeg.exe` (Windows)

### 3. 本地開發啟動
```bash
npm start
```

### 4. 執行打包
程式會同時產出 Mac (.dmg) 與 Windows (.exe) 安裝包，儲存於 `dist/` 資料夾。
```bash
npm run build
```

## 📦 支援平台

- **macOS**: 支援 Apple Silicon (M1/M2/M3) 版本（.dmg）。
- **Windows**: 支援常見的 Intel/AMD x64 架構（.exe）。

---
*本工具僅供個人學習與學術研究使用，請尊重版權並遵守 YouTube 服務條款。*
