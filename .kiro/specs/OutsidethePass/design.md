# 设计文档：关外经营系统（OutsidethePass）

## 概述

关外经营系统：两个全屏页面（地下城堡/地下王国）拖拽切换，炼金产金币，收集产石头木头，工匠分配到农夫/面包工岗位自动产出，建造宿舍扩容。资源变化时显示 Toast 浮动提示（绿色增加/红色消耗），缓慢下降淡出。地下王国界面显示产出倒计时和资源变化预览。单文件架构 + 配置外置 + 2D Canvas + localStorage。

## 架构

```
index.html          — 主文件，Canvas + 核心逻辑
outside-config.js   — 外置配置（冷却、产出、Canvas、页面切换、Toast）
outside-logic.js    — 核心逻辑模块
job-config.js       — 岗位和建筑外置配置
```

模块：Game Loop → PageManager / InputHandler / Canvas_Renderer / ResourceManager / JobManager / ToastManager
InputHandler → PageManager / ButtonManager / BuildingManager / JobManager
ResourceManager → Save_System / ToastManager
JobManager → ResourceManager / CraftsmanManager
BuildingManager → ResourceManager / CraftsmanManager

## 组件接口

### outside-config.js
```javascript
var OUTSIDE_CONFIG_EXTERNAL = {
    alchemy: { cooldown: 5000, goldAmount: 1 },
    collect: { cooldown: 10000, stoneMin: 3, stoneMax: 6, woodMin: 3, woodMax: 6 },
    canvas: { width: 800, height: 600 },
    pages: { swipeThreshold: 0.3, animationDuration: 300 },
    toast: { speed: 30, duration: 2000, fontSize: 20, spacing: 28 }
};
```

### job-config.js
```javascript
var JOB_CONFIG_EXTERNAL = {
    productionInterval: 15000,
    jobs: {
        farmer: { name: '农夫', consumes: {}, produces: { wheat: 2 } },
        baker: { name: '面包工', consumes: { wheat: 2 }, produces: { bread: 1 } }
    },
    buildings: {
        dormitory: { name: '宿舍', cost: { wood: 10, stone: 10 }, effect: { craftsmanCapacity: 2 } }
    }
};
```

### ResourceManager
属性：gold, stone, wood, wheat, bread（均初始0）
方法：addGold/addStone/addWood/addWheat/addBread(amount), hasEnough(costs), deduct(costs), getResources()

### ButtonManager
每个按钮：{ x, y, width, height, cooldownEnd, onClick }
方法：isInCooldown(name, now), getRemainingCooldown(name, now), handleClick(x, y), isPointInButton(x, y, button)

### SaveSystem
STORAGE_KEY: 'underground_castle_outside'
方法：save(resources, craftsman, jobs, buildings), load()（失败返回默认值）

### PageManager
状态：currentPage(0/1), offsetX, isDragging, isAnimating, dragStartX, 动画相关字段
方法：getTargetOffset(pageIndex, canvasWidth), startDrag(x), updateDrag(x, canvasWidth), endDrag(canvasWidth), updateAnimation(now, canvasWidth), shouldSwitchPage(dragDistance, canvasWidth)

### CanvasRenderer
方法：init(canvas), render(...), drawCastlePage/drawKingdomPage(offsetX, ...), drawPageTitle(title, offsetX), drawButton/drawResources/drawCooldown(...), drawProductionCountdown(jobManager, now, offsetX), drawProductionPreview(jobManager, resourceManager, offsetX)

#### drawProductionCountdown(jobManager, now, offsetX)
在工匠状态下方显示「下次产出: Ns」。
- 调用 jobManager.getRemainingSeconds(now) 获取剩余秒数
- 位置：工匠状态行下方（y ≈ 380）
- 颜色：#aaaaff（淡蓝色）

#### drawProductionPreview(jobManager, resourceManager, offsetX)
在岗位列表下方显示资源变化预览。
- 调用 jobManager.previewProduction(resourceManager) 获取变化量
- 无变化时不渲染
- 标题行「下次产出预览:」白色
- 正数：绿色(#00ff00)「+N 资源名」
- 负数：红色(#ff4444)「-N 资源名」
- 零值资源不显示

### InputHandler
init(canvas, buttonManager, pageManager)：绑定 mouse/touch 事件，区分拖拽（>5px）和点击，点击只响应当前页面按钮

### CraftsmanManager
属性：totalCapacity
方法：getAssigned()（从JobManager汇总）, getAvailable(), addCapacity(amount), canAssign()

### JobManager
属性：assignments({ farmer: 0, baker: 0 }), lastTickTime
方法：init(jobConfig), assign(jobId), unassign(jobId), update(now, resourceManager), calculateProduction(jobId, workerCount, resourceManager), getAssignments(), getRemainingSeconds(now), previewProduction(resourceManager)

#### getRemainingSeconds(now)
计算距离下次 Production_Tick 的剩余秒数。
```javascript
getRemainingSeconds: function(now) {
    var interval = (this._config && this._config.productionInterval) || 15000;
    if (this.lastTickTime === 0) {
        return Math.ceil(interval / 1000);
    }
    var elapsed = now - this.lastTickTime;
    var remaining = interval - elapsed;
    if (remaining <= 0) return Math.ceil(interval / 1000);
    return Math.ceil(remaining / 1000);
}
```
- lastTickTime=0（首次启动）→ 返回完整周期秒数
- tick 刚触发后 → remaining ≈ interval → 返回完整周期秒数
- 精度：向上取整（Math.ceil）

#### previewProduction(resourceManager)
预计算下次 tick 的资源变化量，返回 { resourceKey: delta } 对象。
```javascript
previewProduction: function(resourceManager) {
    var changes = {};
    if (!this._config || !this._config.jobs) return changes;
    var jobIds = Object.keys(this.assignments);
    for (var i = 0; i < jobIds.length; i++) {
        var jobId = jobIds[i];
        var workerCount = this.assignments[jobId];
        if (workerCount <= 0) continue;
        var jobDef = this._config.jobs[jobId];
        if (!jobDef) continue;
        var consumes = jobDef.consumes || {};
        var produces = jobDef.produces || {};
        // 计算实际可工作的工匠数（考虑资源限制）
        var actualWorkers = workerCount;
        var consumeKeys = Object.keys(consumes);
        // 用当前资源 + 已累计的 changes 来计算可用量
        for (var c = 0; c < consumeKeys.length; c++) {
            var resKey = consumeKeys[c];
            var costPerWorker = consumes[resKey];
            if (costPerWorker > 0) {
                var available = (resourceManager[resKey] || 0) + (changes[resKey] || 0);
                var maxWorkers = Math.floor(available / costPerWorker);
                if (maxWorkers < actualWorkers) actualWorkers = maxWorkers;
            }
        }
        if (actualWorkers <= 0) continue;
        // 累计消耗
        for (var c = 0; c < consumeKeys.length; c++) {
            var resKey = consumeKeys[c];
            changes[resKey] = (changes[resKey] || 0) - consumes[resKey] * actualWorkers;
        }
        // 累计产出
        var produceKeys = Object.keys(produces);
        for (var p = 0; p < produceKeys.length; p++) {
            var resKey = produceKeys[p];
            changes[resKey] = (changes[resKey] || 0) + produces[resKey] * actualWorkers;
        }
    }
    return changes;
}
```
- 遍历所有有工匠的岗位，模拟一次 tick 的资源变化
- Baker 的 wheat 限制与 calculateProduction 逻辑一致
- 累计 changes 确保多岗位间资源依赖正确（如 farmer 产出的 wheat 可供 baker 消耗）
- 返回值只包含非零变化的资源

### BuildingManager
属性：buildCounts({ dormitory: 0 }), button位置
方法：init(buildingConfig), canBuild(id, resourceManager), build(id, resourceManager, craftsmanManager), getBuildCounts()

### ToastManager
```javascript
var RESOURCE_NAMES = { gold: '金币', stone: '石头', wood: '木头', wheat: '小麦', bread: '面包' };
```
属性：toasts[], _defaults: { speed: 30, duration: 2000, fontSize: 20, spacing: 28 }
方法：getConfig(), addToast(type, amount, resourceName, canvasWidth, canvasHeight), addResourceToasts(changes, canvasWidth, canvasHeight), update(deltaTime), render(ctx)

Toast 数据结构：{ text, color, x, startY, y, opacity, elapsed }
- gain: 绿色(#00ff00) "+N 资源名", consume: 红色(#ff4444) "-N 资源名"
- 初始位置：Canvas 中心，多条向下堆叠（spacing 间距）
- 每帧：y = startY + speed * elapsed / 1000, opacity = max(0, 1 - elapsed / duration)

### 集成方式
- ResourceManager 的 add/deduct 方法在 index.html 中包装，自动触发 Toast 和存档
- JobManager.update 前后对比资源差异，差异不为零时触发 Toast

### Game Loop
```javascript
var lastFrameTime = 0;
function gameLoop(timestamp) {
    var deltaTime = lastFrameTime === 0 ? 0 : timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    PageManager.updateAnimation(timestamp, canvas.width);
    JobManager.update(timestamp, ResourceManager);
    ToastManager.update(deltaTime);
    CanvasRenderer.render(...);
    ToastManager.render(CanvasRenderer.ctx);
    requestAnimationFrame(gameLoop);
}
```

## 数据模型

### localStorage 存档格式
```json
{ "gold": 0, "stone": 0, "wood": 0, "wheat": 0, "bread": 0,
  "craftsman": { "totalCapacity": 0 },
  "jobs": { "farmer": 0, "baker": 0 },
  "buildings": { "dormitory": 0 } }
```

### 页面定义
- 页面 0 (Castle_Page): 标题"地下城堡", Alchemy_Button, 偏移 offsetX
- 页面 1 (Kingdom_Page): 标题"地下王国", Collect_Button, 偏移 offsetX + canvasWidth, Production_Countdown, Production_Preview

### randomInt(min, max)
```javascript
Math.floor(Math.random() * (max - min + 1)) + min
```

## 正确性属性

### Property 1: 炼金按钮产出正确性
非冷却点击 Gold +1，冷却中不变。 **Validates: 1.1, 1.5**

### Property 2: 收集按钮产出范围正确性
非冷却点击 Stone/Wood 增量 ∈ [3,6]，冷却中不变。 **Validates: 2.1, 2.2, 2.6**

### Property 3: 冷却时间计算正确性
点击后配置时长内 isInCooldown=true 且 getRemainingCooldown 正确，超时后 false。 **Validates: 1.3, 1.4, 2.4, 2.5**

### Property 4: 资源显示一致性
渲染输出包含 gold/stone/wood 当前值。 **Validates: 1.2, 2.3, 3.1, 3.2**

### Property 5: 存档读写往返一致性
save → load 返回等价数据。 **Validates: 4.1, 4.2**

### Property 6: 点击命中检测正确性
isPointInButton 返回 true ⟺ 点在矩形内。 **Validates: 5.3**

### Property 7: 页面切换往返一致性
page0 → page1 → page0，currentPage 回到 0。 **Validates: 6.4, 6.5**

### Property 8: 拖拽跟随正确性
updateDrag 后 offsetX 变化量 = 拖拽位移（受边界限制）。 **Validates: 6.6**

### Property 9: 页面切换阈值判断正确性
shouldSwitchPage = true ⟺ |dragDistance| >= canvasWidth * 0.3。 **Validates: 6.7, 6.8**

### Property 10: 动画期间拖拽锁定
isAnimating=true 时 startDrag 后 isDragging 保持 false。 **Validates: 6.9**

### Property 11: 页面偏移量边界约束
offsetX ∈ [-(pageCount-1)*canvasWidth, 0]。 **Validates: 6.10, 6.11**

### Property 12: 配置驱动初始化正确性
init 后 assignments/buildCounts 包含所有配置 key 且值为 0。 **Validates: 7.2, 7.3, 7.4**

### Property 13: 扩展存档往返一致性
含所有字段的 save → load 往返一致。 **Validates: 8.4, 8.5, 9.6, 9.7, 13.2**

### Property 14: 工匠不变量
available = totalCapacity - assigned，assigned = 所有岗位分配数之和。 **Validates: 9.1, 9.3, 9.4, 12.3, 12.4**

### Property 15: 工匠分配拒绝
available=0 时 assign 失败，状态不变。 **Validates: 9.5**

### Property 16: 产出时机正确性
仅在 now - lastTickTime >= productionInterval 时执行产出。 **Validates: 10.1**

### Property 17: Farmer 产出正确性
n 个 farmer → wheat += 2*n。 **Validates: 10.2**

### Property 18: Baker 产出正确性
n 个 baker, wheat=w → 实际处理 min(n, floor(w/2))，wheat -= 实际*2，bread += 实际。 **Validates: 10.3, 10.4**

### Property 19: 建造正确性
资源够：扣除 cost，容量 += effect；不够：状态不变。 **Validates: 11.3, 11.4, 11.5**

### Property 20: 资源显示包含新资源
渲染输出包含五种资源值。 **Validates: 8.2, 8.3**

### Property 21: 资源变化触发 Toast 创建
Toast 数量 = 非零变化的资源种类数。 **Validates: 14.1, 14.3, 15.1, 15.3**

### Property 22: Toast 文字格式与颜色正确性
gain: "+N name" 绿色, consume: "-N name" 红色。 **Validates: 14.2, 15.2**

### Property 23: Toast 初始位置正确性
无活跃 Toast 时新 Toast 位于 Canvas 中心。 **Validates: 16.1**

### Property 24: Toast 堆叠排列正确性
新 Toast.startY = 上一条.startY + spacing。 **Validates: 16.2, 16.3**

### Property 25: Toast 下降位移正确性
y = startY + speed * elapsed / 1000。 **Validates: 17.1**

### Property 26: Toast 透明度生命周期正确性
opacity = max(0, 1 - elapsed / duration)。 **Validates: 17.2, 17.4**

### Property 27: Toast 过期移除
opacity ≤ 0 的 Toast 被移除。 **Validates: 17.3**

### Property 28: Toast 配置驱动
使用外部配置值而非默认值。 **Validates: 19.1**

### Property 29: 倒计时计算精度
*For any* 有效的 now 和 lastTickTime（lastTickTime > 0 且 now - lastTickTime < productionInterval），getRemainingSeconds(now) 应等于 Math.ceil((productionInterval - (now - lastTickTime)) / 1000)。 **Validates: 20.4**

### Property 30: 产出预览与实际产出一致性
*For any* 岗位分配组合和资源状态，previewProduction 返回的资源变化量应与对相同状态执行一次 calculateProduction（遍历所有岗位）后的实际资源变化量一致。 **Validates: 21.2, 21.3**

## 错误处理

- localStorage：缺失/损坏/字段缺失 → 默认值；旧存档兼容；存储满时捕获异常继续运行
- 点击：超出按钮区域无操作；拖拽 <5px 视为点击
- 页面切换：边界钳制 offsetX；动画中忽略新拖拽
- 资源：非负整数，无上限；Baker wheat 不足按 floor(wheat/2) 处理；建造/分配资源不足时拒绝
- 岗位移除：分配数=0 时不执行
- 配置：Job_Config 未加载用空默认；缺少 consumes/produces 默认空对象
- Toast：配置缺失用默认值；变化量=0 不创建；不设上限

## 测试策略

使用 fast-check 属性测试（每属性 ≥100 次）+ 单元测试。
测试文件：`tests/outside-castle.property.test.js` 和 `tests/outside-castle.unit.test.js`
核心逻辑在 `outside-logic.js`，测试通过 require 导入。

新增属性测试：
- Property 29: 倒计时计算精度 — 验证 getRemainingSeconds 的数学正确性
- Property 30: 产出预览一致性 — 验证 previewProduction 与实际产出逻辑一致
