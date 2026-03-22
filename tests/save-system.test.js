// tests/save-system.test.js — SaveSystem 属性测试与单元测试
// Feature: local-save-system

const fc = require('fast-check');
const { RESOURCE_CONFIG_EXTERNAL } = require('../resource-config');
const { JOB_CONFIG_EXTERNAL } = require('../job-config');
const { FACILITY_CONFIG_EXTERNAL } = require('../facility-config');

// 注入全局配置（outside-logic.js 中通过 typeof 检查访问）
global.RESOURCE_CONFIG_EXTERNAL = RESOURCE_CONFIG_EXTERNAL;
global.JOB_CONFIG_EXTERNAL = JOB_CONFIG_EXTERNAL;
global.FACILITY_CONFIG_EXTERNAL = FACILITY_CONFIG_EXTERNAL;

const { SaveSystem } = require('../outside-logic');
const { ProgressTracker } = require('../inside-logic');

// 注入 ProgressTracker 到全局（outside-logic.js 中 save() 通过 typeof 检查全局引用）
global.ProgressTracker = ProgressTracker;

// ============================================================
// localStorage Mock
// ============================================================
function createMockStorage() {
    var store = {};
    return {
        getItem: function(key) { return store[key] !== undefined ? store[key] : null; },
        setItem: function(key, value) { store[key] = String(value); },
        removeItem: function(key) { delete store[key]; },
        clear: function() { store = {}; },
        _store: store
    };
}

beforeEach(() => {
    global.localStorage = createMockStorage();
});

afterEach(() => {
    delete global.localStorage;
});

// ============================================================
// fast-check 生成器（Arbitraries）
// ============================================================

const RESOURCE_KEYS = Object.keys(RESOURCE_CONFIG_EXTERNAL.resources);
const JOB_KEYS = Object.keys(JOB_CONFIG_EXTERNAL.jobs);
const BUILDING_KEYS = Object.keys(JOB_CONFIG_EXTERNAL.buildings);

/** 17 种资源的随机非负整数对象 */
function arbResources() {
    var entries = RESOURCE_KEYS.map(function(key) {
        return fc.nat().map(function(v) { return [key, v]; });
    });
    return fc.tuple.apply(fc, entries).map(function(pairs) {
        var obj = {};
        for (var i = 0; i < pairs.length; i++) {
            obj[pairs[i][0]] = pairs[i][1];
        }
        return obj;
    });
}

/** 工匠容量 */
function arbCraftsman() {
    return fc.record({ totalCapacity: fc.nat() });
}

/** 岗位分配（从 JOB_CONFIG_EXTERNAL.jobs 读取 key） */
function arbJobs() {
    var entries = JOB_KEYS.map(function(key) {
        return fc.nat().map(function(v) { return [key, v]; });
    });
    return fc.tuple.apply(fc, entries).map(function(pairs) {
        var obj = {};
        for (var i = 0; i < pairs.length; i++) {
            obj[pairs[i][0]] = pairs[i][1];
        }
        return obj;
    });
}

/** 建筑数量（从 JOB_CONFIG_EXTERNAL.buildings 读取 key） */
function arbBuildings() {
    var entries = BUILDING_KEYS.map(function(key) {
        return fc.nat().map(function(v) { return [key, v]; });
    });
    return fc.tuple.apply(fc, entries).map(function(pairs) {
        var obj = {};
        for (var i = 0; i < pairs.length; i++) {
            obj[pairs[i][0]] = pairs[i][1];
        }
        return obj;
    });
}

/** 单个士兵 */
function arbSoldier() {
    return fc.record({
        tier: fc.integer({ min: 1, max: 10 }),
        attack: fc.nat(),
        defense: fc.nat(),
        hp: fc.nat(),
        speed: fc.nat()
    });
}

/** 0-20 个士兵数组 */
function arbSoldiers() {
    return fc.array(arbSoldier(), { minLength: 0, maxLength: 20 });
}

/** 地牢进度 */
function arbDungeonProgress() {
    return fc.record({
        unlockedLayers: fc.array(fc.integer({ min: 1, max: 50 }), { minLength: 1, maxLength: 10 }).map(function(arr) {
            // 确保包含 1
            if (arr.indexOf(1) === -1) arr.unshift(1);
            return arr;
        }),
        completedLayers: fc.array(fc.integer({ min: 1, max: 50 }), { maxLength: 10 }),
        layerProgress: fc.tuple(
            fc.array(fc.integer({ min: 1, max: 20 }), { minLength: 0, maxLength: 5 }),
            fc.array(fc.record({
                fogState: fc.option(fc.array(fc.constant('0101010'), { minLength: 1, maxLength: 3 }), { nil: undefined }),
                bossDefeated: fc.option(fc.boolean(), { nil: undefined }),
                reached: fc.option(fc.boolean(), { nil: undefined })
            }), { minLength: 0, maxLength: 5 })
        ).map(function(pair) {
            var keys = pair[0], vals = pair[1];
            var obj = {};
            for (var i = 0; i < Math.min(keys.length, vals.length); i++) {
                obj[String(keys[i])] = vals[i];
            }
            return obj;
        }),
        bestRecords: fc.constant({}),
        capturedFacilities: fc.array(
            fc.constantFrom('lumber_mill', 'stone_mine', 'iron_mine', 'gold_mine', 'layer1_lumber', 'layer1_stone', 'layer5_iron'),
            { maxLength: 5 }
        )
    });
}

/** 组合所有生成器：完整有效 SaveData */
function arbSaveData() {
    return fc.tuple(
        arbResources(),
        arbCraftsman(),
        arbJobs(),
        arbBuildings(),
        arbSoldiers(),
        arbDungeonProgress()
    ).map(function(parts) {
        return {
            resources: parts[0],
            craftsman: parts[1],
            jobs: parts[2],
            buildings: parts[3],
            soldiers: parts[4],
            dungeon: parts[5]
        };
    });
}

/** 损坏的 JSON 字符串 */
function arbCorruptJson() {
    return fc.oneof(
        // 完全非法 JSON
        fc.stringOf(fc.fullUnicode(), { minLength: 1, maxLength: 50 }),
        // 截断的 JSON
        fc.constant('{"gold":'),
        fc.constant('{'),
        fc.constant('null'),
        fc.constant('42'),
        fc.constant('"hello"'),
        fc.constant('[]'),
        // 类型错误的字段
        fc.constant(JSON.stringify({ gold: "not_a_number", soldiers: "bad", craftsman: 123 })),
        fc.constant(JSON.stringify({ soldiers: [{ tier: "bad" }], jobs: "string" })),
        fc.constant(JSON.stringify({ dungeon: "not_object", version: "v1" }))
    );
}

// 导出生成器供外部使用（可选）
module.exports = {
    createMockStorage,
    arbResources,
    arbCraftsman,
    arbJobs,
    arbBuildings,
    arbSoldier,
    arbSoldiers,
    arbDungeonProgress,
    arbSaveData,
    arbCorruptJson
};

// ============================================================
// 基础 Smoke Test — 验证测试基础设施正常工作
// ============================================================
describe('Test Infrastructure', () => {
    test('createMockStorage works as localStorage', () => {
        localStorage.setItem('key', 'value');
        expect(localStorage.getItem('key')).toBe('value');
        localStorage.removeItem('key');
        expect(localStorage.getItem('key')).toBeNull();
    });

    test('SaveSystem is loaded', () => {
        expect(SaveSystem).toBeDefined();
        expect(typeof SaveSystem.save).toBe('function');
        expect(typeof SaveSystem.load).toBe('function');
        expect(SaveSystem.CURRENT_VERSION).toBe(2);
    });

    test('ProgressTracker is loaded', () => {
        expect(ProgressTracker).toBeDefined();
        expect(typeof ProgressTracker.saveProgress).toBe('function');
    });

    test('configs are available globally', () => {
        expect(RESOURCE_CONFIG_EXTERNAL.resources).toBeDefined();
        expect(Object.keys(RESOURCE_CONFIG_EXTERNAL.resources).length).toBe(17);
        expect(JOB_CONFIG_EXTERNAL.jobs).toBeDefined();
        expect(FACILITY_CONFIG_EXTERNAL.defaultUnlockedJobs).toBeDefined();
    });

    test('fast-check generators produce valid data', () => {
        fc.assert(fc.property(arbSaveData(), function(data) {
            expect(data.resources).toBeDefined();
            expect(data.craftsman).toBeDefined();
            expect(data.soldiers).toBeDefined();
            expect(data.dungeon).toBeDefined();
            expect(data.dungeon.unlockedLayers).toContain(1);
            return true;
        }), { numRuns: 10 });
    });
});

// ============================================================
// Property 1: Save/Load Round-Trip
// Feature: local-save-system, Property 1: Save/Load Round-Trip
// 对任意有效游戏状态，save() 后 load() 应产生等价对象
// Validates: Requirements 1.1, 1.2, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 5.3, 6.1, 6.2, 7.3
// ============================================================
describe('Property 1: Save/Load Round-Trip', () => {
    test('save() then load() produces equivalent object for any valid game state', () => {
        fc.assert(fc.property(arbSaveData(), function(data) {
            // 设置 ProgressTracker 状态，因为 save() 内部调用 ProgressTracker.saveProgress()
            ProgressTracker.init(data.dungeon);

            // 执行 save
            SaveSystem.save(data.resources, data.craftsman, data.jobs, data.buildings, data.soldiers);

            // 执行 load
            var loaded = SaveSystem.load();

            // 校验资源 round-trip
            for (var i = 0; i < RESOURCE_KEYS.length; i++) {
                var key = RESOURCE_KEYS[i];
                expect(loaded[key]).toBe(data.resources[key]);
            }

            // 校验工匠
            expect(loaded.craftsman.totalCapacity).toBe(data.craftsman.totalCapacity);

            // 校验岗位
            for (var i = 0; i < JOB_KEYS.length; i++) {
                var jk = JOB_KEYS[i];
                expect(loaded.jobs[jk]).toBe(data.jobs[jk]);
            }

            // 校验建筑
            for (var i = 0; i < BUILDING_KEYS.length; i++) {
                var bk = BUILDING_KEYS[i];
                expect(loaded.buildings[bk]).toBe(data.buildings[bk]);
            }

            // 校验士兵
            expect(loaded.soldiers.length).toBe(data.soldiers.length);
            for (var i = 0; i < data.soldiers.length; i++) {
                expect(loaded.soldiers[i].tier).toBe(data.soldiers[i].tier);
                expect(loaded.soldiers[i].attack).toBe(data.soldiers[i].attack);
                expect(loaded.soldiers[i].defense).toBe(data.soldiers[i].defense);
                expect(loaded.soldiers[i].hp).toBe(data.soldiers[i].hp);
                expect(loaded.soldiers[i].speed).toBe(data.soldiers[i].speed);
            }

            // 校验地牢进度
            expect(loaded.dungeon).not.toBeNull();
            var savedDungeon = ProgressTracker.saveProgress();
            expect(loaded.dungeon.unlockedLayers).toEqual(savedDungeon.unlockedLayers);
            expect(loaded.dungeon.completedLayers).toEqual(savedDungeon.completedLayers);
            expect(loaded.dungeon.capturedFacilities).toEqual(savedDungeon.capturedFacilities);

            // 校验版本
            expect(loaded.version).toBe(SaveSystem.CURRENT_VERSION);
        }), { numRuns: 100 });
    });
});

// ============================================================
// Property 5: Version Migration Produces Current Version with Complete Fields
// Feature: local-save-system, Property 5: Version Migration Produces Current Version
// 对任意 v1 存档（无 version、无 dungeon、士兵无 speed），load() 后 version 等于 CURRENT_VERSION
// Validates: Requirements 8.2, 8.3, 8.4
// ============================================================
describe('Property 5: Version Migration Produces Current Version', () => {
    test('v1 save data (no version, no dungeon, soldiers without speed) migrates correctly', () => {
        fc.assert(fc.property(
            arbResources(),
            arbCraftsman(),
            arbJobs(),
            arbBuildings(),
            arbSoldiers(),
            function(resources, craftsman, jobs, buildings, soldiers) {
                // 构造 v1 存档：无 version、无 dungeon、士兵无 speed
                var v1Data = {};
                for (var i = 0; i < RESOURCE_KEYS.length; i++) {
                    v1Data[RESOURCE_KEYS[i]] = resources[RESOURCE_KEYS[i]];
                }
                v1Data.craftsman = craftsman;
                v1Data.jobs = jobs;
                v1Data.buildings = buildings;
                v1Data.soldiers = soldiers.map(function(s) {
                    return { tier: s.tier, attack: s.attack, defense: s.defense, hp: s.hp };
                    // 故意省略 speed
                });
                // 故意不设 version 和 dungeon

                localStorage.setItem(SaveSystem.STORAGE_KEY, JSON.stringify(v1Data));
                var loaded = SaveSystem.load();

                // (a) version 等于 CURRENT_VERSION
                expect(loaded.version).toBe(SaveSystem.CURRENT_VERSION);

                // (b) dungeon 为 null（v1 无 dungeon，迁移后补为 null）
                expect(loaded.dungeon).toBeNull();

                // (c) 每个士兵有 numeric speed
                for (var i = 0; i < loaded.soldiers.length; i++) {
                    expect(typeof loaded.soldiers[i].speed).toBe('number');
                }
            }
        ), { numRuns: 100 });
    });
});

// ============================================================
// Property 6: Save Always Writes Current Version
// Feature: local-save-system, Property 6: Save Always Writes Current Version
// 对任意有效游戏状态，save() 后 localStorage 中的 JSON 包含 version === CURRENT_VERSION
// Validates: Requirements 8.1
// ============================================================
describe('Property 6: Save Always Writes Current Version', () => {
    test('save() always writes CURRENT_VERSION to localStorage', () => {
        fc.assert(fc.property(arbSaveData(), function(data) {
            ProgressTracker.init(data.dungeon);
            SaveSystem.save(data.resources, data.craftsman, data.jobs, data.buildings, data.soldiers);

            var raw = localStorage.getItem(SaveSystem.STORAGE_KEY);
            expect(raw).not.toBeNull();
            var parsed = JSON.parse(raw);
            expect(parsed.version).toBe(SaveSystem.CURRENT_VERSION);
        }), { numRuns: 100 });
    });
});
