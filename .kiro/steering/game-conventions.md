---
inclusion: auto
---

# 模拟经营+地牢探险游戏 — 核心约定

## 术语表

| 术语 | 英文标识 | 含义 |
|------|----------|------|
| 关外 | Outside_Castle | 城堡建设和经营部分，玩家在此招募冒险者、管理资源、制作装备 |
| 关内 | Inside_Dungeon | 地牢探险部分，玩家派遣冒险者进入地牢战斗和探索 |
| 冒险者 | Adventurer | 玩家招募和培养的角色单位，可派遣进入地牢 |
| 地牢 | Dungeon | 关内探险的场所，包含多个层级 |
| 地牢层级 | Dungeon_Layer | 地牢的深度单位，每层有不同难度和奖励 |
| 怪物 | Monster | 地牢中的敌对单位 |
| Boss | Boss | 每层地牢的最终挑战敌人 |
| 宝藏 | Treasure | 探索中可收集的资源和物品 |
| 资源 | Resource | 游戏中的可收集物品，包括金币、木头、石头 |
| 金币 | Gold | 游戏货币，通过炼金按钮产生 |
| 木头 | Wood | 建筑材料，通过收集按钮产生 |
| 石头 | Stone | 建筑材料，通过收集按钮产生 |
| 炼金按钮 | Alchemy_Button | 关外操作按钮，点击产生金币（5秒冷却） |
| 收集按钮 | Collect_Button | 关外操作按钮，点击产生木头和石头（10秒冷却） |
| 冷却时间 | Cooldown | 按钮点击后需要等待的时间 |
| 存档系统 | Save_System | 负责游戏进度的保存和加载 |
| 资源管理器 | ResourceManager | 管理资源数据（Gold、Stone、Wood）的增减和查询 |
| 按钮管理器 | ButtonManager | 管理按钮状态（可用/冷却中）和点击逻辑 |
| Canvas 渲染器 | Canvas_Renderer | 在 2D Canvas 上绘制按钮、资源显示、冷却倒计时 |
| 资源显示区域 | Resource_Display | 展示玩家当前持有的各类资源数量 |


## 架构约定

- **单文件架构**：所有游戏核心逻辑在 `index.html` 的 `<script>` 标签中
- **策略模式外置**：`combat-behaviors.js`（战斗行为：move/findTarget/canEngage + 技能方法 applyChainLightning/applySlowEffect）+ `combat-renderers.js`（渲染策略）通过 `<script src>` 引入
- **配置外置**：`board-config.js`、`physics-config.js`、`balance-config.js`、`level-config.js`、`piece-config.js`、`enemy-config.js`、`wave-config.js`、`stages-config.js`、`initial-layout.js`、`outside-config.js` 均为外部 JS 文件，通过 `<script src>` 引入，定义全局变量（如 `BOARD_CONFIG_EXTERNAL`、`STAGES_CONFIG_EXTERNAL`、`OUTSIDE_CONFIG_EXTERNAL` 等），在 `loadConfigs()` 中覆盖内置默认值
- **全局配置对象**：`PhysicsConfig`（物理参数：重力、碰撞衰减、弹球/点位半径）、`BalanceConfig`（平衡参数：近战距离、生成间隔、实体上限、投射物半径、单位尺寸）、`LevelConfig`（等级倍率表、最大等级）在 `index.html` 中定义内置默认值，外部 JS 通过 `Object.assign` 或直接赋值覆盖

## 关键设计决策

### 双重游戏循环
- **关外（Outside_Castle）**：模拟经营，为探险做准备
- **关内（Inside_Dungeon）**：地牢探险，为经营提供资源
- 两个系统相互依赖，形成完整的游戏循环

### 地牢探险系统（关内）
- **单文件架构**：核心逻辑在 `index.html` 的 `<script>` 标签中
- **配置外置**：战斗行为、敌人配置、关卡配置等通过外部 JS 文件引入
- **2D Canvas 渲染**：使用 Canvas API 进行图形渲染
- **回合制战斗**：基于速度属性的行动顺序
- **层级解锁**：击败 Boss 解锁下一层地牢

### 城堡经营系统（关外）
- **资源生产**：通过点击按钮产生资源
- **炼金机制**：5秒冷却，每次产生1金币
- **收集机制**：10秒冷却，每次产生3-6木头和3-6石头（随机）
- **自动存档**：资源变化时自动保存到浏览器本地存储
- **本地存储**：使用 localStorage 保存游戏进度，key 为 `underground_castle_outside`
- **逻辑分离**：核心逻辑放在 `outside-logic.js` 中便于测试，`index.html` 通过 `<script src>` 引入
- **配置文件**：`outside-config.js` 定义 `OUTSIDE_CONFIG_EXTERNAL` 全局变量，包含炼金/收集的冷却时间和产出数量配置
- **模块组成**：ResourceManager（资源管理）、ButtonManager（按钮管理）、SaveSystem（存档）、CanvasRenderer（渲染）、InputHandler（输入处理）
- **测试策略**：使用 fast-check 进行属性测试，Jest/Vitest 运行测试




