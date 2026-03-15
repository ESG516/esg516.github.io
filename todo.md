You are a senior frontend engineer.

Your task is to build a complete static web application that runs entirely in the browser and can be deployed on GitHub Pages.

The application is an interactive regression playground for students to experiment with linear regression models on an ESG dataset.

IMPORTANT CONSTRAINTS

1. The project MUST be a static website.
2. It must run entirely in the browser.
3. No backend, no server, no Python, no database.
4. Must work on GitHub Pages without any build step.
5. Use plain HTML + CSS + JavaScript.
6. Allowed libraries must be CDN-based only.

Recommended libraries (via CDN):
- PapaParse (CSV parsing)
- Plotly.js (visualization)
- SortableJS or native HTML5 drag-and-drop
- math.js (formula parsing for feature engineering)

The final deliverable must include:

index.html
style.css
script.js

Everything must work by simply opening index.html.

--------------------------------------------------

PROJECT PURPOSE

Students will upload a dataset and interactively build linear regression models.

The interface should allow them to:

1. choose a target variable
2. choose factor variables
3. optionally create engineered features
4. run linear regression
5. see the model equation
6. see MSE and R²
7. see visualizations

The interface must be simple, clean, and visually modern.

--------------------------------------------------

DATASET

Students will upload a CSV file.

Example dataset:

company_esg_financial_dataset.csv

Example columns:

CompanyID
CompanyName
Industry
Region
Year
Revenue
ProfitMargin
MarketCap
GrowthRate
ESG_Overall
ESG_Environmental
ESG_Social
ESG_Governance
CarbonEmissions
WaterUsage
EnergyConsumption

Important rules:

1. Only numeric columns can be used in regression.
2. Non-numeric columns should still appear in the variable list but be visually marked as non-numeric.
3. If user attempts to use non-numeric variables in regression, show a warning.

--------------------------------------------------

UI LAYOUT

Use a three-column dashboard layout.

--------------------------------------------------

HEADER (top)

Title:

ESG Regression Playground

Short instruction text:

1. Upload CSV
2. Drag target variable
3. Drag factor variables
4. Optionally create engineered features
5. Click Confirm Model

Include:

Upload CSV button

--------------------------------------------------

LEFT PANEL

Variable Pool

This panel displays draggable variable cards.

Two sections:

Original Variables
Engineered Features

Each variable should be a draggable rectangular card.

Example card:

Revenue
ESG_Overall
CarbonEmissions

Non-numeric variables should have a different color or label.

--------------------------------------------------

CENTER PANEL

Model Builder

Three areas:

TARGET

Drop zone that accepts exactly one variable.

FACTORS

Drop zone that accepts multiple variables.

FEATURE ENGINEERING

A small panel containing:

Formula input box

Example formulas supported:

x / y
x * y
x + y
x - y
x^2
log(x)

Add Feature button.

When clicked:

1. Evaluate the formula
2. Create a new column in memory
3. Add it to Engineered Features list
4. Show as a draggable card

--------------------------------------------------

CONFIRM MODEL BUTTON

When clicked:

1. Collect selected target
2. Collect factor variables
3. Validate inputs

Validation rules:

- Target must exist
- At least one factor must exist
- Target must be numeric
- Factors must be numeric

If validation fails show friendly message.

--------------------------------------------------

MODEL FITTING

Fit a linear regression model using ordinary least squares.

Use matrix algebra in JavaScript.

Steps:

1. Construct matrix X with intercept column
2. Construct vector y
3. Solve:

β = (XᵀX)^(-1) Xᵀy

Compute:

Predicted values

Then compute:

MSE

MSE = mean((y - y_pred)^2)

R²

R² = 1 - SSE / SST

Before fitting:

Remove rows containing missing values in selected columns.

Also display:

Number of rows used.

--------------------------------------------------

RIGHT PANEL

Model Results

Display:

Model equation

Example:

ESG_Overall =
12.345
+ 0.004 * Revenue
- 0.002 * CarbonEmissions
+ 1.56 * GrowthRate

Metrics

MSE

R²

Rows used

--------------------------------------------------

VISUALIZATION

Use Plotly.js.

Include:

Predicted vs Actual scatter plot

Residual plot

Optional:

Coefficient bar chart

Charts must update after each model run.

--------------------------------------------------

DRAG AND DROP

Variable cards should be draggable.

Drop zones:

Target zone
Factors zone

Provide visual highlighting when dragging.

Allow removing variables by dragging back to pool.

--------------------------------------------------

FEATURE ENGINEERING

Users can type formulas using existing column names.

Example:

Revenue / CarbonEmissions
ProfitMargin * GrowthRate
Revenue^2

Implementation idea:

Use math.js to parse expression.

Evaluate row by row.

Create new column in dataset.

Add the new feature to engineered feature list.

--------------------------------------------------

ERROR HANDLING

Show friendly errors for:

No target selected
No factors selected
Non numeric variables used
Invalid formula
Singular matrix
Not enough rows

--------------------------------------------------

UI STYLE

Design requirements:

Clean
Minimal
Modern
Academic

Use:

rounded cards
soft shadows
clear drop zones
good spacing

Prefer neutral colors.

--------------------------------------------------

BONUS FEATURES (if easy)

Show dataset summary statistics.

Allow clearing the model.

Allow removing factors.

--------------------------------------------------

CODE STRUCTURE

index.html

Contains layout and containers.

style.css

Handles dashboard layout and styling.

script.js

Handles:

CSV loading
Drag and drop
Feature engineering
Regression computation
Charts

Use modular functions and clear comments.

--------------------------------------------------

FINAL GOAL

The final page should feel like a small browser-based regression lab where students can:

Upload a dataset

Drag variables

Build a regression model

Create engineered features

Instantly see the regression equation, MSE, R², and charts.

All computation must happen in the browser.