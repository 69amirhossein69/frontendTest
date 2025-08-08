import { useEffect, useState } from "react";
import LineChart from "./components/LineChart.jsx";

function App() {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/data/data.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!Array.isArray(json)) throw new Error("data.json must export an array");
        setCharts(json);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Failed to load data.json");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error)
    return (
      <div style={{ padding: 16, color: "crimson" }}>
        Error loading charts: {String(error)}
      </div>
    );

  return (
    <div style={{ padding: 16, display: "grid", gap: 24 }}>
      {charts.map((c, idx) => {
        const title = typeof c?.title === "string" ? c.title : `Chart ${idx + 1}`;
        const data = Array.isArray(c?.data) ? c.data : [];
        if (data.length === 0) {
          return (
            <div key={idx} style={{ display: "grid", gap: 8 }}>
              <h3 style={{ margin: 0 }}>{title}</h3>
              <div style={{ color: "#b33" }}>Invalid or empty data for this chart.</div>
            </div>
          );
        }
        return (
          <div key={idx} style={{ display: "grid", gap: 8 }}>
            <h3 style={{ margin: 0 }}>{title}</h3>
            <LineChart title={title} data={data} />
          </div>
        );
      })}
    </div>
  );
}

export default App;
