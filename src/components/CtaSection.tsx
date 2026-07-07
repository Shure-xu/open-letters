import { subscribeCopy } from "@/data/page-content";
import { SubscriptionForm } from "./SubscriptionForm";

export function CtaSection() {
  return (
    <section className="band cta-band" data-od-id="section-cta">
      <div className="container">
        <h2>明天早八,从第一封信开始</h2>
        <p>免费订阅。绑定邮箱即成为订阅用户,随时一键退订。</p>

        <SubscriptionForm
          formId="subscribe-2"
          inputId="email-2"
          noteId="note-2"
          successId="success-2"
          addressId="success-addr-2"
          defaultNote={subscribeCopy.ctaDefaultNote}
          successEnding="明天早上 8:00,第一封信会准时抵达。"
        />
      </div>
    </section>
  );
}
