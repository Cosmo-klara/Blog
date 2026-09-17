import matplotlib.pyplot as plt
import numpy as np

plt.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "Noto Sans CJK SC"]
plt.rcParams["axes.unicode_minus"] = False

layer_scores = [
    1.0,
    0.9042591452598572,
    0.6297183632850647,
    0.5115534663200378,
    0.517296552658081,
    0.5244174599647522,
    0.49593988060951233,
    0.6330571174621582,
    0.7720574736595154,
    0.8897863626480103,
    1.0633721351623535,
    1.113618016242981,
    1.0536943674087524,
    1.028139352798462,
    1.0073813199996948,
    0.9675173759460449,
    0.905463457107544,
    0.8517112731933594,
    0.7906076908111572,
    0.7809137105941772,
    0.7805154919624329,
    0.7137740850448608,
    0.736487090587616,
    0.718579113483429,
    0.7447505593299866,
    0.7209989428520203,
    0.7170257568359375,
    0.6847683191299438,
    0.48108941316604614,
    0.41200682520866394,
    0.0821443647146225
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
    0,
    0,
    0,
    0,
    1322.6942,
    1347.0310,
    1336.9057,
    1037.4695,
    1076.2971,
    1450.2464,
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

fig, ax = plt.subplots(figsize=(10, 6.8), dpi=120)
ax.scatter(valid_layer_scores, valid_values, s=60, color="#2f2f2f")

for layer, score, value in zip(valid_layers, valid_layer_scores, valid_values):
    ax.annotate(f"layer{layer}", xy=(score, value), xytext=(6, 6), textcoords="offset points", fontsize=8)

ax.set_xlabel("Score", fontsize=12)
ax.set_ylabel("Value", fontsize=12)
ax.grid(True, linestyle="--", alpha=0.3)
fig.tight_layout()
plt.show()
