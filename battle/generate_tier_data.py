# -*- coding: utf-8 -*-
"""生成标准士兵/敌人属性表数值（满足三条约束）"""
import math

K_def = 200

# 设计参数
# 1阶基准（参考3-推导数值层5）
tier1_enemy_atk = 40
tier1_enemy_def = 20
tier1_enemy_hp = 350

tier1_soldier_atk = 60
tier1_soldier_def = 25
tier1_soldier_hp = 280

# 成长系数：前10阶1.18，11-20阶1.15，21-23阶1.12（避免23阶爆炸）
growth_early = 1.18
growth_mid = 1.15
growth_late = 1.12

# 队伍数量：士兵1-6阶递增，7-23阶保持6；敌人都是1
def get_party_count(tier):
    if tier <= 6:
        return tier
    return 6

# 计算单次伤害
def calc_damage(attacker_atk, attacker_party, defender_def):
    return (attacker_atk * attacker_party * K_def) / (defender_def + K_def)

# 计算刀数
def calc_hits(defender_hp, damage_per_hit):
    return math.ceil(defender_hp / damage_per_hit) if damage_per_hit > 0 else 999

# 生成23阶数据
tiers = []
for tier in range(1, 24):
    # 成长系数
    if tier <= 10:
        growth = growth_early ** (tier - 1)
    elif tier <= 20:
        growth = growth_early ** 9 * growth_mid ** (tier - 10)
    else:
        growth = growth_early ** 9 * growth_mid ** 10 * growth_late ** (tier - 20)
    
    # 敌人属性
    enemy_atk = round(tier1_enemy_atk * growth)
    enemy_def = round(tier1_enemy_def * growth)
    enemy_hp = round(tier1_enemy_hp * growth)
    
    # 士兵属性
    soldier_atk = round(tier1_soldier_atk * growth)
    soldier_def = round(tier1_soldier_def * growth)
    soldier_hp = round(tier1_soldier_hp * growth)
    
    soldier_party = get_party_count(tier)
    enemy_party = 1
    
    # 验算：士兵打同阶敌人
    dmg_s2e = calc_damage(soldier_atk, soldier_party, enemy_def)
    hits_s2e = calc_hits(enemy_hp, dmg_s2e)
    
    # 验算：士兵打低一阶敌人（tier >= 2）
    if tier >= 2:
        prev_tier_idx = tier - 2
        if prev_tier_idx < 9:
            prev_growth = growth_early ** prev_tier_idx
        elif prev_tier_idx < 19:
            prev_growth = growth_early ** 9 * growth_mid ** (prev_tier_idx - 9)
        else:
            prev_growth = growth_early ** 9 * growth_mid ** 10 * growth_late ** (prev_tier_idx - 19)
        prev_enemy_def = round(tier1_enemy_def * prev_growth)
        prev_enemy_hp = round(tier1_enemy_hp * prev_growth)
        dmg_s2e_low = calc_damage(soldier_atk, soldier_party, prev_enemy_def)
        hits_s2e_low = calc_hits(prev_enemy_hp, dmg_s2e_low)
    else:
        hits_s2e_low = None
    
    # 验算：敌人打同阶士兵
    dmg_e2s = calc_damage(enemy_atk, enemy_party, soldier_def)
    hits_e2s = calc_hits(soldier_hp * soldier_party, dmg_e2s)
    
    tiers.append({
        'tier': tier,
        'enemy': {
            'atk': enemy_atk,
            'def': enemy_def,
            'hp': enemy_hp,
            'party': enemy_party
        },
        'soldier': {
            'atk': soldier_atk,
            'def': soldier_def,
            'hp': soldier_hp,
            'party': soldier_party
        },
        'hits_s2e': hits_s2e,  # 士兵打同阶
        'hits_s2e_low': hits_s2e_low,  # 士兵打低一阶
        'hits_e2s': hits_e2s  # 敌人打同阶
    })

# 输出CSV格式
print("=== 4-标准士兵表 ===")
print("阶数,攻击,血量,防御,队伍数量,攻击同等阶敌人刀数,攻击上一阶敌人刀数,攻击下一阶敌人刀数")
for t in tiers:
    prev_hits = t['hits_s2e_low'] if t['hits_s2e_low'] is not None else ""
    next_tier = tiers[t['tier']] if t['tier'] < 23 else None
    next_hits = ""
    if next_tier:
        dmg_next = calc_damage(t['soldier']['atk'], t['soldier']['party'], next_tier['enemy']['def'])
        next_hits = calc_hits(next_tier['enemy']['hp'], dmg_next)
    
    print(f"{t['tier']},{t['soldier']['atk']},{t['soldier']['hp']},{t['soldier']['def']},{t['soldier']['party']},{t['hits_s2e']},{prev_hits},{next_hits}")

print("\n=== 5-标准敌人表 ===")
print("阶数,攻击,血量,血量增加,防御,防御增加,队伍数量,攻击同等阶士兵刀数（士兵x上阵数量）,攻击上一阶士兵刀数,攻击下一阶士兵刀数")
for i, t in enumerate(tiers):
    hp_inc = t['enemy']['hp'] - tiers[i-1]['enemy']['hp'] if i > 0 else ""
    def_inc = t['enemy']['def'] - tiers[i-1]['enemy']['def'] if i > 0 else ""
    
    prev_tier = tiers[i-1] if i > 0 else None
    prev_hits = ""
    if prev_tier:
        dmg_prev = calc_damage(t['enemy']['atk'], t['enemy']['party'], prev_tier['soldier']['def'])
        prev_hits = calc_hits(prev_tier['soldier']['hp'] * prev_tier['soldier']['party'], dmg_prev)
    
    next_tier = tiers[i+1] if i < 22 else None
    next_hits = ""
    if next_tier:
        dmg_next = calc_damage(t['enemy']['atk'], t['enemy']['party'], next_tier['soldier']['def'])
        next_hits = calc_hits(next_tier['soldier']['hp'] * next_tier['soldier']['party'], dmg_next)
    
    print(f"{t['tier']},{t['enemy']['atk']},{t['enemy']['hp']},{hp_inc},{t['enemy']['def']},{def_inc},{t['enemy']['party']},{t['hits_e2s']},{prev_hits},{next_hits}")

# 验证约束
print("\n=== 约束验证 ===")
print("同阶刀数应在[6,10]区间，打低一阶应≤3刀")
for t in tiers:
    same_ok = 6 <= t['hits_s2e'] <= 10
    low_ok = t['hits_s2e_low'] is None or t['hits_s2e_low'] <= 3
    status = "✓" if (same_ok and low_ok) else "✗"
    print(f"阶{t['tier']}: 同阶{t['hits_s2e']}刀 {'✓' if same_ok else '✗'}, "
          f"打低一阶{t['hits_s2e_low'] if t['hits_s2e_low'] else 'N/A'}刀 {'✓' if low_ok else '✗'} {status}")
