# 需求文档

## 简介

关外经营系统（Outside_Castle）是 Underground Castle 游戏的地上经营部分。本阶段聚焦于最基础的资源生产功能：炼金按钮和收集按钮。玩家通过点击按钮产生金币、石头和木头等基础资源，为后续的城堡建设和地牢探险做准备。

## 术语表

- **Outside_Castle**: 关外经营系统，城堡外的模拟经营界面
- **Alchemy_Button**: 炼金按钮，点击产生金币的操作按钮
- **Collect_Button**: 收集按钮，点击产生石头和木头的操作按钮
- **Gold**: 金币，游戏主要货币资源
- **Stone**: 石头，建筑材料资源
- **Wood**: 木头，建筑材料资源
- **Cooldown**: 冷却时间，按钮点击后需要等待的不可操作时间
- **Resource_Display**: 资源显示区域，展示玩家当前持有的各类资源数量
- **Save_System**: 存档系统，负责将游戏数据保存到浏览器本地存储
- **Canvas_Renderer**: Canvas 渲染器，负责在 2D Canvas 上绘制游戏界面

## 需求

### 需求 1：炼金产金

**用户故事：** 作为玩家，我希望点击炼金按钮产生金币，以便积累货币用于城堡升级和装备制作。

#### 验收标准

1. WHEN 玩家点击 Alchemy_Button 且 Alchemy_Button 不在 Cooldown 中, THE Outside_Castle SHALL 将 1 枚 Gold 加入玩家的 Gold 总量
2. WHEN Alchemy_Button 被成功点击并产生 Gold, THE Resource_Display SHALL 立即更新显示新的 Gold 总量
3. WHEN Alchemy_Button 被成功点击, THE Alchemy_Button SHALL 进入 5 秒的 Cooldown 期
4. WHILE Alchemy_Button 处于 Cooldown 中, THE Alchemy_Button SHALL 向玩家显示剩余的 Cooldown 时间
5. WHILE Alchemy_Button 处于 Cooldown 中, THE Outside_Castle SHALL 忽略对 Alchemy_Button 的点击

### 需求 2：收集资源

**用户故事：** 作为玩家，我希望点击收集按钮获取石头和木头，以便获得建筑材料用于城堡建设。

#### 验收标准

1. WHEN 玩家点击 Collect_Button 且 Collect_Button 不在 Cooldown 中, THE Outside_Castle SHALL 将随机数量的 Stone（3 到 6 之间，含边界值）加入玩家的 Stone 总量
2. WHEN 玩家点击 Collect_Button 且 Collect_Button 不在 Cooldown 中, THE Outside_Castle SHALL 将随机数量的 Wood（3 到 6 之间，含边界值）加入玩家的 Wood 总量
3. WHEN Collect_Button 被成功点击并产生资源, THE Resource_Display SHALL 立即更新显示新的 Stone 和 Wood 总量
4. WHEN Collect_Button 被成功点击, THE Collect_Button SHALL 进入 10 秒的 Cooldown 期
5. WHILE Collect_Button 处于 Cooldown 中, THE Collect_Button SHALL 向玩家显示剩余的 Cooldown 时间
6. WHILE Collect_Button 处于 Cooldown 中, THE Outside_Castle SHALL 忽略对 Collect_Button 的点击

### 需求 3：资源显示

**用户故事：** 作为玩家，我希望在屏幕上看到当前的资源总量，以便做出合理的资源使用决策。

#### 验收标准

1. THE Resource_Display SHALL 始终在 Canvas 上显示当前的 Gold、Stone 和 Wood 总量
2. WHEN 任意资源总量发生变化, THE Resource_Display SHALL 在同一渲染帧内反映更新后的数值

### 需求 4：自动存档

**用户故事：** 作为玩家，我希望资源进度能自动保存，以便下次回到游戏时能从上次离开的地方继续。

#### 验收标准

1. WHEN 任意资源总量发生变化, THE Save_System SHALL 将当前的 Gold、Stone 和 Wood 总量持久化到浏览器 localStorage
2. WHEN 游戏加载时, THE Save_System SHALL 从 localStorage 恢复之前保存的 Gold、Stone 和 Wood 总量
3. IF localStorage 数据缺失或损坏, THEN THE Save_System SHALL 将所有资源总量初始化为零并继续正常运行

### 需求 5：Canvas 渲染

**用户故事：** 作为玩家，我希望关外界面在 2D Canvas 上渲染，以便游戏有一致的视觉呈现。

#### 验收标准

1. THE Canvas_Renderer SHALL 在 2D Canvas 上渲染 Alchemy_Button 和 Collect_Button
2. THE Canvas_Renderer SHALL 在 2D Canvas 上渲染显示 Gold、Stone 和 Wood 总量的 Resource_Display
3. WHEN 玩家点击 Canvas 上对应按钮的区域, THE Canvas_Renderer SHALL 检测点击并触发相应的按钮动作
4. WHILE 按钮处于 Cooldown 中, THE Canvas_Renderer SHALL 以视觉上可区分的状态渲染按钮并显示剩余 Cooldown 时间
