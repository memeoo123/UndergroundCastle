# 实施计划：关内地牢探险系统（InsideThePass）

## 概述

基于已有的单文件架构和关外系统，新增关内探险核心逻辑（inside-logic.js）和 4 个配置文件，在 index.html 中集成场景切换。实现顺序：配置 → 核心数据结构 → 战斗引擎 → 探索系统 → 渲染 → 集成。

## Tasks

- [x] 1. 创建关内配置文件
  - [x] 1.1 创建 dungeon-config.js（地牢层级配置：地图尺寸、视野、墙壁/怪物/宝藏密度、怪物池、宝藏池、Boss）
    - _Requirements: 6.2_
  - [x] 1.2 创建 monster-config.js（怪物配置：属性、技能、奖励）
    - _Requirements: 6.1_
  - [x] 1.3 创建 boss-config.js（Boss 配置：属性、特殊技能、奖励）
    - _Requirements: 6.4_
  - [x] 1.4 创建 combat-config.js（战斗配置：伤害公式、技能定义、状态效果）
    - _Requirements: 6.3_

- [x] 2. 实现 inside-logic.js 核心数据结构
  - [x] 2.1 实现 ConfigLoader（加载所有关内配置，缺失时使用默认值）
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [ ]* 2.2 编写配置缺失回退属性测试
    - **Property 13: 配置缺失回退默认值**
    - **Validates: Requirements 6.5**
  - [x] 2.3 实现 DungeonMap（50x50 网格、地块类型/内容、边界检查、地图生成算法含 BFS 连通性保证）
    - _Requirements: 3.1, 7.1_
  - [ ]* 2.4 编写地图连通性属性测试
    - **Property 15: 地图连通性**
    - **Validates: Requirements 3.1, 5.1**
  - [x] 2.5 实现 FogOfWar（迷雾状态管理、视野点亮、状态序列化/反序列化）
    - _Requirements: 3.4, 4.4_

- [x] 3. 实现 ProgressTracker（进度追踪器）
  - [x] 3.1 实现层级解锁/完成/记录逻辑和存档序列化
    - 初始化第一层为可访问，Boss 击败解锁下一层，持久化进度
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]* 3.2 编写 Boss 击败解锁下一层属性测试
    - **Property 9: Boss 击败解锁下一层**
    - **Validates: Requirements 4.2, 5.4**
  - [ ]* 3.3 编写进度存档往返属性测试
    - **Property 10: 进度存档往返一致**
    - **Validates: Requirements 4.4, 4.5**

- [ ] 4. 检查点 - 确保数据结构和配置正确
  - 确保所有测试通过，有问题请询问用户。

- [x] 5. 实现 CombatEngine（战斗引擎）
  - [x] 5.1 实现战斗初始化、行动顺序计算、伤害计算、状态效果处理
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.8_
  - [x] 5.2 实现战斗结束判定（胜利/失败）和奖励生成
    - _Requirements: 2.5, 2.6, 9.1_
  - [x] 5.3 实现 Boss 战斗特殊逻辑（加载 Boss 配置、特殊技能）
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_
  - [ ]* 5.4 编写行动顺序属性测试
    - **Property 2: 行动顺序由速度决定**
    - **Validates: Requirements 2.2**
  - [ ]* 5.5 编写伤害计算属性测试
    - **Property 3: 伤害计算正确性**
    - **Validates: Requirements 2.3, 2.8, 5.3**
  - [ ]* 5.6 编写战斗结束条件属性测试
    - **Property 4: 战斗结束条件**
    - **Validates: Requirements 2.4, 2.5, 2.6**
  - [ ]* 5.7 编写战斗奖励匹配配置属性测试
    - **Property 11: 战斗奖励匹配配置**
    - **Validates: Requirements 9.1**

- [x] 6. 实现 ExplorationManager（探索管理器）
  - [x] 6.1 实现队伍派遣逻辑（添加/移除士兵、重复检查、上限检查）
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ]* 6.2 编写队伍派遣属性测试
    - **Property 1: 队伍派遣正确性**
    - **Validates: Requirements 1.1, 1.3, 1.4**
  - [x] 6.3 实现移动逻辑（四方向移动、墙壁碰撞、边界检查、迷雾点亮）
    - _Requirements: 3.6, 3.4_
  - [ ]* 6.4 编写移动正确性属性测试
    - **Property 6: 移动正确性**
    - **Validates: Requirements 3.6**
  - [ ]* 6.5 编写迷雾点亮属性测试
    - **Property 7: 迷雾点亮与探索标记**
    - **Validates: Requirements 3.4**
  - [x] 6.6 实现遭遇触发逻辑（新区域触发怪物/Boss 遭遇，已探索区域不触发）
    - _Requirements: 3.1, 3.7, 5.1_
  - [ ]* 6.7 编写已探索区域不触发遭遇属性测试
    - **Property 8: 已探索区域不触发遭遇**
    - **Validates: Requirements 3.7**
  - [x] 6.8 实现宝藏收集和资源汇总逻辑
    - _Requirements: 3.2, 3.3, 9.2, 9.3_
  - [ ]* 6.9 编写宝藏收集属性测试
    - **Property 5: 宝藏收集完整性**
    - **Validates: Requirements 3.2, 3.3, 9.2**
  - [ ]* 6.10 编写资源汇总属性测试
    - **Property 12: 探险资源汇总正确性**
    - **Validates: Requirements 9.3**
  - [x] 6.11 实现探险结束逻辑（走回入口时结束探险并保存资源、战斗全灭时不保留资源）
    - _Requirements: 3.8, 9.5_

- [ ] 7. 检查点 - 确保核心逻辑正确
  - 确保所有测试通过，有问题请询问用户。

- [x] 8. 实现 Canvas 渲染
  - [x] 8.1 实现 DungeonRenderer（地牢地图网格渲染、迷雾效果、玩家位置、怪物/宝藏/Boss 图标）
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.7_
  - [x] 8.2 实现 CombatRenderer（战斗界面、单位血条、技能菜单、战斗日志、状态效果图标）
    - _Requirements: 7.5, 10.1, 10.2, 10.3, 10.4, 10.5_
  - [x] 8.3 实现 DungeonSelectUI（层级选择界面、队伍派遣界面）
    - _Requirements: 1.5, 4.3_

- [x] 9. 实现 SceneManager 和 index.html 集成
  - [x] 9.1 实现 SceneManager（场景切换、update/render 分发）
    - 在 index.html 中添加 SceneManager，修改游戏循环根据当前场景调用对应逻辑
    - _Requirements: 8.1, 8.3, 8.5_
  - [x] 9.2 在 index.html 中引入新配置文件和 inside-logic.js
    - 添加 script 标签引入 dungeon-config.js、monster-config.js、boss-config.js、combat-config.js、inside-logic.js
    - _Requirements: 8.2, 8.4_
  - [x] 9.3 扩展 SaveSystem 支持地牢进度持久化
    - 在现有 SaveSystem.save/load 中新增 dungeon 字段处理
    - _Requirements: 4.4, 9.5_
  - [x] 9.4 在 Castle_Page 训练按钮下方添加"探险"按钮，点击切换到地牢选择场景
    - _Requirements: 1.1_
  - [x] 9.5 实现战斗界面的玩家操作交互（选择技能、选择目标）
    - _Requirements: 2.8_
  - [x] 9.6 实现探索界面的方向控制交互（点击 Canvas 相对中心方向判定移动：|dx|>|dy| 为左右，否则为上下）
    - _Requirements: 3.6_

- [x] 10. 实现 Boss 战失败重新挑战逻辑
  - [x] 10.1 Boss 战失败后保持层级解锁状态，允许重新进入
    - _Requirements: 5.6_
  - [ ]* 10.2 编写 Boss 战失败后可重新挑战属性测试
    - **Property 14: Boss 战失败后可重新挑战**
    - **Validates: Requirements 5.6**

- [x] 11. 重构战斗系统为独立 CD 制
  - [x] 11.1 重构 CombatEngine 为独立 CD 制战斗引擎
    - 移除 turnOrder、calculateTurnOrder
    - 添加 partyTotalHP、partyMaxHP、elapsedTime
    - 改 enemies 为 enemy（单个敌人）
    - 实现 update(deltaTime) 方法处理 CD 倒计时和自动攻击
    - 实现 executeAllyAttack(ally) 和 executeEnemyAttack()
    - 更新 init、checkBattleEnd、getRewards 适配新机制
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.7, 2.8_
  - [x] 11.2 更新 index.html 战斗场景集成
    - 在游戏循环中调用 CombatEngine.update(deltaTime)
    - 移除手动技能选择和目标选择交互
    - 战斗自动进行，玩家只观战
    - _Requirements: 2.1, 2.10_
  - [x] 11.3 重构 CombatRenderer 适配新战斗界面
    - 只显示队伍总血量条和敌人血量条
    - 移除单个士兵血量显示
    - 移除技能选择菜单
    - 显示各士兵攻击 CD 进度（可选）
    - _Requirements: 2.1, 2.6_
  - [x] 11.4 更新 initMonsterFight 和 initBossFight
    - 改为只接受单个敌人
    - 计算队伍总血量
    - 初始化各单位攻击 CD
    - _Requirements: 2.2_
  - [x] 11.5 更新战斗相关单元测试
    - 移除 calculateTurnOrder 测试
    - 添加攻击 CD 计算测试
    - 添加队伍总血量测试
    - 更新 checkBattleEnd 测试（队伍总血量判定）
    - 更新 executeAction 相关测试
  - [ ]* 11.6 编写新战斗机制属性测试
    - **Property 2: 攻击 CD 计算正确性**
    - **Property 3: 伤害计算正确性**
    - **Property 4: 战斗结束条件**
    - **Validates: Requirements 2.2, 2.4, 2.7, 2.8**

- [ ] 12. 实现传送阵与层级推进系统
  - [ ] 12.1 修改 DungeonMap 地图生成，将 Boss 房间改为传送阵（portal 类型）
    - 传送阵位于距入口最远的可达位置
    - _Requirements: 5.1, 5.9_
  - [ ] 12.2 更新 DungeonRenderer 渲染传送阵图标
    - 使用特殊图标区别于普通地块
    - _Requirements: 5.9_
  - [ ] 12.3 修改 ExplorationManager 遭遇触发逻辑
    - 走到传送阵触发 Boss 战（而非 boss 类型地块）
    - _Requirements: 5.2_
  - [ ] 12.4 实现 Boss 战胜利后的传送选择界面
    - 显示可选层级列表（下一层 + 已解锁层级）
    - 玩家选择后切换到对应层级继续探险
    - _Requirements: 5.5, 5.6_
  - [ ] 12.5 更新 index.html Boss 战回调逻辑
    - 胜利后显示传送选择而非直接返回关外
    - 失败后返回关外
    - _Requirements: 5.5, 5.8_

- [ ] 13. 实现资源层系统
  - [ ] 13.1 扩展 ConfigLoader 支持资源层配置
    - 添加 isResourceLayer(layerId) 和 getResourceLayer(layerId) 方法
    - _Requirements: 11.1, 11.8_
  - [ ] 13.2 实现资源层地图生成（固定布局）
    - 根据 resourceLayers 配置生成固定地图
    - 放置矿产设施到指定位置
    - _Requirements: 11.2, 11.3_
  - [ ] 13.3 实现矿产设施采集逻辑
    - 玩家到达矿产位置时可采集资源
    - 采集后资源添加到累计资源，设施标记为已采集
    - _Requirements: 11.4, 11.5_
  - [ ] 13.4 更新 DungeonRenderer 渲染矿产设施图标
    - 不同类型矿产使用不同图标/颜色
    - _Requirements: 11.3_
  - [ ] 13.5 实现资源层完成逻辑
    - 资源层无 Boss，返回入口即解锁下一层
    - _Requirements: 11.7, 11.9_
  - [ ] 13.6 更新 DungeonSelectUI 显示资源层
    - 资源层显示特殊标识（如"资源层"标签）
    - _Requirements: 11.1_

- [ ] 14. 最终检查点 - 确保所有功能正确集成
  - 确保所有测试通过，有问题请询问用户。

## Notes

- 核心逻辑在 inside-logic.js，配置在 dungeon-config.js / monster-config.js / boss-config.js / combat-config.js
- 沿用关外系统的架构模式：单文件 + 配置外置 + Canvas 渲染 + localStorage
- SceneManager 在 index.html 中管理关外/关内场景切换
- SaveSystem 复用关外存档机制，新增 dungeon 字段
- 标记 `*` 的子任务为可选属性测试，可跳过以加速 MVP
- 每个属性测试对应设计文档中的正确性属性编号
- 配置数值为占位值，后续根据游戏体验调整
