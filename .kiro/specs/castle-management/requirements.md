# Requirements Document

## Introduction

城堡经营系统是地下城堡游戏的关外部分，玩家通过点击按钮生产资源，为后续的城堡建设和地牢探险做准备。初始版本聚焦于核心的资源生产循环：炼金产生金币，收集产生石头和木头。

## Glossary

- **Castle_System**: 城堡经营系统，管理资源生产和存储
- **Resource**: 资源，包括金币、木头、石头
- **Alchemy_Button**: 炼金按钮，点击产生金币
- **Collect_Button**: 收集按钮，点击产生木头和石头
- **Cooldown**: 冷却时间，按钮点击后需要等待的时间
- **Save_System**: 存档系统，负责游戏进度的保存和加载

## Requirements

### Requirement 1: 炼金按钮功能

**User Story:** 作为玩家，我想要点击炼金按钮产生金币，以便积累游戏货币。

#### Acceptance Criteria

1. WHEN 玩家点击 Alchemy_Button AND 按钮不在冷却中 THEN THE Castle_System SHALL 增加 1 枚金币
2. WHEN 玩家点击 Alchemy_Button AND 按钮不在冷却中 THEN THE Castle_System SHALL 启动 5 秒冷却时间
3. WHEN 玩家点击 Alchemy_Button AND 按钮在冷却中 THEN THE Castle_System SHALL 忽略点击
4. WHEN 冷却时间结束 THEN THE Alchemy_Button SHALL 变为可点击状态
5. THE Castle_System SHALL 显示 Alchemy_Button 的剩余冷却时间
6. WHEN 金币数量增加 THEN THE Castle_System SHALL 更新金币显示

### Requirement 2: 收集按钮功能

**User Story:** 作为玩家，我想要点击收集按钮产生木头和石头，以便积累建筑材料。

#### Acceptance Criteria

1. WHEN 玩家点击 Collect_Button AND 按钮不在冷却中 THEN THE Castle_System SHALL 增加 3 到 6 个随机数量的木头
2. WHEN 玩家点击 Collect_Button AND 按钮不在冷却中 THEN THE Castle_System SHALL 增加 3 到 6 个随机数量的石头
3. WHEN 玩家点击 Collect_Button AND 按钮不在冷却中 THEN THE Castle_System SHALL 启动 10 秒冷却时间
4. WHEN 玩家点击 Collect_Button AND 按钮在冷却中 THEN THE Castle_System SHALL 忽略点击
5. WHEN 冷却时间结束 THEN THE Collect_Button SHALL 变为可点击状态
6. THE Castle_System SHALL 显示 Collect_Button 的剩余冷却时间
7. WHEN 木头或石头数量增加 THEN THE Castle_System SHALL 更新资源显示

### Requirement 3: 资源管理

**User Story:** 作为玩家，我想要查看当前拥有的资源数量，以便了解游戏进度。

#### Acceptance Criteria

1. THE Castle_System SHALL 追踪金币的当前数量
2. THE Castle_System SHALL 追踪木头的当前数量
3. THE Castle_System SHALL 追踪石头的当前数量
4. THE Castle_System SHALL 在界面上显示金币数量
5. THE Castle_System SHALL 在界面上显示木头数量
6. THE Castle_System SHALL 在界面上显示石头数量
7. WHEN 任何资源数量变化 THEN THE Castle_System SHALL 立即更新对应的显示

### Requirement 4: 存档系统

**User Story:** 作为玩家，我想要保存和加载游戏进度，以便随时继续游戏。

#### Acceptance Criteria

1. WHEN 资源数量变化 THEN THE Save_System SHALL 自动保存游戏状态到浏览器本地存储
2. WHEN 游戏启动 THEN THE Save_System SHALL 尝试从本地存储加载存档
3. WHEN 存档加载成功 THEN THE Castle_System SHALL 恢复所有资源数量（金币、木头、石头）
4. WHEN 不存在存档 THEN THE Save_System SHALL 初始化新游戏状态（所有资源为 0）
5. THE Save_System SHALL 将游戏状态序列化为 JSON 格式
6. THE Save_System SHALL 从 JSON 格式反序列化游戏状态
7. IF 存档数据损坏 THEN THE Save_System SHALL 初始化新游戏状态

### Requirement 5: 用户界面

**User Story:** 作为玩家，我想要看到清晰的界面，以便轻松操作游戏。

#### Acceptance Criteria

1. THE Castle_System SHALL 在页面上显示炼金按钮
2. THE Castle_System SHALL 在页面上显示收集按钮
3. THE Castle_System SHALL 在页面上显示资源面板（金币、木头、石头）
4. WHEN 按钮在冷却中 THEN THE Castle_System SHALL 视觉上禁用该按钮
5. WHEN 按钮可用 THEN THE Castle_System SHALL 视觉上启用该按钮
6. THE Castle_System SHALL 在按钮上或旁边显示冷却倒计时
7. THE Castle_System SHALL 使用清晰的文字标签标识每个按钮和资源
