# TRINETRA — Model Source Licenses

Tracking document for all model source repos used in TRINETRA.  
**Review before any commercial deployment.** This is not legal advice.

---

## License Summary Table

| Model | Source Repo | License | Commercial Use | Attribution Required | Status |
|---|---|---|---|---|---|
| AASIST | [clovaai/aasist](https://github.com/clovaai/aasist) | MIT | ✅ Allowed | Required (copyright notice) | ✅ Clear |
| RawNet2 | [eurecom-asp/rawnet2-antispoofing](https://github.com/eurecom-asp/rawnet2-antispoofing) | MIT | ✅ Allowed | Required (copyright notice) | ✅ Clear |
| FTCN | [yinglinzheng/FTCN](https://github.com/yinglinzheng/FTCN) | ⚠️ None | ❓ Ambiguous | Unknown | ⚠️ Needs legal review |
| SBI | [mapooon/SelfBlendedImages](https://github.com/mapooon/SelfBlendedImages) | Research Only | ❌ Blocked | N/A | 🔴 **BLOCKER** |
| NPR | [chuangchuangtan/NPR-DeepfakeDetection](https://github.com/chuangchuangtan/NPR-DeepfakeDetection) | MIT | ✅ Allowed | Required (copyright notice) | ✅ Clear |
| UniversalFakeDetect | [WisconsinAIVision/UniversalFakeDetect](https://github.com/WisconsinAIVision/UniversalFakeDetect) | MIT | ✅ Allowed | Required (copyright notice) | ✅ Clear |

---

## Per-Model Details

### AASIST
- **License**: [MIT License](https://github.com/clovaai/aasist/blob/main/LICENSE)
- **Copyright**: © Clova AI Research, NAVER Corp.
- **Commercial use**: Explicitly allowed under MIT.
- **Attribution requirement**: Include the MIT copyright notice in derivative products.
- **Weights hosted at**: In-repository (`models/weights/AASIST.pth`), committed directly in the GitHub repo.
- **Action needed**: Include copyright notice in product's OSS attribution list.

---

### RawNet2 (Anti-Spoofing variant)
- **Source used**: [eurecom-asp/rawnet2-antispoofing](https://github.com/eurecom-asp/rawnet2-antispoofing)
  - Also referenced via [Jungjee/RawNet](https://github.com/Jungjee/RawNet) (the origin repo).
- **License**: MIT License
- **Copyright**: © EURECOM (Héctor Delgado Saborit, Nicholas Evans, et al.)
- **Commercial use**: Allowed under MIT.
- **Attribution requirement**: Include copyright notice.
- **Note**: RawNet2 is the anti-spoofing model. RawNet3 is a speaker-verification model — do NOT confuse them.
- **Action needed**: Include copyright notice in OSS attribution list.

---

### FTCN (Frequency-Temporal Convolutional Network)
- **Source**: [yinglinzheng/FTCN](https://github.com/yinglinzheng/FTCN)
- **License**: **None filed** — no `LICENSE` file in the repository.
- **Commercial use**: ❓ **Legally ambiguous.** Without an explicit license, default copyright applies, which in most jurisdictions means "all rights reserved" to the author.
- **Weights used**: DeepfakeBench Xception c23 (separate license — see DeepfakeBench below).
- **TRINETRA mitigation**: The FTCN Dockerfile uses the XceptionFallback architecture, not the native FTCN model code. Only the weights from DeepfakeBench are loaded. If only the weights (not the original FTCN inference code) are used, the exposure is lower but not zero.
- **Action needed**: 
  1. Contact `yinglinzheng` (author) to request explicit license grant for commercial use, OR
  2. Substitute with a fully licensed video deepfake detector (e.g., from DeepfakeBench's own implementation).
  3. Separately, verify DeepfakeBench license for the Xception c23 weights below.

---

### SBI (Self-Blended Images)
- **Source**: [mapooon/SelfBlendedImages](https://github.com/mapooon/SelfBlendedImages)
- **License**: **Research-only.** The README explicitly states:
  > *"The code is available for non-commercial scientific research purposes only. For commercial use, please contact [the author]."*
- **Commercial use**: 🔴 **BLOCKED without license agreement from author (Kaede Shiohara).**
- **Architecture in TRINETRA**: The current `sbi/wrapper.py` implements XceptionNet (not the original EfficientNet-B4). Weights loaded are from DeepfakeBench (Xception c23, trained on FF++), NOT from the SBI repo directly.
- **TRINETRA mitigation**: Because we do not use the SBI repo's code or weights, the direct SBI license exposure is reduced. However, the service is labeled "SBI" which could create confusion.
- **Recommended actions** (choose one):
  1. **Rename the service** to `xception_ff` or `video_xception` to accurately reflect what's running.
  2. **Contact Kaede Shiohara** at the email in the repo and obtain a commercial license.
  3. **Replace** with a fully permissively licensed video deepfake detector.
- **Action needed BEFORE commercial launch**: Do not ship SBI under this name without resolving the above.

---

### NPR (Neural Pattern Recognition for Deepfake Detection)
- **Source**: [chuangchuangtan/NPR-DeepfakeDetection](https://github.com/chuangchuangtan/NPR-DeepfakeDetection)
- **License**: MIT License (confirmed in `LICENSE` file)
- **Copyright**: © Chuangchuang Tan et al.
- **Commercial use**: ✅ Allowed.
- **Weights**: Hosted on HuggingFace (`siddharthksah/deepsafe-weights/NPR.pth`) — verify that the mirror itself doesn't introduce additional restrictions. The weights originated from the MIT-licensed repo, so this should be fine.
- **Attribution**: Include copyright notice.
- **Action needed**: Include copyright notice in OSS attribution list.

---

### UniversalFakeDetect
- **Source**: [WisconsinAIVision/UniversalFakeDetect](https://github.com/WisconsinAIVision/UniversalFakeDetect)
- **License**: MIT License
- **Copyright**: © University of Wisconsin-Madison (Hao Wang, Zhiyuan Liu, et al.)
- **Commercial use**: ✅ Allowed.
- **Weights**: `fc_weights.pth` (linear classifier head over CLIP ViT-L/14). CLIP itself is from OpenAI.
- **CLIP dependency**: OpenAI's CLIP is under the [MIT License](https://github.com/openai/CLIP/blob/main/LICENSE). ✅ Commercial use allowed.
- **Weights via HuggingFace**: Mirror at `siddharthksah/deepsafe-weights/universalfakedetect/fc_weights.pth` — same MIT-licensed origin.
- **Action needed**: Include copyright notices for both UFD and OpenAI CLIP in OSS attribution list.

---

### DeepfakeBench (weight source for FTCN and SBI containers)
- **Source**: [SCLBD/DeepfakeBench](https://github.com/SCLBD/DeepfakeBench)
- **License**: MIT License
- **Weights used**: Xception c23 (trained on FaceForensics++ c23 partition).
- **FaceForensics++ data license**: FF++ dataset itself requires signing a [research-only agreement](https://github.com/ondyari/FaceForensics#access). Models trained on it may inherit data license restrictions for commercial deployment.
- **Action needed**: Verify with the FF++ data custodians (TU Munich) whether models trained on their dataset can be used commercially without separate agreement.

---

## Required Attribution Notices (include in product credits)

For any commercial deployment, include the following in your Open Source Software (OSS) attribution page:

```
AASIST — © Clova AI Research, NAVER Corp. — MIT License
RawNet2 — © EURECOM — MIT License  
NPR     — © Chuangchuang Tan et al. — MIT License
UniversalFakeDetect — © University of Wisconsin-Madison — MIT License
CLIP    — © OpenAI — MIT License
```

---

## Outstanding Actions Before Commercial Launch

| Priority | Action |
|---|---|
| 🔴 High | Resolve SBI commercial use: rename service OR contact author OR replace with licensed alternative |
| 🟡 Medium | Verify FTCN: contact yinglinzheng or substitute implementation |
| 🟡 Medium | Verify FF++ model training data license with TU Munich for Xception weights |
| 🟢 Low | Add MIT attribution notices to product OSS credits page |

---

*Last updated: 2026-08-09*  
*Note: This document is for tracking purposes only and does not constitute legal advice. Consult a qualified IP attorney before commercial deployment.*
