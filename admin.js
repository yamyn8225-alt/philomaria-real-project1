// =====================================================
// PHILOMARIA - ADMIN DASHBOARD
// =====================================================

// =====================================================
// GET ELEMENTS
// =====================================================

const usersContainer =
    document.getElementById(
        "admin-users-container"
    );

const studentSelect =
    document.getElementById(
        "access-student"
    );

const courseSelect =
    document.getElementById(
        "access-course"
    );

const grantAccessButton =
    document.getElementById(
        "grant-access-button"
    );

const courseAccessContainer =
    document.getElementById(
        "course-access-container"
    );

const logoutButton =
    document.getElementById(
        "logout-button"
    );

// =====================================================
// AUTH
// =====================================================

const token =
    localStorage.getItem(
        "token"
    );

const currentUser =
    JSON.parse(
        localStorage.getItem(
            "currentUser"
        ) || "null"
    );

// =====================================================
// PROTECT ADMIN PAGE
// =====================================================

if (
    !token ||
    !currentUser ||
    currentUser.role !== "admin"
) {

    window.location.href =
        "login.html";
}

// =====================================================
// DATA
// =====================================================

let users = [];

let courses = [];

let courseAccesses = [];

// =====================================================
// HANDLE AUTH ERROR
// =====================================================

function handleAuthError(
    response
) {

    if (
        response.status === 401 ||
        response.status === 403
    ) {

        logout();

        return true;
    }

    return false;
}

// =====================================================
// LOAD USERS
// =====================================================

async function loadUsers() {

    if (!usersContainer) {
        return;
    }

    try {

        const response =
            await fetch(
                API_URL +
                "/admin-users",
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

        if (
            handleAuthError(
                response
            )
        ) {

            return;
        }

        if (!response.ok) {

            usersContainer.innerHTML = `
                <p>
                    ${
                        escapeHTML(
                            data.message ||
                            "حدث خطأ أثناء تحميل المستخدمين."
                        )
                    }
                </p>
            `;

            return;
        }

        users =
            Array.isArray(
                data.users
            )
                ? data.users
                : [];

        showUsers();

        fillStudentSelect();

    }

    catch (error) {

        console.error(
            "Load users error:",
            error
        );

        usersContainer.innerHTML = `
            <p>
                تعذر الاتصال بالسيرفر.
            </p>
        `;
    }
}

// =====================================================
// SHOW USERS
// =====================================================

function showUsers() {

    if (!usersContainer) {
        return;
    }

    usersContainer.innerHTML =
        "";

    if (
        users.length === 0
    ) {

        usersContainer.innerHTML = `
            <p>
                لا يوجد مستخدمون حاليًا.
            </p>
        `;

        return;
    }

    users.forEach(
        function (user) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "admin-user-card";

            const isCurrentAdmin =
                Number(user.id) ===
                Number(
                    currentUser.id
                );

            card.innerHTML = `
                <h3>
                    ${escapeHTML(
                        user.username ||
                        "مستخدم"
                    )}
                </h3>

                <p>
                    <strong>
                        البريد:
                    </strong>

                    ${escapeHTML(
                        user.email ||
                        "-"
                    )}
                </p>

                <p>
                    <strong>
                        الهاتف:
                    </strong>

                    ${escapeHTML(
                        user.phone ||
                        "-"
                    )}
                </p>

                <p>
                    <strong>
                        السنة:
                    </strong>

                    ${escapeHTML(
                        user.studyYear ||
                        "-"
                    )}
                </p>

                <p>
                    <strong>
                        الترم:
                    </strong>

                    ${escapeHTML(
                        user.studyTerm ||
                        "-"
                    )}
                </p>

                <p>
                    <strong>
                        الكنيسة:
                    </strong>

                    ${escapeHTML(
                        user.churchName ||
                        "-"
                    )}
                </p>

                <div
                    class="admin-user-actions"
                >

                    <!-- ================================= -->
                    <!-- ACCOUNT STATUS -->
                    <!-- ================================= -->

                    <div
                        class="form-group"
                    >

                        <label>
                            حالة الحساب
                        </label>

                        <select
                            class="account-status-select"
                            data-user-id="${user.id}"

                            ${
                                isCurrentAdmin
                                    ? "disabled"
                                    : ""
                            }
                        >

                            <option
                                value="pending"

                                ${
                                    getAccountStatus(user) ===
                                    "pending"
                                        ? "selected"
                                        : ""
                                }
                            >
                                قيد المراجعة
                            </option>

                            <option
                                value="approved"

                                ${
                                    getAccountStatus(user) ===
                                    "approved"
                                        ? "selected"
                                        : ""
                                }
                            >
                                مقبول
                            </option>

                            <option
                                value="rejected"

                                ${
                                    getAccountStatus(user) ===
                                    "rejected"
                                        ? "selected"
                                        : ""
                                }
                            >
                                مرفوض
                            </option>

                        </select>

                    </div>

                    <!-- ================================= -->
                    <!-- ROLE -->
                    <!-- ================================= -->

                    <div
                        class="form-group"
                    >

                        <label>
                            الصلاحية
                        </label>

                        <select
                            class="role-select"
                            data-user-id="${user.id}"

                            ${
                                isCurrentAdmin
                                    ? "disabled"
                                    : ""
                            }
                        >

                            <option
                                value="student"

                                ${
                                    user.role ===
                                    "student"
                                        ? "selected"
                                        : ""
                                }
                            >
                                طالب
                            </option>

                            <option
                                value="teacher"

                                ${
                                    user.role ===
                                    "teacher"
                                        ? "selected"
                                        : ""
                                }
                            >
                                مدرس
                            </option>

                            <option
                                value="admin"

                                ${
                                    user.role ===
                                    "admin"
                                        ? "selected"
                                        : ""
                                }
                            >
                                أدمن
                            </option>

                        </select>

                    </div>

                    <!-- ================================= -->
                    <!-- CHURCH STATUS -->
                    <!-- ================================= -->

                    <div
                        class="form-group"
                    >

                        <label>
                            عضوية الكنيسة
                        </label>

                        <select
                            class="church-status-select"
                            data-user-id="${user.id}"
                        >

                            <option
                                value="pending"

                                ${
                                    getChurchStatus(user) ===
                                    "pending"
                                        ? "selected"
                                        : ""
                                }
                            >
                                قيد المراجعة
                            </option>

                            <option
                                value="approved"

                                ${
                                    getChurchStatus(user) ===
                                    "approved"
                                        ? "selected"
                                        : ""
                                }
                            >
                                معتمد
                            </option>

                            <option
                                value="rejected"

                                ${
                                    getChurchStatus(user) ===
                                    "rejected"
                                        ? "selected"
                                        : ""
                                }
                            >
                                مرفوض
                            </option>

                        </select>

                    </div>

                    <!-- ================================= -->
                    <!-- DELETE USER -->
                    <!-- ================================= -->

                    ${
                        isCurrentAdmin

                            ? `
                                <p class="admin-protected-text">
                                    لا يمكن حذف حساب
                                    الأدمن الحالي.
                                </p>
                            `

                            : `
                                <button
                                    type="button"
                                    class="delete-user-button"
                                    data-user-id="${user.id}"
                                >
                                    حذف المستخدم
                                </button>
                            `
                    }

                </div>
            `;

            usersContainer.appendChild(
                card
            );
        }
    );
}

// =====================================================
// USER SELECT ACTIONS
// =====================================================

document.addEventListener(
    "change",

    async function (event) {

        // =============================================
        // ACCOUNT STATUS
        // =============================================

        if (
            event.target.classList.contains(
                "account-status-select"
            )
        ) {

            const userId =
                Number(
                    event.target.dataset.userId
                );

            const status =
                event.target.value;

            await updateAccountStatus(
                userId,
                status
            );

            return;
        }

        // =============================================
        // ROLE
        // =============================================

        if (
            event.target.classList.contains(
                "role-select"
            )
        ) {

            const userId =
                Number(
                    event.target.dataset.userId
                );

            const role =
                event.target.value;

            await updateUserRole(
                userId,
                role
            );

            return;
        }

        // =============================================
        // CHURCH STATUS
        // =============================================

        if (
            event.target.classList.contains(
                "church-status-select"
            )
        ) {

            const userId =
                Number(
                    event.target.dataset.userId
                );

            const status =
                event.target.value;

            await updateChurchStatus(
                userId,
                status
            );
        }
    }
);

// =====================================================
// BUTTON ACTIONS
// =====================================================

document.addEventListener(
    "click",

    async function (event) {

        // =============================================
        // DELETE USER
        // =============================================

        if (
            event.target.classList.contains(
                "delete-user-button"
            )
        ) {

            const userId =
                Number(
                    event.target.dataset.userId
                );

            const user =
                users.find(
                    function (item) {

                        return (
                            Number(item.id) ===
                            userId
                        );
                    }
                );

            if (!user) {

                alert(
                    "المستخدم غير موجود."
                );

                return;
            }

            const confirmed =
                confirm(
                    'هل أنت متأكد من حذف المستخدم "' +
                    (
                        user.username ||
                        user.email
                    ) +
                    '"؟'
                );

            if (!confirmed) {
                return;
            }

            await deleteUser(
                userId
            );

            return;
        }

        // =============================================
        // REVOKE COURSE ACCESS
        // =============================================

        if (
            event.target.classList.contains(
                "revoke-course-button"
            )
        ) {

            const userId =
                Number(
                    event.target.dataset.userId
                );

            const courseId =
                Number(
                    event.target.dataset.courseId
                );

            const access =
                courseAccesses.find(
                    function (item) {

                        return (
                            Number(
                                item.userId
                            ) ===
                            userId &&

                            Number(
                                item.courseId
                            ) ===
                            courseId
                        );
                    }
                );

            if (!access) {

                alert(
                    "لم يتم العثور على التفعيل."
                );

                return;
            }

            const confirmed =
                confirm(
                    'هل أنت متأكد من إلغاء تفعيل كورس "' +
                    access.courseTitle +
                    '" من الطالب "' +
                    access.studentName +
                    '"؟'
                );

            if (!confirmed) {
                return;
            }

            await revokeCourseAccess(
                userId,
                courseId
            );
        }
    }
);

// =====================================================
// UPDATE ACCOUNT STATUS
// =====================================================

async function updateAccountStatus(
    userId,
    status
) {

    try {

        const response =
            await fetch(
                API_URL +
                "/admin-users/" +
                userId +
                "/account-status",
                {
                    method:
                        "PATCH",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            {
                                status:
                                    status
                            }
                        )
                }
            );

        const data =
            await response.json();

        if (
            handleAuthError(
                response
            )
        ) {

            return;
        }

        if (!response.ok) {

            alert(
                data.message ||
                "فشل تحديث حالة الحساب."
            );

            await loadUsers();

            return;
        }

        alert(
            data.message ||
            "تم تحديث حالة الحساب."
        );

        await loadUsers();

    }

    catch (error) {

        console.error(
            "Update account status error:",
            error
        );

        alert(
            "تعذر الاتصال بالسيرفر."
        );
    }
}

// =====================================================
// UPDATE USER ROLE
// =====================================================

async function updateUserRole(
    userId,
    role
) {

    try {

        const response =
            await fetch(
                API_URL +
                "/admin-users/" +
                userId +
                "/role",
                {
                    method:
                        "PATCH",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            {
                                role:
                                    role
                            }
                        )
                }
            );

        const data =
            await response.json();

        if (
            handleAuthError(
                response
            )
        ) {

            return;
        }

        if (!response.ok) {

            alert(
                data.message ||
                "فشل تغيير الصلاحية."
            );

            await loadUsers();

            return;
        }

        alert(
            data.message ||
            "تم تحديث صلاحية المستخدم."
        );

        await loadUsers();

    }

    catch (error) {

        console.error(
            "Update role error:",
            error
        );

        alert(
            "تعذر الاتصال بالسيرفر."
        );
    }
}

// =====================================================
// UPDATE CHURCH STATUS
// =====================================================

async function updateChurchStatus(
    userId,
    status
) {

    try {

        const response =
            await fetch(
                API_URL +
                "/admin-users/" +
                userId +
                "/church-status",
                {
                    method:
                        "PATCH",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            {
                                status:
                                    status
                            }
                        )
                }
            );

        const data =
            await response.json();

        if (
            handleAuthError(
                response
            )
        ) {

            return;
        }

        if (!response.ok) {

            alert(
                data.message ||
                "فشل تحديث حالة عضوية الكنيسة."
            );

            await loadUsers();

            return;
        }

        alert(
            data.message ||
            "تم تحديث حالة عضوية الكنيسة."
        );

        await loadUsers();

    }

    catch (error) {

        console.error(
            "Update church status error:",
            error
        );

        alert(
            "تعذر الاتصال بالسيرفر."
        );
    }
}

// =====================================================
// DELETE USER
// =====================================================

async function deleteUser(
    userId
) {

    try {

        const response =
            await fetch(
                API_URL +
                "/admin-users/" +
                userId,
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

        if (
            handleAuthError(
                response
            )
        ) {

            return;
        }

        if (!response.ok) {

            alert(
                data.message ||
                "فشل حذف المستخدم."
            );

            return;
        }

        alert(
            data.message ||
            "تم حذف المستخدم بنجاح."
        );

        await loadUsers();

        await loadCourseAccesses();

    }

    catch (error) {

        console.error(
            "Delete user error:",
            error
        );

        alert(
            "تعذر الاتصال بالسيرفر."
        );
    }
}

// =====================================================
// FILL STUDENT SELECT
// =====================================================

function fillStudentSelect() {

    if (!studentSelect) {
        return;
    }

    studentSelect.innerHTML = `
        <option value="">
            اختر الطالب
        </option>
    `;

    const students =
        users.filter(
            function (user) {

                return (
                    user.role ===
                    "student"
                );
            }
        );

    students.forEach(
        function (student) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                student.id;

            option.textContent =
                (
                    student.username ||
                    student.email
                ) +
                " - " +
                student.email;

            studentSelect.appendChild(
                option
            );
        }
    );
}

// =====================================================
// LOAD COURSES
// =====================================================

async function loadCourses() {

    if (!courseSelect) {
        return;
    }

    try {

        const response =
            await fetch(
                API_URL +
                "/course-access/admin/courses",
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

        if (
            handleAuthError(
                response
            )
        ) {

            return;
        }

        if (!response.ok) {

            console.error(
                "Load courses error:",
                data
            );

            courseSelect.innerHTML = `
                <option value="">
                    فشل تحميل الكورسات
                </option>
            `;

            return;
        }

        courses =
            Array.isArray(
                data.courses
            )
                ? data.courses
                : [];

        fillCourseSelect();

    }

    catch (error) {

        console.error(
            "Load courses error:",
            error
        );

        courseSelect.innerHTML = `
            <option value="">
                تعذر تحميل الكورسات
            </option>
        `;
    }
}

// =====================================================
// FILL COURSE SELECT
// =====================================================

function fillCourseSelect() {

    if (!courseSelect) {
        return;
    }

    courseSelect.innerHTML = `
        <option value="">
            اختر الكورس
        </option>
    `;

    if (
        courses.length === 0
    ) {

        courseSelect.innerHTML = `
            <option value="">
                لا توجد كورسات
            </option>
        `;

        return;
    }

    courses.forEach(
        function (course) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                course.id;

            const price =
                Number(
                    course.price ||
                    0
                );

            const priceText =
                price === 0
                    ? "مجاني"
                    : price +
                      " جنيه";

            option.textContent =
                course.title +
                " - " +
                priceText;

            courseSelect.appendChild(
                option
            );
        }
    );
}

// =====================================================
// GRANT COURSE ACCESS BUTTON
// =====================================================

if (
    grantAccessButton
) {

    grantAccessButton.addEventListener(
        "click",

        async function () {

            const studentId =
                Number(
                    studentSelect.value
                );

            const courseId =
                Number(
                    courseSelect.value
                );

            if (!studentId) {

                alert(
                    "اختر الطالب أولاً."
                );

                return;
            }

            if (!courseId) {

                alert(
                    "اختر الكورس أولاً."
                );

                return;
            }

            const selectedStudent =
                users.find(
                    function (user) {

                        return (
                            Number(
                                user.id
                            ) ===
                            studentId
                        );
                    }
                );

            const selectedCourse =
                courses.find(
                    function (course) {

                        return (
                            Number(
                                course.id
                            ) ===
                            courseId
                        );
                    }
                );

            const studentName =
                selectedStudent

                    ? (
                        selectedStudent.username ||
                        selectedStudent.email
                    )

                    : "الطالب";

            const courseName =
                selectedCourse

                    ? selectedCourse.title

                    : "الكورس";

            const confirmed =
                confirm(
                    'هل تريد تفعيل كورس "' +
                    courseName +
                    '" للطالب "' +
                    studentName +
                    '"؟'
                );

            if (!confirmed) {
                return;
            }

            await grantCourseAccess(
                studentId,
                courseId
            );
        }
    );
}

// =====================================================
// GRANT COURSE ACCESS
// =====================================================

async function grantCourseAccess(
    studentId,
    courseId
) {

    const oldButtonText =
        grantAccessButton.textContent;

    try {

        grantAccessButton.disabled =
            true;

        grantAccessButton.textContent =
            "جاري التفعيل...";

        const response =
            await fetch(
                API_URL +
                "/course-access/grant",
                {
                    method:
                        "POST",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            {
                                userId:
                                    studentId,

                                courseId:
                                    courseId
                            }
                        )
                }
            );

        const data =
            await response.json();

        if (
            handleAuthError(
                response
            )
        ) {

            return;
        }

        if (!response.ok) {

            alert(
                data.message ||
                "فشل تفعيل الكورس للطالب."
            );

            return;
        }

        alert(
            data.message ||
            "تم تفعيل الكورس للطالب بنجاح."
        );

        studentSelect.value =
            "";

        courseSelect.value =
            "";

        await loadCourseAccesses();

    }

    catch (error) {

        console.error(
            "Grant course access error:",
            error
        );

        alert(
            "تعذر الاتصال بالسيرفر."
        );
    }

    finally {

        grantAccessButton.disabled =
            false;

        grantAccessButton.textContent =
            oldButtonText;
    }
}

// =====================================================
// LOAD COURSE ACCESSES
// =====================================================

async function loadCourseAccesses() {

    if (!courseAccessContainer) {
        return;
    }

    try {

        const response =
            await fetch(
                API_URL +
                "/course-access/admin/accesses",
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

        if (
            handleAuthError(
                response
            )
        ) {

            return;
        }

        if (!response.ok) {

            courseAccessContainer.innerHTML = `
                <p>
                    ${
                        escapeHTML(
                            data.message ||
                            "فشل تحميل الكورسات المفعلة."
                        )
                    }
                </p>
            `;

            return;
        }

        courseAccesses =
            Array.isArray(
                data.accesses
            )
                ? data.accesses
                : [];

        showCourseAccesses();

    }

    catch (error) {

        console.error(
            "Load course accesses error:",
            error
        );

        courseAccessContainer.innerHTML = `
            <p>
                تعذر تحميل الكورسات المفعلة.
            </p>
        `;
    }
}

// =====================================================
// SHOW COURSE ACCESSES
// =====================================================

function showCourseAccesses() {

    if (!courseAccessContainer) {
        return;
    }

    courseAccessContainer.innerHTML =
        "";

    if (
        courseAccesses.length === 0
    ) {

        courseAccessContainer.innerHTML = `
            <p>
                لا توجد كورسات مفعلة
                يدويًا حاليًا.
            </p>
        `;

        return;
    }

    courseAccesses.forEach(
        function (access) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "admin-access-card";

            const price =
                Number(
                    access.coursePrice ||
                    0
                );

            card.innerHTML = `
                <h3>
                    ${escapeHTML(
                        access.studentName ||
                        "طالب"
                    )}
                </h3>

                <p>
                    <strong>
                        البريد:
                    </strong>

                    ${escapeHTML(
                        access.studentEmail ||
                        "-"
                    )}
                </p>

                <p>
                    <strong>
                        الكورس:
                    </strong>

                    ${escapeHTML(
                        access.courseTitle ||
                        "-"
                    )}
                </p>

                <p>
                    <strong>
                        السعر:
                    </strong>

                    ${
                        price === 0

                            ? "مجاني"

                            : price +
                              " جنيه"
                    }
                </p>

                <p>
                    <strong>
                        نوع التفعيل:
                    </strong>

                    ${escapeHTML(
                        access.accessType ||
                        "-"
                    )}
                </p>

                <button
                    type="button"
                    class="revoke-course-button"
                    data-user-id="${access.userId}"
                    data-course-id="${access.courseId}"
                >
                    إلغاء تفعيل الكورس
                </button>
            `;

            courseAccessContainer.appendChild(
                card
            );
        }
    );
}

// =====================================================
// REVOKE COURSE ACCESS
// =====================================================

async function revokeCourseAccess(
    userId,
    courseId
) {

    try {

        const response =
            await fetch(
                API_URL +
                "/course-access/revoke/" +
                userId +
                "/" +
                courseId,
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

        if (
            handleAuthError(
                response
            )
        ) {

            return;
        }

        if (!response.ok) {

            alert(
                data.message ||
                "فشل إلغاء تفعيل الكورس."
            );

            return;
        }

        alert(
            data.message ||
            "تم إلغاء تفعيل الكورس بنجاح."
        );

        await loadCourseAccesses();

    }

    catch (error) {

        console.error(
            "Revoke course access error:",
            error
        );

        alert(
            "تعذر الاتصال بالسيرفر."
        );
    }
}

// =====================================================
// GET ACCOUNT STATUS
// =====================================================

function getAccountStatus(
    user
) {

    return (

        user.accountStatus ||

        user.account_status ||

        "pending"

    );
}

// =====================================================
// GET CHURCH STATUS
// =====================================================

function getChurchStatus(
    user
) {

    return (

        user.churchMemberStatus ||

        user.church_member_status ||

        "pending"

    );
}

// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    return String(
        value
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
// LOGOUT
// =====================================================

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "currentUser"
    );

    window.location.href =
        "login.html";
}

// =====================================================
// LOGOUT BUTTON
// =====================================================

if (
    logoutButton
) {

    logoutButton.addEventListener(
        "click",
        logout
    );
}

// =====================================================
// START
// =====================================================

loadUsers();

loadCourses();

loadCourseAccesses();