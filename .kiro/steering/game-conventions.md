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
| 资源 | Resource | 游戏中的可收集物品，包括金币、木头、石头、小麦、面包、皮革、布料、丝绸、铁、钢、水晶、符文、暗钢、福音、金矿 |
| 金币 | Gold | 游戏货币，通过炼金按钮产生 |
| 木头 | Wood | 建筑材料，通过收集按钮产生 |
| 石头 | Stone | 建筑材料，通过收集按钮产生 |
| 小麦 | Wheat | 基础资源，由农夫岗位产出 |
| 面包 | Bread | 高级资源，由面包工岗位消耗小麦制作 |
| 皮革 | Leather | 制作材料 |
| 布料 | Cloth | 制作材料 |
| 丝绸 | Silk | 高级制作材料 |
| 铁 | Iron | 金属材料 |
| 钢 | Steel | 高级金属材料 |
| 水晶 | Crystal | 稀有材料 |
| 符文 | Rune | 魔法材料 |
| 暗钢 | Darksteel | 稀有金属材料 |
| 福音 | Gospel | 传教士产出的信仰资源 |
| 金矿 | GoldOre | 金矿工产出的原矿，熔炼工消耗金矿产出金币 |
| 炼金按钮 | Alchemy_Button | 关外操作按钮，点击产生金币（5秒冷却） |
| 收集按钮 | Collect_Button | 关外操作按钮，点击产生木头和石头（10秒冷却） |
| 冷却时间 | Cooldown | 按钮点击后需要等待的时间 |
| 存档系统 | Save_System | 负责游戏进度的保存和加载 |
| 资源管理器 | ResourceManager | 管理资源数据（Gold、Stone、Wood、Wheat、Bread、Leather、Cloth、Silk、Iron、Steel、Crystal、Rune、Darksteel、Gospel、GoldOre）的增减、查询、批量检查（hasEnough）和批量扣除（deduct） |
| 按钮管理器 | ButtonManager | 管理按钮状态（可用/冷却中）和点击逻辑 |
| Canvas 渲染器 | Canvas_Renderer | 在 2D Canvas 上绘制按钮、资源显示、冷却倒计时 |
| 资源显示区域 | Resource_Display | 展示玩家当前持有的各类资源数量 |
| 页面管理器 | Page_Manager | 管理多个全屏页面的切换、拖拽滑动和动画逻辑 |
| 地下城堡界面 | Castle_Page | 主界面（页面0），顶部标题"地下城堡"，包含炼金按钮和建造按钮 |
| 地下王国界面 | Kingdom_Page | 第二界面（页面1），顶部标题"地下王国"，包含收集按钮、工匠状态、岗位分配界面、产出倒计时和产出预览 |
| 滑动手势 | Swipe_Gesture | 玩家在 Canvas 上水平拖拽以切换页面的操作 |
| 页面偏移量 | Page_Offset | 当前页面视图的水平偏移像素值，用于实现平滑滑动 |
| 工匠 | Craftsman | 可分配到工作岗位的劳动力单位 |
| 工作岗位 | Job | 工匠被分配后定期消耗和产出资源的工作位置 |
| 农夫 | Farmer | 工作岗位，每工匠每15秒产出2个小麦 |
| 面包工 | Baker | 工作岗位，每工匠每15秒消耗2个小麦产出1个面包 |
| 采石工 | Quarrier | 工作岗位，每工匠每15秒消耗1面包产出3石头 |
| 伐木工 | Lumberjack | 工作岗位，每工匠每15秒消耗1面包产出3木头 |
| 铁矿工 | IronMiner | 工作岗位，每工匠每15秒消耗2面包产出1铁 |
| 炼钢工 | Steelsmith | 工作岗位，每工匠每15秒消耗4铁产出1钢 |
| 金矿工 | GoldMiner | 工作岗位，每工匠每15秒消耗10面包产出1金矿 |
| 熔炼工 | Smelter | 工作岗位，每工匠每15秒消耗1金矿产出11金币 |
| 水晶工匠 | Crystalsmith | 工作岗位，每工匠每15秒消耗4金币产出1水晶 |
| 符文工匠 | Runesmith | 工作岗位，每工匠每15秒消耗3水晶+1石头产出1符文 |
| 传教士 | Missionary | 工作岗位，每工匠每15秒消耗5金币产出1福音 |
| 暗钢工匠 | Darksteelsmith | 工作岗位，每工匠每15秒消耗10钢产出1暗钢 |
| 建筑 | Building | 玩家可建造的设施，消耗资源并提供功能 |
| 宿舍 | Dormitory | 建筑类型，建造后增加工匠容量 |
| 建造按钮 | Build_Button | 位于 Castle_Page 炼金按钮下方的建造操作按钮 |
| 产出周期 | Production_Tick | 工作岗位每15秒执行一次的资源产出事件 |
| 工匠管理器 | CraftsmanManager | 管理工匠总容量、已分配数和可用数 |
| 工作岗位管理器 | JobManager | 管理岗位分配和定期资源产出 |
| 建筑管理器 | BuildingManager | 管理建筑建造和建造按钮 |
| 工作岗位配置 | Job_Config | 外置配置文件，定义所有工作岗位和建筑的配置数据 |
| 资源变化提示管理器 | Toast_Manager | 管理浮动提示的创建、排队、动画更新和渲染 |
| 浮动提示 | Toast | 单条资源变化浮动提示，包含文字内容、位置、透明度等状态 |
| 产出倒计时 | Production_Countdown | 地下王国界面显示的距离下次 Production_Tick 剩余秒数 |
| 产出预览 | Production_Preview | 地下王国界面显示的当前岗位分配下，下次 tick 预计的资源变化量 |


## 架构约定

- **单文件架构**：所有游戏核心逻辑在 `index.html` 的 `<script>` 标签中
- **策略模式外置**：`combat-behaviors.js`（战斗行为：move/findTarget/canEngage + 技能方法 applyChainLightning/applySlowEffect）+ `combat-renderers.js`（渲染策略）通过 `<script src>` 引入
- **配置外置**：`board-config.js`、`physics-config.js`、`balance-config.js`、`level-config.js`、`piece-config.js`、`enemy-config.js`、`wave-config.js`、`stages-config.js`、`initial-layout.js`、`outside-config.js`、`job-config.js`、`resource-config.js` 均为外部 JS 文件，通过 `<script src>` 引入，定义全局变量（如 `BOARD_CONFIG_EXTERNAL`、`STAGES_CONFIG_EXTERNAL`、`OUTSIDE_CONFIG_EXTERNAL`、`JOB_CONFIG_EXTERNAL`、`RESOURCE_CONFIG_EXTERNAL` 等），在 `loadConfigs()` 中覆盖内置默认值
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
- **本地存储**：使用 localStorage 保存游戏进度，key 为 `underground_castle_outside`，存档格式包含 gold/stone/wood/wheat/bread/leather/cloth/silk/iron/steel/crystal/rune/darksteel/gospel/goldOre 资源、craftsman（totalCapacity）、jobs（各岗位分配数）、buildings（各建筑数量），旧存档缺少新字段时自动初始化为默认值
- **逻辑分离**：核心逻辑放在 `outside-logic.js` 中便于测试，`index.html` 通过 `<script src>` 引入
- **模块组成**：ResourceManager（资源管理，配置驱动，通过 addResource(key, amount) 统一接口）、ButtonManager（按钮管理）、SaveSystem（存档，配置驱动）、CanvasRenderer（渲染）、InputHandler（输入处理）、PageManager（页面管理）、CraftsmanManager（工匠管理）、JobManager（工作岗位管理）、BuildingManager（建筑管理）、ToastManager（资源变化浮动提示）
- **资源配置**：`resource-config.js` 中 `RESOURCE_CONFIG_EXTERNAL` 定义所有资源类型（key、中文名、初始值），ResourceManager/SaveSystem/RESOURCE_NAMES 均从此配置驱动，新增资源只需改配置文件
- **双页面滑动切换**：Castle_Page（炼金+建造）和 Kingdom_Page（收集+工匠管理+产出倒计时+产出预览）两个全屏页面，左右拖拽平滑切换，拖拽超过 30% 宽度自动切换，不足则回弹，easeOut 缓动动画（300ms），动画期间锁定拖拽
- **配置文件**：`outside-config.js` 中 `OUTSIDE_CONFIG_EXTERNAL` 包含 `alchemy`（冷却/产出）、`collect`（冷却/产出范围）、`canvas`（尺寸）、`pages`（swipeThreshold/animationDuration）、`toast`（speed/duration/fontSize/spacing）五个配置段
- **工作岗位配置**：`job-config.js` 中 `JOB_CONFIG_EXTERNAL` 包含 `productionInterval`（产出周期15000ms）、`jobs`（farmer/baker/quarrier/lumberjack/ironMiner/steelsmith/goldMiner/smelter/crystalsmith/runesmith/missionary/darksteelsmith 岗位定义，含 consumes/produces）、`buildings`（dormitory 建筑定义，含 cost/effect）
- **工匠与岗位系统**：工匠通过建造宿舍获得容量，分配到岗位后每15秒自动产出资源。资源转化链：农夫→小麦→面包工→面包→采石工/伐木工/铁矿工/金矿工→石头/木头/铁/金矿→炼钢工/熔炼工→钢/金币→水晶工匠/传教士/暗钢工匠→水晶/福音/暗钢→符文工匠→符文。资源不足时按 floor(available/cost) 计算实际可处理数
- **资源变化提示**：ToastManager 在资源增减时显示浮动文字提示（绿色增加/红色消耗），从 Canvas 中央缓慢下降并淡出，多条依次向下排列，独立于页面切换。通过包装 ResourceManager 方法和 JobManager.update 前后对比差异触发
- **测试策略**：使用 fast-check 进行属性测试，Jest/Vitest 运行测试




