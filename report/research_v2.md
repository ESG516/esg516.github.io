You are an ESG data researcher conducting an empirical study on the relationship between ESG performance and firm financial performance.

Research Topic:
Does ESG Performance Improve Firm Financial Performance?

Dataset:
esg_dataset.xlsx

The dataset is a firm-level panel dataset containing ESG indicators and financial variables.

Your task is to conduct a complete empirical analysis following the structured research workflow below.

------------------------------------------------
PART 1 — Data Preparation
------------------------------------------------

1.1 Data Loading

Load the dataset:
esg_dataset.xlsx

Inspect the dataset structure:
- number of observations
- number of variables
- variable types
- panel identifiers (firm, year if available)

1.2 Data Cleaning

Perform standard data cleaning procedures:

- Identify and handle missing values
- Remove duplicated records
- Detect invalid or extreme values (outliers)
- Ensure all variables have consistent units and formats
- Convert categorical variables if necessary
- Confirm numeric variables are properly formatted

Explain any assumptions or transformations made.

------------------------------------------------
PART 2 — Exploratory Data Analysis (EDA)
------------------------------------------------

2.1 Descriptive Statistics

Compute descriptive statistics for all key variables:

- mean
- median
- standard deviation
- minimum
- maximum
- quartiles

Focus particularly on:

Financial Performance
- ROA

ESG Indicators
- ESG_score
- ESG_Social
- ESG_Environment
- ESG_Governance

Control Variables
- Firm Size
- Leverage

Interpret what the statistics suggest about the dataset.

2.2 Correlation Analysis

Calculate the correlation matrix between:

- ESG indicators
- financial variables
- control variables

Objectives:

- Identify potential relationships between ESG and financial performance
- Detect potential multicollinearity

Suggested visualizations:

- Correlation heatmap
- Pairwise scatter plots with density distributions

Explain any interesting correlations.

2.3 Data Visualization

Create visualizations to better understand the structure of the data.

Suggested plots:

- Parallel coordinate plot for ESG indicators
- Scatter plots: ESG score vs ROA
- Distribution plots for major variables

Explain patterns or trends observed in the visualizations.

------------------------------------------------
PART 3 — Feature Engineering
------------------------------------------------

3.1 Variable Definition

Define the regression variables clearly.

Dependent Variable:

Financial Performance
ROA

Independent Variables (ESG performance):

- ESG_score
- ESG_Social
- ESG_Environment
- ESG_Governance

Control Variables:

- Firm Size
- Leverage

Explain the economic meaning of each variable.

3.2 Variable Transformation

Apply necessary transformations:

- Standardization (z-score normalization) for regression comparability
- Log transformation for skewed variables (e.g., Firm Size if necessary)
- Scaling if variables are on very different magnitudes

Explain why transformations are applied.

------------------------------------------------
PART 4 — Model Construction
------------------------------------------------

4.1 Regression Model Specification

Construct a baseline linear regression model:

ROA = β0 + β1 ESG_score + β2 FirmSize + β3 Leverage + ε

Extended Model:

ROA = β0 + β1 ESG_Environment
        + β2 ESG_Social
        + β3 ESG_Governance
        + β4 FirmSize
        + β5 Leverage
        + ε

If panel structure exists, also consider:

- Fixed effects model
- Random effects model

Explain the econometric reasoning.

4.2 Model Estimation

Estimate the regression models.

Report:

- coefficient estimates
- standard errors
- t statistics
- p values
- R²
- Adjusted R²

Interpret the economic meaning of coefficients.

Key question:

Does better ESG performance improve financial performance?

------------------------------------------------
PART 5 — Results and Interpretation
------------------------------------------------

5.1 Empirical Findings

Summarize the key empirical results.

Discuss:

- whether ESG performance significantly affects ROA
- which ESG dimensions are most influential

5.2 Economic Interpretation

Explain the potential mechanisms:

Examples:

- ESG reduces risk
- ESG improves reputation
- ESG attracts long-term investors
- ESG improves operational efficiency

5.3 Limitations

Discuss limitations such as:

- sample size
- measurement of ESG variables
- omitted variable bias
- potential endogeneity

5.4 Future Research

Suggest future research directions:

- dynamic panel models
- causal inference methods
- ESG impact on stock returns
- industry-specific ESG effects