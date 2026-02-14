# 实施计划：关外经营系统（OutsidethePass）

## Tasks

- [x] 1. 创建外置配置和核心逻辑模块
  - [x] 1.1 创建 `outside-config.js`（OUTSIDE_CONFIG_EXTERNAL：冷却、产出、Canvas、页面切换配置）_Req: 1.3, 2.4, 6.7, 6.8_
  - [x] 1.2 创建 `outside-logic.js`（randomInt + ResourceManager：5种资源，add/hasEnough/deduct/getResources）_Req: 1.1, 2.1, 2.2, 8.1_
  - [x] 1.3 ButtonManager（isInCooldown/getRemainingCooldown/handleClick/isPointInButton）_Req: 1.1, 1.3, 1.5, 2.1, 2.4, 2.6, 5.3_
  - [x] 1.4 SaveSystem（save/load，处理异常和旧存档兼容）_Req: 4.1-4.3, 8.4-8.6, 9.6-9.7, 13.1-13.2_

- [x] 2. 实现 PageManager 核心逻辑
  - [x] 2.1 PageManager 状态和 getTargetOffset/shouldSwitchPage _Req: 6.1, 6.7, 6.8_
  - [x] 2.2 startDrag/updateDrag/endDrag（含边界限制）_Req: 6.4-6.6, 6.10-6.11_
  - [x] 2.3 updateAnimation（easeOut 缓动，动画中禁止拖拽）_Req: 6.7-6.9_

- [x] 3. 实现工匠与工作岗位核心逻辑
  - [x] 3.1 创建 `job-config.js`（JOB_CONFIG_EXTERNAL：farmer/baker/dormitory）_Req: 7.1-7.3_
  - [x] 3.2 CraftsmanManager（totalCapacity/getAssigned/getAvailable/addCapacity/canAssign）_Req: 9.1-9.2_
  - [x] 3.3 JobManager（init/assign/unassign/update/calculateProduction，Baker wheat不足处理）_Req: 10.1-10.4, 7.4_
  - [x] 3.4 BuildingManager（init/canBuild/build/getBuildCounts）_Req: 11.2-11.5_

- [x] 4. 实现 Canvas 渲染和双页面界面
  - [x] 4.1 CanvasRenderer（init/render/drawCastlePage/drawKingdomPage/drawPageTitle/drawButton/drawResources/drawCooldown）_Req: 5.1-5.2, 5.4, 6.2-6.3_
  - [x] 4.2 InputHandler（mouse/touch事件，区分拖拽和点击，按当前页面响应）_Req: 5.3, 6.4-6.6_
  - [x] 4.3 创建 `index.html`（Canvas + 引入配置/逻辑 + initGame/gameLoop + 存档集成）_Req: 1.1-1.3, 2.1, 2.3-2.4, 3.1, 4.1-4.2, 5.1-5.2, 6.1_

- [ ] 5. 设置测试环境
  - [ ] 5.1 npm init + 安装 vitest/fast-check + 配置 test 脚本

- [ ] 6. 编写核心逻辑属性测试
  - [ ]* 6.1 Property 1: 炼金按钮产出正确性 _Validates: 1.1, 1.5_
  - [ ]* 6.2 Property 2: 收集按钮产出范围正确性 _Validates: 2.1, 2.2, 2.6_
  - [ ]* 6.3 Property 3: 冷却时间计算正确性 _Validates: 1.3, 1.4, 2.4, 2.5_
  - [ ]* 6.4 Property 5: 存档读写往返一致性 _Validates: 4.1, 4.2_
  - [ ]* 6.5 Property 6: 点击命中检测正确性 _Validates: 5.3_
  - [ ]* 6.6 单元测试：localStorage 异常处理 + 冷却到期边界 _Req: 4.3_

- [ ] 7. 编写 PageManager 属性测试
  - [ ]* 7.1 Property 9: 页面切换阈值判断正确性 _Validates: 6.7, 6.8_
  - [ ]* 7.2 Property 10: 动画期间拖拽锁定 _Validates: 6.9_
  - [ ]* 7.3 Property 11: 页面偏移量边界约束 _Validates: 6.10, 6.11_
  - [ ]* 7.4 Property 8: 拖拽跟随正确性 _Validates: 6.6_
  - [ ]* 7.5 Property 7: 页面切换往返一致性 _Validates: 6.4, 6.5_

- [ ] 8. 编写工匠与岗位属性测试
  - [ ]* 8.1 Property 12: 配置驱动初始化正确性 _Validates: 7.2, 7.3, 7.4_
  - [ ]* 8.2 Property 13: 扩展存档往返一致性 _Validates: 8.4, 8.5, 9.6, 9.7, 13.2_
  - [ ]* 8.3 Property 14: 工匠不变量 _Validates: 9.1, 9.3, 9.4, 12.3, 12.4_
  - [ ]* 8.4 Property 15: 工匠分配拒绝 _Validates: 9.5_
  - [ ]* 8.5 Property 16: 产出时机正确性 _Validates: 10.1_
  - [ ]* 8.6 Property 17: Farmer 产出正确性 _Validates: 10.2_
  - [ ]* 8.7 Property 18: Baker 产出正确性 _Validates: 10.3, 10.4_
  - [ ]* 8.8 Property 19: 建造正确性 _Validates: 11.3, 11.4, 11.5_
  - [ ]* 8.9 单元测试：工匠与岗位边界情况 _Req: 8.6, 10.4, 11.5, 12.5, 12.6, 13.1_

- [ ] 9. Checkpoint - 核心逻辑与属性测试验证

- [x] 10. 扩展 CanvasRenderer 渲染新内容
  - [x] 10.1 drawResources 显示 wheat/bread _Req: 8.2, 8.3_
  - [x] 10.2 drawCastlePage 渲染工匠状态/岗位列表/建造按钮 _Req: 11.1, 11.6, 12.1-12.2, 12.5-12.6_
  - [ ]* 10.3 Property 4: 资源显示一致性 _Validates: 1.2, 2.3, 3.1, 3.2_
  - [ ]* 10.4 Property 20: 资源显示包含新资源 _Validates: 8.2, 8.3_

- [x] 11. 扩展 InputHandler 和 index.html 集成新模块
  - [x] 11.1 InputHandler 处理 Build_Button/Job +/- 按钮点击 _Req: 11.2, 12.3, 12.4_
  - [x] 11.2 index.html 集成新模块（job-config引入/初始化/存档恢复/gameLoop/自动存档）_Req: 7.2-7.3, 10.1, 10.5, 8.4, 9.6-9.7_

- [ ] 12. Final Checkpoint - 全系统验证

- [x] 13. 实现 ToastManager 核心逻辑
  - [x] 13.1 outside-config.js 添加 toast 配置 _Req: 19.1_
  - [x] 13.2 outside-logic.js 实现 RESOURCE_NAMES + ToastManager（getConfig/addToast/addResourceToasts/update/render）_Req: 14-17, 19_

- [x] 14. 集成 ToastManager 到游戏循环
  - [x] 14.1 index.html 包装 ResourceManager.add*/deduct + JobManager.update 触发 Toast，gameLoop 集成 _Req: 14.1, 15.1, 17.1, 18.1-18.4_

- [ ] 15. Checkpoint - Toast 系统验证

- [ ] 16. 编写 Toast 属性测试和单元测试
  - [ ]* 16.1 Property 21: 资源变化触发 Toast 创建 _Validates: 14.1, 14.3, 15.1, 15.3_
  - [ ]* 16.2 Property 22: Toast 文字格式与颜色正确性 _Validates: 14.2, 15.2_
  - [ ]* 16.3 Property 23: Toast 初始位置正确性 _Validates: 16.1_
  - [ ]* 16.4 Property 24: Toast 堆叠排列正确性 _Validates: 16.2, 16.3_
  - [ ]* 16.5 Property 25: Toast 下降位移正确性 _Validates: 17.1_
  - [ ]* 16.6 Property 26: Toast 透明度生命周期正确性 _Validates: 17.2, 17.4_
  - [ ]* 16.7 Property 27: Toast 过期移除 _Validates: 17.3_
  - [ ]* 16.8 Property 28: Toast 配置驱动 _Validates: 19.1_
  - [ ]* 16.9 单元测试：Toast 边界情况 _Req: 14.2, 15.2, 17.1-17.3, 19.2_

- [ ] 17. Final Checkpoint - 全系统验证（含 Toast）

- [x] 18. 实现 Production Tick 倒计时和产出预览
  - [x] 18.1 在 JobManager 中添加 getRemainingSeconds(now) 方法
    - lastTickTime=0 时返回完整周期秒数
    - 正常情况返回 Math.ceil((interval - elapsed) / 1000)
    - remaining <= 0 时返回完整周期秒数
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_
  - [x] 18.2 在 JobManager 中添加 previewProduction(resourceManager) 方法
    - 遍历所有有工匠的岗位，模拟一次 tick 的资源变化
    - Baker wheat 限制与 calculateProduction 逻辑一致
    - 累计 changes 确保多岗位间资源依赖正确
    - 无工匠分配时返回空对象
    - _Requirements: 21.2, 21.3, 21.7_
  - [x] 18.3 在 CanvasRenderer 中添加 drawProductionCountdown(jobManager, now, offsetX) 方法
    - 在工匠状态下方显示「下次产出: Ns」
    - 淡蓝色(#aaaaff)
    - _Requirements: 20.1, 20.4_
  - [x] 18.4 在 CanvasRenderer 中添加 drawProductionPreview(jobManager, resourceManager, offsetX) 方法
    - 在岗位列表下方显示资源变化预览
    - 正数绿色(#00ff00)「+N 资源名」，负数红色(#ff4444)「-N 资源名」
    - 零值不显示，无变化时不渲染
    - _Requirements: 21.1, 21.4, 21.5, 21.6, 21.7_
  - [x] 18.5 在 drawKingdomPage 中集成 drawProductionCountdown 和 drawProductionPreview 调用
    - 在 drawCraftsmanStatus 之后调用 drawProductionCountdown
    - 在 drawJobList 之后调用 drawProductionPreview
    - _Requirements: 20.1, 21.1, 21.8_
  - [ ]* 18.6 Property 29: 倒计时计算精度
    - **Property 29: 倒计时计算精度**
    - *For any* 有效的 now 和 lastTickTime，getRemainingSeconds 返回 Math.ceil((interval - elapsed) / 1000)
    - **Validates: Requirements 20.4**
  - [ ]* 18.7 Property 30: 产出预览与实际产出一致性
    - **Property 30: 产出预览与实际产出一致性**
    - *For any* 岗位分配和资源状态，previewProduction 的结果与实际执行一次产出的资源变化一致
    - **Validates: Requirements 21.2, 21.3**
  - [ ]* 18.8 单元测试：倒计时和产出预览边界情况
    - lastTickTime=0 时倒计时返回完整周期
    - 无工匠分配时 previewProduction 返回空对象
    - Baker wheat=0 时 previewProduction 正确处理
    - _Requirements: 20.2, 21.3, 21.7_

- [ ] 19. Checkpoint - 倒计时和产出预览验证
  - 确保所有测试通过，如有问题请告知。

## Notes

- `*` 标记为可选测试任务
- 核心逻辑在 outside-logic.js，测试通过 require 导入
- 属性测试用 fast-check，≥100 次迭代
- 测试文件在 tests/ 目录
- Task 1-4, 10-11, 13-14 已完成
- Toast 集成通过 index.html 方法包装实现
- JobManager.update 前后对比资源差异触发 Toast
- Task 18 为新增的倒计时和产出预览功能


- [x] 20. 实现滚动视图和仓库显示
  - [x] 20.1 PageManager 添加 castleScrollOffset 和 kingdomScrollOffset 状态，初始化为 0 _Req: 22.2, 23.2_
  - [x] 20.2 PageManager 添加 handleScroll(page, delta) 方法，更新对应页面的 scrollOffset _Req: 22.4, 23.3_
  - [x] 20.3 CanvasRenderer 添加 drawWarehouse(resources, scrollOffset, offsetX) 方法 _Req: 22.1, 22.2_
    - 绘制"仓库"标题
    - 定义滚动区域（x, y, width, height）
    - 根据 scrollOffset 裁剪并绘制资源列表
    - 绘制滚动条
  - [x] 20.4 CanvasRenderer 添加 drawJobScrollView(jobManager, craftsmanManager, scrollOffset, offsetX) 方法 _Req: 23.2_
    - 定义滚动区域
    - 根据 scrollOffset 裁剪并绘制工匠状态、岗位列表、产出倒计时、产出预览
    - 绘制滚动条
  - [x] 20.5 修改 drawCastlePage，调整布局避免重叠，集成 drawWarehouse _Req: 22.3_
    - 炼金按钮位置：左上角
    - 建造按钮位置：炼金按钮右侧
    - 仓库区域：按钮下方，占据大部分空间
  - [x] 20.6 修改 drawKingdomPage，移除资源显示，集成 drawJobScrollView _Req: 23.1, 23.5_
    - 收集按钮位置：左上角
    - 滚动区域：按钮下方，占据大部分空间
  - [x] 20.7 InputHandler 添加鼠标滚轮事件处理 _Req: 22.4, 23.3_
    - 监听 wheel 事件
    - 根据当前页面调用 PageManager.handleScroll
    - 阻止默认滚动行为
  - [x] 20.8 InputHandler 添加触摸拖拽滚动支持 _Req: 22.4, 23.3_
    - 区分页面拖拽和滚动区域拖拽
    - 滚动区域内的垂直拖拽触发滚动
    - 水平拖拽仍触发页面切换

- [ ] 21. Checkpoint - UI 优化验证
  - 手动测试地下城堡界面：仓库显示完整、滚动流畅、按钮不重叠
  - 手动测试地下王国界面：岗位列表滚动流畅、无仓库显示
