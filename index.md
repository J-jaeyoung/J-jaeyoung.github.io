---
layout: default
title: Jaeyoung Chung
description: "Ph.D. student at Seoul National University (CompSec Lab). Kernel & GPU driver security: bug discovery, reliable reproduction, and exploitation."
---

## About Me

<img class="profile-picture" src="jy.jpg">

Hi! I'm **Jaeyoung Chung**, a Ph.D. student in the
[CompSec Lab](https://compsec.snu.ac.kr) at **Seoul National University**,
advised by [Prof. Byoungyoung Lee](https://lifeasageek.github.io/).

My research focuses on **Linux and Android kernel security**. I am especially
interested in **concurrency bugs**, including scalable discovery,
deterministic reproduction, and exploitability analysis. I also work on
**GPU driver security**, analyzing emerging attack surfaces and designing
practical defenses.

My goal is to **make systems more secure** by systematically
discovering unknown bugs and building defenses that prevent their exploitation.

## Publications

<small>\* indicates equal contribution </small>

1. **DMGuard: Safeguarding Kernels from Physical Page Use-After-Free Vulnerabilities**<br>
   Juhee Kim\*, <u>Jaeyoung Chung</u>\*, Dae R. Jeong, and Byoungyoung Lee<br>
   *USENIX Security Symposium (Security)*, 2026
   {% include entry-links.html code="https://github.com/compsec-snu/dmguard" %}

2. **GHost in the SHELL: A GPU-to-Host Memory Attack and Its Mitigation**<br>
   Sihyun Roh, Woohyuk Choi, <u>Jaeyoung Chung</u>, Yoochan Lee, Suhwan Song, and Byoungyoung Lee<br>
   *IEEE Symposium on Security and Privacy (S&P)*, 2026
   {% include entry-links.html %}

3. **TikTag: Breaking ARM's Memory Tagging Extension with Speculative Execution**<br>
   Juhee Kim, Jinbum Park, Sihyun Roh, <u>Jaeyoung Chung</u>, Youngjoo Lee, Taesoo Kim, and Byoungyoung Lee<br>
   *IEEE Symposium on Securit`y and Privacy (S&P)*, 2025
   {% include entry-links.html %}

## Vulnerabilities & Exploits

* **[Google kernelCTF](https://google.github.io/security-research/kernelctf/rules.html)**
  * **Bad Epoll**: [CVE-2026-46242](https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/commit/?id=a6dc643c69311677c574a0f17a3f4d66a5f3744b) on `lts-6.12.67` and `cos-121-18867.294.100` (0-day) <br>
    * Reward: **$92,337**
    {% include entry-links.html site="https://badepoll.com/" code="https://github.com/J-jaeyoung/security-research/blob/submit-cve-2026-46242/pocs/linux/kernelctf/CVE-2026-46242_lts_cos/docs/exploit.md" %}
* **Arm Mali GPU driver**
  * [CVE-2025-0819](https://developer.arm.com/documentation/110466/1-0/): Concurrency UAF vulnerability
* **[KrCERT / KISA Hall of Fame](https://knvd.krcert.or.kr/overview/honor) (2024), Ranked 10th**
  * Reported 9 KVE-assigned remote code execution vulnerabilities in Korean image-viewer software

## Contact

* **Email:** [jjy600901@snu.ac.kr](mailto:jjy600901@snu.ac.kr)
* **GitHub:** [github.com/J-jaeyoung](https://github.com/J-jaeyoung)
* **Lab:** [CompSec Lab, Seoul National University](https://compsec.snu.ac.kr)
