// soldier-config.js — 士兵类型外置配置（树形进阶体系）
// 进阶树：冒险者(T1) → 弓箭手(T2) → 弩手(T3)
//                     → 战士(T2)   → 狂战士(T3)
//                                  → 骑士(T3)
var SOLDIER_CONFIG_EXTERNAL = {
    soldiers: {
        adventurer: {
            name: '冒险者',
            tier: 1,
            recruitCost: { gold: 2 },
            stats: { attack: 1, defense: 1, hp: 8 },
            promoteTo: ['warrior', 'archer']
        },
        warrior: {
            name: '战士',
            tier: 2,
            promoteCost: { gold: 10, iron: 5 },
            stats: { attack: 5, defense: 3, hp: 20 },
            promoteTo: ['berserker', 'knight']
        },
        archer: {
            name: '弓箭手',
            tier: 2,
            promoteCost: { gold: 8, wood: 10 },
            stats: { attack: 7, defense: 1, hp: 12 },
            promoteTo: ['crossbowman']
        },
        berserker: {
            name: '狂战士',
            tier: 3,
            promoteCost: { gold: 40, steel: 5 },
            stats: { attack: 18, defense: 2, hp: 50 },
            promoteTo: []
        },
        knight: {
            name: '骑士',
            tier: 3,
            promoteCost: { gold: 40, steel: 8 },
            stats: { attack: 10, defense: 12, hp: 45 },
            promoteTo: []
        },
        crossbowman: {
            name: '弩手',
            tier: 3,
            promoteCost: { gold: 32, wood: 40 },
            stats: { attack: 16, defense: 3, hp: 25 },
            promoteTo: []
        }
    }
};

// 模块导出（Node.js 环境下用于测试）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SOLDIER_CONFIG_EXTERNAL: SOLDIER_CONFIG_EXTERNAL
    };
}
