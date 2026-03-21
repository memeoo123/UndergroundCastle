// tests/inside-dungeon.unit.test.js — 关内地牢探险单元测试

const { ProgressTracker, CombatEngine, ConfigLoader, DungeonMap, FogOfWar, ExplorationManager } = require('../inside-logic');

describe('ProgressTracker', () => {
    beforeEach(() => {
        ProgressTracker.init(null);
    });

    describe('init', () => {
        test('默认初始化：第一层解锁，无完成层级', () => {
            expect(ProgressTracker.unlockedLayers).toEqual([1]);
            expect(ProgressTracker.completedLayers).toEqual([]);
            expect(ProgressTracker.layerProgress).toEqual({});
            expect(ProgressTracker.bestRecords).toEqual({});
        });

        test('从存档初始化', () => {
            var saved = {
                unlockedLayers: [1, 2],
                completedLayers: [1],
                layerProgress: { '1': { bossDefeated: true, fogState: ['110', '001'] } },
                bestRecords: { '1': { resourcesGained: { gold: 150 } } }
            };
            ProgressTracker.init(saved);
            expect(ProgressTracker.unlockedLayers).toEqual([1, 2]);
            expect(ProgressTracker.completedLayers).toEqual([1]);
            expect(ProgressTracker.layerProgress['1'].bossDefeated).toBe(true);
            expect(ProgressTracker.bestRecords['1'].resourcesGained.gold).toBe(150);
        });

        test('存档数据损坏时回退默认值', () => {
            ProgressTracker.init({ unlockedLayers: 'bad', completedLayers: null });
            expect(ProgressTracker.unlockedLayers).toEqual([1]);
            expect(ProgressTracker.completedLayers).toEqual([]);
        });

        test('存档缺少第一层时自动补充', () => {
            ProgressTracker.init({ unlockedLayers: [2, 3], completedLayers: [] });
            expect(ProgressTracker.unlockedLayers).toContain(1);
        });
    });

    describe('isLayerUnlocked', () => {
        test('第一层默认解锁', () => {
            expect(ProgressTracker.isLayerUnlocked(1)).toBe(true);
        });

        test('第二层默认未解锁', () => {
            expect(ProgressTracker.isLayerUnlocked(2)).toBe(false);
        });
    });

    describe('unlockNextLayer', () => {
        test('解锁下一层', () => {
            ProgressTracker.unlockNextLayer(1);
            expect(ProgressTracker.isLayerUnlocked(2)).toBe(true);
        });

        test('重复解锁不会产生重复项', () => {
            ProgressTracker.unlockNextLayer(1);
            ProgressTracker.unlockNextLayer(1);
            var count = ProgressTracker.unlockedLayers.filter(function(l) { return l === 2; }).length;
            expect(count).toBe(1);
        });
    });

    describe('markLayerComplete', () => {
        test('标记层级完成后 Boss 已击败且下一层解锁', () => {
            ProgressTracker.markLayerComplete(1);
            expect(ProgressTracker.completedLayers).toContain(1);
            expect(ProgressTracker.layerProgress['1'].bossDefeated).toBe(true);
            expect(ProgressTracker.isLayerUnlocked(2)).toBe(true);
        });

        test('重复标记完成不会产生重复项', () => {
            ProgressTracker.markLayerComplete(1);
            ProgressTracker.markLayerComplete(1);
            var count = ProgressTracker.completedLayers.filter(function(l) { return l === 1; }).length;
            expect(count).toBe(1);
        });
    });

    describe('saveProgress / init 往返', () => {
        test('保存后加载应产生等价数据', () => {
            ProgressTracker.markLayerComplete(1);
            ProgressTracker.setLayerFogState(1, ['111', '000']);
            ProgressTracker.updateBestRecord(1, { gold: 100 });

            var saved = ProgressTracker.saveProgress();
            ProgressTracker.init(saved);

            expect(ProgressTracker.unlockedLayers).toEqual(saved.unlockedLayers);
            expect(ProgressTracker.completedLayers).toEqual(saved.completedLayers);
            expect(ProgressTracker.layerProgress).toEqual(saved.layerProgress);
            expect(ProgressTracker.bestRecords).toEqual(saved.bestRecords);
        });
    });

    describe('setLayerFogState', () => {
        test('设置迷雾状态', () => {
            ProgressTracker.setLayerFogState(1, ['110', '001']);
            expect(ProgressTracker.layerProgress['1'].fogState).toEqual(['110', '001']);
        });
    });

    describe('updateBestRecord', () => {
        test('首次记录', () => {
            ProgressTracker.updateBestRecord(1, { gold: 50 });
            expect(ProgressTracker.bestRecords['1'].resourcesGained.gold).toBe(50);
        });

        test('更新为更高记录', () => {
            ProgressTracker.updateBestRecord(1, { gold: 50 });
            ProgressTracker.updateBestRecord(1, { gold: 100, iron: 5 });
            expect(ProgressTracker.bestRecords['1'].resourcesGained.gold).toBe(100);
            expect(ProgressTracker.bestRecords['1'].resourcesGained.iron).toBe(5);
        });

        test('不会降低已有记录', () => {
            ProgressTracker.updateBestRecord(1, { gold: 100 });
            ProgressTracker.updateBestRecord(1, { gold: 30 });
            expect(ProgressTracker.bestRecords['1'].resourcesGained.gold).toBe(100);
        });
    });

    describe('handleBossDefeat', () => {
        test('Boss 战失败后层级仍在已解锁列表中', () => {
            ProgressTracker.handleBossDefeat(1);
            expect(ProgressTracker.isLayerUnlocked(1)).toBe(true);
        });

        test('Boss 战失败后 bossDefeated 保持 false', () => {
            ProgressTracker.layerProgress['1'] = { bossDefeated: false };
            ProgressTracker.handleBossDefeat(1);
            expect(ProgressTracker.layerProgress['1'].bossDefeated).toBe(false);
        });

        test('Boss 战失败不会意外将 bossDefeated 设为 true', () => {
            ProgressTracker.handleBossDefeat(1);
            var progress = ProgressTracker.getLayerProgress(1);
            // 如果没有 layerProgress 记录，不应创建 bossDefeated=true
            if (progress) {
                expect(progress.bossDefeated).not.toBe(true);
            }
        });

        test('Boss 战失败后可重新进入该层级', () => {
            // 模拟：解锁第2层，在第2层 Boss 战失败
            ProgressTracker.unlockNextLayer(1);
            expect(ProgressTracker.isLayerUnlocked(2)).toBe(true);
            ProgressTracker.handleBossDefeat(2);
            // 第2层仍然解锁，可重新挑战
            expect(ProgressTracker.isLayerUnlocked(2)).toBe(true);
            // 第2层未被标记为完成
            expect(ProgressTracker.completedLayers).not.toContain(2);
        });

        test('Boss 战失败不影响已完成的其他层级', () => {
            ProgressTracker.markLayerComplete(1); // 第1层已通关
            ProgressTracker.handleBossDefeat(2);   // 第2层 Boss 战失败
            expect(ProgressTracker.completedLayers).toContain(1);
            expect(ProgressTracker.isLayerUnlocked(2)).toBe(true);
        });
    });
});


describe('CombatEngine', () => {
    beforeEach(() => {
        ConfigLoader.loadAll();
    });

    function makeAlly(overrides) {
        return Object.assign({
            name: '战士', hp: 20, attack: 5, defense: 0, speed: 4,
            skills: ['basic_attack']
        }, overrides || {});
    }

    function makeEnemy(overrides) {
        return Object.assign({
            name: '史莱姆', hp: 10, attack: 2, defense: 0, speed: 3,
            skills: ['basic_attack']
        }, overrides || {});
    }

    describe('init', () => {
        test('初始化后状态为 active', () => {
            CombatEngine.init([makeAlly()], makeEnemy());
            expect(CombatEngine.state).toBe('active');
            expect(CombatEngine.allies.length).toBe(1);
            expect(CombatEngine.enemy).not.toBeNull();
        });

        test('初始化后队伍总血量正确计算', () => {
            CombatEngine.init([makeAlly({ hp: 20 }), makeAlly({ hp: 30 })], makeEnemy());
            expect(CombatEngine.partyTotalHP).toBe(50);
            expect(CombatEngine.partyMaxHP).toBe(50);
        });

        test('初始化后攻击 CD 正确设置', () => {
            CombatEngine.init([makeAlly({ speed: 5 })], makeEnemy({ speed: 2 }));
            // attackCD = 10 / speed
            expect(CombatEngine.allies[0].attackCD).toBe(2);  // 10/5
            expect(CombatEngine.enemy.attackCD).toBe(5);      // 10/2
        });
    });

    describe('update', () => {
        test('经过时间后 CD 减少', () => {
            CombatEngine.init([makeAlly({ speed: 5 })], makeEnemy());
            var initialCD = CombatEngine.allies[0].currentCD;
            CombatEngine.update(0.5);  // 0.5秒
            expect(CombatEngine.allies[0].currentCD).toBe(initialCD - 0.5);
        });

        test('CD 到期后自动攻击并重置 CD', () => {
            CombatEngine.init([makeAlly({ speed: 10, attack: 5 })], makeEnemy({ hp: 20 }));
            var initialEnemyHP = CombatEngine.enemy.hp;
            // 攻击 CD = 10/10 = 1秒，等待1秒触发攻击
            CombatEngine.update(1.0);
            expect(CombatEngine.enemy.hp).toBeLessThan(initialEnemyHP);
            expect(CombatEngine.allies[0].currentCD).toBe(1.0);  // CD 重置
        });

        test('敌人 CD 到期后攻击队伍总血量', () => {
            CombatEngine.init([makeAlly({ hp: 30 })], makeEnemy({ speed: 10, attack: 5 }));
            var initialPartyHP = CombatEngine.partyTotalHP;
            CombatEngine.update(1.0);  // 敌人 CD = 10/10 = 1秒
            expect(CombatEngine.partyTotalHP).toBeLessThan(initialPartyHP);
        });
    });

    describe('calculateDamage', () => {
        test('基础伤害 = attack，最低 1', () => {
            CombatEngine.init([makeAlly({ attack: 5 })], makeEnemy());
            var dmg = CombatEngine.calculateDamage(CombatEngine.allies[0], true);
            expect(dmg).toBe(5);
        });

        test('伤害不低于 minDamage', () => {
            CombatEngine.init([makeAlly({ attack: 0 })], makeEnemy());
            var dmg = CombatEngine.calculateDamage(CombatEngine.allies[0], true);
            expect(dmg).toBe(1);
        });

        test('状态效果加成正确应用', () => {
            CombatEngine.init([makeAlly({ attack: 5 })], makeEnemy());
            var ally = CombatEngine.allies[0];
            CombatEngine.applyStatusEffect(ally, { 
                id: 'attackUp', 
                effect: { stat: 'attack', bonus: 3 }, 
                duration: 3 
            });
            var dmg = CombatEngine.calculateDamage(ally, true);
            expect(dmg).toBe(8);  // 5 + 3
        });
    });

    describe('applyStatusEffect', () => {
        test('施加新状态效果', () => {
            CombatEngine.init([makeAlly()], makeEnemy());
            var unit = CombatEngine.allies[0];
            CombatEngine.applyStatusEffect(unit, { 
                id: 'attackUp', 
                effect: { stat: 'attack', bonus: 3 }, 
                duration: 3 
            });
            expect(unit.statusEffects.length).toBe(1);
        });

        test('重复施加同 id 效果刷新持续时间', () => {
            CombatEngine.init([makeAlly()], makeEnemy());
            var unit = CombatEngine.allies[0];
            CombatEngine.applyStatusEffect(unit, { 
                id: 'attackUp', 
                effect: { stat: 'attack', bonus: 3 }, 
                duration: 3 
            });
            CombatEngine.applyStatusEffect(unit, { 
                id: 'attackUp', 
                effect: { stat: 'attack', bonus: 3 }, 
                duration: 5 
            });
            expect(unit.statusEffects.length).toBe(1);
            expect(unit.statusEffects[0].duration).toBe(5);
        });
    });

    describe('updateStatusEffects', () => {
        test('经过时间后持续时间减少，到期移除', () => {
            CombatEngine.init([makeAlly()], makeEnemy());
            var unit = CombatEngine.allies[0];
            CombatEngine.applyStatusEffect(unit, { 
                id: 'defenseUp', 
                effect: { stat: 'defense', bonus: 5 }, 
                duration: 0.5 
            });
            CombatEngine.updateStatusEffects(0.6);
            expect(unit.statusEffects.length).toBe(0);
        });
    });

    describe('checkBattleEnd', () => {
        test('敌人 HP<=0 时胜利', () => {
            CombatEngine.init([makeAlly()], makeEnemy({ hp: 1 }));
            CombatEngine.enemy.hp = 0;
            expect(CombatEngine.checkBattleEnd()).toBe('victory');
        });

        test('队伍总血量<=0 时失败', () => {
            CombatEngine.init([makeAlly({ hp: 10 })], makeEnemy());
            CombatEngine.partyTotalHP = 0;
            expect(CombatEngine.checkBattleEnd()).toBe('defeat');
        });

        test('双方都有血量时继续', () => {
            CombatEngine.init([makeAlly()], makeEnemy());
            expect(CombatEngine.checkBattleEnd()).toBe('active');
        });
    });

    describe('getRewards', () => {
        test('胜利时返回奖励', () => {
            CombatEngine.init([makeAlly({ attack: 100 })], makeEnemy());
            CombatEngine.enemy._monsterId = 'slime';
            CombatEngine.enemy.hp = 0;
            CombatEngine.checkBattleEnd();
            var rewards = CombatEngine.getRewards();
            expect(rewards).not.toBeNull();
            expect(rewards.gold).toBeGreaterThanOrEqual(3);
            expect(rewards.gold).toBeLessThanOrEqual(8);
            expect(rewards.exp).toBe(10);
        });

        test('非胜利状态返回 null', () => {
            CombatEngine.init([makeAlly()], makeEnemy());
            expect(CombatEngine.getRewards()).toBeNull();
        });
    });

    describe('initBossFight', () => {
        test('Boss 战初始化成功', () => {
            var result = CombatEngine.initBossFight([makeAlly()], 'goblin_king');
            expect(result).toBe(true);
            expect(CombatEngine.isBossFight).toBe(true);
            expect(CombatEngine.enemy.name).toBe('哥布林王');
            expect(CombatEngine.enemy.hp).toBe(800);
        });

        test('不存在的 Boss 返回 false', () => {
            var result = CombatEngine.initBossFight([makeAlly()], 'nonexistent');
            expect(result).toBe(false);
        });
    });

    describe('initMonsterFight', () => {
        test('怪物战初始化成功', () => {
            var result = CombatEngine.initMonsterFight([makeAlly()], 'slime');
            expect(result).toBe(true);
            expect(CombatEngine.enemy).not.toBeNull();
            expect(CombatEngine.enemy.name).toBe('史莱姆');
        });

        test('不存在的怪物返回 false', () => {
            var result = CombatEngine.initMonsterFight([makeAlly()], 'nonexistent');
            expect(result).toBe(false);
        });
    });
});


describe('ExplorationManager', () => {
    // 创建一个小型测试地图（5x5），入口在 (2,2)
    function setupSmallMap() {
        ConfigLoader.loadAll();
        // 覆盖配置为小地图
        var smallConfig = {
            getMapWidth: function() { return 5; },
            getMapHeight: function() { return 5; },
            getViewRange: function() { return 2; },
            getMaxPartySize: function() { return 4; },
            getEntrance: function() { return { x: 2, y: 2 }; },
            getDungeonLayer: function() { return null; },
            _defaults: ConfigLoader._defaults,
            getDamageFormula: ConfigLoader.getDamageFormula.bind(ConfigLoader),
            getSkill: ConfigLoader.getSkill.bind(ConfigLoader),
            getMonster: ConfigLoader.getMonster.bind(ConfigLoader),
            getBoss: ConfigLoader.getBoss.bind(ConfigLoader),
            getStatusEffect: ConfigLoader.getStatusEffect.bind(ConfigLoader)
        };

        // 手动初始化 5x5 地图
        DungeonMap.width = 5;
        DungeonMap.height = 5;
        DungeonMap.entrance = { x: 2, y: 2 };
        DungeonMap.tiles = [];
        for (var y = 0; y < 5; y++) {
            DungeonMap.tiles[y] = [];
            for (var x = 0; x < 5; x++) {
                DungeonMap.tiles[y][x] = { type: 'empty', content: null, explored: false };
            }
        }
        DungeonMap.tiles[2][2].type = 'entrance';

        // 初始化迷雾
        FogOfWar.init(5, 5);

        return smallConfig;
    }

    function makeSoldier(id, name) {
        return { id: id, name: name || 'soldier_' + id, hp: 20, maxHp: 20, attack: 5, defense: 3, speed: 4 };
    }

    describe('6.1 队伍派遣逻辑', () => {
        beforeEach(() => {
            var config = setupSmallMap();
            ExplorationManager.init(1, [], null, DungeonMap, FogOfWar, config);
        });

        test('添加士兵到空队伍', () => {
            var result = ExplorationManager.addSoldier(makeSoldier(1));
            expect(result.success).toBe(true);
            expect(ExplorationManager.party.length).toBe(1);
        });

        test('阻止重复派遣同一士兵', () => {
            ExplorationManager.addSoldier(makeSoldier(1));
            var result = ExplorationManager.addSoldier(makeSoldier(1));
            expect(result.success).toBe(false);
            expect(result.reason).toBe('duplicate');
            expect(ExplorationManager.party.length).toBe(1);
        });

        test('队伍满时阻止添加', () => {
            for (var i = 1; i <= 4; i++) ExplorationManager.addSoldier(makeSoldier(i));
            var result = ExplorationManager.addSoldier(makeSoldier(5));
            expect(result.success).toBe(false);
            expect(result.reason).toBe('party_full');
            expect(ExplorationManager.party.length).toBe(4);
        });

        test('移除士兵', () => {
            ExplorationManager.addSoldier(makeSoldier(1));
            ExplorationManager.addSoldier(makeSoldier(2));
            var result = ExplorationManager.removeSoldier(1);
            expect(result.success).toBe(true);
            expect(ExplorationManager.party.length).toBe(1);
            expect(ExplorationManager.party[0].id).toBe(2);
        });

        test('移除不存在的士兵', () => {
            var result = ExplorationManager.removeSoldier(999);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('not_found');
        });

        test('空队伍不能开始探险', () => {
            expect(ExplorationManager.canStartExploration()).toBe(false);
        });

        test('有士兵时可以开始探险', () => {
            ExplorationManager.addSoldier(makeSoldier(1));
            expect(ExplorationManager.canStartExploration()).toBe(true);
        });
    });

    describe('6.3 移动逻辑', () => {
        var config;
        beforeEach(() => {
            config = setupSmallMap();
            ExplorationManager.init(1, [makeSoldier(1)], null, DungeonMap, FogOfWar, config);
        });

        test('向上移动一格', () => {
            var result = ExplorationManager.move('up');
            expect(result.success).toBe(true);
            expect(ExplorationManager.playerPos).toEqual({ x: 2, y: 1 });
        });

        test('向下移动一格', () => {
            var result = ExplorationManager.move('down');
            expect(result.success).toBe(true);
            expect(ExplorationManager.playerPos).toEqual({ x: 2, y: 3 });
        });

        test('向左移动一格', () => {
            var result = ExplorationManager.move('left');
            expect(result.success).toBe(true);
            expect(ExplorationManager.playerPos).toEqual({ x: 1, y: 2 });
        });

        test('向右移动一格', () => {
            var result = ExplorationManager.move('right');
            expect(result.success).toBe(true);
            expect(ExplorationManager.playerPos).toEqual({ x: 3, y: 2 });
        });

        test('越界移动被拒绝', () => {
            // 移到边缘 (0,2)
            ExplorationManager.move('left');
            ExplorationManager.move('left');
            var result = ExplorationManager.move('left');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('out_of_bounds');
            expect(ExplorationManager.playerPos).toEqual({ x: 0, y: 2 });
        });

        test('墙壁碰撞被拒绝', () => {
            DungeonMap.tiles[1][2].type = 'wall';
            var result = ExplorationManager.move('up');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('wall');
            expect(ExplorationManager.playerPos).toEqual({ x: 2, y: 2 });
        });

        test('移动后迷雾被点亮', () => {
            ExplorationManager.move('up');
            // 玩家在 (2,1)，视野范围 2，(0,0) 应该被点亮
            expect(FogOfWar.isRevealed(2, 1)).toBe(true);
            expect(FogOfWar.isRevealed(0, 0)).toBe(true);
        });

        test('handleClick 水平偏移大于垂直时判定为左右', () => {
            // 点击 Canvas 右侧 (dx=100, dy=10)
            var result = ExplorationManager.handleClick(500, 310, 800, 600);
            expect(result.success).toBe(true);
            expect(ExplorationManager.playerPos).toEqual({ x: 3, y: 2 });
        });

        test('handleClick 垂直偏移大于水平时判定为上下', () => {
            // 点击 Canvas 上方 (dx=10, dy=-100)
            var result = ExplorationManager.handleClick(410, 200, 800, 600);
            expect(result.success).toBe(true);
            expect(ExplorationManager.playerPos).toEqual({ x: 2, y: 1 });
        });
    });

    describe('6.6 遭遇触发逻辑', () => {
        var config;
        beforeEach(() => {
            config = setupSmallMap();
            ExplorationManager.init(1, [makeSoldier(1)], null, DungeonMap, FogOfWar, config);
        });

        test('未探索区域有怪物时触发遭遇', () => {
            DungeonMap.tiles[1][2].content = { type: 'monster', monsterId: 'slime' };
            var result = ExplorationManager.move('up');
            expect(result.success).toBe(true);
            expect(result.encounter).toBeDefined();
            expect(result.encounter.type).toBe('monster');
            expect(result.encounter.monsterId).toBe('slime');
        });

        test('已探索区域不触发遭遇', () => {
            DungeonMap.tiles[1][2].content = { type: 'monster', monsterId: 'slime' };
            DungeonMap.tiles[1][2].explored = true;
            var result = ExplorationManager.move('up');
            expect(result.success).toBe(true);
            expect(result.encounter).toBeUndefined();
        });

        test('Boss 房间触发 Boss 遭遇', () => {
            DungeonMap.tiles[1][2].type = 'boss';
            DungeonMap.tiles[1][2].content = { type: 'boss', bossId: 'goblin_king' };
            var result = ExplorationManager.move('up');
            expect(result.encounter.type).toBe('boss');
            expect(result.encounter.bossId).toBe('goblin_king');
        });

        test('宝藏区域返回宝藏提示', () => {
            DungeonMap.tiles[1][2].content = { type: 'treasure', items: [{ resource: 'gold', amount: 10 }] };
            var result = ExplorationManager.move('up');
            expect(result.encounter.type).toBe('treasure');
        });
    });

    describe('6.8 宝藏收集和资源汇总', () => {
        var config;
        beforeEach(() => {
            config = setupSmallMap();
            ExplorationManager.init(1, [makeSoldier(1)], null, DungeonMap, FogOfWar, config);
        });

        test('收集宝藏后地块 content 为 null', () => {
            DungeonMap.tiles[1][2].content = { type: 'treasure', items: [{ resource: 'gold', amount: 10 }] };
            ExplorationManager.move('up');
            var result = ExplorationManager.collectTreasure();
            expect(result.success).toBe(true);
            expect(result.items).toEqual([{ resource: 'gold', amount: 10 }]);
            expect(DungeonMap.tiles[1][2].content).toBeNull();
        });

        test('收集宝藏后累计资源增加', () => {
            DungeonMap.tiles[1][2].content = { type: 'treasure', items: [{ resource: 'gold', amount: 10 }, { resource: 'iron', amount: 3 }] };
            ExplorationManager.move('up');
            ExplorationManager.collectTreasure();
            var summary = ExplorationManager.getResourceSummary();
            expect(summary.gold).toBe(10);
            expect(summary.iron).toBe(3);
        });

        test('无宝藏时收集失败', () => {
            var result = ExplorationManager.collectTreasure();
            expect(result.success).toBe(false);
            expect(result.reason).toBe('no_treasure');
        });

        test('战斗奖励累加到资源汇总', () => {
            ExplorationManager.addCombatRewards({ gold: 5, exp: 10, items: [{ resource: 'crystal', amount: 1 }] });
            ExplorationManager.addCombatRewards({ gold: 3, exp: 5, items: [] });
            var summary = ExplorationManager.getResourceSummary();
            expect(summary.gold).toBe(8);
            expect(summary.exp).toBe(15);
            expect(summary.crystal).toBe(1);
        });

        test('宝藏和战斗奖励混合汇总', () => {
            DungeonMap.tiles[1][2].content = { type: 'treasure', items: [{ resource: 'gold', amount: 10 }] };
            ExplorationManager.move('up');
            ExplorationManager.collectTreasure();
            ExplorationManager.addCombatRewards({ gold: 5, exp: 10, items: [] });
            var summary = ExplorationManager.getResourceSummary();
            expect(summary.gold).toBe(15);
            expect(summary.exp).toBe(10);
        });
    });

    describe('6.11 探险结束逻辑', () => {
        var config;
        beforeEach(() => {
            config = setupSmallMap();
            ExplorationManager.init(1, [makeSoldier(1)], null, DungeonMap, FogOfWar, config);
        });

        test('走回入口时结束探险并保存资源', () => {
            ExplorationManager.addCombatRewards({ gold: 20, exp: 50, items: [] });
            // 先离开入口再走回来
            ExplorationManager.move('up');
            var result = ExplorationManager.move('down'); // 回到入口 (2,2)
            expect(result.ended).toBe(true);
            expect(result.summary.preserved).toBe(true);
            expect(result.summary.resources.gold).toBe(20);
            expect(result.summary.resources.exp).toBe(50);
        });

        test('全灭时不保留资源', () => {
            ExplorationManager.addCombatRewards({ gold: 100, exp: 200, items: [] });
            var result = ExplorationManager.endExploration(true);
            expect(result.preserved).toBe(false);
            expect(result.resources).toEqual({});
        });

        test('正常结束时保留所有累计资源', () => {
            ExplorationManager.addCombatRewards({ gold: 10, exp: 5, items: [] });
            DungeonMap.tiles[1][2].content = { type: 'treasure', items: [{ resource: 'gold', amount: 7 }] };
            ExplorationManager.move('up');
            ExplorationManager.collectTreasure();
            var result = ExplorationManager.endExploration(false);
            expect(result.preserved).toBe(true);
            expect(result.resources.gold).toBe(17);
            expect(result.resources.exp).toBe(5);
        });
    });
});
