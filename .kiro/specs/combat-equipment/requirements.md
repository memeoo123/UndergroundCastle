# 需求文档

## 简介

战斗装备系统为 Underground Castle 新增战斗人员（战士）和装备两大概念。玩家可在地下城堡界面通过"制造"按钮打开制造界面，消耗资源制造装备，再消耗装备升级战士。战士分为多种类型，每种类型拥有独立的升级路线，不同类型之间不可交叉升级。战士和装备的配置均外置到独立 JS 文件中，便于扩展。

## 术语表

| 术语 | 说明 |
|------|------|
| Warrior | 战斗人员/战士，可进入地牢战斗的角色 |
| Warrior_Type | 战士类型（如剑士、弓手、法师等），每种类型有独立升级路线 |
| Warrior_Level | 战士等级，通过消耗装备升级 |
| Equipment | 装备，用于升级战士的物品 |
| Equipment_Type | 装备类型（如剑、弓、法杖等），与特定战士类型绑定 |
| Craft_Button | 制造按钮，位于地下城堡界面 |
| Craft_Page | 制造界面，展示可制造的装备列表 |
| Warrior_Config | 战士配置文件（warrior-config.js），定义战士类型和升级路线 |
| Equipment_Config | 装备配置文件（equipment-config.js），定义装备类型和制造消耗 |
| Upgrade_Path | 升级路线，定义战士从当前等级升到下一等级所需的装备 |
| WarriorManager | 战士管理器，管理战士的招募、升级和状态 |
| EquipmentManager | 装备管理器，管理装备的制造和库存 |
| Castle_Page | 地下城堡界面（已有） |
| ResourceManager | 资源管理器（已有） |
| Save_System | 存档系统（已有） |
| Canvas_Renderer | Canvas 渲染器（已有） |

## 需求

### 需求 1：装备配置外置

**用户故事：** 作为开发者，我想将装备定义放在独立的 JS 配置文件中，以便无需修改核心代码即可新增装备类型。

#### 验收标准

1. THE Equipment_Config SHALL 在 equipment-config.js 中以全局变量 EQUIPMENT_CONFIG_EXTERNAL 定义所有装备类型
2. WHEN 加载 Equipment_Config 时，THE 系统 SHALL 读取每种装备的名称、制造所需资源消耗、以及该装备对应的战士类型
3. WHEN 新增装备定义到 Equipment_Config 时，THE 系统 SHALL 自动支持新装备的制造，无需修改核心代码
4. THE Equipment_Config SHALL 为每种装备定义唯一的 ID 键名

### 需求 2：战士配置外置

**用户故事：** 作为开发者，我想将战士类型和升级路线放在独立的 JS 配置文件中，以便无需修改核心代码即可新增战士类型。

#### 验收标准

1. THE Warrior_Config SHALL 在 warrior-config.js 中以全局变量 WARRIOR_CONFIG_EXTERNAL 定义所有战士类型
2. WHEN 加载 Warrior_Config 时，THE 系统 SHALL 读取每种战士类型的名称、初始属性、以及升级路线
3. THE Upgrade_Path SHALL 为每个等级定义升级所需的装备类型和数量
4. WHEN 新增战士类型定义到 Warrior_Config 时，THE 系统 SHALL 自动支持新战士类型的招募和升级，无需修改核心代码
5. THE Warrior_Config SHALL 为每种战士类型定义唯一的 ID 键名

### 需求 3：装备制造

**用户故事：** 作为玩家，我想消耗资源制造装备，以便用于升级战士。

#### 验收标准

1. WHEN 玩家在 Craft_Page 选择一种装备并点击制造，THE EquipmentManager SHALL 检查 ResourceManager 中对应资源是否充足
2. WHEN 资源充足时，THE EquipmentManager SHALL 扣除对应资源并将装备数量加 1
3. IF 资源不足，THEN THE EquipmentManager SHALL 拒绝制造并保持当前状态
4. WHEN 装备制造成功，THE 系统 SHALL 通过 Toast 提示玩家获得的装备
5. WHEN 装备制造成功，THE 系统 SHALL 立即持久化装备库存到 localStorage

### 需求 4：战士升级

**用户故事：** 作为玩家，我想消耗装备升级战士，以便提升战士的战斗能力。

#### 验收标准

1. WHEN 玩家选择一个战士并点击升级，THE WarriorManager SHALL 根据 Upgrade_Path 检查所需装备是否充足
2. WHEN 所需装备充足时，THE WarriorManager SHALL 扣除对应装备并将战士等级加 1
3. IF 所需装备不足，THEN THE WarriorManager SHALL 拒绝升级并保持当前状态
4. THE WarriorManager SHALL 仅允许使用与该战士类型匹配的装备进行升级
5. IF 玩家尝试使用不匹配类型的装备升级战士，THEN THE WarriorManager SHALL 拒绝升级
6. WHEN 战士升级成功，THE 系统 SHALL 通过 Toast 提示玩家升级结果
7. WHEN 战士升级成功，THE 系统 SHALL 立即持久化战士数据到 localStorage

### 需求 5：类型隔离

**用户故事：** 作为玩家，我希望不同类型的战士有各自独立的升级路线，避免混淆。

#### 验收标准

1. THE Upgrade_Path SHALL 为每种 Warrior_Type 定义独立的升级所需装备序列
2. WHEN 升级某类型战士时，THE WarriorManager SHALL 仅接受该类型对应的 Equipment_Type
3. THE Equipment_Config 中每种装备 SHALL 明确标注其对应的 Warrior_Type
4. WHEN 配置中某装备的 Warrior_Type 与战士类型不匹配时，THE WarriorManager SHALL 拒绝使用该装备

### 需求 6：制造界面

**用户故事：** 作为玩家，我想在地下城堡界面通过制造按钮打开制造界面，查看并制造装备。

#### 验收标准

1. THE Craft_Button SHALL 显示在 Castle_Page 上，位于现有按钮（炼金、建造）下方
2. WHEN 玩家点击 Craft_Button，THE Canvas_Renderer SHALL 显示 Craft_Page
3. THE Craft_Page SHALL 列出所有可制造的装备，显示装备名称、所需资源、当前库存数量
4. WHEN 资源充足时，THE Craft_Page SHALL 以可点击状态显示该装备的制造按钮
5. WHEN 资源不足时，THE Craft_Page SHALL 以禁用状态显示该装备的制造按钮
6. THE Craft_Page SHALL 提供返回按钮，点击后回到 Castle_Page 正常视图
7. WHEN 装备列表超出显示区域，THE Craft_Page SHALL 支持滚动浏览

### 需求 7：存档兼容

**用户故事：** 作为玩家，我希望新增的战士和装备数据能正确保存和加载，且不影响已有存档。

#### 验收标准

1. WHEN 保存游戏时，THE Save_System SHALL 将战士数据（类型、等级）和装备库存持久化到 localStorage
2. WHEN 加载游戏时，THE Save_System SHALL 从 localStorage 恢复战士数据和装备库存
3. WHEN 旧存档缺失战士或装备字段时，THE Save_System SHALL 初始化为默认值（无战士、装备库存为零）
4. IF 存档中战士或装备数据损坏，THEN THE Save_System SHALL 初始化为默认值

### 需求 8：装备库存显示

**用户故事：** 作为玩家，我想在仓库中看到当前拥有的装备数量。

#### 验收标准

1. THE Canvas_Renderer SHALL 在 Castle_Page 仓库区域显示所有装备的当前库存数量
2. WHEN 装备库存变化时，THE Canvas_Renderer SHALL 在下一帧更新显示
3. THE 装备显示 SHALL 与现有资源显示风格一致
