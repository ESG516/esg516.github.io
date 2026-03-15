const state = {
  rawRows: [],
  originalColumns: [],
  columnMeta: {},
  engineeredData: {},
  selectedTarget: null,
  selectedFactors: [],
  dragPayload: null
};

const csvInput = document.getElementById("csvInput");
const uploadBtn = document.getElementById("uploadBtn");
const loadExampleBtn = document.getElementById("loadExampleBtn");
const originalVarsEl = document.getElementById("originalVars");
const engineeredVarsEl = document.getElementById("engineeredVars");
const poolDropZoneEl = document.getElementById("poolDropZone");
const targetZoneEl = document.getElementById("targetZone");
const factorsZoneEl = document.getElementById("factorsZone");
const featureNameInput = document.getElementById("featureNameInput");
const formulaInput = document.getElementById("formulaInput");
const addFeatureBtn = document.getElementById("addFeatureBtn");
const confirmModelBtn = document.getElementById("confirmModelBtn");
const clearModelBtn = document.getElementById("clearModelBtn");
const messageBox = document.getElementById("messageBox");
const equationBox = document.getElementById("equationBox");
const mseValue = document.getElementById("mseValue");
const r2Value = document.getElementById("r2Value");
const rowsUsedValue = document.getElementById("rowsUsedValue");
const datasetSummaryEl = document.getElementById("datasetSummary");

function showMessage(text, type = "muted") {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}

function resetModelOutput() {
  equationBox.textContent = "No model yet.";
  mseValue.textContent = "-";
  r2Value.textContent = "-";
  rowsUsedValue.textContent = "-";
  Plotly.purge("predictedActualPlot");
  Plotly.purge("residualPlot");
  Plotly.purge("coefPlot");
}

function clearSelections() {
  state.selectedTarget = null;
  state.selectedFactors = [];
  renderSelections();
}

function clearAllData() {
  state.rawRows = [];
  state.originalColumns = [];
  state.columnMeta = {};
  state.engineeredData = {};
  clearSelections();
  renderVariablePool();
  updateDatasetSummary();
  resetModelOutput();
}

function parseCsvText(csvText) {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: "greedy",
    dynamicTyping: false
  });

  if (result.errors && result.errors.length > 0) {
    throw new Error(`CSV parse error: ${result.errors[0].message}`);
  }

  const rows = result.data || [];
  if (rows.length === 0) {
    throw new Error("CSV has no data rows.");
  }

  const columns = result.meta.fields || Object.keys(rows[0]);
  state.rawRows = rows;
  state.originalColumns = columns;
  state.engineeredData = {};
  state.selectedTarget = null;
  state.selectedFactors = [];
  inferColumnMeta();
  renderVariablePool();
  renderSelections();
  updateDatasetSummary();
  resetModelOutput();
}

function parseCsvFile(file) {
  if (!file) return;
  Papa.parse(file, {
    header: true,
    skipEmptyLines: "greedy",
    dynamicTyping: false,
    complete: (results) => {
      try {
        if (results.errors && results.errors.length > 0) {
          throw new Error(results.errors[0].message);
        }
        if (!results.data || results.data.length === 0) {
          throw new Error("CSV has no rows.");
        }
        state.rawRows = results.data;
        state.originalColumns = results.meta.fields || Object.keys(results.data[0]);
        state.engineeredData = {};
        clearSelections();
        inferColumnMeta();
        renderVariablePool();
        updateDatasetSummary();
        resetModelOutput();
        showMessage(`Loaded ${file.name} successfully.`, "success");
      } catch (err) {
        clearAllData();
        showMessage(`Failed to load CSV: ${err.message}`, "error");
      }
    },
    error: (err) => {
      clearAllData();
      showMessage(`Failed to parse CSV: ${err.message}`, "error");
    }
  });
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (value === null || value === undefined) return NaN;
  const text = String(value).trim();
  if (!text) return NaN;
  const num = Number(text);
  return Number.isFinite(num) ? num : NaN;
}

function inferNumericForColumn(colName) {
  if (!state.rawRows.length) return false;
  let hasNumericValue = false;
  for (const row of state.rawRows) {
    const v = row[colName];
    if (v === null || v === undefined || String(v).trim() === "") continue;
    const num = toNumber(v);
    if (!Number.isFinite(num)) return false;
    hasNumericValue = true;
  }
  return hasNumericValue;
}

function inferColumnMeta() {
  const meta = {};
  for (const col of state.originalColumns) {
    meta[col] = { numeric: inferNumericForColumn(col), source: "original" };
  }
  for (const featureName of Object.keys(state.engineeredData)) {
    meta[featureName] = { numeric: true, source: "engineered" };
  }
  state.columnMeta = meta;
}

function isColumnNumeric(colName) {
  if (state.engineeredData[colName]) return true;
  return Boolean(state.columnMeta[colName] && state.columnMeta[colName].numeric);
}

function getAllColumns() {
  return [...state.originalColumns, ...Object.keys(state.engineeredData)];
}

function createDraggableNode(colName, asChip = false, role = "pool") {
  const node = document.createElement("div");
  node.className = asChip ? "chip" : "var-card";
  node.draggable = true;
  node.dataset.col = colName;
  node.dataset.role = role;

  if (!isColumnNumeric(colName)) node.classList.add("non-numeric");

  const label = document.createElement("span");
  label.textContent = colName;
  node.appendChild(label);

  if (!isColumnNumeric(colName)) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = "non-numeric";
    node.appendChild(badge);
  }

  node.addEventListener("dragstart", (e) => {
    const payload = {
      col: colName,
      role,
      fromSelection: role === "target" || role === "factor"
    };
    state.dragPayload = payload;
    e.dataTransfer.setData("text/plain", JSON.stringify(payload));
  });

  node.addEventListener("dragend", () => {
    state.dragPayload = null;
  });

  return node;
}

function renderVariablePool() {
  originalVarsEl.innerHTML = "";
  engineeredVarsEl.innerHTML = "";

  state.originalColumns.forEach((col) => {
    originalVarsEl.appendChild(createDraggableNode(col, false, "pool"));
  });

  Object.keys(state.engineeredData).forEach((col) => {
    engineeredVarsEl.appendChild(createDraggableNode(col, false, "pool"));
  });
}

function renderSelections() {
  targetZoneEl.innerHTML = "";
  factorsZoneEl.innerHTML = "";

  if (state.selectedTarget) {
    targetZoneEl.appendChild(createDraggableNode(state.selectedTarget, true, "target"));
  } else {
    targetZoneEl.innerHTML = '<span class="placeholder">Drop exactly one variable here</span>';
  }

  if (state.selectedFactors.length === 0) {
    factorsZoneEl.innerHTML = '<span class="placeholder">Drop one or more variables here</span>';
  } else {
    state.selectedFactors.forEach((col) => {
      factorsZoneEl.appendChild(createDraggableNode(col, true, "factor"));
    });
  }
}

function setupDropZone(zoneEl, onDropPayload) {
  zoneEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    zoneEl.classList.add("drag-over");
  });
  zoneEl.addEventListener("dragleave", () => {
    zoneEl.classList.remove("drag-over");
  });
  zoneEl.addEventListener("drop", (e) => {
    e.preventDefault();
    zoneEl.classList.remove("drag-over");
    let payload = state.dragPayload;
    if (!payload) {
      try {
        payload = JSON.parse(e.dataTransfer.getData("text/plain"));
      } catch (err) {
        payload = null;
      }
    }
    if (!payload || !payload.col) return;
    onDropPayload(payload);
    renderSelections();
  });
}

function removeFromSelections(payload) {
  if (payload.role === "target") {
    state.selectedTarget = null;
  }
  if (payload.role === "factor") {
    state.selectedFactors = state.selectedFactors.filter((x) => x !== payload.col);
  }
}

function setupDragAndDrop() {
  setupDropZone(targetZoneEl, (payload) => {
    if (payload.role === "factor") {
      state.selectedFactors = state.selectedFactors.filter((x) => x !== payload.col);
    }
    state.selectedTarget = payload.col;
    state.selectedFactors = state.selectedFactors.filter((x) => x !== payload.col);
  });

  setupDropZone(factorsZoneEl, (payload) => {
    if (payload.role === "target" && state.selectedTarget === payload.col) {
      state.selectedTarget = null;
    }
    if (state.selectedTarget === payload.col) return;
    if (!state.selectedFactors.includes(payload.col)) {
      state.selectedFactors.push(payload.col);
    }
  });

  setupDropZone(poolDropZoneEl, (payload) => {
    removeFromSelections(payload);
  });
}

function updateDatasetSummary() {
  if (!state.rawRows.length) {
    datasetSummaryEl.textContent = "No dataset loaded.";
    return;
  }
  const totalCols = getAllColumns().length;
  const numericCols = getAllColumns().filter((c) => isColumnNumeric(c)).length;
  datasetSummaryEl.innerHTML =
    `Rows: <b>${state.rawRows.length}</b> | ` +
    `Columns: <b>${totalCols}</b> | ` +
    `Numeric: <b>${numericCols}</b>`;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildTransformedFormula(formula, colNames) {
  let transformed = formula;
  const used = [];
  const sortedCols = [...colNames].sort((a, b) => b.length - a.length);

  sortedCols.forEach((col, idx) => {
    const token = `v_${idx}`;
    const safePattern = new RegExp(`\\b${escapeRegExp(col)}\\b`, "g");
    if (safePattern.test(transformed)) {
      transformed = transformed.replace(safePattern, token);
      used.push({ original: col, token });
    }
  });

  return { transformed, used };
}

function getValueByColumn(rowIndex, colName) {
  if (state.engineeredData[colName]) return state.engineeredData[colName][rowIndex];
  return state.rawRows[rowIndex][colName];
}

function addEngineeredFeature() {
  if (!state.rawRows.length) {
    showMessage("Please upload a dataset before creating features.", "error");
    return;
  }

  const formula = formulaInput.value.trim();
  if (!formula) {
    showMessage("Please enter a formula for the new feature.", "error");
    return;
  }

  const colNames = getAllColumns();
  const { transformed, used } = buildTransformedFormula(formula, colNames);

  if (used.length === 0) {
    showMessage("Formula must reference at least one existing variable.", "error");
    return;
  }

  const nonNumericUsed = used.filter((item) => !isColumnNumeric(item.original));
  if (nonNumericUsed.length > 0) {
    showMessage(
      `Formula uses non-numeric variable(s): ${nonNumericUsed.map((x) => x.original).join(", ")}`,
      "error"
    );
    return;
  }

  const featureName = featureNameInput.value.trim() ||
    `feature_${Object.keys(state.engineeredData).length + 1}`;

  if (getAllColumns().includes(featureName)) {
    showMessage(`Feature name "${featureName}" already exists.`, "error");
    return;
  }

  try {
    const values = [];
    for (let i = 0; i < state.rawRows.length; i += 1) {
      const scope = {};
      for (const item of used) {
        const num = toNumber(getValueByColumn(i, item.original));
        if (!Number.isFinite(num)) {
          throw new Error(
            `Missing or invalid value in row ${i + 1} for "${item.original}".`
          );
        }
        scope[item.token] = num;
      }
      const result = math.evaluate(transformed, scope);
      const numResult = toNumber(result);
      if (!Number.isFinite(numResult)) {
        throw new Error(`Formula returned non-numeric value at row ${i + 1}.`);
      }
      values.push(numResult);
    }
    state.engineeredData[featureName] = values;
    inferColumnMeta();
    renderVariablePool();
    updateDatasetSummary();
    showMessage(`Feature "${featureName}" added successfully.`, "success");
    featureNameInput.value = "";
  } catch (err) {
    showMessage(`Invalid formula: ${err.message}`, "error");
  }
}

function validateModelSelection() {
  if (!state.selectedTarget) return "No target selected.";
  if (state.selectedFactors.length === 0) return "No factors selected.";
  if (!isColumnNumeric(state.selectedTarget)) return "Target must be numeric.";

  const nonNumericFactors = state.selectedFactors.filter((f) => !isColumnNumeric(f));
  if (nonNumericFactors.length > 0) {
    return `Factors must be numeric. Invalid: ${nonNumericFactors.join(", ")}`;
  }
  return null;
}

function fitModel() {
  const validationError = validateModelSelection();
  if (validationError) {
    showMessage(validationError, "error");
    return;
  }

  const target = state.selectedTarget;
  const factors = [...state.selectedFactors];

  const X = [];
  const y = [];
  for (let i = 0; i < state.rawRows.length; i += 1) {
    const yVal = toNumber(getValueByColumn(i, target));
    const xVals = factors.map((f) => toNumber(getValueByColumn(i, f)));
    if (!Number.isFinite(yVal) || xVals.some((v) => !Number.isFinite(v))) continue;
    X.push([1, ...xVals]);
    y.push(yVal);
  }

  const minRows = factors.length + 2;
  if (X.length < minRows) {
    showMessage(
      `Not enough rows after removing missing values. Need at least ${minRows}, got ${X.length}.`,
      "error"
    );
    return;
  }

  try {
    const Xt = math.transpose(X);
    const XtX = math.multiply(Xt, X);
    const XtY = math.multiply(Xt, y);
    const betaMatrix = math.lusolve(XtX, XtY);
    const beta = betaMatrix.map((row) => row[0]);
    const yPred = math.multiply(X, beta);

    const mse =
      y.reduce((sum, val, idx) => sum + (val - yPred[idx]) ** 2, 0) / y.length;
    const yMean = y.reduce((a, b) => a + b, 0) / y.length;
    const sse = y.reduce((sum, val, idx) => sum + (val - yPred[idx]) ** 2, 0);
    const sst = y.reduce((sum, val) => sum + (val - yMean) ** 2, 0);
    const r2 = sst === 0 ? 1 : 1 - sse / sst;

    renderModelResult(target, factors, beta, mse, r2, X.length, y, yPred);
    showMessage("Model fitted successfully.", "success");
  } catch (err) {
    showMessage(
      "Model fitting failed. This may be a singular matrix or invalid setup.",
      "error"
    );
  }
}

function renderModelResult(target, factors, beta, mse, r2, rowsUsed, y, yPred) {
  const lines = [];
  lines.push(`${target} =`);
  lines.push(`${beta[0].toFixed(6)}`);
  factors.forEach((factor, idx) => {
    const coef = beta[idx + 1];
    const sign = coef >= 0 ? "+" : "-";
    lines.push(`${sign} ${Math.abs(coef).toFixed(6)} * ${factor}`);
  });
  equationBox.textContent = lines.join("\n");

  mseValue.textContent = mse.toFixed(6);
  r2Value.textContent = r2.toFixed(6);
  rowsUsedValue.textContent = String(rowsUsed);

  const residuals = y.map((actual, idx) => actual - yPred[idx]);
  Plotly.newPlot(
    "predictedActualPlot",
    [
      {
        x: y,
        y: yPred,
        mode: "markers",
        type: "scatter",
        marker: { color: "#2f6df3", size: 7, opacity: 0.75 },
        name: "Points"
      }
    ],
    {
      title: "Predicted vs Actual",
      xaxis: { title: "Actual" },
      yaxis: { title: "Predicted" },
      margin: { l: 50, r: 16, t: 42, b: 45 }
    },
    { responsive: true, displayModeBar: false }
  );

  Plotly.newPlot(
    "residualPlot",
    [
      {
        x: yPred,
        y: residuals,
        mode: "markers",
        type: "scatter",
        marker: { color: "#10b981", size: 7, opacity: 0.75 },
        name: "Residuals"
      }
    ],
    {
      title: "Residual Plot",
      xaxis: { title: "Predicted" },
      yaxis: { title: "Residual" },
      margin: { l: 50, r: 16, t: 42, b: 45 }
    },
    { responsive: true, displayModeBar: false }
  );

  Plotly.newPlot(
    "coefPlot",
    [
      {
        x: ["Intercept", ...factors],
        y: beta,
        type: "bar",
        marker: { color: "#6d8ce8" }
      }
    ],
    {
      title: "Coefficient Bar Chart",
      margin: { l: 50, r: 16, t: 42, b: 70 }
    },
    { responsive: true, displayModeBar: false }
  );
}

function loadExampleCsv() {
  fetch("company_esg_financial_dataset.csv")
    .then((res) => {
      if (!res.ok) throw new Error("Cannot load example CSV.");
      return res.text();
    })
    .then((text) => {
      parseCsvText(text);
      showMessage("Example CSV loaded successfully.", "success");
    })
    .catch((err) => {
      showMessage(
        `Failed to load example CSV. Use Upload CSV if opened via file:// (${err.message})`,
        "error"
      );
    });
}

uploadBtn.addEventListener("click", () => csvInput.click());
csvInput.addEventListener("change", (e) => parseCsvFile(e.target.files[0]));
addFeatureBtn.addEventListener("click", addEngineeredFeature);
confirmModelBtn.addEventListener("click", fitModel);
clearModelBtn.addEventListener("click", () => {
  clearSelections();
  resetModelOutput();
  showMessage("Model selection cleared.", "success");
});
loadExampleBtn.addEventListener("click", loadExampleCsv);

setupDragAndDrop();
renderVariablePool();
renderSelections();
updateDatasetSummary();
resetModelOutput();
