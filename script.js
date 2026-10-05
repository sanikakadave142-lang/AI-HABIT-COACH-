// ======================================================
// AI HABIT COACH - FRONTEND SCRIPT
// FastAPI Backend Connected Version
// Error-Free Version
// ======================================================

const API_BASE_URL =
    "https://ai-habit-coach-backend.onrender.com";


// ======================================================
// COMMON BACKEND REQUEST
// ======================================================

async function backendRequest(endpoint, options = {}) {

    try {

        const config = {
            method: options.method || "GET",
            headers: {
                "Content-Type": "application/json"
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
        }
        catch (jsonError) {

            data = {
                message:
                    "Invalid response received from backend."
            };
        }


        // ==================================================
        // BACKEND ERROR HANDLING
        // ==================================================

        if (!response.ok) {

            let errorMessage =
                "Something went wrong.";

            // FastAPI detail as string
            if (
                typeof data.detail === "string"
            ) {

                errorMessage =
                    data.detail;
            }

            // FastAPI validation errors
            else if (
                Array.isArray(data.detail)
            ) {

                errorMessage =
                    data.detail
                        .map(function (item) {

                            if (
                                item &&
                                typeof item.msg === "string"
                            ) {
                                return item.msg;
                            }

                            return JSON.stringify(item);
                        })
                        .join(", ");
            }

            // Backend message
            else if (
                data.message !== undefined
            ) {

                if (
                    typeof data.message === "string"
                ) {

                    errorMessage =
                        data.message;

                } else {

                    errorMessage =
                        JSON.stringify(
                            data.message
                        );
                }
            }

            // Generic error
            else if (
                data.error !== undefined
            ) {

                if (
                    typeof data.error === "string"
                ) {

                    errorMessage =
                        data.error;

                } else {

                    errorMessage =
                        JSON.stringify(
                            data.error
                        );
                }
            }

            throw new Error(
                errorMessage
            );
        }

        return data;

    }
    catch (error) {

        console.error(
            "Backend Request Error:",
            error
        );

        // Network error
        if (
            error instanceof TypeError
        ) {

            throw new Error(
                "Unable to connect to backend. Please check your internet connection."
            );
        }

        // Already formatted error
        throw error;
    }
}


// ======================================================
// USER STORAGE
// ======================================================

function saveBackendUser(data) {

    const sourceUser =
        data &&
        data.user
            ? data.user
            : data;

    if (
        !sourceUser ||
        typeof sourceUser !== "object"
    ) {

        throw new Error(
            "Invalid user data received from backend."
        );
    }

    const userId =
        sourceUser.id !== undefined
            ? sourceUser.id
            : sourceUser.user_id;

    if (
        userId === undefined ||
        userId === null
    ) {

        throw new Error(
            "User ID was not returned by the backend."
        );
    }

    const user = {

        id:
            Number(userId),

        name:
            sourceUser.name || "",

        email:
            sourceUser.email || ""
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


// ======================================================
// GET STORED USER
// ======================================================

function getStoredUser() {

    try {

        const savedUser =
            localStorage.getItem(
                "backendUser"
            );

        if (savedUser) {

            const user =
                JSON.parse(savedUser);

            if (
                user &&
                user.id !== undefined
            ) {

                return user;
            }
        }

    }
    catch (error) {

        console.error(
            "User storage error:",
            error
        );
    }

    return null;
}


// ======================================================
// GET USER ID
// ======================================================

function getUserId() {

    const user =
        getStoredUser();

    if (
        user &&
        user.id !== undefined &&
        user.id !== null
    ) {

        return Number(user.id);
    }

    const storedId =
        localStorage.getItem(
            "user_id"
        ) ||
        localStorage.getItem(
            "userId"
        );

    if (storedId) {

        const id =
            Number(storedId);

        if (!isNaN(id)) {
            return id;
        }
    }

    return null;
}


// ======================================================
// REGISTER
// ======================================================

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

                name:
                    name,

                email:
                    email,

                password:
                    password
            }
        }
    );
}


// ======================================================
// LOGIN
// ======================================================

async function loginUser(
    email,
    password
) {

    return await backendRequest(
        "/login",
        {
            method: "POST",

            body: {

                email:
                    email,

                password:
                    password
            }
        }
    );
}


// ======================================================
// MESSAGE
// ======================================================

function showMessage(
    message,
    isError = false
) {

    let box =
        document.getElementById(
            "message"
        );

    if (!box) {

        box =
            document.getElementById(
                "messageBox"
            );
    }

    if (!box) {

        alert(
            String(message)
        );

        return;
    }

    box.textContent =
        String(message);

    box.style.display =
        "block";

    box.style.color =
        isError
            ? "red"
            : "green";
}


// ======================================================
// REGISTER FORM
// ======================================================

function setupRegisterForm() {

    const form =
        document.getElementById(
            "registerForm"
        );

    if (!form) {
        return;
    }

    if (
        form.dataset.registerReady ===
        "true"
    ) {
        return;
    }

    form.dataset.registerReady =
        "true";


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "name"
                )?.value.trim() || "";


            const email =
                document.getElementById(
                    "email"
                )?.value.trim() || "";


            const password =
                document.getElementById(
                    "password"
                )?.value || "";


            if (
                !name ||
                !email ||
                !password
            ) {

                showMessage(
                    "Please fill all fields.",
                    true
                );

                return;
            }


            try {

                const data =
                    await registerUser(
                        name,
                        email,
                        password
                    );


                console.log(
                    "Registration:",
                    data
                );


                showMessage(
                    data.message ||
                    "Registration successful!"
                );


                form.reset();


                setTimeout(
                    function () {

                        window.location.href =
                            "index.html";

                    },
                    1000
                );

            }
            catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Registration failed.",
                    true
                );
            }
        }
    );
}


// ======================================================
// LOGIN FORM
// ======================================================

function setupLoginForm() {

    const form =
        document.getElementById(
            "loginForm"
        );

    if (!form) {
        return;
    }

    if (
        form.dataset.loginReady ===
        "true"
    ) {
        return;
    }

    form.dataset.loginReady =
        "true";


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "email"
                )?.value.trim() || "";


            const password =
                document.getElementById(
                    "password"
                )?.value || "";


            if (
                !email ||
                !password
            ) {

                showMessage(
                    "Please enter email and password.",
                    true
                );

                return;
            }


            try {

                const data =
                    await loginUser(
                        email,
                        password
                    );


                console.log(
                    "Login response:",
                    data
                );


                const user =
                    saveBackendUser(
                        data
                    );


                console.log(
                    "Logged in user:",
                    user
                );


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
                    500
                );

            }
            catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Invalid email or password.",
                    true
                );
            }
        }
    );
}


// ======================================================
// GET HABITS
// ======================================================

async function getHabits() {

    const userId =
        getUserId();


    if (!userId) {

        throw new Error(
            "User ID not found. Please login again."
        );
    }


    return await backendRequest(
        "/habits?user_id=" +
        encodeURIComponent(userId)
    );
}


// ======================================================
// CREATE HABIT
// ======================================================

async function createHabit(
    name,
    category,
    target
) {

    const userId =
        getUserId();


    if (!userId) {

        throw new Error(
            "User ID not found. Please login again."
        );
    }


    return await backendRequest(
        "/habits?user_id=" +
        encodeURIComponent(userId),

        {
            method: "POST",

            body: {

                name:
                    name,

                category:
                    category,

                target:
                    target,

                // IMPORTANT
                // FastAPI HabitCreate requires user_id
                user_id:
                    Number(userId)
            }
        }
    );
}


// ======================================================
// UPDATE HABIT
// ======================================================

async function updateHabit(
    habitId,
    status
) {

    const userId =
        getUserId();


    if (!userId) {

        throw new Error(
            "User ID not found."
        );
    }


    return await backendRequest(
        "/habits/" +
        encodeURIComponent(habitId) +
        "?user_id=" +
        encodeURIComponent(userId),

        {
            method: "PUT",

            body: {

                status:
                    status
            }
        }
    );
}


// ======================================================
// DELETE HABIT
// ======================================================

async function deleteHabitFromBackend(
    habitId
) {

    const userId =
        getUserId();


    if (!userId) {

        throw new Error(
            "User ID not found."
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


// ======================================================
// HABIT LOG
// ======================================================

async function createHabitLog(
    habitId,
    status,
    duration = 0,
    note = ""
) {

    const userId =
        getUserId();


    if (!userId) {

        throw new Error(
            "User ID not found."
        );
    }


    // Current date: YYYY-MM-DD
    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    return await backendRequest(
        "/habit-log?user_id=" +
        encodeURIComponent(userId),

        {
            method: "POST",

            body: {

                user_id:
                    Number(userId),

                habit_id:
                    Number(habitId),

                date:
                    today,

                status:
                    status,

                duration:
                    Number(duration) || 0,

                note:
                    note || ""
            }
        }
    );
}


// ======================================================
// GET HABIT LOGS
// ======================================================

async function getHabitLogs() {

    const userId =
        getUserId();


    if (!userId) {

        throw new Error(
            "User ID not found."
        );
    }


    return await backendRequest(
        "/habit-log?user_id=" +
        encodeURIComponent(userId)
    );
}


// ======================================================
// COMPLETE HABIT
// ======================================================

async function completeHabit(
    habitId
) {

    try {

        await updateHabit(
            habitId,
            "Completed"
        );


        await createHabitLog(
            habitId,
            "Completed",
            0,
            ""
        );


        await loadHabits();


        alert(
            "Habit completed successfully!"
        );

    }
    catch (error) {

        console.error(
            "Complete habit error:",
            error
        );


        alert(
            error.message ||
            "Unable to complete habit."
        );
    }
}


// ======================================================
// LOAD HABITS
// ======================================================

async function loadHabits() {

    const container =
        document.getElementById(
            "habitsList"
        );


    if (!container) {
        return;
    }


    try {

        const data =
            await getHabits();


        console.log(
            "Habits response:",
            data
        );


        let habits = [];


        if (
            Array.isArray(data)
        ) {

            habits =
                data;

        }
        else if (
            Array.isArray(data.habits)
        ) {

            habits =
                data.habits;

        }
        else if (
            Array.isArray(data.data)
        ) {

            habits =
                data.data;

        }
        else {

            habits = [];
        }


        container.innerHTML =
            "";


        if (
            habits.length === 0
        ) {

            container.innerHTML = `
                <div class="empty-state">
                    <h3>No activities found</h3>
                    <p>
                        Add your first activity above.
                    </p>
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
                    "activity-card";


                const status =
                    typeof habit.status ===
                    "string"
                        ? habit.status
                        : "Pending";


                const isCompleted =
                    status.toLowerCase() ===
                    "completed";


                const habitName =
                    habit.name || "Activity";


                const category =
                    habit.category || "-";


                const target =
                    habit.target || "-";


                const habitId =
                    Number(habit.id);


                card.innerHTML = `

                    <div class="activity-top">

                        <div>

                            <h3>
                                ${escapeHTML(
                                    habitName
                                )}
                            </h3>

                            <span class="category-badge">
                                ${escapeHTML(
                                    category
                                )}
                            </span>

                        </div>


                        <span
                            class="status-badge ${
                                isCompleted
                                    ? "completed"
                                    : "pending"
                            }"
                        >
                            ${escapeHTML(
                                status
                            )}
                        </span>

                    </div>


                    <div class="activity-info">

                        <p>
                            🎯
                            <strong>Goal:</strong>
                            ${escapeHTML(
                                String(target)
                            )}
                        </p>

                    </div>


                    <div class="activity-buttons">

                        ${
                            !isCompleted
                                ? `
                                    <button
                                        class="complete-btn"
                                        onclick="completeHabit(${habitId})"
                                    >
                                        ✓ Complete
                                    </button>
                                  `
                                : ""
                        }


                        <button
                            class="delete-btn"
                            onclick="deleteHabit(${habitId})"
                        >
                            🗑 Delete
                        </button>

                    </div>
                `;


                container.appendChild(
                    card
                );
            }
        );

    }
    catch (error) {

        console.error(
            "Load habits error:",
            error
        );


        container.innerHTML = `

            <div class="empty-state">

                <p style="color:red;">

                    ${escapeHTML(
                        error.message ||
                        "Unable to load habits."
                    )}

                </p>

            </div>
        `;
    }
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(value);

    return div.innerHTML;
}


// ======================================================
// DELETE HABIT
// ======================================================

async function deleteHabit(
    habitId
) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this habit?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        await deleteHabitFromBackend(
            habitId
        );


        await loadHabits();


        alert(
            "Habit deleted successfully!"
        );

    }
    catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete habit."
        );
    }
}


// ======================================================
// HABIT FORM
// ======================================================

function setupHabitForm() {

    const form =
        document.getElementById(
            "habitForm"
        );


    if (!form) {
        return;
    }


    if (
        form.dataset.habitReady ===
        "true"
    ) {
        return;
    }


    form.dataset.habitReady =
        "true";


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "habitName"
                )?.value.trim() || "";


            const categorySelect =
                document.getElementById(
                    "habitCategory"
                );


            const goalSelect =
                document.getElementById(
                    "habitGoalSelect"
                );


            const customGoal =
                document.getElementById(
                    "habitGoal"
                );


            const otherCategory =
                document.getElementById(
                    "otherCategory"
                );


            let category =
                categorySelect
                    ? categorySelect.value
                    : "";


            let target =
                goalSelect
                    ? goalSelect.value
                    : "";


            // Other category

            if (
                category === "Other"
            ) {

                category =
                    otherCategory
                        ? otherCategory.value.trim()
                        : "";
            }


            // Other goal

            if (
                target === "Other"
            ) {

                target =
                    customGoal
                        ? customGoal.value.trim()
                        : "";
            }


            if (!name) {

                alert(
                    "Please enter activity name."
                );

                return;
            }


            if (!category) {

                alert(
                    "Please select category."
                );

                return;
            }


            if (!target) {

                alert(
                    "Please select goal / time."
                );

                return;
            }


            try {

                console.log(
                    "Creating activity:",
                    {
                        name:
                            name,

                        category:
                            category,

                        target:
                            target
                    }
                );


                const response =
                    await createHabit(
                        name,
                        category,
                        target
                    );


                console.log(
                    "Create response:",
                    response
                );


                alert(
                    "Activity added successfully!"
                );


                form.reset();


                if (customGoal) {

                    customGoal.style.display =
                        "none";

                    customGoal.required =
                        false;

                    customGoal.value =
                        "";
                }


                if (otherCategory) {

                    otherCategory.style.display =
                        "none";

                    otherCategory.required =
                        false;

                    otherCategory.value =
                        "";
                }


                await loadHabits();

            }
            catch (error) {

                console.error(
                    "Create activity error:",
                    error
                );


                alert(
                    error.message ||
                    "Failed to add activity."
                );
            }
        }
    );


    // ==================================================
    // GOAL SELECT
    // ==================================================

    const goalSelect =
        document.getElementById(
            "habitGoalSelect"
        );


    const customGoal =
        document.getElementById(
            "habitGoal"
        );


    if (
        goalSelect &&
        customGoal
    ) {

        goalSelect.addEventListener(
            "change",
            function () {

                if (
                    this.value ===
                    "Other"
                ) {

                    customGoal.style.display =
                        "block";

                    customGoal.required =
                        true;

                }
                else {

                    customGoal.style.display =
                        "none";

                    customGoal.required =
                        false;

                    customGoal.value =
                        "";
                }
            }
        );
    }


    // ==================================================
    // CATEGORY SELECT
    // ==================================================

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
                    this.value ===
                    "Other"
                ) {

                    otherCategory.style.display =
                        "block";

                    otherCategory.required =
                        true;

                }
                else {

                    otherCategory.style.display =
                        "none";

                    otherCategory.required =
                        false;

                    otherCategory.value =
                        "";
                }
            }
        );
    }
}


// ======================================================
// GET PROGRESS
// ======================================================

async function getProgress() {

    const userId =
        getUserId();


    if (!userId) {

        throw new Error(
            "User ID not found."
        );
    }


    return await backendRequest(
        "/progress?user_id=" +
        encodeURIComponent(userId)
    );
}


// ======================================================
// LOAD PROGRESS
// ======================================================

async function loadProgress() {

    const completed =
        document.getElementById(
            "completedCount"
        );


    const missed =
        document.getElementById(
            "missedCount"
        );


    const total =
        document.getElementById(
            "totalCount"
        );


    const percentage =
        document.getElementById(
            "completionPercentage"
        );


    if (
        !completed &&
        !missed &&
        !total &&
        !percentage
    ) {

        return;
    }


    try {

        const data =
            await getProgress();


        console.log(
            "Progress:",
            data
        );


        if (completed) {

            completed.textContent =
                data.completed || 0;
        }


        if (missed) {

            missed.textContent =
                data.missed || 0;
        }


        if (total) {

            total.textContent =
                data.total_logs || 0;
        }


        if (percentage) {

            percentage.textContent =
                (
                    data.completion_percentage ||
                    0
                ) + "%";
        }

    }
    catch (error) {

        console.error(
            "Progress error:",
            error
        );
    }
}


// ======================================================
// USER INFORMATION
// ======================================================

function displayUserInformation() {

    const user =
        getStoredUser();


    if (!user) {
        return;
    }


    document
        .querySelectorAll(
            ".user-name"
        )
        .forEach(
            function (element) {

                element.textContent =
                    user.name || "";
            }
        );


    document
        .querySelectorAll(
            ".user-email"
        )
        .forEach(
            function (element) {

                element.textContent =
                    user.email || "";
            }
        );


    const nameElement =
        document.getElementById(
            "userName"
        );


    if (nameElement) {

        nameElement.textContent =
            user.name || "";
    }


    const emailElement =
        document.getElementById(
            "userEmail"
        );


    if (emailElement) {

        emailElement.textContent =
            user.email || "";
    }
}


// ======================================================
// LOGOUT
// ======================================================

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


// Support existing onclick="logout()"

function logout() {

    logoutUser();
}


// ======================================================
// LOGIN CHECK
// ======================================================

function checkLogin() {

    const page =
        window.location.pathname
            .split("/")
            .pop();


    const publicPages = [

        "",

        "index.html",

        "register.html"
    ];


    if (
        publicPages.includes(page)
    ) {

        return true;
    }


    const userId =
        getUserId();


    if (!userId) {

        window.location.href =
            "index.html";

        return false;
    }


    return true;
}


// ======================================================
// AI
// ======================================================

async function quickQuestion(
    question
) {

    const userId =
        getUserId();


    if (!userId) {

        throw new Error(
            "Please login first."
        );
    }


    return await backendRequest(
        "/ai/advice",

        {
            method: "POST",

            body: {

                question:
                    question,

                user_id:
                    Number(userId)
            }
        }
    );
}


// ======================================================
// ASK AI QUESTION
// ======================================================

async function askAIQuestion() {

    const input =
        document.getElementById(
            "aiQuestion"
        );


    const result =
        document.getElementById(
            "aiResponse"
        );


    if (!input) {
        return;
    }


    const question =
        input.value.trim();


    if (!question) {

        if (result) {

            result.textContent =
                "Please enter your question.";
        }

        return;
    }


    try {

        if (result) {

            result.textContent =
                "AI is thinking...";
        }


        const response =
            await quickQuestion(
                question
            );


        const answer =
            response.advice ||
            response.message ||
            response.response ||
            response.answer ||
            "No response received.";


        if (result) {

            result.textContent =
                typeof answer ===
                "string"
                    ? answer
                    : JSON.stringify(
                        answer
                    );
        }

    }
    catch (error) {

        console.error(
            "AI error:",
            error
        );


        if (result) {

            result.textContent =
                error.message ||
                "Unable to get AI response.";
        }
    }
}


// ======================================================
// GLOBAL FUNCTIONS
// ======================================================

window.logout =
    logout;


window.logoutUser =
    logoutUser;


window.completeHabit =
    completeHabit;


window.deleteHabit =
    deleteHabit;


window.askAIQuestion =
    askAIQuestion;


window.quickQuestion =
    quickQuestion;


window.loadHabits =
    loadHabits;


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "AI Habit Coach loaded"
        );


        console.log(
            "Backend:",
            API_BASE_URL
        );


        setupLoginForm();

        setupRegisterForm();

        setupHabitForm();

        displayUserInformation();


        const currentPage =
            window.location.pathname
                .split("/")
                .pop();


        const protectedPages = [

            "dashboard.html",

            "habits.html",

            "progress.html",

            "ai-coach.html"
        ];


        if (
            protectedPages.includes(
                currentPage
            )
        ) {

            if (
                !checkLogin()
            ) {

                return;
            }
        }


        // ==================================================
        // HABITS PAGE
        // ==================================================

        if (
            document.getElementById(
                "habitsList"
            )
        ) {

            loadHabits();
        }


        // ==================================================
        // PROGRESS PAGE
        // ==================================================

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

// ===============================
// QUICK QUESTION FUNCTION
// ===============================

function quickQuestion(question) {

    const input = document.getElementById("aiQuestion");

    if (!input) {
        console.error("AI question input not found");
        return;
    }

    // Put selected question into input box
    input.value = question;

    // Focus the input
    input.focus();

    // Highlight the selected question box
    input.style.borderColor = "#8b5cf6";
    input.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.45)";

    // Remove highlight after 1.5 seconds
    setTimeout(() => {
        input.style.borderColor = "";
        input.style.boxShadow = "";
    }, 1500);
}