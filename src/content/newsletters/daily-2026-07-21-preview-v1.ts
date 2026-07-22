export const dailyNewsletterPreview = {
  issueId: "daily-2026-07-21-preview-v1",
  date: "2026-07-21",
  subject: "AI 开始接手文案和日历了，但边界仍在工作流里",
  preheader:
    "过去两天值得产品人留意的 builder 动态：文案编辑、日历 agent、安全 benchmark 与 inference 成本。",
  eyebrow: "2026.07.21 · DAILY LETTER",
  opening: [
    "过去两天，我看到几条值得放在一起读的 builder 动态。它们谈的是文案、日历、安全和 inference 成本，背后有一个共同问题：AI 什么时候才算真的进入工作？",
    "我的答案暂时很朴素。它得在明确边界里反复做事，知道什么时候停下来问人，结果还要能被反馈修正。"
  ],
  news: [
    {
      title: "文案编辑自动化，第一次走到 70% 左右",
      paragraphs: [
        "Every CEO Dan Shipper 说，过去一周，Every 已经能自动完成团队通常手工处理的大约 70% 文案编辑。他试了很多年，这是第一次达到这个程度。",
        "70% 比“全自动”更值得看。它说明系统已经能稳定接住一块真实工作，同时也留下了需要人判断的部分。做产品时，我会先找这种边界清楚、结果容易复核的工作块。"
      ],
      sourceLinks: [
        {
          label: "Dan Shipper，Every CEO",
          url: "https://x.com/danshipper/status/2078920115140358585"
        }
      ]
    },
    {
      title: "一个日历 agent，先从约束和确认开始",
      paragraphs: [
        "负责 Anthropic Claude Code 与 Cowork 的 Cat Wu 分享了她的日历管理 prompt：每周会议少于 20 小时，去掉冲突或重复会议，参考过去几周的拒绝习惯，晚餐不计入额度，并持续改进这套 skill。更新邀请前，agent 必须先征求本人同意。",
        "这套写法没有追求万能。它把目标、历史偏好和权限边界摆在一起，系统能做什么、做到哪一步停下，都说得很清楚。"
      ],
      sourceLinks: [
        {
          label: "Cat Wu，Anthropic Claude Code 与 Cowork",
          url: "https://x.com/_catwu/status/2079011428380602526"
        }
      ]
    },
    {
      title: "网络安全可能比“复刻一个 App”更能测出模型水平",
      paragraphs: [
        "Vercel CEO Guillermo Rauch 认为，做出一个 XYZ clone 很容易制造演示效果。发现、修补、逆向和利用漏洞却需要跨语言、运行时与框架推理，还要具备他所说的 corner thinking。",
        "他因此把网络安全视作衡量 superintelligence 的一个好 benchmark，也提到 Kimi K3 在这个方向的表现，让开放模型值得继续关注。对产品团队来说，安全任务的价值在于它逼模型处理隐蔽条件，而不是只复现表面样式。"
      ],
      sourceLinks: [
        {
          label: "Guillermo Rauch，Vercel CEO",
          url: "https://x.com/rauchg/status/2078912929714356698"
        }
      ]
    },
    {
      title: "AI 越便宜，调用可能越多；落地速度仍受现实反馈限制",
      paragraphs: [
        "Box CEO Aaron Levie 的判断是，AI 成本下降通常不会让支出跟着下降。更便宜的 token 会带来更多代码生成、安全审查和大数据集上的 agent 任务，inference 需求反而可能继续上涨。",
        "他在另一条动态里补上了现实约束。代码可以快速生成、测试和运行，药物、销售与合同却要等待实验、客户或交易对手反馈。模型给出答案只是开头，产品还得接住真实世界的来回。"
      ],
      sourceLinks: [
        {
          label: "Aaron Levie：成本下降与 inference 需求",
          url: "https://x.com/levie/status/2078968158006939716"
        },
        {
          label: "Aaron Levie：现实反馈回路与行业工作流",
          url: "https://x.com/levie/status/2078864191683969212"
        }
      ]
    }
  ],
  pmView: {
    title: "我的判断：先把工作流控制做好",
    paragraphs: [
      "把这些动态放在一起，我更愿意用“工作流控制”描述眼前的竞争。模型能力当然重要，用户落地时面对的却是另一组问题：系统能看哪些数据、能改什么、谁来确认、出错后怎么回退。",
      "Every 的文案编辑和 Cat Wu 的日历 prompt 都是局部自动化。范围不大，却能持续发生。产品团队可以先把一项工作拆成机器可执行的部分和必须交给人的部分，跑通之后再决定是否扩大范围。",
      "成本降低会让试验更便宜，也会放大无效调用。最后拉开差距的，很可能是反馈设计：系统做完以后，能否快速知道哪里错了，并把这次修正带进下一次执行。"
    ],
    note: "以上是 open letters 的编辑判断，不是任何单一来源的原话。"
  },
  practical: {
    title: "今天可以试：给 agent 写一张“边界卡”",
    intro:
      "挑一项每周都会重复、规则大致清楚的工作。如果工具具备相应的数据访问权限，可以先用下面的结构做一次小范围测试。",
    prompt: `你是我的工作助理。

先查看我授权你访问的最近几周日历和拒绝记录，归纳我通常会接受和拒绝的会议模式。如果你无法访问这些数据，请先告诉我，不要猜测。

处理新邀请时遵守以下规则：
1. 每周会议总时长控制在 20 小时以内。
2. 标出重复或冲突的会议，不要直接修改。
3. 晚餐不计入 20 小时。
4. 更新任何邀请前，先向我确认。
5. 规则冲突时，列出冲突并等待我决定。

输出两部分：你观察到的偏好，以及建议的处理结果。`,
    note: "先让 agent 给建议，不要急着开放自动修改权限。观察一周，再决定下一步。",
    source: {
      label: "灵感来自 Cat Wu 的日历管理 prompt",
      url: "https://x.com/_catwu/status/2079011428380602526"
    }
  },
  fieldNote: {
    title: "顺手记下：软件也可以是一次性的",
    paragraphs: [
      "Zara Zhang 提到一种正在变得便宜的做法：为了调设计做一个临时 playground，为理解代码生成一张 HTML 页面，或者为一次检查搭一个 dashboard。任务结束，工具也可以结束。",
      "这适合放进产品团队的日常实验。先做一件只服务当前问题的小工具，验证它有没有省下时间。有效再保留，无效就删掉。"
    ],
    source: {
      label: "Zara Zhang，Builder",
      url: "https://x.com/zarazhangrui/status/2078835308905578660"
    }
  },
  closing: [
    "今天我会留下一个问题：你手里有没有一项每周重复、规则大致清楚、又经常让人烦的工作？",
    "先别做万能 agent。挑其中一个小环节，写清边界和确认点，跑一周看看。"
  ],
  illustrations: [
    {
      cid: "controlled-workflow@openletters",
      filename: "01-controlled-workflow.png",
      alt: "小黑把散乱的 AI 能力缝进带有边界、确认和反馈的工作流"
    },
    {
      cid: "disposable-software@openletters",
      filename: "02-disposable-software.png",
      alt: "小黑为一次任务铺设一段用完即可收回的临时纸桥"
    }
  ],
  provenance: {
    generatedAt: "2026-07-21T06:08:00.000Z",
    feedGeneratedAt: "2026-07-20T07:22:43.172Z",
    feedSource: "https://github.com/zarazhangrui/follow-builders",
    sourceCount: 6
  }
} as const;
