import matplotlib.pyplot as plt
import numpy as np

plt.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "Noto Sans CJK SC"]
plt.rcParams["axes.unicode_minus"] = False

layer_scores = [
    0.8600000000000000,
    0.8600000000000000,
    0.8600000000000000,
    0.8600000000000000,
    0.8402380106568756,
    0.6172161652921766,
    0.6649320118592282,
    0.5753396903537130,
    0.4832697507424570,
    0.3397569953989600,
    0.2200000000000000,
    0.4993601141512045,
    0.7719247036794682,
    0.6714476917646385,
    0.6015011704872057,
    0.7735986111844682,
    0.8600000000000000,
    0.8600000000000000,
    0.8600000000000000,
    0.7907064757539289,
    0.7231960533096145,
    0.7700375103197231,
    0.7762975229146097,
    0.8112191633371476,
    0.8470485243568984,
    0.8600000000000000,
    0.8600000000000000,
    0.8600000000000000,
    0.8600000000000000,
    0.8600000000000000,
    0.8600000000000000,
    0.8600000000000000,
    0.8600000000000000,
    0.8600000000000000,
    0.8600000000000000,
    0.8600000000000000,
    0.8600000000000000,
    0.8600000000000000
]

layers = np.arange(len(layer_scores))

fig, ax = plt.subplots(figsize=(10, 4.8), dpi=120)
ax.plot(layers, layer_scores, linewidth=2, marker="o", markersize=3)
ax.set_xlabel("Layer")
ax.set_ylabel("Score")
ax.set_xticks(layers)
ax.grid(True, linestyle="--", alpha=0.3)
fig.tight_layout()
plt.show()

layer_values = [
    0,
    0,
    0,
    0,
    1322.6942,
    1347.0310,
    1336.9057,
    0,
    1076.2971,
    0,
    893.4799,
    1148.3629,
    1465.7929,
    0,
    1498.3323,
    0,
    1495.4965,
    0,
    1496.0406,
    0,
    1491.2906,
    0,
    1493.3347,
    0,
    1486.5700,
    0,

]

valid_layers = [
    i for i, value in enumerate(layer_values)
    if value != 0 and i < len(layer_scores)
]
valid_values = np.array([layer_values[i] for i in valid_layers], dtype=float)
valid_layer_scores = np.array([layer_scores[i] for i in valid_layers], dtype=float)

if len(valid_layers) == 0:
    raise ValueError("No non-zero value entries are available for plotting.")

if len(valid_layers) >= 2:
    pearson_r = np.corrcoef(valid_layer_scores, valid_values)[0, 1]
    pearson_r2 = pearson_r ** 2
else:
    pearson_r = float("nan")
    pearson_r2 = float("nan")

print("=" * 55)
print("  有效数据点 (非零) 数量: {}".format(len(valid_layers)))
print("-" * 55)
for idx, (layer, score, value) in enumerate(zip(valid_layers, valid_layer_scores, valid_values), 1):
    print("  {:>2}. layer{:<3d}  score={:.6f}  value={:.4f}".format(idx, layer, score, value))
print("-" * 55)
print("  scores: mean={:.6f}  std={:.6f}".format(valid_layer_scores.mean(), valid_layer_scores.std()))
print("  values: mean={:.4f}  std={:.4f}".format(valid_values.mean(), valid_values.std()))
print("=" * 55)
print("  Pearson  r   = {:.10f}".format(pearson_r))
print("  Pearson  R^2 = {:.10f}".format(pearson_r2))
print("=" * 55)

if len(valid_layers) >= 2:
    s_centered = valid_layer_scores - valid_layer_scores.mean()
    v_centered = valid_values - valid_values.mean()
    r_check = np.sum(s_centered * v_centered) / (
        np.sqrt(np.sum(s_centered ** 2)) * np.sqrt(np.sum(v_centered ** 2))
    )
    print("  (手动校验 r = {:.10f})".format(r_check))
    print()

fig, ax = plt.subplots(figsize=(10, 6.8), dpi=120)
ax.scatter(valid_layer_scores, valid_values, s=60, color="#2f2f2f")

for layer, score, value in zip(valid_layers, valid_layer_scores, valid_values):
    ax.annotate("layer{}".format(layer), xy=(score, value), xytext=(6, 6), textcoords="offset points", fontsize=8)

if len(valid_layers) >= 2:
    z = np.polyfit(valid_layer_scores, valid_values, 1)
    p = np.poly1d(z)
    x_fit = np.linspace(valid_layer_scores.min(), valid_layer_scores.max(), 100)
    ax.plot(x_fit, p(x_fit), linestyle="--", color="#c0392b", linewidth=1.5, alpha=0.8,
            label="y = {:.4f}x + {:.2f}".format(z[0], z[1]))
    ax.legend(loc="upper left", fontsize=10)

ax.set_xlabel("Score", fontsize=12)
ax.set_ylabel("Value", fontsize=12)
if len(valid_layers) >= 2:
    ax.set_title("Score vs Value  (Pearson r = {:.4f},  R^2 = {:.4f})".format(pearson_r, pearson_r2), fontsize=13)
ax.grid(True, linestyle="--", alpha=0.3)
fig.tight_layout()
plt.show()
