# Implementation Plan: Local Save System

## Overview

将分散在 `outside-logic.js` 和 `index.html` 中的存档逻辑统一到 `SaveSystem` 中，提供完整的 `save()`/`load()` 接口，支持版本迁移（v1→v2）和防御性类型校验。测试文件为 `tests/save-system.test.js`，使用 Jest + fast-check。

## Tasks

- [x] 1. 增强 SaveSystem 核心接口（outside-logic.js）
  - [x] 1.1 添加 `CURRENT_VERSION` 常量和 `_getDefaults()` 方法
    - 在 `SaveSystem` 对象上添加 `CURRENT_VERSION: 2`
    - 实现 `_getDefaults()` 方法，从 `RESOURCE_CONFIG_EXTERNAL` 读取资源 key 生成默认值对象，包含 `craftsman: { totalCapacity: 0 }`、`jobs: {}`、`buildings: {}`、`soldiers: []`、`dungeon: null`、`version: 2`
    - _Requirements: 1.3, 8.1, 8.2_

  - [x] 1.2 实现 `_migrate(data)` 版本迁移方法
    - 检查 `data.version`：缺失或非 number 视为 v1
    - v1→v2 迁移：补全 `dungeon` 默认值（null）、为每个士兵补全 `speed` 字段（默认 10）、设置 `version: 2`
    - `version` 大于 `CURRENT_VERSION` 时不做降级，按原样返回
    - _Requirements: 8.2, 8.3, 8.4_

  - [x] 1.3 重写 `save()` 方法，统一序列化所有游戏状态
    - 序列化资源（从 `RESOURCE_CONFIG_EXTERNAL` 读取 key）、craftsman、jobs、buildings、soldiers（tier/attack/defense/hp/speed）
    - 追加 `dungeon` 字段：调用 `ProgressTracker.saveProgress()` 获取地牢进度
    - 写入 `version: CURRENT_VERSION`
    - 整体 `try/catch` 静默处理 `QuotaExceededError` 和 `localStorage` 不可用
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 9.4_

  - [x] 1.4 重写 `load()` 方法，统一反序列化并做防御性校验
    - `localStorage.getItem` 返回 null 时返回 `_getDefaults()`
    - `JSON.parse` 失败时返回 `_getDefaults()`
    - 调用 `_migrate(data)` 执行版本迁移
    - 对每个资源字段做 `typeof === 'number'` 校验，非法值回退 `RESOURCE_CONFIG_EXTERNAL[key].initial` 或 0
    - 校验 `craftsman`（对象且 `totalCapacity` 为 number）、`jobs`（对象且值为 number）、`buildings`（同 jobs）
    - 校验 `soldiers`（数组，每个元素需有 `tier: number`，缺少 `speed` 默认 10）
    - 校验 `dungeon`（对象，`unlockedLayers` 非数组或空数组回退 `[1]`，`completedLayers` 非数组回退 `[]`，`capturedFacilities` 非数组回退 `[]`）
    - 整体 `try/catch` 捕获异常返回默认值
    - _Requirements: 1.2, 1.3, 2.2, 2.3, 2.4, 3.2, 3.3, 3.4, 4.2, 4.3, 5.2, 5.3, 6.2, 6.3, 7.2, 7.3, 8.2, 8.3, 9.2, 9.3, 9.4_


- [x] 2. 移除 index.html 中的 dungeon 补丁 IIFE
  - [x] 2.1 删除 index.html 中扩展 SaveSystem 的 IIFE 代码块
    - 移除 `// 扩展 SaveSystem 支持地牢进度持久化（9.3）` 整个 IIFE（约 630-646 行）
    - 移除 `SceneManager._loadDungeonProgress` 和 `SceneManager._saveDungeonProgress` 中直接操作 localStorage 的逻辑，改为通过 `SaveSystem.load()` 和 `SaveSystem.save()` 获取/写入 dungeon 数据
    - 确保 `initGame()` 中的存档恢复逻辑使用 `load()` 返回的 `dungeon` 字段初始化 `ProgressTracker`
    - _Requirements: 7.1, 7.2, 3.1, 3.2_

- [ ] 3. Checkpoint — 手动验证存档功能
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. 创建测试基础设施和 fast-check 生成器（tests/save-system.test.js）
  - [x] 4.1 搭建测试文件和 localStorage mock
    - 创建 `tests/save-system.test.js`
    - 实现 `createMockStorage()` 内存 mock（getItem/setItem/removeItem/clear）
    - 在 `beforeEach` 中将 mock 注入为全局 `localStorage`，加载 `RESOURCE_CONFIG_EXTERNAL`、`JOB_CONFIG_EXTERNAL`、`FACILITY_CONFIG_EXTERNAL` 配置
    - 引入 `SaveSystem` 和 `ProgressTracker`（从 `outside-logic.js` 和 `inside-logic.js`）
    - _Requirements: 7.1, 7.2_

  - [x] 4.2 实现 fast-check 生成器（arbitraries）
    - `arbResources()`：17 种资源的随机非负整数对象
    - `arbCraftsman()`：`{ totalCapacity: fc.nat() }`
    - `arbJobs()`：从 `JOB_CONFIG_EXTERNAL.jobs` 读取 key，值为非负整数
    - `arbBuildings()`：从 `JOB_CONFIG_EXTERNAL.buildings` 读取 key，值为非负整数
    - `arbSoldier()`：`{ tier: 1-10, attack: nat, defense: nat, hp: nat, speed: nat }`
    - `arbSoldiers()`：0-20 个士兵数组
    - `arbDungeonProgress()`：含 unlockedLayers（含1的正整数数组）、completedLayers、layerProgress、capturedFacilities
    - `arbSaveData()`：组合以上所有生成器
    - `arbCorruptJson()`：生成损坏的 JSON 字符串
    - _Requirements: 7.3_

- [-] 5. 属性测试：round-trip 和版本迁移
  - [-]* 5.1 Property 1: Save/Load Round-Trip
    - **Property 1: Save/Load Round-Trip**
    - 对任意有效游戏状态，`save()` 后 `load()` 应产生等价对象
    - **Validates: Requirements 1.1, 1.2, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 5.3, 6.1, 6.2, 7.3**

  - [-]* 5.2 Property 5: Version Migration Produces Current Version
    - **Property 5: Version Migration Produces Current Version with Complete Fields**
    - 对任意 v1 存档（无 version、无 dungeon、士兵无 speed），`load()` 后 version 等于 CURRENT_VERSION，dungeon 为有效对象或 null，每个士兵有 numeric speed
    - **Validates: Requirements 8.2, 8.3, 8.4**

  - [ ]* 5.3 Property 6: Save Always Writes Current Version
    - **Property 6: Save Always Writes Current Version**
    - 对任意有效游戏状态，`save()` 后 localStorage 中的 JSON 包含 `version === CURRENT_VERSION`
    - **Validates: Requirements 8.1**

- [ ] 6. 属性测试：防御性校验和异常处理
  - [ ]* 6.1 Property 2: Missing Resource Fields Default to Config Initial
    - **Property 2: Missing Resource Fields Default to Config Initial**
    - 对任意资源子集被删除的 SaveData，`load()` 返回缺失 key 的 initial 值
    - **Validates: Requirements 1.3**

  - [ ]* 6.2 Property 3: Unknown Job IDs Are Ignored
    - **Property 3: Unknown Job IDs Are Ignored**
    - 对任意含未知岗位 ID 的 SaveData，`load()` 返回的 jobs 不含未知 key
    - **Validates: Requirements 2.4**

  - [ ]* 6.3 Property 7: Corrupt Data Returns Valid Typed Defaults
    - **Property 7: Corrupt Data Returns Valid Typed Defaults**
    - 对任意损坏的 JSON 字符串，`load()` 返回的对象中所有字段类型正确
    - **Validates: Requirements 9.2, 9.3**

  - [ ]* 6.4 Property 8: Storage Failure Never Throws
    - **Property 8: Storage Failure Never Throws**
    - 当 `localStorage.setItem` 抛异常时 `save()` 不抛出；当 `localStorage.getItem` 抛异常时 `load()` 不抛出并返回默认值
    - **Validates: Requirements 9.1, 9.4**

- [ ] 7. 属性测试：设施占领与岗位解锁
  - [ ]* 7.1 Property 4: Captured Facilities Unlock Correct Jobs
    - **Property 4: Captured Facilities Unlock Correct Jobs After Restore**
    - 对任意 capturedFacilities 集合，save/load 后 `ProgressTracker.getUnlockedJobs()` 返回正确的岗位列表
    - **Validates: Requirements 5.4**

- [ ] 8. 单元测试：边界情况
  - [ ]* 8.1 编写边界情况单元测试
    - localStorage 为空时 load 返回默认值
    - 空士兵数组的 save/load
    - 士兵缺少 speed 字段时默认为 10
    - dungeon 字段缺失时返回 null
    - dungeon.unlockedLayers 为空数组时补充 [1]
    - QuotaExceededError 时 save 静默处理
    - 非法 JSON 字符串时 load 返回默认值
    - version 字段缺失时视为 v1 并迁移
    - _Requirements: 1.3, 3.4, 6.3, 8.2, 9.1, 9.2_

- [ ] 9. Final checkpoint — 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 实现语言为 JavaScript，测试使用 Jest + fast-check
- 所有改动集中在 `outside-logic.js`（SaveSystem 增强）和 `index.html`（移除 IIFE 补丁）
- 测试文件为 `tests/save-system.test.js`
- 属性测试每个属性至少运行 100 次迭代
- 每个属性测试用注释标注对应的设计文档属性编号
