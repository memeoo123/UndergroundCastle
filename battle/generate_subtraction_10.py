# -*- coding: utf-8 -*-
"""
十阶封闭环境 · 减法公式试算
士兵单次伤害 = max(D_min, 攻击×技能×人数 − 守方防御)，技能=1
同阶士兵打同阶敌：目标刀数 TARGET_SAME_SOLDIER = 8（反推敌血量）

敌人攻击 e_atk 在「与士兵攻防同曲线初值」之后单独调参：
- 目标：敌打同阶士兵总血池约 TARGET_ENEMY_SAME 刀（默认 20）
- 约束：e_atk >= 下一阶士兵防御 + GAP_NEXT_DEF，减轻「打下一阶士」时攻防差过小 / 仅吃 D_min 的离谱刀数
"""
import math
import os

D_MIN = 1
TARGET_SAME_SOLDIER = 8  # 同阶士兵打同阶敌期望刀数
TARGET_ENEMY_SAME = 20  # 敌打同阶士兵总血池期望刀数（可调）
GAP_NEXT_DEF = 12  # e_atk >= s_def(下一阶) + GAP，保证跨阶时仍有一定有效伤害

ORDER_SPAN = 100

S1_ATK, S1_DEF, S1_HP = 60, 25, 280
E1_ATK, E1_DEF = 40, 20


def scale(t: int) -> float:
    return ORDER_SPAN ** ((t - 1) / 9)


def party(t):
    return min(t, 6)


def dmg_sub(atk, party_n, def_):
    return max(D_MIN, atk * party_n * 1 - def_)


def ceil_hits(hp, d):
    if d <= 0:
        return 999
    return math.ceil(hp / d - 1e-12)


def tune_enemy_atk(rows_e, rows_s):
    """按「敌打同阶阵」目标刀数 + 跨阶下限反推敌人攻击（不改敌血、敌防，不影响士兵打敌）。"""
    for i, re in enumerate(rows_e):
        t = re["tier"]
        rs = rows_s[i]
        pool = rs["s_hp"] * rs["n"]
        s_def = rs["s_def"]
        d_per_hit_target = pool / TARGET_ENEMY_SAME
        e_atk = max(1, round(s_def + d_per_hit_target))
        if t < 10:
            s_def_next = rows_s[i + 1]["s_def"]
            e_atk = max(e_atk, s_def_next + GAP_NEXT_DEF)
        re["e_atk"] = e_atk


def main():
    rows_s = []
    rows_e = []

    for t in range(1, 11):
        g = scale(t)
        s_atk = max(1, round(S1_ATK * g))
        s_def = max(0, round(S1_DEF * g))
        s_hp = max(1, round(S1_HP * g))
        e_def = max(0, round(E1_DEF * g))
        n = party(t)

        d_same = dmg_sub(s_atk, n, e_def)
        e_hp = TARGET_SAME_SOLDIER * d_same
        h_same = ceil_hits(e_hp, d_same)

        if t >= 2:
            e_def_prev = max(0, round(E1_DEF * scale(t - 1)))
            e_hp_prev = rows_e[t - 2]["e_hp"]
            d_up = dmg_sub(s_atk, n, e_def_prev)
            h_up = ceil_hits(e_hp_prev, d_up)
        else:
            h_up = ""

        rows_e.append(
            dict(
                tier=t,
                e_atk=max(1, round(E1_ATK * g)),
                e_def=e_def,
                e_hp=e_hp,
            )
        )
        rows_s.append(
            dict(
                tier=t,
                s_atk=s_atk,
                s_def=s_def,
                s_hp=s_hp,
                n=n,
                h_same=h_same,
                h_up=h_up,
            )
        )

    tune_enemy_atk(rows_e, rows_s)

    for i, rs in enumerate(rows_s):
        if rs["tier"] <= 9:
            ne = rows_e[i + 1]
            d_to_next = dmg_sub(rs["s_atk"], rs["n"], ne["e_def"])
            rs["h_down"] = ceil_hits(ne["e_hp"], d_to_next)
        else:
            rs["h_down"] = ""

    for i, re in enumerate(rows_e):
        rs = rows_s[i]
        d_e = max(D_MIN, re["e_atk"] - rs["s_def"])
        total_hp = rs["s_hp"] * rs["n"]
        re["hits_e_vs_s"] = ceil_hits(total_hp, d_e)

    for i, re in enumerate(rows_e):
        t = re["tier"]
        if t < 10:
            rs_n = rows_s[i + 1]
            pool_n = rs_n["s_hp"] * rs_n["n"]
            d_cross = max(D_MIN, re["e_atk"] - rs_n["s_def"])
            re["hits_next_soldier"] = ceil_hits(pool_n, d_cross)
        else:
            re["hits_next_soldier"] = ""

    base = os.path.dirname(os.path.abspath(__file__))
    sol = os.path.join(base, "标准士兵表-10阶-减法.csv")
    ene = os.path.join(base, "标准敌人表-10阶-减法.csv")

    with open(sol, "w", encoding="utf-8-sig", newline="") as f:
        f.write(
            "阶数,攻击,血量,防御,队伍数量,同阶刀数验算,打上一阶敌刀数,打下一阶敌刀数\n"
        )
        for rs in rows_s:
            f.write(
                f"{rs['tier']},{rs['s_atk']},{rs['s_hp']},{rs['s_def']},{rs['n']},"
                f"{rs['h_same']},{rs['h_up']},{rs['h_down']}\n"
            )

    with open(ene, "w", encoding="utf-8-sig", newline="") as f:
        f.write(
            "阶数,攻击,血量,防御,队伍数量,敌打同阶阵刀数验算,敌打下一阶士刀数验算\n"
        )
        for re in rows_e:
            hn = re["hits_next_soldier"] if re["hits_next_soldier"] != "" else ""
            f.write(
                f"{re['tier']},{re['e_atk']},{re['e_hp']},{re['e_def']},1,"
                f"{re['hits_e_vs_s']},{hn}\n"
            )

    print(
        f"# ORDER_SPAN={ORDER_SPAN}；士兵打同阶敌≈{TARGET_SAME_SOLDIER}刀；"
        f"敌打同阶阵目标≈{TARGET_ENEMY_SAME}刀（GAP_NEXT_DEF={GAP_NEXT_DEF}）"
    )
    print("已写入:", sol)
    print("已写入:", ene)


if __name__ == "__main__":
    main()
