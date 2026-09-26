from sklearn.ensemble import RandomForestClassifier

X = [
    [90, 1, 10, 7],
    [80, 2, 7, 7],
    [70, 3, 5, 5],
    [60, 5, 3, 5],
    [40, 8, 1, 3],
    [30, 10, 0, 3],
    [95, 0, 15, 7],
    [85, 1, 8, 7],
    [50, 6, 2, 5],
    [20, 12, 0, 3]
]

y = [1, 1, 1, 1, 0, 0, 1, 1, 0, 0]

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X, y)


def predict_habit(
    completion_rate,
    missed_days,
    current_streak,
    frequency
):

    data = [[
        completion_rate,
        missed_days,
        current_streak,
        frequency
    ]]

    prediction = model.predict(data)[0]
    probability = model.predict_proba(data)[0]

    if prediction == 1:

        result = "Likely to Complete"

        recommendation = (
            "Keep following your current habit routine."
        )

    else:

        result = "Likely to Miss"

        recommendation = (
            "Try setting a smaller goal and a reminder."
        )

    confidence = round(
        max(probability) * 100,
        2
    )

    return {
        "prediction": result,
        "confidence": confidence,
        "recommendation": recommendation
    }
