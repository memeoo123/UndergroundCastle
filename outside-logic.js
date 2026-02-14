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

    save: function(resources, craftsman, jobs, buildings) {
        try {
            var cfg = _getResourceConfig();
            var data = {};
            var resKeys = Object.keys(cfg);
            for (var i = 0; i < resKeys.length; i++) {
                data[resKeys[i]] = resources[resKeys[i]] || 0;
            }
            if (craftsman) {
                data.craftsman = { totalCapacity: craftsman.totalCapacity || 0 };
            }
            if (jobs) {
                data.jobs = {};
                var jobKeys = Object.keys(jobs);
                for (var i = 0; i < jobKeys.length; i++) {
                    data.jobs[jobKeys[i]] = jobs[jobKeys[i]];
                }
            }
            if (buildings) {
                data.buildings = {};
                var bKeys = Object.keys(buildings);
                for (var i = 0; i < bKeys.length; i++) {
                    data.buildings[bKeys[i]] = buildings[bKeys[i]];
                }
            }
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            // QuotaExceededError 或其他异常，静默处理，游戏继续运行
        }
    },

    load: function() {
        var cfg = _getResourceConfig();
        var defaults = { craftsman: { totalCapacity: 0 }, jobs: {}, buildings: {} };
        var resKeys = Object.keys(cfg);
        for (var i = 0; i < resKeys.length; i++) {
            defaults[resKeys[i]] = cfg[resKeys[i]].initial || 0;
        }
        try {
            var data = localStorage.getItem(this.STORAGE_KEY);
            if (data === null) return defaults;
            var parsed = JSON.parse(data);
            var result = {};
            for (var i = 0; i < resKeys.length; i++) {
                var key = resKeys[i];
                result[key] = (typeof parsed[key] === 'number') ? parsed[key] : (cfg[key].initial || 0);
            }
            // 恢复工匠数据
            if (parsed.craftsman && typeof parsed.craftsman === 'object') {
                result.craftsman = {
                    totalCapacity: (typeof parsed.craftsman.totalCapacity === 'number') ? parsed.craftsman.totalCapacity : 0
                };
            } else {
                result.craftsman = { totalCapacity: 0 };
            }
            // 恢复岗位分配数据
            if (parsed.jobs && typeof parsed.jobs === 'object') {
                result.jobs = {};
                var jobKeys = Object.keys(parsed.jobs);
                for (var i = 0; i < jobKeys.length; i++) {
                    result.jobs[jobKeys[i]] = (typeof parsed.jobs[jobKeys[i]] === 'number') ? parsed.jobs[jobKeys[i]] : 0;
                }
            } else {
                result.jobs = {};
            }
            // 恢复建筑数据
            if (parsed.buildings && typeof parsed.buildings === 'object') {
                result.buildings = {};
                var bKeys = Object.keys(parsed.buildings);
                for (var i = 0; i < bKeys.length; i++) {
                    result.buildings[bKeys[i]] = (typeof parsed.buildings[bKeys[i]] === 'number') ? parsed.buildings[bKeys[i]] : 0;
                }
            } else {
                result.buildings = {};
            }
            return result;
        } catch (e) {
            return defaults;
        }
    }
};

// 输入处理器
var InputHandler = {
    _DRAG_THRESHOLD: 5,

    init: function(canvas, buttonManager, pageManager, buildingManager, jobManager, craftsmanManager) {
        var self = this;
        var startX = 0;
        var startY = 0;
        var isDown = false;

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

        function onDown(e) {
            e.preventDefault();
            var pos = getPos(e);
            startX = pos.x;
            startY = pos.y;
            isDown = true;
            if (pageManager) {
                pageManager.startDrag(pos.x);
            }
        }

        function onMove(e) {
            if (!isDown) return;
            e.preventDefault();
            var pos = getPos(e);
            if (pageManager && pageManager.isDragging) {
                pageManager.updateDrag(pos.x, canvas.width);
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
                    var page = pageManager.currentPage;
                    if (page === 0) {
                        // Castle_Page: 响应炼金按钮、建造按钮
                        var alchemy = buttonManager.buttons.alchemy;
                        if (buttonManager.isPointInButton(pos.x, pos.y, alchemy)) {
                            if (!buttonManager.isInCooldown('alchemy', now)) {
                                alchemy.onClick(now);
                            }
                            return;
                        }

                        // 检测 Build_Button 点击
                        if (buildingManager && craftsmanManager) {
                            var btn = buildingManager.button;
                            if (isPointInRect(pos.x, pos.y, btn)) {
                                buildingManager.build('dormitory', ResourceManager, craftsmanManager);
                                return;
                            }
                        }
                    } else if (page === 1) {
                        // Kingdom_Page: 响应收集按钮、岗位 +/- 按钮
                        var collect = buttonManager.buttons.collect;
                        if (buttonManager.isPointInButton(pos.x, pos.y, collect)) {
                            if (!buttonManager.isInCooldown('collect', now)) {
                                collect.onClick(now);
                            }
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
                                    return;
                                }
                                if (btns.minus && isPointInRect(pos.x, pos.y, btns.minus)) {
                                    jobManager.unassign(jobId);
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
                if (pageManager) {
                    pageManager.endDrag(canvas.width);
                }
            }
        }

        // Mouse events
        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseup', onUp);

        // Touch events
        canvas.addEventListener('touchstart', onDown, { passive: false });
        canvas.addEventListener('touchmove', onMove, { passive: false });
        canvas.addEventListener('touchend', onUp, { passive: false });
    }
};

// Canvas 渲染器
var CanvasRenderer = {
    ctx: null,

    init: function(canvas) {
        this.ctx = canvas.getContext('2d');
    },

    render: function(resourceManager, buttonManager, pageManager, now, craftsmanManager, jobManager, buildingManager) {
        var ctx = this.ctx;
        var canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        this.drawCastlePage(ox, resourceManager, buttonManager, now, craftsmanManager, jobManager, buildingManager);
        this.drawKingdomPage(ox + canvas.width, resourceManager, buttonManager, now, craftsmanManager, jobManager);

        ctx.restore();
    },

    drawCastlePage: function(offsetX, resourceManager, buttonManager, now, craftsmanManager, jobManager, buildingManager) {
        this.drawPageTitle('地下城堡', offsetX);
        this.drawButton(buttonManager.buttons.alchemy, '炼金', offsetX, now);
        this.drawResources(resourceManager.getResources(), offsetX);

        // 渲染建造按钮（位于炼金按钮下方）
        if (buildingManager) {
            this.drawBuildButton(buildingManager, resourceManager, offsetX);
        }
    },

    drawKingdomPage: function(offsetX, resourceManager, buttonManager, now, craftsmanManager, jobManager) {
        this.drawPageTitle('地下王国', offsetX);
        this.drawButton(buttonManager.buttons.collect, '收集', offsetX, now);
        this.drawResources(resourceManager.getResources(), offsetX);

        // 渲染工匠状态和岗位列表
        if (craftsmanManager && jobManager) {
            this.drawCraftsmanStatus(craftsmanManager, offsetX);
            this.drawProductionCountdown(jobManager, now, offsetX);
            this.drawJobList(jobManager, craftsmanManager, offsetX);
            this.drawProductionPreview(jobManager, resourceManager, offsetX);
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
        var config = (typeof JOB_CONFIG_EXTERNAL !== 'undefined') ? JOB_CONFIG_EXTERNAL : {};
        var dormName = (config.buildings && config.buildings.dormitory) ? config.buildings.dormitory.name : '宿舍';
        ctx.fillText('建造 ' + dormName, bx + btn.width / 2, btn.y + btn.height / 2);
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
        var jobIds = Object.keys(jobs);
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

    startDrag: function(x) {
        if (this.isAnimating) return;
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
        this.assignments[jobId] += 1;
        return true;
    },

    unassign: function(jobId) {
        if (!(jobId in this.assignments)) return false;
        if (this.assignments[jobId] <= 0) return false;
        this.assignments[jobId] -= 1;
        return true;
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
            var actualWorkers = workerCount;
            var consumeKeys = Object.keys(consumes);
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
            for (var c = 0; c < consumeKeys.length; c++) {
                var resKey = consumeKeys[c];
                changes[resKey] = (changes[resKey] || 0) - consumes[resKey] * actualWorkers;
            }
            var produceKeys = Object.keys(produces);
            for (var p = 0; p < produceKeys.length; p++) {
                var resKey = produceKeys[p];
                changes[resKey] = (changes[resKey] || 0) + produces[resKey] * actualWorkers;
            }
        }
        return changes;
    }
};

// 建筑管理器
var BuildingManager = {
    buildCounts: {},
    _config: null,
    button: { x: 100, y: 280, width: 160, height: 60 },

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
        ToastManager: ToastManager
    };
}
