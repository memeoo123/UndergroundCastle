// monster-config.js — 怪物外置配置
var MONSTER_CONFIG_EXTERNAL = {
    monsters: {
        slime: {
            name: '史莱姆',
            stats: { hp: 10, attack: 2, defense: 1, speed: 3 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 1, max: 3 }, exp: 5 }
        },
        bat: {
            name: '蝙蝠',
            stats: { hp: 8, attack: 3, defense: 0, speed: 7 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 1, max: 2 }, exp: 4 }
        },
        rat: {
            name: '巨鼠',
            stats: { hp: 12, attack: 3, defense: 2, speed: 4 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 2, max: 4 }, exp: 6 }
        },
        skeleton: {
            name: '骷髅',
            stats: { hp: 18, attack: 5, defense: 3, speed: 3 },
            skills: ['basic_attack', 'power_strike'],
            rewards: { gold: { min: 3, max: 8 }, exp: 10 }
        },
        ghost: {
            name: '幽灵',
            stats: { hp: 14, attack: 6, defense: 1, speed: 6 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 4, max: 10 }, exp: 12 }
        },
        spider: {
            name: '巨蛛',
            stats: { hp: 16, attack: 4, defense: 2, speed: 5 },
            skills: ['basic_attack'],
            rewards: { gold: { min: 3, max: 7 }, exp: 8 }
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MONSTER_CONFIG_EXTERNAL: MONSTER_CONFIG_EXTERNAL };
}
