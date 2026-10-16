import { useEffect, useMemo, useState } from "react";
import "./Analytics.css";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import client from "../api/client";

const CHART_COLORS = [
  "#1F6F6B", // Brand Teal
  "#B5862B", // Brand Brass
  "#D95D39", // Brand Coral
  "#2563EB", // Blue
  "#7C3AED", // Purple
  "#059669", // Emerald
  "#EA580C", // Orange
  "#0891B2", // Cyan
  "#4F46E5", // Indigo
  "#65A30D", // Lime
];

function Analytics() {
  const [summary, setSummary] = useState(null);
  const [voteDistribution, setVoteDistribution] = useState([]);
  const [optionPopularity, setOptionPopularity] = useState([]);
  const [participation, setParticipation] = useState([]);
  const [decisionTrends, setDecisionTrends] = useState([]);
  const [communityActivity, setCommunityActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const [
          summaryResponse,
          voteDistributionResponse,
          optionPopularityResponse,
          participationResponse,
          decisionTrendsResponse,
          communityActivityResponse,
        ] = await Promise.all([
          client.get("/api/analytics/summary"),
          client.get("/api/analytics/vote-distribution"),
          client.get("/api/analytics/option-popularity"),
          client.get("/api/analytics/participation"),
          client.get("/api/analytics/decision-trends"),
          client.get("/api/analytics/community-activity"),
        ]);

        setSummary(summaryResponse.data);
        setVoteDistribution(voteDistributionResponse.data);
        setOptionPopularity(optionPopularityResponse.data);
        setParticipation(participationResponse.data);
        setDecisionTrends(decisionTrendsResponse.data);
        setCommunityActivity(communityActivityResponse.data);
      } catch (err) {
        console.error("Analytics loading error:", err);
        setError("Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const categoryData = useMemo(() => {
    if (!summary?.categoryVotes) return [];

    return Object.entries(summary.categoryVotes).map(
      ([name, votes]) => ({
        name,
        votes,
      })
    );
  }, [summary]);

  const pollTypeData = useMemo(() => {
    if (!summary?.pollTypes) return [];

    return Object.entries(summary.pollTypes).map(
      ([name, count]) => ({
        name,
        count,
      })
    );
  }, [summary]);

  const mostActiveData = useMemo(() => {
    return summary?.mostActive || [];
  }, [summary]);

  const participationChartData = useMemo(() => {
    return participation.slice(0, 8);
  }, [participation]);

  const optionPopularityChartData = useMemo(() => {
    return optionPopularity.slice(0, 8);
  }, [optionPopularity]);

  const voteDistributionChartData = useMemo(() => {
    return voteDistribution.slice(0, 8);
  }, [voteDistribution]);

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();

    const summaryRows = [
      {
        Metric: "Total Decisions",
        Value: summary?.totalBoards || 0,
      },
      {
        Metric: "Total Votes",
        Value: summary?.totalVotes || 0,
      },
      {
        Metric: "Decisions With Votes",
        Value: summary?.boardsWithVotes || 0,
      },
      {
        Metric: "Closed Decisions",
        Value: summary?.closedBoards || 0,
      },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(summaryRows),
      "Summary"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(voteDistribution),
      "Vote Distribution"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(optionPopularity),
      "Option Popularity"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(participation),
      "Participation"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(decisionTrends),
      "Decision Trends"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(communityActivity),
      "Community Activity"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(mostActiveData),
      "Decision Report"
    );

    XLSX.writeFile(
      workbook,
      "DecisionHub_Analytics.xlsx"
    );
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(
      "DecisionHub Analytics Report",
      20,
      20
    );

    doc.setFontSize(11);

    let y = 35;

    doc.text(
      `Total Decisions: ${summary?.totalBoards || 0}`,
      20,
      y
    );

    y += 8;

    doc.text(
      `Total Votes: ${summary?.totalVotes || 0}`,
      20,
      y
    );

    y += 8;

    doc.text(
      `Decisions With Votes: ${
        summary?.boardsWithVotes || 0
      }`,
      20,
      y
    );

    y += 8;

    doc.text(
      `Closed Decisions: ${
        summary?.closedBoards || 0
      }`,
      20,
      y
    );

    y += 15;

    doc.setFontSize(14);
    doc.text(
      "Vote Distribution",
      20,
      y
    );

    y += 10;

    doc.setFontSize(10);

    voteDistribution.forEach((item) => {
      doc.text(
        `${item.decisionTitle} - ${item.optionName}: ${item.voteCount} votes (${item.percentage}%)`,
        20,
        y
      );

      y += 7;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 8;

    doc.setFontSize(14);
    doc.text(
      "Option Popularity",
      20,
      y
    );

    y += 10;

    doc.setFontSize(10);

    optionPopularity.forEach((item) => {
      doc.text(
        `${item.optionName} - ${item.decisionTitle}: ${item.voteCount} votes`,
        20,
        y
      );

      y += 7;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 8;

    doc.setFontSize(14);
    doc.text(
      "Participation Report",
      20,
      y
    );

    y += 10;

    doc.setFontSize(10);

    participation.forEach((item) => {
      doc.text(
        `${item.decisionTitle}: ${item.totalVotes} votes (${item.participationPercentage}%)`,
        20,
        y
      );

      y += 7;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 8;

    doc.setFontSize(14);
    doc.text(
      "Decision Trends",
      20,
      y
    );

    y += 10;

    doc.setFontSize(10);

    decisionTrends.forEach((item) => {
      doc.text(
        `${item.date}: ${item.decisionsCreated} decisions created`,
        20,
        y
      );

      y += 7;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 8;

    doc.setFontSize(14);
    doc.text(
      "Community Activity",
      20,
      y
    );

    y += 10;

    doc.setFontSize(10);

    communityActivity.forEach((item) => {
      doc.text(
        `Community ${item.communityId}: ${item.decisionCount} decisions, ${item.voteCount} votes`,
        20,
        y
      );

      y += 7;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(
      "DecisionHub_Analytics.pdf"
    );
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <h1>Charts & Reports</h1>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <h1>Charts & Reports</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">

      <div className="analytics-header">
        <div>
          <h1>Charts & Reports</h1>

          <p>
            Analyze voting activity, option popularity,
            participation and decision performance.
          </p>
        </div>

        <div className="analytics-actions">
          <button onClick={exportPDF}>
            Export PDF
          </button>

          <button onClick={exportExcel}>
            Export Excel
          </button>
        </div>
      </div>

      <div className="analytics-summary">

        <div className="analytics-card">
          <h3>Total Decisions</h3>
          <strong>
            {summary?.totalBoards || 0}
          </strong>
        </div>

        <div className="analytics-card">
          <h3>Total Votes</h3>
          <strong>
            {summary?.totalVotes || 0}
          </strong>
        </div>

        <div className="analytics-card">
          <h3>Active Decisions</h3>
          <strong>
            {summary?.boardsWithVotes || 0}
          </strong>
        </div>

        <div className="analytics-card">
          <h3>Closed Decisions</h3>
          <strong>
            {summary?.closedBoards || 0}
          </strong>
        </div>

      </div>

      <div className="analytics-grid">

        <div className="analytics-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Vote Distribution</h2>
            {voteDistribution.length > 8 && (
              <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                Top 8 options
              </span>
            )}
          </div>

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <BarChart data={voteDistributionChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2ecea" vertical={false} />
              <XAxis
                dataKey="optionName"
                tickFormatter={(n) => (!n ? "" : n.length > 16 ? `${n.slice(0, 15)}…` : n)}
                tick={{ fill: "#171B1E", fontSize: 11.5, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
                axisLine={{ stroke: "#d1dedc" }}
                tickLine={false}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#4b5563", fontSize: 12, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
                axisLine={{ stroke: "#d1dedc" }}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value} votes`, "Votes"]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#d1dedc",
                  borderRadius: "8px",
                  boxShadow: "0 8px 24px rgba(23, 27, 30, 0.12)",
                  fontSize: "12.5px",
                  padding: "10px 14px",
                  color: "#171B1E",
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10, fontSize: 12 }} />
              <Bar
                dataKey="voteCount"
                name="Votes"
                fill="#1F6F6B"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Option Popularity</h2>
            {optionPopularity.length > 8 && (
              <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                Top 8 options
              </span>
            )}
          </div>

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <BarChart data={optionPopularityChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2ecea" vertical={false} />
              <XAxis
                dataKey="optionName"
                tickFormatter={(n) => (!n ? "" : n.length > 16 ? `${n.slice(0, 15)}…` : n)}
                tick={{ fill: "#171B1E", fontSize: 11.5, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
                axisLine={{ stroke: "#d1dedc" }}
                tickLine={false}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#4b5563", fontSize: 12, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
                axisLine={{ stroke: "#d1dedc" }}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value} votes`, "Votes"]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#d1dedc",
                  borderRadius: "8px",
                  boxShadow: "0 8px 24px rgba(23, 27, 30, 0.12)",
                  fontSize: "12.5px",
                  padding: "10px 14px",
                  color: "#171B1E",
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10, fontSize: 12 }} />
              <Bar
                dataKey="voteCount"
                name="Votes"
                fill="#1F6F6B"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Participation</h2>
            {participation.length > 8 && (
              <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                Top 8 decisions by turnout
              </span>
            )}
          </div>

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <BarChart data={participationChartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2ecea" vertical={false} />
              <XAxis
                dataKey="decisionTitle"
                tickFormatter={(title) => (!title ? "" : title.length > 18 ? `${title.slice(0, 17)}…` : title)}
                tick={{ fill: "#171B1E", fontSize: 11.5, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
                axisLine={{ stroke: "#d1dedc" }}
                tickLine={false}
                angle={-20}
                textAnchor="end"
                interval={0}
                height={60}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#4b5563", fontSize: 12, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
                axisLine={{ stroke: "#d1dedc" }}
                tickLine={false}
              />
              <Tooltip
                formatter={(value, name, item) => [
                  `${value} votes (${item.payload.participationPercentage ?? 0}% turnout)`,
                  "Turnout",
                ]}
                labelFormatter={(label) => `Decision: ${label}`}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#d1dedc",
                  borderRadius: "8px",
                  boxShadow: "0 8px 24px rgba(23, 27, 30, 0.12)",
                  fontSize: "12.5px",
                  padding: "10px 14px",
                  color: "#171B1E",
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10, fontSize: 12 }} />
              <Bar
                dataKey="totalVotes"
                name="Total Votes"
                fill="#1F6F6B"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-panel">
          <h2>Decision Trends</h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <LineChart data={decisionTrends} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2ecea" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#171B1E", fontSize: 11.5, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
                axisLine={{ stroke: "#d1dedc" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#4b5563", fontSize: 12, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
                axisLine={{ stroke: "#d1dedc" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#d1dedc",
                  borderRadius: "8px",
                  boxShadow: "0 8px 24px rgba(23, 27, 30, 0.12)",
                  fontSize: "12.5px",
                  padding: "10px 14px",
                  color: "#171B1E",
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10, fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="decisionsCreated"
                name="Decisions Created"
                stroke="#1F6F6B"
                strokeWidth={2.5}
                dot={{ fill: "#1F6F6B", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-panel">
          <h2>Category Vote Distribution</h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <PieChart>

              <Pie
                data={categoryData}
                dataKey="votes"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >

                {categoryData.map(
                  (entry, index) => (
                    <Cell
                      key={index}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  )
                )}

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-panel">
          <h2>Poll Type Distribution</h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <PieChart>

              <Pie
                data={pollTypeData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >

                {pollTypeData.map(
                  (entry, index) => (
                    <Cell
                      key={index}
                      fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]}
                    />
                  )
                )}

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      <div className="analytics-panel">
        <h2>Community Activity</h2>

        <ResponsiveContainer
          width="100%"
          height={350}
        >
          <BarChart data={communityActivity} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2ecea" vertical={false} />
            <XAxis
              dataKey="communityId"
              tickFormatter={(id) => (!id || id === 0 ? "Global" : `Community #${id}`)}
              tick={{ fill: "#171B1E", fontSize: 11.5, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
              axisLine={{ stroke: "#d1dedc" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#4b5563", fontSize: 12, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
              axisLine={{ stroke: "#d1dedc" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#d1dedc",
                borderRadius: "8px",
                boxShadow: "0 8px 24px rgba(23, 27, 30, 0.12)",
                fontSize: "12.5px",
                padding: "10px 14px",
                color: "#171B1E",
              }}
            />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10, fontSize: 12 }} />
            <Bar
              dataKey="decisionCount"
              name="Decisions"
              fill="#1F6F6B"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="voteCount"
              name="Votes"
              fill="#D95D39"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="analytics-panel">
        <h2>Most Active Decisions</h2>

        <ResponsiveContainer
          width="100%"
          height={360}
        >
          <BarChart
            data={mostActiveData}
            layout="vertical"
            margin={{
              left: 20,
              right: 30,
              top: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2ecea"
              horizontal={false}
            />

            <XAxis
              type="number"
              allowDecimals={false}
              tick={{
                fill: "#4b5563",
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
              }}
              axisLine={{ stroke: "#d1dedc" }}
              tickLine={false}
            />

            <YAxis
              type="category"
              dataKey="title"
              width={200}
              tick={{
                fill: "#171B1E",
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
              }}
              axisLine={{ stroke: "#d1dedc" }}
              tickLine={false}
              tickFormatter={(title) => {
                if (!title) return "";
                return title.length > 22 ? `${title.slice(0, 21)}…` : title;
              }}
            />

            <Tooltip
              formatter={(value) => [`${value} votes`, "Total Votes"]}
              labelFormatter={(label) => `Decision: ${label}`}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#d1dedc",
                borderRadius: "8px",
                boxShadow: "0 8px 24px rgba(23, 27, 30, 0.12)",
                fontSize: "12.5px",
                padding: "10px 14px",
                color: "#171B1E",
              }}
            />

            <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />

            <Bar
              dataKey="totalVotes"
              name="Total Votes"
              fill="#1F6F6B"
              radius={[0, 6, 6, 0]}
              maxBarSize={28}
            />

          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="analytics-panel">
        <h2>Decision Report</h2>

        <div className="analytics-table-wrapper">

          <table className="analytics-table">

            <thead>
              <tr>
                <th>Decision</th>
                <th>Category</th>
                <th>Total Votes</th>
              </tr>
            </thead>

            <tbody>

              {mostActiveData.map(
                (item, idx) => (
                  <tr key={item.id ?? idx}>

                    <td>
                      {item.title}
                    </td>

                    <td>
                      {item.category ||
                        "General"}
                    </td>

                    <td>
                      {item.totalVotes}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>
      </div>

      <div className="analytics-panel">
        <h2>Poll Result Report</h2>

        <div className="analytics-table-wrapper">

          <table className="analytics-table">

            <thead>
              <tr>
                <th>Decision</th>
                <th>Option</th>
                <th>Votes</th>
                <th>Percentage</th>
              </tr>
            </thead>

            <tbody>

              {voteDistribution.map(
                (item, idx) => (
                  <tr
                    key={`${item.decisionId ?? idx}-${item.optionId ?? idx}`}
                  >

                    <td>
                      {item.decisionTitle || item.title}
                    </td>

                    <td>
                      {item.optionName || "—"}
                    </td>

                    <td>
                      {item.voteCount}
                    </td>

                    <td>
                      {item.percentage ?? 0}%
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>
      </div>

      <div className="analytics-panel">
        <h2>Voting Analytics Report</h2>

        <div className="analytics-table-wrapper">

          <table className="analytics-table">

            <thead>
              <tr>
                <th>Decision</th>
                <th>Total Votes</th>
                <th>Participation</th>
              </tr>
            </thead>

            <tbody>

              {participation.map(
                (item, idx) => (
                  <tr
                    key={item.decisionId ?? item.date ?? idx}
                  >

                    <td>
                      {item.decisionTitle || item.date || "Decision"}
                    </td>

                    <td>
                      {item.totalVotes ?? item.voteCount ?? 0}
                    </td>

                    <td>
                      {item.participationPercentage ?? 0}%
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>
      </div>

      <div className="analytics-panel">
        <h2>Community Report</h2>

        <div className="analytics-table-wrapper">

          <table className="analytics-table">

            <thead>
              <tr>
                <th>Community</th>
                <th>Decisions</th>
                <th>Votes</th>
              </tr>
            </thead>

            <tbody>

              {communityActivity.map(
                (item, idx) => (
                  <tr
                    key={item.communityId ?? item.communityName ?? idx}
                  >

                    <td>
                      {item.communityName || (item.communityId === 0
                        ? "General"
                        : `Community ${item.communityId}`)}
                    </td>

                    <td>
                      {item.decisionCount}
                    </td>

                    <td>
                      {item.voteCount}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}

export default Analytics;