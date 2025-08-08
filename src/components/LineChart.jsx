import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { sortAndDedupe, extractSeries } from "../utils/dataHelpers";

/**
 * LineChart renders either a single-series or multi-series line chart using D3.
 * Props:
 * - title: string
 * - data: Array<[number, number | (number|null)[] | null]>
 *   Example single: [[t, v], ...]
 *   Example multi: [[t, [v1, v2, v3]], ...]
 */
export default function LineChart({
  title,
  data,
  width = 700,
  height = 300,
  margin = { top: 8, right: 24, bottom: 30, left: 48 },
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!Array.isArray(data)) return;

    // Prepare data: sort + dedupe by timestamp
    const sorted = sortAndDedupe(data);
    const isMulti = Array.isArray(sorted[0]?.[1]);

    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const root = d3.select(ref.current);
    root.selectAll("*").remove(); // cleanup

    const svg = root
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("role", "img")
      .attr("aria-label", title ? `Chart: ${title}` : "Line chart");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

 
    const yValues = [];
    if (!isMulti) {
      for (const [_, v] of sorted) if (typeof v === "number") yValues.push(v);
    } else {
      for (const [_, vs] of sorted)
        if (Array.isArray(vs))
          vs.forEach((v) => {
            if (typeof v === "number") yValues.push(v);
          });
    }

    // Handle edge case: if no numeric values, skip rendering
    if (yValues.length === 0) {
      g.append("text").text("No numeric data").attr("x", 0).attr("y", 16);
      return;
    }

    const x = d3
      .scaleLinear()
      .domain(d3.extent(sorted, (d) => d[0]))
      .nice()
      .range([0, w]);

    const y = d3.scaleLinear().domain(d3.extent(yValues)).nice().range([h, 0]);
    g.append("g")
      .attr("class", "grid grid-y")
      .call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat(""))
      .selectAll("line")
      .attr("stroke", "#444")
      .attr("stroke-opacity", 0.3);

    g.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6));
    g.append("g").call(d3.axisLeft(y).ticks(6));

    const line = d3
      .line()
      .x((d) => x(d[0]))
      .y((d) => y(d[1]))
      .defined((d) => typeof d[1] === "number") // skip nulls
      .curve(d3.curveMonotoneX);

    if (!isMulti) {
      const series = sorted.map(([t, v]) => [t, v]);
      g.append("path")
        .datum(series)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);
    } else {
      const colors = ["steelblue", "green", "red"]; // 1st: Blue, 2nd: Green, 3rd: Red
      const series = extractSeries(sorted, true);

      series.forEach((s, i) => {
        g.append("path")
          .datum(s)
          .attr("fill", "none")
          .attr("stroke", colors[i])
          .attr("stroke-width", 1.5)
          .attr("d", line);
      });
      const legend = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${height - 8})`);
      ["Series 1", "Series 2", "Series 3"].forEach((label, i) => {
        const lg = legend
          .append("g")
          .attr("transform", `translate(${i * 120}, 0)`);
        lg.append("line")
          .attr("x1", 0)
          .attr("y1", -6)
          .attr("x2", 24)
          .attr("y2", -6)
          .attr("stroke", colors[i])
          .attr("stroke-width", 2);
        lg.append("text")
          .attr("x", 30)
          .attr("y", -3)
          .attr("font-size", 12)
          .text(label);
      });
    }
  }, [data, height, margin, title, width]);

  return <div ref={ref} />;
}
