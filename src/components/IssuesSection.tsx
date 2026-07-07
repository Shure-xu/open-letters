import { pastIssues } from "@/data/page-content";

export function IssuesSection() {
  return (
    <section className="band alt" id="issues" data-od-id="section-issues">
      <div className="container">
        <div className="section-head">
          <p className="kicker">往期亮点</p>
          <h2>看看过去几封聊了什么</h2>
        </div>
        <div className="issues">
          {pastIssues.map((issue) => (
            <a
              className="issue"
              href="#subscribe"
              data-od-id={`issue-${issue.id}`}
              key={issue.id}
            >
              <span className="date">{issue.date}</span>
              <span className="title">
                {issue.title}
                <span>{issue.description}</span>
              </span>
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
