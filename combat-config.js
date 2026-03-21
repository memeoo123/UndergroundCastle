// combat-config.js — 战斗行为外置配置（减法公式）
var COMBAT_CONFIG_EXTERNAL = {
    // 减法伤害公式参数
    damageFormula: {
        type: 'subtraction',           // 减法公式：max(D_min, (攻击-防御)*人数)
        D_min: 1,                      // 伤害下限
        skillMultiplierDefault: 1.0    // 默认技能倍率
    },
    // ATB 常数
    atb: {
        atb_max: 10000,                // ATB 时间条满值
        speed_baseline: 10,            // 基准速度：速度=10 时 1秒满条
        atb_speed_factor: 1000         // 每秒增量 = 速度 × 此系数
    },
    skills: {
        basic_attack: {
            name: '普通攻击',
            type: 'physical',
            multiplier: 1.0,
            cooldown: 0
        },
        power_strike: {
            name: '重击',
            type: 'physical',
            multiplier: 1.5,
            cooldown: 2
        },
        war_cry: {
            name: '战吼',
            type: 'buff',
            effect: { stat: 'attack', bonus: 3, duration: 3 },
            cooldown: 4
        },
        defend: {
            name: '防御',
            type: 'buff',
            effect: { stat: 'defense', bonus: 5, duration: 1 },
            cooldown: 0
        }
    },
    statusEffects: {
        poison: { name: '中毒', damagePerTurn: 2, duration: 3 },
        attackUp: { name: '攻击提升', stat: 'attack', bonus: 3, duration: 3 },
        defenseUp: { name: '防御提升', stat: 'defense', bonus: 5, duration: 1 }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { COMBAT_CONFIG_EXTERNAL: COMBAT_CONFIG_EXTERNAL };
}
