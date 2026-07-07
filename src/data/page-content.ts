export const navItems = [
  { label: "读什么", href: "#inside" },
  { label: "发送节奏", href: "#rhythm" },
  { label: "往期", href: "#issues" }
];

export const heroMeta = [
  { key: "7:00–8:00", value: "每日发送" },
  { key: "5 分钟", value: "读完" },
  { key: "PM 视角", value: "独家分析" }
];

export const featureCards = [
  {
    id: "brief",
    number: "01",
    title: "今日要闻",
    body: "筛选过的当日重点:模型发布、产品更新、行业动向。只留下真正值得知道的,不堆量。"
  },
  {
    id: "analysis",
    number: "02",
    title: "PM 视角",
    body: "一位 AI 产品经理拆解一条最关键的新闻:它解决了什么问题、动了谁的蛋糕、你的产品该不该跟。"
  },
  {
    id: "toolkit",
    number: "03",
    title: "可用的东西",
    body: "一个当天值得上手的工具、提示词或数据点,附上怎么用。看完就能带走一点实操价值。"
  }
];

export const rhythmSteps = [
  {
    number: "1",
    title: "整夜追踪",
    body: "凌晨到清晨,持续扫描全球 AI 资讯源,不漏掉时差另一端发生的事。"
  },
  {
    number: "2",
    title: "筛选与判断",
    body: "去掉噪音与营销稿,挑出真正影响产品与行业的几条,写下 PM 视角的解读。"
  },
  {
    number: "3",
    title: "早八送达",
    body: "每天早上 8:00,一封排版干净、五分钟读完的信,准时出现在你的收件箱。"
  }
];

export const mailPreview = {
  from: "open letters",
  subject: "今日 AI:一份写给产品人的早报",
  time: "08:00",
  heading: "今天,值得你花五分钟",
  items: [
    { tag: "今日要闻", body: "三条重点动态,已按对产品的影响排序。" },
    { tag: "PM 视角", body: "今天最该关注的一条,为什么它比看起来更重要。" },
    { tag: "可用的东西", body: "一个今天就能试的工具,附上上手步骤。" }
  ]
};

export const pastIssues = [
  {
    id: "1",
    date: "07 / 04",
    title: '当"记忆"成为默认能力',
    description: "长上下文与持久记忆如何重写产品的留存逻辑。"
  },
  {
    id: "2",
    date: "07 / 03",
    title: "Agent 不是功能,是新的交互层",
    description: '从"输入指令"到"托付目标",PM 该如何重画流程。'
  },
  {
    id: "3",
    date: "07 / 02",
    title: "推理成本下降的那天,谁最先受益",
    description: "价格曲线怎么改变了值得做的产品形态。"
  },
  {
    id: "4",
    date: "07 / 01",
    title: "评测跑分之外,用户真正在乎什么",
    description: "把 benchmark 翻译成用户能感知的体验差异。"
  }
];

export const subscribeCopy = {
  placeholder: "输入你的邮箱地址",
  ariaLabel: "邮箱地址",
  button: "绑定并订阅",
  successTitle: "订阅成功,欢迎加入",
  heroDefaultNote: "免费。每天一封,随时可退订。",
  ctaDefaultNote: "已有读者每天早上和我们一起开始。",
  missingEmail: "请输入邮箱地址再订阅。",
  invalidEmail: "这个邮箱看起来不太对,检查一下?"
};
