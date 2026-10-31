# 🏄‍♂️ Edge Surf 3D - 經典離線衝浪與雪山冒險

[![Three.js](https://img.shields.io/badge/Three.js-r187-black?style=flat&logo=three.js)](https://threejs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)

經典微軟 Edge 瀏覽器離線卷軸衝浪遊戲（`edge://surf`）的 **3D 現代化復刻升級版**！具備多種自由切換的 3D 視角、右上角即時雷達小地圖監控海怪與雪人、跳台特技、氮氣衝刺以及跨裝置觸控操作。

---

## 🌐 線上直接遊玩

- **🎮 公開體驗網址**：[https://ais-pre-ceixzzkydxokx3j4s6z55v-284458756306.asia-northeast1.run.app](https://ais-pre-ceixzzkydxokx3j4s6z55v-284458756306.asia-northeast1.run.app)
- **🛠️ 開發預覽網址**：[https://ais-dev-ceixzzkydxokx3j4s6z55v-284458756306.asia-northeast1.run.app](https://ais-dev-ceixzzkydxokx3j4s6z55v-284458756306.asia-northeast1.run.app)

---

## ✨ 遊戲特色亮點

### 1. 🎥 四種 3D 視角自由切換（快捷鍵 `V`）
- **第三人稱追尾（Chase View）**：跟隨衝浪板左右動態傾角，加速時附帶視野動態拉伸（FOV Speed Effect）。
- **經典復古俯瞰（Retro Top-Down View）**：忠實重現原版 Edge Surf 的街機鳥瞰視角，重溫童年回憶。
- **第一人稱極限視角（First-Person View）**：位於衝浪板鼻端視角，體驗海浪撲面與海怪在身後追趕的壓迫感。
- **電影動作鏡頭（Cinematic Action View）**：低角度動態側拍，呈現酷炫特技姿態。

### 2. 📡 右上角即時雷達小地圖（標記海怪與雪人）
- **範圍標尺**：60m 戰術圓盤雷達，配備實時旋轉掃描束與距離標尺。
- **海怪／雪怪追蹤**：
  - **海洋模式**：標記 **克拉肯巨型海怪（Kraken 🐙）** 與其竄出的觸手群，顯示即時逼近距離與危險警報。
  - **雪山模式**：標記 **狂暴雪怪（Yeti 👹）** 的狂奔追殺軌跡。
- **場地標記**：同步顯示前方跳台（金色箭頭 🟡）、氮氣能量罐（⚡）、愛心生命（❤️）與障礙物。
- **高對比度護目設計**：在白雪山坡與烈日海面上均擁有清晰銳利的文字與圖標讀數。

### 3. 🌊 雙關卡模式自由切換
- **海洋衝浪模式（Ocean Surf）**：
  - 湛藍漸層波浪水面、暗礁、珊瑚群、導航浮標、椰林小島與巨型克拉肯。
- **雪山極限模式（Snow Mountain）**：
  - 蔚藍雪山天際線、高山松樹、雪岩、滑雪標桿、冰裂隙與大雪人。

### 4. 🚀 跳台特技與極限逃生
- **360° 空中旋轉特技**：衝上坡道跳台騰空而起，空中自動展現特技翻轉並獲得高額額外加分！
- **氮氣衝刺系統（Nitro Boost）**：消耗推進能量條大幅加速，擺脫即將追上的海怪或雪人。
- **生命值與護盾防護**：共有 3 顆愛心，碰撞後具備短暫的無敵能量護盾與恢復期。

### 5. 👥 4 位經典角色選擇
- **Edge 經典衝浪客**：原汁原味的黃髮藍泳衣衝浪手。
- **疾速浪者 Kai**：高科技潛水防寒衣與碳纖維衝浪板。
- **極地企鵝 Tux**：身手敏捷的小企鵝，滑雪與衝浪雙棲明星。
- **酷玩小雪怪 Snowy**：戴著酷炫墨鏡的雪怪同伴。

### 6. 🔊 100% 程式化 Web Audio 音效
- 無需載入任何外部音訊檔案，純以 Web Audio API 合成：
  - 衝浪破浪聲 / 滑雪滑行聲（動態低通濾波粉紅噪聲）
  - 起跳騰空呼嘯與 360° 特技聲
  - 降落水花撲面低音震撼
  - 海怪地底低頻咆哮與雪人重踏
  - 道具拾取悅耳和弦 chime
  - 按 `M` 鍵隨時開啟／靜音

---

## 🎮 控制方式與快捷鍵

### 💻 電腦操作（鍵盤與滑鼠）
| 操作 | 按鍵 / 動作 |
| :--- | :--- |
| **左右轉向** | `A` / `D` 或 `方向鍵 ←` / `→` |
| **滑鼠雕刻** | 按住畫面左右拖曳進行轉向 |
| **加速 / 剎車** | `W` / `↑`（俯衝加速），`S` / `↓`（後壓減速） |
| **極速衝刺** | `空白鍵（Space）`（按住消耗能量衝刺） |
| **切換視角** | `V` 鍵（第三人稱 ➔ 復古俯瞰 ➔ 第一人稱 ➔ 電影鏡頭） |
| **收合/展開控制台** | `H` 鍵 |
| **靜音開關** | `M` 鍵 |
| **暫停 / 繼續** | `Esc` 或 `P` 鍵 |

### 📱 行動裝置（手機 / 平板）
- **觸控滑動**：在螢幕任意位置左右滑動即可流暢轉向。
- **螢幕按鈕**：底部提供大尺寸左/右轉向鍵與 **「衝刺 BOOST」** 大按鈕。

---

## 🏗️ 技術架構與專案結構

本專案採現代 Web 前端技術建構，完全落實「零外部依賴 404」與高效能 60FPS 渲染標準：

```
.
├── index.html                  # 遊戲入口 HTML 與 OpenGraph / SEO 設定
├── package.json                # 專案依賴管理
├── vite.config.ts              # Vite 建置配置
├── metadata.json               # 應用程式描述與能力宣告
└── src/
    ├── main.tsx                # React 渲染入口
    ├── App.tsx                 # 遊戲主控制器與狀態管理
    ├── index.css               # 全域樣式與 Tailwind CSS
    ├── types/
    │   └── game.ts             # 遊戲狀態、怪物、相機與障礙物 TypeScript 定義
    ├── audio/
    │   └── soundManager.ts     # 100% 程式化 Web Audio 合成器
    ├── game/
    │   ├── characters.ts       # 4 位角色的參數設定
    │   ├── proceduralAssets.ts # 程式化海浪、雪地、跳台條紋與眼睛貼圖生成器
    │   ├── modelFactory.ts     # 3~12 件複合式幾何體 3D 模型工廠（玩家、海怪、雪人、障礙物）
    │   └── threeEngine.ts      # Three.js 核心遊戲引擎（物理、相機、地圖無限循環、怪物追逐）
    └── components/
        ├── RadarMiniMap.tsx    # 右上角 2D Canvas 戰術雷達小地圖
        ├── HUDOverlay.tsx      # 頂部狀態列（分數、距離、愛心、氮氣表、速度表）
        ├── ControlDock.tsx     # 底部可折疊控制塢（視角選擇、主題切換、觸控鍵）
        ├── TitleScreen.tsx     # 主選單與自訂 SVG 標題
        ├── GameOverModal.tsx   # 結算與彩帶慶祝彈窗
        └── PauseModal.tsx      # 暫停選單
```

---

## 🛠️ 本地開發與建置

### 環境需求
- Node.js 18.0 或更高版本
- npm 或 yarn

### 安裝步驟
```bash
# 1. 複製專案或進入專案資料夾
cd applet

# 2. 安裝所有相依套件
npm install

# 3. 啟動本地開發伺服器（預設監聽 Port 3000）
npm run dev

# 4. 建置生產環境版本
npm run build

# 5. 執行 TypeScript 型別檢查
npm run lint
```

---

## 📜 授權協議
本專案採用 [Apache-2.0 License](LICENSE) 授權。
