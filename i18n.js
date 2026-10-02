/* ============================================================
   站点中英切换 i18n（index.html + aigc.html 共用）
   机制：文本节点字典替换 + localStorage 持久化 + site-langchange 事件
   （main.js 监听该事件刷新板块联动文案）
   ============================================================ */
(function () {
  'use strict';

  /* zh（规范化空白后）→ en */
  var DICT = {
    /* ---------- 通用 / 导航 ---------- */
    '跳到主要内容': 'Skip to main content',
    '丁博文': 'Ding Bowen',
    '专注方向：Agent 产品设计、LLM 评测与可观测性、RAG 与检索、金融 × AI 交叉背景': 'Focus: Agent product design, LLM evaluation & observability, RAG & retrieval, Finance × AI crossover',
    '金融 + IT 交叉学科背景：香港城市大学 × 复旦大学金融科技联合培养硕士（2027 届），本科信息管理与信息系统。先后完成十段实习，覆盖 AI 行业研究、投资分析、IT 咨询审计与数据分析；独立打造 June AI 与 ai-video-eval 两款 AI 产品，对 Agent、模型评测、检索与可观测性形成体系化认知——习惯用数据与结构说话。': 'A finance + IT hybrid: MSc in Financial Technology jointly trained by City University of Hong Kong and Fudan University (Class of 2027), BSc in Information Management & Information Systems. Ten internships across AI industry research, investment analysis, IT consulting audit and data analytics; built two AI products solo — June AI and ai-video-eval — forming a systematic grip on Agents, model evaluation, retrieval and observability. I speak with data and structure.',
    'VC · PE · 金融科技': 'VC · PE · FinTech',
    '行业研究': 'Industry research',
    '© 2026 丁博文 ·': '© 2026 Ding Bowen ·',
    '首页': 'Home',
    '关于我': 'About',
    '知识体系': 'Knowledge',
    '工作经历': 'Experience',
    '出镜时刻': 'Moments',
    '产品案例': 'Projects',
    '教育': 'Education',
    '联系': 'Contact',
    '你好，我是丁博文': 'Hi, I am Ding Bowen',
    '香港城市大学 × 复旦大学 金融科技硕士 · 2027 届': 'MSc Financial Technology, CityU × Fudan · Class of 2027',
    '10 段实习': '10 internships',
    '2 款独立 AI 产品': '2 independent AI products',
    '期望 base 北京 / 上海': 'Preferred base: Beijing / Shanghai',
    '雅思 6.5': 'IELTS 6.5',
    '查看产品案例': 'View projects',
    '联系我': 'Contact me',
    '滚动探索': 'Scroll',
    '01 · ABOUT': '01 · ABOUT',
    '段': '',
    '款': '',
    '维': '',
    '实习经历，覆盖 AI 行业研究 / 投资分析 / IT 审计 / 数据分析': 'internships across AI research / investment analysis / IT audit / data analysis',
    '独立打造的 AI 产品：June AI 与 ai-video-eval': 'independent AI products built solo: June AI & ai-video-eval',
    '师生线下参与的大型校园公益活动，由我发起并全程统筹': 'On-campus charity event with 800+ attendees, initiated and led end-to-end by me',
    'AIGC 视频评测体系，客观指标 + LLM-as-a-judge + 人机协同': '-dimension AIGC video evaluation: objective metrics + LLM-as-a-judge + human-in-the-loop',
    '主题切换': 'Toggle theme',
    '回到顶部': 'Back to top',

    /* ---------- 方向切换条 ---------- */
    '金融 × AI 复合背景': 'Finance × AI Hybrid Background',
    'AI 产品经理': 'AI Product Manager',
    '大模型应用 · Agent 方向': 'LLM apps · Agent',
    '金融科技': 'FinTech',
    'VC · PE · 一级市场': 'VC · PE · primary market',
    '大模型评测': 'LLM Evaluation',
    '模型效果评估 · AI 产品评测': 'model & AI product evaluation',
    'AIGC 视频': 'AIGC Video',
    '漫剧 · 短片 · 广告': 'series · shorts · ads',

    /* ---------- PM 板块 ---------- */
    '02 · TRACK': '02 · TRACK',
    '方向 · AI 产品经理': 'Track · AI Product Manager',
    '目标岗位': 'Target roles',
    'AI 产品经理（大模型应用 / Agent 方向） · AI 训练师 · AI 行业研究员': 'AI Product Manager (LLM apps / Agent) · AI Trainer · AI Industry Researcher',
    '交叉背景': 'Hybrid background',
    '香港城市大学 × 复旦大学（经济学院）联合培养，金融 + IT 交叉学科；修读 LLM 导论、深度学习概论、面向企业的生成式人工智能等 AI 前沿课程。': 'Jointly trained by City University of Hong Kong and Fudan University (School of Economics) — a finance + IT hybrid; coursework covers Introduction to LLMs, Deep Learning, and Generative AI for Enterprise.',
    'Agent 体系化理解': 'Systematic understanding of Agents',
    'LLM 为推理内核，Function Calling 结构化对接工具与数据，叠加记忆、规划与反思构成「感知-规划-执行-反思」闭环；codex / claude code 重度使用者，有应用与 skill 开发经验。': 'LLM as the reasoning core, Function Calling as structured hands to tools and data, plus memory, planning and reflection forming a perceive–plan–act–reflect loop; heavy user of codex / claude code with hands-on app & skill development.',
    '评测驱动迭代': 'Evaluation-driven iteration',
    '熟悉黑盒 / 白盒评测与 P、R、F1 等指标，习惯用 Langfuse 类工具做 trace 级 bad case 定位，用数据驱动 prompt 与检索策略迭代。': 'Fluent with black-box / white-box evaluation and P, R, F1 metrics; used to tracing bad cases at the span level with Langfuse-style tools to drive prompt and retrieval iteration with data.',
    '02 · KNOWLEDGE': '02 · KNOWLEDGE',
    'AI 产品知识体系': 'AI Product Knowledge System',
    '六块能力拼图：从 API 工程化到产品方法论，构成对 AI 产品的完整认知框架。': 'Six building blocks — from API engineering to product methodology — forming a complete cognitive frame for AI products.',
    'Agent 与 API 工程化': 'Agent & API engineering',
    'LLM 为推理内核，Function Calling 结构化对接工具与数据，叠加记忆、规划与反思构成「感知-规划-执行-反思」自主任务闭环。': 'LLM as the reasoning core, Function Calling to interface with tools and data, plus memory, planning and reflection closing the autonomous task loop.',
    '跨对话记忆': 'cross-session memory',
    '模型评测': 'Model evaluation',
    '理解黑盒评测（人工评估、LLM-as-a-judge、评测集回归）与白盒评测（logprobs、困惑度）的成本与适用场景，熟悉样本不均衡下的 P / R 取舍。': 'Understands the cost and fit of black-box evaluation (human raters, LLM-as-a-judge, regression suites) versus white-box signals (logprobs, perplexity), and the P / R trade-off under class imbalance.',
    '人工评估': 'human evaluation',
    '评测集回归': 'eval-set regression',
    '算法基础': 'Algorithm fundamentals',
    '理清判别式模型（建模 P(y|x)）与生成式模型（建模联合分布、逐 token 生成，LLM 即典型范式）的差异与选型逻辑；理解两阶段检索的分工。': 'Clear on discriminative models (modeling P(y|x)) versus generative ones (joint distribution, token-by-token — the LLM paradigm), and how two-stage retrieval divides the work.',
    '判别式 vs 生成式': 'discriminative vs generative',
    'Embedding 召回': 'embedding recall',
    'Reranker 精排': 'reranker re-ranking',
    '搜索与 RAG': 'Search & RAG',
    '从元数据过滤、TF-IDF 词袋，到 Elasticsearch / BM25 稀疏检索、双塔向量检索 + ANN 召回，理解稀疏 + 稠密混合检索的权衡。': 'From metadata filtering and TF-IDF bag-of-words to Elasticsearch / BM25 sparse retrieval and dual-encoder + ANN vector recall — understanding the sparse–dense hybrid trade-offs.',
    '双塔模型': 'dual-encoder',
    'LLM 可观测性': 'LLM observability',
    '熟悉 Langfuse 类 LLM 可观测平台：全链路 trace、Prompt 版本管理与 A / B、评测集回归，能基于数据定位 bad case，驱动 prompt 与检索策略迭代。': 'Familiar with Langfuse-style LLM observability: end-to-end traces, prompt versioning & A/B, eval-set regression — locating bad cases from data to drive prompt and retrieval iteration.',
    'bad case 定位': 'bad-case triage',
    '产品方法论': 'Product methodology',
    '重视决策质量（信息不完备下基于数据与优先级权衡、复盘校准）与数据敏感度（指标异动先归因再行动）；理解产研互信与跨部门 OKR 对齐，关注 Lovart 等 AI 原生产品的工作流设计。': 'Values decision quality (data- and priority-based trade-offs under incomplete information, calibrated by retrospectives) and data sensitivity (attribute first, then act); understands eng–PM trust and cross-team OKR alignment, and follows AI-native workflow design such as Lovart.',
    '决策质量': 'decision quality',
    '数据归因': 'metric attribution',
    'OKR 对齐': 'OKR alignment',
    'AI 原生工作流': 'AI-native workflow',
    '03 · EXPERIENCE': '03 · EXPERIENCE',
    '节选 · 共十段': 'Selected · 10 in total',

    /* ---------- 工作经历（PM 口径） ---------- */
    'Link-x Capital（星连资本）': 'Link-x Capital',
    '投资助理 / 孵化器品牌增长': 'Investment Assistant / Incubator Growth',
    'AI 行业研究': 'AI industry research',
    '担任一级市场投前行业分析师，对量化、AI4S、具身智能等 AI 前沿领域开展深度调研；参加并整理超衍智能、无界进化、小熊猫科技等项目的高管访谈，沉淀对 AI 技术商业化落地的行业认知。': 'Pre-investment analyst covering quant, AI4S and embodied intelligence; joined and documented executive interviews with portfolio startups, building a grounded view of how AI tech commercializes.',
    '在投后合作伙伴华清普智孵化器 demoday 路演活动（2026/08）中负责外联策划与信息对齐、现场统筹展位物料与路演视频；活动召集上千位投资人线下参与，流量达百万量级。': 'Owned outreach and info alignment for the partner incubator’s demoday (2026/08) and ran booth materials and pitch videos on site; the event drew 1,000+ investors offline with seven-figure reach.',
    'Real Value Capital（至真资本）': 'Real Value Capital',
    '投资助理': 'Investment Assistant',
    '投资分析': 'Investment analysis',
    '为 Route17、Wish 等多家拟赴纳斯达克上市的公司撰写上市建议书，开展估值与行业研究。': 'Wrote listing advisory reports and performed valuation & industry research for multiple Nasdaq-bound companies including Route17 and Wish.',
    '沉淀基于 AI 工具的标准化研究模板，实现研究工作流的标准化复用。': 'Built AI-powered standardized research templates, making the research workflow reusable.',
    '上海艾芒科技有限公司': 'Shanghai Aimang Technology',
    'IT 咨询审计': 'IT Consulting & Audit',
    'IT 审计': 'IT audit',
    '甲方对接': 'client liaison',
    '服务中加基金、惠升基金、中航基金、国投安保等金融机构；作为公司与甲方的直接对接人收集痛点需求，组织「问题复盘会」并协调一对一专家访谈验证方案，确保问题闭环。': 'Served fund clients (Zhongjia, Huisheng, Zhonghang, Guotou) as the direct client-facing contact; gathered pain points, ran issue-review meetings and coordinated 1-on-1 expert interviews to close the loop.',
    '对 IT 系统进行全链路审计，重点审查信息技术治理、应急管理、灾备恢复等非正常场景，穷举异常路径输出审计意见；入职一周即带实习生团队对接甲方完成项目交付。': 'Audited IT systems end-to-end with a focus on IT governance, incident management and disaster recovery; enumerated edge paths into audit findings. Led interns to deliver for clients within one week of onboarding.',
    '北京汇丰盛和国际贸易有限公司': 'Beijing Huifeng Shenghe International Trade',
    '行业研究员': 'Industry Researcher',
    '数据分析': 'Data analysis',
    '对大规模氧化铝交易数据进行分析，从交易频次、订单金额、复购率等维度绘制高价值客户画像。': 'Analyzed large-scale alumina trading data to profile high-value customers by frequency, order size and repeat rate.',
    '将分析结论转化为销售团队可落地的战术建议（如高价值用户的共同特征），协助优化销售策略、提升客户转化效率。': 'Turned findings into actionable sales tactics (shared traits of high-value users), improving conversion.',

    /* ---------- Fintech 板块 ---------- */
    '方向 · 金融科技': 'Track · FinTech',
    '金融 + IT 交叉背景': 'Finance + IT hybrid background',
    '香港城市大学 × 复旦大学（经济学院）联合培养，金融 + IT 交叉学科；本科修读 CFA 证书班，对财报、投资、IPO / pre-IPO 等领域进行过系统学习。': 'CityU × Fudan (School of Economics) joint program, finance + IT; completed a CFA-track program covering financial statements, investments, and IPO / pre-IPO.',
    '十余段实习 · 完整项目闭环': '10+ internships · full project loops',
    '十段实习覆盖一级市场投研、美股上市建议书、IT 咨询审计与大宗商品研究；对行研类工作尤其感兴趣，自学多个行研框架、研读多篇研报，形成自己的研究框架。': 'Ten internships across primary-market research, US listing advisory, IT audit and commodity research; self-taught multiple research frameworks and built my own.',
    'AI 工具放大研究效率': 'AI-amplified research efficiency',
    'codex / claude code 等 Agent 工具重度使用者，有应用与 skill 开发经验；对 RAG 技术、Agent 跨对话记忆机制设计有深入了解，持续关注国内外 AI 创新对金融行业的赋能。': 'Heavy user of agent tools (codex / claude code) with app & skill development experience; deep into RAG and agent memory design, tracking how AI empowers finance on both markets.',
    '金融科技知识体系': 'FinTech Knowledge System',
    '金融基础 × 研究方法 × 估值建模 × AI 工程化，构成一级市场研究的基本功。': 'Finance fundamentals × research methods × valuation modeling × AI engineering — the toolkit for primary-market research.',
    '金融基础': 'Finance fundamentals',
    '本科修读 CFA 证书班，对金融领域进行系统学习，熟悉财报、投资、IPO、pre-IPO 等领域基础知识。': 'CFA-track program in undergrad; solid grounding in financial statements, investments, IPO and pre-IPO.',
    'CFA 证书班': 'CFA track',
    '财报分析': 'financial statements',
    '行业研究方法': 'Industry research methods',
    '自学多个行研框架，研究阅读多篇研报；在氧化铝行业研究与美股上市建议书写作中反复打磨，形成自己的行研框架。': 'Self-taught multiple frameworks and read widely across sell-side reports; sharpened my own framework through alumina industry research and US listing advisory writing.',
    '行研框架': 'research frameworks',
    '研报阅读': 'report reading',
    '行业对比': 'cross-industry comparison',
    '估值与建模': 'Valuation & modeling',
    '掌握 PB、PE 等相对估值与绝对估值方法，掌握基础 Excel 建模，在多家拟上市公司估值实践中落地。': 'Proficient in relative (PB, PE) and absolute valuation with basic Excel modeling, applied across pre-IPO engagements.',
    'PB / PE': 'PB / PE',
    '相对 + 绝对估值': 'relative + absolute valuation',
    'Excel 建模': 'Excel modeling',
    '金融终端': 'Data terminals',
    '对 Wind、Bloomberg 等金融终端的使用有了解，配合数据交叉验证支撑研究结论。': 'Working knowledge of Wind and Bloomberg terminals for cross-validated research.',
    'AI 工程化': 'AI engineering',
    '擅长 Agent 生态办公产出各类报告；对 RAG 技术、Agent 跨对话记忆机制设计有深入了解，用 AI 工具放大研究与写作效率。': 'Produce research reports fluently in agent ecosystems; deep into RAG and agent memory design to multiply research and writing throughput.',
    'Agent 记忆机制': 'agent memory',
    '协作与表达': 'Collaboration & communication',
    '深度飞书办公经验，擅长 Google 生态协作；多次代表公司与甲方高管直接对话，擅长演讲与观点表达。': 'Deep Lark Suite experience and fluent in the Google ecosystem; repeatedly the company’s voice in front of client executives; strong presenter.',
    '飞书': 'Lark Suite',
    'Google 生态': 'Google ecosystem',
    '演讲表达': 'public speaking',
    '一级市场投研': 'Primary-market research',
    '担任一级市场投前行业分析师，对量化、AI4S、具身智能等多个领域开展深度调研与学习；参加并整理超衍智能、无界进化、小熊猫科技等项目的高管访谈。': 'Pre-investment analyst covering quant, AI4S and embodied intelligence; joined and documented executive interviews with startups.',
    '在投后合作伙伴华清普智孵化器 demoday 路演活动（2026/08）中负责外联策划与信息对齐，现场统筹展位物料与路演视频交付；活动召集上千位投资人线下参与，流量达百万量级。': 'Owned outreach and alignment for the partner incubator’s demoday (2026/08), delivering booth materials and pitch videos on site; 1,000+ investors offline, seven-figure reach.',
    '美股 IPO': 'US-listed IPO',
    '为 Route17、Wish、东京百易大连、威斯制造等多家拟赴纳斯达克上市的公司撰写上市建议书，进行公司估值与行业研究。': 'Wrote listing advisory reports with valuation and industry research for multiple Nasdaq-bound companies.',
    '掌握 PB、PE 等相对与绝对估值方法，对行业研究报告撰写形成自己的框架；为公司沉淀标准化上市建议书模板，并撰写销售合伙人培训材料。': 'Command of relative and absolute valuation with my own report-writing framework; standardized the advisory template and wrote sales-partner training materials.',
    '金融机构服务': 'Financial-institution engagements',
    '服务中加基金、惠升基金、中航基金、国投安保等金融机构：审查信息技术治理、应急管理、重要信息系统等审计项，汇总问题、得出审计意见并向甲方交付。': 'Served fund clients by auditing IT governance, incident management and critical systems; consolidated findings into delivered audit opinions.',
    '作为公司代表直接对接甲方技术团队，拿不准的问题随时发起一对一专家访谈交叉确认；入职一周即带教新实习生并牵头推进项目交付。': 'Direct liaison to client tech teams, launching 1-on-1 expert interviews whenever uncertain; onboarding new interns and leading delivery within week one.',
    '对大规模氧化铝交易数据进行分析，以交易频次、订单金额、复购率等维度识别高价值客户，为销售团队提供战略性见解。': 'Analyzed large-scale alumina trading data to identify high-value customers and feed strategic insights to sales.',
    '对氧化铝产业开展行业研究，系统学习行研技巧框架与研报撰写方法；掌握 PB、PE 等估值方法与基础 Excel 建模，了解 Wind、Bloomberg 终端，并为公司发展方向提供建议。': 'Conducted industry research on alumina, systematically learning research frameworks and report writing; applied valuation and Excel modeling with Wind / Bloomberg literacy, and advised on company direction.',

    /* ---------- Eval 板块 ---------- */
    '方向 · 大模型评测': 'Track · LLM Evaluation',
    '大模型评测 · 模型效果评估 · AI 产品评测': 'LLM evaluation · model assessment · AI product evaluation',
    '习惯把模糊的技术判断拆成可验证的结构化结论，并沉淀为报告与检查清单；可直接阅读英文论文与技术报告，希望参与评测执行、结果分析与跨团队沟通。': 'Used to decomposing fuzzy technical judgments into verifiable, structured conclusions distilled into reports and checklists; reads English papers and tech reports natively; eager to own evaluation execution, analysis and cross-team communication.',
    '评测方法论体系': 'Evaluation methodology',
    '系统学习大模型评测方法论与主流 Benchmark 生态（MMLU、C-Eval、CMMLU、MT-Bench 等），理解 LLM-as-a-judge、人工评审校准、badcase 归因、数据污染等核心评测议题。': 'Systematically studied LLM evaluation methodology and benchmark ecosystems (MMLU, C-Eval, CMMLU, MT-Bench); understands LLM-as-a-judge, human-rater calibration, bad-case attribution and data contamination.',
    '从数据到效果的完整链路': 'Data-to-quality pipeline',
    '修读 SQL 基础、深度学习概论、面向企业的生成式人工智能、AI 项目质量管控等课程，理解从数据质量到模型效果验证的完整链路。': 'Coursework across SQL, deep learning, generative AI for enterprise and AI project QC — the full pipeline from data quality to model validation.',
    'AI 工具一线体感': 'Hands-on AI tooling',
    'codex / Z-code 等 Agent 工具重度使用者，熟练开发应用与 skill；曾在智谱生态的资方与孵化器（星连资本、华清普智）实习，有用 AI 工具放大评测与研究效率的一线体感。': 'Heavy agent-tool user (codex / Z-code) building apps and skills; interned inside the Zhipu ecosystem’s investor and incubator side, with first-hand feel for amplifying evaluation throughput with AI.',
    '评测知识体系': 'Evaluation Knowledge System',
    '方法论 × Benchmark × 模型基础 × 测试工程，围绕「模型能力如何被可靠度量」展开。': 'Methodology × benchmarks × model fundamentals × test engineering, organized around one question: how can model capability be measured reliably?',
    '评测方法论': 'Evaluation methodology',
    '理解 LLM-as-a-judge、人工评审校准、badcase 归因与数据污染识别等核心议题，知道每种方法的能力边界与适用场景。': 'Understands LLM-as-a-judge, rater calibration, bad-case attribution and contamination detection — and each method’s boundary and fit.',
    '人工评审校准': 'rater calibration',
    'badcase 归因': 'bad-case attribution',
    '数据污染': 'data contamination',
    'Benchmark 生态': 'Benchmark ecosystem',
    '系统学习 MMLU、C-Eval、CMMLU、MT-Bench 等主流基准；创办过 AI 主题社群，持续跟踪海内外新模型发布与评测榜单动态。': 'Studied mainstream benchmarks (MMLU, C-Eval, CMMLU, MT-Bench); founded an AI community and continuously tracks new releases and leaderboards worldwide.',
    '榜单跟踪': 'leaderboard tracking',
    '模型基础': 'Model fundamentals',
    '了解 Transformer 架构与大模型基本原理，理解模型能力边界与典型失效模式；遇到异常输出愿意追问到底，区分事实与推测。': 'Grounded in Transformer architecture and LLM basics, capability boundaries and typical failure modes; digs to the bottom of anomalous outputs, separating fact from conjecture.',
    '能力边界': 'capability boundaries',
    '失效模式': 'failure modes',
    '前沿方向': 'Frontier topics',
    '熟悉 Agent、Tool Calling、RAG 等前沿方向的原理与评测要点，能针对应用形态设计对应的评测维度。': 'Familiar with the principles and evaluation essentials of Agents, Tool Calling and RAG; designs evaluation dimensions per application shape.',
    '测试工程': 'Test engineering',
    '数据库测试岗完整实践：冒烟测试、多轮功能测试、测试反馈文档；主动学习 Python 自动化测试，实现部分场景的自动化回归。': 'Full-cycle database testing practice: smoke tests, multi-round functional testing, feedback docs; self-taught Python test automation for partial regression coverage.',
    '冒烟 / 功能测试': 'smoke / functional testing',
    'Python 自动化回归': 'Python auto-regression',
    '缺陷闭环': 'defect closure',
    '评测工具实践': 'Evaluation tooling in practice',
    '独立开发 ai-video-eval（AIGC 视频评测工具）：客观指标本地计算 + 视觉大模型判断 + 人机协同工作台，评测方法论的一次完整产品化落地。': 'Built ai-video-eval solo (AIGC video evaluation): local objective metrics + vision-LLM judging + a human-in-the-loop workbench — evaluation methodology productized end-to-end.',
    '评测体系设计': 'evaluation system design',
    'LLM-as-a-judge 落地': 'LLM-as-a-judge in production',
    '人机协同': 'human-in-the-loop',
    '优炫软件科技有限公司': 'Uxsino Software Technology',
    '数据库测试': 'Database Testing',
    '承担数据库项目 Demo 到上线前的全周期测试：执行冒烟测试与多轮功能测试，编写测试反馈文档，联动产品团队完成缺陷沟通与闭环跟进。': 'Owned full-cycle testing from demo to release: smoke and multi-round functional testing, feedback documentation, and defect communication with the product team through to closure.',
    '主动学习 Python 自动化测试，编写脚本实现部分测试场景的自动化回归，降低重复测试成本；过程中熟悉 PRD 完整结构，建立产品思维与测试思维。': 'Self-taught Python test automation and scripted regression for repeated scenarios, cutting retest cost; internalized full PRD structure, building both product and testing instincts.',
    '质量核查': 'Quality assurance',
    '结构化结论': 'structured conclusions',
    '为多所金融机构提供 IT 咨询审计：依据审计标准对信息技术治理、应急管理、重要信息系统等控制项逐项核查，定位偏差、分析归因，形成结构化审计报告并向甲方交付。': 'IT consulting audits for financial institutions: item-by-item checks on governance, incident management and critical systems; located deviations, attributed causes, and delivered structured audit reports.',
    '作为公司代表直接对接甲方技术团队，对拿不准的问题主动发起一对一专家访谈交叉确认；入职一周即带教新实习生、牵头推进项目交付。': 'Company-facing liaison to client tech teams, proactively cross-checking uncertainties via 1-on-1 expert interviews; mentored new interns and led delivery from week one.',
    'AI 投资助理': 'AI Investment Assistant',
    '技术评估': 'technical assessment',
    '对大模型、生物医药、具身智能等 AI 赛道开展投前深度调研：拆解标的公司技术路线、产品能力与团队背景，把模糊的技术判断拆成可验证的结构化评估结论。': 'Pre-investment deep dives across LLM, biotech and embodied-AI tracks: decomposed technical roadmaps, product capability and team backgrounds into verifiable, structured conclusions.',
    '参与超衍智能、无界进化、小熊猫科技等项目的高管访谈并整理纪要；参与华清普智孵化器 demoday 路演策划与执行，负责信息对齐与现场交付协调。': 'Joined executive interviews and produced minutes; co-planned and executed the incubator demoday, owning information alignment and on-site delivery.',

    /* ---------- 校内与社会实践 ---------- */
    '04 · PRACTICE': '04 · PRACTICE',
    '校内与社会实践': 'Campus & Community',
    '校内': 'On campus',
    '港城大学生事务处 干部': 'Student Affairs Office, CityU · Officer',
    '负责学生事务处创新创业主题活动组织开展的协助工作，以及科技创新协会章程撰写与协会架构落地。': 'Supported innovation & entrepreneurship events at the Student Affairs Office; authored the Sci-Tech Innovation Association charter and stood up its structure.',
    '大型校园公益项目': 'Large-scale campus charity event',
    '2025/03 · 北京': '2025/03 · Beijing',
    '与校外企业联合开办并独自组建团队，完整走通「获取信息 - 决策报名 - 到场签到 - 社交互动 - 离场反馈」用户路径，定位到场率卡点并针对性迭代，到场率提升约 30%；800 余名师生线下参与，为社团拉到 1000 余元赞助。': 'Co-hosted with an external company and built the team solo; mapped the full journey from discovery to post-event feedback, located attendance bottlenecks and iterated — lifting show-up rate ~30%. 800+ students and staff attended; secured ¥1,000+ sponsorship.',
    '首都经济贸易大学 乒协主席': 'CUEB Table Tennis Club · President',
    '2023.09 – 2025.06': '2023.09 – 2025.06',
    '开展校内乒乓球联赛，负责干部任命、活动策划、物品采购与外联；所在学院蝉联院系杯团体前三，个人蝉联单打前二。': 'Ran the campus league — appointments, planning, procurement and outreach; my school kept top-3 team finishes while I held top-2 singles two years running.',
    '校外': 'Off campus',
    '线下 AI 研讨沙龙': 'Offline AI salons',
    '2025/08 · 东莞': '2025/08 · Dongguan',
    '独自完成海报设计、活动方案与场地谈判，从零谈下 2 个场地方，成功举办 4 场创业分享会；与 2 位本地 KOL 达成流量合作，邀请多位初创公司嘉宾分享，保持与 AI 前沿资讯接轨。': 'Designed posters, planned programs and negotiated venues solo — closed 2 venues from scratch and ran 4 founder meetups; partnered with 2 local KOLs and multiple startup guests to stay on the AI frontier.',
    'AI 主题活动重度参与者 · 社交达人': 'Heavy AI-event goer · networker',
    '持续参与': 'Ongoing',
    '持续奔赴各类 AI 一线现场——AI 生态大会、机器人论坛、人工智能经济论坛、Web3 沙龙，在现场攒认知、攒人脉、攒灵感；海外社区（TG / Discord）重度用户，交流圈不设边界。': 'Always on the AI front line — expos, robotics forums, AI-economy summits and Web3 salons — collecting insight, connections and inspiration; a heavy TG / Discord community user with no borders on my network.',

    /* ---------- 活动现场 ---------- */
    '05 · EVENTS': '05 · EVENTS',
    '活动现场': 'Event Moments',
    'AI 大会、论坛与沙龙的一线现场——攒认知，也攒人脉。': 'Front-line scenes from AI expos, forums and salons — collecting insight and connections.',
    '上海外滩 AI 生态大会': 'Shanghai Bund AI Ecosystem Expo',
    '🎪 生态大会': '🎪 Expo',
    '机器人论坛': 'Robotics Forum',
    '🤖 论坛现场': '🤖 Forum',
    '学校沙龙现场': 'Campus salon',
    '🎓 校园沙龙': '🎓 Campus',
    '外滩 WACC 发展大会': 'Bund WACC Development Conference',
    '🌏 发展大会': '🌏 Conference',
    '机器人论坛 · 采访': 'Robotics Forum · Interview',
    '🎤 一线采访': '🎤 Interview',
    '人工智能经济论坛': 'AI Economy Forum',
    '🏛️ 港城大': '🏛️ CityU',
    '线下 AI · Web3 沙龙': 'Offline AI · Web3 Salon',
    '💬 社交现场': '💬 Networking',

    /* ---------- 产品案例 ---------- */
    '06 · PROJECTS': '06 · PROJECTS',
    '两款独立完成的 AI 项目：按 STAR 结构展开，痛点、方案与产出全部来自真实实践。': 'Two AI projects built solo, unfolded in STAR structure — pain points, solutions and results all from real practice.',
    '独立产品': 'Solo product',
    'GitHub 仓库': 'GitHub repo',
    '「悬浮窗 + 追问链」——把线性聊天变成树状的知识探索路径。': '“Floating panel + follow-up chains” — turning linear chat into tree-shaped knowledge exploration.',
    'June AI · 悬浮窗 + 追问链交互示意': 'June AI · floating panel + follow-up chains (concept)',
    'S · 痛点': 'S · Situation',
    '日常 AI 学习中，传统聊天窗口的对话是线性的——疑问很难在不丢失上下文的情况下深入追问。': 'In everyday AI-assisted learning, chat is linear — hard to drill deeper without losing context.',
    'T · A｜目标与方案': 'T · A | Target & approach',
    '「悬浮窗 + 追问链」设计：选中 AI 回复中的文字或截图，即可打开子对话线逐层追问，形成树状知识探索路径。': '“Floating panel + follow-up chains”: select any text or screenshot in an AI reply to spawn a sub-thread and drill down layer by layer — a tree of exploration.',
    'R｜角色与产出': 'R | Role & result',
    '独立完成：': 'Delivered solo: ',
    '痛点洞察': 'pain-point insight',
    '与': ' & ',
    '交互方案设计': 'interaction design',
    '，一人闭环。': ' — one-person full loop.',
    '树状对话': 'Tree-shaped chat',
    '独立打造': 'Built solo',
    '· AIGC 视频评测工具': '· AIGC video evaluation tool',
    '让「AI 视频好不好」不再只凭感觉——用体系化的评测维度说话。': 'Making “is this AI video good” measurable — with a systematic evaluation rubric.',
    'ai-video-eval · 评测工作台示意': 'ai-video-eval · scoring workbench (concept)',
    'AI 视频好不好不能只凭感觉——评测缺乏体系与工具支撑。': 'AI video quality can’t be a vibe call — evaluation lacked system and tooling.',
    '设计': 'Designed ',
    '个维度的评测体系：卡顿、闪烁等客观指标本地直接计算；内容理解维度交由视觉大模型判断（LLM-as-a-judge）；并配人机协同逐帧打分工作台。': ' dimensions: objective metrics like stutter and flicker computed locally; content understanding judged by vision LLMs (LLM-as-a-judge); plus a human-in-the-loop, frame-by-frame scoring workbench.',
    'R｜结果与特性': 'R | Result & features',
    '单文件': 'Single file',
    '免安装、数据': ', no install, data ',
    '全程本地': 'fully local',
    '，开箱即用、隐私友好。': ' — out of the box and privacy-friendly.',
    '客观指标计算': 'objective metrics',
    '数据本地化': 'on-device data',

    /* ---------- 教育 ---------- */
    '07 · EDUCATION': '07 · EDUCATION',
    '教育背景': 'Education',
    '香港城市大学 × 复旦大学（经济学院）联合培养': 'City University of Hong Kong × Fudan University (School of Economics), joint program',
    '商务咨询系统（金融科技）理学硕士': 'MSc Business Consulting Systems (Financial Technology)',
    '金融 + IT 交叉学科': 'Finance + IT hybrid',
    'LLM 导论': 'Intro to LLMs',
    '深度学习概论': 'Intro to Deep Learning',
    '面向企业的生成式人工智能': 'Generative AI for Enterprise',
    '金融科技导论': 'Intro to FinTech',
    'AI 项目质量管控': 'AI Project Quality Control',
    '首都经济贸易大学': 'Capital University of Economics and Business',
    '信息管理与信息系统 理学学士': 'BSc Information Management & Information Systems',
    '荣誉与证书': 'Honors & certificates',
    '「挑战杯」商业计划竞赛 校赛二等奖': '“Challenge Cup” Business Plan Competition · 2nd Prize (campus)',
    '2024 · 团队领袖': '2024 · Team lead',
    '提出 5G 共享服务系统方案；用 kimi、GPT 辅助完成市场分析，调用百度地图 API 开发并部署与系统集成的导航界面。': 'Proposed a 5G sharing-service system; used Kimi and GPT for market analysis and built the integrated navigation UI on the Baidu Maps API.',
    '雅思 IELTS 6.5': 'IELTS 6.5',
    '海外社区（TG / Discord）重度用户，具备国际视野。': 'Heavy international-community user (TG / Discord) with a global outlook.',

    /* ---------- 联系 ---------- */
    '08 · CONTACT': '08 · CONTACT',
    '期待与你在 AI 浪潮中相遇': 'Let’s meet in the AI wave',
    '如果你在做 AI 产品、金融科技或模型评测相关的工作，欢迎聊聊——邮箱是最快找到我的方式。': 'Working on AI products, fintech or model evaluation? Let’s talk — email is the fastest way to reach me.',
    '给我发邮件': 'Email me',
    '邮箱': 'Email',
    '点击复制': 'Click to copy',
    '访问主页': 'View profile',
    '直达仓库：': 'Jump to repos:',
    '期望 base：北京 / 上海': 'Preferred base: Beijing / Shanghai',
    '© 2026 丁博文': '© 2026 Ding Bowen',

    /* ---------- AIGC 页 ---------- */
    'AIGC 视频作品': 'AIGC Video Works',
    '漫剧系列 · 世界观短片 · 商业广告——从角色设定、剧本分镜到成片合成的 AIGC 全流程创作。': 'AI series · world-building shorts · commercials — full-pipeline AIGC creation from character sheets and storyboards to final cuts.',
    '← 返回主站': '← Back to site',
    '火力突围': 'Fire Breakout',
    'SEG-002 · 背景循环': 'SEG-002 · background loop',
    '失重跃迁': 'Zero-G Jump',
    'SEG-001 · 循环播放': 'SEG-001 · looping',
    '01 · SERIES': '01 · SERIES',
    '漫剧系列': 'AI Series',
    '多集连续叙事的 AI 漫剧：吸血鬼奇幻系列两集，以及世界观短片《阿乐斯之钥》。': 'Multi-episode AI manga-drama: two episodes of a vampire fantasy series, plus the world-building short The Key of Ales.',
    '吸血鬼漫剧 · 第一集「暗巷中的异界来客」': 'Vampire Series · EP.01 “A Visitor from Another World in the Alley”',
    '系列开篇：暗巷中的遭遇战。角色三视图驱动的人物一致性，多分镜剪辑成片。': 'Series opener: an alley encounter. Character turnarounds keep identity consistent across storyboard cuts.',
    '吸血鬼漫剧 · 第二集「暗影中的访客」': 'Vampire Series · EP.02 “The Shadow’s Visitor”',
    '剧情推进：新角色登场与暗影对峙，十一个分镜段落的连续叙事合成。': 'The plot thickens: new characters clash with the shadows — eleven storyboard segments cut into one narrative.',
    '阿乐斯之钥 · 合成短片': 'The Key of Ales · final cut',
    '「未命名故事」世界观短片：竖屏叙事长片，完整的世界观、角色与情节展开。': 'A world-building short from the “Untitled Story” universe: a full portrait-format narrative with its own world, cast and plot.',
    '3′43″ · 竖屏': '3′43″ · portrait',
    '02 · ADS': '02 · ADS',
    '商业广告': 'Commercials',
    '商业向短视频：职场场景叙事 + 产品植入，竖屏投放规格。': 'Commercial shorts: workplace storytelling + product placement in vertical format.',
    '职场男士控油洗面奶广告': 'Oil-control Face Wash for Office Men',
    '职场场景切入痛点，产品植入与卖点演示一镜完成。': 'Opens on a workplace pain point; product placement and selling points delivered in one flow.',
    '15″ · 竖屏': '15″ · portrait',
    '03 · CANVAS': '03 · CANVAS',
    '画布展示': 'Canvas',
    '《阿乐斯之钥》的世界观画布动态展示。': 'A living-canvas tour of The Key of Ales world.',
    'LOOP · 自动循环': 'LOOP · auto-repeating',
    '阿乐斯之钥 · 画布 · 6″': 'Key of Ales · canvas · 6″',
    '04 · THOUGHTS': '04 · THOUGHTS',
    '聊聊 AI 视频制作': 'On Making AI Video',
    'AI 视频不是抽卡，是把导演语言翻译成提示词': 'AI video isn’t gacha — it’s translating film language into prompts',
    '做这批片子最大的体会：模型就是剧组，提示词就是分镜稿。卡住我的从来不是工具，是两件最基础的事——': 'Biggest takeaway from this batch: the model is your crew, and prompts are your storyboard. What blocks me is never the tool — it’s two fundamentals:',
    '采光': 'lighting',
    '和': ' and ',
    '运镜': 'camera movement',
    '。': '.',
    '采光是画面的骨头。同一个场景，写「顶光」画面平得像证件照；写成「低角度侧逆光 + 轻微体积雾」，人物轮廓立刻从背景里跳出来；色温再压冷一点，科技感自己就长出来了。所以我习惯先把': 'Lighting is the skeleton of a frame. Top light flattens a scene into an ID photo; write “low-angle backlight + light volumetric fog” and silhouettes pop off the background; push the color temperature cooler and the sci-fi feel grows on its own. So I always nail the ',
    '光的方向和硬度': 'direction and hardness of light',
    '想清楚，再去写画面里有什么。': ' before describing what’s in it.',
    '运镜是节奏的呼吸。「给点动感」这种话模型听不懂，得翻译成镜头语言：缓慢推镜（dolly in）是压迫感，横移是在铺陈信息，手持跟随的轻微晃动是紧张，希区柯克变焦直接把情绪拧到顶。下提示词之前我会先问自己：这个镜头要交代什么信息、带什么情绪——': 'Camera movement is the breathing of rhythm. “Make it dynamic” means nothing to a model — translate it into lens language: a slow dolly-in is pressure, a lateral track lays out information, a subtle handheld sway is tension, and a Hitchcock zoom cranks emotion to max. Before prompting I ask: what information does this shot deliver, what emotion — ',
    '一句话一个目的，不贪': 'one purpose per prompt, no greed',
    '剩下的交给耐心：角色一致性靠三视图锁住，分镜之间的连续性靠关键帧反复对齐。AI 负责生成，节奏和审美，还是人说了算。': 'The rest is patience: lock character consistency with turnaround sheets, align continuity between cuts frame by frame. AI does the rendering — rhythm and taste are still the director’s call.',
    '返回主站': 'Back to site'
  };

  var LANG_KEY = 'site-lang';

  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }

  function eachTextNode(fn) {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || p.closest('.lang-btn')) return NodeFilter.FILTER_REJECT;
        return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(fn);
  }

  function apply(lang) {
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');
    eachTextNode(function (node) {
      if (node.__i18nOrig === undefined) node.__i18nOrig = node.nodeValue;
      if (lang === 'en') {
        var t = DICT[norm(node.__i18nOrig)];
        if (t !== undefined && t !== norm(node.__i18nOrig)) node.nodeValue = t;
      } else {
        node.nodeValue = node.__i18nOrig;
      }
    });
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* 隐私模式 */ }
    var btn = document.getElementById('lang-toggle');
    if (btn) {
      var label = btn.querySelector('.lang-label');
      if (label) label.textContent = lang === 'en' ? '中' : 'EN';
      btn.setAttribute('aria-label', lang === 'en' ? '切换到中文' : 'Switch to English');
    }
    document.dispatchEvent(new CustomEvent('site-langchange', { detail: { lang: lang === 'en' ? 'en' : 'zh' } }));
  }

  window.SITE_I18N = {
    apply: apply,
    lang: function () { return document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'zh'; },
    toggle: function () { apply(window.SITE_I18N.lang() === 'en' ? 'zh' : 'en'); }
  };

  function init() {
    var saved = 'zh';
    try { saved = localStorage.getItem(LANG_KEY) || 'zh'; } catch (e) {}
    if (saved === 'en') apply('en');
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.addEventListener('click', function () { window.SITE_I18N.toggle(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
