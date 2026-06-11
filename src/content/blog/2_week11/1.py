import matplotlib.pyplot as plt
import numpy as np

plt.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "Noto Sans CJK SC"]
plt.rcParams["axes.unicode_minus"] = False

layer_scores = [
    0.12617972493171692,
    0.1224140077829361,
    0.12785665690898895,
    0.15059004724025726,
    0.09688560664653778,
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
    1.3153586387634277,
    1.2926141023635864,
    1.1051061153411865,
    0.9421408772468567,
    1.0110502243041992,
    0.885692834854126,
    0.9810004830360413,
    0.7117451429367065,
    0.6684619784355164,
    0.2887495756149292
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
    0,
    0,
    0,
    0
]

valid_layers = [
    i for i, value in enumerate(layer_values)
    if value != 0 and i < len(layer_scores)
]
valid_values = np.array([layer_values[i] for i in valid_layers], dtype=float)
valid_layer_scores = np.array([layer_scores[i] for i in valid_layers], dtype=float)

if len(valid_layers) == 0:
    raise ValueError("No non-zero value entries are available for plotting.")

fig, ax = plt.subplots(figsize=(10, 6.8), dpi=120)
ax.scatter(valid_layer_scores, valid_values, s=60, color="#2f2f2f")

for layer, score, value in zip(valid_layers, valid_layer_scores, valid_values):
    ax.annotate(f"layer{layer}", xy=(score, value), xytext=(6, 6), textcoords="offset points", fontsize=8)

ax.set_xlabel("Score", fontsize=12)
ax.set_ylabel("Value", fontsize=12)
ax.grid(True, linestyle="--", alpha=0.3)
fig.tight_layout()
plt.show()
