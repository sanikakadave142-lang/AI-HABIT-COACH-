// ======================================================
// AI HABIT COACH - FRONTEND SCRIPT
// FastAPI Backend Connected Version
// ======================================================

const API_BASE_URL =
    "https://ai-habit-coach-backend.onrender.com";


// ======================================================
// COMMON BACKEND REQUEST
// ======================================================

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


// ======================================================
// USER STORAGE
// ======================================================

function saveBackendUser(data) {

    /*
        FastAPI response:

        {
            "success": true,
            "message": "Login successful",
            "user": {
                "id": 2,
                "name": "Test User",
                "email": "test123@gmail.com"
            }
        }

        This function supports BOTH:

        data.user.id

        and older format:

        data.user_id
        data.id
    */

    const sourceUser =
        data.user || data;

    const user = {

        id:
            sourceUser.id ||
            sourceUser.user_id,

        name:
            sourceUser.name ||
            "",

        email:
            sourceUser.email ||
            ""
    };


    // Make sure User ID exists

    if (!user.id) {

        console.error(
            "Backend response:",
            data
        );

        throw new Error(
            "User ID was not returned by the backend."
        );
    }


    // Save complete user object

    localStorage.setItem(
        "backendUser",
        JSON.stringify(user)
    );


    // Save user ID

    localStorage.setItem(
        "user_id",
        String(user.id)
    );

    localStorage.setItem(
        "userId",
        String(user.id)
    );


    // Save user details

    localStorage.setItem(
        "userName",
        user.name
    );

    localStorage.setItem(
        "userEmail",
        user.email
    );


    console.log(
        "Backend user saved:",
        user
    );

    console.log(
        "User ID:",
        user.id
    );


    return user;
}


// ======================================================
// GET STORED USER
// ======================================================

function getStoredUser() {

    try {

        const savedUser =
            localStorage.getItem("backendUser");

        if (!savedUser) {
            return null;
        }

        return JSON.parse(savedUser);

    } catch (error) {

        console.error(
            "Error reading stored user:",
            error
        );

        return null;
    }
}


// ======================================================
// GET USER ID
// ======================================================

function getUserId() {

    const user =
        getStoredUser();


    if (user && user.id) {

        return Number(user.id);
    }


    const storedId =
        localStorage.getItem("user_id") ||
        localStorage.getItem("userId");


    if (storedId) {

        return Number(storedId);
    }


    return null;
}


// ======================================================
// REGISTER USER
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
                name: name,
                email: email,
                password: password
            }
        }
    );
}


// ======================================================
// LOGIN USER
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
                email: email,
                password: password
            }
        }
    );
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


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const nameInput =
                document.getElementById("name");

            const emailInput =
                document.getElementById("email");

            const passwordInput =
                document.getElementById("password");


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


            if (!name ||
                !email ||
                !password) {

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
                    "Registration response:",
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


            } catch (error) {

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


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


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
                    ? passwordInput.value
                    : "";


            if (!email ||
                !password) {

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


                // IMPORTANT:
                // Saves FastAPI nested user.id

                const user =
                    saveBackendUser(data);


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


            } catch (error) {

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
// MESSAGE
// ======================================================

function showMessage(
    message,
    isError = false
) {

    let messageBox =
        document.getElementById(
            "message"
        );


    if (!messageBox) {

        messageBox =
            document.getElementById(
                "messageBox"
            );
    }


    if (!messageBox) {

        alert(message);

        return;
    }


    messageBox.textContent =
        message;


    messageBox.style.display =
        "block";


    if (isError) {

        messageBox.style.color =
            "red";

    } else {

        messageBox.style.color =
            "green";
    }
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
        `/habits?user_id=${userId}`
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
            "User ID not found."
        );
    }


    return await backendRequest(
        `/habits?user_id=${userId}`,
        {
            method: "POST",

            body: {
                name: name,
                category: category,
                target: target
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
        `/habits/${habitId}?user_id=${userId}`,
        {
            method: "PUT",

            body: {
                status: status
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
        `/habits/${habitId}?user_id=${userId}`,
        {
            method: "DELETE"
        }
    );
}


// ======================================================
// CREATE HABIT LOG
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


    return await backendRequest(
        `/habit-log?user_id=${userId}`,
        {
            method: "POST",

            body: {

                habit_id:
                    Number(habitId),

                status:
                    status,

                duration:
                    Number(duration) || 0,

                note:
                    note
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
        `/habit-log?user_id=${userId}`
    );
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
        `/progress?user_id=${userId}`
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


    } catch (error) {

        console.error(
            "Complete habit error:",
            error
        );


        alert(
            error.message
        );
    }
}


// ======================================================
// LOAD HABITS
// ======================================================

async function loadHabits() {

    const container =
        document.getElementById(
            "habitsContainer"
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


        const habits =
            data.habits ||
            data.data ||
            data;


        container.innerHTML =
            "";


        if (!Array.isArray(habits) ||
            habits.length === 0) {

            container.innerHTML =
                "<p>No habits found.</p>";

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


                card.innerHTML = `

                    <h3>
                        ${habit.name || "Habit"}
                    </h3>

                    <p>
                        Category:
                        ${habit.category || "-"}
                    </p>

                    <p>
                        Target:
                        ${habit.target || "-"}
                    </p>

                    <p>
                        Status:
                        ${habit.status || "Pending"}
                    </p>

                    <button
                        onclick="completeHabit(${habit.id})"
                    >
                        Complete
                    </button>

                    <button
                        onclick="deleteHabit(${habit.id})"
                    >
                        Delete
                    </button>

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


        container.innerHTML =
            `<p>${error.message}</p>`;
    }
}


// ======================================================
// DELETE HABIT
// ======================================================

async function deleteHabit(
    habitId
) {

    if (!confirm(
        "Are you sure you want to delete this habit?"
    )) {

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


    } catch (error) {

        console.error(
            "Delete habit error:",
            error
        );


        alert(
            error.message
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


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const nameInput =
                document.getElementById(
                    "habitName"
                );

            const categoryInput =
                document.getElementById(
                    "habitCategory"
                );

            const targetInput =
                document.getElementById(
                    "habitTarget"
                );


            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";

            const category =
                categoryInput
                    ? categoryInput.value.trim()
                    : "";

            const target =
                targetInput
                    ? targetInput.value.trim()
                    : "";


            if (!name) {

                alert(
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


                alert(
                    "Habit added successfully!"
                );


                form.reset();


                await loadHabits();


            } catch (error) {

                console.error(
                    "Create habit error:",
                    error
                );


                alert(
                    error.message
                );
            }

        }
    );
}


// ======================================================
// LOAD PROGRESS
// ======================================================

async function loadProgress() {

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
            "totalCount"
        );

    const percentageElement =
        document.getElementById(
            "completionPercentage"
        );


    if (!completedElement &&
        !missedElement &&
        !totalElement &&
        !percentageElement) {

        return;
    }


    try {

        const data =
            await getProgress();


        console.log(
            "Progress response:",
            data
        );


        if (completedElement) {

            completedElement.textContent =
                data.completed || 0;
        }


        if (missedElement) {

            missedElement.textContent =
                data.missed || 0;
        }


        if (totalElement) {

            totalElement.textContent =
                data.total_logs || 0;
        }


        if (percentageElement) {

            percentageElement.textContent =
                `${data.completion_percentage || 0}%`;
        }


    } catch (error) {

        console.error(
            "Progress error:",
            error
        );
    }
}


// ======================================================
// DISPLAY USER INFORMATION
// ======================================================

function displayUserInformation() {

    const user =
        getStoredUser();


    if (!user) {
        return;
    }


    const nameElements =
        document.querySelectorAll(
            ".user-name"
        );


    nameElements.forEach(
        function (element) {

            element.textContent =
                user.name || "";
        }
    );


    const emailElements =
        document.querySelectorAll(
            ".user-email"
        );


    emailElements.forEach(
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


// ======================================================
// LOGIN CHECK
// ======================================================

function checkLogin() {

    const publicPages = [
        "index.html",
        "register.html",
        ""
    ];


    const currentPage =
        window.location.pathname
            .split("/")
            .pop();


    if (publicPages.includes(
        currentPage
    )) {

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
// AI ADVICE
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
                    userId
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


        console.log(
            "AI response:",
            response
        );


        const answer =
            response.advice ||
            response.message ||
            response.response ||
            response.answer ||
            "No response received.";


        if (result) {

            result.textContent =
                answer;
        }


    } catch (error) {

        console.error(
            "AI error:",
            error
        );


        if (result) {

            result.textContent =
                error.message;
        }
    }
}


// ======================================================
// GLOBAL FUNCTIONS
// ======================================================

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


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "AI Habit Coach loaded."
        );

        console.log(
            "API:",
            API_BASE_URL
        );


        setupLoginForm();

        setupRegisterForm();

        setupHabitForm();


        displayUserInformation();


        // Only check login on
        // protected pages

        const currentPage =
            window.location.pathname
                .split("/")
                .pop();


        const protectedPages = [
            "dashboard.html",
            "habits.html",
            "progress.html",
            "ai-coach.html",
            "admin.html"
        ];


        if (
            protectedPages.includes(
                currentPage
            )
        ) {

            if (!checkLogin()) {
                return;
            }
        }


        // Load habits if page has
        // habits container

        if (
            document.getElementById(
                "habitsContainer"
            )
        ) {

            loadHabits();
        }


        // Load progress if page
        // contains progress elements

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