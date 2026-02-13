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
- **Canvas_Renderer**: Canvas 渲染器，负责 2D 图形渲染
- **Config_Loader**: 配置加载器，从外部 JS 文件加载配置数据

## Requirements

### Requirement 1: 冒险者派遣

**User Story:** 作为玩家，我想要派遣冒险者进入地牢，以便开始探险并获取资源。

#### Acceptance Criteria

1. WHEN 玩家选择冒险者并点击派遣按钮 THEN THE Dungeon_System SHALL 将选中的冒险者加入当前探险队伍
2. WHEN 探险队伍为空 THEN THE Dungeon_System SHALL 阻止玩家开始探险
3. WHEN 冒险者已在其他探险中 THEN THE Dungeon_System SHALL 阻止重复派遣该冒险者
4. WHEN 探险队伍人数达到上限 THEN THE Dungeon_System SHALL 阻止添加更多冒险者
5. THE Dungeon_System SHALL 显示每个冒险者的基础属性（生命值、攻击力、防御力）

### Requirement 2: 战斗系统

**User Story:** 作为玩家，我想要冒险者能够与怪物战斗，以便清除障碍并获得战利品。

#### Acceptance Criteria

1. WHEN 冒险者遭遇怪物 THEN THE Combat_Engine SHALL 初始化战斗并显示战斗界面
2. WHEN 战斗回合开始 THEN THE Combat_Engine SHALL 根据速度属性决定行动顺序
3. WHEN 单位执行攻击 THEN THE Combat_Engine SHALL 计算伤害值并更新目标生命值
4. WHEN 单位生命值降至 0 THEN THE Combat_Engine SHALL 将该单位标记为战败
5. WHEN 所有怪物被击败 THEN THE Combat_Engine SHALL 结束战斗并给予奖励
6. WHEN 所有冒险者被击败 THEN THE Combat_Engine SHALL 结束战斗并返回探险失败
7. THE Combat_Engine SHALL 从外部配置文件加载战斗行为逻辑
8. THE Combat_Engine SHALL 支持基础攻击、技能攻击和防御行为

### Requirement 3: 探索机制

**User Story:** 作为玩家，我想要探索地牢的不同区域，以便发现新内容和收集宝藏。

#### Acceptance Criteria

1. WHEN 冒险者进入新区域 THEN THE Exploration_Manager SHALL 显示该区域的描述和可能的遭遇
2. WHEN 区域包含宝藏 THEN THE Exploration_Manager SHALL 允许玩家收集宝藏
3. WHEN 宝藏被收集 THEN THE Exploration_Manager SHALL 将宝藏添加到玩家库存并从地图移除
4. WHEN 区域被完全探索 THEN THE Exploration_Manager SHALL 标记该区域为已完成
5. THE Exploration_Manager SHALL 在 Canvas 上渲染地牢地图和冒险者位置
6. THE Exploration_Manager SHALL 支持上下左右四个方向的移动
7. WHEN 冒险者移动到已探索区域 THEN THE Exploration_Manager SHALL 不触发新的遭遇事件

### Requirement 4: 进度系统

**User Story:** 作为玩家，我想要解锁更深层的地牢，以便体验更具挑战性的内容。

#### Acceptance Criteria

1. WHEN 玩家首次启动游戏 THEN THE Progress_Tracker SHALL 初始化第一层地牢为可访问状态
2. WHEN 当前层的 Boss 被击败 THEN THE Progress_Tracker SHALL 解锁下一层地牢
3. WHEN 玩家选择地牢层级 THEN THE Progress_Tracker SHALL 只显示已解锁的层级
4. THE Progress_Tracker SHALL 持久化保存玩家的解锁进度
5. THE Progress_Tracker SHALL 记录每层地牢的完成状态和最佳记录

### Requirement 5: Boss 战

**User Story:** 作为玩家，我想要挑战每层地牢的 Boss，以便获得丰厚奖励并解锁新内容。

#### Acceptance Criteria

1. WHEN 冒险者到达 Boss 房间 THEN THE Dungeon_System SHALL 触发 Boss 战斗
2. WHEN Boss 战开始 THEN THE Combat_Engine SHALL 加载 Boss 的特殊配置和行为
3. WHEN Boss 使用特殊技能 THEN THE Combat_Engine SHALL 执行该技能的特定效果
4. WHEN Boss 被击败 THEN THE Dungeon_System SHALL 给予特殊奖励并标记该层完成
5. THE Dungeon_System SHALL 从外部配置文件加载 Boss 数据
6. WHEN Boss 战失败 THEN THE Dungeon_System SHALL 允许玩家重新挑战

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
