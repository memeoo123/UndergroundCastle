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
| 地牢层级 | Dungeon_Layer | 地牢的深度单位，分为固定层和随机层两种类型 |
| 固定层 | Fixed_Layer | 每5层出现一次（第5层、第10层、第15层……）的资源层级，地图小、布局固定、无怪物无Boss，包含固定的矿产建筑，返回入口即解锁下一层 |
| 随机层 | Random_Layer | 非固定层的普通层级，地图大（50x50）、随机生成、每步随机遇怪、传送阵位置随机 |
| 矿产建筑 | Mine_Facility | 固定层中的资源生产设施，玩家到达后可采集对应资源 |
| 木厂 | Lumber_Mill | 固定层矿产建筑，采集产出木头（第5层固定层） |
| 石头矿场 | Stone_Mine | 固定层矿产建筑，采集产出石头（第5层固定层） |
| 铁矿场 | Iron_Mine | 固定层矿产建筑，采集产出铁（第10层固定层） |
| 金矿场 | Gold_Mine | 固定层矿产建筑，采集产出金矿（第10层固定层） |
| 炼钢厂 | Steel_Forge | 固定层矿产建筑，采集产出钢（第15层固定层） |
| 水晶矿 | Crystal_Mine | 固定层矿产建筑，采集产出水晶（第15层固定层） |
| 符文祭坛 | Rune_Altar | 固定层矿产建筑，采集产出符文（第20层固定层） |
| 暗钢矿脉 | Darksteel_Vein | 固定层矿产建筑，采集产出暗钢（第20层固定层） |
| 下层入口 | Layer_Entrance | 固定层中通往下一层的固定位置入口 |
| 快速传送 | Quick_Teleport | 玩家进入探险时可从已到达过的固定层列表中选择起始层 |
| 怪物 | Monster | 地牢中的敌对单位 |
| Boss | Boss | 每层地牢的最终挑战敌人 |
| 宝藏 | Treasure | 探索中可收集的资源和物品 |
| 资源 | Resource | 游戏中的可收集物品，包括金币、木头、石头、小麦、面包、皮革、布料、丝绸、铁、钢、水晶、符文、暗钢、福音、金矿、魔粉、灵木 |
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
| 魔粉 | MagicPowder | 魔粉工匠消耗水晶产出的魔法材料 |
| 灵木 | SpiritWood | 灵木工匠消耗木头和魔粉产出的高级材料 |
| 炼金按钮 | Alchemy_Button | 关外操作按钮，点击产生金币（5秒冷却） |
| 收集按钮 | Collect_Button | 关外操作按钮，点击产生木头和石头（10秒冷却） |
| 冷却时间 | Cooldown | 按钮点击后需要等待的时间 |
| 存档系统 | Save_System | 负责游戏进度的保存和加载 |
| 资源管理器 | ResourceManager | 管理资源数据（Gold、Stone、Wood、Wheat、Bread、Leather、Cloth、Silk、Iron、Steel、Crystal、Rune、Darksteel、Gospel、GoldOre、MagicPowder、SpiritWood）的增减、查询、批量检查（hasEnough）和批量扣除（deduct） |
| 按钮管理器 | ButtonManager | 管理按钮状态（可用/冷却中）和点击逻辑 |
| Canvas 渲染器 | Canvas_Renderer | 在 2D Canvas 上绘制按钮、资源显示、冷却倒计时 |
| 资源显示区域 | Resource_Display | 展示玩家当前持有的各类资源数量 |
| 页面管理器 | Page_Manager | 管理多个全屏页面的切换、拖拽滑动和动画逻辑 |
| 地下城堡界面 | Castle_Page | 主界面（页面0），顶部标题"地下城堡"，包含炼金按钮、建造按钮、训练按钮和探险按钮 |
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
| 魔粉工匠 | MagicPowdersmith | 工作岗位，每工匠每15秒消耗100水晶产出1魔粉 |
| 灵木工匠 | SpiritWoodsmith | 工作岗位，每工匠每15秒消耗900木头+1魔粉产出1灵木 |
| 布料工 | ClothWorker | 工作岗位，每工匠每15秒消耗1面包产出1布料 |
| 丝绸工匠 | SilkWorker | 工作岗位，每工匠每15秒消耗15布料产出1丝绸 |
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
| 产出预览 | Production_Preview | 地下王国界面显示的当前岗位分配下，所有工匠满负荷工作时的理论资源变化量（不考虑当前资源库存限制） |
| 仓库 | Warehouse | 地下城堡界面显示所有资源总和的区域，使用滚动视图 |
| 滚动视图 | ScrollView | 用于显示超出屏幕内容的可滚动列表区域，支持鼠标滚轮和触摸拖拽 |
| 建筑界面 | Building_Page | 点击建造按钮打开的独立全屏界面，显示所有可建造建筑的列表（配置驱动） |
| 训练按钮 | Train_Button | 位于 Castle_Page 建造按钮下方的训练操作按钮，点击打开 Training_Page |
| 探险按钮 | Explore_Button | 位于 Castle_Page 训练按钮下方的探险操作按钮，点击切换到地牢选择界面（DungeonSelectUI） |
| 训练界面 | Training_Page | 点击训练按钮打开的独立全屏界面，显示招募按钮和士兵列表，支持招募士兵和直接进阶操作 |
| 招募按钮 | Recruit_Button | 位于 Training_Page 内的按钮，点击招募一个1阶士兵 |
| 士兵条目 | Soldier_Entry | Training_Page 中竖向排列的单个士兵显示行，包含名称、阶级、属性、进阶费用和进阶按钮（直接升阶） |
| 建筑列表 | Building_List | Building_Page 中从 Job_Config.buildings 读取的所有建筑定义列表 |
| 建筑条目 | Building_Entry | 建筑列表中的单条信息，包含建筑名称、费用、效果、已建造数量和建造按钮 |
| 士兵 | Soldier | 玩家使用资源招募的战斗单位，具有攻击力、防御力、生命值属性，通过进阶获得高阶兵种 |
| 士兵配置 | Soldier_Config | 外置配置文件 soldier-config.js，定义10阶线性士兵体系，属性严格对应手动表-4-标准士兵表，含 tiers/promoteCosts/teamSize/recruitCost |
| 士兵管理器 | SoldierManager | 管理士兵的招募（1阶）、线性进阶（直接升下一阶）、查询，配置驱动 |
| 战斗引擎 | CombatEngine | 处理独立 CD 制战斗逻辑和伤害计算，使用减法公式 |
| 探索管理器 | ExplorationManager | 处理地牢区域发现、移动、遭遇触发和探索进度 |
| 进度追踪器 | ProgressTracker | 记录玩家的地牢解锁和完成状态 |
| 攻击 CD | Attack_Cooldown | 每个士兵和敌人的独立攻击冷却时间，计算公式：speed_baseline / 速度（秒），speed_baseline=10 时速度10的单位1秒1刀 |
| ATB 时间条 | ATB_Bar | Active Time Battle 时间条系统，atb_max=10000，speed_baseline=10，atb_speed_factor=1000 |
| 减法公式 | Subtraction_Formula | 战斗伤害公式：我方 damage = max(D_min, (攻击-敌防) × 上阵人数)，敌方 damage = max(D_min, 敌攻-我方最高防御)，D_min=1 |
| 先攻防差再乘人数 | Attack_Minus_Defense_Then_Multiply | 减法公式乘序约定：先算 (攻击−守方防御)，再乘人数，全项目统一此乘序 |
| 队伍总血量 | Party_Total_HP | 我方所有士兵血量之和，敌人攻击直接扣除队伍总血量，归零则探险失败 |
| 辅助技能 | Buff_Skill | 士兵的增益技能，攻击时自动释放，为自己施加状态效果 |
| 迷雾战争 | FogOfWar | 管理地牢地图的视野和迷雾状态，未探索区域全黑 |
| 场景管理器 | SceneManager | 管理关外/关内场景切换（outside/dungeon-select/exploration/combat/portal-select） |
| 标准士兵表 | Soldier_Table | 手动表-4-标准士兵表.json，我方士兵属性的权威数据源（1-10阶，含攻击/血量/防御/队伍数量） |
| 标准敌人表 | Enemy_Table | 手动表-5-标准敌人表.json，敌方单位属性的权威数据源（1-10阶，含攻击/血量/防御） |
| 地牢地图 | DungeonMap | 管理网格地图数据，固定层小地图、随机层50x50大地图，包括地块类型和内容 |
| 地牢选择界面 | DungeonSelectUI | 派遣队伍和选择地牢层级的 UI |
| 地牢渲染器 | DungeonRenderer | 负责探索界面的 Canvas 渲染（地图网格、迷雾、玩家位置） |
| 战斗渲染器 | CombatRenderer | 负责战斗界面的 Canvas 渲染（单位血条、技能菜单、战斗日志） |
| 配置加载器 | ConfigLoader | 统一加载所有关内配置（地牢/怪物/Boss/战斗），提供 isResourceLayer(layerId) 和 getResourceLayer(layerId) 方法判断和获取资源层配置 |
| 地牢配置 | Dungeon_Config | 外置配置文件 dungeon-config.js，定义地图尺寸、视野、随机层级（layers）和资源层级（resourceLayers），含 isResourceLayer(layerId) 和 getResourceLayer(layerId) 辅助方法 |
| 怪物配置 | Monster_Config | 外置配置文件 monster-config.js，定义8阶18种怪物（每种含 tier/stats/skills/rewards），属性来自标准敌人表 |
| Boss 配置 | Boss_Config | 外置配置文件 boss-config.js，定义8个Boss（T1~T8，每层一个，HP约2.5倍同阶普通怪） |
| 战斗配置 | Combat_Config | 外置配置文件 combat-config.js，定义 ATB 常数（atb_max/speed_baseline/atb_speed_factor/D_min）、减法伤害公式、技能、状态效果 |
| 视野范围 | View_Range | 以玩家位置为中心，曼哈顿距离 ≤ 2 的 5x5 区域 |
| 地块 | Tile | 地牢地图的最小单位，类型包括 empty/wall/entrance/portal，可含怪物/宝藏/传送阵/矿产设施（facility）内容 |
| 传送阵 | Teleport_Portal | 随机层中的传送设施（portal 类型地块），位于距入口最远的可达位置，踏入时触发 Boss 战，击败后显示传送选择界面（PortalSelectUI），可选择进入下一层、其他已解锁层级或返回关外 |
| 传送选择界面 | PortalSelectUI | Boss 战胜利后显示的层级选择 UI，列出下一层和所有已解锁层级供玩家传送，也可选择返回关外 |
| 史莱姆 | Slime | T1怪物（攻54/防20/血320/速8） |
| 蝙蝠 | Bat | T1怪物，高速（攻54/防20/血320/速12） |
| 巨鼠 | Rat | T1怪物（攻54/防20/血320/速9） |
| 骷髅 | Skeleton | T2怪物（攻89/防33/血1336/速8），拥有重击技能 |
| 幽灵 | Ghost | T2怪物，高速（攻89/防33/血1336/速12） |
| 巨蛛 | Spider | T2怪物（攻89/防33/血1336/速10） |
| 毒蘑菇 | Mushroom | T3怪物（攻187/防56/血3560/速8） |
| 洞穴蠕虫 | Cave_Worm | T3怪物（攻187/防56/血3560/速7） |
| 火焰小鬼 | Fire_Imp | T4怪物（攻376/防93/血8152/速11） |
| 熔岩犬 | Lava_Hound | T4怪物（攻376/防93/血8152/速9），拥有重击技能 |
| 冰霜元素 | Frost_Elemental | T5怪物（攻736/防155/血17360/速10） |
| 冰魂 | Ice_Wraith | T5怪物，高速（攻736/防155/血17360/速12） |
| 石像守卫 | Stone_Guardian | T6怪物（攻1408/防258/血35136/速7），拥有重击技能 |
| 远古亡灵 | Ancient_Spirit | T6怪物（攻1408/防258/血35136/速10） |
| 沼泽兽 | Swamp_Beast | T7怪物（攻2349/防431/血58616/速8），拥有重击技能 |
| 毒龙 | Poison_Drake | T7怪物（攻2349/防431/血58616/速11） |
| 虚空暗影 | Void_Shade | T8怪物，高速（攻3917/防719/血97736/速12） |
| 裂隙猎手 | Rift_Stalker | T8怪物（攻3917/防719/血97736/速10），拥有重击技能 |
| 哥布林王 | Goblin_King | T1 Boss（攻54/防20/血800/速10），拥有重击和战吼技能 |
| 暗影领主 | Shadow_Lord | T2 Boss（攻89/防33/血3340/速10），拥有重击和战吼技能 |
| 蘑菇王 | Mushroom_King | T3 Boss（攻187/防56/血8900/速8），拥有重击和战吼技能 |
| 烈焰守卫 | Flame_Guardian | T4 Boss（攻376/防93/血20380/速9），拥有重击和战吼技能 |
| 冰霜巨龙 | Frost_Wyrm | T5 Boss（攻736/防155/血43400/速10），拥有重击和战吼技能 |
| 远古石像 | Ancient_Golem | T6 Boss（攻1408/防258/血87840/速7），拥有重击和战吼技能 |
| 沼泽恐魔 | Swamp_Horror | T7 Boss（攻2349/防431/血146540/速9），拥有重击和战吼技能 |
| 虚空行者（Boss） | Void_Walker | T8 Boss（攻3917/防719/血244340/速11），拥有重击和战吼技能 |
| 招募 | Recruit | 消耗资源创建一个1阶士兵实例 |
| 进阶 | Promote | 消耗资源将士兵直接升到下一阶，线性进阶无需选择 |
| 阶级 | Tier | 士兵的等级层次，T1~T10共10阶，属性严格对应手动表-4-标准士兵表 |


## 架构约定

- **单文件架构**：所有游戏核心逻辑在 `index.html` 的 `<script>` 标签中
- **策略模式外置**：`combat-behaviors.js`（战斗行为：move/findTarget/canEngage + 技能方法 applyChainLightning/applySlowEffect）+ `combat-renderers.js`（渲染策略）通过 `<script src>` 引入
- **配置外置**：`board-config.js`、`physics-config.js`、`balance-config.js`、`level-config.js`、`piece-config.js`、`enemy-config.js`、`wave-config.js`、`stages-config.js`、`initial-layout.js`、`outside-config.js`、`job-config.js`、`resource-config.js`、`soldier-config.js`、`dungeon-config.js`、`monster-config.js`、`boss-config.js`、`combat-config.js` 均为外部 JS 文件，通过 `<script src>` 引入，定义全局变量（如 `BOARD_CONFIG_EXTERNAL`、`STAGES_CONFIG_EXTERNAL`、`OUTSIDE_CONFIG_EXTERNAL`、`JOB_CONFIG_EXTERNAL`、`RESOURCE_CONFIG_EXTERNAL`、`SOLDIER_CONFIG_EXTERNAL`、`DUNGEON_CONFIG_EXTERNAL`、`MONSTER_CONFIG_EXTERNAL`、`BOSS_CONFIG_EXTERNAL`、`COMBAT_CONFIG_EXTERNAL` 等），在 `loadConfigs()` 中覆盖内置默认值
- **全局配置对象**：`PhysicsConfig`（物理参数：重力、碰撞衰减、弹球/点位半径）、`BalanceConfig`（平衡参数：近战距离、生成间隔、实体上限、投射物半径、单位尺寸）、`LevelConfig`（等级倍率表、最大等级）在 `index.html` 中定义内置默认值，外部 JS 通过 `Object.assign` 或直接赋值覆盖

## 关键设计决策

### 双重游戏循环
- **关外（Outside_Castle）**：模拟经营，为探险做准备
- **关内（Inside_Dungeon）**：地牢探险，为经营提供资源
- 两个系统相互依赖，形成完整的游戏循环

### 地牢探险系统（关内）
- **单文件架构**：核心逻辑在 `index.html` 的 `<script>` 标签中，关内逻辑分离到 `inside-logic.js`
- **配置外置**：`dungeon-config.js`（DUNGEON_CONFIG_EXTERNAL，地图尺寸/视野/层级定义）、`monster-config.js`（MONSTER_CONFIG_EXTERNAL，8阶18种怪物，属性来自标准敌人表）、`boss-config.js`（BOSS_CONFIG_EXTERNAL，8个Boss，HP约2.5倍同阶普通怪）、`combat-config.js`（COMBAT_CONFIG_EXTERNAL，伤害公式/技能/状态效果）
- **2D Canvas 渲染**：使用 Canvas API 进行图形渲染，DungeonRenderer 负责探索界面，CombatRenderer 负责战斗界面
- **迷雾战争（Fog of War）**：地图初始全黑，以玩家位置为中心、曼哈顿距离 ≤ 2 的 5x5 区域点亮，已点亮进度可持久化保存
- **地图规格**：50x50 网格，入口位于正中心 (25, 25)，每次进入从入口开始
- **地图生成**：随机生成 + BFS 连通性保证，入口周围 3x3 安全区无墙壁和怪物，传送阵（portal）放置在距入口最远的可达位置
- **独立 CD 战斗系统**：
  - 每个士兵和敌人有独立攻击 CD 计时器，`攻击CD = speed_baseline / 速度`（speed_baseline=10，速度10时1秒1刀）
  - ATB 常数：atb_max=10000, speed_baseline=10, atb_speed_factor=1000, D_min=1
  - 伤害公式（减法）：我方 `damage = max(D_min, (攻击 - 敌防) × 上阵人数)`，敌方 `damage = max(D_min, 敌攻 - 我方最高防御)`
  - 乘序约定：**先攻防差再乘人数** `(攻击−守方防御)×人数`，全项目统一
  - 敌方攻击时取我方队伍中最高防御值作为减伤
  - 士兵 CD 到期立即攻击，互不等待，敌人同理
  - 士兵攻击时自动释放所有可用辅助技能（buff）
  - 我方队伍共享血量池（所有士兵 hp 之和），敌人攻击直接扣队伍总血量
  - 队伍总血量 ≤ 0 探险失败，敌人血量 ≤ 0 战斗胜利
  - 每场战斗敌方永远只有 1 个单位（怪物或 Boss）
  - 战斗界面只显示队伍总血量条和敌人血量条，不显示单个士兵状态
  - 战斗完全自动进行，玩家无需手动操作，只需观战
  - 战斗通过 `CombatEngine.update(deltaTime)` 每帧更新，CD 倒计时和自动攻击在 update 中处理
  - 战斗结束后自动触发回调返回探索场景或关外场景
- **传送阵与层级推进**：
  - 每个随机层生成一个"传送阵"（portal 类型地块），位于距入口最远的可达位置
  - 玩家走到传送阵触发该层 Boss 战
  - 击败 Boss 后显示 PortalSelectUI 传送选择界面，可选择进入下一层、传送到其他已解锁层级、或返回关外
  - 选择传送到新层级时保留本次探险累计资源，重新生成目标层地图继续探险
  - Boss 战失败则结束探险返回关外，不保留资源，可从地牢选择界面重新挑战
- **资源层系统**：
  - 每隔5层（5、10、15...，即 `layerId % 5 === 0`）出现资源层而非战斗层
  - 资源层使用固定预设地图布局（20x20~30x30 小地图），不随机生成，由 `DungeonMap.initResourceLayer()` 处理
  - 资源层无怪物和 Boss，玩家可安全采集矿产
  - 矿产设施为 `facility` 类型地块内容，含 facilityType/name/resource/amount/collected 字段
  - 玩家走到矿产设施位置自动触发采集（`ExplorationManager.collectFacility()`），资源随机产出在配置的 min~max 范围内，采集后标记 collected=true
  - 矿产设施按深度配置：第5层（木厂、石头矿）、第10层（铁矿、金矿）、第15层（水晶矿、钢铁锻造）、第20层（符文祭坛、暗钢矿脉）
  - 完成资源层采集返回入口即可解锁下一层（`ProgressTracker.unlockNextLayer`），无需击败 Boss
  - 资源层配置存储在 `dungeon-config.js` 的 `resourceLayers` 字段，每层含 mapWidth/mapHeight/entrance/facilities/walls
  - DungeonRenderer 为不同矿产类型渲染不同颜色图标，已采集设施显示暗色+勾号
  - DungeonSelectUI 层级列表合并显示资源层，带 `[资源层]` 标签和"可探索/已到达"状态
  - ExplorationManager 通过 `_isResourceLayer` 标志追踪当前是否在资源层
  - FogOfWar 初始化使用 `DungeonMap.width/height`（适配资源层小地图尺寸）
- **场景切换**：SceneManager 管理 outside → dungeon-select → exploration → combat → portal-select 五个场景，portal-select 在 Boss 战胜利后显示传送选择覆盖层
- **存档扩展**：复用关外 SaveSystem，新增 dungeon 字段（unlockedLayers/completedLayers/layerProgress 含 fogState/bestRecords），fogState 使用紧凑格式减少存储
- **队伍派遣**：上阵人数随层级递增，由 `dungeon-config.js` 的 `partySizeByLayer` 配置驱动（1层1人、5层2人、10层3人、15层4人、20层5人、25层6人封顶），`ConfigLoader.getMaxPartySizeForLayer(layerId)` 返回对应层级的上限，DungeonSelectUI 切换层级时动态更新上限并截断超额队员。不可重复派遣，空队伍不可开始探险
- **探索机制**：四方向移动（上下左右），每次移动一格，已探索区域不触发新遭遇。方向控制通过点击 Canvas 实现：以 Canvas 中心为原点，|dx|>|dy| 判定为水平方向（左/右），否则为垂直方向（上/下）
- **资源获取**：战斗胜利给予金币和经验值（范围随机），宝藏收集添加物品到库存，探险成功返回时保存资源到玩家账户，全灭不保留
- **探险结束**：玩家走回地牢入口即结束探险，保存累计资源并返回关外；战斗全灭则不保留资源直接返回关外
- **模块组成**：SceneManager（场景切换）、DungeonMap（地图数据，含 initResourceLayer 资源层固定布局生成）、FogOfWar（迷雾状态）、ExplorationManager（探索流程，含 collectFacility 矿产采集）、CombatEngine（战斗逻辑）、ProgressTracker（进度追踪）、DungeonSelectUI（选择界面，合并显示资源层）、PortalSelectUI（传送选择界面）、DungeonRenderer（探索渲染，含矿产设施图标）、CombatRenderer（战斗渲染）、ConfigLoader（配置加载，含 isResourceLayer/getResourceLayer）

### 城堡经营系统（关外）
- **资源生产**：通过点击按钮产生资源
- **炼金机制**：5秒冷却，每次产生1金币
- **收集机制**：10秒冷却，每次产生3-6木头和3-6石头（随机）
- **自动存档**：资源变化时自动保存到浏览器本地存储
- **本地存储**：使用 localStorage 保存游戏进度，key 为 `underground_castle_outside`，存档格式包含 gold/stone/wood/wheat/bread/leather/cloth/silk/iron/steel/crystal/rune/darksteel/gospel/goldOre/magicPowder/spiritWood 资源、craftsman（totalCapacity）、jobs（各岗位分配数）、buildings（各建筑数量）、soldiers（士兵数组，每个含 tier/attack/defense/hp），旧存档缺少新字段时自动初始化为默认值
- **逻辑分离**：核心逻辑放在 `outside-logic.js` 中便于测试，`index.html` 通过 `<script src>` 引入
- **模块组成**：ResourceManager（资源管理，配置驱动，通过 addResource(key, amount) 统一接口）、ButtonManager（按钮管理）、SaveSystem（存档，配置驱动）、CanvasRenderer（渲染）、InputHandler（输入处理）、PageManager（页面管理）、CraftsmanManager（工匠管理）、JobManager（工作岗位管理）、BuildingManager（建筑管理）、ToastManager（资源变化浮动提示）、SoldierManager（士兵招募与进阶）
- **资源配置**：`resource-config.js` 中 `RESOURCE_CONFIG_EXTERNAL` 定义所有资源类型（key、中文名、初始值），ResourceManager/SaveSystem/RESOURCE_NAMES 均从此配置驱动，新增资源只需改配置文件
- **双页面滑动切换**：Castle_Page（炼金+建造+仓库滚动视图）和 Kingdom_Page（收集+工匠管理滚动视图+产出倒计时+产出预览）两个全屏页面，左右拖拽平滑切换，拖拽超过 30% 宽度自动切换，不足则回弹，easeOut 缓动动画（300ms），动画期间锁定拖拽。地下城堡显示仓库资源总览（滚动视图），地下王国不显示仓库
- **滚动视图交互**：支持鼠标滚轮和触摸拖拽两种滚动方式。触摸拖拽智能区分：垂直拖拽且在滚动区域内触发滚动，水平拖拽或不在滚动区域触发页面切换。每个页面独立维护滚动偏移量（castleScrollOffset/kingdomScrollOffset）
- **界面布局优化**：
  - 地下城堡界面：左侧竖向排列炼金按钮和建造按钮，右侧显示仓库滚动视图（占据大部分空间）
  - 地下王国界面：左侧竖向排列收集按钮、工匠信息（总数/可用）、产出倒计时、产出预览，右侧显示岗位分配滚动视图
  - 左右分栏设计：左侧固定显示操作和信息，右侧可滚动显示详细内容
- **配置文件**：`outside-config.js` 中 `OUTSIDE_CONFIG_EXTERNAL` 包含 `alchemy`（冷却/产出）、`collect`（冷却/产出范围）、`canvas`（尺寸）、`pages`（swipeThreshold/animationDuration）、`toast`（speed/duration/fontSize/spacing）五个配置段
- **工作岗位配置**：`job-config.js` 中 `JOB_CONFIG_EXTERNAL` 包含 `productionInterval`（产出周期15000ms）、`jobs`（farmer/baker/quarrier/lumberjack/ironMiner/steelsmith/goldMiner/smelter/crystalsmith/runesmith/missionary/darksteelsmith/magicPowdersmith/spiritWoodsmith/clothWorker/silkWorker 岗位定义，含 consumes/produces）、`buildings`（dormitory 建筑定义，含 cost/effect）
- **工匠与岗位系统**：工匠通过建造宿舍获得容量，分配到岗位后每15秒自动产出资源。资源转化链：农夫→小麦→面包工→面包→采石工/伐木工/铁矿工/金矿工→石头/木头/铁/金矿→炼钢工/熔炼工→钢/金币→水晶工匠/传教士/暗钢工匠→水晶/福音/暗钢→符文工匠→符文。资源不足时按 floor(available/cost) 计算实际可处理数
- **资源变化提示**：ToastManager 在资源增减时显示浮动文字提示（绿色增加/红色消耗），从 Canvas 中央缓慢下降并淡出，多条依次向下排列，独立于页面切换。通过包装 ResourceManager 方法和 JobManager.update 前后对比差异触发
- **测试策略**：使用 fast-check 进行属性测试，Jest/Vitest 运行测试
- **建筑界面**：Castle_Page 的"建造"按钮（通用文字"建造"）点击后打开独立的 Building_Page 全屏界面，显示所有 Job_Config.buildings 中定义的建筑列表（配置驱动，新增建筑无需改核心代码）。每个条目显示名称、费用、效果、已建造数量和建造按钮。Building_Page 打开时禁止页面左右拖拽切换，支持列表滚动。PageManager 通过 showBuildingPage 标志管理状态
- **士兵系统**：SoldierManager 管理士兵的招募和进阶，配置驱动。`soldier-config.js` 中 `SOLDIER_CONFIG_EXTERNAL` 定义10阶线性士兵体系（tiers/promoteCosts/teamSize/recruitCost），属性严格对应手动表-4-标准士兵表。招募创建1阶士兵，进阶直接升到下一阶无需选择。士兵数据持久化到 localStorage（soldiers 数组，每个含 tier/attack/defense/hp），缺失/损坏初始化为空数组
- **训练界面**：Castle_Page 的"训练"按钮（位于建造按钮下方）点击后打开独立的 Training_Page 全屏界面，遵循 Building_Page 相同的全屏覆盖模式（PageManager 通过 showTrainingPage 标志管理状态）。Training_Page 包含招募按钮（招募士兵）和士兵列表（ScrollView 竖向排列）。每个士兵条目显示名称、阶级、属性、进阶费用，未满阶时显示进阶按钮，点击直接进阶到下一阶




