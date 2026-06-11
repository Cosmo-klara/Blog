## Summary

修正 `e:\Extel\work\Blog\src\content\blog\2_week11\1.py` 的第二张图，使其基于新的 `value` 指标正确绘制 `score-value` 散点图：仅使用已评估层（`overall_accuracy` 中非 0 的项），不再错误乘以 100，并保证层索引、score、value 一一对应。

## Current State Analysis

- 当前脚本前半部分会正确绘制 `layer_scores` 的层间变化折线图。
- 第二张图直接沿用了 `e:\Extel\work\Blog\src\content\blog\2_week9\1.ipynb` 的 accuracy 绘图逻辑，但数据语义已经变化：
  - `overall_accuracy` 实际改成了新的 `value` 指标，不应再命名/展示为 `Accuracy(%)`。
  - 现代码执行了 `overall_accuracy_pct = [a * 100 for a in overall_accuracy]`，会把原始 value 错误放大 100 倍。
  - `prune_layers = list(range(33))` 与当前 `overall_accuracy` 列表长度不一致，且 `overall_accuracy` 中的 0 表示“尚未测出”，不应参与绘图。
- week9 来源代码的第二张图逻辑是：
  - 取 `layer_scores[:33]` 和 33 个 accuracy 一一对应。
  - 绘制 `score-accuracy(%)` 的散点图并标注 `layer{idx}`。
- 当前 week11 的真实需求是：
  - 使用 `layer_scores` 中与 `overall_accuracy` 已有值对应的层；
  - 跳过 value 为 0 的层；
  - 绘制 `score-value` 散点图，并用真实层号标注点。

## Proposed Changes

### File: `e:\Extel\work\Blog\src\content\blog\2_week11\1.py`

1. 保留第一张 `layer_scores` 折线图代码不变。
2. 重构第二张图的数据准备部分：
   - 将 `overall_accuracy` 改名为更贴近语义的变量，如 `layer_values` 或 `value_scores`。
   - 基于 `enumerate(layer_values)` 生成有效层索引 `valid_layers = [i for i, v in enumerate(layer_values) if v != 0]`。
   - 生成有效 value `valid_values` 与对应 score `valid_layer_scores = np.array([layer_scores[i] for i in valid_layers])`。
   - 不再乘以 100。
3. 重构第二张图绘制逻辑：
   - 用 `valid_layer_scores` 作为 x，`valid_values` 作为 y 绘制散点图。
   - 标注使用 `valid_layers`，保证 `layer{i}` 与散点一一对应。
   - 轴标题改为与 value 含义一致的名称；若用户未提供更具体命名，则暂用通用但正确的 `Value`。
4. 增加基础健壮性检查：
   - 确保参与绘图的层号不超过 `len(layer_scores) - 1`。
   - 如无有效值（全为 0），给出清晰提示或避免绘图时报空图索引错误。

## Assumptions & Decisions

- 0 在 `overall_accuracy` 中仅表示“尚未测出”，不是合法的 value，因此统一过滤。
- 当前 `overall_accuracy` 列表中的顺序仍表示 `layer0, layer1, ...`，即索引就是层号。
- 第二张图的目标是“展示已评估层的 score 与 value 的关系”，不是补齐缺失值，也不是插值。
- 纵轴名称若没有更具体业务术语，默认使用 `Value`，避免误写成 `Accuracy(%)`。

## Verification Steps

1. 运行 `e:\Extel\work\Blog\src\content\blog\2_week11\1.py`。
2. 确认第一张图仍显示 0 到末层的 `layer_scores` 折线。
3. 确认第二张图仅包含 `overall_accuracy` 中非 0 的点。
4. 确认第二张图纵轴不再被乘以 100，量纲与原始 value 一致。
5. 检查每个散点标注的 `layer` 编号是否与有效 value 的原始位置一致。
6. 如有语言诊断，检查并修复 `1.py` 的语法或类型问题。
