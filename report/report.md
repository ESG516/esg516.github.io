Build a reusable interactive research report template.

The goal is to create a modular HTML research report that can be reused for different datasets and research topics.

The report should be interactive, visually clean, and suitable for data science or empirical research projects.

The final output should be a standalone HTML page that can also be deployed via GitHub Pages.

--------------------------------
GENERAL DESIGN PRINCIPLES
--------------------------------

The report should follow a modular architecture and contain clear research sections.

Design goals:

- interactive visualizations
- clean academic layout
- modular reusable components
- responsive design
- easy dataset replacement

Technology stack:

- HTML
- CSS
- JavaScript
- Plotly.js for visualization
- optional: lightweight Python backend or JSON data loading

--------------------------------
PAGE LAYOUT
--------------------------------

The page layout should contain the following sections.

1. Header Section
2. Research Overview
3. Data Overview
4. Exploratory Data Analysis
5. Feature Engineering
6. Model Analysis
7. Results
8. Conclusion
9. Appendix

Each section should be clearly separated and collapsible.

--------------------------------
HEADER SECTION
--------------------------------

Include:

- research title placeholder
- author placeholder
- dataset description placeholder
- navigation menu

Navigation should allow users to jump between sections.

Example elements:

- fixed navigation bar
- section anchors
- progress indicator

--------------------------------
RESEARCH OVERVIEW MODULE
--------------------------------

Purpose:

Explain the research objective and context.

Components:

- research question placeholder
- conceptual diagram placeholder
- bullet point summary

Visualization placeholder:

- conceptual framework diagram
- relationship diagram between variables

--------------------------------
DATA OVERVIEW MODULE
--------------------------------

This section summarizes the dataset.

Components:

1. Dataset summary card

Display:

- number of observations
- number of variables
- variable types

2. Interactive data table

Features:

- sortable columns
- search functionality
- pagination

3. Variable dictionary panel

List variables and descriptions.

--------------------------------
EXPLORATORY DATA ANALYSIS MODULE
--------------------------------

This section should include interactive visualizations.

Required visualization modules:

1. Distribution Viewer

Interactive histogram for selected variables.

User interaction:

- dropdown variable selector
- dynamic histogram update

2. Scatter Plot Explorer

User chooses:

- x variable
- y variable

Plot updates dynamically.

3. Correlation Matrix

Interactive heatmap.

Features:

- hover tooltips
- color legend
- zoom interaction

4. Pair Plot Viewer (optional)

Shows relationships between variables.

--------------------------------
FEATURE ENGINEERING MODULE
--------------------------------

This section demonstrates transformations applied to variables.

Components:

1. Variable transformation viewer

User can toggle transformations:

- log transform
- scaling
- normalization

Charts should update accordingly.

2. Feature comparison plot

Compare original vs transformed variables.

--------------------------------
MODEL ANALYSIS MODULE
--------------------------------

This section explains model structure.

Components:

1. Model specification panel

Display model equation template.

Example format:

Y = β0 + β1 X1 + β2 X2 + ... + ε

2. Variable selector

Allow user to choose:

- dependent variable
- independent variables

3. Model configuration panel

Options:

- linear regression
- regularized regression
- classification model

--------------------------------
RESULTS MODULE
--------------------------------

Display model output.

Components:

1. Model summary table

Include:

- coefficients
- standard errors
- p-values
- confidence intervals

2. Model performance metrics

Examples:

- R²
- RMSE
- accuracy
- F1 score

3. Prediction vs actual plot

Interactive scatter plot.

--------------------------------
CONCLUSION MODULE
--------------------------------

Provide placeholders for interpretation.

Components:

- key findings
- interpretation
- implications
- limitations
- future work

--------------------------------
APPENDIX MODULE
--------------------------------

Optional supporting materials.

Examples:

- full regression tables
- additional plots
- raw summary statistics

--------------------------------
INTERACTIVITY REQUIREMENTS
--------------------------------

The page must include interactive controls:

- dropdown menus
- sliders
- variable selectors
- toggle buttons

Plots must update dynamically when user changes inputs.

--------------------------------
VISUAL DESIGN REQUIREMENTS
--------------------------------

Use a clean academic style.

Style guidelines:

- white background
- minimal color palette
- modern typography
- consistent margins
- responsive layout

Plots should use consistent colors.

--------------------------------
CODE STRUCTURE
--------------------------------

Generate modular code files:

index.html
style.css
script.js

Visualization modules should be reusable functions.

--------------------------------
OUTPUT
--------------------------------

Generate a complete interactive research report template.

The template must:

- be reusable for different datasets
- support interactive exploration
- have modular visualization components
- be exportable as a standalone HTML page