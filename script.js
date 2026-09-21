/* =========================================================
   AI HABIT COACH
   Good Activities Only
   ========================================================= */


/* =========================
   LOGIN
   ========================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        if (email === "" || password === "") {
            alert("Please enter email and password.");
            return;
        }

        localStorage.setItem("loggedIn", "true");
        window.location.href = "dashboard.html";
    });
}


/* =========================
   LOGOUT
   ========================= */

function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html";
}


/* =========================
   ACTIVITIES DATA
   ========================= */

let habits = JSON.parse(localStorage.getItem("habits")) || [];


/* =========================
   DEFAULT ACTIVITIES
   ========================= */

if (habits.length === 0) {
    habits = [
        {
            id: Date.now() + 1,
            name: "Exercise",
            goal: "30 minutes",
            category: "Fitness",
            completed: false
        },
        {
            id: Date.now() + 2,
            name: "Reading",
            goal: "20 minutes",
            category: "Study",
            completed: false
        },
        {
            id: Date.now() + 3,
            name: "Drink Water",
            goal: "2 Litres",
            category: "Health",
            completed: false
        }
    ];

    saveHabits();
}


/* =========================
   SAVE ACTIVITIES
   ========================= */

function saveHabits() {
    localStorage.setItem("habits", JSON.stringify(habits));
}


/* =========================
   DISPLAY ACTIVITIES
   ========================= */

function displayHabits() {
    const habitList = document.getElementById("habitList");

    if (!habitList) return;

    habitList.innerHTML = "";

    if (habits.length === 0) {
        habitList.innerHTML = `
            <div class="empty-state">
                <p>No activities added yet.</p>
                <p>Add your first good activity above.</p>
            </div>
        `;

        updateHabitCount();
        return;
    }

    habits.forEach(function (habit) {
        const habitItem = document.createElement("div");

        habitItem.className =
            "habit-item " + (habit.completed ? "completed" : "");

        habitItem.innerHTML = `
            <div class="habit-info">
                <h3>${habit.name}</h3>
                <p>Goal: ${habit.goal}</p>
                <p>Category: ${habit.category}</p>
            </div>

            <div class="habit-actions">
                <button
                    onclick="toggleHabit(${habit.id})"
                    class="complete-btn">
                    ${habit.completed ? "✓ Completed" : "Mark Complete"}
                </button>
            </div>
        `;

        habitList.appendChild(habitItem);
    });

    updateHabitCount();
}


/* =========================
   ACTIVITY COUNT
   ========================= */

function updateHabitCount() {
    const habitCount = document.getElementById("habitCount");

    if (!habitCount) return;

    habitCount.textContent =
        habits.length +
        (habits.length === 1 ? " Activity" : " Activities");
}


/* =========================
   ADD NEW ACTIVITY
   ========================= */

const habitForm = document.getElementById("habitForm");

if (habitForm) {
    habitForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name =
            document.getElementById("habitName").value.trim();

        const goal =
            document.getElementById("habitGoal").value.trim();

        const category =
            document.getElementById("habitCategory").value;

        if (name === "" || goal === "") {
            alert("Please enter activity name and goal.");
            return;
        }

        const newHabit = {
            id: Date.now(),
            name: name,
            goal: goal,
            category: category,
            completed: false
        };

        habits.push(newHabit);

        saveHabits();

        habitForm.reset();

        displayHabits();
        displayDashboardHabits();
        updateDashboardStats();
        updateProgressPage();

        alert("Good activity added successfully!");
    });
}


/* =========================
   COMPLETE ACTIVITY
   ========================= */

function toggleHabit(id) {
    habits = habits.map(function (habit) {
        if (habit.id === id) {
            habit.completed = !habit.completed;
        }

        return habit;
    });

    saveHabits();

    displayHabits();
    displayDashboardHabits();
    updateDashboardStats();
    updateProgressPage();
}


/* =========================
   DASHBOARD ACTIVITIES
   ========================= */

function displayDashboardHabits() {
    const dashboardList =
        document.getElementById("dashboardHabitList");

    if (!dashboardList) return;

    dashboardList.innerHTML = "";

    if (habits.length === 0) {
        dashboardList.innerHTML = `
            <div class="empty-state">
                <p>No activities added yet.</p>
            </div>
        `;

        return;
    }

    habits.forEach(function (habit) {
        const item = document.createElement("div");

        item.className =
            "dashboard-habit-item " +
            (habit.completed ? "completed" : "");

        item.innerHTML = `
            <div>
                <h3>${habit.name}</h3>
                <p>Goal: ${habit.goal}</p>
                <small>Category: ${habit.category}</small>
            </div>

            <button
                onclick="toggleDashboardHabit(${habit.id})"
                class="complete-btn">

                ${habit.completed ? "✓ Done" : "Complete"}

            </button>
        `;

        dashboardList.appendChild(item);
    });
}


/* =========================
   DASHBOARD COMPLETE
   ========================= */

function toggleDashboardHabit(id) {
    habits = habits.map(function (habit) {
        if (habit.id === id) {
            habit.completed = !habit.completed;
        }

        return habit;
    });

    saveHabits();

    displayDashboardHabits();
    displayHabits();
    updateDashboardStats();
    updateProgressPage();
}


/* =========================
   DASHBOARD STATISTICS
   ========================= */

function updateDashboardStats() {
    const streakCount =
        document.getElementById("streakCount");

    const completedCount =
        document.getElementById("completedCount");

    const successRate =
        document.getElementById("successRate");

    const completed =
        habits.filter(habit => habit.completed).length;

    const total = habits.length;

    let rate = 0;

    if (total > 0) {
        rate = Math.round((completed / total) * 100);
    }

    if (completedCount) {
        completedCount.textContent = completed;
    }

    if (successRate) {
        successRate.textContent = rate + "%";
    }

    if (streakCount) {
        streakCount.textContent =
            completed > 0 ? "1 Day" : "0 Days";
    }
}


/* =========================
   PROGRESS PAGE
   ========================= */

function updateProgressPage() {
    const totalElement =
        document.getElementById("progressTotal");

    const completedElement =
        document.getElementById("progressCompleted");

    const rateElement =
        document.getElementById("progressRate");

    const percentageElement =
        document.getElementById("overallPercentage");

    const progressBar =
        document.getElementById("overallProgressBar");

    const activityProgressList =
        document.getElementById("activityProgressList");

    const suggestion =
        document.getElementById("progressSuggestion");

    const total = habits.length;

    const completed =
        habits.filter(habit => habit.completed).length;

    let rate = 0;

    if (total > 0) {
        rate = Math.round((completed / total) * 100);
    }

    if (totalElement) {
        totalElement.textContent = total;
    }

    if (completedElement) {
        completedElement.textContent = completed;
    }

    if (rateElement) {
        rateElement.textContent = rate + "%";
    }

    if (percentageElement) {
        percentageElement.textContent = rate + "%";
    }

    if (progressBar) {
        progressBar.style.width = rate + "%";
    }

    if (activityProgressList) {
        activityProgressList.innerHTML = "";

        if (habits.length === 0) {
            activityProgressList.innerHTML = `
                <p>No activities available.</p>
            `;
        } else {
            habits.forEach(function (habit) {
                const item = document.createElement("div");

                item.className = "progress-activity";

                item.innerHTML = `
                    <div class="progress-activity-info">
                        <strong>${habit.name}</strong>
                        <span>
                            ${habit.completed
                                ? "✓ Completed"
                                : "Pending"}
                        </span>
                    </div>
                `;

                activityProgressList.appendChild(item);
            });
        }
    }

    if (suggestion) {
        if (total === 0) {
            suggestion.textContent =
                "Start by adding your first good activity.";
        } else if (rate === 100) {
            suggestion.textContent =
                "Excellent! You completed all your activities today. Keep going!";
        } else if (rate >= 70) {
            suggestion.textContent =
                "Great progress! Keep following your routine consistently.";
        } else if (rate >= 40) {
            suggestion.textContent =
                "Good start! Try to complete a few more activities today.";
        } else {
            suggestion.textContent =
                "Start with small goals and complete one activity at a time.";
        }
    }
}


/* =========================
   AI COACH DATA
   ========================= */

function getActivityData() {
    const total = habits.length;

    const completed =
        habits.filter(habit => habit.completed).length;

    const pending = total - completed;

    let rate = 0;

    if (total > 0) {
        rate = Math.round((completed / total) * 100);
    }

    return {
        total: total,
        completed: completed,
        pending: pending,
        rate: rate
    };
}


/* =========================
   AI RESPONSE
   ========================= */

function getAIResponse(message) {
    const text = message.toLowerCase();

    const data = getActivityData();

    if (
        text.includes("progress") ||
        text.includes("status") ||
        text.includes("completed")
    ) {
        return `
            <strong>Your Activity Progress</strong><br><br>

            Total Activities: ${data.total}<br>
            Completed: ${data.completed}<br>
            Pending: ${data.pending}<br>
            Completion Rate: ${data.rate}%<br><br>

            Keep working on your daily activities!
        `;
    }

    if (
        text.includes("motivat") ||
        text.includes("lazy") ||
        text.includes("tired")
    ) {
        return `
            <strong>Stay Motivated!</strong><br><br>

            • Start with a small activity.<br>
            • Set realistic daily goals.<br>
            • Celebrate small achievements.<br>
            • Stay consistent every day.<br><br>

            Small steps create big changes!
        `;
    }

    if (
        text.includes("consistent") ||
        text.includes("consistency")
    ) {
        return `
            <strong>Tips for Consistency</strong><br><br>

            • Follow the same routine every day.<br>
            • Keep your goals simple.<br>
            • Track your completed activities.<br>
            • Do not give up after one missed day.<br><br>

            Consistency is more important than perfection.
        `;
    }

    if (
        text.includes("build") ||
        text.includes("new habit") ||
        text.includes("habit")
    ) {
        return `
            <strong>How to Build a Good Habit</strong><br><br>

            • Start with a small goal.<br>
            • Choose a fixed time for your activity.<br>
            • Track your progress every day.<br>
            • Increase your goal slowly.<br><br>

            Start small and stay consistent!
        `;
    }

    return `
        <strong>AI Coach</strong><br><br>

        You currently have <strong>${data.total}</strong>
        activities.<br>

        You completed <strong>${data.completed}</strong>
        activities and have
        <strong>${data.pending}</strong> pending.<br><br>

        Keep following your routine and stay consistent!
    `;
}


/* =========================
   AI CHAT
   ========================= */

function addUserMessage(message) {
    const chatContainer =
        document.getElementById("chatContainer");

    if (!chatContainer) return;

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        "chat-message user-message";

    messageDiv.innerHTML = `
        <p>${message}</p>
    `;

    chatContainer.appendChild(messageDiv);

    chatContainer.scrollTop =
        chatContainer.scrollHeight;
}


function addAIMessage(message) {
    const chatContainer =
        document.getElementById("chatContainer");

    if (!chatContainer) return;

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        "chat-message ai-message";

    messageDiv.innerHTML = `
        <p>${message}</p>
    `;

    chatContainer.appendChild(messageDiv);

    chatContainer.scrollTop =
        chatContainer.scrollHeight;
}


/* =========================
   CHAT FORM
   ========================= */

const chatForm =
    document.getElementById("chatForm");

if (chatForm) {
    chatForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const input =
            document.getElementById("chatInput");

        if (!input) return;

        const message =
            input.value.trim();

        if (message === "") return;

        addUserMessage(message);

        input.value = "";

        setTimeout(function () {
            const response =
                getAIResponse(message);

            addAIMessage(response);
        }, 500);
    });
}


/* =========================
   QUICK QUESTIONS
   ========================= */

function quickQuestion(question) {
    const input =
        document.getElementById("chatInput");

    if (!input) return;

    input.value = question;

    if (chatForm) {
        chatForm.dispatchEvent(
            new Event("submit")
        );
    }
}


/* =========================
   AI WELCOME MESSAGE
   ========================= */

function createWelcomeMessage() {
    const chatContainer =
        document.getElementById("chatContainer");

    if (!chatContainer) return;

    const existingMessage =
        document.getElementById("welcomeMessage");

    if (existingMessage) return;

    const messageDiv =
        document.createElement("div");

    messageDiv.id = "welcomeMessage";

    messageDiv.className =
        "chat-message ai-message";

    messageDiv.innerHTML = `
        <p>
            Hello! I'm your AI Habit Coach.
            <br><br>
            I can help you build good habits,
            stay motivated, improve consistency
            and understand your progress.
            <br><br>
            Ask me anything about your daily habits!
        </p>
    `;

    chatContainer.appendChild(messageDiv);
}


/* =========================
   REGISTER
   ========================= */

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name =
            document.getElementById("registerName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (
            name === "" ||
            email === "" ||
            password === "" ||
            confirmPassword === ""
        ) {
            alert("Please fill all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        const user = {
            name: name,
            email: email
        };

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        alert(
            "Account created successfully! Please login."
        );

        window.location.href = "index.html";
    });
}


/* =========================
   PAGE LOAD
   ========================= */

document.addEventListener("DOMContentLoaded", function () {
    displayHabits();
    displayDashboardHabits();
    updateDashboardStats();
    updateProgressPage();
    createWelcomeMessage();
});