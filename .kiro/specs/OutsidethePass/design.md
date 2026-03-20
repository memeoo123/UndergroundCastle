# 设计文档：关外经营系统（OutsidethePass）

## 概述

两个全屏页面拖拽切换，炼金/收集产资源，工匠分配岗位自动产出，建造建筑扩容。Toast 浮动提示，产出倒计时和预览，Building_Page 独立建筑界面。士兵系统支持招募冒险者和树形进阶。Training_Page 独立训练界面，支持招募冒险者、查看士兵列表、进阶弹窗操作。单文件架构 + 配置外置 + 2D Canvas + localStorage。

## 架构

```
index.html          — 主文件，Canvas + 游戏循环 + 集成
outside-config.js   — 外置配置（冷却、产出、Canvas、页面切换、Toast）
outside-logic.js    — 核心逻辑模块（所有 Manager）
job-config.js       — 岗位和建筑外置配置
resource-config.js  — 资源类型外置配置
soldier-config.js   — 士兵类型外置配置（阶级、属性、进阶路径、进阶费用）
```

模块依赖：Game Loop → PageManager / InputHandler / CanvasRenderer / ResourceManager / JobManager / ToastManager / SoldierManager
集成方式：ResourceManager.add/deduct 在 index.html 中包装，自动触发 Toast 和存档

## 组件接口摘要

- **ResourceManager**: addResource(key,amt), hasEnough(costs), deduct(costs), getResources() — 配置驱动
- **ButtonManager**: isInCooldown/getRemainingCooldown/handleClick/isPointInButton
- **SaveSystem**: save(resources,craftsman,jobs,buildings), load() — 配置驱动
- **PageManager**: currentPage(0/1), offsetX, isDragging, isAnimating, castleScrollOffset, kingdomScrollOffset, showBuildingPage, buildingScrollOffset, showTrainingPage, trainingScrollOffset, promoteDialogOpen, promoteDialogSoldierIndex; startDrag/updateDrag/endDrag/updateAnimation/shouldSwitchPage/handleScroll/openBuildingPage/closeBuildingPage/handleBuildingScroll/openTrainingPage/closeTrainingPage/handleTrainingScroll/openPromoteDialog/closePromoteDialog
- **CanvasRenderer**: render(检查showBuildingPage/showTrainingPage优先绘制对应Page), drawCastlePage/drawKingdomPage/drawBuildingPage/drawTrainingPage/drawPromoteDialog/drawWarehouse/drawJobScrollView 等
- **InputHandler**: mouse/touch/wheel 事件，区分拖拽和点击，Building_Page/Training_Page 模式下处理返回/操作/滚动，Promote_Dialog 模式下仅处理弹窗内交互
- **CraftsmanManager**: totalCapacity, getAssigned/getAvailable/addCapacity/canAssign
- **JobManager**: assignments, lastTickTime; init/assign/unassign/update/calculateProduction/getRemainingSeconds/previewProduction
- **BuildingManager**: buildCounts, button; init/canBuild/build/getBuildCounts
- **ToastManager**: toasts[]; getConfig/addToast/addResourceToasts/update/render
- **SoldierManager**: soldiers[]; recruit/promote/getSoldiers/canRecruit/canPromote/getSoldierConfig — 配置驱动，只能招募冒险者，通过树形进阶获得高阶兵种

## 关键算法

### getRemainingSeconds(now)
`lastTickTime=0 → ceil(interval/1000); else → ceil((interval-(now-lastTickTime))/1000); <=0 → ceil(interval/1000)`

### previewProduction(resourceManager)
遍历有工匠岗位，累计 changes，消耗资源限制用 `floor(available/cost)` 计算实际工匠数。

### calculateProduction(jobId, workerCount, resourceManager)
同 previewProduction 逻辑，直接修改 resourceManager 属性。

## 数据模型

### localStorage 存档格式
```json
{ "gold":0, "stone":0, "wood":0, "wheat":0, "bread":0, ...(所有资源),
  "craftsman": { "totalCapacity": 0 },
  "jobs": { "farmer":0, "baker":0, ... },
  "buildings": { "dormitory":0 },
  "soldiers": [
    { "type": "warrior", "attack": 5, "defense": 3, "hp": 20 },
    { "type": "archer", "attack": 7, "defense": 1, "hp": 12 }
  ] }
```

### 页面定义
- 页面 0 (Castle_Page): 炼金按钮+建造按钮+训练按钮+仓库滚动视图
- 页面 1 (Kingdom_Page): 收集按钮+工匠信息+倒计时+预览+岗位滚动视图
- Building_Page: showBuildingPage=true 时全屏覆盖，建筑列表+返回按钮
- Training_Page: showTrainingPage=true 时全屏覆盖，招募按钮+士兵列表+返回按钮
- Promote_Dialog: promoteDialogOpen=true 时覆盖在 Training_Page 上，显示进阶目标列表+关闭按钮

### soldier-config.js 配置格式
```javascript
var SOLDIER_CONFIG_EXTERNAL = {
    soldiers: {
        adventurer: {
            name: '冒险者',
            tier: 1,
            recruitCost: { gold: 2 },       // 只有冒险者有 recruitCost
            stats: { attack: 1, defense: 1, hp: 8 },
            promoteTo: ['warrior', 'archer'] // 可进阶的目标兵种
        },
        warrior: {
            name: '战士',
            tier: 2,
            promoteCost: { gold: 10, iron: 5 },
            stats: { attack: 5, defense: 3, hp: 20 },
            promoteTo: ['berserker', 'knight']
        },
        archer: {
            name: '弓箭手',
            tier: 2,
            promoteCost: { gold: 8, wood: 10 },
            stats: { attack: 7, defense: 1, hp: 12 },
            promoteTo: ['crossbowman']
        },
        berserker: {
            name: '狂战士',
            tier: 3,
            promoteCost: { gold: 40, steel: 5 },
            stats: { attack: 18, defense: 2, hp: 50 },
            promoteTo: []
        },
        knight: {
            name: '骑士',
            tier: 3,
            promoteCost: { gold: 40, steel: 8 },
            stats: { attack: 10, defense: 12, hp: 45 },
            promoteTo: []
        },
        crossbowman: {
            name: '弩手',
            tier: 3,
            promoteCost: { gold: 32, wood: 40 },
            stats: { attack: 16, defense: 3, hp: 25 },
            promoteTo: []
        }
    }
};
```

### SoldierManager 关键算法

#### recruit(resourceManager)
1. 从配置获取 adventurer 的 recruitCost
2. resourceManager.hasEnough(recruitCost) → false 则返回 false
3. resourceManager.deduct(recruitCost)
4. 创建 { type: 'adventurer', ...adventurer.stats }，push 到 soldiers[]
5. 返回 true

#### promote(soldierIndex, targetTypeId, resourceManager)
1. 获取 soldiers[soldierIndex]，读取当前 type
2. 从配置获取当前 type 的 promoteTo 列表
3. targetTypeId 不在 promoteTo 中 → 返回 false
4. 从配置获取 targetTypeId 的 promoteCost 和 stats
5. resourceManager.hasEnough(promoteCost) → false 则返回 false
6. resourceManager.deduct(promoteCost)
7. 替换 soldier: type=targetTypeId, stats=目标兵种.stats
8. 返回 true

#### canPromote(soldierIndex, targetTypeId, resourceManager)
1. 获取 soldiers[soldierIndex]，读取当前 type
2. 从配置获取当前 type 的 promoteTo 列表
3. targetTypeId 不在 promoteTo 中 → 返回 false
4. 从配置获取 targetTypeId 的 promoteCost
5. 返回 resourceManager.hasEnough(promoteCost)

### Training_Page 设计

#### PageManager 新增状态
```
showTrainingPage: false,       // 是否显示训练界面
trainingScrollOffset: 0,       // 训练界面滚动偏移
promoteDialogOpen: false,      // 是否显示进阶弹窗
promoteDialogSoldierIndex: -1  // 当前弹窗对应的士兵索引
```

#### PageManager 新增方法

**openTrainingPage()**
1. showTrainingPage = true
2. trainingScrollOffset = 0
3. promoteDialogOpen = false

**closeTrainingPage()**
1. showTrainingPage = false
2. promoteDialogOpen = false

**handleTrainingScroll(delta)**
1. trainingScrollOffset += delta
2. if trainingScrollOffset < 0 → trainingScrollOffset = 0

**openPromoteDialog(soldierIndex)**
1. promoteDialogOpen = true
2. promoteDialogSoldierIndex = soldierIndex

**closePromoteDialog()**
1. promoteDialogOpen = false
2. promoteDialogSoldierIndex = -1

#### Castle_Page 布局变更
Train_Button 位于 Build_Button 下方，与炼金/建造按钮竖向排列：
```
leftX = 50, startY = 80, btnSpacing = 80
炼金按钮: y = startY
建造按钮: y = startY + btnSpacing
训练按钮: y = startY + btnSpacing * 2
```
Train_Button 使用与 Build_Button 相同的尺寸和样式，文字为"训练"。

#### CanvasRenderer.render 拦截逻辑
```
if showBuildingPage → drawBuildingPage (已有)
else if showTrainingPage → drawTrainingPage (新增)
else → 正常绘制双页面
```

#### drawTrainingPage(soldierManager, resourceManager, scrollOffset, canvasWidth, canvasHeight)
1. 全屏深色背景（同 Building_Page 风格）
2. 标题"训练" + 返回按钮（同 Building_Page 布局）
3. 招募按钮区域：
   - 显示"招募冒险者"按钮 + 费用信息
   - canRecruit → 高亮绿色，否则灰色
   - 存储按钮位置到 _trainingRecruitBtn
4. 士兵列表滚动区域（ScrollView）：
   - 遍历 soldierManager.getSoldiers()
   - 每个 Soldier_Entry 显示：
     - 名称（从配置获取）+ Tier 标记
     - 属性：ATK/DEF/HP
     - promoteTo 非空 → 显示"进阶"按钮，存储位置到 _trainingPromoteBtns[index]
     - promoteTo 为空 → 不显示进阶按钮（满阶标记）
5. 滚动条（同 Building_Page 逻辑）
6. 存储返回按钮位置到 _trainingBackBtn

#### drawPromoteDialog(soldierIndex, soldierManager, resourceManager, canvasWidth, canvasHeight)
1. 半透明遮罩覆盖全屏
2. 居中弹窗面板（固定宽高）
3. 标题：当前士兵名称 + "进阶"
4. 关闭按钮（右上角 X），存储位置到 _promoteDialogCloseBtn
5. 遍历当前士兵的 promoteTo 列表：
   - 从配置获取目标兵种信息
   - 显示：目标名称、Tier、属性（ATK/DEF/HP）
   - 显示进阶费用（资源不足红色，充足白色）
   - 进阶按钮（canPromote → 高亮，否则灰色）
   - 存储按钮位置到 _promoteDialogTargetBtns[targetTypeId]

#### InputHandler 变更

**onDown**: showTrainingPage=true 且 promoteDialogOpen=false 时不启动页面拖拽

**onMove**: showTrainingPage=true 时仅支持滚动（同 Building_Page 模式），promoteDialogOpen=true 时忽略

**onUp 点击处理**:
```
if showTrainingPage:
  if promoteDialogOpen:
    检测关闭按钮 → closePromoteDialog
    检测目标兵种进阶按钮 → promote + closePromoteDialog
    其他点击忽略（模态）
  else:
    检测返回按钮 → closeTrainingPage
    检测招募按钮 → recruit
    检测士兵进阶按钮 → openPromoteDialog(soldierIndex)
```

**wheel**: showTrainingPage=true 且 promoteDialogOpen=false 时 → handleTrainingScroll

## 正确性属性

### Property 1-6: 核心逻辑
1. 炼金产出正确性（非冷却+1，冷却不变） _Validates: 1.1, 1.5_
2. 收集产出范围 ∈ [3,6] _Validates: 2.1, 2.2, 2.6_
3. 冷却时间计算正确性 _Validates: 1.3, 1.4, 2.4, 2.5_
4. 资源显示一致性 _Validates: 1.2, 2.3, 3.1, 3.2_
5. 存档读写往返一致 _Validates: 4.1, 4.2_
6. 点击命中检测 ⟺ 点在矩形内 _Validates: 5.3_

### Property 7-11: PageManager
7. 页面切换往返一致 _Validates: 6.4, 6.5_
8. 拖拽跟随正确性 _Validates: 6.6_
9. 切换阈值 = |drag| >= width*0.3 _Validates: 6.7, 6.8_
10. 动画期间拖拽锁定 _Validates: 6.9_
11. offsetX ∈ [-(pageCount-1)*width, 0] _Validates: 6.10, 6.11_

### Property 12-19: 工匠与岗位
12. 配置驱动初始化（所有key值为0） _Validates: 7.2, 7.3, 7.4_
13. 扩展存档往返一致 _Validates: 8.4, 8.5, 9.6, 9.7, 13.2_
14. 工匠不变量 available=total-assigned _Validates: 9.1, 9.3, 9.4, 12.3, 12.4_
15. available=0 拒绝分配 _Validates: 9.5_
16. 产出时机正确性 _Validates: 10.1_
17. Farmer: n工匠→wheat+=2n _Validates: 10.2_
18. Baker: min(n,floor(w/2))处理 _Validates: 10.3, 10.4_
19. 建造正确性（够扣除+增容，不够不变） _Validates: 11.3, 11.4, 11.5_

### Property 20: 资源显示
20. 渲染包含所有资源值 _Validates: 8.2, 8.3_

### Property 21-28: Toast
21. Toast数量=非零变化资源种类数 _Validates: 14.1, 14.3, 15.1, 15.3_
22. gain绿色"+N name", consume红色"-N name" _Validates: 14.2, 15.2_
23. 无活跃Toast时新Toast在Canvas中心 _Validates: 16.1_
24. 新Toast.startY=上一条+spacing _Validates: 16.2, 16.3_
25. y=startY+speed*elapsed/1000 _Validates: 17.1_
26. opacity=max(0,1-elapsed/duration) _Validates: 17.2, 17.4_
27. opacity≤0移除 _Validates: 17.3_
28. 使用外部配置值 _Validates: 19.1_

### Property 29-30: 倒计时与预览
29. getRemainingSeconds = ceil((interval-elapsed)/1000) _Validates: 20.4_
30. previewProduction 与实际产出一致 _Validates: 21.2, 21.3_

### Property 31-34: Building_Page
31. open/close往返一致，currentPage不变 _Validates: 24.1, 24.3_
32. 建筑条目数=配置建筑种类数 _Validates: 24.4, 24.10_
33. 条目包含名称/费用/效果/数量 _Validates: 24.5_
34. showBuildingPage=true时startDrag后isDragging=false _Validates: 24.11_

### Property 35-38: 士兵系统（树形进阶）

*正确性属性是对系统行为的形式化描述，每个属性都是一个全称量化的命题，可通过属性测试自动验证。*

35. 配置完整性：*对任意*士兵类型，配置中包含 name、tier、stats（attack/defense/hp），Tier 1 兵种包含 recruitCost，Tier 2+ 兵种包含 promoteCost，promoteTo 中的每个目标兵种都存在于配置中
**Validates: Requirements 25.1, 25.2, 25.3**

36. 招募正确性：*对任意*资源状态，仅允许招募冒险者(adventurer)；资源充足→soldiers+1/type='adventurer'/stats=配置值/资源扣除=recruitCost；资源不足→状态不变；招募非冒险者→拒绝
**Validates: Requirements 26.1, 26.2, 26.3, 26.5**

37. 进阶正确性：*对任意*士兵和目标兵种，若目标在 promoteTo 列表中且资源充足→士兵 type 变为目标兵种/stats 更新为目标配置/资源扣除=promoteCost；若资源不足→状态不变；若目标不在 promoteTo 中→拒绝
**Validates: Requirements 27.1, 27.2, 27.3, 27.4, 27.5, 27.7**

38. 士兵存档往返一致：*对任意*士兵列表，save 后 load 应产生等价的士兵数据（type、attack、defense、hp 均一致）；缺失或损坏的存档数据应初始化为空列表
**Validates: Requirements 28.1, 28.2, 28.3, 28.4**

### Property 39-44: Training_Page（训练界面）

39. Training_Page 拖拽锁定：*对任意*状态，showTrainingPage=true 时调用 startDrag 后 isDragging 应为 false
**Validates: Requirements 29.3**

40. 士兵条目数量一致：*对任意*士兵列表，Training_Page 渲染的 Soldier_Entry 数量应等于 soldierManager.getSoldiers().length
**Validates: Requirements 30.4**

41. 士兵条目信息完整：*对任意*士兵，Soldier_Entry 应包含该士兵配置中的名称、阶级(Tier)、攻击力(attack)、防御力(defense)、生命值(hp)
**Validates: Requirements 32.1, 32.2**

42. 进阶按钮可见性：*对任意*士兵，进阶按钮的显示与否应等于该士兵类型配置中 promoteTo 列表是否非空（非空→显示，空→不显示）
**Validates: Requirements 32.3, 32.4**

43. 进阶弹窗目标完整性：*对任意*士兵（promoteTo 非空），Promote_Dialog 应列出 promoteTo 中所有目标兵种，每个目标包含名称、阶级、属性（attack/defense/hp）、进阶费用
**Validates: Requirements 33.2, 33.3**

44. 进阶弹窗模态性：*对任意*状态，promoteDialogOpen=true 时，招募、滚动、返回操作应被阻止
**Validates: Requirements 33.9**

## 错误处理

- localStorage 缺失/损坏/字段缺失→默认值，存储满捕获异常
- 点击超出无操作，拖拽<5px视为点击
- 页面边界钳制，动画中忽略拖拽
- Baker wheat不足按floor处理，资源不足拒绝建造/分配
- 配置未加载用空默认，Toast配置缺失用默认值
- 士兵招募非冒险者类型→拒绝，返回 false
- 士兵招募资源不足→拒绝，返回 false
- 士兵进阶目标不在 promoteTo 列表中→拒绝，返回 false
- 士兵进阶资源不足→拒绝，返回 false
- 士兵进阶目标兵种配置不存在→拒绝，返回 false
- 士兵存档缺失/损坏→初始化为空数组
- 士兵配置未加载→soldiers 配置为空对象，招募/进阶均不可用
- Training_Page 士兵列表为空→不渲染条目，仅显示招募按钮
- Promote_Dialog 目标兵种配置不存在→跳过该目标不显示
- promoteDialogSoldierIndex 越界→关闭弹窗

## 测试策略

fast-check 属性测试（≥100次）+ 单元测试
测试文件：`tests/outside-castle.property.test.js` 和 `tests/outside-castle.unit.test.js`
核心逻辑在 `outside-logic.js`，测试通过 require 导入
士兵配置在 `soldier-config.js`，SoldierManager 在 `outside-logic.js` 中实现
Training_Page 相关的 PageManager 状态管理（openTrainingPage/closeTrainingPage/openPromoteDialog/closePromoteDialog）在 `outside-logic.js` 中实现
