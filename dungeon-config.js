// dungeon-config.js — 地牢层级外置配置
var DUNGEON_CONFIG_EXTERNAL = {
    mapWidth: 50,
    mapHeight: 50,
    viewRange: 2,
    maxPartySize: 6,
    entrance: { x: 25, y: 25 },

    // 上阵人数随层级递增配置：到达指定层级后解锁对应上阵人数，最高6人
    partySizeByLayer: [
        { layer: 1,  size: 1 },
        { layer: 5,  size: 2 },
        { layer: 10, size: 3 },
        { layer: 15, size: 4 },
        { layer: 20, size: 5 },
        { layer: 25, size: 6 }
    ],

    // 战斗层配置（怪物池按阶数对应标准敌人表）
    layers: {
        1: {
            name: '废弃矿洞',
            tier: 1,
            wallDensity: 0.3,
            monsterDensity: 0.05,
            treasureDensity: 0.02,
            monsterPool: ['slime', 'bat', 'rat'],
            treasurePool: [
                { items: [{ resource: 'gold', min: 5, max: 15 }], weight: 5 },
                { items: [{ resource: 'iron', min: 1, max: 3 }], weight: 3 },
                { items: [{ resource: 'crystal', min: 1, max: 1 }], weight: 1 }
            ],
            bossId: 'goblin_king'
        },
        2: {
            name: '暗影地穴',
            tier: 2,
            wallDensity: 0.25,
            monsterDensity: 0.07,
            treasureDensity: 0.03,
            monsterPool: ['skeleton', 'ghost', 'spider'],
            treasurePool: [
                { items: [{ resource: 'gold', min: 10, max: 30 }], weight: 5 },
                { items: [{ resource: 'steel', min: 1, max: 2 }], weight: 3 },
                { items: [{ resource: 'rune', min: 1, max: 1 }], weight: 1 }
            ],
            bossId: 'shadow_lord'
        },
        3: {
            name: '蘑菇森林',
            tier: 3,
            wallDensity: 0.28,
            monsterDensity: 0.06,
            treasureDensity: 0.025,
            monsterPool: ['mushroom', 'cave_worm', 'spider'],
            treasurePool: [
                { items: [{ resource: 'gold', min: 15, max: 40 }], weight: 5 },
                { items: [{ resource: 'wood', min: 10, max: 20 }], weight: 4 },
                { items: [{ resource: 'crystal', min: 1, max: 2 }], weight: 2 }
            ],
            bossId: 'mushroom_king'
        },
        4: {
            name: '熔岩洞窟',
            tier: 4,
            wallDensity: 0.22,
            monsterDensity: 0.08,
            treasureDensity: 0.03,
            monsterPool: ['fire_imp', 'lava_hound', 'skeleton'],
            treasurePool: [
                { items: [{ resource: 'gold', min: 20, max: 50 }], weight: 5 },
                { items: [{ resource: 'iron', min: 3, max: 6 }], weight: 4 },
                { items: [{ resource: 'steel', min: 1, max: 3 }], weight: 2 }
            ],
            bossId: 'flame_guardian'
        },
        6: {
            name: '冰封深渊',
            tier: 5,
            wallDensity: 0.2,
            monsterDensity: 0.09,
            treasureDensity: 0.035,
            monsterPool: ['frost_elemental', 'ice_wraith', 'ghost'],
            treasurePool: [
                { items: [{ resource: 'gold', min: 30, max: 70 }], weight: 5 },
                { items: [{ resource: 'crystal', min: 2, max: 4 }], weight: 3 },
                { items: [{ resource: 'rune', min: 1, max: 2 }], weight: 2 }
            ],
            bossId: 'frost_wyrm'
        },
        7: {
            name: '古代遗迹',
            tier: 6,
            wallDensity: 0.18,
            monsterDensity: 0.1,
            treasureDensity: 0.04,
            monsterPool: ['stone_guardian', 'ancient_spirit', 'skeleton'],
            treasurePool: [
                { items: [{ resource: 'gold', min: 40, max: 90 }], weight: 5 },
                { items: [{ resource: 'steel', min: 2, max: 5 }], weight: 3 },
                { items: [{ resource: 'rune', min: 1, max: 3 }], weight: 2 }
            ],
            bossId: 'ancient_golem'
        },
        8: {
            name: '毒沼泽地',
            tier: 7,
            wallDensity: 0.25,
            monsterDensity: 0.1,
            treasureDensity: 0.035,
            monsterPool: ['swamp_beast', 'poison_drake', 'spider'],
            treasurePool: [
                { items: [{ resource: 'gold', min: 50, max: 100 }], weight: 5 },
                { items: [{ resource: 'crystal', min: 3, max: 6 }], weight: 3 },
                { items: [{ resource: 'darksteel', min: 1, max: 1 }], weight: 1 }
            ],
            bossId: 'swamp_horror'
        },
        9: {
            name: '虚空裂隙',
            tier: 8,
            wallDensity: 0.15,
            monsterDensity: 0.12,
            treasureDensity: 0.04,
            monsterPool: ['void_shade', 'rift_stalker', 'ghost'],
            treasurePool: [
                { items: [{ resource: 'gold', min: 60, max: 120 }], weight: 5 },
                { items: [{ resource: 'rune', min: 2, max: 4 }], weight: 3 },
                { items: [{ resource: 'darksteel', min: 1, max: 2 }], weight: 2 }
            ],
            bossId: 'void_walker'
        }
    },

    // 资源层配置（每5层出现一次：5, 10, 15...）
    resourceLayers: {
        5: {
            name: '林石矿场',
            // 固定地图布局：20x20 小地图，入口在 (10, 10)
            mapWidth: 20,
            mapHeight: 20,
            entrance: { x: 10, y: 10 },
            // 矿产设施位置和类型
            facilities: [
                { x: 5, y: 5, type: 'lumber_mill', name: '木厂', resource: 'wood', amount: { min: 20, max: 40 } },
                { x: 15, y: 5, type: 'lumber_mill', name: '木厂', resource: 'wood', amount: { min: 20, max: 40 } },
                { x: 5, y: 15, type: 'stone_mine', name: '石头矿', resource: 'stone', amount: { min: 15, max: 30 } },
                { x: 15, y: 15, type: 'stone_mine', name: '石头矿', resource: 'stone', amount: { min: 15, max: 30 } }
            ],
            // 固定墙壁位置（装饰用）
            walls: [
                { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 18, y: 0 }, { x: 19, y: 0 },
                { x: 0, y: 19 }, { x: 1, y: 19 }, { x: 18, y: 19 }, { x: 19, y: 19 }
            ]
        },
        10: {
            name: '金铁矿脉',
            mapWidth: 25,
            mapHeight: 25,
            entrance: { x: 12, y: 12 },
            facilities: [
                { x: 4, y: 4, type: 'iron_mine', name: '铁矿', resource: 'iron', amount: { min: 8, max: 15 } },
                { x: 20, y: 4, type: 'iron_mine', name: '铁矿', resource: 'iron', amount: { min: 8, max: 15 } },
                { x: 4, y: 20, type: 'gold_mine', name: '金矿', resource: 'goldOre', amount: { min: 5, max: 10 } },
                { x: 20, y: 20, type: 'gold_mine', name: '金矿', resource: 'goldOre', amount: { min: 5, max: 10 } },
                { x: 12, y: 4, type: 'iron_mine', name: '铁矿', resource: 'iron', amount: { min: 10, max: 20 } },
                { x: 12, y: 20, type: 'gold_mine', name: '金矿', resource: 'goldOre', amount: { min: 6, max: 12 } }
            ],
            walls: [
                { x: 0, y: 0 }, { x: 24, y: 0 }, { x: 0, y: 24 }, { x: 24, y: 24 }
            ]
        },
        15: {
            name: '水晶洞穴',
            mapWidth: 30,
            mapHeight: 30,
            entrance: { x: 15, y: 15 },
            facilities: [
                { x: 5, y: 5, type: 'crystal_mine', name: '水晶矿', resource: 'crystal', amount: { min: 10, max: 20 } },
                { x: 25, y: 5, type: 'crystal_mine', name: '水晶矿', resource: 'crystal', amount: { min: 10, max: 20 } },
                { x: 5, y: 25, type: 'crystal_mine', name: '水晶矿', resource: 'crystal', amount: { min: 10, max: 20 } },
                { x: 25, y: 25, type: 'crystal_mine', name: '水晶矿', resource: 'crystal', amount: { min: 10, max: 20 } },
                { x: 15, y: 5, type: 'steel_forge', name: '钢铁锻造', resource: 'steel', amount: { min: 5, max: 10 } },
                { x: 15, y: 25, type: 'steel_forge', name: '钢铁锻造', resource: 'steel', amount: { min: 5, max: 10 } }
            ],
            walls: []
        },
        20: {
            name: '符文圣殿',
            mapWidth: 30,
            mapHeight: 30,
            entrance: { x: 15, y: 15 },
            facilities: [
                { x: 5, y: 5, type: 'rune_altar', name: '符文祭坛', resource: 'rune', amount: { min: 5, max: 10 } },
                { x: 25, y: 5, type: 'rune_altar', name: '符文祭坛', resource: 'rune', amount: { min: 5, max: 10 } },
                { x: 5, y: 25, type: 'rune_altar', name: '符文祭坛', resource: 'rune', amount: { min: 5, max: 10 } },
                { x: 25, y: 25, type: 'rune_altar', name: '符文祭坛', resource: 'rune', amount: { min: 5, max: 10 } },
                { x: 15, y: 5, type: 'darksteel_vein', name: '暗钢矿脉', resource: 'darksteel', amount: { min: 2, max: 5 } },
                { x: 15, y: 25, type: 'darksteel_vein', name: '暗钢矿脉', resource: 'darksteel', amount: { min: 2, max: 5 } }
            ],
            walls: []
        }
    },

    // 判断是否为资源层
    isResourceLayer: function(layerId) {
        return layerId % 5 === 0;
    },

    // 获取资源层配置
    getResourceLayer: function(layerId) {
        return this.resourceLayers[layerId] || null;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DUNGEON_CONFIG_EXTERNAL: DUNGEON_CONFIG_EXTERNAL };
}
