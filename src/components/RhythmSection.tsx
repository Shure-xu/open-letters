import { mailPreview, rhythmSteps } from "@/data/page-content";

export function RhythmSection() {
  return (
    <section className="band" id="rhythm" data-od-id="section-rhythm">
      <div className="container">
        <div className="rhythm">
          <div>
            <div className="section-head section-head-tight">
              <p className="kicker">发送节奏</p>
              <h2>准时,是我们对你时间的尊重</h2>
            </div>
            <div className="rhythm-steps">
              {rhythmSteps.map((step) => (
                <div className="step" key={step.number}>
                  <div className="badge">{step.number}</div>
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="mail"
            data-od-id="mail-preview"
            aria-label="邮件预览示例"
          >
            <div className="mail-bar">
              <div className="avatar">ol</div>
              <div>
                <div className="from">{mailPreview.from}</div>
                <div className="subj">{mailPreview.subject}</div>
              </div>
              <time>{mailPreview.time}</time>
            </div>
            <div className="mail-body">
              <div className="mh">{mailPreview.heading}</div>
              {mailPreview.items.map((item) => (
                <div className="mail-item" key={item.tag}>
                  <span className="tag">{item.tag}</span>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
