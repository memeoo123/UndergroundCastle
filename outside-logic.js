// outside-logic.js — 关外经营系统核心逻辑

// 工具函数：生成 [min, max] 范围内的随机整数
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 资源管理器
var ResourceManager = {
    gold: 0,
    stone: 0,
    wood: 0,

    addGold: function(amount) {
        this.gold += amount;
    },
    addStone: function(amount) {
        this.stone += amount;
    },
    addWood: function(amount) {
        this.wood += amount;
    },
    getResources: function() {
        return { gold: this.gold, stone: this.stone, wood: this.wood };
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
                ResourceManager.addGold(config.alchemy.goldAmount);
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
                ResourceManager.addStone(stoneAmount);
                ResourceManager.addWood(woodAmount);
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

    save: function(resources) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(resources));
        } catch (e) {
            // QuotaExceededError 或其他异常，静默处理，游戏继续运行
        }
    },

    load: function() {
        var defaults = { gold: 0, stone: 0, wood: 0 };
        try {
            var data = localStorage.getItem(this.STORAGE_KEY);
            if (data === null) return defaults;
            var parsed = JSON.parse(data);
            return {
                gold: (typeof parsed.gold === 'number') ? parsed.gold : 0,
                stone: (typeof parsed.stone === 'number') ? parsed.stone : 0,
                wood: (typeof parsed.wood === 'number') ? parsed.wood : 0
            };
        } catch (e) {
            return defaults;
        }
    }
};

// 输入处理器
var InputHandler = {
    init: function(canvas, buttonManager) {
        canvas.addEventListener('click', function(e) {
            var rect = canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            buttonManager.handleClick(x, y, performance.now());
        });
    }
};

// Canvas 渲染器
var CanvasRenderer = {
    ctx: null,

    init: function(canvas) {
        this.ctx = canvas.getContext('2d');
    },

    render: function(resourceManager, buttonManager, now) {
        var ctx = this.ctx;
        var canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制背景
        ctx.fillStyle = '#2d5a27';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制资源显示
        this.drawResources(resourceManager.getResources());

        // 绘制按钮
        this.drawButton(buttonManager.buttons.alchemy, '炼金', now);
        this.drawButton(buttonManager.buttons.collect, '收集', now);
    },

    drawButton: function(button, label, now) {
        var ctx = this.ctx;
        var inCooldown = now < button.cooldownEnd;

        // 按钮背景
        ctx.fillStyle = inCooldown ? '#888888' : '#c8a23c';
        ctx.fillRect(button.x, button.y, button.width, button.height);

        // 按钮边框
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.strokeRect(button.x, button.y, button.width, button.height);

        // 按钮文字
        ctx.fillStyle = inCooldown ? '#cccccc' : '#ffffff';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, button.x + button.width / 2, button.y + button.height / 2);

        // 冷却覆盖层
        if (inCooldown) {
            this.drawCooldown(button, now);
        }
    },

    drawResources: function(resources) {
        var ctx = this.ctx;
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        var startX = 100;
        var startY = 50;
        ctx.fillText('金币: ' + resources.gold, startX, startY);
        ctx.fillText('石头: ' + resources.stone, startX, startY + 30);
        ctx.fillText('木头: ' + resources.wood, startX, startY + 60);
    },

    drawCooldown: function(button, now) {
        var ctx = this.ctx;
        var remaining = button.cooldownEnd - now;
        if (remaining <= 0) return;
        var seconds = Math.ceil(remaining / 1000);

        // 半透明覆盖层
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(button.x, button.y, button.width, button.height);

        // 倒计时文字
        ctx.fillStyle = '#ff6666';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(seconds + 's', button.x + button.width / 2, button.y + button.height / 2 + 20);
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
        InputHandler: InputHandler
    };
}
