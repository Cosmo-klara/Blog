import matplotlib.pyplot as plt
import numpy as np

plt.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "Noto Sans CJK SC"]
plt.rcParams["axes.unicode_minus"] = False

scores = [
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

layers = np.arange(len(scores))  # 0 ~ 30

fig, ax = plt.subplots(figsize=(10, 4.8), dpi=120)
ax.plot(layers, scores, linewidth=2, marker="o", markersize=4, color="#2f2f2f")

ax.set_xlabel("Layer")
ax.set_ylabel("Score")
ax.set_title("分数-层数")
ax.set_xticks(layers)
ax.grid(True, linestyle="--", alpha=0.3)

fig.tight_layout()
plt.show()