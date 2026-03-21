// soldier-config.js — 士兵配置（10阶线性体系）
// 属性严格对应 battle/手动表-4-标准士兵表.json
// 进阶路线：tier1 → tier2 → tier3 → ... → tier10（线性直升）
var SOLDIER_CONFIG_EXTERNAL = {
    // 招募费用（招募的是1阶士兵）
    recruitCost: { gold: 2 },
    // 各阶进阶费用（从上一阶升到该阶的费用）
    promoteCosts: {
        2:  { gold: 10, iron: 5 },
        3:  { gold: 40, iron: 20 },
        4:  { gold: 120, iron: 60 },
        5:  { gold: 350, iron: 150 },
        6:  { gold: 900, iron: 400 },
        7:  { gold: 2200, iron: 1000 },
        8:  { gold: 5500, iron: 2500 },
        9:  { gold: 13000, iron: 6000 },
        10: { gold: 30000, iron: 15000 }
    },
    // 各阶队伍上阵数量上限
    teamSize: {
        1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 6, 8: 6, 9: 6, 10: 6
    },
    maxTier: 10,
    // 各阶标准属性（来自手动表-4-标准士兵表）
    tiers: {
        1:  { name: '1阶士兵', attack: 60,   hp: 280,   defense: 25,   speed: 10 },
        2:  { name: '2阶士兵', attack: 100,  hp: 467,   defense: 42,   speed: 10 },
        3:  { name: '3阶士兵', attack: 167,  hp: 779,   defense: 70,   speed: 10 },
        4:  { name: '4阶士兵', attack: 278,  hp: 1300,  defense: 116,  speed: 10 },
        5:  { name: '5阶士兵', attack: 465,  hp: 2168,  defense: 194,  speed: 10 },
        6:  { name: '6阶士兵', attack: 775,  hp: 3616,  defense: 323,  speed: 10 },
        7:  { name: '7阶士兵', attack: 1293, hp: 6032,  defense: 539,  speed: 10 },
        8:  { name: '8阶士兵', attack: 2156, hp: 10063, defense: 898,  speed: 10 },
        9:  { name: '9阶士兵', attack: 3597, hp: 16786, defense: 1499, speed: 10 },
        10: { name: '10阶士兵', attack: 6000, hp: 28000, defense: 2500, speed: 10 }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SOLDIER_CONFIG_EXTERNAL: SOLDIER_CONFIG_EXTERNAL };
}
