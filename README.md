# expert-research-skill

批量研究专家信息的 Claude Code 技能。给定一份专家姓名列表，通过多 Agent 并行 Web 搜索，查找每位专家的所在单位、研究方向、联系方式（邮箱）及信息来源网址，最终汇总为 CSV 文件。

## 适用场景

- 科技奖/基金评审专家公示名单处理
- 学术会议参会专家信息收集
- 批量专家背景调研

## 快速部署

在目标项目的根目录下执行，一行命令完成 clone + 安装 + 清理：

```bash
git clone https://github.com/MXLPK/expert-research-skill.git /tmp/expert-research-skill && mkdir -p .claude/skills/expert-research && cp /tmp/expert-research-skill/SKILL.md .claude/skills/expert-research/ && cp -r /tmp/expert-research-skill/scripts .claude/skills/expert-research/ && rm -rf /tmp/expert-research-skill && echo "✅ expert-research skill 部署完成"
```



## 工作流概览

1. **确定研究范围** — 读取专家名单，清理格式
2. **分批切割** — 将名单切分为每批约 30 人（`split_batches.js`）
3. **并行搜索** — 每批一个后台 Agent，通过 WebSearch + WebFetch 查找信息
4. **收集结果** — 保存每批结果为 pipe-delimited 格式
5. **合并 CSV** — 汇总所有批次结果（`merge_to_csv.js`）
6. **质量校验** — 统计找到单位率、联系方式率等指标（`validate_results.js`）

## 脚本用法

### split_batches.js

```bash
node scripts/split_batches.js names_complete.txt 30
```

### merge_to_csv.js

```bash
node scripts/merge_to_csv.js 专家信息汇总.csv
```

### validate_results.js

```bash
node scripts/validate_results.js 专家信息汇总.csv
```

## 质量标准

| 指标 | 目标 |
|------|------|
| 找到单位率 | ≥ 95% |
| 找到邮箱率 | ≥ 75% |
| 完全未找到率 | ≤ 5% |
