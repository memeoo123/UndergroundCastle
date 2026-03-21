// inside-logic.js — 关内探险核心逻辑

// ============================================================
// ConfigLoader（配置加载器）
// ============================================================
var ConfigLoader = {
    dungeonConfig: null,
    monsterConfig: null,
    bossConfig: null,
    combatConfig: null,

    // 默认配置（配置缺失时回退）
    _defaults: {
        dungeon: {
            mapWidth: 50,
            mapHeight: 50,
            viewRange: 2,
            maxPartySize: 4,
            entrance: { x: 25, y: 25 },
            layers: {
                1: {
                    name: '未知地牢',
                    wallDensity: 0.3,
                    monsterDensity: 0.05,
                    treasureDensity: 0.02,
                    monsterPool: ['slime'],
                    treasurePool: [
                        { items: [{ resource: 'gold', min: 1, max: 5 }], weight: 1 }
                    ],
                    bossId: 'goblin_king'
                }
            }
        },
        monster: {
            monsters: {
                slime: {
                    name: '史莱姆',
                    tier: 1,
                    stats: { hp: 320, attack: 54, defense: 20, speed: 8 },
                    skills: ['basic_attack'],
                    rewards: { gold: { min: 3, max: 8 }, exp: 10 }
                }
            }
        },
        boss: {
            bosses: {
                goblin_king: {
                    name: '哥布林王',
                    tier: 1,
                    stats: { hp: 800, attack: 54, defense: 20, speed: 10 },
                    skills: ['basic_attack', 'power_strike', 'war_cry'],
                    rewards: { gold: { min: 20, max: 50 }, exp: 50, items: [{ resource: 'iron', amount: 3 }] }
                }
            }
        },
        combat: {
            damageFormula: { type: 'subtraction', D_min: 1, skillMultiplierDefault: 1.0 },
            atb: { atb_max: 10000, speed_baseline: 10, atb_speed_factor: 1000 },
            skills: {
                basic_attack: {
                    name: '普通攻击',
                    type: 'physical',
                    multiplier: 1.0,
                    cooldown: 0
                }
            },
            statusEffects: {}
        }
    },

    loadAll: function() {
        this.dungeonConfig = (typeof DUNGEON_CONFIG_EXTERNAL !== 'undefined' && DUNGEON_CONFIG_EXTERNAL)
            ? DUNGEON_CONFIG_EXTERNAL : this._defaults.dungeon;
        this.monsterConfig = (typeof MONSTER_CONFIG_EXTERNAL !== 'undefined' && MONSTER_CONFIG_EXTERNAL)
            ? MONSTER_CONFIG_EXTERNAL : this._defaults.monster;
        this.bossConfig = (typeof BOSS_CONFIG_EXTERNAL !== 'undefined' && BOSS_CONFIG_EXTERNAL)
            ? BOSS_CONFIG_EXTERNAL : this._defaults.boss;
        this.combatConfig = (typeof COMBAT_CONFIG_EXTERNAL !== 'undefined' && COMBAT_CONFIG_EXTERNAL)
            ? COMBAT_CONFIG_EXTERNAL : this._defaults.combat;
    },

    getDungeonLayer: function(layerId) {
        if (!this.dungeonConfig) this.loadAll();
        var layers = this.dungeonConfig.layers || this._defaults.dungeon.layers;
        return layers[layerId] || null;
    },

    getMonster: function(monsterId) {
        if (!this.monsterConfig) this.loadAll();
        var monsters = this.monsterConfig.monsters || this._defaults.monster.monsters;
        return monsters[monsterId] || null;
    },

    getBoss: function(bossId) {
        if (!this.bossConfig) this.loadAll();
        var bosses = this.bossConfig.bosses || this._defaults.boss.bosses;
        return bosses[bossId] || null;
    },

    getSkill: function(skillId) {
        if (!this.combatConfig) this.loadAll();
        var skills = this.combatConfig.skills || this._defaults.combat.skills;
        return skills[skillId] || null;
    },

    getMapWidth: function() {
        if (!this.dungeonConfig) this.loadAll();
        return this.dungeonConfig.mapWidth || this._defaults.dungeon.mapWidth;
    },

    getMapHeight: function() {
        if (!this.dungeonConfig) this.loadAll();
        return this.dungeonConfig.mapHeight || this._defaults.dungeon.mapHeight;
    },

    getViewRange: function() {
        if (!this.dungeonConfig) this.loadAll();
        return this.dungeonConfig.viewRange || this._defaults.dungeon.viewRange;
    },

    getMaxPartySize: function() {
        if (!this.dungeonConfig) this.loadAll();
        return this.dungeonConfig.maxPartySize || this._defaults.dungeon.maxPartySize;
    },

    /**
     * 根据选择的层级获取最大上阵人数
     * 遍历 partySizeByLayer 配置，找到 <= layerId 的最大阈值对应的 size
     * @param {number} layerId
     * @returns {number}
     */
    getMaxPartySizeForLayer: function(layerId) {
        if (!this.dungeonConfig) this.loadAll();
        var table = this.dungeonConfig.partySizeByLayer;
        if (!table || !Array.isArray(table) || table.length === 0) {
            return this.getMaxPartySize();
        }
        var result = table[0].size || 1;
        for (var i = 0; i < table.length; i++) {
            if (layerId >= table[i].layer) {
                result = table[i].size;
            }
        }
        return result;
    },

    getEntrance: function() {
        if (!this.dungeonConfig) this.loadAll();
        return this.dungeonConfig.entrance || this._defaults.dungeon.entrance;
    },

    getDamageFormula: function() {
        if (!this.combatConfig) this.loadAll();
        return this.combatConfig.damageFormula || this._defaults.combat.damageFormula;
    },

    getStatusEffect: function(effectId) {
        if (!this.combatConfig) this.loadAll();
        var effects = this.combatConfig.statusEffects || this._defaults.combat.statusEffects;
        return effects[effectId] || null;
    },

    /**
     * 判断指定层级是否为资源层（固定层）
     * 资源层每5层出现一次：第5层、第10层、第15层……
     * @param {number} layerId
     * @returns {boolean}
     */
    isResourceLayer: function(layerId) {
        if (!this.dungeonConfig) this.loadAll();
        // 优先使用配置中的判断方法
        if (this.dungeonConfig.isResourceLayer) {
            return this.dungeonConfig.isResourceLayer(layerId);
        }
        // 默认：每5层为资源层
        return layerId > 0 && layerId % 5 === 0;
    },

    /**
     * 获取资源层配置
     * @param {number} layerId
     * @returns {object|null}
     */
    getResourceLayer: function(layerId) {
        if (!this.dungeonConfig) this.loadAll();
        if (this.dungeonConfig.getResourceLayer) {
            return this.dungeonConfig.getResourceLayer(layerId);
        }
        var rl = this.dungeonConfig.resourceLayers;
        if (rl) return rl[layerId] || null;
        return null;
    }
};


// ============================================================
// DungeonMap（地牢地图）
// ============================================================
var DungeonMap = {
    width: 50,
    height: 50,
    tiles: [],       // [y][x]
    entrance: { x: 25, y: 25 },
    portalPos: null,
    bossPos: null,  // 兼容旧引用，指向 portalPos

    init: function(layerId, config) {
        config = config || ConfigLoader;
        // 检查是否为资源层
        if (config.isResourceLayer && config.isResourceLayer(layerId)) {
            var rlCfg = config.getResourceLayer(layerId);
            if (rlCfg) {
                this.initResourceLayer(rlCfg);
                return;
            }
        }
        this.width = config.getMapWidth();
        this.height = config.getMapHeight();
        this.entrance = config.getEntrance();
        var layerCfg = config.getDungeonLayer(layerId);
        if (!layerCfg) layerCfg = config._defaults.dungeon.layers[1];
        this._generate(layerCfg);
    },

    /**
     * 初始化资源层（固定布局地图）
     * @param {object} rlCfg - 资源层配置 { mapWidth, mapHeight, entrance, facilities, walls }
     */
    initResourceLayer: function(rlCfg) {
        var w = rlCfg.mapWidth || 20;
        var h = rlCfg.mapHeight || 20;
        var entrance = rlCfg.entrance || { x: Math.floor(w / 2), y: Math.floor(h / 2) };

        this.width = w;
        this.height = h;
        this.entrance = { x: entrance.x, y: entrance.y };
        this.portalPos = null;
        this.bossPos = null;

        // 初始化全空地图
        this.tiles = [];
        for (var y = 0; y < h; y++) {
            this.tiles[y] = [];
            for (var x = 0; x < w; x++) {
                this.tiles[y][x] = { type: 'empty', content: null, explored: false };
            }
        }

        // 设置入口
        this.tiles[entrance.y][entrance.x].type = 'entrance';

        // 放置固定墙壁
        var walls = rlCfg.walls || [];
        for (var i = 0; i < walls.length; i++) {
            var wx = walls[i].x, wy = walls[i].y;
            if (this.isInBounds(wx, wy) && !(wx === entrance.x && wy === entrance.y)) {
                this.tiles[wy][wx].type = 'wall';
            }
        }

        // 放置矿产设施
        var facilities = rlCfg.facilities || [];
        for (var i = 0; i < facilities.length; i++) {
            var f = facilities[i];
            if (this.isInBounds(f.x, f.y) && this.tiles[f.y][f.x].type !== 'wall' && !(f.x === entrance.x && f.y === entrance.y)) {
                this.tiles[f.y][f.x].content = {
                    type: 'facility',
                    facilityType: f.type,
                    name: f.name,
                    resource: f.resource,
                    amount: f.amount,
                    collected: false
                };
            }
        }
    },

    _generate: function(layerCfg) {
        var w = this.width, h = this.height;
        var ex = this.entrance.x, ey = this.entrance.y;

        // Step 1: 初始化全空地图
        this.tiles = [];
        for (var y = 0; y < h; y++) {
            this.tiles[y] = [];
            for (var x = 0; x < w; x++) {
                this.tiles[y][x] = { type: 'empty', content: null, explored: false };
            }
        }

        // Step 2: 设置入口
        this.tiles[ey][ex].type = 'entrance';

        // Step 3: 随机放置墙壁
        var wallDensity = layerCfg.wallDensity || 0.3;
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                // 入口周围 3x3 安全区不放墙壁
                if (Math.abs(x - ex) <= 1 && Math.abs(y - ey) <= 1) continue;
                if (this.tiles[y][x].type === 'entrance') continue;
                if (Math.random() < wallDensity) {
                    this.tiles[y][x].type = 'wall';
                }
            }
        }

        // Step 4: BFS 连通性检查，移除不可达区域的墙壁
        var reachable = this._bfs(ex, ey);
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                if (!reachable[y][x] && this.tiles[y][x].type === 'wall') {
                    this.tiles[y][x].type = 'empty';
                }
            }
        }
        // 重新 BFS 确保全图连通
        reachable = this._bfs(ex, ey);

        // Step 5: 找距入口最远的可达位置放传送阵（portal）
        var maxDist = 0;
        var portalX = ex, portalY = ey;
        var dist = this._bfsDist(ex, ey);
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                if (reachable[y][x] && dist[y][x] > maxDist && this.tiles[y][x].type === 'empty') {
                    maxDist = dist[y][x];
                    portalX = x;
                    portalY = y;
                }
            }
        }
        this.tiles[portalY][portalX].type = 'portal';
        this.tiles[portalY][portalX].content = { type: 'portal', bossId: layerCfg.bossId };
        this.portalPos = { x: portalX, y: portalY };
        this.bossPos = this.portalPos;  // 兼容旧引用

        // Step 6: 在可达空地上放置怪物
        var monsterDensity = layerCfg.monsterDensity || 0.05;
        var monsterPool = layerCfg.monsterPool || ['slime'];
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                if (!reachable[y][x]) continue;
                if (this.tiles[y][x].type !== 'empty') continue;
                if (this.tiles[y][x].content !== null) continue;
                // 入口周围 3x3 安全区不放怪物
                if (Math.abs(x - ex) <= 1 && Math.abs(y - ey) <= 1) continue;
                if (Math.random() < monsterDensity) {
                    var mid = monsterPool[Math.floor(Math.random() * monsterPool.length)];
                    this.tiles[y][x].content = { type: 'monster', monsterId: mid };
                }
            }
        }

        // Step 7: 在可达空地上放置宝藏
        var treasureDensity = layerCfg.treasureDensity || 0.02;
        var treasurePool = layerCfg.treasurePool || [];
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                if (!reachable[y][x]) continue;
                if (this.tiles[y][x].type !== 'empty') continue;
                if (this.tiles[y][x].content !== null) continue;
                if (Math.abs(x - ex) <= 1 && Math.abs(y - ey) <= 1) continue;
                if (Math.random() < treasureDensity) {
                    var treasure = this._pickTreasure(treasurePool);
                    this.tiles[y][x].content = { type: 'treasure', items: treasure };
                }
            }
        }
    },

    _pickTreasure: function(pool) {
        if (!pool || pool.length === 0) return [];
        var totalWeight = 0;
        for (var i = 0; i < pool.length; i++) totalWeight += (pool[i].weight || 1);
        var roll = Math.random() * totalWeight;
        var cumulative = 0;
        for (var i = 0; i < pool.length; i++) {
            cumulative += (pool[i].weight || 1);
            if (roll < cumulative) {
                // 生成具体数量
                var items = [];
                for (var j = 0; j < pool[i].items.length; j++) {
                    var item = pool[i].items[j];
                    var amount = Math.floor(Math.random() * (item.max - item.min + 1)) + item.min;
                    items.push({ resource: item.resource, amount: amount });
                }
                return items;
            }
        }
        return [];
    },

    _bfs: function(startX, startY) {
        var w = this.width, h = this.height;
        var visited = [];
        for (var y = 0; y < h; y++) {
            visited[y] = [];
            for (var x = 0; x < w; x++) visited[y][x] = false;
        }
        var queue = [{ x: startX, y: startY }];
        visited[startY][startX] = true;
        var dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
        while (queue.length > 0) {
            var cur = queue.shift();
            for (var d = 0; d < dirs.length; d++) {
                var nx = cur.x + dirs[d].dx;
                var ny = cur.y + dirs[d].dy;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[ny][nx] && this.tiles[ny][nx].type !== 'wall') {
                    visited[ny][nx] = true;
                    queue.push({ x: nx, y: ny });
                }
            }
        }
        return visited;
    },

    _bfsDist: function(startX, startY) {
        var w = this.width, h = this.height;
        var dist = [];
        for (var y = 0; y < h; y++) {
            dist[y] = [];
            for (var x = 0; x < w; x++) dist[y][x] = -1;
        }
        dist[startY][startX] = 0;
        var queue = [{ x: startX, y: startY }];
        var dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
        while (queue.length > 0) {
            var cur = queue.shift();
            for (var d = 0; d < dirs.length; d++) {
                var nx = cur.x + dirs[d].dx;
                var ny = cur.y + dirs[d].dy;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h && dist[ny][nx] === -1 && this.tiles[ny][nx].type !== 'wall') {
                    dist[ny][nx] = dist[cur.y][cur.x] + 1;
                    queue.push({ x: nx, y: ny });
                }
            }
        }
        return dist;
    },

    getTile: function(x, y) {
        if (!this.isInBounds(x, y)) return null;
        return this.tiles[y][x];
    },

    setExplored: function(x, y) {
        if (this.isInBounds(x, y)) {
            this.tiles[y][x].explored = true;
        }
    },

    isInBounds: function(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    },

    getAdjacentTiles: function(x, y) {
        var result = [];
        var dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
        for (var d = 0; d < dirs.length; d++) {
            var nx = x + dirs[d].dx;
            var ny = y + dirs[d].dy;
            if (this.isInBounds(nx, ny)) {
                result.push({ x: nx, y: ny, tile: this.tiles[ny][nx] });
            }
        }
        return result;
    }
};


// ============================================================
// FogOfWar（迷雾战争）
// ============================================================
var FogOfWar = {
    revealed: [],  // [y][x] boolean
    width: 0,
    height: 0,

    init: function(width, height) {
        this.width = width;
        this.height = height;
        this.revealed = [];
        for (var y = 0; y < height; y++) {
            this.revealed[y] = [];
            for (var x = 0; x < width; x++) {
                this.revealed[y][x] = false;
            }
        }
    },

    reveal: function(centerX, centerY, range) {
        // 点亮以 center 为中心、曼哈顿距离 ≤ range 的正方形区域
        for (var dy = -range; dy <= range; dy++) {
            for (var dx = -range; dx <= range; dx++) {
                var nx = centerX + dx;
                var ny = centerY + dy;
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    this.revealed[ny][nx] = true;
                }
            }
        }
    },

    isRevealed: function(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        return this.revealed[y][x];
    },

    getRevealedState: function() {
        // 序列化为紧凑位图字符串（每行一个字符串，'1'=已点亮，'0'=未点亮）
        var rows = [];
        for (var y = 0; y < this.height; y++) {
            var row = '';
            for (var x = 0; x < this.width; x++) {
                row += this.revealed[y][x] ? '1' : '0';
            }
            rows.push(row);
        }
        return rows;
    },

    loadRevealedState: function(state) {
        if (!state || !Array.isArray(state)) return;
        for (var y = 0; y < this.height && y < state.length; y++) {
            for (var x = 0; x < this.width && x < state[y].length; x++) {
                this.revealed[y][x] = state[y][x] === '1';
            }
        }
    }
};

// ============================================================
// ProgressTracker（进度追踪器）
// ============================================================
var ProgressTracker = {
    unlockedLayers: [1],     // 已解锁层级
    completedLayers: [],     // 已完成层级（Boss 已击败）
    layerProgress: {},       // 每层探索进度 { layerId: { fogState, bossDefeated } }
    bestRecords: {},         // 最佳记录 { layerId: { resourcesGained } }

    init: function(savedData) {
        if (savedData && typeof savedData === 'object') {
            this.unlockedLayers = Array.isArray(savedData.unlockedLayers) && savedData.unlockedLayers.length > 0
                ? savedData.unlockedLayers.slice()
                : [1];
            this.completedLayers = Array.isArray(savedData.completedLayers)
                ? savedData.completedLayers.slice()
                : [];
            this.layerProgress = savedData.layerProgress && typeof savedData.layerProgress === 'object'
                ? JSON.parse(JSON.stringify(savedData.layerProgress))
                : {};
            this.bestRecords = savedData.bestRecords && typeof savedData.bestRecords === 'object'
                ? JSON.parse(JSON.stringify(savedData.bestRecords))
                : {};
        } else {
            // 默认初始化：第一层解锁
            this.unlockedLayers = [1];
            this.completedLayers = [];
            this.layerProgress = {};
            this.bestRecords = {};
        }
        // 确保第一层始终在已解锁列表中
        if (this.unlockedLayers.indexOf(1) === -1) {
            this.unlockedLayers.push(1);
        }
    },

    isLayerUnlocked: function(layerId) {
        return this.unlockedLayers.indexOf(layerId) !== -1;
    },

    unlockNextLayer: function(currentLayer) {
        var nextLayer = currentLayer + 1;
        if (this.unlockedLayers.indexOf(nextLayer) === -1) {
            this.unlockedLayers.push(nextLayer);
        }
    },

    markLayerComplete: function(layerId) {
        // 标记 Boss 已击败
        if (!this.layerProgress[layerId]) {
            this.layerProgress[layerId] = {};
        }
        this.layerProgress[layerId].bossDefeated = true;

        // 添加到已完成列表
        if (this.completedLayers.indexOf(layerId) === -1) {
            this.completedLayers.push(layerId);
        }

        // 解锁下一层
        this.unlockNextLayer(layerId);
    },

    saveProgress: function() {
        return {
            unlockedLayers: this.unlockedLayers.slice(),
            completedLayers: this.completedLayers.slice(),
            layerProgress: JSON.parse(JSON.stringify(this.layerProgress)),
            bestRecords: JSON.parse(JSON.stringify(this.bestRecords))
        };
    },

    getLayerProgress: function(layerId) {
        return this.layerProgress[layerId] || null;
    },

    setLayerFogState: function(layerId, fogState) {
        if (!this.layerProgress[layerId]) {
            this.layerProgress[layerId] = {};
        }
        this.layerProgress[layerId].fogState = fogState;
    },

    updateBestRecord: function(layerId, resourcesGained) {
        if (!this.bestRecords[layerId]) {
            this.bestRecords[layerId] = { resourcesGained: resourcesGained };
        } else {
            // 合并：取每种资源的最大值
            var existing = this.bestRecords[layerId].resourcesGained || {};
            for (var key in resourcesGained) {
                if (!existing[key] || resourcesGained[key] > existing[key]) {
                    existing[key] = resourcesGained[key];
                }
            }
            this.bestRecords[layerId].resourcesGained = existing;
        }
    },

    /**
     * Boss 战失败处理：保持层级解锁状态，不标记 Boss 为已击败
     * @param {number} layerId - 层级 ID
     */
    handleBossDefeat: function(layerId) {
        // 确保该层级仍在已解锁列表中（不移除）
        if (this.unlockedLayers.indexOf(layerId) === -1) {
            this.unlockedLayers.push(layerId);
        }
        // 确保 bossDefeated 不被设为 true
        if (this.layerProgress[layerId]) {
            this.layerProgress[layerId].bossDefeated = false;
        }
    }
};

// ============================================================
// CombatEngine（战斗引擎 - 独立 CD 制）
// ============================================================
var CombatEngine = {
    allies: [],           // 我方单位 [{ name, attack, speed, skills, attackCD, currentCD, statusEffects }]
    enemy: null,          // 敌方单位（单个）{ name, hp, maxHp, attack, speed, attackCD, currentCD, _monsterId/_bossId }
    partyTotalHP: 0,      // 我方队伍总血量
    partyMaxHP: 0,        // 我方队伍最大总血量
    combatLog: [],        // 战斗日志
    state: 'idle',        // 'idle' | 'active' | 'victory' | 'defeat'
    elapsedTime: 0,       // 战斗经过时间（秒）
    isBossFight: false,
    _configLoader: null,

    // ATB CD 计算：attackCD = speed_baseline / speed（秒）
    // speed_baseline 默认10，即 speed=10 时 1秒1刀
    _getAttackCD: function(speed) {
        var config = this._configLoader || ConfigLoader;
        if (!config.combatConfig) config.loadAll();
        var cfg = config.combatConfig || config._defaults.combat;
        var atb = cfg.atb || {};
        var baseline = atb.speed_baseline || (cfg.speed_baseline) || 10;
        return baseline / (speed || 1);
    },

    // 创建士兵单位
    _makeAlly: function(source) {
        var attack = source.attack !== undefined ? source.attack : (source.stats ? source.stats.attack : 0);
        var defense = source.defense !== undefined ? source.defense : (source.stats ? source.stats.defense : 0);
        var speed = source.speed !== undefined ? source.speed : (source.stats ? source.stats.speed : 1);
        var hp = source.hp !== undefined ? source.hp : (source.stats ? source.stats.hp : 0);
        var cd = this._getAttackCD(speed);
        
        return {
            name: source.name || '士兵',
            attack: attack,
            defense: defense,
            speed: speed,
            skills: (source.skills || []).slice(),
            attackCD: cd,
            currentCD: cd,  // 初始 CD 满，需要等待
            statusEffects: [],
            _sourceHP: hp  // 保存原始 hp 用于计算队伍总血量
        };
    },

    // 创建敌人单位
    _makeEnemy: function(source) {
        var hp = source.hp !== undefined ? source.hp : (source.stats ? source.stats.hp : 0);
        var attack = source.attack !== undefined ? source.attack : (source.stats ? source.stats.attack : 0);
        var defense = source.defense !== undefined ? source.defense : (source.stats ? source.stats.defense : 0);
        var speed = source.speed !== undefined ? source.speed : (source.stats ? source.stats.speed : 1);
        var cd = this._getAttackCD(speed);
        
        return {
            name: source.name || '敌人',
            hp: hp,
            maxHp: hp,
            attack: attack,
            defense: defense,
            speed: speed,
            attackCD: cd,
            currentCD: cd,  // 初始 CD 满，需要等待
            _monsterId: source._monsterId || null,
            _bossId: source._bossId || null
        };
    },

    init: function(allies, enemy, configLoader) {
        this._configLoader = configLoader || ConfigLoader;
        this.allies = [];
        this.enemy = null;
        this.combatLog = [];
        this.state = 'active';
        this.elapsedTime = 0;
        this.isBossFight = false;
        this.partyTotalHP = 0;
        this.partyMaxHP = 0;

        // 初始化我方士兵
        for (var i = 0; i < allies.length; i++) {
            var ally = this._makeAlly(allies[i]);
            this.allies.push(ally);
            this.partyTotalHP += ally._sourceHP;
            this.partyMaxHP += ally._sourceHP;
        }

        // 初始化敌人（单个）
        if (enemy) {
            this.enemy = this._makeEnemy(enemy);
        }
    },

    // 更新战斗状态（每帧调用）
    update: function(deltaTime) {
        if (this.state !== 'active') return;

        this.elapsedTime += deltaTime;

        // 更新我方士兵 CD
        for (var i = 0; i < this.allies.length; i++) {
            var ally = this.allies[i];
            ally.currentCD -= deltaTime;
            
            // CD 到期，执行攻击
            if (ally.currentCD <= 0) {
                this.executeAllyAttack(ally);
                ally.currentCD = ally.attackCD;  // 重置 CD
            }
        }

        // 更新敌人 CD
        if (this.enemy && this.enemy.hp > 0) {
            this.enemy.currentCD -= deltaTime;
            
            // CD 到期，执行攻击
            if (this.enemy.currentCD <= 0) {
                this.executeEnemyAttack();
                this.enemy.currentCD = this.enemy.attackCD;  // 重置 CD
            }
        }

        // 更新状态效果持续时间
        this.updateStatusEffects(deltaTime);

        // 检查战斗是否结束
        this.checkBattleEnd();
    },

    // 执行我方士兵攻击
    executeAllyAttack: function(ally) {
        if (!this.enemy || this.enemy.hp <= 0) return;

        // 先释放所有可用辅助技能（buff）
        var config = this._configLoader || ConfigLoader;
        for (var i = 0; i < ally.skills.length; i++) {
            var skillId = ally.skills[i];
            var skillDef = config.getSkill(skillId);
            if (skillDef && skillDef.type === 'buff' && skillDef.effect) {
                this.applyStatusEffect(ally, {
                    id: skillId,
                    effect: { stat: skillDef.effect.stat, bonus: skillDef.effect.bonus },
                    duration: skillDef.effect.duration || 3
                });
            }
        }

        // 计算伤害并攻击敌人
        var damage = this.calculateDamage(ally, true);
        this.enemy.hp -= damage;
        if (this.enemy.hp < 0) this.enemy.hp = 0;

        var msg = ally.name + ' 攻击 ' + this.enemy.name + '，造成 ' + damage + ' 点伤害';
        this.combatLog.push(msg);
    },

    // 执行敌人攻击
    executeEnemyAttack: function() {
        if (this.partyTotalHP <= 0) return;

        // 计算伤害并扣除队伍总血量
        var damage = this.calculateDamage(this.enemy, false);
        this.partyTotalHP -= damage;
        if (this.partyTotalHP < 0) this.partyTotalHP = 0;

        var msg = this.enemy.name + ' 攻击队伍，造成 ' + damage + ' 点伤害';
        this.combatLog.push(msg);
    },

    // 伤害计算 — 减法公式：先攻防差再乘人数
    // 我方攻击：damage = max(D_min, (allyAttack - enemyDefense) * partyCount)
    // 敌方攻击：damage = max(D_min, enemyAttack - allyDefense)
    //   allyDefense = 队伍中最高防御值（敌人打整个队伍血池）
    calculateDamage: function(attacker, isAlly) {
        var config = this._configLoader || ConfigLoader;
        var formula = config.getDamageFormula();
        var minDamage = formula.D_min || formula.minDamage || 1;

        var attackPower = attacker.attack || 0;
        
        // 如果是我方士兵，考虑状态效果加成
        if (isAlly && attacker.statusEffects) {
            for (var i = 0; i < attacker.statusEffects.length; i++) {
                var eff = attacker.statusEffects[i];
                if (eff.effect && eff.effect.stat === 'attack') {
                    attackPower += (eff.effect.bonus || 0);
                }
            }
        }

        var damage;
        if (isAlly) {
            // 我方士兵攻击敌人：(allyAttack - enemyDefense) * partyCount
            var enemyDef = (this.enemy && this.enemy.defense) || 0;
            var partyCount = this.allies.length || 1;
            var diff = attackPower - enemyDef;
            damage = diff * partyCount;
        } else {
            // 敌人攻击队伍：enemyAttack - allyDefense（取队伍最高防御）
            var bestDef = 0;
            for (var i = 0; i < this.allies.length; i++) {
                var allyDef = this.allies[i].defense || 0;
                // 考虑防御 buff
                if (this.allies[i].statusEffects) {
                    for (var j = 0; j < this.allies[i].statusEffects.length; j++) {
                        var eff = this.allies[i].statusEffects[j];
                        if (eff.effect && eff.effect.stat === 'defense') {
                            allyDef += (eff.effect.bonus || 0);
                        }
                    }
                }
                if (allyDef > bestDef) bestDef = allyDef;
            }
            damage = attackPower - bestDef;
        }

        if (damage < minDamage) damage = minDamage;
        return damage;
    },

    // 施加状态效果（buff）
    applyStatusEffect: function(target, effect) {
        if (!target.statusEffects) target.statusEffects = [];
        
        // 检查是否已有同 id 的效果，有则刷新持续时间
        for (var i = 0; i < target.statusEffects.length; i++) {
            if (target.statusEffects[i].id === effect.id) {
                target.statusEffects[i].duration = effect.duration;
                return;
            }
        }
        
        target.statusEffects.push({
            id: effect.id,
            effect: effect.effect,
            duration: effect.duration
        });
    },

    // 更新状态效果持续时间
    updateStatusEffects: function(deltaTime) {
        // 更新我方士兵状态效果
        for (var i = 0; i < this.allies.length; i++) {
            var ally = this.allies[i];
            if (!ally.statusEffects) continue;
            
            for (var j = ally.statusEffects.length - 1; j >= 0; j--) {
                var eff = ally.statusEffects[j];
                eff.duration -= deltaTime;
                if (eff.duration <= 0) {
                    ally.statusEffects.splice(j, 1);
                }
            }
        }
    },

    // 检查战斗是否结束
    checkBattleEnd: function() {
        if (this.enemy && this.enemy.hp <= 0) {
            this.state = 'victory';
        } else if (this.partyTotalHP <= 0) {
            this.state = 'defeat';
        }
        return this.state;
    },

    // 获取战斗奖励
    getRewards: function() {
        if (this.state !== 'victory') return null;
        if (!this.enemy) return null;

        var config = this._configLoader || ConfigLoader;
        var rewards = { gold: 0, exp: 0, items: [] };
        var enemyConfig = null;

        // 尝试从怪物配置查找
        if (this.enemy._monsterId) {
            enemyConfig = config.getMonster(this.enemy._monsterId);
        }
        // 尝试从 Boss 配置查找
        if (!enemyConfig && this.enemy._bossId) {
            enemyConfig = config.getBoss(this.enemy._bossId);
        }

        if (enemyConfig && enemyConfig.rewards) {
            var r = enemyConfig.rewards;
            if (r.gold) {
                var goldMin = r.gold.min || 0;
                var goldMax = r.gold.max || 0;
                rewards.gold = Math.floor(Math.random() * (goldMax - goldMin + 1)) + goldMin;
            }
            if (r.exp) {
                rewards.exp = r.exp;
            }
            if (r.items && Array.isArray(r.items)) {
                for (var j = 0; j < r.items.length; j++) {
                    rewards.items.push({
                        resource: r.items[j].resource,
                        amount: r.items[j].amount || 1
                    });
                }
            }
        }

        return rewards;
    },

    // Boss 战初始化
    initBossFight: function(allies, bossId, configLoader) {
        var config = configLoader || ConfigLoader;
        this._configLoader = config;
        var bossCfg = config.getBoss(bossId);
        if (!bossCfg) return false;

        var bossUnit = {
            name: bossCfg.name,
            stats: bossCfg.stats,
            skills: bossCfg.skills || ['basic_attack'],
            _bossId: bossId
        };

        this.init(allies, bossUnit, config);
        this.isBossFight = true;

        return true;
    },

    // 从怪物配置创建敌人并初始化战斗
    initMonsterFight: function(allies, monsterId, configLoader) {
        var config = configLoader || ConfigLoader;
        this._configLoader = config;
        
        var monsterCfg = config.getMonster(monsterId);
        if (!monsterCfg) return false;

        var enemy = {
            name: monsterCfg.name,
            stats: monsterCfg.stats,
            skills: monsterCfg.skills || ['basic_attack'],
            _monsterId: monsterId
        };

        this.init(allies, enemy, config);
        return true;
    }
};

// ============================================================
// ExplorationManager（探索管理器）
// ============================================================
var ExplorationManager = {
    playerPos: { x: 25, y: 25 },
    party: [],               // 当前探险队伍（士兵对象引用）
    currentLayer: 1,
    collectedResources: {},  // 本次探险累计资源 { gold: N, exp: N, ... }
    collectedTreasures: [],  // 本次探险收集的宝藏明细
    combatRewards: [],       // 本次探险战斗奖励明细
    _started: false,         // 是否已离开入口（防止刚进入就触发结束）
    _isResourceLayer: false, // 是否为资源层
    _dungeonMap: null,
    _fogOfWar: null,
    _configLoader: null,

    // ---- 6.1 队伍派遣逻辑 ----

    /**
     * 添加士兵到探险队伍
     * @param {object} soldier - 士兵对象，需有唯一 id 字段
     * @returns {{ success: boolean, reason?: string }}
     */
    addSoldier: function(soldier) {
        var config = this._configLoader || ConfigLoader;
        var maxSize = config.getMaxPartySize();

        if (!soldier || soldier.id === undefined || soldier.id === null) {
            return { success: false, reason: 'invalid_soldier' };
        }

        // 队伍已满
        if (this.party.length >= maxSize) {
            return { success: false, reason: 'party_full' };
        }

        // 重复检查
        for (var i = 0; i < this.party.length; i++) {
            if (this.party[i].id === soldier.id) {
                return { success: false, reason: 'duplicate' };
            }
        }

        this.party.push(soldier);
        return { success: true };
    },

    /**
     * 从探险队伍移除士兵
     * @param {*} soldierId - 士兵 id
     * @returns {{ success: boolean, reason?: string }}
     */
    removeSoldier: function(soldierId) {
        for (var i = 0; i < this.party.length; i++) {
            if (this.party[i].id === soldierId) {
                this.party.splice(i, 1);
                return { success: true };
            }
        }
        return { success: false, reason: 'not_found' };
    },

    /**
     * 检查队伍是否可以开始探险（非空）
     */
    canStartExploration: function() {
        return this.party.length > 0;
    },

    // ---- 6.3 移动逻辑 ----

    /**
     * 初始化探索
     */
    init: function(layer, party, savedProgress, dungeonMap, fogOfWar, configLoader) {
        this._configLoader = configLoader || ConfigLoader;
        this._dungeonMap = dungeonMap || DungeonMap;
        this._fogOfWar = fogOfWar || FogOfWar;
        this.currentLayer = layer || 1;
        this.party = party || [];
        this.collectedResources = {};
        this.collectedTreasures = [];
        this.combatRewards = [];
        this._started = false;
        this._isResourceLayer = this._configLoader.isResourceLayer ? this._configLoader.isResourceLayer(layer) : false;

        var entrance = this._configLoader.getEntrance();
        this.playerPos = { x: entrance.x, y: entrance.y };

        // 初始化迷雾并点亮入口周围
        var viewRange = this._configLoader.getViewRange();
        this._fogOfWar.reveal(this.playerPos.x, this.playerPos.y, viewRange);

        // 标记入口为已探索
        this._dungeonMap.setExplored(this.playerPos.x, this.playerPos.y);
    },

    /**
     * 四方向移动
     * @param {string} direction - 'up'|'down'|'left'|'right'
     * @returns {{ success: boolean, encounter?: object, ended?: boolean, reason?: string }}
     */
    move: function(direction) {
        var dx = 0, dy = 0;
        switch (direction) {
            case 'up':    dy = -1; break;
            case 'down':  dy = 1;  break;
            case 'left':  dx = -1; break;
            case 'right': dx = 1;  break;
            default: return { success: false, reason: 'invalid_direction' };
        }

        var newX = this.playerPos.x + dx;
        var newY = this.playerPos.y + dy;
        var map = this._dungeonMap || DungeonMap;

        // 边界检查
        if (!map.isInBounds(newX, newY)) {
            return { success: false, reason: 'out_of_bounds' };
        }

        // 墙壁碰撞
        var tile = map.getTile(newX, newY);
        if (tile.type === 'wall') {
            return { success: false, reason: 'wall' };
        }

        // 执行移动
        this.playerPos.x = newX;
        this.playerPos.y = newY;
        this._started = true;

        // 点亮迷雾
        var config = this._configLoader || ConfigLoader;
        var viewRange = config.getViewRange();
        var fog = this._fogOfWar || FogOfWar;
        fog.reveal(newX, newY, viewRange);

        // 检查是否走回入口（探险结束）
        var entrance = config.getEntrance();
        if (newX === entrance.x && newY === entrance.y) {
            var summary = this.endExploration(false);
            return { success: true, ended: true, summary: summary };
        }

        // 遭遇触发（仅未探索区域）
        var encounter = this._checkEncounter(newX, newY);

        // 标记为已探索
        map.setExplored(newX, newY);

        var result = { success: true };
        if (encounter) {
            result.encounter = encounter;
        }
        return result;
    },

    /**
     * 根据点击位置判定方向并移动
     */
    handleClick: function(clickX, clickY, canvasWidth, canvasHeight) {
        var centerX = canvasWidth / 2;
        var centerY = canvasHeight / 2;
        var dx = clickX - centerX;
        var dy = clickY - centerY;

        var direction;
        if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? 'right' : 'left';
        } else {
            direction = dy > 0 ? 'down' : 'up';
        }

        return this.move(direction);
    },

    // ---- 6.6 遭遇触发逻辑 ----

    /**
     * 检查新位置是否触发遭遇（仅未探索区域触发）
     * @returns {object|null} 遭遇信息或 null
     */
    _checkEncounter: function(x, y) {
        var map = this._dungeonMap || DungeonMap;
        var tile = map.getTile(x, y);
        if (!tile) return null;

        // 已探索区域不触发遭遇
        if (tile.explored) return null;

        // 检查地块内容
        if (!tile.content) return null;

        if (tile.content.type === 'monster') {
            return { type: 'monster', monsterId: tile.content.monsterId };
        }

        if (tile.content.type === 'portal') {
            return { type: 'portal', bossId: tile.content.bossId };
        }

        if (tile.content.type === 'boss') {
            return { type: 'boss', bossId: tile.content.bossId };
        }

        // 宝藏不算遭遇，但返回提示
        if (tile.content.type === 'treasure') {
            return { type: 'treasure', items: tile.content.items };
        }

        // 矿产设施返回提示
        if (tile.content.type === 'facility' && !tile.content.collected) {
            return { type: 'facility', name: tile.content.name, resource: tile.content.resource, amount: tile.content.amount };
        }

        return null;
    },

    // ---- 6.8 宝藏收集和资源汇总 ----

    /**
     * 收集当前位置的宝藏
     * @returns {{ success: boolean, items?: array, reason?: string }}
     */
    collectTreasure: function() {
        var map = this._dungeonMap || DungeonMap;
        var tile = map.getTile(this.playerPos.x, this.playerPos.y);

        if (!tile || !tile.content || tile.content.type !== 'treasure') {
            return { success: false, reason: 'no_treasure' };
        }

        var items = tile.content.items || [];

        // 添加到累计资源
        for (var i = 0; i < items.length; i++) {
            var resource = items[i].resource;
            var amount = items[i].amount || 0;
            this.collectedResources[resource] = (this.collectedResources[resource] || 0) + amount;
        }

        // 记录宝藏明细
        this.collectedTreasures.push({ x: this.playerPos.x, y: this.playerPos.y, items: items });

        // 从地图移除宝藏
        tile.content = null;

        return { success: true, items: items };
    },

    /**
     * 采集当前位置的矿产设施
     * @returns {{ success: boolean, resource?: string, amount?: number, name?: string, reason?: string }}
     */
    collectFacility: function() {
        var map = this._dungeonMap || DungeonMap;
        var tile = map.getTile(this.playerPos.x, this.playerPos.y);

        if (!tile || !tile.content || tile.content.type !== 'facility') {
            return { success: false, reason: 'no_facility' };
        }

        if (tile.content.collected) {
            return { success: false, reason: 'already_collected' };
        }

        var resource = tile.content.resource;
        var amountCfg = tile.content.amount;
        var amount;
        if (amountCfg && typeof amountCfg === 'object' && amountCfg.min !== undefined) {
            amount = Math.floor(Math.random() * (amountCfg.max - amountCfg.min + 1)) + amountCfg.min;
        } else {
            amount = amountCfg || 0;
        }

        // 添加到累计资源
        this.collectedResources[resource] = (this.collectedResources[resource] || 0) + amount;

        // 标记为已采集
        tile.content.collected = true;

        return { success: true, resource: resource, amount: amount, name: tile.content.name };
    },

    /**
     * 添加战斗奖励到累计资源
     * @param {object} rewards - { gold, exp, items }
     */
    addCombatRewards: function(rewards) {
        if (!rewards) return;

        if (rewards.gold) {
            this.collectedResources['gold'] = (this.collectedResources['gold'] || 0) + rewards.gold;
        }
        if (rewards.exp) {
            this.collectedResources['exp'] = (this.collectedResources['exp'] || 0) + rewards.exp;
        }
        if (rewards.items && Array.isArray(rewards.items)) {
            for (var i = 0; i < rewards.items.length; i++) {
                var item = rewards.items[i];
                this.collectedResources[item.resource] = (this.collectedResources[item.resource] || 0) + (item.amount || 0);
            }
        }

        this.combatRewards.push(rewards);
    },

    /**
     * 获取当前累计资源汇总
     */
    getResourceSummary: function() {
        // 返回深拷贝
        var summary = {};
        for (var key in this.collectedResources) {
            summary[key] = this.collectedResources[key];
        }
        return summary;
    },

    // ---- 6.11 探险结束逻辑 ----

    /**
     * 结束探险
     * @param {boolean} wipeOut - 是否全灭（true=全灭不保留资源，false=正常返回保留资源）
     * @returns {{ resources: object, preserved: boolean }}
     */
    endExploration: function(wipeOut) {
        var result;

        if (wipeOut) {
            // 全灭：不保留资源
            result = { resources: {}, preserved: false };
        } else {
            // 正常返回入口：保留累计资源
            result = { resources: this.getResourceSummary(), preserved: true };
        }

        return result;
    },

    /**
     * 获取当前探索进度（用于存档）
     */
    getProgress: function() {
        var fog = this._fogOfWar || FogOfWar;
        return {
            playerPos: { x: this.playerPos.x, y: this.playerPos.y },
            fogState: fog.getRevealedState(),
            collectedResources: this.getResourceSummary(),
            started: this._started
        };
    },

    /**
     * 获取当前视野内地块
     */
    getVisibleTiles: function() {
        var config = this._configLoader || ConfigLoader;
        var viewRange = config.getViewRange();
        var map = this._dungeonMap || DungeonMap;
        var tiles = [];

        for (var dy = -viewRange; dy <= viewRange; dy++) {
            for (var dx = -viewRange; dx <= viewRange; dx++) {
                var x = this.playerPos.x + dx;
                var y = this.playerPos.y + dy;
                if (map.isInBounds(x, y)) {
                    tiles.push({ x: x, y: y, tile: map.getTile(x, y) });
                }
            }
        }
        return tiles;
    }
};

// ============================================================
// DungeonRenderer（地牢渲染器）
// ============================================================
var DungeonRenderer = {
    tileSize: 12,
    offsetX: 0,
    offsetY: 0,
    // 颜色配置
    colors: {
        bg: '#0a0a1a',
        wall: '#4a4a5a',
        empty: '#2a2a3a',
        entrance: '#44aa44',
        boss: '#cc3333',
        fog: '#000000',
        fogRevealed: 'rgba(0,0,0,0.3)',
        player: '#ffdd00',
        monster: '#ff6644',
        treasure: '#ffaa00',
        bossIcon: '#ff2222',
        portal: '#9944ff',
        portalIcon: '#cc88ff',
        grid: '#1a1a2a',
        explored: '#333344',
        // 矿产设施颜色
        facility: '#2a6a2a',
        facilityCollected: '#1a3a1a',
        facilityIcons: {
            lumber_mill: '#8B4513',
            stone_mine: '#808080',
            iron_mine: '#B0B0B0',
            gold_mine: '#FFD700',
            steel_forge: '#4682B4',
            crystal_mine: '#00CED1',
            rune_altar: '#9370DB',
            darksteel_vein: '#2F4F4F',
            _default: '#44aa44'
        }
    },

    render: function(ctx, canvas, dungeonMap, fogOfWar, playerPos, party, collectedResources) {
        var w = canvas.width, h = canvas.height;
        // 背景
        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, w, h);

        // 计算地图渲染区域（左侧留给地图，右侧留给状态面板）
        var panelWidth = 180;
        var mapAreaW = w - panelWidth;
        var mapAreaH = h - 40; // 顶部留标题

        // 计算 tileSize 使地图适配区域
        var ts = Math.floor(Math.min(mapAreaW / dungeonMap.width, mapAreaH / dungeonMap.height));
        if (ts < 2) ts = 2;
        this.tileSize = ts;

        // 居中偏移
        this.offsetX = Math.floor((mapAreaW - ts * dungeonMap.width) / 2);
        this.offsetY = Math.floor((mapAreaH - ts * dungeonMap.height) / 2) + 35;

        // 标题
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        var titleText = '地牢探索 - 第 ' + (ExplorationManager.currentLayer || 1) + ' 层';
        if (ExplorationManager._isResourceLayer) titleText += ' (资源层)';
        ctx.fillText(titleText, mapAreaW / 2, 8);

        // 绘制地图网格
        for (var y = 0; y < dungeonMap.height; y++) {
            for (var x = 0; x < dungeonMap.width; x++) {
                this.drawTile(ctx, x, y, dungeonMap.getTile(x, y), fogOfWar.isRevealed(x, y), this._isInView(x, y, playerPos));
            }
        }

        // 绘制玩家
        this.drawPlayer(ctx, playerPos.x, playerPos.y);

        // 右侧状态面板
        this.drawPartyStatus(ctx, w - panelWidth + 10, 40, panelWidth - 20, party);
        this.drawResourceSummary(ctx, w - panelWidth + 10, h - 160, panelWidth - 20, collectedResources);

        // 方向提示
        this._drawDirectionHints(ctx, mapAreaW / 2, h - 15);
    },

    _isInView: function(x, y, playerPos) {
        var range = ConfigLoader.getViewRange();
        return Math.abs(x - playerPos.x) <= range && Math.abs(y - playerPos.y) <= range;
    },

    drawTile: function(ctx, x, y, tile, isRevealed, isVisible) {
        var ts = this.tileSize;
        var px = this.offsetX + x * ts;
        var py = this.offsetY + y * ts;

        if (!isRevealed) {
            // 完全未探索：黑色
            ctx.fillStyle = this.colors.fog;
            ctx.fillRect(px, py, ts, ts);
            return;
        }

        // 地块底色
        switch (tile.type) {
            case 'wall':
                ctx.fillStyle = this.colors.wall;
                break;
            case 'entrance':
                ctx.fillStyle = this.colors.entrance;
                break;
            case 'boss':
                ctx.fillStyle = tile.explored ? this.colors.explored : this.colors.boss;
                break;
            case 'portal':
                ctx.fillStyle = tile.explored ? this.colors.explored : this.colors.portal;
                break;
            default:
                ctx.fillStyle = tile.explored ? this.colors.explored : this.colors.empty;
        }
        ctx.fillRect(px, py, ts, ts);

        // 网格线
        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px, py, ts, ts);

        // 地块内容图标（仅在视野内且未探索时显示怪物，宝藏始终显示）
        if (tile.content && isRevealed) {
            if (tile.content.type === 'monster' && !tile.explored) {
                // 怪物：红色小圆
                ctx.fillStyle = this.colors.monster;
                ctx.beginPath();
                ctx.arc(px + ts / 2, py + ts / 2, ts * 0.3, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile.content.type === 'treasure') {
                // 宝藏：金色菱形
                ctx.fillStyle = this.colors.treasure;
                ctx.beginPath();
                ctx.moveTo(px + ts / 2, py + ts * 0.15);
                ctx.lineTo(px + ts * 0.85, py + ts / 2);
                ctx.lineTo(px + ts / 2, py + ts * 0.85);
                ctx.lineTo(px + ts * 0.15, py + ts / 2);
                ctx.closePath();
                ctx.fill();
            } else if (tile.content.type === 'boss' && !tile.explored) {
                // Boss：红色星形（简化为大圆+十字）
                ctx.fillStyle = this.colors.bossIcon;
                ctx.beginPath();
                ctx.arc(px + ts / 2, py + ts / 2, ts * 0.35, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(px + ts * 0.3, py + ts / 2);
                ctx.lineTo(px + ts * 0.7, py + ts / 2);
                ctx.moveTo(px + ts / 2, py + ts * 0.3);
                ctx.lineTo(px + ts / 2, py + ts * 0.7);
                ctx.stroke();
            } else if (tile.content.type === 'portal' && !tile.explored) {
                // 传送阵：紫色旋涡（同心圆 + 中心点）
                ctx.strokeStyle = this.colors.portalIcon;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(px + ts / 2, py + ts / 2, ts * 0.35, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(px + ts / 2, py + ts / 2, ts * 0.2, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = this.colors.portalIcon;
                ctx.beginPath();
                ctx.arc(px + ts / 2, py + ts / 2, ts * 0.1, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile.content.type === 'facility') {
                // 矿产设施：根据类型使用不同颜色的方块 + 中心标记
                var fType = tile.content.facilityType || '_default';
                var fColor = (this.colors.facilityIcons && this.colors.facilityIcons[fType])
                    ? this.colors.facilityIcons[fType] : (this.colors.facilityIcons._default || '#44aa44');
                if (tile.content.collected) {
                    // 已采集：暗色 + 勾号
                    ctx.fillStyle = this.colors.facilityCollected || '#1a3a1a';
                    ctx.fillRect(px + ts * 0.1, py + ts * 0.1, ts * 0.8, ts * 0.8);
                    ctx.strokeStyle = '#556655';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(px + ts * 0.25, py + ts * 0.5);
                    ctx.lineTo(px + ts * 0.45, py + ts * 0.7);
                    ctx.lineTo(px + ts * 0.75, py + ts * 0.3);
                    ctx.stroke();
                } else {
                    // 未采集：彩色方块
                    ctx.fillStyle = fColor;
                    ctx.fillRect(px + ts * 0.1, py + ts * 0.1, ts * 0.8, ts * 0.8);
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(px + ts * 0.1, py + ts * 0.1, ts * 0.8, ts * 0.8);
                }
            }
        }

        // 已探索但不在视野内的区域加半透明遮罩
        if (isRevealed && !isVisible) {
            ctx.fillStyle = this.colors.fogRevealed;
            ctx.fillRect(px, py, ts, ts);
        }
    },

    drawPlayer: function(ctx, x, y) {
        var ts = this.tileSize;
        var px = this.offsetX + x * ts;
        var py = this.offsetY + y * ts;

        // 玩家：黄色圆形 + 边框
        ctx.fillStyle = this.colors.player;
        ctx.beginPath();
        ctx.arc(px + ts / 2, py + ts / 2, ts * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
    },

    drawPartyStatus: function(ctx, x, y, width, party) {
        ctx.fillStyle = '#cccccc';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('队伍状态', x, y);

        var currentY = y + 20;
        if (!party || party.length === 0) {
            ctx.fillStyle = '#888888';
            ctx.font = '11px sans-serif';
            ctx.fillText('无队员', x, currentY);
            return;
        }

        for (var i = 0; i < party.length; i++) {
            var member = party[i];
            var name = member.name || ('队员' + (i + 1));
            var hp = member.hp !== undefined ? member.hp : (member.stats ? member.stats.hp : 0);
            var maxHp = member.maxHp !== undefined ? member.maxHp : (member.stats ? member.stats.hp : hp);

            // 名字
            ctx.fillStyle = '#dddddd';
            ctx.font = '11px sans-serif';
            ctx.fillText(name, x, currentY);
            currentY += 14;

            // 血条背景
            var barW = width - 4;
            var barH = 8;
            ctx.fillStyle = '#333333';
            ctx.fillRect(x, currentY, barW, barH);

            // 血条
            var ratio = maxHp > 0 ? hp / maxHp : 0;
            if (ratio < 0) ratio = 0;
            ctx.fillStyle = ratio < 0.3 ? '#ff4444' : (ratio < 0.6 ? '#ffaa00' : '#44cc44');
            ctx.fillRect(x, currentY, barW * ratio, barH);

            // HP 数值
            ctx.fillStyle = '#ffffff';
            ctx.font = '9px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(hp + '/' + maxHp, x + barW, currentY + barH + 10);
            ctx.textAlign = 'left';

            currentY += 24;
        }
    },

    drawResourceSummary: function(ctx, x, y, width, resources) {
        ctx.fillStyle = '#cccccc';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('获得资源', x, y);

        var currentY = y + 20;
        if (!resources || Object.keys(resources).length === 0) {
            ctx.fillStyle = '#888888';
            ctx.font = '11px sans-serif';
            ctx.fillText('暂无', x, currentY);
            return;
        }

        ctx.font = '11px sans-serif';
        var keys = Object.keys(resources);
        for (var i = 0; i < keys.length; i++) {
            var resName = (typeof RESOURCE_NAMES !== 'undefined' && RESOURCE_NAMES[keys[i]]) ? RESOURCE_NAMES[keys[i]] : keys[i];
            ctx.fillStyle = '#ffdd88';
            ctx.fillText(resName + ': ' + resources[keys[i]], x, currentY);
            currentY += 16;
        }
    },

    _drawDirectionHints: function(ctx, centerX, y) {
        ctx.fillStyle = '#666666';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('点击画面移动：↑↓←→', centerX, y);
    }
};


// ============================================================
// DungeonSelectUI（地牢选择界面）
// ============================================================
var DungeonSelectUI = {
    selectedLayer: 1,
    selectedParty: [],
    maxPartySize: 4,
    _layerButtons: [],    // { x, y, w, h, layerId }
    _soldierButtons: [],  // { x, y, w, h, soldierIndex }
    _partyRemoveButtons: [], // { x, y, w, h, partyIndex }
    _startButton: null,   // { x, y, w, h }
    _backButton: null,    // { x, y, w, h }
    _scrollOffset: 0,

    render: function(ctx, canvas, progressTracker, soldierManager) {
        var w = canvas.width, h = canvas.height;

        // 背景
        ctx.fillStyle = '#0f0f1f';
        ctx.fillRect(0, 0, w, h);

        // 标题
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('地牢探险', w / 2, 12);

        // 左侧：层级选择
        this._drawLayerSelect(ctx, 20, 50, w * 0.35, h - 70, progressTracker);

        // 右侧：队伍派遣
        this._drawPartySelect(ctx, w * 0.38, 50, w * 0.6, h - 70, soldierManager);

        // 底部按钮
        this._drawBottomButtons(ctx, w, h);
    },

    _drawLayerSelect: function(ctx, x, y, width, height, progressTracker) {
        ctx.fillStyle = '#cccccc';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('选择层级', x, y);

        this._layerButtons = [];
        var btnH = 50;
        var gap = 8;
        var currentY = y + 25;

        var config = ConfigLoader;
        var layers = config.dungeonConfig ? config.dungeonConfig.layers : config._defaults.dungeon.layers;
        var layerIds = Object.keys(layers).map(function(k) { return parseInt(k); });

        // 合并资源层到列表中
        var resourceLayers = (config.dungeonConfig && config.dungeonConfig.resourceLayers) ? config.dungeonConfig.resourceLayers : {};
        var rlIds = Object.keys(resourceLayers).map(function(k) { return parseInt(k); });
        for (var ri = 0; ri < rlIds.length; ri++) {
            if (layerIds.indexOf(rlIds[ri]) === -1) {
                layerIds.push(rlIds[ri]);
            }
        }
        layerIds.sort(function(a, b) { return a - b; });

        for (var i = 0; i < layerIds.length; i++) {
            var lid = layerIds[i];
            var isRL = config.isResourceLayer ? config.isResourceLayer(lid) : false;
            var layerCfg = isRL ? resourceLayers[lid] : layers[lid];
            if (!layerCfg) continue;
            var unlocked = progressTracker.isLayerUnlocked(lid);
            var completed = progressTracker.completedLayers.indexOf(lid) !== -1;
            var reached = isRL && progressTracker.layerProgress[lid] && progressTracker.layerProgress[lid].reached;

            var by = currentY + this._layerButtons.length * (btnH + gap);
            if (by + btnH > y + height) break;

            // 按钮背景
            var isSelected = this.selectedLayer === lid;
            if (!unlocked) {
                ctx.fillStyle = '#1a1a2a';
            } else if (isSelected) {
                ctx.fillStyle = '#334466';
            } else {
                ctx.fillStyle = '#222244';
            }
            ctx.fillRect(x, by, width, btnH);

            // 边框
            ctx.strokeStyle = isSelected ? '#6688cc' : '#444466';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.strokeRect(x, by, width, btnH);

            // 层级名称
            ctx.fillStyle = unlocked ? '#eeeeee' : '#555555';
            ctx.font = 'bold 13px sans-serif';
            ctx.textAlign = 'left';
            var nameLabel = '第 ' + lid + ' 层: ' + (layerCfg.name || '未知');
            if (isRL) nameLabel += ' [资源层]';
            ctx.fillText(nameLabel, x + 10, by + 8);

            // 状态标签
            ctx.font = '11px sans-serif';
            if (isRL && reached) {
                ctx.fillStyle = '#44cc88';
                ctx.fillText('已到达 ✓', x + 10, by + 28);
            } else if (completed) {
                ctx.fillStyle = '#44cc44';
                ctx.fillText('已通关 ✓', x + 10, by + 28);
            } else if (unlocked) {
                ctx.fillStyle = isRL ? '#88ccaa' : '#aaaacc';
                ctx.fillText(isRL ? '可探索' : '可挑战', x + 10, by + 28);
            } else {
                ctx.fillStyle = '#555555';
                ctx.fillText('🔒 未解锁', x + 10, by + 28);
            }

            if (unlocked) {
                this._layerButtons.push({ x: x, y: by, w: width, h: btnH, layerId: lid });
            }
        }
    },

    _drawPartySelect: function(ctx, x, y, width, height, soldierManager) {
        ctx.fillStyle = '#cccccc';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('派遣队伍 (' + this.selectedParty.length + '/' + this.maxPartySize + ')', x, y);

        // 已选队员
        this._partyRemoveButtons = [];
        var slotH = 36;
        var currentY = y + 25;

        for (var i = 0; i < this.selectedParty.length; i++) {
            var member = this.selectedParty[i];
            var name = member.name || ('队员' + (i + 1));
            var hp = member.stats ? member.stats.hp : (member.hp || 0);
            var atk = member.stats ? member.stats.attack : (member.attack || 0);
            var def = member.stats ? member.stats.defense : (member.defense || 0);

            ctx.fillStyle = '#223344';
            ctx.fillRect(x, currentY, width, slotH);
            ctx.strokeStyle = '#446688';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, currentY, width, slotH);

            ctx.fillStyle = '#ddddee';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(name, x + 8, currentY + 5);
            ctx.fillStyle = '#aaaacc';
            ctx.font = '10px sans-serif';
            ctx.fillText('HP:' + hp + ' ATK:' + atk + ' DEF:' + def, x + 8, currentY + 21);

            // 移除按钮
            var rmX = x + width - 30;
            ctx.fillStyle = '#663333';
            ctx.fillRect(rmX, currentY + 5, 24, 24);
            ctx.fillStyle = '#ff6666';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('×', rmX + 12, currentY + 17);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            this._partyRemoveButtons.push({ x: rmX, y: currentY + 5, w: 24, h: 24, partyIndex: i });
            currentY += slotH + 4;
        }

        // 可用士兵列表
        currentY += 10;
        ctx.fillStyle = '#999999';
        ctx.font = '13px sans-serif';
        ctx.fillText('可用士兵:', x, currentY);
        currentY += 20;

        this._soldierButtons = [];
        var soldiers = soldierManager ? soldierManager.soldiers || [] : [];

        for (var i = 0; i < soldiers.length; i++) {
            if (currentY + slotH > y + height) break;

            var s = soldiers[i];
            // 检查是否已在队伍中
            var inParty = false;
            for (var j = 0; j < this.selectedParty.length; j++) {
                if (this.selectedParty[j].id === s.id) { inParty = true; break; }
            }

            var name = s.name || ('士兵' + (i + 1));
            var hp = s.stats ? s.stats.hp : (s.hp || 0);
            var atk = s.stats ? s.stats.attack : (s.attack || 0);
            var def = s.stats ? s.stats.defense : (s.defense || 0);

            ctx.fillStyle = inParty ? '#1a1a2a' : '#1a2a1a';
            ctx.fillRect(x, currentY, width, slotH);
            ctx.strokeStyle = inParty ? '#333344' : '#336633';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, currentY, width, slotH);

            ctx.fillStyle = inParty ? '#666666' : '#ccddcc';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(name + (inParty ? ' (已选)' : ''), x + 8, currentY + 5);
            ctx.fillStyle = inParty ? '#555555' : '#88aa88';
            ctx.font = '10px sans-serif';
            ctx.fillText('HP:' + hp + ' ATK:' + atk + ' DEF:' + def, x + 8, currentY + 21);

            if (!inParty && this.selectedParty.length < this.maxPartySize) {
                this._soldierButtons.push({ x: x, y: currentY, w: width, h: slotH, soldierIndex: i });
            }
            currentY += slotH + 4;
        }
    },

    _drawBottomButtons: function(ctx, canvasW, canvasH) {
        var btnW = 120;
        var btnH = 40;
        var y = canvasH - 55;

        // 返回按钮
        var backX = canvasW / 2 - btnW - 20;
        ctx.fillStyle = '#443333';
        ctx.fillRect(backX, y, btnW, btnH);
        ctx.strokeStyle = '#886666';
        ctx.lineWidth = 1;
        ctx.strokeRect(backX, y, btnW, btnH);
        ctx.fillStyle = '#ddcccc';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('返回', backX + btnW / 2, y + btnH / 2);
        this._backButton = { x: backX, y: y, w: btnW, h: btnH };

        // 出发按钮
        var startX = canvasW / 2 + 20;
        var canStart = this.selectedParty.length > 0;
        ctx.fillStyle = canStart ? '#224422' : '#222222';
        ctx.fillRect(startX, y, btnW, btnH);
        ctx.strokeStyle = canStart ? '#44aa44' : '#444444';
        ctx.lineWidth = canStart ? 2 : 1;
        ctx.strokeRect(startX, y, btnW, btnH);
        ctx.fillStyle = canStart ? '#88ff88' : '#555555';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('出发探险', startX + btnW / 2, y + btnH / 2);
        this._startButton = { x: startX, y: y, w: btnW, h: btnH };
    },

    handleClick: function(x, y, soldierManager) {
        // 层级选择
        for (var i = 0; i < this._layerButtons.length; i++) {
            var btn = this._layerButtons[i];
            if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
                this.selectedLayer = btn.layerId;
                // 动态更新上阵人数上限
                var newMax = ConfigLoader.getMaxPartySizeForLayer(btn.layerId);
                this.maxPartySize = newMax;
                // 如果当前队伍超出新上限，截断
                while (this.selectedParty.length > newMax) {
                    this.selectedParty.pop();
                }
                return { type: 'layer_selected', layerId: btn.layerId };
            }
        }

        // 移除队员
        for (var i = 0; i < this._partyRemoveButtons.length; i++) {
            var btn = this._partyRemoveButtons[i];
            if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
                this.selectedParty.splice(btn.partyIndex, 1);
                return { type: 'party_removed', index: btn.partyIndex };
            }
        }

        // 添加士兵到队伍
        for (var i = 0; i < this._soldierButtons.length; i++) {
            var btn = this._soldierButtons[i];
            if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
                var soldiers = soldierManager ? soldierManager.soldiers || [] : [];
                var soldier = soldiers[btn.soldierIndex];
                if (soldier && this.selectedParty.length < this.maxPartySize) {
                    this.selectedParty.push(soldier);
                    return { type: 'soldier_added', soldier: soldier };
                }
            }
        }

        // 返回按钮
        if (this._backButton) {
            var b = this._backButton;
            if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                return { type: 'back' };
            }
        }

        // 出发按钮
        if (this._startButton && this.selectedParty.length > 0) {
            var s = this._startButton;
            if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) {
                return { type: 'start', layer: this.selectedLayer, party: this.selectedParty.slice() };
            }
        }

        return null;
    },

    selectSoldier: function(soldierIndex, soldierManager) {
        var soldiers = soldierManager ? soldierManager.soldiers || [] : [];
        var soldier = soldiers[soldierIndex];
        if (!soldier) return false;
        if (this.selectedParty.length >= this.maxPartySize) return false;
        for (var i = 0; i < this.selectedParty.length; i++) {
            if (this.selectedParty[i].id === soldier.id) return false;
        }
        this.selectedParty.push(soldier);
        return true;
    },

    removeSoldier: function(partyIndex) {
        if (partyIndex >= 0 && partyIndex < this.selectedParty.length) {
            this.selectedParty.splice(partyIndex, 1);
            return true;
        }
        return false;
    },

    startExploration: function() {
        if (this.selectedParty.length === 0) return null;
        return { layer: this.selectedLayer, party: this.selectedParty.slice() };
    },

    reset: function() {
        this.selectedParty = [];
        this.selectedLayer = 1;
    }
};


// ============================================================
// CombatRenderer（战斗渲染器）
// ============================================================
// PortalSelectUI（传送选择界面）
// ============================================================
var PortalSelectUI = {
    visible: false,
    currentLayer: 1,
    unlockedLayers: [],
    _layerButtons: [],   // { x, y, w, h, layerId }
    _backButton: null,   // { x, y, w, h } — 返回关外
    _callback: null,     // function(layerId) or null for back

    /**
     * 显示传送选择界面
     * @param {number} currentLayer - 当前层级
     * @param {array} unlockedLayers - 已解锁层级列表
     * @param {function} callback - 选择回调 callback(layerId) 或 callback(null) 表示返回关外
     */
    show: function(currentLayer, unlockedLayers, callback) {
        this.visible = true;
        this.currentLayer = currentLayer;
        this.unlockedLayers = (unlockedLayers || []).slice().sort(function(a, b) { return a - b; });
        this._callback = callback;
        this._layerButtons = [];
        this._backButton = null;
    },

    hide: function() {
        this.visible = false;
        this._callback = null;
    },

    render: function(ctx, canvas) {
        if (!this.visible) return;

        var w = canvas.width, h = canvas.height;

        // 半透明背景遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, w, h);

        // 标题
        ctx.fillStyle = '#cc88ff';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('传送阵', w / 2, 30);

        ctx.fillStyle = '#aaaacc';
        ctx.font = '14px sans-serif';
        ctx.fillText('Boss 已击败，选择传送目标', w / 2, 62);

        // 层级按钮列表
        this._layerButtons = [];
        var btnW = 280;
        var btnH = 44;
        var gap = 8;
        var nextLayer = this.currentLayer + 1;

        // 构建可选层级列表：下一层 + 已解锁层级（去重，排序）
        var options = [];
        // 下一层始终在最前面
        options.push({ layerId: nextLayer, label: '第 ' + nextLayer + ' 层（下一层）', isNext: true });
        // 其他已解锁层级
        for (var i = 0; i < this.unlockedLayers.length; i++) {
            var lid = this.unlockedLayers[i];
            if (lid !== nextLayer) {
                options.push({ layerId: lid, label: '第 ' + lid + ' 层', isNext: false });
            }
        }

        var totalH = options.length * (btnH + gap) + 60; // +60 for back button
        var startY = Math.max(90, (h - totalH) / 2);

        for (var i = 0; i < options.length; i++) {
            var opt = options[i];
            var bx = (w - btnW) / 2;
            var by = startY + i * (btnH + gap);

            // 按钮背景
            ctx.fillStyle = opt.isNext ? '#2a1a4a' : '#1a1a3a';
            ctx.fillRect(bx, by, btnW, btnH);

            // 边框
            ctx.strokeStyle = opt.isNext ? '#9944ff' : '#555588';
            ctx.lineWidth = opt.isNext ? 2 : 1;
            ctx.strokeRect(bx, by, btnW, btnH);

            // 文字
            ctx.fillStyle = opt.isNext ? '#cc88ff' : '#aaaacc';
            ctx.font = opt.isNext ? 'bold 15px sans-serif' : '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(opt.label, w / 2, by + btnH / 2);

            this._layerButtons.push({ x: bx, y: by, w: btnW, h: btnH, layerId: opt.layerId });
        }

        // 返回关外按钮
        var backY = startY + options.length * (btnH + gap) + 10;
        var backW = 180;
        var backX = (w - backW) / 2;
        ctx.fillStyle = '#3a2222';
        ctx.fillRect(backX, backY, backW, btnH);
        ctx.strokeStyle = '#886666';
        ctx.lineWidth = 1;
        ctx.strokeRect(backX, backY, backW, btnH);
        ctx.fillStyle = '#ddaaaa';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('返回关外', w / 2, backY + btnH / 2);
        this._backButton = { x: backX, y: backY, w: backW, h: btnH };
    },

    handleClick: function(x, y) {
        if (!this.visible) return null;

        // 层级按钮
        for (var i = 0; i < this._layerButtons.length; i++) {
            var btn = this._layerButtons[i];
            if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
                this.visible = false;
                if (this._callback) this._callback(btn.layerId);
                return { type: 'teleport', layerId: btn.layerId };
            }
        }

        // 返回关外按钮
        if (this._backButton) {
            var b = this._backButton;
            if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                this.visible = false;
                if (this._callback) this._callback(null);
                return { type: 'back' };
            }
        }

        return null;
    }
};


// ============================================================
// CombatRenderer（战斗渲染器 - 独立 CD 制）
// ============================================================
var CombatRenderer = {
    render: function(ctx, canvas, combatEngine) {
        var w = canvas.width, h = canvas.height;

        // 背景
        ctx.fillStyle = '#0f0f1f';
        ctx.fillRect(0, 0, w, h);

        // 标题
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        var title = combatEngine.isBossFight ? 'Boss 战' : '战斗';
        if (combatEngine.state === 'victory') title += ' - 胜利!';
        else if (combatEngine.state === 'defeat') title += ' - 失败...';
        ctx.fillText(title, w / 2, 10);

        // 上半部分：敌人
        if (combatEngine.enemy) {
            this._drawEnemy(ctx, w, 80, combatEngine.enemy);
        }

        // 分隔线
        var midY = h * 0.45;
        ctx.strokeStyle = '#444466';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(20, midY);
        ctx.lineTo(w - 20, midY);
        ctx.stroke();

        // 下半部分：我方队伍总血量
        this._drawPartyHP(ctx, w, midY + 20, combatEngine);

        // 战斗日志（底部）
        this._drawCombatLog(ctx, w, h, combatEngine.combatLog);

        // 战斗结束提示
        if (combatEngine.state !== 'active') {
            this._drawEndMessage(ctx, w, h, combatEngine.state);
        }
    },

    _drawEnemy: function(ctx, canvasW, startY, enemy) {
        var cx = canvasW / 2;
        var cy = startY;

        // 敌人图标（大圆形）
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.fillStyle = enemy.hp > 0 ? '#cc4444' : '#333333';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 名字
        ctx.fillStyle = '#eeeeee';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(enemy.name, cx, cy + 50);

        // 血条
        var barW = 300;
        var barH = 20;
        var barX = cx - barW / 2;
        var barY = cy + 75;

        // 背景
        ctx.fillStyle = '#222222';
        ctx.fillRect(barX, barY, barW, barH);

        // 血条
        var ratio = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 0;
        if (ratio < 0) ratio = 0;
        ctx.fillStyle = ratio < 0.3 ? '#ff4444' : (ratio < 0.6 ? '#ffaa00' : '#44cc44');
        ctx.fillRect(barX, barY, barW * ratio, barH);

        // 边框
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barW, barH);

        // HP 文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(enemy.hp + ' / ' + enemy.maxHp, cx, barY + barH / 2);

        // 攻击 CD 进度条（可选）
        if (enemy.hp > 0 && enemy.currentCD !== undefined) {
            var cdBarW = 200;
            var cdBarH = 8;
            var cdBarX = cx - cdBarW / 2;
            var cdBarY = barY + barH + 10;

            ctx.fillStyle = '#111111';
            ctx.fillRect(cdBarX, cdBarY, cdBarW, cdBarH);

            var cdRatio = enemy.attackCD > 0 ? (enemy.attackCD - enemy.currentCD) / enemy.attackCD : 0;
            if (cdRatio < 0) cdRatio = 0;
            if (cdRatio > 1) cdRatio = 1;
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(cdBarX, cdBarY, cdBarW * cdRatio, cdBarH);

            ctx.strokeStyle = '#444444';
            ctx.lineWidth = 1;
            ctx.strokeRect(cdBarX, cdBarY, cdBarW, cdBarH);

            ctx.fillStyle = '#888888';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText('攻击 CD: ' + enemy.currentCD.toFixed(1) + 's', cx, cdBarY + cdBarH + 2);
        }
    },

    _drawPartyHP: function(ctx, canvasW, startY, combatEngine) {
        var cx = canvasW / 2;
        var cy = startY;

        // 标题
        ctx.fillStyle = '#cccccc';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('我方队伍', cx, cy);

        // 队伍总血量条
        var barW = 400;
        var barH = 30;
        var barX = cx - barW / 2;
        var barY = cy + 30;

        // 背景
        ctx.fillStyle = '#222222';
        ctx.fillRect(barX, barY, barW, barH);

        // 血条
        var ratio = combatEngine.partyMaxHP > 0 ? combatEngine.partyTotalHP / combatEngine.partyMaxHP : 0;
        if (ratio < 0) ratio = 0;
        ctx.fillStyle = ratio < 0.3 ? '#ff4444' : (ratio < 0.6 ? '#ffaa00' : '#44cc44');
        ctx.fillRect(barX, barY, barW * ratio, barH);

        // 边框
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barW, barH);

        // HP 文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.floor(combatEngine.partyTotalHP) + ' / ' + combatEngine.partyMaxHP, cx, barY + barH / 2);

        // 士兵列表（显示名字和 CD 进度）
        var soldierY = barY + barH + 20;
        var soldierSpacing = 80;
        var totalW = combatEngine.allies.length * soldierSpacing;
        var startX = cx - totalW / 2 + soldierSpacing / 2;

        for (var i = 0; i < combatEngine.allies.length; i++) {
            var ally = combatEngine.allies[i];
            var sx = startX + i * soldierSpacing;

            // 士兵图标（小圆）
            ctx.beginPath();
            ctx.arc(sx, soldierY, 15, 0, Math.PI * 2);
            ctx.fillStyle = '#3388cc';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 名字
            ctx.fillStyle = '#dddddd';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(ally.name, sx, soldierY + 20);

            // CD 进度条
            if (ally.currentCD !== undefined) {
                var cdBarW = 60;
                var cdBarH = 6;
                var cdBarX = sx - cdBarW / 2;
                var cdBarY = soldierY + 35;

                ctx.fillStyle = '#111111';
                ctx.fillRect(cdBarX, cdBarY, cdBarW, cdBarH);

                var cdRatio = ally.attackCD > 0 ? (ally.attackCD - ally.currentCD) / ally.attackCD : 0;
                if (cdRatio < 0) cdRatio = 0;
                if (cdRatio > 1) cdRatio = 1;
                ctx.fillStyle = '#44aaff';
                ctx.fillRect(cdBarX, cdBarY, cdBarW * cdRatio, cdBarH);

                ctx.strokeStyle = '#444444';
                ctx.lineWidth = 1;
                ctx.strokeRect(cdBarX, cdBarY, cdBarW, cdBarH);
            }
        }
    },

    _drawCombatLog: function(ctx, canvasW, canvasH, log) {
        if (!log || log.length === 0) return;

        var logY = canvasH - 80;
        var maxLines = 4;
        var startIdx = Math.max(0, log.length - maxLines);

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, logY, canvasW, 80);

        ctx.fillStyle = '#aaaaaa';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        for (var i = startIdx; i < log.length; i++) {
            var lineY = logY + 5 + (i - startIdx) * 18;
            ctx.fillText(log[i], 15, lineY);
        }
    },

    _drawEndMessage: function(ctx, canvasW, canvasH, state) {
        var midY = canvasH / 2;

        // 半透明遮罩
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvasW, canvasH);

        // 结果文字
        ctx.fillStyle = state === 'victory' ? '#44ff44' : '#ff4444';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var msg = state === 'victory' ? '胜利!' : '失败...';
        ctx.fillText(msg, canvasW / 2, midY);

        // 提示
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px sans-serif';
        ctx.fillText('(自动返回)', canvasW / 2, midY + 50);
    }
};


// ============================================================
// 模块导出（Node.js 环境下用于测试）
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ConfigLoader: ConfigLoader,
        DungeonMap: DungeonMap,
        FogOfWar: FogOfWar,
        ProgressTracker: ProgressTracker,
        CombatEngine: CombatEngine,
        ExplorationManager: ExplorationManager,
        DungeonRenderer: DungeonRenderer,
        CombatRenderer: CombatRenderer,
        DungeonSelectUI: DungeonSelectUI,
        PortalSelectUI: PortalSelectUI
    };
}
