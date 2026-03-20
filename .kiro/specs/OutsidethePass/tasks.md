# 实施计划：关外经营系统（OutsidethePass）

## Tasks

- [x] 1. 创建外置配置和核心逻辑模块（outside-config.js, outside-logic.js: ResourceManager/ButtonManager/SaveSystem）
- [x] 2. 实现 PageManager 核心逻辑（状态/拖拽/动画/边界）
- [x] 3. 实现工匠与工作岗位核心逻辑（job-config.js, CraftsmanManager/JobManager/BuildingManager）
- [x] 4. 实现 Canvas 渲染和双页面界面（CanvasRenderer/InputHandler/index.html）
- [x] 10. 扩展 CanvasRenderer 渲染新内容（wheat/bread显示、工匠状态/岗位列表/建造按钮）
- [x] 11. 扩展 InputHandler 和 index.html 集成新模块
- [x] 13. 实现 ToastManager 核心逻辑
- [x] 14. 集成 ToastManager 到游戏循环
- [x] 18. 实现 Production Tick 倒计时和产出预览（getRemainingSeconds/previewProduction/drawProductionCountdown/drawProductionPreview）
- [x] 20. 实现滚动视图和仓库显示（ScrollView/Warehouse/布局优化/滚轮+触摸滚动）
- [x] 22. 实现建筑界面（Building_Page: PageManager状态/drawBuildingPage/render拦截/Build_Button改文字/InputHandler交互/index.html集成）

- [x] 22. 实施完毕检查点
  - 以上所有原有功能实现任务已完成

- [x] 23. 创建士兵配置文件 soldier-config.js（需重写为树形进阶体系）
  - 已创建旧版配置，需要重写为新的树形进阶配置格式
  - _Requirements: 25.1, 25.2, 25.4_

- [-] 24. 重写 SoldierManager 核心逻辑（树形进阶体系）
  - [x] 24.1 旧版 SoldierManager 已实现（需重写）
    - 需要移除 upgrade 逻辑，重写 recruit 为仅招募冒险者，新增通用 promote 逻辑
    - _Requirements: 25.3, 26.1, 26.2, 26.3, 26.5, 27.1, 27.2, 27.3, 27.4, 27.5, 27.7_

  - [ ]* 24.2 编写士兵招募属性测试
    - **Property 36: 招募正确性**
    - *对任意*资源状态，仅允许招募冒险者；资源充足→soldiers+1/type='adventurer'/资源扣除；资源不足→状态不变
    - **Validates: Requirements 26.1, 26.2, 26.3, 26.5**

  - [ ]* 24.3 编写士兵进阶属性测试
    - **Property 37: 进阶正确性**
    - *对任意*士兵和目标兵种，目标在 promoteTo 中且资源充足→type/stats 更新/资源扣除；否则→状态不变
    - **Validates: Requirements 27.1, 27.2, 27.3, 27.4, 27.5, 27.7**

- [x] 25. 扩展 SaveSystem 支持士兵数据持久化（需适配新格式，去掉 level 字段）
  - [x] 25.1 SaveSystem.save/load 已支持 soldiers 参数
    - 需适配新格式：士兵不再有 level 字段，只有 type/attack/defense/hp
    - _Requirements: 28.1, 28.2, 28.3, 28.4_

  - [ ]* 25.2 编写士兵存档往返属性测试
    - **Property 38: 士兵存档往返一致**
    - *对任意*士兵列表，save 后 load 应产生等价数据（type/attack/defense/hp）；缺失/损坏→空列表
    - **Validates: Requirements 28.1, 28.2, 28.3, 28.4**

- [x] 26. 集成士兵系统到 index.html（需适配新接口）
  - 已集成，需适配：移除 upgrade 包装，确保 promote 包装正确
  - _Requirements: 25.3, 26.4, 27.6, 28.1_

- [x] 27. 重写 soldier-config.js 为树形进阶配置
  - 重写 SOLDIER_CONFIG_EXTERNAL 为新格式：每个兵种含 name/tier/stats/promoteTo/promoteCost（冒险者额外含 recruitCost）
  - 定义完整进阶树：冒险者→弓箭手/战士，弓箭手→弩手，战士→狂战士/骑士
  - 数值为占位值，后续调整
  - _Requirements: 25.1, 25.2_

- [-] 28. 重写 SoldierManager 为树形进阶逻辑
  - [x] 28.1 重写 recruit 为仅招募冒险者：recruit(resourceManager)，移除 typeId 参数
    - 移除 upgrade/canUpgrade 方法
    - 重写 promote(soldierIndex, targetTypeId, resourceManager)：检查 promoteTo 列表→检查 promoteCost→扣除→替换
    - 重写 canPromote(soldierIndex, targetTypeId, resourceManager)
    - 更新 canRecruit(resourceManager)：仅检查冒险者费用
    - _Requirements: 26.1, 26.2, 26.3, 27.1, 27.2, 27.3, 27.4, 27.5, 27.7_

  - [ ]* 28.2 编写招募属性测试（Property 36）
    - **Validates: Requirements 26.1, 26.2, 26.3, 26.5**

  - [ ]* 28.3 编写进阶属性测试（Property 37）
    - **Validates: Requirements 27.1, 27.2, 27.3, 27.4, 27.5, 27.7**

- [x] 29. 适配 SaveSystem 和 index.html 集成
  - 修改 SaveSystem.save/load 去掉 level 字段，只序列化 type/attack/defense/hp
  - 修改 index.html：移除 SoldierManager.upgrade 包装，添加 SoldierManager.promote 包装
  - 修改 recruit 调用方式（不再传 typeId）
  - _Requirements: 28.1, 28.2, 27.6_

- [ ] 30. 检查点 - 确保树形进阶系统功能正确
  - 确保所有测试通过，有问题请询问用户。

- [x] 31. 扩展 PageManager 支持 Training_Page 和 Promote_Dialog 状态
  - [x] 31.1 新增 PageManager 状态字段和方法
    - 新增 showTrainingPage/trainingScrollOffset/promoteDialogOpen/promoteDialogSoldierIndex 字段
    - 实现 openTrainingPage/closeTrainingPage/handleTrainingScroll/openPromoteDialog/closePromoteDialog 方法
    - openTrainingPage: showTrainingPage=true, trainingScrollOffset=0, promoteDialogOpen=false
    - closeTrainingPage: showTrainingPage=false, promoteDialogOpen=false
    - openPromoteDialog: promoteDialogOpen=true, promoteDialogSoldierIndex=index
    - closePromoteDialog: promoteDialogOpen=false, promoteDialogSoldierIndex=-1
    - handleTrainingScroll: 同 handleBuildingScroll 逻辑
    - 修改 startDrag: showTrainingPage=true 时直接 return（同 showBuildingPage 逻辑）
    - _Requirements: 29.2, 29.3, 30.2, 33.1, 33.8_

  - [ ]* 31.2 编写 Training_Page 拖拽锁定属性测试
    - **Property 39: Training_Page 拖拽锁定**
    - *对任意*状态，showTrainingPage=true 时 startDrag 后 isDragging=false
    - **Validates: Requirements 29.3**

- [x] 32. 实现 Castle_Page 训练按钮（Train_Button）
  - [x] 32.1 在 drawCastlePage 中添加训练按钮渲染
    - Train_Button 位于 Build_Button 下方（y = startY + btnSpacing * 2）
    - 使用与 Build_Button 相同的尺寸和样式，文字为"训练"
    - 存储按钮位置供 InputHandler 使用
    - _Requirements: 29.1_

  - [x] 32.2 在 InputHandler 中添加 Train_Button 点击处理
    - Castle_Page 点击检测中增加 Train_Button 区域判断
    - 点击后调用 pageManager.openTrainingPage()
    - _Requirements: 29.2_

- [x] 33. 实现 drawTrainingPage 渲染
  - [x] 33.1 实现 Training_Page 基础布局（标题、返回按钮、招募按钮）
    - 全屏深色背景（同 Building_Page 风格 #1a1a2e）
    - 标题"训练" + 返回按钮（同 Building_Page 布局）
    - 招募按钮：显示"招募冒险者" + 费用信息，canRecruit→绿色/灰色
    - 存储 _trainingBackBtn 和 _trainingRecruitBtn 位置
    - _Requirements: 30.1, 30.3, 31.2, 31.3_

  - [x] 33.2 实现士兵列表 ScrollView 渲染
    - 遍历 soldierManager.getSoldiers()，竖向排列 Soldier_Entry
    - 每个条目显示：名称（从配置获取）、Tier 标记、ATK/DEF/HP 属性
    - promoteTo 非空→显示"进阶"按钮，存储位置到 _trainingPromoteBtns[index]
    - promoteTo 为空→显示"满阶"标记，不显示进阶按钮
    - 滚动条（同 Building_Page 逻辑）
    - _Requirements: 30.4, 32.1, 32.2, 32.3, 32.4_

  - [ ]* 33.3 编写士兵条目信息完整性属性测试
    - **Property 41: 士兵条目信息完整**
    - *对任意*士兵，条目应包含名称、Tier、attack、defense、hp
    - **Validates: Requirements 32.1, 32.2**

  - [ ]* 33.4 编写进阶按钮可见性属性测试
    - **Property 42: 进阶按钮可见性**
    - *对任意*士兵，进阶按钮显示与否 = promoteTo 列表是否非空
    - **Validates: Requirements 32.3, 32.4**

- [x] 34. 实现 drawPromoteDialog 弹窗渲染
  - [x] 34.1 实现进阶弹窗渲染
    - 半透明遮罩覆盖全屏
    - 居中弹窗面板，标题为当前士兵名称 + "进阶"
    - 关闭按钮（右上角 X），存储位置到 _promoteDialogCloseBtn
    - 遍历 promoteTo 列表，每个目标显示：名称、Tier、ATK/DEF/HP、进阶费用
    - 费用：资源不足红色，充足白色
    - 进阶按钮：canPromote→高亮绿色，否则灰色
    - 存储按钮位置到 _promoteDialogTargetBtns[targetTypeId]
    - _Requirements: 33.1, 33.2, 33.3, 33.4, 33.5_

  - [ ]* 34.2 编写进阶弹窗目标完整性属性测试
    - **Property 43: 进阶弹窗目标完整性**
    - *对任意*士兵（promoteTo 非空），弹窗应列出所有目标兵种及完整信息
    - **Validates: Requirements 33.2, 33.3**

- [x] 35. 实现 Training_Page InputHandler 交互
  - [x] 35.1 扩展 InputHandler 支持 Training_Page 交互
    - onDown: showTrainingPage=true 且 promoteDialogOpen=false 时不启动拖拽
    - onMove: showTrainingPage=true 时支持滚动（同 Building_Page），promoteDialogOpen=true 时忽略
    - onUp 点击处理：
      - promoteDialogOpen=true: 检测关闭按钮→closePromoteDialog，检测进阶按钮→promote+closePromoteDialog，其他忽略
      - promoteDialogOpen=false: 检测返回→closeTrainingPage，检测招募→recruit，检测士兵进阶按钮→openPromoteDialog
    - wheel: showTrainingPage=true 且 promoteDialogOpen=false → handleTrainingScroll
    - _Requirements: 29.3, 30.2, 30.5, 31.1, 33.1, 33.6, 33.8, 33.9_

  - [ ]* 35.2 编写进阶弹窗模态性属性测试
    - **Property 44: 进阶弹窗模态性**
    - *对任意*状态，promoteDialogOpen=true 时招募/滚动/返回操作被阻止
    - **Validates: Requirements 33.9**

- [x] 36. 集成 Training_Page 到 CanvasRenderer.render 和 index.html
  - [x] 36.1 修改 CanvasRenderer.render 拦截逻辑
    - 在 showBuildingPage 检查之后增加 showTrainingPage 检查
    - showTrainingPage=true → 调用 drawTrainingPage，若 promoteDialogOpen=true 再调用 drawPromoteDialog
    - render 方法签名增加 soldierManager 参数
    - _Requirements: 30.6_

  - [x] 36.2 修改 index.html 集成
    - 游戏循环 render 调用传入 soldierManager
    - recruit 包装函数中增加 Toast 触发（已有逻辑复用）
    - promote 包装函数中增加 Toast 触发（已有逻辑复用）
    - InputHandler.init 传入 soldierManager 参数
    - _Requirements: 31.4, 33.7_

- [ ] 37. 检查点 - 确保训练界面功能正确
  - 确保所有测试通过，有问题请询问用户。

## Notes

- 核心逻辑在 outside-logic.js，配置在 outside-config.js / job-config.js / resource-config.js / soldier-config.js
- 任务 1-22 为原有功能，已全部完成
- 任务 23-26 为旧版士兵系统（已实现，需重写适配树形进阶）
- 任务 27-30 为树形进阶体系重写
- 任务 31-37 为训练界面（Training_Page）新增功能
- 士兵系统不再有"升级"概念，兵种的 tier 就是等级，通过进阶获得高阶兵种
- 只能招募冒险者（Tier 1），其他兵种通过 promote 获得
- 进阶树：冒险者→弓箭手/战士，弓箭手→弩手，战士→狂战士/骑士
- Training_Page 遵循 Building_Page 相同的全屏覆盖模式（PageManager 状态控制）
- Promote_Dialog 为模态弹窗，打开时阻止 Training_Page 其他交互
- 标记 `*` 的子任务为可选属性测试，可跳过以加速 MVP
- 每个属性测试对应设计文档中的正确性属性编号
