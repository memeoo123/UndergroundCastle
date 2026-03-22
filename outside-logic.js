// outside-logic.js — 关外经营系统核心逻辑

// 工具函数：生成 [min, max] 范围内的随机整数
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 获取资源配置
function _getResourceConfig() {
    return (typeof RESOURCE_CONFIG_EXTERNAL !== 'undefined' && RESOURCE_CONFIG_EXTERNAL.resources)
        ? RESOURCE_CONFIG_EXTERNAL.resources : {};
}

// 资源管理器（配置驱动）
var ResourceManager = {
    _initialized: false,

    _initFromConfig: function() {
        if (this._initialized) return;
        var cfg = _getResourceConfig();
        var keys = Object.keys(cfg);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (!(key in this)) {
                this[key] = cfg[key].initial || 0;
            }
        }
        this._initialized = true;
    },

    addResource: function(key, amount) {
        this._initFromConfig();
        this[key] = (this[key] || 0) + amount;
    },

    hasEnough: function(costs) {
        this._initFromConfig();
        var keys = Object.keys(costs);
        for (var i = 0; i < keys.length; i++) {
            if ((this[keys[i]] || 0) < costs[keys[i]]) return false;
        }
        return true;
    },
    deduct: function(costs) {
        this._initFromConfig();
        var keys = Object.keys(costs);
        for (var i = 0; i < keys.length; i++) {
            this[keys[i]] = (this[keys[i]] || 0) - costs[keys[i]];
        }
    },
    getResources: function() {
        this._initFromConfig();
        var cfg = _getResourceConfig();
        var result = {};
        var keys = Object.keys(cfg);
        for (var i = 0; i < keys.length; i++) {
            result[keys[i]] = this[keys[i]] || 0;
        }
        return result;
    }
};

// 按钮管理器
var ButtonManager = {
    buttons: {
        alchemy: {
            x: 100, y: 200, width: 160, height: 60,
            cooldownEnd: 0,
            onClick: function(now) {
                var config = (typeof OUTSIDE_CONFIG_EXTERNAL !== 'undefined') ? OUTSIDE_CONFIG_EXTERNAL : { alchemy: { cooldown: 5000, goldAmount: 1 } };
                ResourceManager.addResource('gold', config.alchemy.goldAmount);
                ButtonManager.buttons.alchemy.cooldownEnd = now + config.alchemy.cooldown;
            }
        },
        collect: {
            x: 350, y: 200, width: 160, height: 60,
            cooldownEnd: 0,
            onClick: function(now) {
                var config = (typeof OUTSIDE_CONFIG_EXTERNAL !== 'undefined') ? OUTSIDE_CONFIG_EXTERNAL : { collect: { cooldown: 10000, stoneMin: 3, stoneMax: 6, woodMin: 3, woodMax: 6 } };
                var stoneAmount = randomInt(config.collect.stoneMin, config.collect.stoneMax);
                var woodAmount = randomInt(config.collect.woodMin, config.collect.woodMax);
                ResourceManager.addResource('stone', stoneAmount);
                ResourceManager.addResource('wood', woodAmount);
                ButtonManager.buttons.collect.cooldownEnd = now + config.collect.cooldown;
            }
        }
    },

    isInCooldown: function(buttonName, now) {
        var button = this.buttons[buttonName];
        if (!button) return false;
        return now < button.cooldownEnd;
    },

    getRemainingCooldown: function(buttonName, now) {
        var button = this.buttons[buttonName];
        if (!button) return 0;
        var remaining = button.cooldownEnd - now;
        if (remaining <= 0) return 0;
        return Math.ceil(remaining / 1000);
    },

    handleClick: function(x, y, now) {
        var buttonNames = Object.keys(this.buttons);
        for (var i = 0; i < buttonNames.length; i++) {
            var name = buttonNames[i];
            var button = this.buttons[name];
            if (this.isPointInButton(x, y, button)) {
                if (!this.isInCooldown(name, now)) {
                    button.onClick(now);
                }
                return name;
            }
        }
        return null;
    },

    isPointInButton: function(x, y, button) {
        return x >= button.x && x <= button.x + button.width &&
               y >= button.y && y <= button.y + button.height;
    }
};

// 存档系统
var SaveSystem = {
    STORAGE_KEY: 'underground_castle_outside',
    CURRENT_VERSION: 2,

    _getDefaults: function() {
        var cfg = _getResourceConfig();
        var defaults = {};
        var resKeys = Object.keys(cfg);
        for (var i = 0; i < resKeys.length; i++) {
            defaults[resKeys[i]] = cfg[resKeys[i]].initial || 0;
        }
        defaults.craftsman = { totalCapacity: 0 };
        defaults.jobs = {};
        defaults.buildings = {};
        defaults.soldiers = [];
        defaults.dungeon = null;
        defaults.version = this.CURRENT_VERSION;
        return defaults;
    },

    _migrate: function(data) {
        var ver = data.version;
        // 缺失或非 number 视为 v1
        if (typeof ver !== 'number') {
            ver = 1;
        }
        // 不做降级
        if (ver > this.CURRENT_VERSION) {
            return data;
        }
        // v1 → v2：补全 dungeon、士兵 speed、version
        if (ver < 2) {
            if (data.dungeon === undefined) {
                data.dungeon = null;
            }
            if (Array.isArray(data.soldiers)) {
                for (var i = 0; i < data.soldiers.length; i++) {
                    if (typeof data.soldiers[i].speed !== 'number') {
                        data.soldiers[i].speed = 10;
                    }
                }
            }
            data.version = 2;
        }
        return data;
    },

    save: function(resources, craftsman, jobs, buildings, soldiers) {
        try {
            var cfg = _getResourceConfig();
            var data = {};
            var resKeys = Object.keys(cfg);
            for (var i = 0; i < resKeys.length; i++) {
                data[resKeys[i]] = resources[resKeys[i]] || 0;
            }
            data.craftsman = { totalCapacity: (craftsman && craftsman.totalCapacity) || 0 };
            data.jobs = {};
            if (jobs) {
                var jobKeys = Object.keys(jobs);
                for (var i = 0; i < jobKeys.length; i++) {
                    data.jobs[jobKeys[i]] = jobs[jobKeys[i]];
                }
            }
            data.buildings = {};
            if (buildings) {
                var bKeys = Object.keys(buildings);
                for (var i = 0; i < bKeys.length; i++) {
                    data.buildings[bKeys[i]] = buildings[bKeys[i]];
                }
            }
            if (soldiers && Array.isArray(soldiers)) {
                data.soldiers = [];
                for (var i = 0; i < soldiers.length; i++) {
                    var s = soldiers[i];
                    data.soldiers.push({
                        tier: s.tier,
                        attack: s.attack,
                        defense: s.defense,
                        hp: s.hp,
                        speed: s.speed || 10
                    });
                }
            } else {
                data.soldiers = [];
            }
            // 追加地牢进度
            if (typeof ProgressTracker !== 'undefined' && ProgressTracker && typeof ProgressTracker.saveProgress === 'function') {
                data.dungeon = ProgressTracker.saveProgress();
            } else {
                data.dungeon = null;
            }
            data.version = this.CURRENT_VERSION;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            // QuotaExceededError 或 localStorage 不可用，静默处理
        }
    },

    load: function() {
        try {
            var raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw === null) return this._getDefaults();
            var parsed;
            try {
                parsed = JSON.parse(raw);
            } catch (e) {
                return this._getDefaults();
            }
            if (!parsed || typeof parsed !== 'object') return this._getDefaults();

            // 版本迁移
            parsed = this._migrate(parsed);

            var cfg = _getResourceConfig();
            var resKeys = Object.keys(cfg);
            var result = {};

            // 资源校验
            for (var i = 0; i < resKeys.length; i++) {
                var key = resKeys[i];
                result[key] = (typeof parsed[key] === 'number') ? parsed[key] : (cfg[key].initial || 0);
            }

            // 工匠校验
            if (parsed.craftsman && typeof parsed.craftsman === 'object') {
                result.craftsman = {
                    totalCapacity: (typeof parsed.craftsman.totalCapacity === 'number') ? parsed.craftsman.totalCapacity : 0
                };
            } else {
                result.craftsman = { totalCapacity: 0 };
            }

            // 岗位校验：过滤未知 key（仅保留 JOB_CONFIG_EXTERNAL 中存在的岗位）
            result.jobs = {};
            if (parsed.jobs && typeof parsed.jobs === 'object') {
                var validJobs = (typeof JOB_CONFIG_EXTERNAL !== 'undefined' && JOB_CONFIG_EXTERNAL.jobs) ? JOB_CONFIG_EXTERNAL.jobs : {};
                var jobKeys = Object.keys(parsed.jobs);
                for (var i = 0; i < jobKeys.length; i++) {
                    if (validJobs[jobKeys[i]]) {
                        result.jobs[jobKeys[i]] = (typeof parsed.jobs[jobKeys[i]] === 'number') ? parsed.jobs[jobKeys[i]] : 0;
                    }
                }
            }

            // 建筑校验
            result.buildings = {};
            if (parsed.buildings && typeof parsed.buildings === 'object') {
                var bKeys = Object.keys(parsed.buildings);
                for (var i = 0; i < bKeys.length; i++) {
                    result.buildings[bKeys[i]] = (typeof parsed.buildings[bKeys[i]] === 'number') ? parsed.buildings[bKeys[i]] : 0;
                }
            }

            // 士兵校验
            result.soldiers = [];
            if (Array.isArray(parsed.soldiers)) {
                for (var i = 0; i < parsed.soldiers.length; i++) {
                    var s = parsed.soldiers[i];
                    if (s && typeof s === 'object' && typeof s.tier === 'number') {
                        result.soldiers.push({
                            tier: s.tier,
                            attack: (typeof s.attack === 'number') ? s.attack : 0,
                            defense: (typeof s.defense === 'number') ? s.defense : 0,
                            hp: (typeof s.hp === 'number') ? s.hp : 0,
                            speed: (typeof s.speed === 'number') ? s.speed : 10
                        });
                    }
                }
            }

            // 地牢进度校验
            if (parsed.dungeon && typeof parsed.dungeon === 'object') {
                var d = parsed.dungeon;
                result.dungeon = {
                    unlockedLayers: (Array.isArray(d.unlockedLayers) && d.unlockedLayers.length > 0) ? d.unlockedLayers : [1],
                    completedLayers: Array.isArray(d.completedLayers) ? d.completedLayers : [],
                    layerProgress: (d.layerProgress && typeof d.layerProgress === 'object') ? d.layerProgress : {},
                    bestRecords: (d.bestRecords && typeof d.bestRecords === 'object') ? d.bestRecords : {},
                    capturedFacilities: Array.isArray(d.capturedFacilities) ? d.capturedFacilities : []
                };
            } else {
                result.dungeon = null;
            }

            result.version = parsed.version || this.CURRENT_VERSION;
            return result;
        } catch (e) {
            return this._getDefaults();
        }
    }
};

// 输入处理器
var InputHandler = {
    _DRAG_THRESHOLD: 5,

    init: function(canvas, buttonManager, pageManager, buildingManager, jobManager, craftsmanManager, soldierManager) {
        var self = this;
        var startX = 0;
        var startY = 0;
        var isDown = false;
        var dragMode = null; // null, 'page', 'scroll'

        function getPos(e) {
            var rect = canvas.getBoundingClientRect();
            if (e.touches && e.touches.length > 0) {
                return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
            }
            if (e.changedTouches && e.changedTouches.length > 0) {
                return { x: e.changedTouches[0].clientX - rect.left, y: e.changedTouches[0].clientY - rect.top };
            }
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }

        function isPointInRect(px, py, rect) {
            return px >= rect.x && px <= rect.x + rect.width &&
                   py >= rect.y && py <= rect.y + rect.height;
        }

        function isInScrollArea(x, y, page) {
            // 检查是否在滚动区域内
            if (page === 0) {
                // Castle page: 仓库滚动区域（右侧）
                return y >= 110 && y <= 580 && x >= 280 && x <= 780;
            } else if (page === 1) {
                // Kingdom page: 岗位滚动区域（右侧）
                return y >= 80 && y <= 580 && x >= 320 && x <= 780;
            }
            return false;
        }

        function onDown(e) {
            e.preventDefault();
            var pos = getPos(e);
            startX = pos.x;
            startY = pos.y;
            isDown = true;
            dragMode = null;
            if (pageManager && !pageManager.showBuildingPage && !pageManager.showTrainingPage) {
                pageManager.startDrag(pos.x);
            }
        }

        function onMove(e) {
            if (!isDown) return;
            e.preventDefault();
            var pos = getPos(e);
            var dx = pos.x - startX;
            var dy = pos.y - startY;
            var dist = Math.sqrt(dx * dx + dy * dy);

            // Building_Page 模式：只支持滚动
            if (pageManager && pageManager.showBuildingPage) {
                if (dist > self._DRAG_THRESHOLD) {
                    var scrollDelta = pos.y - startY;
                    pageManager.handleBuildingScroll(-scrollDelta);
                    startY = pos.y;
                }
                return;
            }

            // Training_Page 模式：支持滚动
            if (pageManager && pageManager.showTrainingPage) {
                if (dist > self._DRAG_THRESHOLD) {
                    var scrollDelta = pos.y - startY;
                    pageManager.handleTrainingScroll(-scrollDelta);
                    startY = pos.y;
                }
                return;
            }

            // 确定拖拽模式
            if (dragMode === null && dist > self._DRAG_THRESHOLD) {
                var page = pageManager ? pageManager.currentPage : 0;
                var inScrollArea = isInScrollArea(startX, startY, page);
                
                if (inScrollArea && Math.abs(dy) > Math.abs(dx)) {
                    // 垂直拖拽且在滚动区域内 -> 滚动模式
                    dragMode = 'scroll';
                    if (pageManager) {
                        pageManager.isDragging = false;
                    }
                } else {
                    // 水平拖拽或不在滚动区域 -> 页面切换模式
                    dragMode = 'page';
                }
            }

            if (dragMode === 'page' && pageManager && pageManager.isDragging) {
                pageManager.updateDrag(pos.x, canvas.width);
            } else if (dragMode === 'scroll' && pageManager) {
                var scrollDelta = pos.y - startY;
                pageManager.handleScroll(pageManager.currentPage, -scrollDelta);
                startY = pos.y; // 更新起始点以实现连续滚动
            }
        }

        function onUp(e) {
            if (!isDown) return;
            isDown = false;
            var pos = getPos(e);
            var dx = pos.x - startX;
            var dy = pos.y - startY;
            var dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < self._DRAG_THRESHOLD) {
                // 视为点击 — 只响应当前页面的按钮
                var now = performance.now();
                if (pageManager) {
                    pageManager.isDragging = false;

                    // Building_Page 点击处理
                    if (pageManager.showBuildingPage) {
                        // 返回按钮
                        var backBtn = CanvasRenderer._buildingBackBtn;
                        if (backBtn && isPointInRect(pos.x, pos.y, backBtn)) {
                            pageManager.closeBuildingPage();
                            dragMode = null;
                            return;
                        }
                        // 建筑建造按钮
                        var bBtns = CanvasRenderer._buildingButtons;
                        if (bBtns && buildingManager && craftsmanManager) {
                            var bIds = Object.keys(bBtns);
                            for (var b = 0; b < bIds.length; b++) {
                                var bid = bIds[b];
                                if (isPointInRect(pos.x, pos.y, bBtns[bid])) {
                                    buildingManager.build(bid, ResourceManager, craftsmanManager);
                                    dragMode = null;
                                    return;
                                }
                            }
                        }
                        dragMode = null;
                        return;
                    }

                    // Training_Page 点击处理
                    if (pageManager.showTrainingPage) {
                        // Training_Page 非弹窗模式
                        // 返回按钮
                        var tBackBtn = CanvasRenderer._trainingBackBtn;
                        if (tBackBtn && isPointInRect(pos.x, pos.y, tBackBtn)) {
                            pageManager.closeTrainingPage();
                            dragMode = null;
                            return;
                        }
                        // 招募按钮
                        var recruitBtn = CanvasRenderer._trainingRecruitBtn;
                        if (recruitBtn && isPointInRect(pos.x, pos.y, recruitBtn)) {
                            soldierManager.recruit(ResourceManager);
                            dragMode = null;
                            return;
                        }
                        // 士兵直接进阶按钮
                        var promoteBtns = CanvasRenderer._trainingPromoteBtns;
                        if (promoteBtns) {
                            var pIds = Object.keys(promoteBtns);
                            for (var p = 0; p < pIds.length; p++) {
                                var pid = pIds[p];
                                if (isPointInRect(pos.x, pos.y, promoteBtns[pid])) {
                                    soldierManager.promote(parseInt(pid), ResourceManager);
                                    dragMode = null;
                                    return;
                                }
                            }
                        }
                        dragMode = null;
                        return;
                    }

                    var page = pageManager.currentPage;
                    if (page === 0) {
                        // Castle_Page: 响应炼金按钮、建造按钮
                        var alchemy = buttonManager.buttons.alchemy;
                        if (buttonManager.isPointInButton(pos.x, pos.y, alchemy)) {
                            if (!buttonManager.isInCooldown('alchemy', now)) {
                                alchemy.onClick(now);
                            }
                            dragMode = null;
                            return;
                        }

                        // 检测 Build_Button 点击 → 打开 Building_Page
                        if (buildingManager) {
                            var btn = buildingManager.button;
                            if (isPointInRect(pos.x, pos.y, btn)) {
                                pageManager.openBuildingPage();
                                dragMode = null;
                                return;
                            }
                        }

                        // 检测 Train_Button 点击 → 打开 Training_Page
                        var trainBtn = CanvasRenderer._trainBtn;
                        if (trainBtn && isPointInRect(pos.x, pos.y, trainBtn)) {
                            pageManager.openTrainingPage();
                            dragMode = null;
                            return;
                        }
                    } else if (page === 1) {
                        // Kingdom_Page: 响应收集按钮、岗位 +/- 按钮
                        var collect = buttonManager.buttons.collect;
                        if (buttonManager.isPointInButton(pos.x, pos.y, collect)) {
                            if (!buttonManager.isInCooldown('collect', now)) {
                                collect.onClick(now);
                            }
                            dragMode = null;
                            return;
                        }

                        // 检测 Job +/- 按钮点击
                        if (jobManager && jobManager._uiButtons && craftsmanManager) {
                            var jobIds = Object.keys(jobManager._uiButtons);
                            for (var j = 0; j < jobIds.length; j++) {
                                var jobId = jobIds[j];
                                var btns = jobManager._uiButtons[jobId];
                                if (btns.plus && isPointInRect(pos.x, pos.y, btns.plus)) {
                                    jobManager.assign(jobId);
                                    dragMode = null;
                                    return;
                                }
                                if (btns.minus && isPointInRect(pos.x, pos.y, btns.minus)) {
                                    jobManager.unassign(jobId);
                                    dragMode = null;
                                    return;
                                }
                            }
                        }
                    }
                } else {
                    buttonManager.handleClick(pos.x, pos.y, now);
                }
            } else {
                // 视为拖拽
                if (dragMode === 'page' && pageManager) {
                    pageManager.endDrag(canvas.width);
                }
                // 滚动模式不需要特殊处理
            }
            
            dragMode = null;
        }

        // Mouse events
        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseup', onUp);

        // Touch events
        canvas.addEventListener('touchstart', onDown, { passive: false });
        canvas.addEventListener('touchmove', onMove, { passive: false });
        canvas.addEventListener('touchend', onUp, { passive: false });

        // Wheel event for scrolling
        canvas.addEventListener('wheel', function(e) {
            e.preventDefault();
            if (pageManager) {
                var delta = e.deltaY * 0.5;
                if (pageManager.showBuildingPage) {
                    pageManager.handleBuildingScroll(delta);
                } else if (pageManager.showTrainingPage) {
                    pageManager.handleTrainingScroll(delta);
                } else {
                    pageManager.handleScroll(pageManager.currentPage, delta);
                }
            }
        }, { passive: false });
    }
};

// Canvas 渲染器
var CanvasRenderer = {
    ctx: null,

    init: function(canvas) {
        this.ctx = canvas.getContext('2d');
    },

    render: function(resourceManager, buttonManager, pageManager, now, craftsmanManager, jobManager, buildingManager, soldierManager) {
        var ctx = this.ctx;
        var canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Building_Page 全屏覆盖
        if (pageManager && pageManager.showBuildingPage) {
            this.drawBuildingPage(buildingManager, resourceManager, craftsmanManager, pageManager.buildingScrollOffset, canvas.width, canvas.height);
            return;
        }

        // Training_Page 全屏覆盖
        if (pageManager && pageManager.showTrainingPage) {
            this.drawTrainingPage(soldierManager, resourceManager, pageManager.trainingScrollOffset, canvas.width, canvas.height);
            return;
        }

        // 绘制背景
        ctx.fillStyle = '#2d5a27';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var ox = pageManager ? pageManager.offsetX : 0;

        // 裁剪到 Canvas 区域，防止页面内容溢出
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.clip();

        // 绘制两个页面
        this.drawCastlePage(ox, resourceManager, buttonManager, now, craftsmanManager, jobManager, buildingManager, pageManager);
        this.drawKingdomPage(ox + canvas.width, resourceManager, buttonManager, now, craftsmanManager, jobManager, pageManager);

        ctx.restore();
    },

    drawCastlePage: function(offsetX, resourceManager, buttonManager, now, craftsmanManager, jobManager, buildingManager, pageManager) {
        this.drawPageTitle('地下城堡', offsetX);
        
        // 左侧：炼金按钮和建造按钮竖向排列
        var leftX = 50;
        var startY = 80;
        var btnSpacing = 80;
        
        // 炼金按钮
        var alchemyBtn = buttonManager.buttons.alchemy;
        alchemyBtn.x = leftX;
        alchemyBtn.y = startY;
        this.drawButton(alchemyBtn, '炼金', offsetX, now);
        
        // 建造按钮
        if (buildingManager) {
            buildingManager.button.x = leftX;
            buildingManager.button.y = startY + btnSpacing;
            this.drawBuildButton(buildingManager, resourceManager, offsetX);
        }

        // 训练按钮
        this._trainBtn = { x: leftX, y: startY + btnSpacing * 2, width: 160, height: 60 };
        this.drawTrainButton(offsetX);

        // 右侧：仓库区域
        var warehouseX = 280;
        var scrollOffset = pageManager ? pageManager.castleScrollOffset : 0;
        this.drawWarehouseRight(resourceManager.getResources(), scrollOffset, offsetX, warehouseX);
    },

    drawKingdomPage: function(offsetX, resourceManager, buttonManager, now, craftsmanManager, jobManager, pageManager) {
        this.drawPageTitle('地下王国', offsetX);
        
        // 左侧：收集按钮、工匠信息、倒计时、产出预览竖向排列
        var leftX = 50;
        var startY = 80;
        
        // 收集按钮
        var collectBtn = buttonManager.buttons.collect;
        collectBtn.x = leftX;
        collectBtn.y = startY;
        this.drawButton(collectBtn, '收集', offsetX, now);

        if (craftsmanManager && jobManager) {
            var ctx = this.ctx;
            var ox = offsetX || 0;
            var currentY = startY + 80;
            
            // 工匠状态
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText('工匠: ' + craftsmanManager.getAssigned() + '/' + craftsmanManager.totalCapacity, leftX + ox, currentY);
            ctx.fillText('可用: ' + craftsmanManager.getAvailable(), leftX + ox, currentY + 20);
            currentY += 60;
            
            // 产出倒计时
            var seconds = jobManager.getRemainingSeconds(now);
            ctx.fillStyle = '#aaaaff';
            ctx.font = '16px sans-serif';
            ctx.fillText('下次产出: ' + seconds + 's', leftX + ox, currentY);
            currentY += 40;
            
            // 产出预览
            var changes = jobManager.previewProduction(resourceManager);
            var changeKeys = Object.keys(changes);
            if (changeKeys.length > 0) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText('下次产出预览:', leftX + ox, currentY);
                currentY += 24;
                
                ctx.font = '14px sans-serif';
                for (var i = 0; i < changeKeys.length; i++) {
                    var resKey = changeKeys[i];
                    var delta = changes[resKey];
                    if (delta === 0) continue;
                    var name = (typeof RESOURCE_NAMES !== 'undefined' && RESOURCE_NAMES[resKey]) ? RESOURCE_NAMES[resKey] : resKey;
                    if (delta > 0) {
                        ctx.fillStyle = '#00ff00';
                        ctx.fillText('+' + delta + ' ' + name, leftX + ox, currentY);
                    } else {
                        ctx.fillStyle = '#ff4444';
                        ctx.fillText(delta + ' ' + name, leftX + ox, currentY);
                    }
                    currentY += 20;
                }
            }
            
            // 右侧：岗位分配滚动视图
            var scrollOffset = pageManager ? pageManager.kingdomScrollOffset : 0;
            this.drawJobScrollViewRight(jobManager, craftsmanManager, scrollOffset, offsetX, 320);
        }
    },

    drawPageTitle: function(title, offsetX) {
        var ctx = this.ctx;
        var canvas = ctx.canvas;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(title, canvas.width / 2 + offsetX, 15);
    },

    drawButton: function(button, label, offsetX, now) {
        var ctx = this.ctx;
        var inCooldown = now < button.cooldownEnd;
        var bx = button.x + offsetX;

        // 按钮背景
        ctx.fillStyle = inCooldown ? '#888888' : '#c8a23c';
        ctx.fillRect(bx, button.y, button.width, button.height);

        // 按钮边框
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, button.y, button.width, button.height);

        // 按钮文字
        ctx.fillStyle = inCooldown ? '#cccccc' : '#ffffff';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, bx + button.width / 2, button.y + button.height / 2);

        // 冷却覆盖层
        if (inCooldown) {
            this.drawCooldown(button, offsetX, now);
        }
    },

    drawResources: function(resources, offsetX) {
        var ctx = this.ctx;
        var ox = offsetX || 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        var startX = 100 + ox;
        var startY = 50;
        var names = (typeof RESOURCE_NAMES !== 'undefined') ? RESOURCE_NAMES : {};
        var keys = Object.keys(resources);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var label = names[key] || key;
            ctx.fillText(label + ': ' + resources[key], startX, startY + i * 22);
        }
    },

    drawBuildButton: function(buildingManager, resourceManager, offsetX) {
        var ctx = this.ctx;
        var btn = buildingManager.button;
        var bx = btn.x + offsetX;
        var canBuild = buildingManager.canBuild('dormitory', resourceManager);

        // 按钮背景
        ctx.fillStyle = canBuild ? '#8b5e3c' : '#555555';
        ctx.fillRect(bx, btn.y, btn.width, btn.height);

        // 按钮边框
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, btn.y, btn.width, btn.height);

        // 按钮文字
        ctx.fillStyle = canBuild ? '#ffffff' : '#999999';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('建造', bx + btn.width / 2, btn.y + btn.height / 2);
    },

    drawTrainButton: function(offsetX) {
        var ctx = this.ctx;
        var btn = this._trainBtn;
        var bx = btn.x + offsetX;

        // 按钮背景
        ctx.fillStyle = '#8b5e3c';
        ctx.fillRect(bx, btn.y, btn.width, btn.height);

        // 按钮边框
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, btn.y, btn.width, btn.height);

        // 按钮文字
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('训练', bx + btn.width / 2, btn.y + btn.height / 2);
    },

    drawCraftsmanStatus: function(craftsmanManager, offsetX) {
        var ctx = this.ctx;
        var ox = offsetX || 0;
        var x = 100 + ox;
        var y = 360;

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('工匠: ' + craftsmanManager.getAssigned() + '/' + craftsmanManager.totalCapacity + ' (可用: ' + craftsmanManager.getAvailable() + ')', x, y);
    },

    drawJobList: function(jobManager, craftsmanManager, offsetX) {
        var ctx = this.ctx;
        var ox = offsetX || 0;
        var x = 100 + ox;
        var y = 395;
        var config = (typeof JOB_CONFIG_EXTERNAL !== 'undefined') ? JOB_CONFIG_EXTERNAL : {};
        var jobs = config.jobs || {};
        var jobIds = jobManager.getUnlockedJobIds();
        var btnSize = 30;
        var available = craftsmanManager.getAvailable();

        // 存储按钮位置供 InputHandler 使用
        if (!jobManager._uiButtons) jobManager._uiButtons = {};

        for (var i = 0; i < jobIds.length; i++) {
            var jobId = jobIds[i];
            var jobDef = jobs[jobId];
            var assigned = jobManager.assignments[jobId] || 0;
            var rowY = y + i * 40;

            // 岗位名称和分配数
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(jobDef.name + ': ' + assigned, x, rowY + btnSize / 2);

            // - 按钮
            var minusBtnX = x + 120;
            var canMinus = assigned > 0;
            ctx.fillStyle = canMinus ? '#cc4444' : '#555555';
            ctx.fillRect(minusBtnX, rowY, btnSize, btnSize);
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            ctx.strokeRect(minusBtnX, rowY, btnSize, btnSize);
            ctx.fillStyle = canMinus ? '#ffffff' : '#999999';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('-', minusBtnX + btnSize / 2, rowY + btnSize / 2);

            // + 按钮
            var plusBtnX = minusBtnX + btnSize + 10;
            var canPlus = available > 0;
            ctx.fillStyle = canPlus ? '#44aa44' : '#555555';
            ctx.fillRect(plusBtnX, rowY, btnSize, btnSize);
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            ctx.strokeRect(plusBtnX, rowY, btnSize, btnSize);
            ctx.fillStyle = canPlus ? '#ffffff' : '#999999';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+', plusBtnX + btnSize / 2, rowY + btnSize / 2);

            // 记录按钮位置（不含 offsetX，用于点击检测）
            jobManager._uiButtons[jobId] = {
                minus: { x: x + 120 - ox, y: rowY, width: btnSize, height: btnSize },
                plus: { x: minusBtnX + btnSize + 10 - ox, y: rowY, width: btnSize, height: btnSize }
            };
        }
    },

    drawProductionCountdown: function(jobManager, now, offsetX) {
        var ctx = this.ctx;
        var ox = offsetX || 0;
        var seconds = jobManager.getRemainingSeconds(now);
        ctx.fillStyle = '#aaaaff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('下次产出: ' + seconds + 's', 100 + ox, 380);
    },

    drawProductionPreview: function(jobManager, resourceManager, offsetX) {
        var ctx = this.ctx;
        var ox = offsetX || 0;
        var changes = jobManager.previewProduction(resourceManager);
        var keys = Object.keys(changes);
        if (keys.length === 0) return;

        var config = (typeof JOB_CONFIG_EXTERNAL !== 'undefined') ? JOB_CONFIG_EXTERNAL : {};
        var jobs = config.jobs || {};
        var jobCount = Object.keys(jobs).length;
        var baseY = 395 + jobCount * 40 + 10;

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('下次产出预览:', 100 + ox, baseY);

        var lineY = baseY + 24;
        for (var i = 0; i < keys.length; i++) {
            var resKey = keys[i];
            var delta = changes[resKey];
            if (delta === 0) continue;
            var name = (typeof RESOURCE_NAMES !== 'undefined' && RESOURCE_NAMES[resKey]) ? RESOURCE_NAMES[resKey] : resKey;
            if (delta > 0) {
                ctx.fillStyle = '#00ff00';
                ctx.fillText('+' + delta + ' ' + name, 100 + ox, lineY);
            } else {
                ctx.fillStyle = '#ff4444';
                ctx.fillText(delta + ' ' + name, 100 + ox, lineY);
            }
            lineY += 22;
        }
    },

    drawCooldown: function(button, offsetX, now) {
        var ctx = this.ctx;
        var remaining = button.cooldownEnd - now;
        if (remaining <= 0) return;
        var seconds = Math.ceil(remaining / 1000);
        var bx = button.x + (offsetX || 0);

        // 半透明覆盖层
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(bx, button.y, button.width, button.height);

        // 倒计时文字
        ctx.fillStyle = '#ff6666';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(seconds + 's', bx + button.width / 2, button.y + button.height / 2 + 20);
    },

    drawWarehouse: function(resources, scrollOffset, offsetX) {
        var ctx = this.ctx;
        var ox = offsetX || 0;
        
        // 标题
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('仓库', 100 + ox, 350);

        // 定义滚动区域
        var scrollX = 100 + ox;
        var scrollY = 380;
        var scrollWidth = 600;
        var scrollHeight = 200;

        // 计算内容总高度
        var names = (typeof RESOURCE_NAMES !== 'undefined') ? RESOURCE_NAMES : {};
        var keys = Object.keys(resources);
        var lineHeight = 24;
        var contentHeight = keys.length * lineHeight;

        // 限制滚动偏移量的最大值
        var maxScroll = Math.max(0, contentHeight - scrollHeight);
        var actualScroll = Math.min(scrollOffset, maxScroll);

        // 裁剪区域
        ctx.save();
        ctx.beginPath();
        ctx.rect(scrollX, scrollY, scrollWidth, scrollHeight);
        ctx.clip();

        // 绘制资源列表
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var label = names[key] || key;
            var y = scrollY + i * lineHeight - actualScroll;
            ctx.fillText(label + ': ' + resources[key], scrollX, y);
        }

        ctx.restore();

        // 绘制滚动条
        if (contentHeight > scrollHeight) {
            var scrollbarX = scrollX + scrollWidth + 5;
            var scrollbarWidth = 8;
            var scrollbarHeight = scrollHeight;
            
            // 滚动条背景
            ctx.fillStyle = '#444444';
            ctx.fillRect(scrollbarX, scrollY, scrollbarWidth, scrollbarHeight);

            // 滚动条滑块
            var thumbHeight = Math.max(20, scrollbarHeight * (scrollHeight / contentHeight));
            var thumbY = scrollY + (actualScroll / maxScroll) * (scrollbarHeight - thumbHeight);
            ctx.fillStyle = '#888888';
            ctx.fillRect(scrollbarX, thumbY, scrollbarWidth, thumbHeight);
        }
    },

    drawWarehouseRight: function(resources, scrollOffset, offsetX, startX) {
        var ctx = this.ctx;
        var ox = offsetX || 0;
        
        // 标题
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('仓库', startX + ox, 80);

        // 定义滚动区域
        var scrollX = startX + ox;
        var scrollY = 110;
        var scrollWidth = 480;
        var scrollHeight = 470;

        // 计算内容总高度
        var names = (typeof RESOURCE_NAMES !== 'undefined') ? RESOURCE_NAMES : {};
        var keys = Object.keys(resources);
        var lineHeight = 22;
        var contentHeight = keys.length * lineHeight;

        // 限制滚动偏移量的最大值
        var maxScroll = Math.max(0, contentHeight - scrollHeight);
        var actualScroll = Math.min(scrollOffset, maxScroll);

        // 裁剪区域
        ctx.save();
        ctx.beginPath();
        ctx.rect(scrollX, scrollY, scrollWidth, scrollHeight);
        ctx.clip();

        // 绘制资源列表
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var label = names[key] || key;
            var y = scrollY + i * lineHeight - actualScroll;
            ctx.fillText(label + ': ' + resources[key], scrollX, y);
        }

        ctx.restore();

        // 绘制滚动条
        if (contentHeight > scrollHeight) {
            var scrollbarX = scrollX + scrollWidth + 5;
            var scrollbarWidth = 8;
            var scrollbarHeight = scrollHeight;
            
            // 滚动条背景
            ctx.fillStyle = '#444444';
            ctx.fillRect(scrollbarX, scrollY, scrollbarWidth, scrollbarHeight);

            // 滚动条滑块
            var thumbHeight = Math.max(20, scrollbarHeight * (scrollHeight / contentHeight));
            var thumbY = scrollY + (actualScroll / maxScroll) * (scrollbarHeight - thumbHeight);
            ctx.fillStyle = '#888888';
            ctx.fillRect(scrollbarX, thumbY, scrollbarWidth, thumbHeight);
        }
    },

    drawJobScrollView: function(jobManager, craftsmanManager, scrollOffset, offsetX, resourceManager) {
        var ctx = this.ctx;
        var ox = offsetX || 0;
        
        // 定义滚动区域
        var scrollX = 100 + ox;
        var scrollY = 280;
        var scrollWidth = 600;
        var scrollHeight = 300;

        // 计算内容总高度
        var config = (typeof JOB_CONFIG_EXTERNAL !== 'undefined') ? JOB_CONFIG_EXTERNAL : {};
        var jobs = config.jobs || {};
        var jobIds = jobManager.getUnlockedJobIds();
        
        // 工匠状态行 + 倒计时行 + 岗位列表 + 产出预览
        var craftsmanHeight = 22;
        var countdownHeight = 22;
        var jobListHeight = jobIds.length * 40;
        var previewHeight = 100; // 预留空间
        var contentHeight = craftsmanHeight + countdownHeight + jobListHeight + previewHeight;

        // 限制滚动偏移量
        var maxScroll = Math.max(0, contentHeight - scrollHeight);
        var actualScroll = Math.min(scrollOffset, maxScroll);

        // 裁剪区域
        ctx.save();
        ctx.beginPath();
        ctx.rect(scrollX, scrollY, scrollWidth, scrollHeight);
        ctx.clip();

        var currentY = scrollY - actualScroll;

        // 绘制工匠状态
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('工匠: ' + craftsmanManager.getAssigned() + '/' + craftsmanManager.totalCapacity + ' (可用: ' + craftsmanManager.getAvailable() + ')', scrollX, currentY);
        currentY += craftsmanHeight;

        // 绘制产出倒计时
        var seconds = jobManager.getRemainingSeconds(performance.now());
        ctx.fillStyle = '#aaaaff';
        ctx.font = '16px sans-serif';
        ctx.fillText('下次产出: ' + seconds + 's', scrollX, currentY);
        currentY += countdownHeight;

        // 绘制岗位列表
        var btnSize = 30;
        var available = craftsmanManager.getAvailable();
        if (!jobManager._uiButtons) jobManager._uiButtons = {};

        for (var i = 0; i < jobIds.length; i++) {
            var jobId = jobIds[i];
            var jobDef = jobs[jobId];
            var assigned = jobManager.assignments[jobId] || 0;

            // 岗位名称和分配数
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(jobDef.name + ': ' + assigned, scrollX, currentY + btnSize / 2);

            // - 按钮
            var minusBtnX = scrollX + 120;
            var canMinus = assigned > 0;
            ctx.fillStyle = canMinus ? '#cc4444' : '#555555';
            ctx.fillRect(minusBtnX, currentY, btnSize, btnSize);
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            ctx.strokeRect(minusBtnX, currentY, btnSize, btnSize);
            ctx.fillStyle = canMinus ? '#ffffff' : '#999999';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('-', minusBtnX + btnSize / 2, currentY + btnSize / 2);

            // + 按钮
            var plusBtnX = minusBtnX + btnSize + 10;
            var canPlus = available > 0;
            ctx.fillStyle = canPlus ? '#44aa44' : '#555555';
            ctx.fillRect(plusBtnX, currentY, btnSize, btnSize);
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            ctx.strokeRect(plusBtnX, currentY, btnSize, btnSize);
            ctx.fillStyle = canPlus ? '#ffffff' : '#999999';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+', plusBtnX + btnSize / 2, currentY + btnSize / 2);

            // 记录按钮位置（不含 offsetX，用于点击检测）
            jobManager._uiButtons[jobId] = {
                minus: { x: scrollX + 120 - ox, y: currentY + actualScroll, width: btnSize, height: btnSize },
                plus: { x: plusBtnX - ox, y: currentY + actualScroll, width: btnSize, height: btnSize }
            };

            currentY += 40;
        }

        // 绘制产出预览
        if (resourceManager) {
            var changes = jobManager.previewProduction(resourceManager);
            var changeKeys = Object.keys(changes);
            if (changeKeys.length > 0) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '16px sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText('下次产出预览:', scrollX, currentY);
                currentY += 24;

                for (var i = 0; i < changeKeys.length; i++) {
                    var resKey = changeKeys[i];
                    var delta = changes[resKey];
                    if (delta === 0) continue;
                    var name = (typeof RESOURCE_NAMES !== 'undefined' && RESOURCE_NAMES[resKey]) ? RESOURCE_NAMES[resKey] : resKey;
                    if (delta > 0) {
                        ctx.fillStyle = '#00ff00';
                        ctx.fillText('+' + delta + ' ' + name, scrollX, currentY);
                    } else {
                        ctx.fillStyle = '#ff4444';
                        ctx.fillText(delta + ' ' + name, scrollX, currentY);
                    }
                    currentY += 22;
                }
            }
        }

        ctx.restore();

        // 绘制滚动条
        if (contentHeight > scrollHeight) {
            var scrollbarX = scrollX + scrollWidth + 5;
            var scrollbarWidth = 8;
            var scrollbarHeight = scrollHeight;
            
            // 滚动条背景
            ctx.fillStyle = '#444444';
            ctx.fillRect(scrollbarX, scrollY, scrollbarWidth, scrollbarHeight);

            // 滚动条滑块
            var thumbHeight = Math.max(20, scrollbarHeight * (scrollHeight / contentHeight));
            var thumbY = scrollY + (actualScroll / maxScroll) * (scrollbarHeight - thumbHeight);
            ctx.fillStyle = '#888888';
            ctx.fillRect(scrollbarX, thumbY, scrollbarWidth, thumbHeight);
        }
    },

    drawJobScrollViewRight: function(jobManager, craftsmanManager, scrollOffset, offsetX, startX) {
        var ctx = this.ctx;
        var ox = offsetX || 0;
        
        // 定义滚动区域（右侧）
        var scrollX = startX + ox;
        var scrollY = 80;
        var scrollWidth = 450;
        var scrollHeight = 500;

        // 计算内容总高度（只显示已解锁岗位）
        var config = (typeof JOB_CONFIG_EXTERNAL !== 'undefined') ? JOB_CONFIG_EXTERNAL : {};
        var jobs = config.jobs || {};
        var jobIds = jobManager.getUnlockedJobIds();
        
        var jobListHeight = jobIds.length * 40;
        var contentHeight = jobListHeight + 20;

        // 限制滚动偏移量
        var maxScroll = Math.max(0, contentHeight - scrollHeight);
        var actualScroll = Math.min(scrollOffset, maxScroll);

        // 裁剪区域
        ctx.save();
        ctx.beginPath();
        ctx.rect(scrollX, scrollY, scrollWidth, scrollHeight);
        ctx.clip();

        var currentY = scrollY - actualScroll;

        // 绘制岗位列表
        var btnSize = 30;
        var available = craftsmanManager.getAvailable();
        if (!jobManager._uiButtons) jobManager._uiButtons = {};

        for (var i = 0; i < jobIds.length; i++) {
            var jobId = jobIds[i];
            var jobDef = jobs[jobId];
            var assigned = jobManager.assignments[jobId] || 0;

            // 岗位名称和分配数
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(jobDef.name + ': ' + assigned, scrollX, currentY + btnSize / 2);

            // - 按钮
            var minusBtnX = scrollX + 120;
            var canMinus = assigned > 0;
            ctx.fillStyle = canMinus ? '#cc4444' : '#555555';
            ctx.fillRect(minusBtnX, currentY, btnSize, btnSize);
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            ctx.strokeRect(minusBtnX, currentY, btnSize, btnSize);
            ctx.fillStyle = canMinus ? '#ffffff' : '#999999';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('-', minusBtnX + btnSize / 2, currentY + btnSize / 2);

            // + 按钮
            var plusBtnX = minusBtnX + btnSize + 10;
            var canPlus = available > 0;
            ctx.fillStyle = canPlus ? '#44aa44' : '#555555';
            ctx.fillRect(plusBtnX, currentY, btnSize, btnSize);
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            ctx.strokeRect(plusBtnX, currentY, btnSize, btnSize);
            ctx.fillStyle = canPlus ? '#ffffff' : '#999999';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+', plusBtnX + btnSize / 2, currentY + btnSize / 2);

            // 记录按钮位置（屏幕坐标，不含页面 offsetX，用于点击检测）
            // 只有在滚动可见区域内的按钮才记录
            var btnVisible = (currentY + btnSize > scrollY) && (currentY < scrollY + scrollHeight);
            if (btnVisible) {
                jobManager._uiButtons[jobId] = {
                    minus: { x: minusBtnX - ox, y: currentY, width: btnSize, height: btnSize },
                    plus: { x: plusBtnX - ox, y: currentY, width: btnSize, height: btnSize }
                };
            } else {
                // 滚出可见区域的按钮移除，防止误触
                delete jobManager._uiButtons[jobId];
            }

            currentY += 40;
        }

        ctx.restore();

        // 绘制滚动条
        if (contentHeight > scrollHeight) {
            var scrollbarX = scrollX + scrollWidth + 5;
            var scrollbarWidth = 8;
            var scrollbarHeight = scrollHeight;
            
            // 滚动条背景
            ctx.fillStyle = '#444444';
            ctx.fillRect(scrollbarX, scrollY, scrollbarWidth, scrollbarHeight);

            // 滚动条滑块
            var thumbHeight = Math.max(20, scrollbarHeight * (scrollHeight / contentHeight));
            var thumbY = scrollY + (actualScroll / maxScroll) * (scrollbarHeight - thumbHeight);
            ctx.fillStyle = '#888888';
            ctx.fillRect(scrollbarX, thumbY, scrollbarWidth, thumbHeight);
        }
    },

    drawBuildingPage: function(buildingManager, resourceManager, craftsmanManager, scrollOffset, canvasWidth, canvasHeight) {
        var ctx = this.ctx;
        var config = (typeof JOB_CONFIG_EXTERNAL !== 'undefined') ? JOB_CONFIG_EXTERNAL : {};
        var buildings = config.buildings || {};
        var buildingIds = Object.keys(buildings);
        var names = (typeof RESOURCE_NAMES !== 'undefined') ? RESOURCE_NAMES : {};

        // 全屏深色背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 标题
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('建筑', canvasWidth / 2, 15);

        // 返回按钮
        var backBtn = { x: 20, y: 15, width: 80, height: 36 };
        ctx.fillStyle = '#555555';
        ctx.fillRect(backBtn.x, backBtn.y, backBtn.width, backBtn.height);
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.strokeRect(backBtn.x, backBtn.y, backBtn.width, backBtn.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('返回', backBtn.x + backBtn.width / 2, backBtn.y + backBtn.height / 2);

        // 存储返回按钮位置供 InputHandler 使用
        this._buildingBackBtn = backBtn;

        // 建筑列表滚动区域
        var scrollX = 40;
        var scrollY = 65;
        var scrollWidth = canvasWidth - 80;
        var scrollHeight = canvasHeight - 80;

        // 计算每个建筑条目高度和总内容高度
        var entryHeight = 100;
        var entrySpacing = 10;
        var contentHeight = buildingIds.length * (entryHeight + entrySpacing);

        var maxScroll = Math.max(0, contentHeight - scrollHeight);
        var actualScroll = Math.min(scrollOffset, maxScroll);

        // 存储建筑按钮位置
        this._buildingButtons = {};

        // 裁剪区域
        ctx.save();
        ctx.beginPath();
        ctx.rect(scrollX, scrollY, scrollWidth, scrollHeight);
        ctx.clip();

        var currentY = scrollY - actualScroll;

        for (var i = 0; i < buildingIds.length; i++) {
            var bId = buildingIds[i];
            var bDef = buildings[bId];
            var count = (buildingManager.buildCounts[bId] || 0);
            var canBuild = buildingManager.canBuild(bId, resourceManager);

            // 条目背景
            ctx.fillStyle = '#2a2a3e';
            ctx.fillRect(scrollX, currentY, scrollWidth, entryHeight);
            ctx.strokeStyle = '#444466';
            ctx.lineWidth = 1;
            ctx.strokeRect(scrollX, currentY, scrollWidth, entryHeight);

            // 建筑名称 + 已建造数量
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(bDef.name + ' x' + count, scrollX + 10, currentY + 8);

            // 费用
            var cost = bDef.cost || {};
            var costKeys = Object.keys(cost);
            var costText = '费用: ';
            for (var c = 0; c < costKeys.length; c++) {
                var rk = costKeys[c];
                var rName = names[rk] || rk;
                if (c > 0) costText += '  ';
                costText += rName + ':' + cost[rk];
            }
            var hasEnough = resourceManager.hasEnough(cost);
            ctx.fillStyle = hasEnough ? '#cccccc' : '#ff4444';
            ctx.font = '14px sans-serif';
            ctx.fillText(costText, scrollX + 10, currentY + 34);

            // 效果
            var effect = bDef.effect || {};
            var effectKeys = Object.keys(effect);
            var effectText = '效果: ';
            for (var e = 0; e < effectKeys.length; e++) {
                var ek = effectKeys[e];
                if (e > 0) effectText += '  ';
                if (ek === 'craftsmanCapacity') {
                    effectText += '工匠容量 +' + effect[ek];
                } else {
                    effectText += ek + ' +' + effect[ek];
                }
            }
            ctx.fillStyle = '#aaaaff';
            ctx.font = '14px sans-serif';
            ctx.fillText(effectText, scrollX + 10, currentY + 54);

            // 建造按钮
            var buildBtnW = 80;
            var buildBtnH = 36;
            var buildBtnX = scrollX + scrollWidth - buildBtnW - 15;
            var buildBtnY = currentY + (entryHeight - buildBtnH) / 2;

            ctx.fillStyle = canBuild ? '#44aa44' : '#555555';
            ctx.fillRect(buildBtnX, buildBtnY, buildBtnW, buildBtnH);
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            ctx.strokeRect(buildBtnX, buildBtnY, buildBtnW, buildBtnH);
            ctx.fillStyle = canBuild ? '#ffffff' : '#999999';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('建造', buildBtnX + buildBtnW / 2, buildBtnY + buildBtnH / 2);

            // 记录按钮位置（屏幕坐标）
            var btnVisible = (currentY + entryHeight > scrollY) && (currentY < scrollY + scrollHeight);
            if (btnVisible) {
                this._buildingButtons[bId] = {
                    x: buildBtnX, y: buildBtnY, width: buildBtnW, height: buildBtnH
                };
            }

            currentY += entryHeight + entrySpacing;
        }

        ctx.restore();

        // 绘制滚动条
        if (contentHeight > scrollHeight) {
            var scrollbarX = scrollX + scrollWidth + 5;
            var scrollbarWidth = 8;

            ctx.fillStyle = '#444444';
            ctx.fillRect(scrollbarX, scrollY, scrollbarWidth, scrollHeight);

            var thumbHeight = Math.max(20, scrollHeight * (scrollHeight / contentHeight));
            var thumbY = scrollY + (actualScroll / maxScroll) * (scrollHeight - thumbHeight);
            ctx.fillStyle = '#888888';
            ctx.fillRect(scrollbarX, thumbY, scrollbarWidth, thumbHeight);
        }
    },

    drawTrainingPage: function(soldierManager, resourceManager, scrollOffset, canvasWidth, canvasHeight) {
        var ctx = this.ctx;
        var config = _getSoldierConfig();
        var names = (typeof RESOURCE_NAMES !== 'undefined') ? RESOURCE_NAMES : {};

        // 全屏深色背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 标题
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('训练', canvasWidth / 2, 15);

        // 返回按钮
        var backBtn = { x: 20, y: 15, width: 80, height: 36 };
        ctx.fillStyle = '#555555';
        ctx.fillRect(backBtn.x, backBtn.y, backBtn.width, backBtn.height);
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.strokeRect(backBtn.x, backBtn.y, backBtn.width, backBtn.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('返回', backBtn.x + backBtn.width / 2, backBtn.y + backBtn.height / 2);
        this._trainingBackBtn = backBtn;

        // 招募按钮区域
        var recruitBtnY = 65;
        var recruitBtnW = 200;
        var recruitBtnH = 44;
        var recruitBtnX = (canvasWidth - recruitBtnW) / 2;
        var canRecruit = soldierManager.canRecruit(resourceManager);

        ctx.fillStyle = canRecruit ? '#44aa44' : '#555555';
        ctx.fillRect(recruitBtnX, recruitBtnY, recruitBtnW, recruitBtnH);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.strokeRect(recruitBtnX, recruitBtnY, recruitBtnW, recruitBtnH);

        // 招募按钮文字
        ctx.fillStyle = canRecruit ? '#ffffff' : '#999999';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('招募士兵', recruitBtnX + recruitBtnW / 2, recruitBtnY + recruitBtnH / 2 - 8);

        // 费用信息
        var recruitCost = config.recruitCost;
        if (recruitCost) {
            var costKeys = Object.keys(recruitCost);
            var costText = '';
            for (var c = 0; c < costKeys.length; c++) {
                var rk = costKeys[c];
                if (c > 0) costText += '  ';
                costText += (names[rk] || rk) + ':' + recruitCost[rk];
            }
            ctx.fillStyle = resourceManager.hasEnough(recruitCost) ? '#cccccc' : '#ff4444';
            ctx.font = '12px sans-serif';
            ctx.fillText(costText, recruitBtnX + recruitBtnW / 2, recruitBtnY + recruitBtnH / 2 + 10);
        }

        this._trainingRecruitBtn = { x: recruitBtnX, y: recruitBtnY, width: recruitBtnW, height: recruitBtnH };

        // 士兵列表滚动区域
        var scrollX = 40;
        var scrollY = 125;
        var scrollWidth = canvasWidth - 80;
        var scrollHeight = canvasHeight - 140;

        var soldiers = soldierManager.getSoldiers();
        var entryHeight = 70;
        var entrySpacing = 8;
        var contentHeight = soldiers.length * (entryHeight + entrySpacing);

        var maxScroll = Math.max(0, contentHeight - scrollHeight);
        var actualScroll = Math.min(scrollOffset, maxScroll);

        // 存储进阶按钮位置
        this._trainingPromoteBtns = {};

        // 裁剪区域
        ctx.save();
        ctx.beginPath();
        ctx.rect(scrollX, scrollY, scrollWidth, scrollHeight);
        ctx.clip();

        var currentY = scrollY - actualScroll;
        var maxTier = config.maxTier || 10;

        for (var i = 0; i < soldiers.length; i++) {
            var soldier = soldiers[i];
            var sName = soldierManager.getTierName(soldier.tier);
            var isMaxTier = soldier.tier >= maxTier;

            // 条目背景
            ctx.fillStyle = '#2a2a3e';
            ctx.fillRect(scrollX, currentY, scrollWidth, entryHeight);
            ctx.strokeStyle = '#444466';
            ctx.lineWidth = 1;
            ctx.strokeRect(scrollX, currentY, scrollWidth, entryHeight);

            // 名称 + Tier
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(sName + '  [T' + soldier.tier + ']', scrollX + 10, currentY + 8);

            // 属性：ATK / DEF / HP
            ctx.fillStyle = '#cccccc';
            ctx.font = '13px sans-serif';
            ctx.fillText('ATK:' + soldier.attack + '  DEF:' + soldier.defense + '  HP:' + soldier.hp, scrollX + 10, currentY + 32);

            // 进阶费用提示
            if (!isMaxTier) {
                var nextTier = soldier.tier + 1;
                var pCost = config.promoteCosts && config.promoteCosts[nextTier];
                if (pCost) {
                    var pCostKeys = Object.keys(pCost);
                    var pCostText = '进阶费: ';
                    for (var pc = 0; pc < pCostKeys.length; pc++) {
                        var prk = pCostKeys[pc];
                        if (pc > 0) pCostText += '  ';
                        pCostText += (names[prk] || prk) + ':' + pCost[prk];
                    }
                    ctx.fillStyle = resourceManager.hasEnough(pCost) ? '#aaaaaa' : '#ff4444';
                    ctx.font = '11px sans-serif';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'top';
                    ctx.fillText(pCostText, scrollX + 10, currentY + 50);
                }
            }

            // 进阶按钮或满阶标记
            if (!isMaxTier) {
                var canDo = soldierManager.canPromote(i, resourceManager);
                var pBtnW = 70;
                var pBtnH = 32;
                var pBtnX = scrollX + scrollWidth - pBtnW - 15;
                var pBtnY = currentY + (entryHeight - pBtnH) / 2;

                ctx.fillStyle = canDo ? '#44aa44' : '#555555';
                ctx.fillRect(pBtnX, pBtnY, pBtnW, pBtnH);
                ctx.strokeStyle = '#333333';
                ctx.lineWidth = 1;
                ctx.strokeRect(pBtnX, pBtnY, pBtnW, pBtnH);
                ctx.fillStyle = canDo ? '#ffffff' : '#999999';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('进阶', pBtnX + pBtnW / 2, pBtnY + pBtnH / 2);

                var btnVisible = (currentY + entryHeight > scrollY) && (currentY < scrollY + scrollHeight);
                if (btnVisible) {
                    this._trainingPromoteBtns[i] = { x: pBtnX, y: pBtnY, width: pBtnW, height: pBtnH };
                }
            } else {
                // 满阶标记
                ctx.fillStyle = '#888888';
                ctx.font = '13px sans-serif';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText('满阶', scrollX + scrollWidth - 20, currentY + entryHeight / 2);
            }

            currentY += entryHeight + entrySpacing;
        }

        ctx.restore();

        // 绘制滚动条
        if (contentHeight > scrollHeight) {
            var scrollbarX = scrollX + scrollWidth + 5;
            var scrollbarWidth = 8;

            ctx.fillStyle = '#444444';
            ctx.fillRect(scrollbarX, scrollY, scrollbarWidth, scrollHeight);

            var thumbHeight = Math.max(20, scrollHeight * (scrollHeight / contentHeight));
            var thumbY = scrollY + (actualScroll / maxScroll) * (scrollHeight - thumbHeight);
            ctx.fillStyle = '#888888';
            ctx.fillRect(scrollbarX, thumbY, scrollbarWidth, thumbHeight);
        }
    }
};

// 页面管理器
var PageManager = {
    currentPage: 0,
    pageCount: 2,
    offsetX: 0,
    isDragging: false,
    isAnimating: false,
    dragStartX: 0,
    dragCurrentX: 0,
    _dragBaseOffset: 0,

    // 滚动偏移量
    castleScrollOffset: 0,
    kingdomScrollOffset: 0,

    // Building_Page 状态
    showBuildingPage: false,
    buildingScrollOffset: 0,

    // Training_Page 状态
    showTrainingPage: false,
    trainingScrollOffset: 0,

    // Promote_Dialog 状态（已废弃，保留兼容）

    // 动画相关
    animationStartTime: 0,
    animationStartOffset: 0,
    animationTargetOffset: 0,

    getTargetOffset: function(pageIndex, canvasWidth) {
        return -pageIndex * canvasWidth;
    },

    shouldSwitchPage: function(dragDistance, canvasWidth) {
        var config = (typeof OUTSIDE_CONFIG_EXTERNAL !== 'undefined' && OUTSIDE_CONFIG_EXTERNAL.pages)
            ? OUTSIDE_CONFIG_EXTERNAL.pages : { swipeThreshold: 0.3 };
        return Math.abs(dragDistance) >= canvasWidth * config.swipeThreshold;
    },

    openBuildingPage: function() {
        this.showBuildingPage = true;
        this.buildingScrollOffset = 0;
    },

    closeBuildingPage: function() {
        this.showBuildingPage = false;
    },

    handleBuildingScroll: function(delta) {
        this.buildingScrollOffset += delta;
        if (this.buildingScrollOffset < 0) this.buildingScrollOffset = 0;
    },

    openTrainingPage: function() {
        this.showTrainingPage = true;
        this.trainingScrollOffset = 0;
    },

    closeTrainingPage: function() {
        this.showTrainingPage = false;
    },

    handleTrainingScroll: function(delta) {
        this.trainingScrollOffset += delta;
        if (this.trainingScrollOffset < 0) this.trainingScrollOffset = 0;
    },

    startDrag: function(x) {
        if (this.isAnimating) return;
        if (this.showBuildingPage) return;
        if (this.showTrainingPage) return;
        this.isDragging = true;
        this.dragStartX = x;
        this.dragCurrentX = x;
        this._dragBaseOffset = this.offsetX;
    },

    updateDrag: function(x, canvasWidth) {
        if (!this.isDragging) return;
        this.dragCurrentX = x;
        var delta = x - this.dragStartX;
        var newOffset = this._dragBaseOffset + delta;
        // 边界限制：不超出第一页左边界（0）和最后一页右边界
        var minOffset = -(this.pageCount - 1) * canvasWidth;
        if (newOffset > 0) newOffset = 0;
        if (newOffset < minOffset) newOffset = minOffset;
        this.offsetX = newOffset;
    },

    endDrag: function(canvasWidth) {
        if (!this.isDragging) return;
        this.isDragging = false;
        var dragDistance = this.dragCurrentX - this.dragStartX;
        var targetPage = this.currentPage;

        if (this.shouldSwitchPage(dragDistance, canvasWidth)) {
            if (dragDistance < 0 && this.currentPage < this.pageCount - 1) {
                targetPage = this.currentPage + 1;
            } else if (dragDistance > 0 && this.currentPage > 0) {
                targetPage = this.currentPage - 1;
            }
        }

        // 启动动画到目标页面
        this.animationStartTime = 0;
        this.animationStartOffset = this.offsetX;
        this.animationTargetOffset = this.getTargetOffset(targetPage, canvasWidth);
        this.isAnimating = true;
        this._animationTargetPage = targetPage;
    },

    updateAnimation: function(now, canvasWidth) {
        if (!this.isAnimating) return;
        var config = (typeof OUTSIDE_CONFIG_EXTERNAL !== 'undefined' && OUTSIDE_CONFIG_EXTERNAL.pages)
            ? OUTSIDE_CONFIG_EXTERNAL.pages : { animationDuration: 300 };
        var duration = config.animationDuration;

        if (this.animationStartTime === 0) {
            this.animationStartTime = now;
        }

        var elapsed = now - this.animationStartTime;
        if (elapsed >= duration) {
            // 动画结束
            this.offsetX = this.animationTargetOffset;
            this.currentPage = this._animationTargetPage;
            this.isAnimating = false;
            this.animationStartTime = 0;
            return;
        }

        // easeOut 缓动：1 - (1 - t)^2
        var t = elapsed / duration;
        var ease = 1 - (1 - t) * (1 - t);
        this.offsetX = this.animationStartOffset + (this.animationTargetOffset - this.animationStartOffset) * ease;
    },

    handleScroll: function(page, delta) {
        // page: 0 = Castle, 1 = Kingdom
        // delta: 正数向下滚动，负数向上滚动
        if (page === 0) {
            this.castleScrollOffset += delta;
            // 限制滚动范围（不能滚动到负值）
            if (this.castleScrollOffset < 0) this.castleScrollOffset = 0;
        } else if (page === 1) {
            this.kingdomScrollOffset += delta;
            // 限制滚动范围（不能滚动到负值）
            if (this.kingdomScrollOffset < 0) this.kingdomScrollOffset = 0;
        }
    }
};

// 工匠管理器
var CraftsmanManager = {
    totalCapacity: 0,

    getAssigned: function() {
        // 从 JobManager.assignments 汇总所有岗位的已分配工匠数
        if (typeof JobManager === 'undefined' || !JobManager.assignments) {
            return 0;
        }
        var total = 0;
        var assignments = JobManager.assignments;
        for (var key in assignments) {
            if (assignments.hasOwnProperty(key)) {
                total += assignments[key];
            }
        }
        return total;
    },

    getAvailable: function() {
        return this.totalCapacity - this.getAssigned();
    },

    addCapacity: function(amount) {
        this.totalCapacity += amount;
    },

    canAssign: function() {
        return this.getAvailable() > 0;
    }
};

// 工作岗位管理器
var JobManager = {
    assignments: {},
    lastTickTime: 0,
    _config: null,

    init: function(jobConfig) {
        this._config = jobConfig;
        this.assignments = {};
        if (jobConfig && jobConfig.jobs) {
            var jobIds = Object.keys(jobConfig.jobs);
            for (var i = 0; i < jobIds.length; i++) {
                this.assignments[jobIds[i]] = 0;
            }
        }
        this.lastTickTime = 0;
    },

    assign: function(jobId) {
        if (!CraftsmanManager.canAssign()) return false;
        if (!(jobId in this.assignments)) return false;
        // 检查岗位是否已解锁
        if (!this.isJobUnlocked(jobId)) return false;
        this.assignments[jobId] += 1;
        return true;
    },

    unassign: function(jobId) {
        if (!(jobId in this.assignments)) return false;
        if (this.assignments[jobId] <= 0) return false;
        this.assignments[jobId] -= 1;
        return true;
    },

    /**
     * 检查岗位是否已解锁
     */
    isJobUnlocked: function(jobId) {
        var facCfg = (typeof FACILITY_CONFIG_EXTERNAL !== 'undefined') ? FACILITY_CONFIG_EXTERNAL : null;
        if (!facCfg) return true; // 无配置则全部解锁
        var pt = (typeof ProgressTracker !== 'undefined') ? ProgressTracker : null;
        if (!pt) return true;
        var unlocked = pt.getUnlockedJobs(facCfg);
        return unlocked.indexOf(jobId) !== -1;
    },

    /**
     * 获取已解锁的岗位 ID 列表
     */
    getUnlockedJobIds: function() {
        var config = this._config || (typeof JOB_CONFIG_EXTERNAL !== 'undefined' ? JOB_CONFIG_EXTERNAL : {});
        var allJobs = config.jobs || {};
        var allIds = Object.keys(allJobs);
        var result = [];
        for (var i = 0; i < allIds.length; i++) {
            if (this.isJobUnlocked(allIds[i])) {
                result.push(allIds[i]);
            }
        }
        return result;
    },

    getAssignments: function() {
        return this.assignments;
    },

    update: function(now, resourceManager) {
        if (!this._config) return;
        var interval = this._config.productionInterval || 15000;
        if (this.lastTickTime === 0) {
            this.lastTickTime = now;
            return;
        }
        while (now - this.lastTickTime >= interval) {
            this.lastTickTime += interval;
            var jobIds = Object.keys(this.assignments);
            for (var i = 0; i < jobIds.length; i++) {
                var jobId = jobIds[i];
                var workerCount = this.assignments[jobId];
                if (workerCount > 0) {
                    this.calculateProduction(jobId, workerCount, resourceManager);
                }
            }
        }
    },

    getRemainingSeconds: function(now) {
        var interval = (this._config && this._config.productionInterval) || 15000;
        if (this.lastTickTime === 0) {
            return Math.ceil(interval / 1000);
        }
        var elapsed = now - this.lastTickTime;
        var remaining = interval - elapsed;
        if (remaining <= 0) return Math.ceil(interval / 1000);
        return Math.ceil(remaining / 1000);
    },

    calculateProduction: function(jobId, workerCount, resourceManager) {
        if (!this._config || !this._config.jobs || !this._config.jobs[jobId]) return;
        var jobDef = this._config.jobs[jobId];
        var consumes = jobDef.consumes || {};
        var produces = jobDef.produces || {};

        var actualWorkers = workerCount;
        var consumeKeys = Object.keys(consumes);
        if (consumeKeys.length > 0) {
            for (var i = 0; i < consumeKeys.length; i++) {
                var resKey = consumeKeys[i];
                var costPerWorker = consumes[resKey];
                if (costPerWorker > 0) {
                    var available = resourceManager[resKey] || 0;
                    var maxWorkers = Math.floor(available / costPerWorker);
                    if (maxWorkers < actualWorkers) {
                        actualWorkers = maxWorkers;
                    }
                }
            }
        }

        if (actualWorkers <= 0) return;

        for (var i = 0; i < consumeKeys.length; i++) {
            var resKey = consumeKeys[i];
            resourceManager[resKey] -= consumes[resKey] * actualWorkers;
        }

        var produceKeys = Object.keys(produces);
        for (var i = 0; i < produceKeys.length; i++) {
            var resKey = produceKeys[i];
            resourceManager[resKey] = (resourceManager[resKey] || 0) + produces[resKey] * actualWorkers;
        }
    },

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
            // 直接按满负荷计算，不考虑当前资源限制
            var consumeKeys = Object.keys(consumes);
            for (var c = 0; c < consumeKeys.length; c++) {
                var resKey = consumeKeys[c];
                changes[resKey] = (changes[resKey] || 0) - consumes[resKey] * workerCount;
            }
            var produceKeys = Object.keys(produces);
            for (var p = 0; p < produceKeys.length; p++) {
                var resKey = produceKeys[p];
                changes[resKey] = (changes[resKey] || 0) + produces[resKey] * workerCount;
            }
        }
        return changes;
    }
};

// 建筑管理器
var BuildingManager = {
    buildCounts: {},
    _config: null,
    button: { x: 280, y: 200, width: 160, height: 60 },

    init: function(buildingConfig) {
        this._config = buildingConfig;
        this.buildCounts = {};
        if (buildingConfig) {
            var ids = Object.keys(buildingConfig);
            for (var i = 0; i < ids.length; i++) {
                this.buildCounts[ids[i]] = 0;
            }
        }
    },

    canBuild: function(buildingId, resourceManager) {
        if (!this._config || !this._config[buildingId]) return false;
        var cost = this._config[buildingId].cost || {};
        return resourceManager.hasEnough(cost);
    },

    build: function(buildingId, resourceManager, craftsmanManager) {
        if (!this.canBuild(buildingId, resourceManager)) return false;
        var building = this._config[buildingId];
        resourceManager.deduct(building.cost || {});
        if (building.effect && building.effect.craftsmanCapacity) {
            craftsmanManager.addCapacity(building.effect.craftsmanCapacity);
        }
        this.buildCounts[buildingId] = (this.buildCounts[buildingId] || 0) + 1;
        return true;
    },

    getBuildCounts: function() {
        return this.buildCounts;
    }
};

// 资源名称映射（从配置生成）
var RESOURCE_NAMES = (function() {
    var cfg = (typeof RESOURCE_CONFIG_EXTERNAL !== 'undefined' && RESOURCE_CONFIG_EXTERNAL.resources)
        ? RESOURCE_CONFIG_EXTERNAL.resources : {};
    var names = {};
    var keys = Object.keys(cfg);
    for (var i = 0; i < keys.length; i++) {
        names[keys[i]] = cfg[keys[i]].name || keys[i];
    }
    return names;
})();

// Toast 管理器
var ToastManager = {
    toasts: [],
    _defaults: { speed: 30, duration: 2000, fontSize: 20, spacing: 28 },

    getConfig: function() {
        var ext = (typeof OUTSIDE_CONFIG_EXTERNAL !== 'undefined' && OUTSIDE_CONFIG_EXTERNAL.toast)
            ? OUTSIDE_CONFIG_EXTERNAL.toast : {};
        return {
            speed: (typeof ext.speed === 'number') ? ext.speed : this._defaults.speed,
            duration: (typeof ext.duration === 'number') ? ext.duration : this._defaults.duration,
            fontSize: (typeof ext.fontSize === 'number') ? ext.fontSize : this._defaults.fontSize,
            spacing: (typeof ext.spacing === 'number') ? ext.spacing : this._defaults.spacing
        };
    },

    addToast: function(type, amount, resourceName, canvasWidth, canvasHeight) {
        if (amount === 0) return;
        var config = this.getConfig();
        var text = (type === 'gain' ? '+' : '-') + amount + ' ' + resourceName;
        var color = (type === 'gain') ? '#00ff00' : '#ff4444';
        var startY = canvasHeight / 2;

        // 多条 Toast 向下堆叠
        if (this.toasts.length > 0) {
            var last = this.toasts[this.toasts.length - 1];
            startY = last.startY + config.spacing;
        }

        this.toasts.push({
            text: text,
            color: color,
            x: canvasWidth / 2,
            startY: startY,
            y: startY,
            opacity: 1,
            elapsed: 0
        });
    },

    addResourceToasts: function(changes, canvasWidth, canvasHeight) {
        var keys = Object.keys(changes);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var delta = changes[key];
            if (delta === 0) continue;
            var name = RESOURCE_NAMES[key] || key;
            var type = (delta > 0) ? 'gain' : 'consume';
            this.addToast(type, Math.abs(delta), name, canvasWidth, canvasHeight);
        }
    },

    update: function(deltaTime) {
        var config = this.getConfig();
        var remaining = [];
        for (var i = 0; i < this.toasts.length; i++) {
            var t = this.toasts[i];
            t.elapsed += deltaTime;
            t.y = t.startY + config.speed * t.elapsed / 1000;
            t.opacity = Math.max(0, 1 - t.elapsed / config.duration);
            if (t.opacity > 0) {
                remaining.push(t);
            }
        }
        this.toasts = remaining;
    },

    render: function(ctx) {
        var config = this.getConfig();
        for (var i = 0; i < this.toasts.length; i++) {
            var t = this.toasts[i];
            ctx.save();
            ctx.globalAlpha = t.opacity;
            ctx.fillStyle = t.color;
            ctx.font = config.fontSize + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(t.text, t.x, t.y);
            ctx.restore();
        }
    }
};

// 获取士兵配置
function _getSoldierConfig() {
    return (typeof SOLDIER_CONFIG_EXTERNAL !== 'undefined') ? SOLDIER_CONFIG_EXTERNAL : {};
}

// 士兵管理器（10阶线性进阶体系）
var SoldierManager = {
    soldiers: [],

    recruit: function(resourceManager) {
        var config = _getSoldierConfig();
        if (!config.recruitCost || !config.tiers || !config.tiers[1]) return false;
        if (!resourceManager.hasEnough(config.recruitCost)) return false;
        resourceManager.deduct(config.recruitCost);
        var t1 = config.tiers[1];
        var soldier = {
            tier: 1,
            attack: t1.attack,
            defense: t1.defense,
            hp: t1.hp,
            speed: t1.speed || 10
        };
        this.soldiers.push(soldier);
        return true;
    },

    promote: function(soldierIndex, resourceManager) {
        if (soldierIndex < 0 || soldierIndex >= this.soldiers.length) return false;
        var soldier = this.soldiers[soldierIndex];
        var config = _getSoldierConfig();
        var nextTier = soldier.tier + 1;
        if (nextTier > (config.maxTier || 10)) return false;
        var cost = config.promoteCosts && config.promoteCosts[nextTier];
        if (!cost) return false;
        if (!resourceManager.hasEnough(cost)) return false;
        resourceManager.deduct(cost);
        var tierDef = config.tiers && config.tiers[nextTier];
        if (!tierDef) return false;
        soldier.tier = nextTier;
        soldier.attack = tierDef.attack;
        soldier.defense = tierDef.defense;
        soldier.hp = tierDef.hp;
        soldier.speed = tierDef.speed || 10;
        return true;
    },

    getSoldiers: function() {
        return this.soldiers;
    },

    canRecruit: function(resourceManager) {
        var config = _getSoldierConfig();
        if (!config.recruitCost) return false;
        return resourceManager.hasEnough(config.recruitCost);
    },

    canPromote: function(soldierIndex, resourceManager) {
        if (soldierIndex < 0 || soldierIndex >= this.soldiers.length) return false;
        var soldier = this.soldiers[soldierIndex];
        var config = _getSoldierConfig();
        var nextTier = soldier.tier + 1;
        if (nextTier > (config.maxTier || 10)) return false;
        var cost = config.promoteCosts && config.promoteCosts[nextTier];
        if (!cost) return false;
        return resourceManager.hasEnough(cost);
    },

    getTierName: function(tier) {
        var config = _getSoldierConfig();
        var tierDef = config.tiers && config.tiers[tier];
        return tierDef ? tierDef.name : (tier + '阶士兵');
    }
};

// 模块导出（Node.js 环境下用于测试）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        randomInt: randomInt,
        ResourceManager: ResourceManager,
        ButtonManager: ButtonManager,
        SaveSystem: SaveSystem,
        CanvasRenderer: CanvasRenderer,
        InputHandler: InputHandler,
        PageManager: PageManager,
        CraftsmanManager: CraftsmanManager,
        JobManager: JobManager,
        BuildingManager: BuildingManager,
        RESOURCE_NAMES: RESOURCE_NAMES,
        ToastManager: ToastManager,
        SoldierManager: SoldierManager
    };
}
