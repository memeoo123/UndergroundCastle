# Requirements Document

## Introduction

地牢探险系统（Dungeon Exploration System）是 Underground Castle 游戏的关内核心部分。玩家派遣冒险者进入地牢，通过战斗、探索和挑战 Boss 来获取资源和推进游戏进度。系统采用 2D Canvas 渲染，使用单文件架构，配置外置化设计。

## Glossary

- **Inside_Dungeon**: 关内，地牢探险部分，玩家派遣冒险者进入地牢战斗和探索
- **Outside_Castle**: 关外，城堡建设和经营部分（本需求文档不涉及，但需了解其为探险提供冒险者和装备）
- **Dungeon_System**: 地牢探险系统，负责管理地牢探索的所有逻辑
- **Adventurer**: 冒险者，玩家招募和培养的角色单位，可派遣进入地牢
- **Monster**: 怪物，地牢中的敌对单位
- **Boss**: Boss，每层地牢的最终挑战敌人
- **Combat_Engine**: 战斗引擎，处理战斗逻辑和伤害计算
- **Exploration_Manager**: 探索管理器，处理地牢区域发现和探索进度
- **Progress_Tracker**: 进度追踪器，记录玩家的地牢解锁和完成状态
- **Treasure**: 宝藏，探索中可收集的资源和物品
- **Dungeon**: 地牢，关内探险的场所，包含多个层级
- **Dungeon_Layer**: 地牢层级，地牢的深度单位，每层有不同难度和奖励
- **Teleport_Portal**: 传送阵，地牢中的传送设施，踏入时触发 Boss 战，击败后可选择传送到已解锁的层级
- **Canvas_Renderer**: Canvas 渲染器，负责 2D 图形渲染
- **Config_Loader**: 配置加载器，从外部 JS 文件加载配置数据

## Requirements

### Requirement 1: 冒险者派遣

**User Story:** 作为玩家，我想要派遣冒险者进入地牢，以便开始探险并获取资源。

#### Acceptance Criteria

1. WHEN 玩家点击探险按钮 THEN THE Dungeon_System SHALL 切换到地牢选择界面，玩家可选择层级并派遣冒险者
2. WHEN 探险队伍为空 THEN THE Dungeon_System SHALL 阻止玩家开始探险
3. WHEN 冒险者已在其他探险中 THEN THE Dungeon_System SHALL 阻止重复派遣该冒险者
4. WHEN 探险队伍人数达到上限 THEN THE Dungeon_System SHALL 阻止添加更多冒险者
5. THE Dungeon_System SHALL 显示每个冒险者的基础属性（生命值、攻击力、防御力）

### Requirement 2: 战斗系统

**User Story:** 作为玩家，我想要冒险者能够与怪物战斗，以便清除障碍并获得战利品。

#### Acceptance Criteria

1. WHEN 冒险者遭遇怪物 THEN THE Combat_Engine SHALL 初始化战斗并显示战斗界面
2. WHEN 战斗开始 THEN THE Combat_Engine SHALL 为每个士兵和敌人初始化独立的攻击 CD 计时器，CD 时长 = 10秒 / 速度
3. WHEN 士兵的攻击 CD 到期 THEN THE Combat_Engine SHALL 立即执行该士兵的攻击，同时释放所有可用辅助技能
4. WHEN 士兵执行攻击 THEN THE Combat_Engine SHALL 计算伤害值（基于攻击力）并扣除敌人生命值
5. WHEN 敌人的攻击 CD 到期 THEN THE Combat_Engine SHALL 执行敌人攻击，直接扣除我方队伍总血量
6. THE Combat_Engine SHALL 维护我方队伍总血量（所有士兵 hp 之和），不维护单个士兵血量
7. WHEN 我方队伍总血量降至 0 THEN THE Combat_Engine SHALL 结束战斗并返回探险失败
8. WHEN 敌人生命值降至 0 THEN THE Combat_Engine SHALL 结束战斗并给予奖励
9. THE Combat_Engine SHALL 从外部配置文件加载战斗行为逻辑
10. THE Combat_Engine SHALL 支持士兵独立 CD 攻击和辅助技能（buff）自动释放

### Requirement 3: 探索机制

**User Story:** 作为玩家，我想要探索地牢的不同区域，以便发现新内容和收集宝藏。

#### Acceptance Criteria

1. WHEN 冒险者进入新区域 THEN THE Exploration_Manager SHALL 显示该区域的描述和可能的遭遇
2. WHEN 区域包含宝藏 THEN THE Exploration_Manager SHALL 允许玩家收集宝藏
3. WHEN 宝藏被收集 THEN THE Exploration_Manager SHALL 将宝藏添加到玩家库存并从地图移除
4. WHEN 区域被完全探索 THEN THE Exploration_Manager SHALL 标记该区域为已完成
5. THE Exploration_Manager SHALL 在 Canvas 上渲染地牢地图和冒险者位置
6. WHEN 玩家点击 Canvas THEN THE Exploration_Manager SHALL 根据点击位置相对于 Canvas 中心的方向（上/下/左/右）移动冒险者一格，水平偏移绝对值大于垂直时判定为左右，否则判定为上下
7. WHEN 冒险者移动到已探索区域 THEN THE Exploration_Manager SHALL 不触发新的遭遇事件
8. WHEN 冒险者移动回到地牢入口 THEN THE Exploration_Manager SHALL 结束探险，保存已获取的资源并返回关外

### Requirement 4: 进度系统

**User Story:** 作为玩家，我想要解锁更深层的地牢，以便体验更具挑战性的内容。

#### Acceptance Criteria

1. WHEN 玩家首次启动游戏 THEN THE Progress_Tracker SHALL 初始化第一层地牢为可访问状态
2. WHEN 当前层的 Boss 被击败 THEN THE Progress_Tracker SHALL 解锁下一层地牢
3. WHEN 玩家选择地牢层级 THEN THE Progress_Tracker SHALL 只显示已解锁的层级
4. THE Progress_Tracker SHALL 持久化保存玩家的解锁进度
5. THE Progress_Tracker SHALL 记录每层地牢的完成状态和最佳记录

### Requirement 5: Boss 战与传送阵

**User Story:** 作为玩家，我想要通过传送阵挑战 Boss 并传送到其他层级，以便获得丰厚奖励并自由探索地牢。

#### Acceptance Criteria

1. THE Dungeon_System SHALL 在每层地牢生成一个"传送阵"（Teleport_Portal），位于距离入口最远的可达位置
2. WHEN 冒险者到达传送阵 THEN THE Dungeon_System SHALL 触发该层的 Boss 战斗
3. WHEN Boss 战开始 THEN THE Combat_Engine SHALL 加载 Boss 的特殊配置和行为
4. WHEN Boss 使用特殊技能 THEN THE Combat_Engine SHALL 执行该技能的特定效果
5. WHEN Boss 被击败 THEN THE Dungeon_System SHALL 给予特殊奖励、解锁下一层、并显示传送选择界面
6. WHEN 传送选择界面显示 THEN THE Dungeon_System SHALL 允许玩家选择进入下一层或其他已解锁层级
7. THE Dungeon_System SHALL 从外部配置文件加载 Boss 数据
8. WHEN Boss 战失败 THEN THE Dungeon_System SHALL 结束探险并返回关外，玩家可从地牢选择界面重新挑战
9. THE Dungeon_System SHALL 在传送阵位置渲染特殊的传送阵图标（区别于普通地块）

### Requirement 6: 配置外置化

**User Story:** 作为开发者，我想要将游戏配置外置到独立文件，以便于调整和扩展游戏内容。

#### Acceptance Criteria

1. THE Config_Loader SHALL 从外部 JS 文件加载怪物配置数据
2. THE Config_Loader SHALL 从外部 JS 文件加载关卡配置数据
3. THE Config_Loader SHALL 从外部 JS 文件加载战斗行为配置
4. THE Config_Loader SHALL 从外部 JS 文件加载 Boss 配置数据
5. WHEN 配置文件加载失败 THEN THE Config_Loader SHALL 显示错误信息并使用默认配置
6. THE Config_Loader SHALL 在游戏初始化时完成所有配置加载

### Requirement 7: Canvas 渲染

**User Story:** 作为玩家，我想要看到清晰的游戏画面，以便了解当前状态和做出决策。

#### Acceptance Criteria

1. THE Canvas_Renderer SHALL 在 Canvas 上绘制地牢地图网格
2. THE Canvas_Renderer SHALL 在 Canvas 上绘制冒险者角色
3. THE Canvas_Renderer SHALL 在 Canvas 上绘制怪物和 Boss
4. THE Canvas_Renderer SHALL 在 Canvas 上绘制宝藏和可交互对象
5. WHEN 战斗发生 THEN THE Canvas_Renderer SHALL 显示战斗动画效果
6. WHEN 游戏状态更新 THEN THE Canvas_Renderer SHALL 在下一帧重新渲染画面
7. THE Canvas_Renderer SHALL 支持基础的精灵图渲染或几何图形绘制

### Requirement 8: 单文件架构

**User Story:** 作为开发者，我想要使用单文件架构，以便简化部署和维护。

#### Acceptance Criteria

1. THE Dungeon_System SHALL 将所有核心逻辑代码包含在 index.html 的 script 标签中
2. THE Dungeon_System SHALL 通过 script 标签引入外部配置 JS 文件
3. THE Dungeon_System SHALL 在单个 HTML 文件中包含所有必要的 HTML 结构和 CSS 样式
4. WHEN 用户打开 index.html THEN THE Dungeon_System SHALL 无需额外构建步骤即可运行
5. THE Dungeon_System SHALL 保持代码模块化，使用函数和对象组织逻辑

### Requirement 9: 资源管理

**User Story:** 作为玩家，我想要在探险中获得资源，以便在关外进行城堡建设和冒险者培养。

#### Acceptance Criteria

1. WHEN 战斗胜利 THEN THE Dungeon_System SHALL 根据敌人类型给予金币和经验值
2. WHEN 收集宝藏 THEN THE Dungeon_System SHALL 将物品添加到玩家库存
3. WHEN 探险结束 THEN THE Dungeon_System SHALL 汇总所有获得的资源
4. THE Dungeon_System SHALL 显示当前探险中累计获得的资源
5. THE Dungeon_System SHALL 在探险成功返回时将资源保存到玩家账户

### Requirement 10: 冒险者状态管理

**User Story:** 作为玩家，我想要实时了解冒险者的状态，以便做出战术决策。

#### Acceptance Criteria

1. THE Dungeon_System SHALL 实时显示每个冒险者的当前生命值和最大生命值
2. THE Dungeon_System SHALL 显示冒险者的状态效果（如中毒、增益等）
3. WHEN 冒险者生命值低于 30% THEN THE Dungeon_System SHALL 以警告颜色显示生命条
4. WHEN 冒险者获得状态效果 THEN THE Dungeon_System SHALL 显示状态图标和剩余回合数
5. THE Dungeon_System SHALL 在战斗界面显示冒险者的可用技能和冷却时间

### Requirement 11: 资源层系统

**User Story:** 作为玩家，我想要每隔5层进入一个特殊的资源层，以便采集矿产资源来支持城堡建设。

#### Acceptance Criteria

1. WHEN 层级编号为 5 的倍数（5, 10, 15...）THEN THE Dungeon_System SHALL 生成资源层而非普通战斗层
2. THE Dungeon_System SHALL 为资源层使用固定的预设地图布局，而非随机生成
3. THE Dungeon_System SHALL 在资源层中放置矿产设施（如木厂、石头矿、铁矿、金矿等）
4. WHEN 玩家到达矿产设施位置 THEN THE Dungeon_System SHALL 允许玩家采集该矿产资源
5. WHEN 矿产被采集 THEN THE Dungeon_System SHALL 将资源添加到本次探险累计资源中
6. THE Dungeon_System SHALL 根据资源层深度配置不同的矿产类型：
   - 第 5 层资源层：木厂（产出木头）、石头矿（产出石头）
   - 第 10 层资源层：铁矿（产出铁）、金矿（产出金矿石）
   - 更深层资源层：更高级矿产（水晶矿、符文矿等）
7. THE Dungeon_System SHALL 资源层无怪物和 Boss，玩家可安全采集
8. THE Dungeon_System SHALL 从外部配置文件加载资源层地图和矿产配置
9. WHEN 玩家完成资源层采集并返回入口 THEN THE Dungeon_System SHALL 自动解锁下一层（无需击败 Boss）
