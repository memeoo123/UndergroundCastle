# Requirements Document

## Introduction

关外经营系统是 Underground Castle 的地上经营部分。包含两个全屏界面（地下城堡/地下王国），通过拖拽切换。玩家点击按钮产生资源，分配工匠到岗位自动产出，建造建筑扩容。资源变化时显示浮动 Toast 提示。地下王国显示产出倒计时和预览。Castle_Page 的"建造"按钮打开独立 Building_Page。士兵系统支持招募冒险者和树形进阶。

## Glossary

- **Castle_Page**: 地下城堡界面（页面0），包含炼金按钮、建造按钮和仓库滚动视图
- **Kingdom_Page**: 地下王国界面（页面1），包含收集按钮、工匠状态、岗位分配界面、产出倒计时和产出预览
- **Building_Page**: 建筑界面，点击建造按钮打开的独立全屏界面，显示所有可建造建筑列表
- **Alchemy_Button**: 炼金按钮，点击产生金币（5秒冷却）
- **Collect_Button**: 收集按钮，点击产生木头和石头（10秒冷却）
- **Build_Button**: 建造按钮，位于 Castle_Page，点击打开 Building_Page
- **Cooldown**: 冷却时间，按钮点击后需要等待的时间
- **Resource**: 资源，包括金币(Gold)、石头(Stone)、木头(Wood)、小麦(Wheat)、面包(Bread) 等
- **ResourceManager**: 资源管理器，管理所有资源的增减、查询、批量检查和扣除
- **ButtonManager**: 按钮管理器，管理按钮状态和点击逻辑
- **SaveSystem**: 存档系统，负责游戏进度的保存和加载
- **PageManager**: 页面管理器，管理多个全屏页面的切换、拖拽滑动和动画逻辑
- **CanvasRenderer**: Canvas 渲染器，在 2D Canvas 上绘制所有界面元素
- **InputHandler**: 输入处理器，处理 mouse/touch/wheel 事件
- **Craftsman**: 工匠，可分配到工作岗位的劳动力单位
- **CraftsmanManager**: 工匠管理器，管理工匠总容量、已分配数和可用数
- **Job**: 工作岗位，工匠被分配后定期消耗和产出资源的工作位置
- **JobManager**: 工作岗位管理器，管理岗位分配和定期资源产出
- **BuildingManager**: 建筑管理器，管理建筑建造
- **Production_Tick**: 产出周期，工作岗位每15秒执行一次的资源产出事件
- **ToastManager**: 资源变化提示管理器，管理浮动提示的创建、动画和渲染
- **Toast**: 浮动提示，单条资源变化浮动文字提示
- **Warehouse**: 仓库，地下城堡界面显示所有资源总和的区域
- **ScrollView**: 滚动视图，用于显示超出屏幕内容的可滚动列表区域
- **Soldier**: 士兵，玩家使用资源招募的战斗单位，通过进阶获得高阶兵种
- **SoldierManager**: 士兵管理器，管理士兵的招募（仅冒险者）、进阶、查询
- **Soldier_Config**: 士兵配置，外置配置文件定义所有士兵类型
- **Recruit**: 招募，消耗资源创建一个冒险者(Tier 1)士兵实例
- **Promote**: 进阶，消耗资源将低阶兵种转变为高阶兵种
- **Tier**: 阶级，兵种的等级层次（1/2/3）
- **Job_Config**: 工作岗位配置，外置配置文件定义所有工作岗位和建筑
- **Train_Button**: 训练按钮，位于 Castle_Page 建造按钮下方，点击打开 Training_Page
- **Training_Page**: 训练界面，独立全屏界面，显示招募按钮和士兵列表，支持招募冒险者和士兵进阶操作
- **Recruit_Button**: 招募按钮，位于 Training_Page 内，点击招募一个冒险者
- **Soldier_Entry**: 士兵条目，Training_Page 中竖向排列的单个士兵显示行，包含士兵信息和操作按钮
- **Promote_Dialog**: 进阶弹窗，点击士兵条目按钮后弹出的对话框，显示可进阶的目标兵种及其费用

## Requirements

### Requirement 1: 炼金产金

**User Story:** 作为玩家，我想要点击炼金按钮产生金币，以便积累游戏货币。

#### Acceptance Criteria

1. WHEN 玩家点击 Alchemy_Button AND 按钮不在冷却中 THEN THE ResourceManager SHALL 增加 1 枚 Gold
2. WHEN 金币增加 THEN THE CanvasRenderer SHALL 立即更新显示
3. WHEN 玩家点击 Alchemy_Button AND 按钮不在冷却中 THEN THE ButtonManager SHALL 启动 5 秒 Cooldown
4. WHEN Cooldown 期间 THEN THE CanvasRenderer SHALL 显示剩余冷却时间
5. WHEN 玩家点击 Alchemy_Button AND 按钮在冷却中 THEN THE ButtonManager SHALL 忽略点击

### Requirement 2: 收集资源

**User Story:** 作为玩家，我想要点击收集按钮产生木头和石头，以便积累建筑材料。

#### Acceptance Criteria

1. WHEN 玩家点击 Collect_Button AND 按钮不在冷却中 THEN THE ResourceManager SHALL 增加 Stone +[3,6] 随机数量
2. WHEN 玩家点击 Collect_Button AND 按钮不在冷却中 THEN THE ResourceManager SHALL 增加 Wood +[3,6] 随机数量
3. WHEN 资源增加 THEN THE CanvasRenderer SHALL 立即更新显示
4. WHEN 玩家点击 Collect_Button AND 按钮不在冷却中 THEN THE ButtonManager SHALL 启动 10 秒 Cooldown
5. WHEN Cooldown 期间 THEN THE CanvasRenderer SHALL 显示剩余冷却时间
6. WHEN 玩家点击 Collect_Button AND 按钮在冷却中 THEN THE ButtonManager SHALL 忽略点击

### Requirement 3: 资源显示

**User Story:** 作为玩家，我想要随时查看当前拥有的资源数量，以便了解游戏进度。

#### Acceptance Criteria

1. THE CanvasRenderer SHALL 始终显示所有资源总量
2. WHEN 任何资源数量变化 THEN THE CanvasRenderer SHALL 在同帧反映变化

### Requirement 4: 自动存档

**User Story:** 作为玩家，我想要游戏自动保存进度，以便随时继续游戏。

#### Acceptance Criteria

1. WHEN 资源变化 THEN THE SaveSystem SHALL 持久化到 localStorage
2. WHEN 游戏加载 THEN THE SaveSystem SHALL 从 localStorage 恢复数据
3. IF 存档缺失或损坏 THEN THE SaveSystem SHALL 初始化所有资源为零

### Requirement 5: Canvas 渲染

**User Story:** 作为玩家，我想要看到清晰的游戏界面，以便轻松操作游戏。

#### Acceptance Criteria

1. THE CanvasRenderer SHALL 使用 2D Canvas 渲染按钮和资源
2. THE InputHandler SHALL 检测点击并触发对应动作
3. WHEN 按钮在 Cooldown 中 THEN THE CanvasRenderer SHALL 显示可区分的冷却状态

### Requirement 6: 双界面滑动切换

**User Story:** 作为玩家，我想要通过拖拽在两个界面间切换，以便方便地管理不同功能。

#### Acceptance Criteria

1. THE PageManager SHALL 管理 Castle_Page（默认）和 Kingdom_Page 两个全屏页面
2. WHEN 玩家水平拖拽 THEN THE PageManager SHALL 跟随手指移动页面
3. WHEN 拖拽距离 > 30% 屏幕宽度 THEN THE PageManager SHALL 完成页面切换
4. WHEN 拖拽距离 < 30% 屏幕宽度 THEN THE PageManager SHALL 回弹到原页面
5. WHEN 动画进行中 THEN THE PageManager SHALL 禁止新的拖拽操作
6. THE PageManager SHALL 限制页面偏移量在有效边界内

### Requirement 7: 工作岗位与建筑配置外置

**User Story:** 作为开发者，我希望工作岗位和建筑通过外置配置文件定义，以便新增内容时无需修改核心逻辑。

#### Acceptance Criteria

1. THE Job_Config SHALL 在 job-config.js 中定义所有岗位和建筑
2. WHEN 新增岗位或建筑到配置文件 THEN THE System SHALL 自动支持，无需修改核心逻辑

### Requirement 8: 新增资源类型

**User Story:** 作为开发者，我希望资源类型通过配置驱动，以便灵活扩展资源种类。

#### Acceptance Criteria

1. THE ResourceManager SHALL 管理所有资源（配置驱动）
2. THE SaveSystem SHALL 持久化和恢复所有配置中的资源
3. IF 存档中缺失资源字段 THEN THE SaveSystem SHALL 初始化为 0

### Requirement 9: 工匠管理

**User Story:** 作为玩家，我想要管理工匠的分配，以便优化资源产出。

#### Acceptance Criteria

1. THE CraftsmanManager SHALL 追踪 totalCapacity、assigned 和 available 数量
2. THE CraftsmanManager SHALL 保证 available = totalCapacity - assigned
3. WHEN available = 0 THEN THE CraftsmanManager SHALL 拒绝新的分配请求
4. THE SaveSystem SHALL 持久化和恢复工匠数据

### Requirement 10: 工作岗位资源产出

**User Story:** 作为玩家，我想要工匠在岗位上自动产出资源，以便持续积累财富。

#### Acceptance Criteria

1. THE JobManager SHALL 每 15 秒执行一次 Production_Tick
2. WHEN Production_Tick 触发 THEN Farmer 岗位 SHALL 每工匠产出 +2 Wheat
3. WHEN Production_Tick 触发 THEN Baker 岗位 SHALL 每工匠消耗 -2 Wheat 产出 +1 Bread
4. IF Baker 岗位 Wheat 不足 THEN THE JobManager SHALL 按 floor(wheat/2) 计算实际可处理工匠数
5. WHEN 产出完成 THEN THE CanvasRenderer SHALL 立即更新资源显示

### Requirement 11: 建造宿舍

**User Story:** 作为玩家，我想要建造宿舍增加工匠容量，以便分配更多工匠到岗位。

#### Acceptance Criteria

1. THE Build_Button SHALL 显示在 Castle_Page 上
2. WHEN 玩家点击建造 AND 资源充足 THEN THE BuildingManager SHALL 扣除资源并增加工匠容量
3. IF 资源不足 THEN THE BuildingManager SHALL 拒绝建造

### Requirement 12: 工匠分配界面

**User Story:** 作为玩家，我想要通过界面分配和取消分配工匠，以便灵活调整产出策略。

#### Acceptance Criteria

1. THE Kingdom_Page SHALL 显示工匠状态（总数/已分配/可用）
2. THE Kingdom_Page SHALL 显示 Job 列表，每个岗位带 +/- 按钮
3. WHEN 岗位分配数 = 0 THEN THE - 按钮 SHALL 不可用
4. WHEN 可用工匠 = 0 THEN THE + 按钮 SHALL 不可用

### Requirement 13: 存档兼容性

**User Story:** 作为玩家，我想要旧存档在游戏更新后仍能正常加载，以便不丢失进度。

#### Acceptance Criteria

1. WHEN 旧存档缺失新字段 THEN THE SaveSystem SHALL 初始化缺失字段为默认值
2. WHEN 新存档加载 THEN THE SaveSystem SHALL 正确恢复所有字段

### Requirement 14: 资源增加提示

**User Story:** 作为玩家，我想要在资源增加时看到浮动提示，以便直观了解收益。

#### Acceptance Criteria

1. WHEN 资源增加 THEN THE ToastManager SHALL 创建绿色浮动提示
2. THE Toast SHALL 显示格式为「+N 资源名」
3. WHEN 多种资源同时增加 THEN THE ToastManager SHALL 为每种资源分别创建独立 Toast

### Requirement 15: 资源减少提示

**User Story:** 作为玩家，我想要在资源减少时看到浮动提示，以便直观了解消耗。

#### Acceptance Criteria

1. WHEN 资源减少 THEN THE ToastManager SHALL 创建红色浮动提示
2. THE Toast SHALL 显示格式为「-N 资源名」
3. WHEN 多种资源同时减少 THEN THE ToastManager SHALL 为每种资源分别创建独立 Toast

### Requirement 16: Toast 显示位置与排列

**User Story:** 作为玩家，我想要浮动提示整齐排列，以便同时查看多条提示。

#### Acceptance Criteria

1. THE Toast SHALL 在 Canvas 中心位置出现
2. WHEN 存在多条 Toast THEN THE ToastManager SHALL 向下排列，不重叠

### Requirement 17: Toast 下降与淡出动画

**User Story:** 作为玩家，我想要浮动提示有平滑的动画效果，以便获得良好的视觉体验。

#### Acceptance Criteria

1. THE Toast SHALL 以固定速度下降
2. THE Toast SHALL 同时降低透明度
3. WHEN 透明度降至零 THEN THE ToastManager SHALL 移除该 Toast
4. THE Toast SHALL 在配置的生命周期内完成动画

### Requirement 18: Toast 与游戏循环集成

**User Story:** 作为开发者，我希望 Toast 系统与游戏主循环集成，以便每帧正确更新和渲染。

#### Acceptance Criteria

1. THE Game Loop SHALL 每帧更新和渲染所有活跃 Toast
2. THE Toast SHALL 渲染在最顶层
3. THE Toast SHALL 独立于页面切换，始终可见

### Requirement 19: Toast 可配置性

**User Story:** 作为开发者，我希望 Toast 的参数可通过外部配置调整，以便灵活调优视觉效果。

#### Acceptance Criteria

1. THE ToastManager SHALL 从外部配置读取速度、生命周期、字体大小和间距
2. IF 配置缺失 THEN THE ToastManager SHALL 使用默认值

### Requirement 20: Production Tick 倒计时显示

**User Story:** 作为玩家，我想要看到距下次产出的剩余时间，以便了解产出节奏。

#### Acceptance Criteria

1. THE Kingdom_Page SHALL 显示距下次 Production_Tick 的剩余秒数
2. WHEN lastTickTime = 0 THEN THE JobManager SHALL 显示完整周期时间
3. WHEN Production_Tick 触发后 THEN THE JobManager SHALL 重置倒计时
4. THE CanvasRenderer SHALL 每帧更新倒计时显示，使用整数秒向上取整
5. WHEN 无工匠分配 THEN THE Kingdom_Page SHALL 仍然显示倒计时

### Requirement 21: 产出预览显示

**User Story:** 作为玩家，我想要预览当前岗位配置的资源产出，以便优化分配策略。

#### Acceptance Criteria

1. THE Kingdom_Page SHALL 在岗位列表下方显示资源变化预览
2. THE JobManager.previewProduction SHALL 考虑 Wheat 库存限制计算实际产出
3. WHEN 预览值为正数 THEN THE CanvasRenderer SHALL 显示绿色
4. WHEN 预览值为负数 THEN THE CanvasRenderer SHALL 显示红色
5. WHEN 预览值为零 THEN THE CanvasRenderer SHALL 不显示该资源
6. WHEN 无工匠分配 THEN THE Kingdom_Page SHALL 不显示预览
7. WHEN 工匠分配变化 THEN THE Kingdom_Page SHALL 立即更新预览

### Requirement 22: 地下城堡界面优化

**User Story:** 作为玩家，我想要在地下城堡界面方便地查看所有资源，以便掌握整体状况。

#### Acceptance Criteria

1. THE Castle_Page SHALL 显示仓库标题和资源总和
2. THE Castle_Page SHALL 使用 ScrollView 显示资源列表
3. THE Castle_Page SHALL 确保炼金/建造按钮不与仓库重叠
4. THE ScrollView SHALL 支持滚轮和触摸滚动
5. THE ScrollView SHALL 显示滚动条

### Requirement 23: 地下王国界面优化

**User Story:** 作为玩家，我想要在地下王国界面方便地管理工匠和查看产出信息。

#### Acceptance Criteria

1. THE Kingdom_Page SHALL 不显示仓库
2. THE Kingdom_Page SHALL 使用 ScrollView 显示工匠/岗位/倒计时/预览
3. THE ScrollView SHALL 支持滚轮和触摸滚动
4. THE Kingdom_Page SHALL 确保收集按钮不与滚动区重叠

### Requirement 24: 建筑界面

**User Story:** 作为玩家，我想要通过独立的建筑界面查看和建造建筑，以便扩展城堡功能。

#### Acceptance Criteria

1. WHEN 玩家点击 Build_Button THEN THE PageManager SHALL 打开 Building_Page 全屏界面
2. THE Building_Page SHALL 显示标题"建筑"和"返回"按钮
3. WHEN 玩家点击返回按钮 THEN THE PageManager SHALL 关闭 Building_Page
4. THE Building_Page SHALL 从 Job_Config.buildings 读取建筑列表并使用 ScrollView 显示
5. THE Building_Entry SHALL 显示：名称、费用（不足红色）、效果、已建造数、"建造"按钮（够高亮/不够灰色）
6. WHEN 资源充足且玩家点击建造 THEN THE BuildingManager SHALL 扣除资源并增加效果
7. IF 资源不足 THEN THE BuildingManager SHALL 拒绝建造
8. WHEN 建造完成 THEN THE CanvasRenderer SHALL 立即更新界面
9. THE Building_Page ScrollView SHALL 支持滚动
10. WHEN 新增建筑到配置 THEN THE Building_Page SHALL 自动显示
11. WHEN Building_Page 打开 THEN THE PageManager SHALL 禁止页面拖拽切换
12. THE Build_Button SHALL 显示通用文字"建造"

### Requirement 25: 士兵配置外置（树形进阶体系）

**User Story:** 作为开发者，我希望士兵类型和进阶路径通过外置配置文件定义，以便新增兵种和进阶分支时无需修改核心逻辑。

#### Acceptance Criteria

1. THE Soldier_Config SHALL 在 soldier-config.js 中定义所有士兵类型，每个类型包含：name（名称）、tier（阶级，1/2/3）、stats（attack/defense/hp）、promoteTo（可进阶的目标兵种 ID 数组，可为空）、promoteCost（进阶到该兵种所需资源费用）
2. THE Soldier_Config SHALL 定义冒险者(adventurer)为唯一的 Tier 1 兵种，且 recruitCost 仅在冒险者上定义（只有冒险者可直接招募）
3. WHEN 新增士兵类型或进阶分支到配置文件时 THEN THE SoldierManager SHALL 自动支持，无需修改核心逻辑
4. THE Soldier_Config SHALL 使用 `var SOLDIER_CONFIG_EXTERNAL = { ... }` 格式，并通过 `module.exports` 导出以支持测试

### Requirement 26: 招募冒险者

**User Story:** 作为玩家，我希望使用少量资源招募冒险者，以便组建军队的基础力量。

#### Acceptance Criteria

1. THE SoldierManager SHALL 仅允许招募冒险者(adventurer)类型，拒绝直接招募其他兵种
2. WHEN 资源充足时 THEN THE SoldierManager SHALL 扣除冒险者的 recruitCost，创建一个 type='adventurer' 的士兵实例，push 到 soldiers 数组
3. IF 资源不足 THEN THE SoldierManager SHALL 拒绝招募并保持当前状态不变
4. WHEN 招募成功 THEN THE System SHALL 触发资源变化 Toast 提示
5. THE SoldierManager SHALL 通过 getSoldiers() 返回当前所有已招募士兵的列表

### Requirement 27: 士兵进阶（树形）

**User Story:** 作为玩家，我希望将低阶兵种进阶为高阶兵种，以便组建多样化的强力军队。

#### 进阶树
```
冒险者 (Tier 1)
├── 弓箭手 (Tier 2) → 弩手 (Tier 3)
└── 战士 (Tier 2) → 狂战士 (Tier 3)
                   → 骑士 (Tier 3)
```

#### Acceptance Criteria

1. WHEN 玩家进阶一个士兵时 THEN THE SoldierManager SHALL 检查该士兵的 promoteTo 配置中是否包含目标兵种
2. WHEN 进阶时 THEN THE SoldierManager SHALL 检查 ResourceManager 中对应目标兵种的 promoteCost 是否充足
3. WHEN 资源充足且目标兵种在 promoteTo 列表中时 THEN THE SoldierManager SHALL 扣除 promoteCost，将该士兵替换为目标兵种（type/stats 更新为目标兵种配置）
4. IF 资源不足 THEN THE SoldierManager SHALL 拒绝进阶并保持当前状态不变
5. IF 目标兵种不在该士兵的 promoteTo 列表中 THEN THE SoldierManager SHALL 拒绝进阶
6. WHEN 进阶成功 THEN THE System SHALL 触发资源变化 Toast 提示
7. THE SoldierManager SHALL 通过 canPromote(soldierIndex, targetTypeId, resourceManager) 返回是否可进阶

### Requirement 28: 士兵数据持久化

**User Story:** 作为玩家，我希望士兵数据在刷新页面后仍然保留，以便不丢失已招募和进阶的士兵。

#### Acceptance Criteria

1. WHEN 士兵数据变化时（招募或进阶） THEN THE SaveSystem SHALL 将士兵数据持久化到 localStorage
2. WHEN 游戏加载时 THEN THE SaveSystem SHALL 从 localStorage 恢复士兵数据，包括每个士兵的类型和属性
3. IF 存档中缺失士兵数据 THEN THE SaveSystem SHALL 初始化为空士兵列表
4. IF 存档中士兵数据损坏 THEN THE SaveSystem SHALL 初始化为空士兵列表


### Requirement 29: 训练按钮

**User Story:** 作为玩家，我想要在地下城堡界面通过训练按钮进入训练界面，以便管理士兵的招募和进阶。

#### Acceptance Criteria

1. THE Train_Button SHALL 显示在 Castle_Page 上，位于 Build_Button 下方
2. WHEN 玩家点击 Train_Button THEN THE PageManager SHALL 打开 Training_Page 全屏界面
3. WHEN Training_Page 打开 THEN THE PageManager SHALL 禁止页面拖拽切换

### Requirement 30: 训练界面布局

**User Story:** 作为玩家，我想要在训练界面查看所有士兵并进行招募和进阶操作，以便培养军队力量。

#### Acceptance Criteria

1. THE Training_Page SHALL 显示标题"训练"和"返回"按钮
2. WHEN 玩家点击返回按钮 THEN THE PageManager SHALL 关闭 Training_Page
3. THE Training_Page SHALL 显示 Recruit_Button 招募按钮
4. THE Training_Page SHALL 使用 ScrollView 竖向排列显示所有已招募士兵的 Soldier_Entry
5. THE Training_Page ScrollView SHALL 支持滚轮和触摸滚动
6. WHEN 士兵数据变化（招募或进阶） THEN THE Training_Page SHALL 立即更新显示

### Requirement 31: 训练界面招募

**User Story:** 作为玩家，我想要在训练界面招募冒险者，以便扩充军队。

#### Acceptance Criteria

1. WHEN 资源充足且玩家点击 Recruit_Button THEN THE SoldierManager SHALL 招募一个冒险者并更新 Training_Page 显示
2. IF 资源不足 THEN THE Recruit_Button SHALL 显示为灰色不可用状态
3. THE Recruit_Button SHALL 显示招募费用信息
4. WHEN 招募成功 THEN THE System SHALL 触发资源变化 Toast 提示

### Requirement 32: 士兵条目显示

**User Story:** 作为玩家，我想要在训练界面查看每个士兵的信息，以便了解军队状况。

#### Acceptance Criteria

1. THE Soldier_Entry SHALL 显示士兵名称和阶级（Tier）
2. THE Soldier_Entry SHALL 显示士兵属性（attack/defense/hp）
3. WHEN 士兵的 promoteTo 列表非空 THEN THE Soldier_Entry SHALL 显示"进阶"按钮
4. WHEN 士兵的 promoteTo 列表为空 THEN THE Soldier_Entry SHALL 不显示"进阶"按钮（已满阶）

### Requirement 33: 进阶弹窗

**User Story:** 作为玩家，我想要通过弹窗查看可进阶的兵种和费用，以便选择合适的进阶路径。

#### Acceptance Criteria

1. WHEN 玩家点击 Soldier_Entry 的进阶按钮 THEN THE Training_Page SHALL 显示 Promote_Dialog 弹窗
2. THE Promote_Dialog SHALL 显示当前士兵名称和所有可进阶的目标兵种列表
3. THE Promote_Dialog SHALL 为每个目标兵种显示：名称、阶级、属性（attack/defense/hp）、进阶费用
4. WHEN 资源充足 THEN THE Promote_Dialog SHALL 将对应目标兵种的进阶按钮显示为高亮可点击
5. WHEN 资源不足 THEN THE Promote_Dialog SHALL 将对应目标兵种的进阶按钮显示为灰色不可用，费用文字显示红色
6. WHEN 玩家点击可用的进阶按钮 THEN THE SoldierManager SHALL 执行进阶并关闭 Promote_Dialog
7. WHEN 进阶成功 THEN THE System SHALL 触发资源变化 Toast 提示
8. THE Promote_Dialog SHALL 显示关闭按钮，点击后关闭弹窗
9. WHEN Promote_Dialog 显示时 THEN THE Training_Page SHALL 禁止其他交互（招募、滚动、返回）
