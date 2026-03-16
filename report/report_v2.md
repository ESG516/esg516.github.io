Build a reusable interactive ESG research report web app that reproduces the CURRENT front-end structure and behavior.

The output must be a standalone, deployable static front-end using:
- `index.html`
- `style.css`
- `script.js`

Use only client-side technology:
- HTML
- CSS
- JavaScript
- Plotly.js
- math.js (for model feature formulas)

The page must work when opened directly or hosted on GitHub Pages.

------------------------------------------------
PROJECT GOAL
------------------------------------------------

Recreate an ESG empirical analysis dashboard with:
- clean academic style
- modular sections
- collapsible report blocks
- uploadable CSV/JSON
- interactive EDA
- transformation comparison
- advanced interactive model builder

The implementation should be dataset-agnostic but include a small internal sample dataset fallback so page loads even without upload.

------------------------------------------------
GLOBAL LAYOUT AND NAVIGATION
------------------------------------------------

1) Sticky top header:
- report title placeholder
- author placeholder
- dataset placeholder
- reading progress bar that updates with scroll

2) Navigation links (anchor jump):
- Overview
- Data
- EDA
- Feature Engineering
- Model Analysis
- Results
- Conclusion
- Appendix

3) Main content:
- each major section is wrapped in `<details open>` + `<summary>`
- responsive card layout (`grid two` on desktop, one column on mobile)

------------------------------------------------
SECTION 1 — RESEARCH OVERVIEW
------------------------------------------------

Include:
- research question text
- bullet summary of dependent/independent/control variables
- conceptual framework chart

Conceptual framework chart:
- Use Plotly Sankey
- show mechanism logic: ESG + controls -> channels -> financial performance (ROA)
- clean palette, readable labels, white background

------------------------------------------------
SECTION 2 — DATA OVERVIEW
------------------------------------------------

Must include:
1. Dataset summary panel:
- observations count
- variable count
- variable type overview (numeric/categorical)
- panel hint (firm-year detected if identifier + date/year exist)

2. Upload control:
- accept `.csv` and `.json`
- uploaded data replaces internal sample data

3. Variable dictionary panel:
- list variable names with description if known
- unknown variables show generic description

4. Interactive data table:
- search
- sortable columns
- pagination with page size selector (5/10/20)

CSV parsing requirements:
- robust split logic for quoted commas
- empty strings become null
- numeric auto-casting
- support missing values

Numeric-column detection rule:
- do NOT require 100% non-missing numeric
- column is numeric when non-missing numeric ratio is high (e.g., >= 75%) and has enough numeric values

------------------------------------------------
SECTION 3 — EDA
------------------------------------------------

Include EDA variable multi-select control:
- user selects variables (recommended 3-6)
- Apply button triggers linked updates

EDA charts:
1) Distribution Viewer:
- single variable dropdown
- histogram updates dynamically

2) Scatter Plot Explorer:
- x/y dropdowns
- scatter updates dynamically
- pair values by complete x-y rows only

3) Parallel Coordinates Plot:
- linked to selected EDA variables
- show selected column names above plot as text
- ensure axis labels are clearly visible
- color lines by ESG_score if available, else first selected variable

4) Triangular correlation matrix (custom pair-plot matrix):
- user-selected variables only
- diagonal: distribution histogram
- lower triangle: single-cell correlation heatmap with value annotation
- upper triangle: pairwise scatter
- each cell is an embedded mini Plotly chart

------------------------------------------------
SECTION 4 — FEATURE ENGINEERING
------------------------------------------------

Build transformation comparison with side-by-side histograms:
- variable selector
- transformation selector:
  - none
  - log (ln(1+x), clamp negatives)
  - z-score
  - min-max

Visualization behavior:
- LEFT chart: original distribution histogram
- RIGHT chart: transformed distribution histogram
- both update whenever variable or transformation changes

------------------------------------------------
SECTION 5 — MODEL ANALYSIS (MAJOR INTERACTIVE BUILDER)
------------------------------------------------

This section is the core interactive module.

A) Interactive model builder controls:
- dependent variable selector (`dep-var`)
- candidate independent variable selector (`factor-var`)
- Add Factor button
- Clear Factors button
- Baseline preset button
- Extended preset button
- selected factors shown as removable chips

B) Add new engineered variable panel:
- input: variable name
- input: formula
- button: Create Variable

Formula rules:
- columns must be referenced using `{column_name}` placeholders
- support operations: + - * / ^ and math.js functions like log()
- evaluate row-wise
- if required inputs are missing/non-numeric for a row, set generated value to null
- after feature creation:
  - update dataset schema
  - new feature must become available in all numeric selectors
  - show status message (success/error)

C) Model estimation:
- ordinary least squares linear regression
- include intercept in estimation
- drop rows with missing dependent or any selected independent values
- validate:
  - dependent must be numeric
  - at least one independent variable
  - enough rows for estimation

D) Outputs in same section:
1. Equation panel (readable formula string)
2. Metrics cards:
- R²
- Adjusted R²
- RMSE
- Observations
3. Model summary table:
- variable
- coefficient
- standard error
- t-stat
4. Plots:
- Predicted vs Actual scatter
- Residual vs Predicted scatter
- Coefficient Effect bar chart (DO NOT show intercept in this chart; keep intercept in table)

------------------------------------------------
SECTION 6 — RESULTS
------------------------------------------------

Keep this section lightweight as interpretation note area:
- card for empirical findings notes
- text placeholder for significance, signs, and robustness comments

------------------------------------------------
SECTION 7 — CONCLUSION
------------------------------------------------

Provide structured placeholders:
- key findings
- interpretation
- implications
- limitations
- future work

------------------------------------------------
SECTION 8 — APPENDIX
------------------------------------------------

Provide placeholders for:
- full tables
- robustness checks
- extra charts

------------------------------------------------
VISUAL STYLE REQUIREMENTS
------------------------------------------------

Style should be:
- white background
- minimal palette
- modern font (Inter)
- subtle borders and rounded cards
- consistent spacing
- responsive layout

Include reusable styles for:
- cards
- two-column grids
- controls
- table
- chips
- metric cards
- equation box
- hints

------------------------------------------------
ENGINEERING REQUIREMENTS
------------------------------------------------

1) Keep code modular:
- one function per rendering concern
- one function per utility concern

2) Required state fields:
- data rows
- all columns
- numeric columns
- selected EDA variables
- selected model factors
- table pagination/sorting state

3) Re-render strategy:
- on upload -> re-infer columns -> refresh all selectors -> redraw all modules
- on feature creation -> update schema and rebind dependent controls safely

4) Robustness:
- handle missing values consistently
- avoid chart crashes when variable list is small
- show user-facing messages for model/feature errors

------------------------------------------------
DELIVERABLE
------------------------------------------------

Generate complete and runnable:
- `index.html`
- `style.css`
- `script.js`

The generated result must reproduce this exact product direction:
- modular ESG research report
- collapsible sections
- linked EDA variable controls
- side-by-side transformation histograms
- advanced interactive model builder with custom formula variables
- rich model diagnostics and outputs
