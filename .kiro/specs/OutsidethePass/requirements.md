# 需求文档

## 简介

关外经营系统是 Underground Castle 的地上经营部分。包含两个全屏界面（地下城堡/地下王国），通过拖拽切换。玩家点击按钮产生资源，分配工匠到岗位自动产出，建造宿舍扩容。资源变化时显示浮动 Toast 提示。

## 术语表

| 术语 | 说明 |
|------|------|
| Toast_Manager | 资源变化浮动提示管理器 |
| Toast | 单条浮动提示（文字、位置、透明度） |
| Outside_Castle | 关外经营系统 |
| Alchemy_Button | 炼金按钮，点击产金币 |
| Collect_Button | 收集按钮，点击产石头和木头 |
| Gold/Stone/Wood/Wheat/Bread | 五种资源 |
| Cooldown | 按钮点击后的冷却时间 |
| Resource_Display | 资源显示区域 |
| Save_System | localStorage 存档系统 |
| Canvas_Renderer | 2D Canvas 渲染器 |
| Page_Manager | 双页面管理器（拖拽切换） |
| Castle_Page | 地下城堡界面（含炼金按钮） |
| Kingdom_Page | 地下王国界面（含收集按钮） |
| Swipe_Gesture | 水平拖拽手势 |
| Page_Offset | 页面水平偏移量 |
| Craftsman | 工匠，可分配到岗位的劳动力 |
| Job | 工作岗位，每15秒消耗/产出资源 |
| Farmer | 农夫岗位，每工匠产2小麦/周期 |
| Baker | 面包工岗位，每工匠消耗2小麦产1面包/周期 |
| Building/Dormitory | 建筑/宿舍（增加工匠容量） |
| Job_Config | 岗位和建筑的外置JS配置 |
| CraftsmanManager | 工匠管理器 |
| JobManager | 岗位管理器 |
| BuildingManager | 建筑管理器 |
| Production_Tick | 15秒产出周期 |
| Production_Countdown | 距离下次 Production_Tick 的剩余秒数显示 |
| Production_Preview | 下次 Production_Tick 资源变化量的预览显示 |
| Build_Button | 建造按钮（炼金按钮下方） |
| Warehouse | 仓库，显示所有资源的总和 |
| ScrollView | 滚动视图，用于显示超出屏幕的内容列表 |

## 需求

### 需求 1：炼金产金
**用户故事：** 点击炼金按钮产生金币。
#### 验收标准
1. 点击非冷却中的 Alchemy_Button → Gold +1
2. Gold 变化后 Resource_Display 立即更新
3. 成功点击后进入 5 秒 Cooldown
4. Cooldown 中显示剩余时间
5. Cooldown 中忽略点击

### 需求 2：收集资源
**用户故事：** 点击收集按钮获取石头和木头。
#### 验收标准
1. 点击非冷却中的 Collect_Button → Stone +[3,6]
2. 同时 Wood +[3,6]
3. 资源变化后 Resource_Display 立即更新
4. 成功点击后进入 10 秒 Cooldown
5. Cooldown 中显示剩余时间
6. Cooldown 中忽略点击

### 需求 3：资源显示
#### 验收标准
1. 始终显示 Gold、Stone、Wood 总量
2. 资源变化同帧反映

### 需求 4：自动存档
#### 验收标准
1. 资源变化时持久化到 localStorage
2. 加载时从 localStorage 恢复
3. 数据缺失/损坏时初始化为零

### 需求 5：Canvas 渲染
#### 验收标准
1. 在 2D Canvas 上渲染按钮
2. 渲染资源显示
3. 检测点击并触发按钮动作
4. Cooldown 中按钮显示可区分状态和剩余时间

### 需求 6：双界面滑动切换
#### 验收标准
1. 管理 Castle_Page（默认）和 Kingdom_Page
2. Castle_Page 顶部标题"地下城堡"，含 Alchemy_Button
3. Kingdom_Page 顶部标题"地下王国"，含 Collect_Button
4. Castle_Page 向左拖拽 → 切换到 Kingdom_Page
5. Kingdom_Page 向右拖拽 → 切换回 Castle_Page
6. 拖拽中实时跟随手指/鼠标
7. 释放时拖拽距离 > 30% Canvas 宽度 → 完成切换
8. 释放时拖拽距离 < 30% → 回弹
9. 动画中禁止新拖拽
10. Castle_Page 不允许向右拖拽（超出左边界）
11. Kingdom_Page 不允许向左拖拽（超出右边界）

### 需求 7：工作岗位与建筑配置外置
#### 验收标准
1. job-config.js 定义所有岗位和建筑配置
2. 加载时读取岗位定义（名称、消耗、产出）
3. 加载时读取建筑定义（名称、消耗、效果）
4. 新增岗位定义时自动支持，无需改核心代码

### 需求 8：新增资源类型（Wheat/Bread）
#### 验收标准
1. ResourceManager 管理 Wheat 和 Bread，初始 0
2. Resource_Display 显示 Wheat 和 Bread
3. 变化同帧反映
4. 持久化到 localStorage
5. 加载时恢复
6. 缺失字段初始化为 0

### 需求 9：工匠管理
#### 验收标准
1. 跟踪 totalCapacity、assigned、available（= total - assigned）
2. 无存档时 totalCapacity 初始化为 0
3. 分配工匠：assigned +1，available -1
4. 移除工匠：assigned -1，available +1
5. available=0 时拒绝分配
6. 持久化工匠容量和岗位分配
7. 加载时恢复

### 需求 10：工作岗位资源产出
#### 验收标准
1. 每 15 秒 Production_Tick 对有工匠的岗位执行产出
2. Farmer：每工匠 +2 Wheat
3. Baker：每工匠 -2 Wheat +1 Bread
4. Baker Wheat 不足时仅处理够的数量
5. 产出后 Resource_Display 立即更新

### 需求 11：建造宿舍
#### 验收标准
1. Build_Button 在 Castle_Page 炼金按钮下方
2. 点击显示可建造列表
3. 资源足够时扣除资源并增加工匠容量
4. 资源不足时拒绝
5. 建造成功后立即更新工匠容量
6. Canvas 渲染 Build_Button

### 需求 12：工匠分配界面
#### 验收标准
1. 显示工匠状态（总容量/已分配/可用）
2. 显示每个 Job 名称、分配数、+/- 按钮
3. 点击 + 分配工匠
4. 点击 - 移除工匠
5. 分配数=0 时 - 按钮不可用
6. 可用=0 时所有 + 按钮不可用

### 需求 13：存档兼容性
#### 验收标准
1. 旧存档缺失新字段时初始化为默认值
2. 新存档正确恢复所有数据

### 需求 14：资源增加提示
#### 验收标准
1. 资源增加时创建 Toast
2. 绿色文字「+数量 资源名」
3. 多种资源分别创建独立 Toast

### 需求 15：资源消耗提示
#### 验收标准
1. 资源减少时创建 Toast
2. 红色文字「-数量 资源名」
3. 多种资源分别创建独立 Toast

### 需求 16：Toast 显示位置与排列
#### 验收标准
1. 新 Toast 出现在 Canvas 水平居中、垂直居中
2. 多条 Toast 向下排列，固定间距，不重叠
3. 新 Toast 排在最后一条活跃 Toast 下方

### 需求 17：Toast 下降与淡出动画
#### 验收标准
1. Toast 以固定速度向下移动
2. 同时逐渐降低透明度
3. 透明度为零时从活跃列表移除
4. 在配置的生命周期内完成

### 需求 18：Toast 与游戏循环集成
#### 验收标准
1. 每帧更新所有活跃 Toast 位置和透明度
2. 每帧渲染所有活跃 Toast
3. Toast 绘制在最顶层
4. Toast 独立于页面切换，任何页面可显示

### 需求 19：Toast 可配置性
#### 验收标准
1. 从外部配置读取：下降速度、生命周期、字体大小、间距
2. 配置缺失时使用默认值

### 需求 20：Production Tick 倒计时显示
**用户故事：** 作为玩家，我想在地下王国界面看到距离下次产出周期还剩多少秒，以便掌握资源产出节奏。
#### 验收标准
1. WHILE Kingdom_Page 处于显示状态，THE Canvas_Renderer SHALL 在工匠状态区域显示距离下次 Production_Tick 的剩余秒数
2. WHEN JobManager 的 lastTickTime 为 0（首次启动尚未产出），THE Canvas_Renderer SHALL 显示完整的产出周期秒数作为倒计时
3. WHEN Production_Tick 刚刚触发（剩余时间重置），THE 倒计时显示 SHALL 立即重置为完整周期秒数
4. THE 倒计时显示 SHALL 每帧更新，精度为整数秒（向上取整）
5. WHEN 没有任何工匠被分配到岗位时，THE Canvas_Renderer SHALL 仍然显示倒计时（产出周期持续运行）

### 需求 21：产出预览显示
**用户故事：** 作为玩家，我想在地下王国界面看到当前工匠分配下，下次产出周期会产出和消耗多少资源，以便做出更好的分配决策。
#### 验收标准
1. WHILE Kingdom_Page 处于显示状态，THE Canvas_Renderer SHALL 在岗位列表下方显示下次 Production_Tick 的资源变化预览
2. THE JobManager SHALL 提供 previewProduction 方法，根据当前岗位分配和当前资源状态，预计算下次 tick 的资源变化量
3. WHEN 预览计算 Baker 产出时，THE previewProduction SHALL 考虑当前 Wheat 库存限制（与实际产出逻辑一致，使用 floor(wheat/2) 计算实际可工作的 Baker 数量）
4. WHEN 资源变化量为正数时，THE Canvas_Renderer SHALL 以绿色显示「+数量 资源名」
5. WHEN 资源变化量为负数时，THE Canvas_Renderer SHALL 以红色显示「-数量 资源名」
6. WHEN 资源变化量为零时，THE Canvas_Renderer SHALL 不显示该资源
7. WHEN 没有任何工匠被分配到岗位时，THE Canvas_Renderer SHALL 不显示产出预览区域
8. THE 产出预览 SHALL 在工匠分配变化后立即更新（下一帧反映）


### 需求 22：地下城堡界面优化
**用户故事：** 作为玩家，我想在地下城堡界面清晰地看到仓库资源总览和操作按钮，避免UI重叠。
#### 验收标准
1. WHEN 进入 Castle_Page，THE Canvas_Renderer SHALL 显示"仓库"标题和资源总和
2. THE 仓库区域 SHALL 使用滚动视图显示所有资源（17种），避免超出屏幕
3. THE 炼金按钮和建造按钮 SHALL 布局合理，不与仓库区域重叠
4. THE 滚动视图 SHALL 支持鼠标滚轮和触摸拖拽滚动
5. THE 滚动视图 SHALL 显示滚动条指示当前位置

### 需求 23：地下王国界面优化
**用户故事：** 作为玩家，我想在地下王国界面清晰地看到所有工作岗位和操作按钮，不需要看到仓库。
#### 验收标准
1. WHEN 进入 Kingdom_Page，THE Canvas_Renderer SHALL NOT 显示仓库区域
2. THE 工匠状态、岗位列表、产出倒计时、产出预览 SHALL 使用滚动视图显示
3. THE 滚动视图 SHALL 支持鼠标滚轮和触摸拖拽滚动
4. THE 滚动视图 SHALL 显示滚动条指示当前位置
5. THE 收集按钮 SHALL 布局合理，不与滚动区域重叠
