# Requirements Document

## Introduction

本地存档系统（Local Save System）用于将 Underground Castle 游戏的完整进度持久化到浏览器 localStorage 中。当前游戏已有一个基础的 SaveSystem，能保存资源数量、工匠容量、岗位分配、建筑数量和士兵数据，并在 index.html 中通过扩展追加了地牢进度（dungeon）字段。本需求旨在将存档系统统一化、完整化，确保所有关键游戏状态（资源、岗位、地图探险进度、矿产占领进度）都能可靠地保存和恢复，并提供存档数据校验与版本管理能力。

## Glossary

- **Save_System**: 存档系统，负责将游戏状态序列化为 JSON 并写入 localStorage，以及从 localStorage 读取并反序列化恢复游戏状态
- **Save_Data**: 存档数据，存储在 localStorage 中的 JSON 对象，包含所有需要持久化的游戏状态
- **Resource_State**: 资源状态，玩家当前持有的所有资源类型及其数量（gold、stone、wood、wheat、bread 等 17 种资源）
- **Job_Assignment_State**: 岗位分配状态，各工作岗位当前分配的工匠数量
- **Dungeon_Progress**: 地牢进度，包含已解锁层级、已完成层级、各层探索进度、已占领设施等信息
- **Resource_Layer_Progress**: 资源层探险进度，记录玩家在资源层（每5层出现一次）的到达状态
- **Mine_Capture_Progress**: 矿产占领进度，记录玩家已占领的矿产设施类型和 ID 列表
- **Save_Version**: 存档版本号，用于标识存档数据结构的版本，支持向前兼容迁移
- **Storage_Key**: localStorage 中存储存档数据的键名，当前为 `underground_castle_outside`
- **Serializer**: 序列化器，将游戏内存中的状态对象转换为可存储的 JSON 字符串
- **Deserializer**: 反序列化器，将 localStorage 中的 JSON 字符串还原为游戏状态对象

## Requirements

### Requirement 1: 资源状态完整存档

**User Story:** As a 玩家, I want 游戏自动保存我所有的资源数量, so that 关闭浏览器后重新打开时资源不会丢失

#### Acceptance Criteria

1. WHEN 资源数量发生变化, THE Save_System SHALL 将所有 Resource_State（17 种资源的当前数量）序列化并写入 localStorage
2. WHEN 游戏启动并从 localStorage 加载存档, THE Save_System SHALL 将 Save_Data 中的资源数量恢复到 ResourceManager 中
3. IF Save_Data 中缺少某种资源的字段, THEN THE Save_System SHALL 将该资源初始化为 RESOURCE_CONFIG_EXTERNAL 中定义的 initial 值
4. THE Save_System SHALL 以 RESOURCE_CONFIG_EXTERNAL 中定义的资源 key 作为存档字段名，确保配置新增资源时存档自动兼容

### Requirement 2: 岗位分配状态存档

**User Story:** As a 玩家, I want 游戏保存我的工匠岗位分配, so that 重新打开游戏时不需要重新分配工匠

#### Acceptance Criteria

1. WHEN 岗位分配发生变化, THE Save_System SHALL 将所有 Job_Assignment_State（各岗位分配的工匠数量）序列化并写入 localStorage
2. WHEN 游戏启动并加载存档, THE Save_System SHALL 将 Save_Data 中的岗位分配数据恢复到 JobManager 中
3. THE Save_System SHALL 同时保存工匠总容量（craftsman.totalCapacity）和建筑数量（buildings），确保工匠系统状态完整恢复
4. IF Save_Data 中包含当前配置中不存在的岗位 ID, THEN THE Save_System SHALL 忽略该无效岗位数据并继续加载其余有效数据

### Requirement 3: 地牢探险进度存档

**User Story:** As a 玩家, I want 游戏保存我的地牢探险进度, so that 重新打开游戏时已解锁的层级和已击败的 Boss 记录仍然保留

#### Acceptance Criteria

1. WHEN 玩家完成一个地牢层级（Boss 击败或无 Boss 层传送）, THE Save_System SHALL 将 Dungeon_Progress（unlockedLayers、completedLayers、layerProgress）写入 localStorage
2. WHEN 游戏启动并加载存档, THE Save_System SHALL 将 Save_Data 中的 Dungeon_Progress 恢复到 ProgressTracker 中
3. THE Save_System SHALL 保存每层的 fogState（迷雾探索状态）和 bossDefeated 标志
4. IF Save_Data 中缺少 dungeon 字段, THEN THE Save_System SHALL 将 ProgressTracker 初始化为默认状态（仅第1层解锁）

### Requirement 4: 资源层探险进度存档

**User Story:** As a 玩家, I want 游戏保存我在资源层的探险进入记录, so that 重新打开游戏时已到达过的资源层仍然显示为已到达状态

#### Acceptance Criteria

1. WHEN 玩家进入一个资源层并返回入口, THE Save_System SHALL 将该资源层的 reached 标志保存到 layerProgress 中
2. WHEN 游戏启动并加载存档, THE Save_System SHALL 恢复所有资源层的 reached 状态，使 DungeonSelectUI 正确显示"已到达"标签
3. THE Save_System SHALL 将资源层进度作为 Dungeon_Progress 的一部分统一存储，使用 layerProgress[layerId].reached 字段

### Requirement 5: 矿产占领进度存档

**User Story:** As a 玩家, I want 游戏保存我已占领的矿产设施, so that 重新打开游戏时已解锁的工作岗位仍然可用

#### Acceptance Criteria

1. WHEN 玩家占领一个新的矿产设施, THE Save_System SHALL 将 Mine_Capture_Progress（capturedFacilities 数组）写入 localStorage
2. WHEN 游戏启动并加载存档, THE Save_System SHALL 将 Save_Data 中的 capturedFacilities 恢复到 ProgressTracker 中
3. THE Save_System SHALL 同时支持按设施类型（如 lumber_mill）和按设施 ID（如 layer1_lumber）两种格式的占领记录
4. WHEN 游戏启动并恢复占领进度后, THE Save_System SHALL 确保 ProgressTracker.getUnlockedJobs() 返回正确的已解锁岗位列表，使 JobManager 的岗位过滤正常工作

### Requirement 6: 士兵数据存档

**User Story:** As a 玩家, I want 游戏保存我招募和培养的士兵数据, so that 重新打开游戏时士兵的阶级和属性不会丢失

#### Acceptance Criteria

1. WHEN 士兵数据发生变化（招募或进阶）, THE Save_System SHALL 将所有士兵数据（tier、attack、defense、hp、speed）序列化并写入 localStorage
2. WHEN 游戏启动并加载存档, THE Save_System SHALL 将 Save_Data 中的士兵数组恢复到 SoldierManager 中
3. IF Save_Data 中的士兵记录缺少 speed 字段, THEN THE Save_System SHALL 将该士兵的 speed 默认设为 10

### Requirement 7: 存档数据序列化与反序列化

**User Story:** As a 开发者, I want 存档系统提供统一的序列化和反序列化接口, so that 所有游戏状态通过一个入口完成保存和加载

#### Acceptance Criteria

1. THE Save_System SHALL 提供 save() 方法，将所有游戏状态（Resource_State、Job_Assignment_State、craftsman、buildings、soldiers、Dungeon_Progress）序列化为单个 JSON 对象并写入 localStorage
2. THE Save_System SHALL 提供 load() 方法，从 localStorage 读取 JSON 字符串并反序列化为游戏状态对象返回
3. FOR ALL 有效的 Save_Data 对象, 执行 save() 写入后再执行 load() 读取 SHALL 产生与原始数据等价的对象（round-trip 属性）
4. THE Serializer SHALL 将 Save_Data 格式化为合法的 JSON 字符串
5. THE Deserializer SHALL 将合法的 JSON 字符串解析为 Save_Data 对象

### Requirement 8: 存档版本管理

**User Story:** As a 开发者, I want 存档数据包含版本号, so that 未来新增存档字段时可以自动迁移旧版存档

#### Acceptance Criteria

1. THE Save_System SHALL 在每次保存时将 Save_Version 写入 Save_Data 中
2. WHEN 游戏加载一个不包含 Save_Version 的旧存档, THE Save_System SHALL 将其视为版本 1 并执行必要的字段补全
3. WHEN 游戏加载一个 Save_Version 低于当前版本的存档, THE Save_System SHALL 按版本顺序依次执行迁移逻辑，补全缺失字段并保留已有数据
4. THE Save_System SHALL 在迁移完成后将 Save_Version 更新为当前版本

### Requirement 9: 存档异常处理

**User Story:** As a 玩家, I want 存档系统在遇到错误时不会导致游戏崩溃, so that 即使存档损坏我也能继续游戏

#### Acceptance Criteria

1. IF localStorage 写入失败（如 QuotaExceededError）, THEN THE Save_System SHALL 静默处理异常并允许游戏继续运行
2. IF localStorage 中的存档数据无法解析为合法 JSON, THEN THE Save_System SHALL 返回默认初始状态并允许游戏正常启动
3. IF Save_Data 中的字段值类型不符合预期（如资源数量为非数字）, THEN THE Save_System SHALL 将该字段重置为默认值
4. IF localStorage 不可用（如隐私模式）, THEN THE Save_System SHALL 静默处理并允许游戏以无存档模式运行
