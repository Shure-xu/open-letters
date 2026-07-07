import { featureCards } from "@/data/page-content";

export function InsideSection() {
  return (
    <section className="band alt" id="inside" data-od-id="section-inside">
      <div className="container">
        <div className="section-head">
          <p className="kicker">每封信里有什么</p>
          <h2>资讯之外,更在意判断</h2>
          <p>
            信息不缺,缺的是取舍与视角。每封信固定三个板块,帮你在五分钟内建立对当天
            AI 动态的完整认知。
          </p>
        </div>
        <div className="grid-3">
          {featureCards.map((card) => (
            <article
              className="card"
              data-od-id={`card-${card.id}`}
              key={card.id}
            >
              <div className="num">{card.number}</div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
