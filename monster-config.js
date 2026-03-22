// monster-config.js — 怪物外置配置（基于标准敌人表-10阶-减法）
// 每个怪物对应一个阶数，属性来自 battle/手动表-5-标准敌人表.json
var MONSTER_CONFIG_EXTERNAL = {
    monsters: {
        // 1阶怪物（第1层）
        slime: {
            name: '史莱姆',
            tier: 1,
            stats: { hp: 320, attack: 54, defense: 20, speed: 7 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 3, max: 8 }, exp: 10 }
        },
        bat: {
            name: '蝙蝠',
            tier: 1,
            stats: { hp: 320, attack: 54, defense: 20, speed: 8 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 2, max: 6 }, exp: 8 }
        },
        rat: {
            name: '巨鼠',
            tier: 1,
            stats: { hp: 320, attack: 54, defense: 20, speed: 7 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 3, max: 7 }, exp: 9 }
        },
        // 2阶怪物（第2层）
        skeleton: {
            name: '骷髅',
            tier: 2,
            stats: { hp: 1336, attack: 89, defense: 33, speed: 7 },
            skills: ['basic_attack', 'power_strike'],
            rewards: { gold: { min: 8, max: 20 }, exp: 25 }
        },
        ghost: {
            name: '幽灵',
            tier: 2,
            stats: { hp: 1336, attack: 89, defense: 33, speed: 8 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 10, max: 25 }, exp: 30 }
        },
        spider: {
            name: '巨蛛',
            tier: 2,
            stats: { hp: 1336, attack: 89, defense: 33, speed: 7 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 8, max: 18 }, exp: 20 }
        },
        // 3阶怪物（第3层）
        mushroom: {
            name: '毒蘑菇',
            tier: 3,
            stats: { hp: 3560, attack: 187, defense: 56, speed: 7 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 20, max: 50 }, exp: 60 }
        },
        cave_worm: {
            name: '洞穴蠕虫',
            tier: 3,
            stats: { hp: 3560, attack: 187, defense: 56, speed: 6 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 25, max: 55 }, exp: 65 }
        },

        // 4阶怪物（第4层）
        fire_imp: {
            name: '火焰小鬼',
            tier: 4,
            stats: { hp: 8152, attack: 376, defense: 93, speed: 8 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 40, max: 100 }, exp: 120 }
        },
        lava_hound: {
            name: '熔岩犬',
            tier: 4,
            stats: { hp: 8152, attack: 376, defense: 93, speed: 7 },
            skills: ['basic_attack', 'power_strike'],
            rewards: { gold: { min: 50, max: 110 }, exp: 130 }
        },
        // 5阶怪物（第6层，跳过第5层资源层）
        frost_elemental: {
            name: '冰霜元素',
            tier: 5,
            stats: { hp: 17360, attack: 736, defense: 155, speed: 7 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 80, max: 200 }, exp: 250 }
        },
        ice_wraith: {
            name: '冰魂',
            tier: 5,
            stats: { hp: 17360, attack: 736, defense: 155, speed: 8 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 90, max: 220 }, exp: 270 }
        },
        // 6阶怪物（第7层）
        stone_guardian: {
            name: '石像守卫',
            tier: 6,
            stats: { hp: 35136, attack: 1408, defense: 258, speed: 6 },
            skills: ['basic_attack', 'power_strike'],
            rewards: { gold: { min: 150, max: 400 }, exp: 500 }
        },
        ancient_spirit: {
            name: '远古亡灵',
            tier: 6,
            stats: { hp: 35136, attack: 1408, defense: 258, speed: 7 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 160, max: 420 }, exp: 520 }
        },
        // 7阶怪物（第8层）
        swamp_beast: {
            name: '沼泽兽',
            tier: 7,
            stats: { hp: 58616, attack: 2349, defense: 431, speed: 7 },
            skills: ['basic_attack', 'power_strike'],
            rewards: { gold: { min: 300, max: 700 }, exp: 900 }
        },
        poison_drake: {
            name: '毒龙',
            tier: 7,
            stats: { hp: 58616, attack: 2349, defense: 431, speed: 8 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 320, max: 750 }, exp: 950 }
        },
        // 8阶怪物（第9层）
        void_shade: {
            name: '虚空暗影',
            tier: 8,
            stats: { hp: 97736, attack: 3917, defense: 719, speed: 8 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 500, max: 1200 }, exp: 1500 }
        },
        rift_stalker: {
            name: '裂隙猎手',
            tier: 8,
            stats: { hp: 97736, attack: 3917, defense: 719, speed: 7 },
            skills: ['basic_attack', 'power_strike'],
            rewards: { gold: { min: 550, max: 1300 }, exp: 1600 }
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MONSTER_CONFIG_EXTERNAL: MONSTER_CONFIG_EXTERNAL };
}
