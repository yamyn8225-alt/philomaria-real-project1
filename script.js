// =====================================================
// PHILOMARIA - MAIN JAVASCRIPT
// =====================================================


// =====================================================
// HELPERS
// =====================================================

function getStorage(key) {

    const data = localStorage.getItem(key);

    if (!data) {
        return null;
    }

    try {

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Storage read error:",
            error
        );

        return null;
    }
}


function setStorage(key, value) {

    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}


function clearSession() {

    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
}


function logout() {

    clearSession();

    window.location.href = "login.html";
}


function redirectUserByRole(user) {

    if (!user || !user.role) {

        logout();
        return;
    }


    if (user.role === "student") {

        window.location.href = "student.html";
        return;
    }


    if (user.role === "teacher") {

        window.location.href = "teacher.html";
        return;
    }


    if (user.role === "admin") {

        window.location.href = "admin.html";
        return;
    }


    logout();
}


// =====================================================
// CURRENT PAGE
// =====================================================

const currentPage =
    window.location.pathname
        .split("/")
        .pop();


// =====================================================
// GET CURRENT USER FROM BACKEND
//
// DATABASE = SOURCE OF TRUTH
// =====================================================

async function getCurrentUserFromServer() {

    const token =
        localStorage.getItem("token");


    if (!token) {
        return null;
    }


    try {

        const response =
            await fetch(
                API_URL + "/auth/me",
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        if (response.status === 401) {

            clearSession();

            return null;
        }


        if (response.status === 403) {

            clearSession();

            alert(
                data.message ||
                "هذا الحساب غير متاح حاليًا."
            );

            return null;
        }


        if (
            !response.ok ||
            !data.user
        ) {

            console.error(
                "Current user response error:",
                data
            );

            return null;
        }


        const user =
            data.user;


        setStorage(
            "currentUser",
            user
        );


        return user;

    } catch (error) {

        console.error(
            "Get current user error:",
            error
        );

        return null;
    }
}


// =====================================================
// REGISTER
// =====================================================

const registerForm =
    document.getElementById(
        "register-form"
    );


if (registerForm) {

    registerForm.addEventListener(
        "submit",

        async function (event) {

            event.preventDefault();


            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const studyYear =
                document
                    .getElementById("study-year")
                    .value;


            const studyTerm =
                document
                    .getElementById("study-term")
                    .value;


            const churchName =
                document
                    .getElementById("church-name")
                    .value
                    .trim();


            // =========================================
            // VALIDATION
            // =========================================

            if (!username) {

                alert(
                    "اكتب اسم المستخدم."
                );

                return;
            }


            if (!email) {

                alert(
                    "اكتب البريد الإلكتروني."
                );

                return;
            }


            if (!phone) {

                alert(
                    "اكتب رقم التليفون."
                );

                return;
            }


            if (!password) {

                alert(
                    "اكتب كلمة المرور."
                );

                return;
            }


            if (!studyYear) {

                alert(
                    "اختر السنة الدراسية."
                );

                return;
            }


            if (!studyTerm) {

                alert(
                    "اختر الترم."
                );

                return;
            }


            if (!churchName) {

                alert(
                    "اكتب اسم الكنيسة."
                );

                return;
            }


            const registerButton =
                document.getElementById(
                    "register-button"
                );


            try {

                if (registerButton) {

                    registerButton.disabled =
                        true;

                    registerButton.textContent =
                        "جاري إنشاء الحساب...";
                }


                const response =
                    await fetch(
                        API_URL + "/auth/register",
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    username:
                                        username,

                                    email:
                                        email,

                                    phone:
                                        phone,

                                    password:
                                        password,

                                    studyYear:
                                        studyYear,

                                    studyTerm:
                                        studyTerm,

                                    churchName:
                                        churchName
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "حدث خطأ أثناء إنشاء الحساب."
                    );

                    return;
                }


                alert(
                    data.message ||
                    "تم إنشاء الحساب بنجاح وهو الآن في انتظار موافقة الإدارة."
                );


                registerForm.reset();


                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Register error:",
                    error
                );


                alert(
                    "تعذر الاتصال بالسيرفر. تأكد أن الـ Backend يعمل."
                );

            } finally {

                if (registerButton) {

                    registerButton.disabled =
                        false;

                    registerButton.textContent =
                        "إنشاء حساب";
                }
            }
        }
    );
}


// =====================================================
// LOGIN
// =====================================================

const loginForm =
    document.getElementById(
        "login-form"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",

        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("login-email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("login-password")
                    .value;


            if (!email) {

                alert(
                    "اكتب البريد الإلكتروني."
                );

                return;
            }


            if (!password) {

                alert(
                    "اكتب كلمة المرور."
                );

                return;
            }


            const loginButton =
                document.getElementById(
                    "login-button"
                );


            try {

                if (loginButton) {

                    loginButton.disabled =
                        true;

                    loginButton.textContent =
                        "جاري تسجيل الدخول...";
                }


                const response =
                    await fetch(
                        API_URL + "/auth/login",
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email:
                                        email,

                                    password:
                                        password
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "فشل تسجيل الدخول."
                    );

                    return;
                }


                // =====================================
                // SAVE TOKEN
                // =====================================

                localStorage.setItem(
                    "token",
                    data.token
                );


                // =====================================
                // SAVE USER CACHE
                // =====================================

                setStorage(
                    "currentUser",
                    data.user
                );


                // =====================================
                // REDIRECT BASED ON ROLE
                // =====================================

                redirectUserByRole(
                    data.user
                );

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                alert(
                    "تعذر الاتصال بالسيرفر. تأكد أن الـ Backend يعمل."
                );

            } finally {

                if (loginButton) {

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "تسجيل دخول";
                }
            }
        }
    );
}


// =====================================================
// GOOGLE LOGIN
// =====================================================

const googleLoginButton =
    document.getElementById(
        "google-login-button"
    );


if (googleLoginButton) {

    googleLoginButton.addEventListener(
        "click",

        function () {

            alert(
                "تسجيل Google يحتاج ربط Firebase Authentication أولاً."
            );
        }
    );
}


// =====================================================
// STUDENT PAGE ELEMENTS
// =====================================================

const welcomeMessage =
    document.getElementById(
        "welcome-message"
    );


const studentStudyYear =
    document.getElementById(
        "student-study-year"
    );


const studentStudyTerm =
    document.getElementById(
        "student-study-term"
    );


const studentCoursesContainer =
    document.getElementById(
        "student-courses-container"
    );


// =====================================================
// PROFILE PAGE ELEMENTS
// =====================================================

const profileName =
    document.getElementById(
        "profile-name"
    );


const profileEmail =
    document.getElementById(
        "profile-email"
    );


const profilePhone =
    document.getElementById(
        "profile-phone"
    );


const profileImage =
    document.getElementById(
        "profile-image"
    );


const profileStudyYear =
    document.getElementById(
        "profile-study-year"
    );


const profileStudyTerm =
    document.getElementById(
        "profile-study-term"
    );


const profileChurchName =
    document.getElementById(
        "profile-church-name"
    );


// =====================================================
// STUDENT / PROFILE PAGE SECURITY
// =====================================================

const protectedStudentPages = [
    "student.html",
    "profile.html"
];


async function initializeStudentArea() {

    if (
        !protectedStudentPages.includes(
            currentPage
        )
    ) {

        return;
    }


    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    const user =
        await getCurrentUserFromServer();


    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    // =============================================
    // STUDENT PAGES ARE STUDENT ONLY
    // =============================================

    if (user.role !== "student") {

        redirectUserByRole(
            user
        );

        return;
    }


    // =============================================
    // STUDENT DASHBOARD
    // =============================================

    if (
        currentPage ===
        "student.html"
    ) {

        renderStudentInformation(
            user
        );


        await loadStudentCourses();
    }


    // =============================================
    // PROFILE
    // =============================================

    if (
        currentPage ===
        "profile.html"
    ) {

        renderStudentProfile(
            user
        );
    }
}


// =====================================================
// RENDER STUDENT INFORMATION
// =====================================================

function renderStudentInformation(user) {

    const yearNames = {

        "1":
            "السنة الأولى",

        "2":
            "السنة الثانية",

        "3":
            "السنة الثالثة"
    };


    const termNames = {

        "1":
            "الترم الأول",

        "2":
            "الترم الثاني",

        "3":
            "الترم الثالث"
    };


    if (welcomeMessage) {

        welcomeMessage.textContent =
            "أهلاً بك، " +
            (
                user.username ||
                ""
            );
    }


    if (studentStudyYear) {

        studentStudyYear.textContent =
            yearNames[
                String(
                    user.studyYear
                )
            ] || "-";
    }


    if (studentStudyTerm) {

        studentStudyTerm.textContent =
            termNames[
                String(
                    user.studyTerm
                )
            ] || "-";
    }
}


// =====================================================
// RENDER STUDENT PROFILE
// =====================================================

function renderStudentProfile(user) {

    const yearNames = {

        "1":
            "السنة الأولى",

        "2":
            "السنة الثانية",

        "3":
            "السنة الثالثة"
    };


    const termNames = {

        "1":
            "الترم الأول",

        "2":
            "الترم الثاني",

        "3":
            "الترم الثالث"
    };


    if (profileName) {

        profileName.textContent =
            user.username ||
            "-";
    }


    if (profileEmail) {

        profileEmail.textContent =
            user.email ||
            "-";
    }


    if (profilePhone) {

        profilePhone.textContent =
            user.phone ||
            "-";
    }


    if (
        profileImage &&
        user.image
    ) {

        profileImage.src =
            user.image;
    }


    if (profileStudyYear) {

        profileStudyYear.textContent =
            yearNames[
                String(
                    user.studyYear
                )
            ] || "-";
    }


    if (profileStudyTerm) {

        profileStudyTerm.textContent =
            termNames[
                String(
                    user.studyTerm
                )
            ] || "-";
    }


    if (profileChurchName) {

        profileChurchName.textContent =
            user.churchName ||
            "-";
    }
}


// =====================================================
// LOGOUT BUTTON
// =====================================================

const logoutButton =
    document.getElementById(
        "logout-button"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );
}


// =====================================================
// DELETE ACCOUNT
// =====================================================

const deleteAccountButton =
    document.getElementById(
        "delete-account-button"
    );


if (deleteAccountButton) {

    deleteAccountButton.addEventListener(
        "click",

        async function () {

            // =====================================
            // FIRST CONFIRMATION
            // =====================================

            const confirmed =
                confirm(
                    "هل أنت متأكد أنك تريد حذف الحساب نهائيًا؟ لا يمكن التراجع عن هذه العملية."
                );


            if (!confirmed) {
                return;
            }


            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                logout();

                return;
            }


            const oldText =
                deleteAccountButton
                    .textContent;


            try {

                // =================================
                // DISABLE BUTTON
                // =================================

                deleteAccountButton.disabled =
                    true;


                deleteAccountButton.textContent =
                    "جاري حذف الحساب...";


                // =================================
                // DELETE ACCOUNT FROM BACKEND
                // =================================

                const response =
                    await fetch(
                        API_URL + "/profile",
                        {
                            method:
                                "DELETE",

                            headers: {

                                "Authorization":
                                    "Bearer " +
                                    token
                            }
                        }
                    );


                const data =
                    await response.json();


                // =================================
                // TOKEN EXPIRED
                // =================================

                if (
                    response.status ===
                    401
                ) {

                    logout();

                    return;
                }


                // =================================
                // DELETE ERROR
                // =================================

                if (!response.ok) {

                    alert(
                        data.message ||
                        "تعذر حذف الحساب."
                    );

                    return;
                }


                // =================================
                // DELETE SUCCESS
                // =================================

                clearSession();


                alert(
                    data.message ||
                    "تم حذف الحساب نهائيًا بنجاح."
                );


                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Delete account error:",
                    error
                );


                alert(
                    "تعذر الاتصال بالسيرفر أثناء حذف الحساب."
                );

            } finally {

                deleteAccountButton.disabled =
                    false;


                deleteAccountButton.textContent =
                    oldText;
            }
        }
    );
}


// =====================================================
// LOAD STUDENT COURSES
// =====================================================

async function loadStudentCourses() {

    if (!studentCoursesContainer) {
        return;
    }


    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        logout();

        return;
    }


    studentCoursesContainer.innerHTML = `
        <p>
            جاري تحميل الكورسات...
        </p>
    `;


    try {

        const response =
            await fetch(
                API_URL + "/courses/student",
                {
                    method:
                        "GET",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token
                    }
                }
            );


        const data =
            await response.json();


        // =========================================
        // TOKEN EXPIRED
        // =========================================

        if (
            response.status ===
            401
        ) {

            logout();

            return;
        }


        // =========================================
        // ROLE / ACCOUNT CHANGED
        // =========================================

        if (
            response.status ===
            403
        ) {

            const currentUser =
                await getCurrentUserFromServer();


            if (currentUser) {

                redirectUserByRole(
                    currentUser
                );

            } else {

                logout();
            }


            return;
        }


        // =========================================
        // ERROR
        // =========================================

        if (!response.ok) {

            studentCoursesContainer.innerHTML = `
                <p>
                    ${
                        escapeHTML(
                            data.message ||
                            "حدث خطأ أثناء تحميل الكورسات."
                        )
                    }
                </p>
            `;


            return;
        }


        // =========================================
        // GET COURSES
        // =========================================

        let courses = [];


        if (
            Array.isArray(data)
        ) {

            courses =
                data;

        } else if (
            Array.isArray(
                data.courses
            )
        ) {

            courses =
                data.courses;

        } else if (
            Array.isArray(
                data.data
            )
        ) {

            courses =
                data.data;
        }


        // =========================================
        // NO COURSES
        // =========================================

        if (
            courses.length ===
            0
        ) {

            studentCoursesContainer.innerHTML = `
                <div class="teacher-empty-state">

                    <h3>
                        لا توجد كورسات متاحة حاليًا
                    </h3>

                    <p>
                        لا توجد كورسات متاحة لسنتك الدراسية والترم الحالي.
                    </p>

                </div>
            `;


            return;
        }


        // =========================================
        // CLEAR
        // =========================================

        studentCoursesContainer.innerHTML =
            "";


        // =========================================
        // SHOW COURSES
        // =========================================

        courses.forEach(
            function (course) {

                const courseCard =
                    document.createElement(
                        "div"
                    );


                courseCard.className =
                    "course-card";


                let priceText =
                    "مجاني";


                if (
                    Number(
                        course.price
                    ) > 0
                ) {

                    priceText =
                        course.price +
                        " جنيه";
                }


                courseCard.innerHTML = `

                    ${
                        course.image

                            ? `
                                <img
                                    src="${escapeHTML(
                                        course.image
                                    )}"

                                    alt="${escapeHTML(
                                        course.title
                                    )}"
                                >
                            `

                            : ""
                    }


                    <div class="course-content">

                        <h2>
                            ${escapeHTML(
                                course.title
                            )}
                        </h2>


                        <h3>
                            مقدم من كنيسة السيدة العذراء والشهيد العظيم أبي سيفين
                        </h3>


                        <p>
                            ${escapeHTML(
                                course.description ||
                                ""
                            )}
                        </p>


                        <p>
                            السعر:

                            <strong>
                                ${escapeHTML(
                                    priceText
                                )}
                            </strong>
                        </p>


                        <a
                            class="az"
                            href="course.html?id=${Number(
                                course.id
                            )}"
                        >
                            عرض الكورس
                        </a>

                    </div>
                `;


                studentCoursesContainer
                    .appendChild(
                        courseCard
                    );
            }
        );

    } catch (error) {

        console.error(
            "Load student courses error:",
            error
        );


        studentCoursesContainer.innerHTML = `
            <p>
                تعذر الاتصال بالسيرفر.
            </p>
        `;
    }
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


// =====================================================
// START
// =====================================================

initializeStudentArea();