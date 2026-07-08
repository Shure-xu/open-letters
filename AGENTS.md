# AGENTS.md

## 项目概览

本项目是 `open letters` 的官网/订阅落地页，来源于 Open Design 导出的单页 `index.html`，已迁移为可部署的 Next.js 项目。

核心定位：

- 品牌：`open letters`
- 内容：每天早上 8:00，一封关于 AI 的信
- 目标用户：认真做产品的人、AI 产品经理、关注 AI 产品动态的人
- 当前页面能力：静态介绍页、往期亮点展示、邮箱订阅表单交互

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
- 订阅表单使用 React state 和 localStorage，成功态与原始脚本保持一致。
