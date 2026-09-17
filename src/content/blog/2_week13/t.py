import matplotlib.pyplot as plt
import numpy as np

plt.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "Noto Sans CJK SC"]
plt.rcParams["axes.unicode_minus"] = False

layer_scores = [
    0.66617972493171692,
    0.56224140077829361,
    0.45785665690898895,
    0.47059004724025726,
    0.59688560664653778,
    0.10064778476953506,
    0.12819667160511017,
    0.12747284770011902,
    0.39163079857826233,
    0.6823770403862,
    0.9198495745658875,
    1.3537458181381226,
    1.683936595916748,
    1.7976069450378418,
    1.6195608377456665,
    1.6671712398529053,
    1.588405966758728,
    1.4153586387634277,
    1.3926141023635864,
    1.3051061153411865,
    1.2821408772468567,
    1.2110502243041992,
    1.185692834854126,
    1.1610004830360413,
    1.117451429367065,
    1.0984619784355164,
    1.0887495756149292
]

layers = np.arange(len(layer_scores))  # 0..35

fig, ax = plt.subplots(figsize=(10, 4.8), dpi=120)
ax.plot(layers, layer_scores, linewidth=2, marker="o", markersize=3)
ax.set_xlabel("Layer")
ax.set_ylabel("Score")
ax.set_xticks(layers)
ax.grid(True, linestyle="--", alpha=0.3)
fig.tight_layout()
plt.show()

layer_values = [
    1671.0656,
    0,
    1639.3589,
    0,
    1652.6073,
    0,
    1596.5615,
    0,
    1617.2901,
    0,
    1640.9723,
    0,
    1645.3759,
    1666.2786,
    1659.3434,
    0,
    1624.0874,
    0,
    1687.3123,
    0,
    1684.7127,
    0,
    1684.4352,
    0,
    1683.0490,
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
print(f"  有效数据点 (非零) 数量: {len(valid_layers)}")
print("-" * 55)
for idx, (layer, score, value) in enumerate(zip(valid_layers, valid_layer_scores, valid_values), 1):
    print(f"  {idx:2d}. layer{layer:<3d}  score={score:.6f}  value={value:.4f}")
print("-" * 55)
print(f"  scores: mean={valid_layer_scores.mean():.6f}  std={valid_layer_scores.std():.6f}")
print(f"  values: mean={valid_values.mean():.4f}  std={valid_values.std():.4f}")
print("=" * 55)
print(f"  Pearson  r   = {pearson_r:.10f}")
print(f"  Pearson  R^2 = {pearson_r2:.10f}")
print("=" * 55)

if len(valid_layers) >= 2:
    s_centered = valid_layer_scores - valid_layer_scores.mean()
    v_centered = valid_values - valid_values.mean()
    r_check = np.sum(s_centered * v_centered) / (
        np.sqrt(np.sum(s_centered ** 2)) * np.sqrt(np.sum(v_centered ** 2))
    )
    print(f"  (手动校验 r = {r_check:.10f})")
    print()

fig, ax = plt.subplots(figsize=(10, 6.8), dpi=120)
ax.scatter(valid_layer_scores, valid_values, s=60, color="#2f2f2f")

for layer, score, value in zip(valid_layers, valid_layer_scores, valid_values):
    ax.annotate(f"layer{layer}", xy=(score, value), xytext=(6, 6), textcoords="offset points", fontsize=8)

if len(valid_layers) >= 2:
    z = np.polyfit(valid_layer_scores, valid_values, 1)
    p = np.poly1d(z)
    x_fit = np.linspace(valid_layer_scores.min(), valid_layer_scores.max(), 100)
    ax.plot(x_fit, p(x_fit), linestyle="--", color="#c0392b", linewidth=1.5, alpha=0.8,
            label=f"y = {z[0]:.4f}x + {z[1]:.2f}")
    ax.legend(loc="upper right", fontsize=10)

ax.set_xlabel("Score", fontsize=12)
ax.set_ylabel("Value", fontsize=12)
if len(valid_layers) >= 2:
    ax.set_title(f"Score vs Value  (Pearson r = {pearson_r:.4f},  R^2 = {pearson_r2:.4f})", fontsize=13)
ax.grid(True, linestyle="--", alpha=0.3)
fig.tight_layout()
plt.show()
