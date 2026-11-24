# persona.json：结构与组合路径

本文件是 Aether Persona 的全部内容与组合规则数据源。代码（`src/engine/derive.ts`）只做解释执行。

**v3 的核心变化**：不再是「一个选项对一条轴、四条轴拼成 16 个桶」，而是

- 每个选项同时影响多个特质，形成 8 维向量
- 8 道题分别主导 8 个不同维度，256 种作答对应 256 个方向
- 作答、星座、塔罗**三个来源各自独立**与候选画像算相似度，再按权重合并投票
- 结果不是查表命中，而是在连续空间里找最接近的原型

---

## 1. 顶层结构

| 节点 | 类型 | 作用 |
|---|---|---|
| `version` | number | 数据版本 |
| `traits` | object[] | 8 个特质维度的定义 |
| `questions` | object[] | 题库：选项携带多维 `deltas` |
| `archetypes` | object[] | 人格原型：8 维画像 + 文案 + 偏置 |
| `races` / `jobs` / `factions` | object[] | 种族 / 职业 / 阵营，各自带 8 维画像 + 偏置 |
| `elements` / `zodiacs` | object | 元素与星座（星座带 `deltas`） |
| `tarot` | object[] | 22 张牌，带故事钩子与 `deltas` |
| `positions` | object[] | 三个牌位 |
| `statLabels` / `weaknesses` | object | 六项属性名、六条弱点文案 |
| `statsMapping` | object | 六项属性如何由 8 维向量导出 |
| `combine` | object | 权重、匹配方式、属性参数、拼接顺序 |

---

## 2. 字段说明

### 2.1 `traits`

```json
{ "key": "order", "label": "秩序 ↔ 混沌", "low": "混沌", "high": "秩序" }
```

8 个维度：`order`、`empathy`、`boldness`、`sociability`、`curiosity`、`duty`、`pragmatism`、`mysticism`。

所有 `deltas` / `profile` / `statsMapping` 的键都必须落在这 8 个里面。加维度需要同时扩题库与画像（见第 6 节）。

### 2.2 `scale` 与 `questions`

量表定义：

```json
"scale": {
  "labels": ["很不符合", "不符合", "一般", "比较符合", "很符合"],
  "values": [-2, -1, 0, 1, 2]
}
```

每道题是一句**可认同的陈述**，玩家选一个档位：

```json
{ "id": "q1", "text": "即使队友不认同，我也会坚持按既定规则处理问题。",
  "deltas": { "order": 1, "duty": 0.25 } }
```

贡献值 = `deltas × scale.values[所选档位]`。同一句话选「很符合」贡献 +2，选「很不符合」贡献 −2。

**当前结构**：24 题，8 个维度各 3 题，两正一反，交错排列。

| 维度 | 题号 |
|---|---|
| order | q1(+), q10(+), q17(−) |
| empathy | q3(+), q9(−), q18(+) |
| boldness | q5(+), q13(−), q21(+) |
| sociability | q7(+), q14(−), q22(+) |
| curiosity | q2(+), q11(−), q19(+) |
| duty | q4(+), q12(+), q20(−) |
| pragmatism | q8(+), q15(−), q23(+) |
| mysticism | q6(+), q16(−), q24(+) |

三条约束：

1. **每维至少 2–3 题**：单题噪声无法抵消，极端值会集中到少数维度。
2. **正反题配对**：否则全选「很符合」会让所有维度一起涨，产生默许偏差。
3. **不要连续同维度**：交错排列，避免答题惯性。

旧版 8 题 × 2 选项只产生 256 个离散方向、强度只有 ±1；现在是 5 档 × 24 题，单维取值 −6 ~ +6，分布才散得开。

### 2.3 `archetypes`

```json
{
  "id": "oathkeeper",
  "title": "黄金誓约者",
  "motto": "……",
  "desc": "……",
  "profile": { "order": 0.85, "empathy": 0.6, "boldness": 0.7, "sociability": 0.7,
               "duty": 0.9, "pragmatism": 0.3, "curiosity": -0.1, "mysticism": 0.1 },
  "bias": 0.0621
}
```

| 字段 | 说明 |
|---|---|
| `profile` | 8 维画像，取值 −1 ~ 1，表示该原型在世界观上的方向 |
| `bias` | 匹配偏置，用于抵消"某些画像天然吸引更多作答"的偏差，见第 5 节 |

`profile` 只需写有倾向的维度，缺省视为 0。

### 2.4 `races` / `jobs` / `factions`

结构与 archetype 相同（`profile` + `bias`），只是文案字段不同：

- `races`：`talent`（天赋）
- `jobs`：`skill`（技能）
- `factions`：`crest`（纹章）

它们**不设候选集**，与全部原型无绑定，直接在同一向量空间里竞争。

### 2.5 `zodiacs` / `tarot`

```json
{ "id": "aries", "name": "白羊", "element": "fire",
  "deltas": { "boldness": 0.7, "duty": 0.3, "order": 0.1 } }

{ "index": 0, "id": "fool", "name": "愚者", "keyword": "启程",
  "hook": "……", "deltas": { "boldness": 0.6, "curiosity": 0.4, "order": -0.3 } }
```

星座与塔罗都用 `deltas` 参与向量，而不是直接加属性。三张牌的 `deltas` 累加成**独立的塔罗向量**参与评分，所以抽到不同牌会改变称号、种族、职业与阵营。

### 2.6 `statsMapping`

```json
"might": { "boldness": 1.5, "duty": 0.7, "order": 0.3 }
```

六项属性各由一组维度权重导出。采用**累加后的原始向量**（不归一化），因此方向与强度都影响数值。

### 2.7 `combine`

```json
"weights": { "answers": 1, "zodiac": 0.5, "tarot": 1.2 },
"normalize": "l2",
"match": "weightedCosine",
"secondaryGap": 0.03,
"stats": { "base": 5, "min": 1, "max": 10, "scale": 0.62 },
"weaknessPick": "lowestStat",
"storyOrder": ["past", "present", "future"],
"serialPrefix": "AP-",
"serialLength": 4
```

| 字段 | 含义 |
|---|---|
| `weights` | 三个来源在评分中的投票权重；塔罗权重越高，抽牌影响越大 |
| `match` | `weightedCosine`：各来源分别算余弦相似度再加权平均 |
| `secondaryGap` | 第一与第二原型得分差小于此值时，记录副倾向 |
| `stats.scale` | 属性映射的整体缩放，用来把数值压进 `min`~`max` |

`_notes` 是写给人看的说明，代码不读。

---

## 3. 组合路径

对应 `src/engine/derive.ts` 的 `buildCard()`。

### 输入

`answers`（题 id → 选项下标）、`zodiacId`、`cards`（用户抽的三张牌）。

### Step 1 · 三个来源各自建向量

```
作答向量 = Σ 每道已答题所选选项的 deltas
星座向量 = 所选星座的 deltas
塔罗向量 = Σ 三张牌的 deltas
```

三个来源彼此独立，互不覆盖。没答的题不贡献；未选星座时该向量为零。

### Step 2 · 分别归一化

每个向量除以自身 L2 范数，只保留**方向**。这样"题多题少"不会让某个来源靠长度压倒别人。

### Step 3 · 逐个候选打分

```
score(candidate) =
    加权平均(
        余弦(作答向量,  candidate.profile) × weights.answers,
        余弦(星座向量,  candidate.profile) × weights.zodiac,
        余弦(塔罗向量,  candidate.profile) × weights.tarot
    )
    + candidate.bias
```

余弦衡量"方向是否一致"，三个来源是**并列的评委**，不是答题的附属。零向量来源会被跳过，剩余权重重新归一。

### Step 4 · 取最接近的原型

对全部 `archetypes` 打分排序，最高者为称号；若第一与第二差值小于 `secondaryGap`，记录副倾向。

### Step 5 · 种族 / 职业 / 阵营

用**同一份来源**、同一套打分，分别在 `races`、`jobs`、`factions` 里取最高者。三者之间没有依赖关系。

### Step 6 · 属性

```
总向量 = 作答×w_answer + 星座×w_zodiac + 塔罗×w_tarot   （未归一化）
属性  = clamp( round( base + Σ 总向量[维度] × statsMapping[属性][维度] × scale ), min, max )
```

### Step 7 · 弱点

六项属性最低的一项 → `weaknesses` 对应文案。

### Step 8 · 塔罗与故事

`cards` 按 `storyOrder` 排序，取各自 `hook` 用空格拼接。

### Step 9 · 编号

FNV-1a( 星座 | seed | 作答 | 三张牌 index | 原型 id )，取十六进制前 `serialLength` 位。

---

## 4. 一个流程示例

假设作答方向整体偏向「秩序 + 担当 + 勇进」，星座选狮子（贡献勇进 + 入世），抽到皇帝（秩序 + 担当）：

1. 作答向量指向 order / duty / boldness
2. 星座向量指向 boldness / sociability
3. 塔罗向量指向 order / duty
4. 三者分别与 16 个原型比方向，"黄金誓约者"（order 0.85、duty 0.9、boldness 0.7）三项都贴合，加权得分最高
5. 同样是因为秩序 + 担当方向突出，种族更接近石民 / 龙裔，职业更接近誓卫，阵营更接近黎明议会
6. 属性里力量（boldness / duty 权重高）与意志（duty / order）会明显偏高

如果第三步换成三张偏向神秘与孤高的牌（女祭司、隐者、月亮），塔罗那一票会改投「孤峰祭司」一侧，称号或副倾向随之改变——这就是"抽牌参与决策"，而不是只加属性。

---

## 5. `bias` 与分布校准

`bias` 不是文案参数，是**匹配偏置**，用来补偿"某些画像天然覆盖更大方向扇区"的问题。不加偏置时，实测会出现某个原型吃掉 40% 以上作答的情况。

当前偏置由 `scripts/calibrate.mjs` 迭代生成。5 档 × 24 题的组合无法枚举（5²⁴），脚本改为**随机采样 20000 份作答**（每题随机档位、随机星座、随机抽三张牌），统计每个候选的命中次数，按 `目标比例 − 实际比例` 逐步修正，直到各类别近似均分。

**改了题库、画像、权重之后必须重新校准**：

```bash
node scripts/calibrate.mjs
```

它会直接改写 `persona.json` 里的 `bias` 字段。校准后再跑一次分布检查：

```bash
./node_modules/.bin/esbuild src/engine/derive.ts --bundle --format=esm --outfile=tmp/derive.mjs
node scripts/stats.mjs
```

合格的输出应当满足：每个原型命中数接近 `样本数 / 原型数`，且 16 个原型全部出现。

---

## 6. 怎么扩展

| 目标 | 改哪里 | 是否要改代码 |
|---|---|---|
| 加一道题 | `questions` 追加，`deltas` 写 2–4 个维度 | 否（之后要重新校准） |
| 加一个选项 | 该题 `options` 追加 | 否 |
| 改选项倾向 | 改 `deltas` 数值 | 否 |
| 加一个原型 / 种族 / 职业 / 阵营 | 对应数组追加，补 `profile` | 否（需重新校准） |
| 加星座 / 塔罗牌 | 对应数组追加，补 `deltas` | 否 |
| 调属性公式 | `statsMapping` 与 `combine.stats.scale` | 否 |
| 调抽牌影响力 | `combine.weights.tarot` | 否（需重新校准） |
| **新增一个特质维度** | `traits` 追加 + 所有 `profile`/`deltas` 补齐 | **是**（向量长度与校验逻辑要同步） |
| **新增一种匹配算法** | 只改 `combine.match` 无效 | **是**（算法在代码里） |

### 结构校验清单

1. 每个 `profile` / `deltas` 的键都在 `traits` 内
2. `statLabels`、`weaknesses`、`statsMapping` 三者的键集合一致
3. `tarot[].index` 不重复
4. `zodiacs[].element` 都能命中 `elements`
5. 每个数组里 `id` 唯一
6. 8 道题的主导维度不重复（否则方向数会塌缩）
---

## 7. 叙述与弱点如何组合

### 7.1 叙述是「段落 → 句子」的两级结构

`narrative.lines` 决定句子顺序与数量，每个槽位对应一个生成器：

```json
"lines": ["opener", "tension", "trait", "context", "origin", "closing"]
```

| 槽位 | 由什么生成 |
|---|---|
| `opener` | 命中原型的定调句 |
| `tension` | 向量**最强正极**与**最强负极**共同决定；负极不够强时退化为前两强递进 |
| `trait` | 第三强的特质，单句补充 |
| `context` | 职业 + 阵营 |
| `origin` | 命中种族的气质句 |
| `closing` | 星座所属元素 + 第一张牌关键词 |
| `secondary`（可选） | 第二接近的原型 |

### 7.2 tension 句不是「挑最大的念一遍」

```
正极 = 数值最大的正向维度
负极 = 数值最负的维度

若 |负极| ≥ thresholds.tension：
    转折句："你{正极短语}；但另一面，你{负极短语}。"
否则：
    递进句："你{第一强短语}，而且{第二强短语}。"
```

区别在于：句子表达的是**人格的两面性**，而不是把最大值重复一次。

短语库只存短语，句骨架存在模板里，所以短语能自由换句式：

```json
"phrases": { "order": { "high": "讲究次序", "low": "信临场判断" } },
"templates": {
  "tension": "你{a}；{opposite}另一面，你{b}。",
  "progression": "你{a}，{same}{b}。",
  "context": "你以{race}的身份做着{job}的事，最后落在{faction}。",
  "closing": "{element}你的过往写着「{past}」。"
},
"connectors": { "same": "而且", "opposite": "但" }
```

实际输出示例：

> 你总觉得世界背面还有一层；但另一面，你靠独处回血。
> 你以构装体的身份做着咒术师的事，最后落在无名守望。

### 7.3 四句是一条线，不是清单

1. **定调**：你是什么样的人
2. **两面**：「但另一面」揭示矛盾
3. **处境**：「最后落在」把人格落到具体身份
4. **收尾**：「你的过往写着」用塔罗收束

换语气只需要改 `templates` 和 `connectors` 里的连接词。

### 7.4 弱点由三个因子共同判定

```
第一句：最低属性 → weaknesses[属性][相关特质的方向]
第二句：次低属性 → weaknessTails[属性]
```

`weaknessTraits` 定义每项属性关联哪个特质，`weaknessTails` 描述"这项弱点在什么场合暴露"。

所以弱点 = **最低属性 + 该属性相关特质的方向 + 次低属性**。

### 7.5 容量上限

卡面是固定的 1080×1440 分享图，不能滚动。正文 21px / 行高 1.85，可用高度约 200px：

- 每行约 38 字，最多约 5 行
- 正文建议 **160 字以内**；按每句 25–35 字计算，约 4–6 句

超出就要缩字号，或把句子移到别的位置。

### 7.6 扩展速查

| 目标 | 改哪里 | 是否要改代码 |
|---|---|---|
| 加一句（复用现有类型） | `lines` 里再写一个 `tension` / `context` | 否 |
| 改短语措辞 | `phrases[维度].high/low` | 否 |
| 改句式或连接词 | `templates` / `connectors` | 否 |
| 调转折灵敏度 | `thresholds.tension`（越小越容易触发"但另一面"） | 否 |
| 新增一种槽位（如 `tarot`） | 代码里加一个分支 + `lines` 引用 | **是** |
| 弱点参考更多因子 | 加 `weaknessTails2` 等字段 + `buildCard` 里拼接 | **是** |