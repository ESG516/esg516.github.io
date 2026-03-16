"use strict";

const sampleData = [
  { firm: "A", year: 2019, ROA: 0.045, ESG_score: 62, ESG_Environment: 58, ESG_Social: 65, ESG_Governance: 63, FirmSize: 8.6, Leverage: 0.42 },
  { firm: "A", year: 2020, ROA: 0.049, ESG_score: 64, ESG_Environment: 60, ESG_Social: 66, ESG_Governance: 64, FirmSize: 8.7, Leverage: 0.41 },
  { firm: "A", year: 2021, ROA: 0.053, ESG_score: 67, ESG_Environment: 63, ESG_Social: 68, ESG_Governance: 66, FirmSize: 8.8, Leverage: 0.40 },
  { firm: "B", year: 2019, ROA: 0.038, ESG_score: 55, ESG_Environment: 50, ESG_Social: 57, ESG_Governance: 58, FirmSize: 8.2, Leverage: 0.50 },
  { firm: "B", year: 2020, ROA: 0.041, ESG_score: 57, ESG_Environment: 52, ESG_Social: 58, ESG_Governance: 60, FirmSize: 8.3, Leverage: 0.49 },
  { firm: "B", year: 2021, ROA: 0.043, ESG_score: 59, ESG_Environment: 54, ESG_Social: 60, ESG_Governance: 61, FirmSize: 8.4, Leverage: 0.48 },
  { firm: "C", year: 2019, ROA: 0.032, ESG_score: 48, ESG_Environment: 45, ESG_Social: 49, ESG_Governance: 50, FirmSize: 7.9, Leverage: 0.58 },
  { firm: "C", year: 2020, ROA: 0.034, ESG_score: 50, ESG_Environment: 47, ESG_Social: 51, ESG_Governance: 52, FirmSize: 8.0, Leverage: 0.57 },
  { firm: "C", year: 2021, ROA: 0.036, ESG_score: 52, ESG_Environment: 49, ESG_Social: 53, ESG_Governance: 54, FirmSize: 8.1, Leverage: 0.55 },
  { firm: "D", year: 2019, ROA: 0.060, ESG_score: 72, ESG_Environment: 70, ESG_Social: 73, ESG_Governance: 74, FirmSize: 9.0, Leverage: 0.36 },
  { firm: "D", year: 2020, ROA: 0.062, ESG_score: 74, ESG_Environment: 72, ESG_Social: 75, ESG_Governance: 76, FirmSize: 9.1, Leverage: 0.35 },
  { firm: "D", year: 2021, ROA: 0.065, ESG_score: 76, ESG_Environment: 74, ESG_Social: 77, ESG_Governance: 78, FirmSize: 9.2, Leverage: 0.34 }
];

const variableDictionary = {
  firm: "Firm identifier",
  year: "Fiscal year",
  ROA: "Return on Assets (financial performance)",
  ESG_score: "Overall ESG performance score",
  ESG_Environment: "Environmental pillar score",
  ESG_Social: "Social pillar score",
  ESG_Governance: "Governance pillar score",
  FirmSize: "Firm size (e.g., log assets)",
  Leverage: "Leverage ratio"
};

const state = {
  data: [...sampleData],
  numericColumns: [],
  categoricalColumns: [],
  allColumns: [],
  edaSelectedColumns: [],
  modelSelectedFactors: [],
  tableSort: { key: null, order: "asc" },
  tablePage: 1
};

const tableNodes = {
  head: document.getElementById("data-table-head"),
  body: document.getElementById("data-table-body"),
  search: document.getElementById("table-search"),
  pageSize: document.getElementById("table-page-size"),
  prev: document.getElementById("prev-page"),
  next: document.getElementById("next-page"),
  pageInfo: document.getElementById("page-info")
};

function isNumeric(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isMissing(value) {
  return value === null || value === undefined || value === "";
}

function inferColumns(data) {
  if (!data.length) {
    return { all: [], numeric: [], categorical: [] };
  }
  const keySet = new Set();
  data.forEach((row) => {
    Object.keys(row).forEach((k) => keySet.add(k));
  });
  const all = [...keySet];

  const numeric = all.filter((k) => {
    const values = data.map((row) => row[k]).filter((v) => !isMissing(v));
    if (!values.length) return false;
    const numericCount = values.filter((v) => Number.isFinite(Number(v))).length;
    const ratio = numericCount / values.length;
    return numericCount >= 3 && ratio >= 0.75;
  });
  const categorical = all.filter((k) => !numeric.includes(k));
  return { all, numeric, categorical };
}

function splitCSVLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === "\"") {
      if (inQuotes && next === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

function parseValue(raw) {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return null;
  const num = Number(trimmed);
  if (!Number.isNaN(num)) return num;
  return trimmed;
}

function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = splitCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = parseValue(cells[idx] ?? "");
    });
    return row;
  });
}

function updateStateColumns() {
  const inferred = inferColumns(state.data);
  state.allColumns = inferred.all;
  state.numericColumns = inferred.numeric;
  state.categoricalColumns = inferred.categorical;
}

function renderDatasetSummary() {
  const summaryNode = document.getElementById("dataset-summary");
  const observations = state.data.length;
  const variables = state.allColumns.length;
  const typeText = state.allColumns
    .map((col) => `${col}: ${state.numericColumns.includes(col) ? "numeric" : "categorical"}`)
    .join(", ");

  summaryNode.innerHTML = `
    <ul>
      <li><strong>Observations:</strong> ${observations}</li>
      <li><strong>Variables:</strong> ${variables}</li>
      <li><strong>Types:</strong> ${typeText}</li>
      <li><strong>Panel hint:</strong> ${(state.allColumns.includes("firm") || state.allColumns.includes("Identifier (RIC)")) && (state.allColumns.includes("year") || state.allColumns.includes("Date")) ? "firm-year panel detected" : "panel identifier not fully detected"}</li>
    </ul>
  `;
}

function renderVariableDictionary() {
  const node = document.getElementById("variable-dictionary");
  const rows = state.allColumns.map((col) => `<li><strong>${col}</strong>: ${variableDictionary[col] ?? "Custom variable from uploaded data"}</li>`).join("");
  node.innerHTML = `<ul>${rows}</ul>`;
}

function sanitizeName(text) {
  const cleaned = String(text).trim().replace(/[^A-Za-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned || "var";
}

function getUniqueCategories(column) {
  const set = new Set();
  state.data.forEach((row) => {
    const raw = row[column];
    if (isMissing(raw)) return;
    set.add(String(raw).trim());
  });
  return [...set];
}

function sortData(data) {
  const { key, order } = state.tableSort;
  if (!key) return data;
  const sorted = [...data].sort((a, b) => {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  });
  return order === "asc" ? sorted : sorted.reverse();
}

function renderTable() {
  const query = tableNodes.search.value.trim().toLowerCase();
  const pageSize = Number(tableNodes.pageSize.value);
  const filtered = state.data.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(query)));
  const sorted = sortData(filtered);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  state.tablePage = Math.min(state.tablePage, totalPages);
  const start = (state.tablePage - 1) * pageSize;
  const pageData = sorted.slice(start, start + pageSize);

  tableNodes.head.innerHTML = `<tr>${state.allColumns.map((col) => `<th data-col="${col}">${col}</th>`).join("")}</tr>`;
  tableNodes.body.innerHTML = pageData
    .map((row) => `<tr>${state.allColumns.map((col) => `<td>${row[col] ?? ""}</td>`).join("")}</tr>`)
    .join("");

  tableNodes.pageInfo.textContent = `Page ${state.tablePage} / ${totalPages}`;

  tableNodes.head.querySelectorAll("th").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.getAttribute("data-col");
      if (state.tableSort.key === key) {
        state.tableSort.order = state.tableSort.order === "asc" ? "desc" : "asc";
      } else {
        state.tableSort.key = key;
        state.tableSort.order = "asc";
      }
      renderTable();
    });
  });
}

function setSelectOptions(selectId, options, selected = "") {
  const node = document.getElementById(selectId);
  node.innerHTML = options.map((opt) => `<option value="${opt}">${opt}</option>`).join("");
  if (selected && options.includes(selected)) node.value = selected;
}

function setMultiSelectOptions(selectId, options, selectedList = []) {
  const node = document.getElementById(selectId);
  node.innerHTML = options.map((opt) => `<option value="${opt}">${opt}</option>`).join("");
  const selectedSet = new Set(selectedList);
  [...node.options].forEach((opt) => {
    opt.selected = selectedSet.has(opt.value);
  });
}

function setOneHotSourceOptions() {
  const node = document.getElementById("onehot-source");
  const options = state.categoricalColumns;
  node.innerHTML = options.map((opt) => `<option value="${opt}">${opt}</option>`).join("");
  if (!options.length) {
    node.innerHTML = "<option value=\"\">No categorical variable</option>";
    return;
  }
  if (!options.includes(node.value)) {
    node.value = options[0];
  }
}

function pickDefaultEdaColumns() {
  const preferred = [
    "ESG_score",
    "Env_score",
    "Social_score",
    "Gov_score",
    "RETURN_ON_ASSET",
    "ROA",
    "FNCL_LVRG",
    "Leverage",
    "Market_cap",
    "Total_assets"
  ].filter((v) => state.numericColumns.includes(v));
  const merged = [...new Set([...preferred, ...state.numericColumns])];
  return merged.slice(0, 6);
}

function getNumericSeries(column, rows = state.data) {
  return rows
    .map((row) => Number(row[column]))
    .filter((v) => Number.isFinite(v));
}

function getPairedSeries(xCol, yCol, rows = state.data) {
  const x = [];
  const y = [];
  rows.forEach((row) => {
    const xv = Number(row[xCol]);
    const yv = Number(row[yCol]);
    if (Number.isFinite(xv) && Number.isFinite(yv)) {
      x.push(xv);
      y.push(yv);
    }
  });
  return { x, y };
}

function getCompleteRows(columns, rows = state.data) {
  return rows.filter((row) => columns.every((col) => Number.isFinite(Number(row[col]))));
}

function columnValues(column) {
  return getNumericSeries(column);
}

function mean(arr) {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function std(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / Math.max(arr.length - 1, 1));
}

function correlation(a, b) {
  if (a.length !== b.length || a.length < 2) return 0;
  const ma = mean(a);
  const mb = mean(b);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < a.length; i += 1) {
    const va = a[i] - ma;
    const vb = b[i] - mb;
    num += va * vb;
    da += va * va;
    db += vb * vb;
  }
  const den = Math.sqrt(da * db);
  return den === 0 ? 0 : num / den;
}

function renderConceptualFramework() {
  Plotly.newPlot("conceptual-framework", [{
    type: "sankey",
    arrangement: "snap",
    node: {
      pad: 18,
      thickness: 18,
      line: { color: "#d1d5db", width: 1 },
      label: [
        "ESG Performance",
        "Firm Size",
        "Leverage",
        "Risk Reduction",
        "Reputation",
        "Operational Efficiency",
        "Financial Performance (ROA)"
      ],
      color: [
        "#0f4c81",
        "#4b5563",
        "#6b7280",
        "#2a9d8f",
        "#3ba99c",
        "#56b8a9",
        "#264653"
      ],
      x: [0.02, 0.02, 0.02, 0.42, 0.42, 0.42, 0.86],
      y: [0.08, 0.42, 0.74, 0.08, 0.42, 0.74, 0.40]
    },
    link: {
      source: [0, 0, 0, 1, 2, 3, 4, 5],
      target: [3, 4, 5, 6, 6, 6, 6, 6],
      value: [3, 2.2, 2.5, 1.2, 1.0, 2.2, 1.8, 2.0],
      color: [
        "rgba(15,76,129,0.35)",
        "rgba(15,76,129,0.28)",
        "rgba(15,76,129,0.3)",
        "rgba(75,85,99,0.25)",
        "rgba(107,114,128,0.25)",
        "rgba(42,157,143,0.35)",
        "rgba(59,169,156,0.35)",
        "rgba(86,184,169,0.35)"
      ],
      hovertemplate: "%{source.label} -> %{target.label}<extra></extra>"
    }
  }], {
    margin: { t: 20, r: 20, b: 20, l: 20 },
    font: { family: "Inter, Arial, sans-serif", size: 12, color: "#111827" },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff"
  }, { responsive: true });
}

function renderDistribution() {
  const col = document.getElementById("dist-variable").value;
  const values = columnValues(col);
  Plotly.newPlot("dist-plot", [{
    x: values,
    type: "histogram",
    marker: { color: "#0f4c81" },
    opacity: 0.85
  }], {
    title: `Distribution: ${col}`,
    margin: { t: 40, r: 20, b: 40, l: 40 }
  }, { responsive: true });
}

function renderScatter() {
  const xCol = document.getElementById("scatter-x").value;
  const yCol = document.getElementById("scatter-y").value;
  const paired = getPairedSeries(xCol, yCol);
  Plotly.newPlot("scatter-plot", [{
    x: paired.x,
    y: paired.y,
    type: "scatter",
    mode: "markers",
    marker: { size: 9, color: "#2a9d8f" }
  }], {
    title: `${yCol} vs ${xCol}`,
    xaxis: { title: xCol },
    yaxis: { title: yCol },
    margin: { t: 40, r: 20, b: 45, l: 45 }
  }, { responsive: true });
}

function renderCorrelation() {
  const holder = document.getElementById("corr-plot");
  holder.innerHTML = "";

  let cols = state.edaSelectedColumns.filter((c) => state.numericColumns.includes(c));
  if (cols.length < 2) cols = state.numericColumns.slice(0, 3);
  if (cols.length > 6) cols = cols.slice(0, 6);

  const grid = document.createElement("div");
  grid.className = "corr-grid";
  grid.style.gridTemplateColumns = `repeat(${cols.length}, minmax(120px, 1fr))`;
  holder.appendChild(grid);

  for (let i = 0; i < cols.length; i += 1) {
    for (let j = 0; j < cols.length; j += 1) {
      const cell = document.createElement("div");
      const cellId = `corr-cell-${i}-${j}`;
      cell.className = "corr-cell";
      cell.id = cellId;
      grid.appendChild(cell);

      const rowName = cols[i];
      const colName = cols[j];
      const commonLayout = {
        margin: { t: 18, r: 8, b: 22, l: 22 },
        showlegend: false,
        paper_bgcolor: "#ffffff",
        plot_bgcolor: "#ffffff"
      };

      if (i === j) {
        const values = getNumericSeries(rowName);
        Plotly.newPlot(cellId, [{
          x: values,
          type: "histogram",
          marker: { color: "#0f4c81" },
          nbinsx: 18,
          opacity: 0.9
        }], {
          ...commonLayout,
          title: { text: rowName, font: { size: 10 } },
          xaxis: { showticklabels: false },
          yaxis: { showticklabels: false }
        }, { displayModeBar: false, responsive: true });
      } else if (i > j) {
        const paired = getPairedSeries(colName, rowName);
        const corr = paired.x.length > 1 ? correlation(paired.x, paired.y) : 0;
        Plotly.newPlot(cellId, [{
          z: [[corr]],
          type: "heatmap",
          colorscale: "RdBu",
          zmin: -1,
          zmax: 1,
          showscale: false,
          text: [[corr.toFixed(2)]],
          texttemplate: "%{text}",
          textfont: { size: 12, color: "#111827" },
          hovertemplate: `${rowName} vs ${colName}<br>corr=%{z:.3f}<extra></extra>`
        }], {
          ...commonLayout,
          xaxis: { showticklabels: false },
          yaxis: { showticklabels: false }
        }, { displayModeBar: false, responsive: true });
      } else {
        const paired = getPairedSeries(colName, rowName);
        Plotly.newPlot(cellId, [{
          x: paired.x,
          y: paired.y,
          type: "scatter",
          mode: "markers",
          marker: { size: 4, color: "#2a9d8f", opacity: 0.65 },
          hovertemplate: `${colName}=%{x:.3g}<br>${rowName}=%{y:.3g}<extra></extra>`
        }], {
          ...commonLayout,
          xaxis: { showticklabels: false },
          yaxis: { showticklabels: false }
        }, { displayModeBar: false, responsive: true });
      }
    }
  }
}

function renderParallelPlot() {
  const cols = state.edaSelectedColumns.filter((c) => state.numericColumns.includes(c)).slice(0, 8);
  const target = document.getElementById("parallel-plot");
  const labelNode = document.getElementById("parallel-columns");
  if (cols.length < 2) {
    Plotly.purge(target);
    labelNode.textContent = "";
    target.innerHTML = "<p>Please select at least 2 numeric variables for parallel coordinates.</p>";
    return;
  }

  const completeRows = getCompleteRows(cols);
  if (!completeRows.length) {
    Plotly.purge(target);
    labelNode.textContent = "";
    target.innerHTML = "<p>No complete observations across selected variables.</p>";
    return;
  }
  const colorVar = cols.includes("ESG_score") ? "ESG_score" : cols[0];
  labelNode.textContent = `Columns: ${cols.join(" | ")}`;

  const dimensions = cols.map((col) => ({
    label: col,
    values: completeRows.map((row) => Number(row[col]))
  }));

  Plotly.newPlot("parallel-plot", [{
    type: "parcoords",
    dimensions,
    labelfont: { size: 13, color: "#111827" },
    tickfont: { size: 11, color: "#4b5563" },
    line: {
      color: completeRows.map((row) => Number(row[colorVar])),
      colorscale: "Viridis",
      showscale: true,
      colorbar: { title: colorVar }
    }
  }], {
    margin: { t: 25, r: 40, b: 20, l: 40 }
  }, { responsive: true });
}

function transform(values, type) {
  if (type === "log") return values.map((v) => Math.log1p(Math.max(v, 0)));
  if (type === "zscore") {
    const m = mean(values);
    const s = std(values) || 1;
    return values.map((v) => (v - m) / s);
  }
  if (type === "minmax") {
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const d = maxV - minV || 1;
    return values.map((v) => (v - minV) / d);
  }
  return [...values];
}

function renderFeatureDistribution() {
  const col = document.getElementById("feature-variable").value;
  const transformType = document.getElementById("transform-type").value;
  const original = columnValues(col);
  const transformed = transform(original, transformType);

  Plotly.newPlot("feature-dist-original", [{
    x: original,
    type: "histogram",
    marker: { color: "#0f4c81" },
    opacity: 0.88,
    nbinsx: 30
  }], {
    title: `Original: ${col}`,
    margin: { t: 40, r: 20, b: 40, l: 40 }
  }, { responsive: true });

  Plotly.newPlot("feature-dist-transformed", [{
    x: transformed,
    type: "histogram",
    marker: { color: "#e76f51" },
    opacity: 0.88,
    nbinsx: 30
  }], {
    title: `Transformed (${transformType}): ${col}`,
    margin: { t: 40, r: 20, b: 40, l: 40 }
  }, { responsive: true });
}

function transpose(matrix) {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]));
}

function multiplyMatrices(a, b) {
  const rows = a.length;
  const cols = b[0].length;
  const kLen = b.length;
  const out = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i += 1) {
    for (let k = 0; k < kLen; k += 1) {
      for (let j = 0; j < cols; j += 1) {
        out[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return out;
}

function invertMatrix(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);

  for (let i = 0; i < n; i += 1) {
    let pivot = a[i][i];
    if (Math.abs(pivot) < 1e-10) {
      let swap = i + 1;
      while (swap < n && Math.abs(a[swap][i]) < 1e-10) swap += 1;
      if (swap === n) throw new Error("Matrix not invertible.");
      [a[i], a[swap]] = [a[swap], a[i]];
      pivot = a[i][i];
    }
    for (let j = 0; j < 2 * n; j += 1) a[i][j] /= pivot;
    for (let r = 0; r < n; r += 1) {
      if (r === i) continue;
      const factor = a[r][i];
      for (let c = 0; c < 2 * n; c += 1) {
        a[r][c] -= factor * a[i][c];
      }
    }
  }
  return a.map((row) => row.slice(n));
}

function ols(data, yVar, xVars) {
  const rows = data
    .map((r) => ({ y: Number(r[yVar]), x: xVars.map((v) => Number(r[v])) }))
    .filter((r) => Number.isFinite(r.y) && r.x.every((v) => Number.isFinite(v)));
  const n = rows.length;
  const p = xVars.length + 1;
  if (n <= p) throw new Error("Not enough observations for selected model.");

  const X = rows.map((r) => [1, ...r.x]);
  const y = rows.map((r) => [r.y]);
  const Xt = transpose(X);
  const XtX = multiplyMatrices(Xt, X);
  const XtXInv = invertMatrix(XtX);
  const XtY = multiplyMatrices(Xt, y);
  const beta = multiplyMatrices(XtXInv, XtY).map((b) => b[0]);

  const yHat = X.map((row) => row.reduce((s, v, i) => s + v * beta[i], 0));
  const yVals = y.map((v) => v[0]);
  const resid = yVals.map((v, i) => v - yHat[i]);
  const sse = resid.reduce((s, v) => s + v * v, 0);
  const yMean = mean(yVals);
  const sst = yVals.reduce((s, v) => s + (v - yMean) ** 2, 0);
  const r2 = 1 - sse / (sst || 1);
  const adjR2 = 1 - (1 - r2) * ((n - 1) / (n - p));
  const sigma2 = sse / (n - p);
  const varBeta = XtXInv.map((row) => row.map((v) => v * sigma2));
  const se = varBeta.map((row, i) => Math.sqrt(Math.max(row[i], 0)));
  const tStat = beta.map((b, i) => b / (se[i] || 1));

  return {
    coefficients: ["Intercept", ...xVars].map((name, i) => ({
      variable: name,
      coef: beta[i],
      se: se[i],
      t: tStat[i]
    })),
    fitted: yHat,
    actual: yVals,
    r2,
    adjR2,
    rmse: Math.sqrt(sse / n)
  };
}

function setModelMessage(text, isError = false) {
  const node = document.getElementById("model-message");
  node.textContent = text || "";
  node.style.color = isError ? "#b91c1c" : "#6b7280";
}

function refreshSelectorsAfterSchemaChange() {
  const numeric = state.numericColumns.length ? state.numericColumns : state.allColumns;
  setSelectOptions("dist-variable", numeric, document.getElementById("dist-variable").value);
  setSelectOptions("scatter-x", numeric, document.getElementById("scatter-x").value);
  setSelectOptions("scatter-y", numeric, document.getElementById("scatter-y").value);
  setSelectOptions("feature-variable", numeric, document.getElementById("feature-variable").value);
  setMultiSelectOptions("eda-variable-select", numeric, state.edaSelectedColumns.filter((c) => numeric.includes(c)));
  refreshModelSelectors(true);
  setOneHotSourceOptions();
}

function getPreferredDependent() {
  const candidates = ["RETURN_ON_ASSET", "ROA", "Net_income"];
  const found = candidates.find((c) => state.numericColumns.includes(c));
  return found || state.numericColumns[0] || "";
}

function refreshModelSelectors(keepCurrent = true) {
  const depNode = document.getElementById("dep-var");
  const factorNode = document.getElementById("factor-var");
  const prevDep = keepCurrent ? depNode.value : "";
  const dep = state.numericColumns.includes(prevDep) ? prevDep : getPreferredDependent();
  setSelectOptions("dep-var", state.numericColumns, dep);
  const options = state.numericColumns.filter((c) => c !== depNode.value);
  setSelectOptions("factor-var", options, options[0] || "");
  state.modelSelectedFactors = state.modelSelectedFactors.filter((f) => options.includes(f));
  renderModelFactorList();
}

function renderModelFactorList() {
  const node = document.getElementById("model-factor-list");
  if (!state.modelSelectedFactors.length) {
    node.innerHTML = "<span class=\"hint\">No factors selected.</span>";
    return;
  }
  node.innerHTML = state.modelSelectedFactors.map((f) => `
    <span class="chip">${f} <button type="button" data-remove-factor="${f}">x</button></span>
  `).join("");
  node.querySelectorAll("[data-remove-factor]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-remove-factor");
      state.modelSelectedFactors = state.modelSelectedFactors.filter((f) => f !== name);
      renderModelFactorList();
    });
  });
}

function applyModelPreset(type) {
  const depNode = document.getElementById("dep-var");
  const baseline = ["ESG_score", "FirmSize", "Leverage", "FNCL_LVRG"].filter((x) => state.numericColumns.includes(x));
  const extended = ["Env_score", "Social_score", "Gov_score", "ESG_Environment", "ESG_Social", "ESG_Governance", "FirmSize", "Leverage", "FNCL_LVRG"]
    .filter((x) => state.numericColumns.includes(x));
  state.modelSelectedFactors = (type === "baseline" ? baseline : extended)
    .filter((x, i, arr) => arr.indexOf(x) === i)
    .filter((x) => x !== depNode.value);
  renderModelFactorList();
}

function parseModelFormula(formula) {
  const refs = [];
  const transformed = formula.replace(/\{([^}]+)\}/g, (_, rawCol) => {
    const col = rawCol.trim();
    if (!state.allColumns.includes(col)) throw new Error(`Unknown column: ${col}`);
    if (!refs.includes(col)) refs.push(col);
    return `v_${refs.indexOf(col)}`;
  });
  if (!refs.length) throw new Error("Formula must include at least one {column} placeholder.");
  return { refs, transformed: transformed.replace(/\^/g, "**") };
}

function addModelFeature() {
  const nameNode = document.getElementById("model-feature-name");
  const formulaNode = document.getElementById("model-feature-formula");
  const featureName = (nameNode.value || "").trim();
  const formula = (formulaNode.value || "").trim();
  if (!featureName) {
    setModelMessage("Please provide a new variable name.", true);
    return;
  }
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(featureName)) {
    setModelMessage("Variable name must be letters/numbers/underscore and start with a letter.", true);
    return;
  }
  if (state.allColumns.includes(featureName)) {
    setModelMessage(`Variable "${featureName}" already exists.`, true);
    return;
  }
  if (!formula) {
    setModelMessage("Please provide a formula.", true);
    return;
  }

  try {
    const parsed = parseModelFormula(formula);
    const expr = math.compile(parsed.transformed);
    let validCount = 0;
    state.data.forEach((row) => {
      const scope = {};
      let missing = false;
      parsed.refs.forEach((col, idx) => {
        const v = Number(row[col]);
        if (!Number.isFinite(v)) missing = true;
        scope[`v_${idx}`] = v;
      });
      if (missing) {
        row[featureName] = null;
        return;
      }
      const result = Number(expr.evaluate(scope));
      row[featureName] = Number.isFinite(result) ? result : null;
      if (Number.isFinite(result)) validCount += 1;
    });
    setModelMessage(`Feature "${featureName}" created. Valid rows: ${validCount}.`);
    nameNode.value = "";
    updateStateColumns();
    renderDatasetSummary();
    renderVariableDictionary();
    renderTable();
    refreshSelectorsAfterSchemaChange();

    renderDistribution();
    renderScatter();
    renderCorrelation();
    renderParallelPlot();
    renderFeatureDistribution();
  } catch (err) {
    setModelMessage(`Feature creation failed: ${err.message}`, true);
  }
}

function createOneHotVariables() {
  const sourceNode = document.getElementById("onehot-source");
  const prefixNode = document.getElementById("onehot-prefix");
  const dropFirst = document.getElementById("onehot-drop-first").checked;
  const source = sourceNode.value;
  if (!source || !state.categoricalColumns.includes(source)) {
    setModelMessage("Please select a valid categorical variable.", true);
    return;
  }

  const categories = getUniqueCategories(source);
  if (categories.length < 2) {
    setModelMessage("Selected categorical variable has fewer than 2 categories.", true);
    return;
  }

  const rawPrefix = (prefixNode.value || "").trim();
  const prefix = sanitizeName(rawPrefix || source);
  const startIndex = dropFirst ? 1 : 0;
  const dep = document.getElementById("dep-var").value;
  const createdCols = [];

  for (let i = startIndex; i < categories.length; i += 1) {
    const cat = categories[i];
    let name = `${prefix}_${sanitizeName(cat)}`;
    let suffix = 2;
    while (state.allColumns.includes(name) || createdCols.includes(name)) {
      name = `${prefix}_${sanitizeName(cat)}_${suffix}`;
      suffix += 1;
    }
    createdCols.push(name);
  }

  if (!createdCols.length) {
    setModelMessage("No one-hot column generated. Try disabling drop-first.", true);
    return;
  }

  state.data.forEach((row) => {
    const value = isMissing(row[source]) ? null : String(row[source]).trim();
    createdCols.forEach((colName, idx) => {
      const categoryValue = categories[idx + startIndex];
      row[colName] = value === categoryValue ? 1 : 0;
    });
  });

  updateStateColumns();
  renderDatasetSummary();
  renderVariableDictionary();
  renderTable();
  refreshSelectorsAfterSchemaChange();
  createdCols.forEach((col) => {
    if (col !== dep && !state.modelSelectedFactors.includes(col)) {
      state.modelSelectedFactors.push(col);
    }
  });
  renderModelFactorList();

  renderDistribution();
  renderScatter();
  renderCorrelation();
  renderParallelPlot();
  renderFeatureDistribution();
  setModelMessage(`Created ${createdCols.length} one-hot variable(s): ${createdCols.join(", ")}`);
}

function renderModel(result) {
  const summaryNode = document.getElementById("model-summary");
  const metricsNode = document.getElementById("model-metrics");

  const rows = result.coefficients
    .map((r) => `<tr><td>${r.variable}</td><td>${r.coef.toFixed(4)}</td><td>${r.se.toFixed(4)}</td><td>${r.t.toFixed(3)}</td></tr>`)
    .join("");

  summaryNode.innerHTML = `
    <table class="mini-table">
      <thead><tr><th>Variable</th><th>Coefficient</th><th>Std. Error</th><th>t-Stat</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  metricsNode.innerHTML = `
    <div class="metric-card"><span class="k">R²</span><span class="v">${result.r2.toFixed(4)}</span></div>
    <div class="metric-card"><span class="k">Adjusted R²</span><span class="v">${result.adjR2.toFixed(4)}</span></div>
    <div class="metric-card"><span class="k">RMSE</span><span class="v">${result.rmse.toFixed(4)}</span></div>
    <div class="metric-card"><span class="k">Observations</span><span class="v">${result.actual.length}</span></div>
  `;

  Plotly.newPlot("pred-actual-plot", [{
    x: result.actual,
    y: result.fitted,
    mode: "markers",
    type: "scatter",
    marker: { color: "#264653", size: 8 }
  }], {
    title: "Predicted vs Actual",
    xaxis: { title: "Actual" },
    yaxis: { title: "Predicted" },
    margin: { t: 40, r: 20, b: 45, l: 45 }
  }, { responsive: true });

  const residuals = result.actual.map((v, i) => v - result.fitted[i]);
  Plotly.newPlot("residual-plot", [{
    x: result.fitted,
    y: residuals,
    mode: "markers",
    type: "scatter",
    marker: { color: "#2a9d8f", size: 7, opacity: 0.75 }
  }], {
    title: "Residual vs Predicted",
    xaxis: { title: "Predicted" },
    yaxis: { title: "Residual" },
    margin: { t: 40, r: 20, b: 45, l: 45 }
  }, { responsive: true });

  const nonIntercept = result.coefficients.filter((r) => r.variable !== "Intercept");
  Plotly.newPlot("coef-plot", [{
    x: nonIntercept.map((r) => r.variable),
    y: nonIntercept.map((r) => r.coef),
    type: "bar",
    marker: { color: "#0f4c81" }
  }], {
    title: "Coefficient Effects",
    margin: { t: 40, r: 20, b: 70, l: 45 }
  }, { responsive: true });
}

function runSelectedModel() {
  const dep = document.getElementById("dep-var").value;
  const validX = state.modelSelectedFactors
    .filter((x) => state.numericColumns.includes(x))
    .filter((x) => x !== dep);
  if (!dep || !state.numericColumns.includes(dep)) {
    setModelMessage("Dependent variable must be numeric.", true);
    return;
  }
  if (!validX.length) {
    setModelMessage("Please add at least one independent variable.", true);
    return;
  }

  try {
    const result = ols(state.data, dep, validX);
    document.getElementById("model-equation").textContent =
      `${dep} = beta0 ${validX.map((v, i) => `+ beta${i + 1}*${v}`).join(" ")} + epsilon`;
    renderModel(result);
    setModelMessage("Model estimated successfully.");
  } catch (err) {
    document.getElementById("model-summary").innerHTML = `<p>${err.message}</p>`;
    document.getElementById("model-metrics").innerHTML = "";
    document.getElementById("model-equation").textContent = "No model yet.";
    Plotly.purge("pred-actual-plot");
    Plotly.purge("residual-plot");
    Plotly.purge("coef-plot");
    setModelMessage(err.message, true);
  }
}

function bindEvents() {
  tableNodes.search.addEventListener("input", () => {
    state.tablePage = 1;
    renderTable();
  });
  tableNodes.pageSize.addEventListener("change", () => {
    state.tablePage = 1;
    renderTable();
  });
  tableNodes.prev.addEventListener("click", () => {
    state.tablePage = Math.max(1, state.tablePage - 1);
    renderTable();
  });
  tableNodes.next.addEventListener("click", () => {
    const pageSize = Number(tableNodes.pageSize.value);
    const totalPages = Math.max(1, Math.ceil(state.data.length / pageSize));
    state.tablePage = Math.min(totalPages, state.tablePage + 1);
    renderTable();
  });

  document.getElementById("dist-variable").addEventListener("change", renderDistribution);
  document.getElementById("scatter-x").addEventListener("change", renderScatter);
  document.getElementById("scatter-y").addEventListener("change", renderScatter);
  document.getElementById("feature-variable").addEventListener("change", renderFeatureDistribution);
  document.getElementById("transform-type").addEventListener("change", renderFeatureDistribution);
  document.getElementById("run-model").addEventListener("click", runSelectedModel);
  document.getElementById("add-factor").addEventListener("click", () => {
    const factor = document.getElementById("factor-var").value;
    const dep = document.getElementById("dep-var").value;
    if (!factor || factor === dep) return;
    if (!state.modelSelectedFactors.includes(factor)) {
      state.modelSelectedFactors.push(factor);
      renderModelFactorList();
    }
  });
  document.getElementById("clear-factors").addEventListener("click", () => {
    state.modelSelectedFactors = [];
    renderModelFactorList();
  });
  document.getElementById("dep-var").addEventListener("change", () => {
    state.modelSelectedFactors = state.modelSelectedFactors.filter((f) => f !== document.getElementById("dep-var").value);
    refreshModelSelectors(true);
  });
  document.getElementById("apply-baseline").addEventListener("click", () => applyModelPreset("baseline"));
  document.getElementById("apply-extended").addEventListener("click", () => applyModelPreset("extended"));
  document.getElementById("add-model-feature").addEventListener("click", addModelFeature);
  document.getElementById("create-onehot").addEventListener("click", createOneHotVariables);
  document.getElementById("onehot-source").addEventListener("change", () => {
    const source = document.getElementById("onehot-source").value;
    if (!source) return;
    document.getElementById("onehot-prefix").value = sanitizeName(source);
  });
  window.addEventListener("scroll", updateProgress);
  document.getElementById("apply-eda-vars").addEventListener("click", () => {
    const selected = [...document.getElementById("eda-variable-select").selectedOptions].map((o) => o.value);
    state.edaSelectedColumns = selected.length ? selected : pickDefaultEdaColumns();
    renderCorrelation();
    renderParallelPlot();
  });

  document.getElementById("file-input").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    let parsed;
    if (file.name.toLowerCase().endsWith(".json")) {
      parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of objects.");
    } else {
      parsed = parseCSV(text);
    }
    if (!parsed.length) return;
    state.data = parsed;
    initializeViews();
  });
}

function updateProgress() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const progress = total <= 0 ? 100 : (window.scrollY / total) * 100;
  document.getElementById("progress").value = Math.min(100, Math.max(0, progress));
}

function initializeViews() {
  updateStateColumns();
  state.edaSelectedColumns = pickDefaultEdaColumns();
  renderDatasetSummary();
  renderVariableDictionary();
  renderTable();

  const preferred = ["ROA", "ESG_score", "FirmSize", "Leverage"].filter((v) => state.numericColumns.includes(v));
  const fallback = state.numericColumns;
  const numeric = fallback.length ? fallback : state.allColumns;

  setSelectOptions("dist-variable", numeric, preferred[0] || numeric[0]);
  setSelectOptions("scatter-x", numeric, "ESG_score");
  setSelectOptions("scatter-y", numeric, "ROA");
  setSelectOptions("feature-variable", numeric, "FirmSize");
  setMultiSelectOptions("eda-variable-select", numeric, state.edaSelectedColumns);
  refreshModelSelectors(false);
  setOneHotSourceOptions();
  if (state.categoricalColumns.length) {
    document.getElementById("onehot-prefix").value = sanitizeName(state.categoricalColumns[0]);
  }
  applyModelPreset("baseline");

  renderConceptualFramework();
  renderDistribution();
  renderScatter();
  renderCorrelation();
  renderParallelPlot();
  renderFeatureDistribution();
  runSelectedModel();
  updateProgress();
}

bindEvents();
initializeViews();
