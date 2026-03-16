import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import ElasticNet, Lasso, LinearRegression, Ridge
from sklearn.metrics import r2_score
from sklearn.model_selection import GridSearchCV, KFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def main() -> None:
    df = pd.read_csv("esg_dataset.csv")
    df = df.dropna(subset=["RETURN_ON_ASSET"]).copy()

    # Keep only ESG/sustainability features and non-financial context.
    core_esg = ["ESG_score", "Social_score", "Gov_score", "Env_score"]
    esg_extra = [
        "Scope_1",
        "Scope_2",
        "CO2_emissions",
        "Energy_use",
        "Water_use",
        "Water_recycle",
        "Toxic_chem_red",
        "Injury_rate",
        "Women_Employees",
        "Human_Rights",
        "Strikes",
        "Turnover_empl",
        "Board_Size",
        "Shareholder_Rights",
        "Board_gen_div",
        "Bribery",
        "Recycling_Initiatives",
    ]
    categorical_base = ["Industry", "Date"]

    selected_num = [c for c in (core_esg + esg_extra) if c in df.columns]
    X = df[selected_num + categorical_base + ["Identifier (RIC)"]].copy()
    y = df["RETURN_ON_ASSET"].astype(float)

    # Feature engineering based on ESG dimensions.
    X["ESG_balance"] = (
        X["Env_score"] + X["Social_score"] + X["Gov_score"] - 3 * X["ESG_score"]
    )
    X["ESG_ES_interaction"] = X["Env_score"] * X["Social_score"]
    X["ESG_EG_interaction"] = X["Env_score"] * X["Gov_score"]
    X["ESG_SG_interaction"] = X["Social_score"] * X["Gov_score"]
    X["Env_over_ESG"] = X["Env_score"] / (X["ESG_score"] + 1e-6)
    X["Social_over_ESG"] = X["Social_score"] / (X["ESG_score"] + 1e-6)
    X["Gov_over_ESG"] = X["Gov_score"] / (X["ESG_score"] + 1e-6)

    models = {
        "LinearRegression": (LinearRegression(), {}),
        "Ridge": (Ridge(), {"model__alpha": [0.01, 0.1, 1, 10, 50, 100]}),
        "Lasso": (
            Lasso(max_iter=20000),
            {"model__alpha": [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]},
        ),
        "ElasticNet": (
            ElasticNet(max_iter=20000),
            {
                "model__alpha": [0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
                "model__l1_ratio": [0.1, 0.3, 0.5, 0.7, 0.9],
            },
        ),
    }

    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    all_setups = [
        ("ESG+Industry+Year", ["Industry", "Date"]),
        ("ESG+Industry+Year+FirmFE", ["Industry", "Date", "Identifier (RIC)"]),
    ]

    overall_best = {"setup": None, "model": None, "cv_r2": -10**9, "test_r2": -10**9}

    print("=== Model comparison (no financial leakage features) ===")
    for setup_name, categorical_features in all_setups:
        numeric_features = X.select_dtypes(include="number").columns.tolist()
        preprocessor = ColumnTransformer(
            transformers=[
                (
                    "num",
                    Pipeline(
                        steps=[
                            ("imputer", SimpleImputer(strategy="median")),
                            ("scaler", StandardScaler()),
                        ]
                    ),
                    numeric_features,
                ),
                (
                    "cat",
                    Pipeline(
                        steps=[
                            ("imputer", SimpleImputer(strategy="most_frequent")),
                            ("onehot", OneHotEncoder(handle_unknown="ignore")),
                        ]
                    ),
                    categorical_features,
                ),
            ]
        )

        for name, (model, param_grid) in models.items():
            pipe = Pipeline(steps=[("pre", preprocessor), ("model", model)])
            search = GridSearchCV(
                estimator=pipe,
                param_grid=param_grid,
                cv=cv,
                scoring="r2",
                n_jobs=-1,
            )
            search.fit(X_train, y_train)
            y_pred = search.best_estimator_.predict(X_test)
            test_r2 = r2_score(y_test, y_pred)
            cv_r2 = search.best_score_

            print(
                f"{setup_name:>24s} | {name:>14s} | CV R2={cv_r2:.4f} | "
                f"Test R2={test_r2:.4f} | best={search.best_params_}"
            )

            if cv_r2 > overall_best["cv_r2"]:
                overall_best = {
                    "setup": setup_name,
                    "model": name,
                    "cv_r2": cv_r2,
                    "test_r2": test_r2,
                }

    print(f"BEST_SETUP={overall_best['setup']}")
    print(f"BEST_MODEL={overall_best['model']}")
    print(f"BEST_CV_R2={overall_best['cv_r2']:.6f}")
    print(f"BEST_SETUP_TEST_R2={overall_best['test_r2']:.6f}")


if __name__ == "__main__":
    main()
