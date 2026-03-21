# -*- coding: utf-8 -*-
"""H[t+1] = max(ceil(8*D同阶(t+1)), ceil(20*D_{t打t+1}))；H[1]=ceil(8*D同阶(1))。"""
import math

K_DEF = 200
TIER1_S_ATK, TIER1_S_DEF, TIER1_S_HP = 60, 25, 280
TIER1_E_ATK, TIER1_E_DEF = 40, 20
G_EARLY, G_MID, G_LATE = 1.18, 1.15, 1.12


def growth_for_tier(tier: int) -> float:
    if tier <= 10:
        return G_EARLY ** (tier - 1)
    if tier <= 20:
        return G_EARLY ** 9 * G_MID ** (tier - 10)
    return G_EARLY ** 9 * G_MID ** 10 * G_LATE ** (tier - 20)


def party_soldier(tier: int) -> int:
    return min(tier, 6)


def dmg(atk: float, party: int, def_: float) -> float:
    return atk * party * K_DEF / (def_ + K_DEF)


def ceil_hits(hp: float, d: float) -> int:
    if d <= 0:
        return 999
    return math.ceil(hp / d - 1e-12)


def main():
    T = []
    for t in range(1, 24):
        g = growth_for_tier(t)
        T.append(
            {
                "tier": t,
                "s_atk": round(TIER1_S_ATK * g),
                "s_def": round(TIER1_S_DEF * g),
                "s_hp": round(TIER1_S_HP * g),
                "e_atk": round(TIER1_E_ATK * g),
                "e_def": round(TIER1_E_DEF * g),
                "n_s": party_soldier(t),
                "n_e": 1,
            }
        )

    e_hp = [0] * 24
    t0 = T[0]
    e_hp[1] = math.ceil(8 * dmg(t0["s_atk"], t0["n_s"], t0["e_def"]) - 1e-9)

    for t in range(1, 23):
        tt = T[t - 1]
        t1 = T[t]
        d_same_next = dmg(t1["s_atk"], t1["n_s"], t1["e_def"])
        d_t_to_next = dmg(tt["s_atk"], tt["n_s"], t1["e_def"])
        e_hp[t + 1] = max(
            math.ceil(8 * d_same_next - 1e-9),
            math.ceil(20 * d_t_to_next - 1e-9),
        )

    # 验算
    rows = []
    for t in range(1, 24):
        tt = T[t - 1]
        hp = e_hp[t]
        d_same = dmg(tt["s_atk"], tt["n_s"], tt["e_def"])
        hs = ceil_hits(hp, d_same)
        if t >= 2:
            tm1 = T[t - 2]
            d_pm = dmg(tm1["s_atk"], tm1["n_s"], tt["e_def"])
            hv = ceil_hits(hp, d_pm)
        else:
            hv = None
        if t <= 22:
            tn = T[t]
            d_tn = dmg(tt["s_atk"], tt["n_s"], tn["e_def"])
            hn = ceil_hits(e_hp[t + 1], d_tn)
        else:
            hn = None
        rows.append((t, tt, hp, hs, hv, hn))

    for t, tt, hp, hs, hv, hn in rows:
        print(
            f"t={t} e_hp={hp} 同阶{hs}刀 上一阶打本阶{hv} 打下一阶敌{hn}"
        )

    # CSV 士兵
    print("\n=== 士兵表 ===")
    print("阶数,攻击,血量,防御,队伍数量")
    for t in range(1, 24):
        x = T[t - 1]
        print(f"{t},{x['s_atk']},{x['s_hp']},{x['s_def']},{x['n_s']}")

    print("\n=== 敌人表 ===")
    print("阶数,攻击,血量,血量增加,防御,防御增加,队伍数量")
    for t in range(1, 24):
        x = T[t - 1]
        inc = e_hp[t] - e_hp[t - 1] if t > 1 else ""
        dinc = x["e_def"] - T[t - 2]["e_def"] if t > 1 else ""
        print(f"{t},{x['e_atk']},{e_hp[t]},{inc},{x['e_def']},{dinc},{x['n_e']}")


if __name__ == "__main__":
    main()
