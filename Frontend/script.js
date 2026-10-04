"use strict";

/* =========================================================
   AI HABIT COACH - FRONTEND SCRIPT
   Backend: FastAPI + MySQL
   ========================================================= */

const API_BASE_URL = "https://ai-habit-coach-backend.onrender.com";


/* =========================================================
   COMMON HELPERS
   ========================================================= */

function getStoredUser() {
    try {
        const user = localStorage.getItem("backendUser");

        if (user) {
            return JSON.parse(user);
        }
    } catch (error) {
        console.error("User data error:", error);
    }

    return null;
}


function saveBackendUser(data) {

    const user = {
        id: data.user_id || data.id,
        name: data.name || "",
        email: data.email || ""
    };

    localStorage.setItem(
        "backendUser",
        JSON.stringify(user)
    );

    localStorage.setItem(
        "user_id",
        String(user.id)
    );

    localStorage.setItem(
        "userId",
        String(user.id)
    );

    localStorage.setItem(
        "userName",
        user.name
    );

    localStorage.setItem(
        "userEmail",
        user.email
    );

    return user;
}


function getUserId() {

    const user = getStoredUser();

    if (user && user.id) {
        return Number(user.id);
    }

    const id =
        localStorage.getItem("user_id") ||
        localStorage.getItem("userId");

    return id ? Number(id) : null;
}


function showMessage(message) {
    alert(message);
}


function redirect(page) {
    window.location.href = page;
}


/* =========================================================
   BACKEND REQUEST
   ========================================================= */

async function backendRequest(endpoint, options = {}) {

    const config = {

        method: options.method || "GET",

        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    };


    if (options.body !== undefined) {

        config.body =
            typeof options.body === "string"
                ? options.body
                : JSON.stringify(options.body);
    }


    const response = await fetch(
        API_BASE_URL + endpoint,
        config
    );


    let data = {};


    try {

        data = await response.json();

    } catch (error) {

        data = {};
    }


    if (!response.ok) {

        throw new Error(
            data.detail ||
            data.message ||
            "Something went wrong."
        );
    }


    return data;
}


/* =========================================================
   LOGIN
   ========================================================= */

async function loginUser(email, password) {

    return await backendRequest(
        "/login",
        {
            method: "POST",

            body: {
                email: email,
                password: password
            }
        }
    );
}


/* =========================================================
   REGISTER
   ========================================================= */

async function registerUser(
    name,
    email,
    password
) {

    return await backendRequest(
        "/register",
        {
            method: "POST",

            body: {
                name: name,
                email: email,
                password: password
            }
        }
    );
}


/* =========================================================
   LOGIN FORM
   ========================================================= */

function setupLoginForm() {

    const form =
        document.getElementById("loginForm");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const emailInput =
                document.getElementById("loginEmail") ||
                form.querySelector(
                    'input[type="email"]'
                );


            const passwordInput =
                document.getElementById("loginPassword") ||
                form.querySelector(
                    'input[type="password"]'
                );


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            if (!email || !password) {

                showMessage(
                    "Please enter email and password."
                );

                return;
            }


            try {

                const data =
                    await loginUser(
                        email,
                        password
                    );


                saveBackendUser(data);


                localStorage.setItem(
                    "loggedIn",
                    "true"
                );


                localStorage.setItem(
                    "loginEmail",
                    email
                );


                showMessage(
                    "Login successful!"
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "dashboard.html";

                    },
                    300
                );


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Invalid email or password."
                );
            }
        }
    );
}


/* =========================================================
   REGISTER FORM
   ========================================================= */

function setupRegisterForm() {

    const form =
        document.getElementById(
            "registerForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const nameInput =
                document.getElementById(
                    "registerName"
                ) ||
                form.querySelector(
                    'input[name="name"]'
                ) ||
                form.querySelector(
                    'input[type="text"]'
                );


            const emailInput =
                document.getElementById(
                    "registerEmail"
                ) ||
                form.querySelector(
                    'input[type="email"]'
                );


            const passwordInput =
                document.getElementById(
                    "registerPassword"
                ) ||
                form.querySelector(
                    'input[type="password"]'
                );


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
                    ? passwordInput.value
                    : "";


            if (
                !name ||
                !email ||
                !password
            ) {

                showMessage(
                    "Please fill all registration fields."
                );

                return;
            }


            try {

                await registerUser(
                    name,
                    email,
                    password
                );


                showMessage(
                    "Registration successful! Please login."
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "index.html";

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Registration failed."
                );
            }
        }
    );
}


/* =========================================================
   GET HABITS
   ========================================================= */

async function getHabits() {

    const userId =
        getUserId();


    if (!userId) {

        return [];
    }


    return await backendRequest(
        "/habits?user_id=" +
        encodeURIComponent(userId)
    );
}


/* =========================================================
   CREATE HABIT
   ========================================================= */

async function createHabit(
    name,
    category,
    target
) {

    const userId =
        getUserId();


    if (!userId) {

        throw new Error(
            "Please login first."
        );
    }


    return await backendRequest(

        "/habits?user_id=" +
        encodeURIComponent(userId),

        {
            method: "POST",

            body: {

                name: name,

                category:
                    category || null,

                target:
                    target || null
            }
        }
    );
}


/* =========================================================
   UPDATE HABIT
   ========================================================= */

async function updateHabit(
    habitId,
    updates
) {

    const userId =
        getUserId();


    if (!userId) {

        throw new Error(
            "Please login first."
        );
    }


    return await backendRequest(

        "/habits/" +
        encodeURIComponent(habitId) +
        "?user_id=" +
        encodeURIComponent(userId),

        {
            method: "PUT",

            body: updates
        }
    );
}


/* =========================================================
   DELETE HABIT
   ========================================================= */

async function deleteHabitFromBackend(
    habitId
) {

    const userId =
        getUserId();


    if (!userId) {

        throw new Error(
            "Please login first."
        );
    }


    return await backendRequest(

        "/habits/" +
        encodeURIComponent(habitId) +
        "?user_id=" +
        encodeURIComponent(userId),

        {
            method: "DELETE"
        }
    );
}


/* =========================================================
   HABIT LOG
   ========================================================= */

async function createHabitLog(
    habitId,
    status = "Completed",
    duration = null,
    note = ""
) {

    const userId =
        getUserId();


    if (!userId) {

        throw new Error(
            "Please login first."
        );
    }


    return await backendRequest(

        "/habit-log?user_id=" +
        encodeURIComponent(userId),

        {
            method: "POST",

            body: {

                habit_id:
                    Number(habitId),

                status:
                    status,

                duration:
                    duration,

                note:
                    note
            }
        }
    );
}


/* =========================================================
   GET HABIT LOG
   ========================================================= */

async function getHabitLogs() {

    const userId =
        getUserId();


    if (!userId) {

        return [];
    }


    return await backendRequest(

        "/habit-log?user_id=" +
        encodeURIComponent(userId)
    );
}


/* =========================================================
   GET PROGRESS
   ========================================================= */

async function getProgress() {

    const userId =
        getUserId();


    if (!userId) {

        return {

            completed: 0,

            missed: 0,

            total_logs: 0,

            completion_percentage: 0
        };
    }


    return await backendRequest(

        "/progress?user_id=" +
        encodeURIComponent(userId)
    );
}


/* =========================================================
   HABIT FORM
   ========================================================= */

function setupHabitForm() {

    const form =
        document.getElementById(
            "habitForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* -----------------------------
               HABIT NAME
               ----------------------------- */

            const nameInput =
                document.getElementById(
                    "habitName"
                );


            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";


            /* -----------------------------
               CATEGORY
               ----------------------------- */

            const categoryInput =
                document.getElementById(
                    "habitCategory"
                );


            const otherCategoryInput =
                document.getElementById(
                    "otherCategory"
                );


            let category = "";


            if (categoryInput) {

                category =
                    categoryInput.value.trim();
            }


            if (
                category === "Other" &&
                otherCategoryInput
            ) {

                category =
                    otherCategoryInput.value.trim();
            }


            /* -----------------------------
               TARGET / GOAL
               ----------------------------- */

            const goalSelect =
                document.getElementById(
                    "habitGoalSelect"
                );


            const goalInput =
                document.getElementById(
                    "habitGoal"
                );


            let target = "";


            if (goalSelect) {

                target =
                    goalSelect.value.trim();
            }


            if (
                goalSelect &&
                goalSelect.value === "Other" &&
                goalInput
            ) {

                target =
                    goalInput.value.trim();
            }


            if (
                !target &&
                goalInput
            ) {

                target =
                    goalInput.value.trim();
            }


            /* -----------------------------
               VALIDATION
               ----------------------------- */

            if (!name) {

                showMessage(
                    "Please enter habit name."
                );

                return;
            }


            try {

                await createHabit(
                    name,
                    category,
                    target
                );


                showMessage(
                    "Habit added successfully!"
                );


                form.reset();


                if (otherCategoryInput) {

                    otherCategoryInput.style.display =
                        "none";
                }


                if (goalInput) {

                    goalInput.style.display =
                        "none";
                }


                await loadHabits();


                await loadProgress();


            } catch (error) {

                console.error(
                    "Create habit error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to add habit."
                );
            }
        }
    );


    /* =====================================================
       CATEGORY - OTHER
       ===================================================== */

    const categorySelect =
        document.getElementById(
            "habitCategory"
        );


    const otherCategory =
        document.getElementById(
            "otherCategory"
        );


    if (
        categorySelect &&
        otherCategory
    ) {

        categorySelect.addEventListener(
            "change",
            function () {

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


    /* =====================================================
       GOAL - OTHER
       ===================================================== */

    const goalSelect =
        document.getElementById(
            "habitGoalSelect"
        );


    const goalInput =
        document.getElementById(
            "habitGoal"
        );


    if (
        goalSelect &&
        goalInput
    ) {

        goalInput.style.display =
            "none";


        goalSelect.addEventListener(
            "change",
            function () {

                if (
                    goalSelect.value ===
                    "Other"
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
}


/* =========================================================
   DISPLAY HABITS
   ========================================================= */

async function loadHabits() {

    /* IMPORTANT:
       habits.html uses habitsList
    */

    const container =
        document.getElementById(
            "habitsList"
        ) ||
        document.getElementById(
            "habitsContainer"
        ) ||
        document.getElementById(
            "habitList"
        ) ||
        document.querySelector(
            ".habit-list"
        );


    if (!container) {

        console.log(
            "Habit list container not found."
        );

        return;
    }


    try {

        const habits =
            await getHabits();


        container.innerHTML = "";


        if (
            !habits ||
            habits.length === 0
        ) {

            container.innerHTML = `
                <div class="no-habits">
                    <h3>No habits found</h3>
                    <p>Add your first habit to start tracking.</p>
                </div>
            `;

            return;
        }


        habits.forEach(
            function (habit) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "habit-card";


                const status =
                    habit.status ||
                    "Pending";


                const statusClass =
                    status
                        .toLowerCase()
                        .replace(
                            /\s+/g,
                            "-"
                        );


                card.innerHTML = `

                    <div class="habit-card-content">

                        <h3>
                            ${escapeHtml(
                                habit.name
                            )}
                        </h3>


                        <p>
                            <strong>Category:</strong>
                            ${escapeHtml(
                                habit.category ||
                                "Not set"
                            )}
                        </p>


                        <p>
                            <strong>Target:</strong>
                            ${escapeHtml(
                                habit.target ||
                                "Not set"
                            )}
                        </p>


                        <p>
                            <strong>Status:</strong>

                            <span class="habit-status ${statusClass}">
                                ${escapeHtml(
                                    status
                                )}
                            </span>

                        </p>


                        <div class="habit-actions">

                            <button
                                type="button"
                                onclick="completeHabit(${habit.id})"
                            >
                                Complete
                            </button>


                            <button
                                type="button"
                                onclick="removeHabit(${habit.id})"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                `;


                container.appendChild(
                    card
                );
            }
        );


    } catch (error) {

        console.error(
            "Load habits error:",
            error
        );


        container.innerHTML = `

            <div class="error-message">

                <p>
                    Unable to load habits.
                </p>

                <small>
                    ${escapeHtml(
                        error.message
                    )}
                </small>

            </div>
        `;
    }
}


/* =========================================================
   COMPLETE HABIT
   ========================================================= */

async function completeHabit(
    habitId
) {

    try {

        await updateHabit(

            habitId,

            {
                status:
                    "Completed"
            }
        );


        await createHabitLog(

            habitId,

            "Completed"
        );


        showMessage(
            "Habit marked as completed!"
        );


        await loadHabits();


        await loadProgress();


    } catch (error) {

        console.error(
            "Complete habit error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to complete habit."
        );
    }
}


/* =========================================================
   DELETE HABIT
   ========================================================= */

async function removeHabit(
    habitId
) {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this habit?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteHabitFromBackend(
            habitId
        );


        showMessage(
            "Habit deleted successfully."
        );


        await loadHabits();


        await loadProgress();


    } catch (error) {

        console.error(
            "Delete habit error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to delete habit."
        );
    }
}


/* =========================================================
   PROGRESS DISPLAY
   ========================================================= */

async function loadProgress() {

    try {

        const progress =
            await getProgress();


        const completedElement =
            document.getElementById(
                "completedCount"
            );


        const missedElement =
            document.getElementById(
                "missedCount"
            );


        const totalElement =
            document.getElementById(
                "totalLogs"
            );


        const percentageElement =
            document.getElementById(
                "completionPercentage"
            );


        if (completedElement) {

            completedElement.textContent =
                progress.completed || 0;
        }


        if (missedElement) {

            missedElement.textContent =
                progress.missed || 0;
        }


        if (totalElement) {

            totalElement.textContent =
                progress.total_logs || 0;
        }


        if (percentageElement) {

            percentageElement.textContent =
                (
                    progress.completion_percentage ||
                    0
                ) + "%";
        }


    } catch (error) {

        console.error(
            "Progress error:",
            error
        );
    }
}


/* =========================================================
   USER INFORMATION
   ========================================================= */

function displayUserInformation() {

    const user =
        getStoredUser();


    const savedName =
        localStorage.getItem(
            "userName"
        );


    const savedEmail =
        localStorage.getItem(
            "userEmail"
        ) ||
        localStorage.getItem(
            "loginEmail"
        );


    const name =
        user?.name ||
        savedName ||
        "User";


    const email =
        user?.email ||
        savedEmail ||
        "";


    const nameElements =
        document.querySelectorAll(
            ".user-name, #userName, #welcomeName"
        );


    nameElements.forEach(
        function (element) {

            element.textContent =
                name;
        }
    );


    const emailElements =
        document.querySelectorAll(
            ".user-email, #userEmail"
        );


    emailElements.forEach(
        function (element) {

            element.textContent =
                email;
        }
    );
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser() {

    localStorage.removeItem(
        "backendUser"
    );


    localStorage.removeItem(
        "user_id"
    );


    localStorage.removeItem(
        "userId"
    );


    localStorage.removeItem(
        "userName"
    );


    localStorage.removeItem(
        "userEmail"
    );


    localStorage.removeItem(
        "loginEmail"
    );


    localStorage.removeItem(
        "loggedIn"
    );


    window.location.href =
        "index.html";
}


/* =========================================================
   LOGOUT BUTTON
   ========================================================= */

function setupLogout() {

    const buttons =
        document.querySelectorAll(
            "#logoutBtn, .logout-btn, [data-action='logout']"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    logoutUser();
                }
            );
        }
    );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value === null ||
        value === undefined
            ? ""
            : String(value);


    return div.innerHTML;
}


/* =========================================================
   CHECK LOGIN
   ========================================================= */

function checkLogin() {

    const userId =
        getUserId();


    const currentPage =
        window.location.pathname
            .split("/")
            .pop();


    const publicPages = [
        "",
        "index.html",
        "register.html"
    ];


    if (
        !userId &&
        !publicPages.includes(
            currentPage
        )
    ) {

        console.log(
            "User not logged in."
        );

        return false;
    }


    return true;
}


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "AI Habit Coach frontend loaded."
        );


        console.log(
            "Backend:",
            API_BASE_URL
        );


        console.log(
            "User ID:",
            getUserId()
        );


        setupLoginForm();


        setupRegisterForm();


        setupHabitForm();


        setupLogout();


        displayUserInformation();


        /*
           Load habits only when
           habit list exists.
        */

        if (
            document.getElementById(
                "habitsList"
            ) ||
            document.getElementById(
                "habitsContainer"
            ) ||
            document.getElementById(
                "habitList"
            )
        ) {

            loadHabits();
        }


        /*
           Load progress when
           progress elements exist.
        */

        if (
            document.getElementById(
                "completedCount"
            ) ||
            document.getElementById(
                "completionPercentage"
            )
        ) {

            loadProgress();
        }
    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.loginUser =
    loginUser;


window.registerUser =
    registerUser;


window.getHabits =
    getHabits;


window.createHabit =
    createHabit;


window.updateHabit =
    updateHabit;


window.deleteHabitFromBackend =
    deleteHabitFromBackend;


window.createHabitLog =
    createHabitLog;


window.getHabitLogs =
    getHabitLogs;


window.getProgress =
    getProgress;


window.completeHabit =
    completeHabit;


window.removeHabit =
    removeHabit;


window.logoutUser =
    logoutUser;


window.loadHabits =
    loadHabits;


window.loadProgress =
    loadProgress;


window.getUserId =
    getUserId;

/* =========================================================
   AI COACH
   ========================================================= */

async function quickQuestion(question) {

    console.log("Quick Question:", question);

    const userId = getUserId();

    if (!userId) {

        const responseBox =
            document.getElementById("aiResponse");

        if (responseBox) {

            responseBox.innerHTML = `
                <div class="response-title">
                    ⚠️ Login Required
                </div>

                <div class="response-text error">
                    Please login first.
                </div>
            `;
        }

        return;
    }


    const responseBox =
        document.getElementById("aiResponse");


    /* Show loading */

    if (responseBox) {

        responseBox.innerHTML = `
            <div class="response-title">
                🤖 AI Coach
            </div>

            <div class="response-text loading">
                Thinking... ⏳
            </div>
        `;
    }


    try {

        const response =
            await backendRequest(
                "/ai/advice",
                {
                    method: "POST",

                    body: {
                        question: question,
                        user_id: Number(userId)
                    }
                }
            );


        console.log(
            "AI Response:",
            response
        );


        const advice =
            response.advice ||
            response.message ||
            response.response ||
            response.answer ||
            "AI advice received.";


        if (responseBox) {

            responseBox.innerHTML = `
                <div class="response-title">
                    🤖 AI Coach Response
                </div>

                <div class="response-text">
                    ${escapeHtml(advice)}
                </div>
            `;
        }


    } catch (error) {

        console.error(
            "Quick question error:",
            error
        );


        if (responseBox) {

            responseBox.innerHTML = `
                <div class="response-title">
                    ❌ Error
                </div>

                <div class="response-text error">
                    ${escapeHtml(
                        error.message ||
                        "Unable to get AI advice."
                    )}
                </div>
            `;
        }
    }
}


/* =========================================================
   CUSTOM AI QUESTION
   ========================================================= */

async function askAIQuestion() {

    const input =
        document.getElementById("aiQuestion");


    if (!input) {

        console.error(
            "AI question input not found."
        );

        return;
    }


    const question =
        input.value.trim();


    if (!question) {

        const responseBox =
            document.getElementById("aiResponse");


        if (responseBox) {

            responseBox.innerHTML = `
                <div class="response-title">
                    ⚠️ Question Required
                </div>

                <div class="response-text error">
                    Please enter a question.
                </div>
            `;
        }

        return;
    }


    await quickQuestion(question);
}


/* =========================================================
   ENTER KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        const input =
            document.getElementById(
                "aiQuestion"
            );


        if (
            input &&
            document.activeElement === input &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            askAIQuestion();
        }
    }
);


/* =========================================================
   GLOBAL AI FUNCTIONS
   ========================================================= */

window.quickQuestion =
    quickQuestion;


window.askAIQuestion =
    askAIQuestion;


/* =========================================================
   END
   ========================================================= */