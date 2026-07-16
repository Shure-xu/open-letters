# AGENTS.md

## 项目概览

本项目是 `open letters` 的 newsletter 订阅项目。当前产品形态非常聚焦：用户进入首页，阅读产品介绍，只需要留下邮箱地址即可订阅。订阅后，我们每天定时向订阅用户发送一封邮件，内容包含 AI 最新资讯，以及 AI 产品经理视角下的判断、拆解和思考。

当前代码是这个 newsletter 项目的官网/订阅落地页，来源于 Open Design 导出的单页 `index.html`，已迁移为可部署的 Next.js 项目。

核心定位：

- 品牌：`open letters`
- 产品形态：AI newsletter / 邮件订阅服务
- 用户动作：在首页输入邮箱并订阅
- 交付内容：每天定时发送 AI 最新资讯和 AI 产品经理视角的思考
- 核心价值：帮助订阅用户用较短时间理解当天重要 AI 动态，并判断它们对产品、行业和工作方式意味着什么
- 目标用户：认真做产品的人、AI 产品经理、创业者、关注 AI 产品动态和产品机会的人
- 当前页面能力：静态介绍页、往期亮点展示、邮箱订阅表单交互

## 产品形态与核心工作逻辑

`open letters` 不是一个复杂 SaaS，也不是内容门户。它的核心是一个轻量、稳定、可信的 AI newsletter。

用户路径：

1. 用户访问首页。
2. 用户理解 newsletter 的定位：每天早上收到一封关于 AI 的信。
3. 用户输入邮箱地址。
4. 系统记录订阅邮箱。
5. 订阅成功后，用户进入每日邮件发送名单。
6. 后续每天定时向订阅用户发送邮件。

每日内容工作流：

1. 收集当天 AI 重要资讯，包括模型发布、产品更新、行业动态、工具变化和关键观点。
2. 筛选真正值得产品人关注的信息，避免堆砌新闻。
3. 用 AI 产品经理视角补充判断：这件事解决了什么问题、影响谁、可能改变什么产品机会、是否值得跟进。
4. 整理成一封短邮件，目标阅读时间约 5 分钟。
5. 每天固定时间发送给订阅用户。

产品承诺：

- 简洁：用户只需要邮箱即可订阅。
- 稳定：每天定时发送。
- 有判断：不只是 AI 新闻摘要，而是带有产品经理视角的分析。
- 低负担：邮件篇幅控制在短时间可读完。
- 可持续：内容结构稳定，方便用户形成阅读习惯。

内容栏目可围绕现有页面中的三个板块延展：

- 今日要闻：筛选过的当天 AI 重点动态。
- PM 视角：从产品经理角度解释一条关键新闻背后的产品含义。
- 可用的东西：当天值得尝试的工具、提示词、数据点或实践方法。

## 后续产品开发方向

后续功能应优先围绕 newsletter 的订阅、发送、管理和内容生产展开，不要偏离“用户提供邮箱 -> 每日收到 AI newsletter”的主线。

优先级较高的方向：

- 将当前前端订阅表单接入真实后端。
- 使用 Supabase 存储订阅用户邮箱、订阅状态、创建时间、退订 token 等信息。
- 增加重复订阅检查。
- 增加退订链接和退订状态管理。
- 增加定时发送任务，例如每天早上 8:00 发送邮件。
- 增加邮件内容管理或生成流程。
- 增加发送日志、失败重试和基础统计。

不应优先做的方向：

- 不要把首页改成复杂门户。
- 不要增加与 newsletter 无关的账号系统。
- 不要增加社交、社区、仪表盘等偏离当前定位的功能，除非用户明确要求。
- 不要为了“更像 SaaS”而重做视觉或业务结构。

## 订阅数据与后端原则

当前页面中的订阅表单应先在前端校验邮箱格式，然后调用服务端接口写入 Supabase。服务端必须再次校验邮箱，并只在 Supabase 写入成功后返回订阅成功。

当前实现入口：

```txt
src/components/SubscriptionForm.tsx
src/app/api/subscribe/route.ts
supabase/schema.sql
```

上线前必须确认：

- Supabase 已执行 `supabase/schema.sql`。
- Vercel 已配置 `SUPABASE_URL`。
- Vercel 已配置服务端变量 `SUPABASE_SERVICE_ROLE_KEY`。
- 不要把 `SUPABASE_SERVICE_ROLE_KEY` 暴露给浏览器或写进仓库。
- 阿里云邮件推送使用华东 1 SMTP，发信地址为 `newsletter@mail.xushure.asia`。
- SMTP 凭据只存放在 Vercel 环境变量中，不得写进仓库或暴露给浏览器。
- 受保护的 `POST /api/email/test` 仅用于小规模 SMTP 验证，最多允许 5 个有效订阅者。
- 新订阅通过 `POST /api/subscribe` 入库后立即发送本地维护的 `welcome-v1` 欢迎邮件，并在 `email_sends` 中记录结果。
- `email_sends` 对 `(subscriber_id, issue_id)` 使用唯一索引，重复提交同一邮箱不得重复发送欢迎邮件。

真实生产逻辑建议：

- 前端提交邮箱到 API Route、Server Action 或后端服务。
- 后端写入 Supabase。
- Supabase 表建议至少包含：邮箱、订阅状态、来源、创建时间、更新时间、退订 token、最近发送时间。
- 邮箱应做唯一约束。
- 后端需要校验邮箱格式，避免只依赖前端校验。
- 退订链接应使用不可猜测 token。
- 不要在前端暴露 Supabase service role key。

建议数据模型草案：

```txt
subscribers
  id uuid primary key
  email text unique not null
  status text not null default 'active'
  source text
  unsubscribe_token text unique
  created_at timestamptz default now()
  updated_at timestamptz default now()
  last_sent_at timestamptz
```

建议发送日志草案：

```txt
email_sends
  id uuid primary key
  subscriber_id uuid references subscribers(id)
  issue_id text
  status text
  provider_message_id text
  error_message text
  sent_at timestamptz
  created_at timestamptz default now()
```

技术栈：

- Next.js `16.2.10`
- React `19.2.7`
- TypeScript
- App Router
- 普通全局 CSS：`src/app/globals.css`
- 唯一主要 Client Component：`src/components/SubscriptionForm.tsx`

项目目录：

```txt
next-project/
  package.json
  package-lock.json
  next.config.ts
  tsconfig.json
  eslint.config.mjs
  vercel.json
  public/
  src/
    app/
      layout.tsx
      page.tsx
      globals.css
    components/
    data/
    lib/
    assets/
    styles/
```

重要约束：

- 这是工程化迁移项目，不要擅自重新设计页面。
- 保持原始 Open Design 的视觉风格、颜色、字体、间距、圆角、阴影、布局、断点和动画节奏。
- 不要引入 Tailwind 或大型 UI 框架。
- 不要把整个页面改成 Client Component。
- 浏览器 API 只应放在 Client Component、事件回调或安全的客户端同步逻辑中。

## 本地开发

项目根目录：

```powershell
cd "D:\2_codex\Api_open letters\next-project"
```

安装依赖：

```powershell
npm install
```

本地运行：

```powershell
npm run dev
```

默认访问：

```txt
http://localhost:3000
```

代码检查：

```powershell
npm run lint
```

生产构建：

```powershell
npm run build
```

注意：`npm run build` 当前使用：

```txt
next build --webpack
```

原因：在当前 Windows 环境中，Next 16 默认 Turbopack build 曾出现 `.next` manifest 文件 `EPERM` rename 问题；webpack build 已在本地和 Vercel 上验证通过。

## 当前域名与线上地址

Vercel 生产地址：

```txt
https://open-letters-sigma.vercel.app
```

自定义域名：

```txt
https://xushure.asia
https://www.xushure.asia
```

Vercel 项目：

```txt
scope/team: surexhs18068849890
project: open-letters
projectId: prj_8gbf7cDUw4BpcNzOm0k5PVJwvZQT
orgId: team_1H0glFimcBeVOwbpLzUuJF5f
```

Vercel 域名状态曾确认：

- `xushure.asia` 已添加到 Vercel 项目。
- `www.xushure.asia` 已添加到 Vercel 项目。
- `xushure.asia` 在 Vercel CLI 中验证为 configured correctly。

## GitHub 仓库

远端仓库：

```txt
https://github.com/Shure-xu/open-letters.git
```

本地 remote：

```txt
origin https://github.com/Shure-xu/open-letters.git
```

主分支：

```txt
main
```

常用命令：

```powershell
git status --short --branch
git add .
git commit -m "Describe change"
git push
```

如果 Windows 上 Git 操作提示 `.git/index.lock` 残留，先确认没有其他 Git 进程正在运行，再删除空锁文件：

```powershell
Remove-Item -LiteralPath ".git\index.lock" -Force -ErrorAction SilentlyContinue
```

不要使用 `git reset --hard` 或 `git checkout --` 覆盖用户改动，除非用户明确要求。

## Vercel CLI

本机不一定有全局 `vercel` 命令，推荐使用一次性 CLI：

```powershell
npx --yes vercel@54.21.1 whoami
npx --yes vercel@54.21.1 deploy --prod --yes
```

当前已登录过的 Vercel 账号：

```txt
xuhangshuo510-7753
```

检查项目链接：

```powershell
Get-Content -Raw ".vercel\project.json"
```

检查域名：

```powershell
npx --yes vercel@54.21.1 domains inspect xushure.asia
npx --yes vercel@54.21.1 domains verify xushure.asia
npx --yes vercel@54.21.1 domains inspect www.xushure.asia
npx --yes vercel@54.21.1 domains verify www.xushure.asia
```

部署后可用下面命令检查线上响应：

```powershell
Invoke-WebRequest -UseBasicParsing "https://open-letters-sigma.vercel.app"
Invoke-WebRequest -UseBasicParsing "https://xushure.asia"
```

项目中有 `vercel.json`：

```json
{
  "buildCommand": "npm run build"
}
```

## Supabase MCP

当前项目配置了 Supabase MCP：

```powershell
codex mcp add supabase --url "https://mcp.supabase.com/mcp?project_ref=dbawvqwmhrgpgcrudnhg"
```

MCP server 名称：

```txt
supabase
```

Supabase project ref：

```txt
dbawvqwmhrgpgcrudnhg
```

检查 MCP 配置：

```powershell
codex mcp list
codex mcp get supabase
```

登录授权：

```powershell
codex mcp login supabase
```

已完成过 OAuth 授权；`codex mcp list` 曾显示：

```txt
supabase  enabled  OAuth
```

注意：

- MCP 添加后，当前 Codex 会话可能不会立刻热加载出 `mcp__supabase__...` 工具。
- 如工具列表中没有 Supabase 工具，重启 Codex、重新打开项目线程，或开新线程后再试。
- 使用 Supabase MCP 前优先做只读检查，例如列出项目、列出表、读取 schema；不要直接写入或删除数据，除非用户明确要求。

在本项目中，Supabase 的预期角色是 newsletter 后端数据层，优先用于：

- 保存订阅用户邮箱。
- 管理订阅状态：`active`、`unsubscribed`、`bounced` 等。
- 存储退订 token。
- 存储每日邮件发送日志。
- 支撑后续订阅 API、退订 API、发送任务和内容运营后台。

使用 Supabase MCP 做开发时，先读取当前 schema，再决定是否新增表或迁移。任何会影响生产数据的写操作都应先说明影响范围。

## 阿里云域名与 DNS

域名：

```txt
xushure.asia
```

购买/托管平台：

```txt
阿里云
```

当前 nameserver 曾显示为阿里云 DNS：

```txt
dns9.hichina.com
dns10.hichina.com
```

推荐继续使用阿里云 DNS，不必把 nameserver 改到 Vercel。需要在阿里云「云解析 DNS」中配置记录。

在本项目中，阿里云目前主要承担域名购买和 DNS 解析角色；业务应用部署在 Vercel，订阅数据计划由 Supabase 管理。除非用户明确要求，不要把应用迁移到阿里云服务器。

推荐解析记录：

| 主机记录 | 类型 | 记录值 |
|---|---|---|
| `@` | `A` | `216.198.79.1` |
| `@` | `A` | `64.29.17.1` |
| `www` | `CNAME` | `be71f8c3e60a3516.vercel-dns-017.com.` |

阿里云控制台路径：

```txt
阿里云控制台 -> 云解析 DNS -> 域名解析 -> xushure.asia -> 解析设置 -> 添加记录
```

DNS 检查命令：

```powershell
Resolve-DnsName xushure.asia -Type A
Resolve-DnsName www.xushure.asia -Type CNAME
nslookup xushure.asia 8.8.8.8
nslookup www.xushure.asia 8.8.8.8
```

本机 DNS 缓存清理：

```powershell
ipconfig /flushdns
```

Chrome DNS 缓存清理：

```txt
chrome://net-internals/#dns
```

然后点击 `Clear host cache`。

注意：

- Vercel 显示 `Valid Configuration` 表示 Vercel 能验证 DNS，但浏览器本地仍可能因缓存、代理、证书签发传播或边缘节点同步短暂失败。
- 如果 `https://xushure.asia` 暂时 502，先确认 `http://xushure.asia` 是否由 Vercel 返回 308 跳转，再等待 10 到 30 分钟。
- `www.xushure.asia` 必须单独配置 DNS 记录，否则可能 NXDOMAIN。

## 阿里云 CLI / 云服务

当前环境曾检查过：

```powershell
aliyun version
where aliyun
Get-Command aliyun -ErrorAction SilentlyContinue
```

结果：本机当时没有可用的 `aliyun` CLI。

如果后续需要通过 CLI 调用阿里云云服务，请先安装并配置阿里云 CLI：

```powershell
aliyun configure
```

常见用途：

- 管理云解析 DNS 记录
- 查询域名解析状态
- 配置其他阿里云资源

安全要求：

- 不要把 AccessKeyId、AccessKeySecret 写入仓库。
- 不要提交 `.env`、`.env.local` 或任何含密钥文件。
- 如需前端公开变量，必须使用 `NEXT_PUBLIC_` 前缀，并在 `.env.example` 中说明。

## 部署与维护建议

常规发布流程：

```powershell
npm run lint
npm run build
git status --short --branch
git add .
git commit -m "Describe change"
git push
npx --yes vercel@54.21.1 deploy --prod --yes
```

如果只想依赖 Vercel GitHub 集成自动部署，需要先在 Vercel 账号中添加 GitHub Login Connection，并连接：

```txt
https://github.com/Shure-xu/open-letters
```

此前 Vercel CLI 自动连接 GitHub 仓库失败，原因是 Vercel 账号还没有绑定 GitHub Login Connection；CLI 直接部署不受影响。

每次涉及 newsletter 核心流程的修改，都应额外检查：

- 首页邮箱输入框是否仍然清晰可见。
- 订阅成功态是否仍然正常。
- 邮箱校验是否正常。
- 如果已接入后端，重复订阅和错误提示是否正常。
- 如果修改发送逻辑，是否会误发、重复发送或发给已退订用户。

## 源文件与迁移背景

原始文件：

```txt
../Velar.-—-Luxury-Real-Estate.zip
../.source/index.html
../.source/DESIGN-HANDOFF.md
../.source/DESIGN-MANIFEST.json
```

原始归档中没有图片、SVG、字体、视频、音频或 favicon 资源。

迁移原则：

- 以 `index.html` 的最终视觉和交互为准。
- 保留原始可见文案。
- CSS token、断点、动画、hover/focus/active 状态应尽量维持原样。
- 订阅表单使用页面内共享的 React 内存状态：提交成功后首页和页尾表单同步显示成功态，刷新页面后重新显示表单，不使用 localStorage 持久化。
