// Utilities for handling chart data consistently

// Determine if a point is multi-series by checking if value is an array
export function isMultiPoint(pt) {
  return Array.isArray(pt?.[1]);
}

// Sort by timestamp and collapse duplicate timestamps by keeping the last seen value
export function sortAndDedupe(points) {
  if (!Array.isArray(points)) return [];
  const copy = [...points].filter((d) => Array.isArray(d) && d.length >= 2);
  copy.sort((a, b) => (a?.[0] ?? 0) - (b?.[0] ?? 0));

  const result = [];
  let prevT = undefined;
  for (let i = 0; i < copy.length; i++) {
    const [t, v] = copy[i];
    if (t === prevT) {
      // overwrite last entry for duplicate timestamp
      result[result.length - 1] = [t, v];
    } else {
      result.push([t, v]);
      prevT = t;
    }
  }
  return result;
}

// For multi-series, ensure we always return 3 series. If fewer are provided, pad with nulls.
export function extractSeries(sorted, isMulti) {
  if (!isMulti) {
    return [sorted.map(([t, v]) => [t, v])];
  }
  return [0, 1, 2].map((idx) =>
    sorted.map(([t, vs]) => [t, Array.isArray(vs) ? vs[idx] ?? null : null])
  );
}
