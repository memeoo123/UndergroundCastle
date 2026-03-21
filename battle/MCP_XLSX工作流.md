# XLSX Reader MCP — 安装与工作流

## 目标流程

1. **我（AI）** 通过 MCP 读取 `地下城堡数值表.xlsx`（可选 **含公式**）。
2. **我** 按你的需求给出改数建议、公式写法、设计结论。
3. **你** 在 Excel 里 **手改 xlsx**（本 MCP **只读**，不写回文件）。

> 扩展名请使用 **`.xlsx`**（不是 xlsl）。

---

## 一次性安装（本机）

在项目里的 MCP 子目录执行：

```bash
cd xlsx-mcp-main
npm install
npm run build
```

完成后必须存在文件：`xlsx-mcp-main/build/index.js`。

---

## Cursor 已配置

本仓库已添加 **`.cursor/mcp.json`**，使用：

- `command`: `node`
- `args`: `${workspaceFolder}/xlsx-mcp-main/build/index.js`

### 若 MCP 无法启动

1. 确认已执行上面的 `npm install` 与 `npm run build`。
2. 若 Cursor **不识别** `${workspaceFolder}`，请把 `mcp.json` 里路径改成你的 **绝对路径**，例如：  
   `D:/data/数值策划/地下城堡数值表/xlsx-mcp-main/build/index.js`（注意正斜杠）。
3. **重载窗口** 或 **重启 Cursor**，并在 **Settings → MCP** 中确认 `xlsx-reader` 已启用、无报错。

---

## 调用 MCP 时请提供

- **`filePath`**：**绝对路径**最稳，例如：  
  `D:/data/数值策划/地下城堡数值表/地下城堡数值表.xlsx`
- **`sheetName`**：如 `1-基础属性说明`、`2-公式`、`4-敌人配置` 等。
- **读公式**：在 `read_xlsx` 中设置 **`includeFormulas`: `true`**，有公式的格子会显示为：  
  `=公式表达式 → 计算结果`；纯常量格仍为普通值。
- **先看结构**：用 **`analyze_xlsx`** 可看各 Sheet 名称、行数、**含公式的单元格数量**。

---

## 工具说明（本仓库内已增强）

| 工具 | 说明 |
|------|------|
| `read_xlsx` | 读指定文件/Sheet/区域；支持 `includeFormulas` 同时看公式与计算值 |
| `analyze_xlsx` | 工作簿结构、预览；各 Sheet 会显示 **Formula Cells** 数量 |

---

## 与 CSV / `build_numerical_sheet.py` 的关系

- **CSV + 脚本**：仍是「单一真源 → 生成 xlsx」的主流水线。
- **MCP**：适合「已经有一份 xlsx、要读当前格子和公式、再手改」的迭代。

两者可同时使用，注意 **手改 xlsx 后若再跑脚本生成，会覆盖 xlsx**；重要改动建议备份或回写到 CSV。
