import React from "react";
import { Link } from "react-router-dom";
import BrandMark from "../components/BrandMark";

const heroBoards = [
  { a: "MBA", b: "Staying in Job", pct: 58, color: "var(--teal)" },
  { a: "Bali", b: "Goa", pct: 71, color: "var(--brass)" },
  { a: "iPhone 17", b: "Galaxy S26", pct: 54, color: "var(--coral)" },
];

const examples = [
  { cat: "Career", title: "Startup Offer vs. Corporate Job", opt: "Startup", pct: 61 },
  { cat: "Lifestyle", title: "Remote vs. Office Work", opt: "Remote", pct: 83 },
  { cat: "Education", title: "Study Abroad vs. Local University", opt: "Study Abroad", pct: 49 },
];

export default function Landing() {
  return (
    <div>
      <div className="lp-nav">
        <div className="brand">
          <BrandMark stroke="#171B1E" dot="#B9862F" />
          <div className="brand-name">DecisionHub</div>
        </div>
        <div className="lp-links">
          <span>How it works</span>
          <span>Communities</span>
          <span>Examples</span>
          <span>Pricing</span>
        </div>
        <div className="lp-cta-row">
          <Link to="/login">Log in</Link>
          <Link to="/register"><button className="btn brass">Create a decision</button></Link>
        </div>
      </div>

      <div className="lp-hero">
        <div>
          <div className="eyebrow">COLLABORATIVE DECISION-MAKING</div>
          <h1>Weigh your options. <em>Let your people vote.</em></h1>
          <p className="lead">
            DecisionHub turns "I don't know what to pick" into a structured board — compare options
            side by side, invite friends or communities to vote, and see the decision tip toward an answer.
          </p>
          <div className="lp-hero-actions">
            <Link to="/register"><button className="btn brass">Start a decision board</button></Link>
            <a className="link" href="#examples">See example boards</a>
          </div>
          <div className="lp-trust">Trusted for career, travel, tech &amp; life decisions · 12,000+ boards created</div>
        </div>

        <div className="hero-visual">
          {heroBoards.map((h) => (
            <div className="hv-item" key={h.a}>
              <div className="hv-top"><b>{h.a}</b><span>vs. {h.b}</span></div>
              <div className="hv-track"><div className="hv-fill" style={{ width: `${h.pct}%`, background: h.color }} /></div>
              <div className="hv-cap"><span>{h.pct}%</span><span>{100 - h.pct}%</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-band">
        <div className="lp-band-inner">
          <div className="lp-band-stat"><div className="n">12,400+</div><div className="l">Decision boards created</div></div>
          <div className="lp-band-stat"><div className="n">180K+</div><div className="l">Votes cast to date</div></div>
          <div className="lp-band-stat"><div className="n">620+</div><div className="l">Active communities</div></div>
          <div className="lp-band-stat"><div className="n">68%</div><div className="l">Avg. poll participation</div></div>
        </div>
      </div>

      <div className="lp-section">
        <div className="lp-section-head">
          <div className="eyebrow">HOW IT WORKS</div>
          <h2>Everything a decision needs, in one board</h2>
          <p>From framing the choice to reaching a verdict — structured comparison, real votes, and a record of why you chose what you chose.</p>
        </div>
        <div className="feat-grid">
          <div className="feat"><div className="fnum">01</div><h3>Create a board</h3><p>Add two or more options, set them public or private, and pick who gets a say.</p></div>
          <div className="feat"><div className="fnum">02</div><h3>Compare with criteria</h3><p>Score each option on cost, risk, time, or your own custom factors.</p></div>
          <div className="feat"><div className="fnum">03</div><h3>Collect votes</h3><p>Public, private, or anonymous polling with single, multiple, or rating-based votes.</p></div>
          <div className="feat"><div className="fnum">04</div><h3>See it tip</h3><p>Watch the board lean toward an answer, backed by discussion and analytics.</p></div>
        </div>
      </div>

      <div className="lp-section" id="examples" style={{ paddingTop: 0 }}>
        <div className="lp-section-head">
          <div className="eyebrow">EXAMPLE BOARDS</div>
          <h2>Decisions people are weighing right now</h2>
        </div>
        <div className="lp-examples">
          {examples.map((ex) => (
            <div className="lp-ex-card" key={ex.title}>
              <span className="cat">{ex.cat}</span>
              <h4>{ex.title}</h4>
              <div className="tip">
                <div className="tip-row"><span className="opt">{ex.opt}</span><span className="pct mono">{ex.pct}%</span></div>
                <div className="tip-track"><div className="tip-fill a" style={{ width: `${ex.pct}%` }} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-cta-band">
        <div className="lp-cta-inner">
          <h2 className="display">Stop deciding alone.</h2>
          <p>Create your first decision board in under two minutes — it's free to start.</p>
          <Link to="/register"><button className="btn brass">Create a decision board</button></Link>
        </div>
      </div>

      <div className="lp-footer">
        <div>© 2026 DecisionHub</div>
        <div>Terms · Privacy · Contact</div>
      </div>
    </div>
  );
}
