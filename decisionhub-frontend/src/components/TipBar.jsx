import React from "react";

/** The "tipping bar" signature visual: one row per option, each with a fill proportional to its % of votes. */
export default function TipBar({ optionA, pctA, optionB, pctB }) {
  return (
    <>
      <div className="tip">
        <div className="tip-row"><span className="opt">{optionA}</span><span className="pct mono">{pctA}%</span></div>
        <div className="tip-track"><div className="tip-fill a" style={{ width: `${pctA}%` }} /></div>
      </div>
      <div className="tip">
        <div className="tip-row"><span className="opt">{optionB}</span><span className="pct mono">{pctB}%</span></div>
        <div className="tip-track"><div className="tip-fill b" style={{ width: `${pctB}%` }} /></div>
      </div>
    </>
  );
}
