# 实施计划：关外经营系统（OutsidethePass）

## 概述

基于设计文档，将关外经营系统拆分为增量式编码任务。核心逻辑放在 `outside-logic.js` 中便于测试和复用，`index.html` 负责 Canvas 渲染和事件绑定，`outside-config.js` 提供外置配置。

## Tasks

- [x] 1. 创建外置配置和核心逻辑模块
  - [x] 1.1 创建 `outside-config.js`，定义 `OUTSIDE_CONFIG_EXTERNAL` 全局变量，包含炼金和收集的冷却时间、产出数量、Canvas 尺寸等配置
    - _Requirements: 1.3, 2.4_
  - [x] 1.2 创建 `outside-logic.js`，实现 `randomInt(min, max)` 工具函数和 `ResourceManager`（gold/stone/wood 属性，addGold/addStone/addWood/getResources 方法）
    - _Requirements: 1.1, 2.1, 2.2_
  - [x] 1.3 在 `outside-logic.js` 中实现 `ButtonManager`，包含 `isInCooldown(buttonName, now)`、`getRemainingCooldown(buttonName, now)`、`handleClick(x, y, now)` 和 `isPointInButton(x, y, button)` 方法
    - _Requirements: 1.1, 1.3, 1.5, 2.1, 2.4, 2.6, 5.3_
  - [x] 1.4 在 `outside-logic.js` 中实现 `SaveSystem`，包含 `save(resources)` 和 `load()` 方法，处理 localStorage 读写和异常情况
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 2. 设置测试环境并编写核心逻辑测试
  - [ ] 2.1 初始化 `package.json`，安装 vitest 和 fast-check 依赖，配置测试脚本
    - 运行 `npm init -y`，然后 `npm install --save-dev vitest fast-check`
    - 在 package.json 中添加 `"test": "vitest --run"` 脚本
  - [ ]* 2.2 写属性测试：炼金按钮产出正确性
    - **Property 1: 炼金按钮产出正确性**
    - 生成随机初始 gold 值和随机时间戳，验证非冷却状态下 gold +1，冷却状态下 gold 不变
    - **Validates: Requirements 1.1, 1.5**
  - [ ]* 2.3 写属性测试：收集按钮产出范围正确性
    - **Property 2: 收集按钮产出范围正确性**
    - 生成随机初始 stone/wood 值和随机时间戳，验证非冷却状态下增量在 [3,6]，冷却状态下不变
    - **Validates: Requirements 2.1, 2.2, 2.6**
  - [ ]* 2.4 写属性测试：冷却时间计算正确性
    - **Property 3: 冷却时间计算正确性**
    - 生成随机点击时间和查询时间，验证 isInCooldown 和 getRemainingCooldown 的返回值
    - **Validates: Requirements 1.3, 1.4, 2.4, 2.5**
  - [ ]* 2.5 写属性测试：存档读写往返一致性（Round Trip）
    - **Property 5: 存档读写往返一致性**
    - 生成随机合法资源状态，验证 save → load 往返一致
    - **Validates: Requirements 4.1, 4.2**
  - [ ]* 2.6 写属性测试：点击命中检测正确性
    - **Property 6: 点击命中检测正确性**
    - 生成随机矩形和随机点击坐标，验证 isPointInButton 的几何正确性
    - **Validates: Requirements 5.3**
  - [ ]* 2.7 写单元测试：localStorage 异常处理
    - 测试数据缺失返回默认值、数据损坏（非法 JSON）返回默认值、字段缺失时缺失字段默认为 0
    - 测试冷却恰好到期时按钮可再次点击
    - _Requirements: 4.3_

- [ ] 3. Checkpoint - 核心逻辑验证
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 4. 实现 Canvas 渲染和主页面
  - [x] 4.1 在 `outside-logic.js` 中实现 `CanvasRenderer`，包含 `init(canvas)`、`render(resourceManager, buttonManager, now)`、`drawButton(button, label, now)`、`drawResources(resources)` 和 `drawCooldown(button, now)` 方法
    - _Requirements: 5.1, 5.2, 5.4_
  - [x] 4.2 在 `outside-logic.js` 中实现 `InputHandler.init(canvas, buttonManager)`，绑定 Canvas 点击事件并转换坐标
    - _Requirements: 5.3_
  - [x] 4.3 创建 `index.html`，引入 `outside-config.js` 和 `outside-logic.js`，设置 Canvas 元素，实现 `loadConfigs()` 加载外置配置，实现 `gameLoop` 主循环，初始化所有模块并启动游戏
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.3, 2.4, 3.1, 4.2, 5.1, 5.2_
  - [ ]* 4.4 写属性测试：资源显示一致性
    - **Property 4: 资源显示一致性**
    - 生成随机资源状态，验证渲染输出包含所有资源数值
    - **Validates: Requirements 1.2, 2.3, 3.1, 3.2**

- [ ] 5. 集成与存档联动
  - [ ] 5.1 在 `index.html` 中将 ResourceManager 的 addGold/addStone/addWood 方法与 SaveSystem.save 联动，确保每次资源变化后自动触发存档
    - _Requirements: 4.1_
  - [ ] 5.2 在 `index.html` 初始化时调用 SaveSystem.load() 恢复资源状态到 ResourceManager
    - _Requirements: 4.2_

- [ ] 6. Final Checkpoint - 全部验证
  - 确保所有测试通过，在浏览器中打开 index.html 验证炼金和收集按钮功能正常、冷却倒计时显示正确、资源数值实时更新、刷新页面后资源恢复。如有问题请向用户确认。

## Notes

- 标记 `*` 的任务为可选测试任务，可跳过以加快 MVP 进度
- 核心逻辑在 `outside-logic.js` 中，便于 Node.js 环境下测试
- `index.html` 通过 `<script src>` 引入配置和逻辑文件
- 属性测试使用 fast-check 库，每个属性至少 100 次迭代
- 单元测试和属性测试文件放在 `tests/` 目录下
- 每个任务引用具体的需求编号以保证可追溯性
