// outside-config.js — 关外经营系统外置配置
var OUTSIDE_CONFIG_EXTERNAL = {
    alchemy: {
        cooldown: 5000,       // 炼金冷却时间（毫秒）
        goldAmount: 1         // 每次产生的金币数量
    },
    collect: {
        cooldown: 10000,      // 收集冷却时间（毫秒）
        stoneMin: 3,          // 石头最小产出
        stoneMax: 6,          // 石头最大产出
        woodMin: 3,           // 木头最小产出
        woodMax: 6            // 木头最大产出
    },
    canvas: {
        width: 800,
        height: 600
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OUTSIDE_CONFIG_EXTERNAL: OUTSIDE_CONFIG_EXTERNAL };
}
