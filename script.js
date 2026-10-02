// ======================================================
// AI HABIT COACH - COMPLETE SCRIPT.JS
// ======================================================


// ======================================================
// 1. LOGIN SYSTEM
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
if (loginForm) {

    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const emailInput =
            document.getElementById("email");

        const passwordInput =
            document.getElementById("password");

        const email =
            emailInput
                ? emailInput.value.trim()
                : "";

        const password =
            passwordInput
                ? passwordInput.value.trim()
                : "";

        if (
            email === "" ||
            password === ""
        ) {
            alert(
                "Please enter email and password."
            );
            return;
        }

        try {

           const response =
    await fetch(
        "https://ai-habit-coach-xmfn.onrender.com/login",
        {
            method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                alert(
                    data.message ||
                    "Invalid email or password."
                );

                return;
            }

            localStorage.setItem(
                "userId",
                String(data.user_id)
            );

            localStorage.setItem(
                "userName",
                data.name || ""
            );

            localStorage.setItem(
                "savedEmail",
                email
            );

            localStorage.setItem(
                "loginEmail",
                email
            );

            localStorage.setItem(
                "loggedIn",
                "true"
            );

            alert(
                "Login successful!"
            );

            window.location.href =
                "dashboard.html";

        } catch (error) {

            console.error(
                "Login Error:",
                error
            );

            alert(
                "Unable to connect to backend."
            );
        }

    });
}

    // ==================================================
    // 2. REGISTER SYSTEM
    // ==================================================

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener("submit", function (e) {

            e.preventDefault();

            const nameInput = document.getElementById("name");
            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("password");

            const name = nameInput ? nameInput.value.trim() : "";
            const email = emailInput ? emailInput.value.trim() : "";
            const password = passwordInput ? passwordInput.value.trim() : "";

            if (name === "" || email === "" || password === "") {
                alert("Please fill all fields.");
                return;
            }

            localStorage.setItem("userName", name);
            localStorage.setItem("savedEmail", email);
            localStorage.setItem("loginEmail", email);

            alert("Account created successfully!");

            window.location.href = "index.html";
        });
    }


    // ==================================================
    // 3. LOGOUT
    // ==================================================

    window.logout = function () {

        localStorage.removeItem("loggedIn");
        localStorage.removeItem("loginEmail");

        window.location.href = "index.html";
    };


    // ==================================================
    // 4. LOAD HABITS
    // ==================================================

    let savedHabits = localStorage.getItem("habits");

    if (!savedHabits) {
        savedHabits = localStorage.getItem("activities");
    }

    let habits = [];

    try {

        habits = savedHabits
            ? JSON.parse(savedHabits)
            : [];

    } catch (error) {

        console.log("Error loading activities:", error);

        habits = [];
    }


    // ==================================================
    // 5. DEFAULT ACTIVITIES
    // ==================================================

    if (!Array.isArray(habits)) {
        habits = [];
    }


    habits = habits.map(function (habit) {

        return {

            id:
                habit.id ||
                Date.now() +
                Math.random(),

            name:
                habit.name ||
                habit.title ||
                "Activity",

            goal:
                habit.goal ||
                "",

            category:
                habit.category ||
                "Other",

            reminder:
                habit.reminder ||
                "",

            completed:
                habit.completed === true ||
                habit.completed === "true" ||
                habit.completed === 1 ||
                habit.completed === "1",

            completedAt:
                habit.completedAt ||
                ""

        };

    });


    // Default activities only first time
    if (
        habits.length === 0 &&
        !localStorage.getItem("defaultActivitiesAdded")
    ) {

        habits = [

            {
                id: 1,
                name: "Exercise",
                goal: "30 minutes",
                category: "Fitness",
                reminder: "",
                completed: false,
                completedAt: ""
            },

            {
                id: 2,
                name: "Reading",
                goal: "20 minutes",
                category: "Study",
                reminder: "",
                completed: false,
                completedAt: ""
            },

            {
                id: 3,
                name: "Drink Water",
                goal: "2 Litres",
                category: "Health",
                reminder: "",
                completed: false,
                completedAt: ""
            }

        ];

        localStorage.setItem(
            "defaultActivitiesAdded",
            "true"
        );

        saveHabits();
    }


    // ==================================================
    // 6. SAVE HABITS
    // ==================================================

    function saveHabits() {

        localStorage.setItem(
            "habits",
            JSON.stringify(habits)
        );

        localStorage.setItem(
            "activities",
            JSON.stringify(habits)
        );
    }


    // ==================================================
    // 7. DISPLAY ACTIVITIES
    // ==================================================

    function displayHabits() {

        const habitsList =
            document.getElementById(
                "habitsList"
            );

        if (!habitsList) {
            return;
        }


        habitsList.innerHTML = "";


        if (habits.length === 0) {

            habitsList.innerHTML = `
                <div class="empty-message">
                    <p>No activities added yet.</p>
                </div>
            `;

            return;
        }


        habits.forEach(function (habit) {

            const card =
                document.createElement("div");


            card.className =
                "activity-card";


            const statusText =
                habit.completed
                    ? "Completed"
                    : "Pending";


            const statusClass =
                habit.completed
                    ? "completed"
                    : "pending";


            card.innerHTML = `

                <div class="activity-info">

                    <h3>
                        ${escapeHTML(habit.name)}
                    </h3>

                    <p>
                        <strong>Goal:</strong>
                        ${escapeHTML(
                            habit.goal ||
                            "Not set"
                        )}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${escapeHTML(
                            habit.category ||
                            "Other"
                        )}
                    </p>

                    ${
                        habit.reminder
                            ? `
                            <p>
                                <strong>Reminder:</strong>
                                ${escapeHTML(
                                    habit.reminder
                                )}
                            </p>
                            `
                            : ""
                    }

                    <span class="status-badge ${statusClass}">
                        ${statusText}
                    </span>

                </div>


                <div class="activity-actions">

                    ${
                        habit.completed

                            ? `

                            <button
                                class="complete-btn"
                                onclick="toggleHabit(${habit.id})">

                                ↩ Mark Pending

                            </button>

                            `

                            : `

                            <button
                                class="complete-btn"
                                onclick="toggleHabit(${habit.id})">

                                ✓ Complete

                            </button>

                            `
                    }


                    <button
                        class="edit-btn"
                        onclick="editHabit(${habit.id})">

                        ✏ Edit

                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteHabit(${habit.id})">

                        🗑 Delete

                    </button>

                </div>


                ${
                    parseDuration(habit.goal) > 0

                        ? `

                        <div class="timer-section">

                            <div
                                class="timer-display"
                                id="timer-${habit.id}">

                                00:00

                            </div>

                            <button
                                class="timer-btn"
                                onclick="startTimer(${habit.id})">

                                ▶ Start Timer

                            </button>

                        </div>

                        `

                        : ""
                }

            `;


            habitsList.appendChild(card);

        });
    }


    // ==================================================
    // 8. ADD / EDIT ACTIVITY
    // ==================================================

    const habitForm =
        document.getElementById(
            "habitForm"
        );


    if (habitForm) {

        habitForm.addEventListener(
            "submit",
            function (e) {

                e.preventDefault();


                const nameInput =
                    document.getElementById(
                        "habitName"
                    );


                const goalSelect =
                    document.getElementById(
                        "habitGoalSelect"
                    );


                const goalInput =
                    document.getElementById(
                        "habitGoal"
                    );


                const categorySelect =
                    document.getElementById(
                        "habitCategory"
                    );


                const otherCategoryInput =
                    document.getElementById(
                        "otherCategory"
                    );


                const reminderInput =
                    document.getElementById(
                        "reminderTime"
                    );


                const name =
                    nameInput
                        ? nameInput.value.trim()
                        : "";


                let goal = "";


                if (
                    goalSelect &&
                    goalSelect.value === "other"
                ) {

                    goal =
                        goalInput
                            ? goalInput.value.trim()
                            : "";

                } else {

                    goal =
                        goalSelect
                            ? goalSelect.value
                            : "";
                }


                let category = "";


                if (
                    categorySelect &&
                    categorySelect.value === "Other"
                ) {

                    category =
                        otherCategoryInput
                            ? otherCategoryInput.value.trim()
                            : "";

                } else {

                    category =
                        categorySelect
                            ? categorySelect.value
                            : "";
                }


                const reminder =
                    reminderInput
                        ? reminderInput.value
                        : "";


                if (name === "") {

                    alert(
                        "Please enter activity name."
                    );

                    return;
                }


                // ------------------------------------------
                // EDIT
                // ------------------------------------------

                const editId =
                    habitForm.dataset.editId;


                if (editId) {

                    const index =
                        habits.findIndex(
                            habit =>
                                String(habit.id) ===
                                String(editId)
                        );


                    if (index !== -1) {

                        habits[index].name =
                            name;

                        habits[index].goal =
                            goal;

                        habits[index].category =
                            category ||
                            "Other";

                        habits[index].reminder =
                            reminder;
                    }


                    delete habitForm.dataset.editId;


                    const submitButton =
                        document.getElementById(
                            "habitSubmitBtn"
                        );


                    if (submitButton) {

                        submitButton.textContent =
                            "Add Activity";
                    }


                    const cancelButton =
                        document.getElementById(
                            "cancelEditBtn"
                        );


                    if (cancelButton) {

                        cancelButton.style.display =
                            "none";
                    }

                }


                // ------------------------------------------
                // ADD NEW
                // ------------------------------------------

                else {

                    const newHabit = {

                        id:
                            Date.now() +
                            Math.floor(
                                Math.random() *
                                1000
                            ),

                        name:
                            name,

                        goal:
                            goal,

                        category:
                            category ||
                            "Other",

                        reminder:
                            reminder,

                        completed:
                            false,

                        completedAt:
                            ""

                    };


                    habits.push(
                        newHabit
                    );
                }


                saveHabits();


                displayHabits();

                updateAISuggestion();

                displayDashboardHabits();

                displayDashboardStats();

                displayProgress();


                habitForm.reset();


                if (otherCategoryInput) {

                    otherCategoryInput.style.display =
                        "none";
                }


                if (goalInput) {

                    goalInput.style.display =
                        "none";
                }

            }
        );

    }


    // ==================================================
    // 9. COMPLETE / PENDING
    // ==================================================

    window.toggleHabit =
        function (id) {

            const habit =
                habits.find(
                    habit =>
                        String(habit.id) ===
                        String(id)
                );


            if (!habit) {
                return;
            }


            if (!habit.completed) {

                habit.completed =
                    true;


                const today =
                    new Date()
                        .toISOString()
                        .split("T")[0];


                habit.completedAt =
                    today;


                alert(
                    `"${habit.name}" completed successfully! 🎉`
                );

            } else {

                habit.completed =
                    false;

                habit.completedAt =
                    "";

            }


            saveHabits();


            displayHabits();

            updateAISuggestion();

            displayDashboardHabits();

            displayDashboardStats();

            displayProgress();

        };


    // ==================================================
    // 10. DELETE ACTIVITY
    // ==================================================

    window.deleteHabit =
        function (id) {

            const habit =
                habits.find(
                    habit =>
                        String(habit.id) ===
                        String(id)
                );


            if (!habit) {
                return;
            }


            const confirmDelete =
                confirm(
                    `Delete "${habit.name}"?`
                );


            if (!confirmDelete) {
                return;
            }


            habits =
                habits.filter(
                    habit =>
                        String(habit.id) !==
                        String(id)
                );


            saveHabits();


            displayHabits();

            updateAISuggestion();

            displayDashboardHabits();

            displayDashboardStats();

            displayProgress();

        };


    // ==================================================
    // 11. EDIT ACTIVITY
    // ==================================================

    window.editHabit =
        function (id) {

            const habit =
                habits.find(
                    habit =>
                        String(habit.id) ===
                        String(id)
                );


            if (!habit) {
                return;
            }


            const nameInput =
                document.getElementById(
                    "habitName"
                );


            const goalSelect =
                document.getElementById(
                    "habitGoalSelect"
                );


            const goalInput =
                document.getElementById(
                    "habitGoal"
                );


            const categorySelect =
                document.getElementById(
                    "habitCategory"
                );


            const otherCategoryInput =
                document.getElementById(
                    "otherCategory"
                );


            const reminderInput =
                document.getElementById(
                    "reminderTime"
                );


            if (nameInput) {

                nameInput.value =
                    habit.name;
            }


            if (goalSelect) {

                let optionExists =
                    false;


                for (
                    let i = 0;
                    i < goalSelect.options.length;
                    i++
                ) {

                    if (
                        goalSelect.options[i].value ===
                        habit.goal
                    ) {

                        optionExists =
                            true;

                        break;
                    }
                }


                if (optionExists) {

                    goalSelect.value =
                        habit.goal;

                } else {

                    goalSelect.value =
                        "other";


                    if (goalInput) {

                        goalInput.style.display =
                            "block";

                        goalInput.value =
                            habit.goal;
                    }
                }
            }


            if (categorySelect) {

                let optionExists =
                    false;


                for (
                    let i = 0;
                    i < categorySelect.options.length;
                    i++
                ) {

                    if (
                        categorySelect.options[i].value ===
                        habit.category
                    ) {

                        optionExists =
                            true;

                        break;
                    }
                }


                if (optionExists) {

                    categorySelect.value =
                        habit.category;

                } else {

                    categorySelect.value =
                        "Other";


                    if (otherCategoryInput) {

                        otherCategoryInput.style.display =
                            "block";

                        otherCategoryInput.value =
                            habit.category;
                    }
                }
            }


            if (reminderInput) {

                reminderInput.value =
                    habit.reminder ||
                    "";
            }


            if (habitForm) {

                habitForm.dataset.editId =
                    habit.id;
            }


            const submitButton =
                document.getElementById(
                    "habitSubmitBtn"
                );


            if (submitButton) {

                submitButton.textContent =
                    "Update Activity";
            }


            const cancelButton =
                document.getElementById(
                    "cancelEditBtn"
                );


            if (cancelButton) {

                cancelButton.style.display =
                    "inline-block";
            }


            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        };


    // ==================================================
    // 12. CANCEL EDIT
    // ==================================================

    const cancelEditButton =
        document.getElementById(
            "cancelEditBtn"
        );


    if (cancelEditButton) {

        cancelEditButton.addEventListener(
            "click",
            function () {

                if (habitForm) {

                    delete habitForm.dataset.editId;

                    habitForm.reset();
                }


                const submitButton =
                    document.getElementById(
                        "habitSubmitBtn"
                    );


                if (submitButton) {

                    submitButton.textContent =
                        "Add Activity";
                }


                cancelEditButton.style.display =
                    "none";


                const goalInput =
                    document.getElementById(
                        "habitGoal"
                    );


                const otherCategoryInput =
                    document.getElementById(
                        "otherCategory"
                    );


                if (goalInput) {

                    goalInput.style.display =
                        "none";
                }


                if (otherCategoryInput) {

                    otherCategoryInput.style.display =
                        "none";
                }

            }
        );

    }


    // ==================================================
    // 13. OTHER CATEGORY
    // ==================================================

    const categorySelect =
        document.getElementById(
            "habitCategory"
        );


    if (categorySelect) {

        categorySelect.addEventListener(
            "change",
            function () {

                const otherCategory =
                    document.getElementById(
                        "otherCategory"
                    );


                if (!otherCategory) {
                    return;
                }


                if (
                    categorySelect.value ===
                    "Other"
                ) {

                    otherCategory.style.display =
                        "block";

                } else {

                    otherCategory.style.display =
                        "none";

                    otherCategory.value =
                        "";
                }

            }
        );

    }


    // ==================================================
    // 14. OTHER GOAL
    // ==================================================

    const goalSelect =
        document.getElementById(
            "habitGoalSelect"
        );


    if (goalSelect) {

        goalSelect.addEventListener(
            "change",
            function () {

                const goalInput =
                    document.getElementById(
                        "habitGoal"
                    );


                if (!goalInput) {
                    return;
                }


                if (
                    goalSelect.value ===
                    "other"
                ) {

                    goalInput.style.display =
                        "block";

                } else {

                    goalInput.style.display =
                        "none";

                    goalInput.value =
                        "";
                }

            }
        );

    }


    // ==================================================
    // 15. AI SUGGESTION
    // ==================================================

    function updateAISuggestion() {

        const suggestion =
            document.getElementById(
                "aiSuggestion"
            );


        if (!suggestion) {
            return;
        }


        const pendingHabits =
            habits.filter(
                habit =>
                    !habit.completed
            );


        if (habits.length === 0) {

            suggestion.textContent =
                "Add an activity to receive an AI suggestion.";

            return;
        }


        if (pendingHabits.length === 0) {

            suggestion.textContent =
                "Excellent! 🎉 You completed all your activities today. Keep going!";

            return;
        }


        const firstPending =
            pendingHabits[0];


        suggestion.textContent =
            `Try to complete "${firstPending.name}" today. Small consistent steps lead to big results! 💪`;

    }


    // ==================================================
    // 16. DASHBOARD ACTIVITIES
    // ==================================================

    function displayDashboardHabits() {

        const dashboardList =
            document.getElementById(
                "dashboardHabitList"
            );


        if (!dashboardList) {
            return;
        }


        dashboardList.innerHTML =
            "";


        if (habits.length === 0) {

            dashboardList.innerHTML =
                `<p>No activities available.</p>`;

            return;
        }


        habits.forEach(
            function (habit) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "dashboard-habit-item";


                item.innerHTML = `

                    <div>

                        <strong>
                            ${escapeHTML(
                                habit.name
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                habit.goal ||
                                "No goal"
                            )}
                        </small>

                    </div>


                    <span class="${
                        habit.completed
                            ? "completed"
                            : "pending"
                    }">

                        ${
                            habit.completed
                                ? "✓ Completed"
                                : "Pending"
                        }

                    </span>

                `;


                dashboardList.appendChild(
                    item
                );

            }
        );

    }


    // ==================================================
    // 17. DASHBOARD STATS
    // ==================================================

    function displayDashboardStats() {

        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        const completedToday =
            habits.filter(
                function (habit) {

                    return (
                        habit.completed === true &&
                        habit.completedAt === today
                    );

                }
            ).length;


        const totalActivities =
            habits.length;


        const successRate =
            totalActivities > 0

                ? Math.round(
                    (
                        completedToday /
                        totalActivities
                    ) * 100
                )

                : 0;


        const currentStreak =
            completedToday > 0
                ? 1
                : 0;


        const completedCount =
            document.getElementById(
                "completedCount"
            );


        if (completedCount) {

            completedCount.textContent =
                completedToday;
        }


        const successRateElement =
            document.getElementById(
                "successRate"
            );


        if (successRateElement) {

            successRateElement.textContent =
                successRate + "%";
        }


        const streakCount =
            document.getElementById(
                "streakCount"
            );


        if (streakCount) {

            streakCount.textContent =
                currentStreak +
                " Days";
        }


        // Old IDs compatibility

        const completedIds = [

            "completedToday",

            "dashboardCompleted",

            "completedActivities"

        ];


        completedIds.forEach(
            function (id) {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.textContent =
                        completedToday;
                }

            }
        );


        const activityIds = [

            "activityToday",

            "todayActivity",

            "dashboardActivityToday"

        ];


        activityIds.forEach(
            function (id) {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.textContent =
                        completedToday;
                }

            }
        );

    }


    // ==================================================
    // 18. PROGRESS PAGE
    // ==================================================

    function displayProgress() {

        const total =
            habits.length;


        const completed =
            habits.filter(
                function (habit) {

                    return habit.completed === true;

                }
            ).length;


        const pending =
            total -
            completed;


        const progressPercent =
            total > 0

                ? Math.round(
                    (
                        completed /
                        total
                    ) * 100
                )

                : 0;


        const progressTotal =
            document.getElementById(
                "progressTotal"
            );


        if (progressTotal) {

            progressTotal.textContent =
                total;
        }


        const progressCompleted =
            document.getElementById(
                "progressCompleted"
            );


        if (progressCompleted) {

            progressCompleted.textContent =
                completed;
        }


        const progressRate =
            document.getElementById(
                "progressRate"
            );


        if (progressRate) {

            progressRate.textContent =
                progressPercent +
                "%";
        }


        const overallPercentage =
            document.getElementById(
                "overallPercentage"
            );


        if (overallPercentage) {

            overallPercentage.textContent =
                progressPercent +
                "%";
        }


        const overallProgressBar =
            document.getElementById(
                "overallProgressBar"
            );


        if (overallProgressBar) {

            overallProgressBar.style.width =
                progressPercent +
                "%";
        }


        const completedActivitiesList =
            document.getElementById(
                "completedActivitiesList"
            );


        if (completedActivitiesList) {

            if (completed === 0) {

                completedActivitiesList.innerHTML = `
                    <p>
                        No activities completed yet.
                    </p>
                `;

            } else {

                completedActivitiesList.innerHTML =
                    "";


                habits
                    .filter(
                        function (habit) {

                            return (
                                habit.completed ===
                                true
                            );

                        }
                    )
                    .forEach(
                        function (habit) {

                            const activityItem =
                                document.createElement(
                                    "div"
                                );


                            activityItem.className =
                                "completed-activity-item";


                            activityItem.innerHTML = `

                                <div>

                                    <strong>
                                        ${escapeHTML(
                                            habit.name
                                        )}
                                    </strong>

                                    <p>
                                        ${escapeHTML(
                                            habit.category ||
                                            "Other"
                                        )}
                                    </p>

                                </div>


                                <span>
                                    ✅ Completed
                                </span>

                            `;


                            completedActivitiesList
                                .appendChild(
                                    activityItem
                                );

                        }
                    );

            }

        }


        // Old IDs

        const totalElement =
            document.getElementById(
                "totalActivities"
            );


        if (totalElement) {

            totalElement.textContent =
                total;
        }


        const completedElement =
            document.getElementById(
                "completedActivities"
            );


        if (completedElement) {

            completedElement.textContent =
                completed;
        }


        const pendingElement =
            document.getElementById(
                "pendingActivities"
            );


        if (pendingElement) {

            pendingElement.textContent =
                pending;
        }


        const progressElement =
            document.getElementById(
                "progressPercent"
            );


        if (progressElement) {

            progressElement.textContent =
                progressPercent +
                "%";
        }

    }


    // ==================================================
    // 19. TIMER
    // ==================================================

    const activeTimers = {};


    window.startTimer =
        function (id) {

            const habit =
                habits.find(
                    habit =>
                        String(habit.id) ===
                        String(id)
                );


            if (!habit) {
                return;
            }


            const minutes =
                parseDuration(
                    habit.goal
                );


            if (minutes <= 0) {

                alert(
                    "Please select a valid time duration."
                );

                return;
            }


            if (activeTimers[id]) {

                clearInterval(
                    activeTimers[id]
                );
            }


            let seconds =
                minutes * 60;


            const timerDisplay =
                document.getElementById(
                    `timer-${id}`
                );


            if (!timerDisplay) {
                return;
            }


            timerDisplay.textContent =
                formatTime(seconds);


            activeTimers[id] =
                setInterval(
                    function () {

                        seconds--;


                        timerDisplay.textContent =
                            formatTime(
                                Math.max(
                                    seconds,
                                    0
                                )
                            );


                        if (seconds <= 0) {

                            clearInterval(
                                activeTimers[id]
                            );


                            delete activeTimers[id];


                            timerDisplay.textContent =
                                "00:00";


                            playAlarm();


                            alert(
                                `⏰ Time completed for "${habit.name}"!`
                            );

                        }

                    },
                    1000
                );

        };


    // ==================================================
    // 20. PARSE DURATION
    // ==================================================

    function parseDuration(goal) {

        if (!goal) {
            return 0;
        }


        const text =
            String(goal)
                .toLowerCase();


        const minuteMatch =
            text.match(
                /(\d+)\s*(minute|min|minutes)/
            );


        if (minuteMatch) {

            return parseInt(
                minuteMatch[1]
            );

        }


        const hourMatch =
            text.match(
                /(\d+)\s*(hour|hours|hr)/
            );


        if (hourMatch) {

            return (
                parseInt(
                    hourMatch[1]
                ) * 60
            );

        }


        return 0;

    }


    // ==================================================
    // 21. FORMAT TIMER
    // ==================================================

    function formatTime(seconds) {

        const minutes =
            Math.floor(
                seconds / 60
            );


        const remainingSeconds =
            seconds % 60;


        return (
            String(minutes)
                .padStart(2, "0")
            +
            ":"
            +
            String(
                remainingSeconds
            ).padStart(2, "0")
        );

    }


    // ==================================================
    // 22. ALARM SOUND
    // ==================================================

    function playAlarm() {

        try {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;


            if (!AudioContext) {
                return;
            }


            const audioContext =
                new AudioContext();


            const oscillator =
                audioContext.createOscillator();


            const gainNode =
                audioContext.createGain();


            oscillator.connect(
                gainNode
            );


            gainNode.connect(
                audioContext.destination
            );


            oscillator.frequency.value =
                800;


            oscillator.type =
                "sine";


            gainNode.gain.value =
                0.5;


            oscillator.start();


            setTimeout(
                function () {

                    oscillator.stop();

                },
                1000
            );

        }

        catch (error) {

            console.log(
                "Alarm sound not available."
            );

        }

    }


    // ==================================================
    // 23. PROFILE NAME
    // ==================================================

    function updateProfileName() {

        const profileName =
            document.getElementById(
                "profileName"
            );


        if (!profileName) {
            return;
        }


        const savedName =
            localStorage.getItem(
                "userName"
            );


        const savedEmail =
            localStorage.getItem(
                "savedEmail"
            );


        if (savedName) {

            profileName.textContent =
                savedName;

        } else if (savedEmail) {

            profileName.textContent =
                savedEmail.split("@")[0];

        }

    }


    // ==================================================
    // 24. HTML SECURITY
    // ==================================================

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    // ==================================================
    // 25. INITIAL LOAD
    // ==================================================

    displayHabits();

    updateAISuggestion();

    updateProfileName();

    displayDashboardHabits();

    displayDashboardStats();

    displayProgress();


    // ==================================================
    // 26. AUTO REFRESH
    // ==================================================

    setInterval(
        function () {

            displayDashboardHabits();

            displayDashboardStats();

            displayProgress();

        },
        1000
    );

});


// ======================================================
// 27. AI COACH - LOAD ACTIVITIES
// ======================================================

function getCurrentHabitsForAI() {

    let saved =
        localStorage.getItem(
            "habits"
        );


    if (!saved) {

        saved =
            localStorage.getItem(
                "activities"
            );
    }


    if (!saved) {
        return [];
    }


    try {

        const data =
            JSON.parse(saved);


        if (!Array.isArray(data)) {
            return [];
        }


        return data;

    }

    catch (error) {

        console.log(
            "Could not load activities:",
            error
        );

        return [];
    }

}


// ======================================================
// 28. AI ANSWER
// ======================================================

function getAIAnswer(question) {

    const q =
        question
            .toLowerCase()
            .trim();


    const currentHabits =
        getCurrentHabitsForAI();


    const totalActivities =
        currentHabits.length;


    const completedActivities =
        currentHabits.filter(
            function (habit) {

                return (
                    habit.completed === true ||
                    habit.completed === "true" ||
                    habit.completed === 1 ||
                    habit.completed === "1"
                );

            }
        ).length;


    const pendingActivities =
        currentHabits.filter(
            function (habit) {

                return !(
                    habit.completed === true ||
                    habit.completed === "true" ||
                    habit.completed === 1 ||
                    habit.completed === "1"
                );

            }
        );


    // ----------------------------------------------
    // HELLO
    // ----------------------------------------------

    if (
        q === "hi" ||
        q === "hello" ||
        q === "hey" ||
        q.includes("good morning") ||
        q.includes("good evening")
    ) {

        return `
            👋 <b>Hello!</b><br><br>

            I'm your AI Habit Coach 🤖<br><br>

            You can ask me about your
            progress, motivation, exercise,
            water, consistency, routines
            or missed activities. 🌱
        `;

    }


    // ----------------------------------------------
    // PROGRESS
    // ----------------------------------------------

    if (
        q.includes("progress") ||
        q.includes("performance") ||
        q.includes("how am i doing") ||
        q.includes("my activity") ||
        q.includes("completed")
    ) {

        if (totalActivities === 0) {

            return `
                📊 <b>No activities found.</b><br><br>

                Go to <b>My Activities</b>
                and add your first activity. 🌱
            `;

        }


        const rate =
            Math.round(
                (
                    completedActivities /
                    totalActivities
                ) * 100
            );


        return `
            📊 <b>Your Activity Progress</b><br><br>

            📋 Total Activities:
            <b>${totalActivities}</b><br>

            ✅ Completed:
            <b>${completedActivities}</b><br>

            ⏳ Pending:
            <b>${pendingActivities.length}</b><br>

            🎯 Completion Rate:
            <b>${rate}%</b><br><br>

            ${
                rate === 100

                    ? "🎉 Great! All your activities are completed."

                    : rate >= 50

                        ? "👍 Good progress! Keep going."

                        : "🌱 Start with one small activity and keep going."
            }
        `;

    }


    // ----------------------------------------------
    // BUILD HABIT
    // ----------------------------------------------

    if (
        q.includes("build") ||
        q.includes("new habit") ||
        q.includes("start habit") ||
        q.includes("create habit") ||
        q.includes("make a habit")
    ) {

        return `
            🌱 <b>How to build a new habit</b><br><br>

            1️⃣ Start with a small activity.<br>
            2️⃣ Choose a fixed time every day.<br>
            3️⃣ Set a realistic goal.<br>
            4️⃣ Use reminders.<br>
            5️⃣ Track your progress.<br>
            6️⃣ Stay consistent.<br><br>

            💡 Small daily actions can become
            strong habits.
        `;

    }


    // ----------------------------------------------
    // MOTIVATION
    // ----------------------------------------------

    if (
        q.includes("motivat") ||
        q.includes("lazy") ||
        q.includes("inspire") ||
        q.includes("encourage")
    ) {

        return `
            💪 <b>Motivation for you</b><br><br>

            You don't have to be perfect.
            Just take one small step today. 🌱<br><br>

            Complete one activity and build momentum.
            You can do it! ❤️
        `;

    }


    // ----------------------------------------------
    // CONSISTENCY
    // ----------------------------------------------

    if (
        q.includes("consisten") ||
        q.includes("regular") ||
        q.includes("daily")
    ) {

        return `
            📈 <b>How to improve consistency</b><br><br>

            • Set a fixed time for your activity.<br>
            • Keep your goal realistic.<br>
            • Use reminders.<br>
            • Track your completed activities.<br>
            • If you miss one day, start again the next day.<br><br>

            🔥 Consistency grows one day at a time.
        `;

    }


    // ----------------------------------------------
    // MISSED ACTIVITY
    // ----------------------------------------------

    if (
        q.includes("missed") ||
        q.includes("miss") ||
        q.includes("forgot") ||
        q.includes("not completed") ||
        q.includes("didn't complete") ||
        q.includes("did not complete")
    ) {

        if (
            pendingActivities.length > 0
        ) {

            const nextActivity =
                pendingActivities[0];


            return `
                🔔 <b>You have a pending activity.</b><br><br>

                Try completing:
                <b>${aiEscapeHTML(
                    nextActivity.name ||
                    "your activity"
                )}</b><br><br>

                Don't worry about missing it.
                Start again now. 💪
            `;

        }


        return `
            🎉 You don't have any pending activities.
            Great job!
        `;

    }


    // ----------------------------------------------
    // WATER
    // ----------------------------------------------

    if (
        q.includes("water") ||
        q.includes("hydration") ||
        q.includes("drink")
    ) {

        return `
            💧 <b>Water reminder</b><br><br>

            Try to drink water regularly
            throughout the day instead of
            waiting until you feel very thirsty.<br><br>

            You can also add a
            <b>Drink Water</b> activity
            with a reminder.
        `;

    }


    // ----------------------------------------------
    // EXERCISE
    // ----------------------------------------------

    if (
        q.includes("exercise") ||
        q.includes("workout") ||
        q.includes("fitness")
    ) {

        return `
            🏃 <b>Exercise suggestion</b><br><br>

            You can start with 20–30 minutes
            of walking, stretching or a
            simple workout.<br><br>

            Choose an activity that is
            comfortable and realistic for you. 💪
        `;

    }


    // ----------------------------------------------
    // MORNING
    // ----------------------------------------------

    if (
        q.includes("morning") ||
        q.includes("morning routine")
    ) {

        return `
            🌅 <b>Simple Morning Routine</b><br><br>

            1️⃣ Wake up at a consistent time.<br>
            2️⃣ Drink water.<br>
            3️⃣ Do some stretching or exercise.<br>
            4️⃣ Plan your important activities.<br>
            5️⃣ Start with one small goal.
        `;

    }


    // ----------------------------------------------
    // EVENING / NIGHT
    // ----------------------------------------------

    if (
        q.includes("evening") ||
        q.includes("night") ||
        q.includes("sleep")
    ) {

        return `
            🌙 <b>Evening Routine</b><br><br>

            • Review today's activities.<br>
            • Complete any pending activity if possible.<br>
            • Prepare tomorrow's activities.<br>
            • Relax before sleeping.<br><br>

            A simple routine can help
            you stay consistent. 🌱
        `;

    }


    // ----------------------------------------------
    // THANK YOU
    // ----------------------------------------------

    if (
        q.includes("thank") ||
        q.includes("thanks")
    ) {

        return `
            😊 You're welcome!<br><br>

            Keep working on your activities
            and stay consistent. 🌱💪
        `;

    }


    // ----------------------------------------------
    // DEFAULT
    // ----------------------------------------------

    return `
        🤖 <b>I'm here to help you!</b><br><br>

        Try asking me:<br><br>

        🌱 How can I build a new habit?<br>
        💪 How can I stay motivated?<br>
        📈 How can I improve consistency?<br>
        📊 Show my activity progress<br>
        🔔 I missed my activity<br>
        🏃 Give me an exercise suggestion<br>
        💧 How can I stay hydrated?<br>
        🌅 Give me a morning routine
    `;

}


// ======================================================
// 29. AI HTML SECURITY
// ======================================================

function aiEscapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================================
// 30. SHOW USER MESSAGE
// ======================================================

function addUserMessage(question) {

    const chatContainer =
        document.getElementById(
            "chatContainer"
        );


    if (!chatContainer) {

        console.log(
            "chatContainer not found"
        );

        return;

    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "message user-message";


    message.innerHTML = `

        <div class="message-content">

            <p>
                ${aiEscapeHTML(question)}
            </p>

        </div>


        <div class="message-icon">
            👤
        </div>

    `;


    chatContainer.appendChild(
        message
    );


    chatContainer.scrollTop =
        chatContainer.scrollHeight;

}


// ======================================================
// 31. SHOW AI MESSAGE
// ======================================================

function addAIMessage(answer) {

    const chatContainer =
        document.getElementById(
            "chatContainer"
        );


    if (!chatContainer) {

        console.log(
            "chatContainer not found"
        );

        return;

    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "message ai-message";


    message.innerHTML = `

        <div class="message-icon">
            🤖
        </div>


        <div class="message-content">

            <p>
                ${answer}
            </p>

        </div>

    `;


    chatContainer.appendChild(
        message
    );


    chatContainer.scrollTop =
        chatContainer.scrollHeight;

}


// ======================================================
// 32. ASK AI
// ======================================================

function askAI(question) {

    if (
        !question ||
        question.trim() === ""
    ) {

        return;

    }


    addUserMessage(
        question
    );


    const answer =
        getAIAnswer(
            question
        );


    setTimeout(
        function () {

            addAIMessage(
                answer
            );

        },
        300
    );

}


// ======================================================
// 33. CHAT FORM
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const chatForm =
            document.getElementById(
                "chatForm"
            );


        const chatInput =
            document.getElementById(
                "chatInput"
            );


        if (
            !chatForm ||
            !chatInput
        ) {

            return;

        }


        chatForm.addEventListener(
            "submit",
            function (e) {

                e.preventDefault();


                const question =
                    chatInput.value.trim();


                if (
                    question === ""
                ) {

                    return;

                }


                askAI(
                    question
                );


                chatInput.value =
                    "";


                chatInput.focus();

            }
        );

    }
);


// ======================================================
// 34. QUICK QUESTIONS
// ======================================================

window.quickQuestion =
    function (question) {

        const chatInput =
            document.getElementById(
                "chatInput"
            );


        if (chatInput) {

            chatInput.value =
                question;

            chatInput.focus();

        }


        askAI(
            question
        );

    };


// ======================================================
// 35. FLASK BACKEND INTEGRATION
// Keeps the existing frontend functions/design and makes
// Flask the source of truth for login, habits and AI data.
// ======================================================

const API_BASE_URL = "https://ai-habit-coach-xmfn.onrender.com";

function backendUserId() {
    return Number(localStorage.getItem("userId") || 0);
}
function ensureBackendLogin() {

    let userId =
        localStorage.getItem("userId");

    if (!userId) {

        const email =
            localStorage.getItem("loginEmail");

        if (email) {
            console.log(
                "Login email found:",
                email
            );
        }
    }

    return Boolean(
        localStorage.getItem("userId")
    );
}
async function backendRequest(endpoint, options = {}) {
    const response = await fetch(
        API_BASE_URL + endpoint,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );

    let data = {};
    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `Backend request failed (${response.status})`
        );
    }

    return data;
}

function saveBackendUser(data, email, name) {
    const userId =
        data && data.user_id !== undefined
            ? data.user_id
            : data && data.id !== undefined
                ? data.id
                : null;

    if (userId !== null) {
        localStorage.setItem("userId", String(userId));
    }

    localStorage.setItem("loggedIn", "true");

    if (name) {
        localStorage.setItem("userName", name);
    } else if (data && data.name) {
        localStorage.setItem("userName", data.name);
    }

    if (email) {
        localStorage.setItem("savedEmail", email);
        localStorage.setItem("loginEmail", email);
    }
}

function backendHabitToFrontend(habit) {
    return {
        id: habit.id,
        name: habit.name || habit.title || "Activity",
        goal: habit.target || habit.goal || "",
        category: habit.category || "Other",
        reminder: habit.reminder || "",
        completed:
            String(habit.status || "").toLowerCase() === "completed" ||
            habit.completed === true,
        completedAt:
            habit.completed_at ||
            habit.completedAt ||
            ""
    };
}

async function syncBackendHabitsToLocal() {
    const userId = backendUserId();

    if (!userId) {
        return false;
    }

    try {
        const data = await backendRequest(
            `/habits?user_id=${encodeURIComponent(userId)}`
        );

        const list =
            Array.isArray(data)
                ? data
                : Array.isArray(data.habits)
                    ? data.habits
                    : [];

        const frontendHabits =
            list.map(backendHabitToFrontend);

        localStorage.setItem(
            "habits",
            JSON.stringify(frontendHabits)
        );

        localStorage.setItem(
            "activities",
            JSON.stringify(frontendHabits)
        );

        return true;

    } catch (error) {
        console.error(
            "Backend habit sync failed:",
            error
        );
        return false;
    }
}

async function syncBackendProgressToUI() {
    const userId = backendUserId();

    if (!userId) {
        return;
    }

    try {
        const data = await backendRequest(
            `/progress?user_id=${encodeURIComponent(userId)}`
        );

        const percentage =
            Number(
                data.completion_percentage ??
                data.completion_rate ??
                0
            );

        const completed =
            Number(
                data.completed ??
                data.completed_count ??
                0
            );

        const progressRate =
            document.getElementById("progressRate");

        const overallPercentage =
            document.getElementById("overallPercentage");

        const overallProgressBar =
            document.getElementById("overallProgressBar");

        const progressCompleted =
            document.getElementById("progressCompleted");

        if (progressRate) {
            progressRate.textContent =
                percentage + "%";
        }

        if (overallPercentage) {
            overallPercentage.textContent =
                percentage + "%";
        }

        if (overallProgressBar) {
            overallProgressBar.style.width =
                percentage + "%";
        }

        if (progressCompleted) {
            progressCompleted.textContent =
                completed;
        }

    } catch (error) {
        console.error(
            "Backend progress sync failed:",
            error
        );
    }
}

async function callBackendAIPrediction(question = "") {

    const userId = backendUserId();

    if (!userId) {
        return null;
    }

    try {
        const habitData =
            await backendRequest(
                `/habits?user_id=${encodeURIComponent(userId)}`
            );

        const list =
            Array.isArray(habitData)
                ? habitData
                : Array.isArray(habitData.habits)
                    ? habitData.habits
                    : [];

        if (list.length === 0) {
            return null;
        }

        const completed =
            list.filter(
                habit =>
                    String(habit.status || "")
                        .toLowerCase() ===
                    "completed"
            ).length;

        const completionRate =
            Math.round(
                (completed / list.length) * 100
            );

        const missedDays =
            list.length - completed;

        const result =
            await backendRequest(
                "/ai/predict",
                {
                    method: "POST",
                    body: JSON.stringify({
                        user_id: userId,
                        habit_id: Number(list[0].id),
                        completion_rate:
                            completionRate,
                        missed_days:
                            missedDays,
                        current_streak:
                            completed > 0 ? 1 : 0,
                        frequency: 7
                    })
                }
            );

        return result;

    } catch (error) {
        console.error(
            "Backend AI prediction failed:",
            error
        );
        return null;
    }
}


// ------------------------------------------------------
// BACKEND LOGIN / REGISTER
// These capture handlers run before the old local-only
// handlers so the existing frontend design is preserved.
// ------------------------------------------------------

document.addEventListener(
    "submit",
    function (event) {

        if (!event.target) {
            return;
        }

        const form =
            event.target;

        if (form.id !== "loginForm" &&
            form.id !== "registerForm") {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        if (form.id === "loginForm") {
            const emailInput =
                document.getElementById("email") ||
                document.getElementById("loginEmail");

            const passwordInput =
                document.getElementById("password") ||
                document.getElementById("loginPassword");

            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";

            const password =
                passwordInput
                    ? passwordInput.value.trim()
                    : "";

            if (!email || !password) {
                alert(
                    "Please enter email and password."
                );
                return;
            }

            backendRequest(
                "/login",
                {
                    method: "POST",
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            )
               .then(function (data) {

    saveBackendUser(
        data,
        email,
        data.name || ""
    );

    // Clear previous user's local habit data
    localStorage.removeItem("habits");
    localStorage.removeItem("activities");

    // Clear previous user's sync state
    sessionStorage.clear();

    window.location.href =
        "dashboard.html";
})
                .catch(function (error) {

                    console.error(
                        "Backend login error:",
                        error
                    );

                    alert(
                        error.message ||
                        "Invalid email or password."
                    );
                });

            return;
        }

        const nameInput =
            document.getElementById("registerName") ||
            document.getElementById("name");

        const emailInput =
            document.getElementById("registerEmail") ||
            document.getElementById("email");

        const passwordInput =
            document.getElementById("registerPassword") ||
            document.getElementById("password");

        const confirmInput =
            document.getElementById("confirmPassword");

        const name =
            nameInput
                ? nameInput.value.trim()
                : "";

        const email =
            emailInput
                ? emailInput.value.trim()
                : "";

        const password =
            passwordInput
                ? passwordInput.value.trim()
                : "";

        const confirmPassword =
            confirmInput
                ? confirmInput.value.trim()
                : "";

        if (!name || !email || !password) {
            alert(
                "Please fill all fields."
            );
            return;
        }

        if (
            confirmInput &&
            password !== confirmPassword
        ) {
            alert(
                "Passwords do not match."
            );
            return;
        }

        backendRequest(
            "/register",
            {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            }
        )
            .then(function (data) {

                saveBackendUser(
                    data,
                    email,
                    name
                );

                alert(
                    data.message ||
                    "Account created successfully!"
                );

                window.location.href =
                    "index.html";
            })
            .catch(function (error) {

                console.error(
                    "Backend register error:",
                    error
                );

                alert(
                    error.message ||
                    "Registration failed."
                );
            });

    },
    true
);


// ------------------------------------------------------
// BACKEND HABIT FORM
// ------------------------------------------------------

document.addEventListener(
    "submit",
    function (event) {

        const form =
            event.target;

        if (!form ||
            form.id !== "habitForm") {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        const nameInput =
            document.getElementById(
                "habitName"
            );

        const goalSelect =
            document.getElementById(
                "habitGoalSelect"
            );

        const goalInput =
            document.getElementById(
                "habitGoal"
            );

        const categorySelect =
            document.getElementById(
                "habitCategory"
            );

        const otherCategoryInput =
            document.getElementById(
                "otherCategory"
            );

        const reminderInput =
            document.getElementById(
                "reminderTime"
            );

        const name =
            nameInput
                ? nameInput.value.trim()
                : "";

        let goal = "";

        if (
            goalSelect &&
            (
                goalSelect.value === "other" ||
                goalSelect.value === "Other"
            )
        ) {
            goal =
                goalInput
                    ? goalInput.value.trim()
                    : "";
        } else {
            goal =
                goalSelect
                    ? goalSelect.value
                    : "";
        }

        let category = "";

        if (
            categorySelect &&
            categorySelect.value === "Other"
        ) {
            category =
                otherCategoryInput
                    ? otherCategoryInput.value.trim()
                    : "";
        } else {
            category =
                categorySelect
                    ? categorySelect.value
                    : "";
        }

        const reminder =
            reminderInput
                ? reminderInput.value
                : "";

        const editId =
            form.dataset.editId || "";

        if (!name) {
            alert(
                "Please enter activity name."
            );
            return;
        }

        const userId =
            backendUserId();

        if (!userId) {
            alert(
                "Please login first."
            );
            return;
        }

        const payload = {
            user_id: userId,
            name: name,
            category:
                category || "Other",
            target: goal,
            status: "Pending"
        };

        if (editId) {

            backendRequest(
                `/habits/${encodeURIComponent(editId)}`,
                {
                    method: "PUT",
                    body: JSON.stringify(
                        payload
                    )
                }
            )
                .then(function () {

                    localStorage.setItem(
                        "lastReminder",
                        reminder
                    );

                    sessionStorage.removeItem(
                        "backend-sync-" +
                        window.location.pathname
                    );

                    window.location.reload();
                })
                .catch(function (error) {

                    console.error(
                        "Backend edit error:",
                        error
                    );

                    alert(
                        error.message ||
                        "Could not update activity."
                    );
                });

            return;
        }

        backendRequest(
            "/habits",
            {
                method: "POST",
                body: JSON.stringify(
                    payload
                )
            }
        )
            .then(function () {

                localStorage.setItem(
                    "lastReminder",
                    reminder
                );

                sessionStorage.removeItem(
                    "backend-sync-" +
                    window.location.pathname
                );

                window.location.reload();
            })
            .catch(function (error) {

                console.error(
                    "Backend add error:",
                    error
                );

                alert(
                    error.message ||
                    "Could not add activity."
                );
            });

    },
    true
);


// ------------------------------------------------------
// BACKEND COMPLETE / PENDING
// ------------------------------------------------------

window.toggleHabit =
    async function (id) {

        const userId =
            backendUserId();

        if (!userId) {
            alert(
                "Please login first."
            );
            return;
        }

        try {

            const current =
                JSON.parse(
                    localStorage.getItem(
                        "habits"
                    ) || "[]"
                );

            const habit =
                current.find(
                    item =>
                        String(item.id) ===
                        String(id)
                );

            const isCompleted =
                habit
                    ? habit.completed === true
                    : false;

            const newStatus =
                isCompleted
                    ? "Pending"
                    : "Completed";

            await backendRequest(
                `/habits/${encodeURIComponent(id)}`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        user_id: userId,
                        status: newStatus
                    })
                }
            );

            if (newStatus === "Completed") {

                const today =
                    new Date()
                        .toISOString()
                        .split("T")[0];

                try {
                    await backendRequest(
                        "/habit-log",
                        {
                            method: "POST",
                            body: JSON.stringify({
                                user_id: userId,
                                habit_id: Number(id),
                                date: today,
                                status: "Completed",
                                duration: 0
                            })
                        }
                    );
                } catch (logError) {
                    console.error(
                        "Habit log error:",
                        logError
                    );
                }
            }

            await syncBackendHabitsToLocal();
            await syncBackendProgressToUI();

            window.location.reload();

        } catch (error) {

            console.error(
                "Backend complete error:",
                error
            );

            alert(
                error.message ||
                "Could not update activity."
            );
        }
    };


// ------------------------------------------------------
// BACKEND DELETE
// ------------------------------------------------------

window.deleteHabit =
    async function (id) {

        const confirmDelete =
            confirm(
                "Delete this activity?"
            );

        if (!confirmDelete) {
            return;
        }

        const userId =
            backendUserId();

        if (!userId) {
            alert(
                "Please login first."
            );
            return;
        }

        try {

            await backendRequest(
                `/habits/${encodeURIComponent(id)}`,
                {
                    method: "DELETE",
                    body: JSON.stringify({
                        user_id: userId
                    })
                }
            );

            await syncBackendHabitsToLocal();

            window.location.reload();

        } catch (error) {

            console.error(
                "Backend delete error:",
                error
            );

            alert(
                error.message ||
                "Could not delete activity."
            );
        }
    };


// ------------------------------------------------------
// BACKEND PROFILE / LOGOUT
// ------------------------------------------------------

const backendLogout =
    window.logout;

window.logout =
    function () {

        localStorage.removeItem(
            "userId"
        );

        localStorage.removeItem(
            "loggedIn"
        );

        localStorage.removeItem(
            "loginEmail"
        );

        sessionStorage.clear();

        if (typeof backendLogout === "function") {
            backendLogout();
        } else {
            window.location.href =
                "index.html";
        }
    };


// ------------------------------------------------------
// INITIAL BACKEND SYNC
// Loads server data into localStorage, then refreshes once.
// ------------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const userId =
            backendUserId();

        if (!userId) {
            return;
        }

        const pageKey =
            "backend-sync-" +
            window.location.pathname;

        if (
            sessionStorage.getItem(
                pageKey
            )
        ) {
            return;
        }

        syncBackendHabitsToLocal()
            .then(function (success) {

                if (!success) {
                    return;
                }

                sessionStorage.setItem(
                    pageKey,
                    "done"
                );

                window.location.reload();
            });

        syncBackendProgressToUI();

    }
);


// ------------------------------------------------------
// AI CHAT + BACKEND AI PREDICTION
// Existing chat stays. Prediction questions additionally
// show the Random Forest result from Flask.
// ------------------------------------------------------

const originalAskAI =
    window.askAI;

if (
    typeof originalAskAI ===
    "function"
) {

    window.askAI =
        async function (question) {

            originalAskAI(
                question
            );

            if (
                !/predict|prediction|likelihood|risk/i.test(
                    question || ""
                )
            ) {
                return;
            }

            const result =
                await callBackendAIPrediction(
                    question
                );

            if (!result) {
                return;
            }

            setTimeout(
                function () {

                    if (
                        typeof addAIMessage ===
                        "function"
                    ) {
                        addAIMessage(
                            "<strong>AI Prediction:</strong> " +
                            result.prediction +
                            "<br><br>" +
                            "<strong>Confidence:</strong> " +
                            result.confidence +
                            "%<br><br>" +
                            "<strong>Recommendation:</strong> " +
                            result.recommendation
                        );
                    }

                },
                350
            );
        };
}

