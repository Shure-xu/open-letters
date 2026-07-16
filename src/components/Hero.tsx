import { heroMeta, subscribeCopy } from "@/data/page-content";
import { SubscriptionForm } from "./SubscriptionForm";

export function Hero() {
  return (
    <header className="hero" id="top" data-od-id="hero">
      <div className="container">
        <span className="eyebrow">
          <span className="live" />
          每天早上 8:00 准时抵达
        </span>
        <h1>
          一封关于 <span className="hl">AI</span> 的信,<br />
          写给认真做产品的人
        </h1>
        <p className="hero-sub">
          open letters 每天为你梳理最新 AI 资讯,并附上一位 AI
          产品经理的视角分析——不只是发生了什么,而是它对产品意味着什么。
        </p>

        <SubscriptionForm
          formId="subscribe"
          inputId="email"
          noteId="note"
          successId="success"
          addressId="success-addr"
          defaultNote={subscribeCopy.heroDefaultNote}
          successEnding="欢迎邮件已发送,请检查收件箱。明天早上 8:00,第一封信会准时抵达。"
        />

        <div className="hero-meta" data-od-id="hero-meta">
          {heroMeta.map((item) => (
            <span key={item.key}>
              <span className="k">{item.key}</span> {item.value}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
