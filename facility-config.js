// facility-config.js — 可占领设施配置
// 定义各层可占领的矿产设施，以及占领后解锁的工作岗位
var FACILITY_CONFIG_EXTERNAL = {
    // 默认解锁的岗位（不需要占领任何设施）
    defaultUnlockedJobs: ['farmer', 'baker'],

    // 设施类型 → 解锁岗位映射（资源层和随机层通用）
    facilityTypeUnlocks: {
        lumber_mill: ['lumberjack'],
        stone_mine: ['quarrier'],
        iron_mine: ['ironMiner'],
        gold_mine: ['goldMiner'],
        steel_forge: ['steelsmith'],
        crystal_mine: ['crystalsmith'],
        rune_altar: ['runesmith'],
        darksteel_vein: ['darksteelsmith']
    },

    // 各层可占领设施（随机层中的固定位置设施）
    // layerFacilities[layerId] = [ { id, x, y, type, name, unlockJobs: [...] } ]
    layerFacilities: {
        1: [
            { id: 'layer1_lumber', x: 8, y: 8, type: 'lumber_mill', name: '木材厂', unlockJobs: ['lumberjack'] },
            { id: 'layer1_stone', x: 42, y: 42, type: 'stone_mine', name: '石头矿', unlockJobs: ['quarrier'] }
        ],
        5: [
            { id: 'layer5_iron', x: 5, y: 5, type: 'iron_mine', name: '铁矿场', unlockJobs: ['ironMiner'] }
        ]
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FACILITY_CONFIG_EXTERNAL: FACILITY_CONFIG_EXTERNAL };
}
