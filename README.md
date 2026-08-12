# 🚀 JJ 企業智慧業務與出貨管理系統 (JJ Enterprise Logistics & Order Management System)

專為中小企業與業務團隊打造的現代化、全方位雲端業務與出貨管理系統。整合了 **業務訂單追蹤**、**出貨安排與 PDF 裝箱單**、**工廠生管進度看板**、**Excel 智慧匯入/匯出** 以及 **Outlook 郵件自動同步**。

🔗 **線上系統預覽 (GitHub Pages)**: [https://chihyu1118-ship-it.github.io/JJ/](https://chihyu1118-ship-it.github.io/JJ/)

---

## ✨ 核心功能模組

1. **📊 2026 Bento Grid 智慧儀表板**
   - 即時掌握總營業額市值、進行中訂單數、產品總庫存量與未完成待辦任務。
   - 現代化暗色玻璃擬態 (Dark Glassmorphism) 視覺設計，支援桌面與手機 RWD 自適應。

2. **📦 業務訂單追蹤管理**
   - 記錄客戶名稱、品項、數量、金額、交期與訂單狀態（處理中/已出貨/已結案）。
   - 支援 **Excel (.xlsx/.csv) 智慧匯入與一鍵匯出**，方便與舊有資料無縫接軌。

3. **🚚 出貨安排與正式 PDF 裝箱單**
   - 管理裝箱數、總毛重 (kg)、材積 (CBM) 與指定物流商及追蹤單號。
   - 支援一鍵生成並下載符合國際標準的 **官方 PDF 裝箱單 (Packing List)**。

4. **🏭 工廠生管製作進度看板**
   - 五大製造節點（待排程 ➔ 裁切中 ➔ 組裝中 ➔ 品管中 ➔ 已完工）即時看板管理。

5. **📇 客戶名冊與產品庫存管理**
   - 集中管理客戶聯絡人資訊與核心產品 SKU 庫存與單價。

6. **✅ 工作待辦事項 (To-Do List)**
   - 每日任務隨手記錄、優先級分類（高/中/低）與交期提醒。

7. **✉️ Outlook 郵件自動同步模擬**
   - 模擬 Microsoft Graph API 自動解析並同步客戶新訂單與出貨通知郵件。

---

## 🛠️ 技術堆疊 (Tech Stack)

* **前端框架**：React 19 + TypeScript + Vite
* **樣式設計**：Tailwind CSS v4 (Glassmorphism & Bento Grid)
* **圖標庫**：Lucide React
* **檔案處理**：SheetJS (`xlsx`) 處理 Excel 匯入匯出
* **PDF 生成**：`jsPDF` & `jspdf-autotable`
* **部署託管**：GitHub Pages (CI/CD 自動化部署)

---

## 🔒 系統安全

* 內建 GitHub Pages 專屬安全密碼驗證機制（預設密碼：`1234`），確保企業機密資料絕不外洩。

---
© 2026 JJ Enterprise. All rights reserved.
