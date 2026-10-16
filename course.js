// =====================================================
// PHILOMARIA - COURSE PAGE
// =====================================================

// =====================================================
// ELEMENTS
// =====================================================

const courseTitle =
    document.getElementById("course-title");

const courseDescription =
    document.getElementById("course-description");

const courseStudyYear =
    document.getElementById("course-study-year");

const courseStudyTerm =
    document.getElementById("course-study-term");

const lessonsContainer =
    document.getElementById("lessons-container");

const materialsContainer =
    document.getElementById("materials-container");

const examCard =
    document.getElementById("exam-card");

// =====================================================
// AUTH
// =====================================================

const token =
    localStorage.getItem("token");

let currentUser = null;

// =====================================================
// COURSE ID
// =====================================================

const params =
    new URLSearchParams(
        window.location.search
    );

const courseId =
    Number(
        params.get("id")
    );

// =====================================================
// YEAR / TERM
// =====================================================

const yearNames = {
    "1": "السنة الأولى",
    "2": "السنة الثانية",
    "3": "السنة الثالثة"
};

const termNames = {
    "1": "الترم الأول",
    "2": "الترم الثاني",
    "3": "الترم الثالث"
};

// =====================================================
// LOAD CURRENT USER
// =====================================================

async function loadCurrentUser() {

    if (!token) {
        logout();
        return false;
    }

    try {

        const response =
            await fetch(
                API_URL + "/auth/me",
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            "Bearer " + token
                    }
                }
            );

        const data =
            await response.json();

        if (
            response.status === 401
        ) {
            logout();
            return false;
        }

        if (
            response.status === 403
        ) {

            localStorage.removeItem(
                "currentUser"
            );

            showAccessError(
                data.message ||
                "هذا الحساب غير متاح حاليًا."
            );

            return false;
        }

        if (
            !response.ok ||
            !data.user
        ) {

            showAccessError(
                data.message ||
                "تعذر تحميل بيانات المستخدم."
            );

            return false;
        }

        currentUser =
            data.user;

        localStorage.setItem(
            "currentUser",
            JSON.stringify(
                currentUser
            )
        );

        return true;

    } catch (error) {

        console.error(
            "Load current user error:",
            error
        );

        showAccessError(
            "تعذر الاتصال بالسيرفر أثناء التحقق من المستخدم."
        );

        return false;
    }
}

// =====================================================
// START PAGE
// =====================================================

async function startCoursePage() {

    if (!token) {
        logout();
        return;
    }

    if (
        !courseId ||
        Number.isNaN(courseId)
    ) {

        showCourseNotFound();
        return;
    }

    showLoadingState();

    const userLoaded =
        await loadCurrentUser();

    if (!userLoaded) {
        return;
    }

    // =================================================
    // STUDENT
    // =================================================

    if (
        currentUser.role ===
        "student"
    ) {

        const hasAccess =
            await checkCourseAccess();

        if (!hasAccess) {
            return;
        }
    }

    // =================================================
    // TEACHER / ADMIN
    // =================================================

    else if (
        currentUser.role !==
            "teacher" &&
        currentUser.role !==
            "admin"
    ) {

        showAccessError(
            "غير مسموح لهذا الحساب بفتح الكورس."
        );

        return;
    }

    await loadCourse();
}

// =====================================================
// CHECK COURSE ACCESS
// =====================================================

async function checkCourseAccess() {

    try {

        const response =
            await fetch(
                API_URL +
                "/course-access/" +
                courseId,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            "Bearer " + token
                    }
                }
            );

        const data =
            await response.json();

        if (
            response.status === 401
        ) {
            logout();
            return false;
        }

        if (
            response.status === 403
        ) {

            if (
                data.requiresPurchase
            ) {

                showPurchaseRequired(
                    data
                );

            } else {

                showAccessError(
                    data.message ||
                    "غير مسموح لك بدخول هذا الكورس."
                );
            }

            return false;
        }

        if (!response.ok) {

            showAccessError(
                data.message ||
                "تعذر التحقق من صلاحية الكورس."
            );

            return false;
        }

        if (
            data.hasAccess ===
            false
        ) {

            showPurchaseRequired(
                data
            );

            return false;
        }

        return true;

    } catch (error) {

        console.error(
            "Course access check error:",
            error
        );

        showAccessError(
            "تعذر الاتصال بالسيرفر."
        );

        return false;
    }
}

// =====================================================
// LOAD COURSE
// =====================================================

async function loadCourse() {

    try {

        const response =
            await fetch(
                API_URL +
                "/course-contents/course/" +
                courseId,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            "Bearer " + token
                    }
                }
            );

        const data =
            await response.json();

        if (
            response.status === 401
        ) {
            logout();
            return;
        }

        if (
            response.status === 403 &&
            data.requiresPurchase
        ) {

            showPurchaseRequired(
                data
            );

            return;
        }

        if (
            response.status === 403
        ) {

            showAccessError(
                data.message ||
                "غير مسموح لك بدخول هذا الكورس."
            );

            return;
        }

        if (!response.ok) {

            showAccessError(
                data.message ||
                "حدث خطأ أثناء تحميل الكورس."
            );

            return;
        }

        showCourseInfo(
            data.course
        );

        showCourseContents(
            data.contents || []
        );

        if (
            currentUser.role ===
            "student"
        ) {

            await loadStudentCourseExams();

        } else {

            await loadTeacherCourseExams();
        }

    } catch (error) {

        console.error(
            "Load course error:",
            error
        );

        showAccessError(
            "تعذر الاتصال بالسيرفر."
        );
    }
}

// =====================================================
// LOADING
// =====================================================

function showLoadingState() {

    if (courseTitle) {
        courseTitle.textContent =
            "جاري تحميل الكورس...";
    }

    if (courseDescription) {
        courseDescription.textContent =
            "جاري التحقق من بيانات المستخدم.";
    }

    if (lessonsContainer) {
        lessonsContainer.innerHTML =
            "<p>جاري تحميل المحاضرات...</p>";
    }

    if (materialsContainer) {
        materialsContainer.innerHTML =
            "<p>جاري تحميل الملفات...</p>";
    }

    if (examCard) {
        examCard.innerHTML =
            "<p>جاري تحميل الاختبارات...</p>";
    }
}

// =====================================================
// COURSE INFO
// =====================================================

function showCourseInfo(
    course
) {

    if (!course) {
        return;
    }

    if (courseTitle) {
        courseTitle.textContent =
            course.title ||
            "الكورس";
    }

    if (courseDescription) {
        courseDescription.textContent =
            course.description ||
            "";
    }

    if (courseStudyYear) {

        courseStudyYear.textContent =
            yearNames[
                String(
                    course.studyYear
                )
            ] || "-";
    }

    if (courseStudyTerm) {

        courseStudyTerm.textContent =
            termNames[
                String(
                    course.studyTerm
                )
            ] || "-";
    }
}

// =====================================================
// COURSE CONTENT
// =====================================================

function showCourseContents(
    contents
) {

    const lectures =
        contents.filter(
            function (item) {

                return (
                    item.type ===
                    "lecture"
                );
            }
        );

    const files =
        contents.filter(
            function (item) {

                return (
                    item.type ===
                    "file"
                );
            }
        );

    showLectures(
        lectures
    );

    showFiles(
        files
    );
}

// =====================================================
// LECTURES
// =====================================================

function showLectures(
    lectures
) {

    if (!lessonsContainer) {
        return;
    }

    lessonsContainer.innerHTML =
        "";

    if (
        lectures.length === 0
    ) {

        lessonsContainer.innerHTML =
            "<p>لا توجد محاضرات متاحة حاليًا.</p>";

        return;
    }

    lectures.forEach(
        function (
            lecture,
            index
        ) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "lesson-card";

            card.innerHTML = `

                <div class="lesson-number">
                    ${index + 1}
                </div>

                <div class="lesson-info">

                    <h3>
                        ${escapeHTML(
                            lecture.title
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            lecture.description ||
                            ""
                        )}
                    </p>

                </div>

                <button
                    type="button"
                    class="az open-lecture-button"
                    data-lecture-id="${lecture.id}"
                >
                    مشاهدة المحاضرة
                </button>
            `;

            const button =
                card.querySelector(
                    ".open-lecture-button"
                );

            // =================================================
            // TEACHER / ADMIN
            // =================================================

            if (
                button &&
                (
                    currentUser.role ===
                        "teacher" ||

                    currentUser.role ===
                        "admin"
                ) &&
                lecture.videoUrl
            ) {

                button.dataset.videoUrl =
                    lecture.videoUrl;
            }

            lessonsContainer.appendChild(
                card
            );
        }
    );
}

// =====================================================
// FILES
// =====================================================

function showFiles(
    files
) {

    if (!materialsContainer) {
        return;
    }

    materialsContainer.innerHTML =
        "";

    if (
        files.length === 0
    ) {

        materialsContainer.innerHTML =
            "<p>لا توجد ملفات متاحة حاليًا.</p>";

        return;
    }

    files.forEach(
        function (file) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "material-card";

            card.innerHTML = `

                <div>

                    <h3>
                        ${escapeHTML(
                            file.title
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            file.description ||
                            ""
                        )}
                    </p>

                    ${
                        file.fileName

                            ? `
                                <p>
                                    <strong>
                                        الملف:
                                    </strong>

                                    ${escapeHTML(
                                        file.fileName
                                    )}
                                </p>
                            `

                            : ""
                    }

                    ${
                        file.downloadUrl

                            ? `
                                <button
                                    type="button"
                                    class="az download-file-button"
                                    data-file-id="${file.id}"
                                >
                                    تحميل الملف
                                </button>
                            `

                            : ""
                    }

                </div>
            `;

            materialsContainer
                .appendChild(
                    card
                );
        }
    );
}

// =====================================================
// GLOBAL BUTTON ACTIONS
// =====================================================

document.addEventListener(
    "click",

    async function (event) {

        // =================================================
        // OPEN LECTURE
        // =================================================

        const lectureButton =
            event.target.closest(
                ".open-lecture-button"
            );

        if (lectureButton) {

            const lectureId =
                Number(
                    lectureButton
                        .dataset
                        .lectureId
                );

            if (!lectureId) {
                return;
            }

            // =================================================
            // TEACHER / ADMIN
            // =================================================

            if (
                currentUser &&
                (
                    currentUser.role ===
                        "teacher" ||

                    currentUser.role ===
                        "admin"
                )
            ) {

                const videoUrl =
                    lectureButton
                        .dataset
                        .videoUrl;

                if (videoUrl) {

                    window.open(
                        videoUrl,
                        "_blank"
                    );

                    return;
                }
            }

            // =================================================
            // STUDENT
            // =================================================

            await openStudentLecture(
                lectureId,
                lectureButton
            );

            return;
        }

        // =================================================
        // DOWNLOAD FILE
        // =================================================

        const fileButton =
            event.target.closest(
                ".download-file-button"
            );

        if (fileButton) {

            const fileId =
                Number(
                    fileButton
                        .dataset
                        .fileId
                );

            if (!fileId) {
                return;
            }

            await downloadCourseFile(
                fileId,
                fileButton
            );
        }
    }
);

// =====================================================
// OPEN STUDENT LECTURE
// MAX 2 OPENS
// =====================================================

async function openStudentLecture(
    lectureId,
    button
) {

    const oldText =
        button.textContent;

    let keepButtonDisabled =
        false;

    try {

        button.disabled =
            true;

        button.textContent =
            "جاري فتح المحاضرة...";

        const response =
            await fetch(

                API_URL +
                "/lecture-access/" +
                lectureId +
                "/open",

                {
                    method:
                        "POST",

                    headers: {

                        Authorization:
                            "Bearer " +
                            token,

                        "Content-Type":
                            "application/json"
                    }
                }
            );

        const data =
            await response.json();

        // =================================================
        // SESSION EXPIRED
        // =================================================

        if (
            response.status === 401
        ) {

            logout();
            return;
        }

        // =================================================
        // ERROR / LIMIT REACHED
        // =================================================

        if (!response.ok) {

            if (
                response.status ===
                    403 &&
                (
                    data.limitReached ===
                        true ||

                    String(
                        data.message ||
                        ""
                    ).includes(
                        "عدد مرات"
                    )

                    ||

                    String(
                        data.message ||
                        ""
                    ).includes(
                        "استهلكت"
                    )
                )
            ) {

                keepButtonDisabled =
                    true;

                button.disabled =
                    true;

                button.textContent =
                    "تم استهلاك مرتي المشاهدة";
            }

            alert(
                data.message ||
                "لا يمكنك فتح هذه المحاضرة."
            );

            return;
        }

        // =================================================
        // VIDEO URL
        // =================================================

        const videoUrl =
            data.videoUrl ||

            (
                data.lecture

                    ? data.lecture.videoUrl

                    : null
            );

        if (!videoUrl) {

            alert(
                "لم يتم العثور على رابط المحاضرة."
            );

            return;
        }

        // =================================================
        // REMAINING VIEWS
        // =================================================

        const remainingViews =
            Number(
                data.remainingViews ??
                data.remainingOpens
            );

        if (
            Number.isFinite(
                remainingViews
            )
        ) {

            // =============================================
            // NO VIEWS LEFT
            // =============================================

            if (
                remainingViews <=
                0
            ) {

                keepButtonDisabled =
                    true;

                button.disabled =
                    true;

                button.textContent =
                    "تم استهلاك مرتي المشاهدة";
            }

            // =============================================
            // ONE VIEW LEFT
            // =============================================

            else {

                button.textContent =
                    `مشاهدة المحاضرة - متبقي ${remainingViews}`;
            }
        }

        // =================================================
        // OPEN VIDEO
        // =================================================

        window.open(
            videoUrl,
            "_blank"
        );

    } catch (error) {

        console.error(
            "Open lecture error:",
            error
        );

        alert(
            "تعذر الاتصال بالسيرفر."
        );

    } finally {

        if (
            !keepButtonDisabled
        ) {

            button.disabled =
                false;

            if (
                button.textContent ===
                "جاري فتح المحاضرة..."
            ) {

                button.textContent =
                    oldText;
            }
        }
    }
}

// =====================================================
// DOWNLOAD FILE
// =====================================================

async function downloadCourseFile(
    fileId,
    button
) {

    const oldText =
        button.textContent;

    try {

        button.disabled =
            true;

        button.textContent =
            "جاري التحميل...";

        const response =
            await fetch(

                API_URL +
                "/course-contents/file/" +
                fileId +
                "/download",

                {
                    method:
                        "GET",

                    headers: {

                        Authorization:
                            "Bearer " +
                            token
                    }
                }
            );

        if (
            response.status === 401
        ) {

            logout();
            return;
        }

        if (!response.ok) {

            let message =
                "تعذر تحميل الملف.";

            try {

                const data =
                    await response.json();

                message =
                    data.message ||
                    message;

            } catch (error) {

                console.error(
                    "Download response error:",
                    error
                );
            }

            alert(
                message
            );

            return;
        }

        const blob =
            await response.blob();

        const objectUrl =
            URL.createObjectURL(
                blob
            );

        let fileName =
            "philomaria-file.pdf";

        const contentDisposition =
            response.headers.get(
                "Content-Disposition"
            );

        if (
            contentDisposition
        ) {

            const utfMatch =
                contentDisposition.match(
                    /filename\*=UTF-8''([^;]+)/
                );

            const normalMatch =
                contentDisposition.match(
                    /filename="?([^";]+)"?/
                );

            if (
                utfMatch &&
                utfMatch[1]
            ) {

                try {

                    fileName =
                        decodeURIComponent(
                            utfMatch[1]
                        );

                } catch (error) {

                    fileName =
                        utfMatch[1];
                }

            } else if (
                normalMatch &&
                normalMatch[1]
            ) {

                fileName =
                    normalMatch[1];
            }
        }

        const link =
            document.createElement(
                "a"
            );

        link.href =
            objectUrl;

        link.download =
            fileName;

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        setTimeout(
            function () {

                URL.revokeObjectURL(
                    objectUrl
                );

            },
            1000
        );

    } catch (error) {

        console.error(
            "Download PDF error:",
            error
        );

        alert(
            "تعذر الاتصال بالسيرفر."
        );

    } finally {

        button.disabled =
            false;

        button.textContent =
            oldText;
    }
}

// =====================================================
// STUDENT - LOAD COURSE EXAMS
// =====================================================

async function loadStudentCourseExams() {

    if (!examCard) {
        return;
    }

    examCard.innerHTML = `

        <div class="teacher-empty-state">

            <p>
                جاري تحميل الاختبارات...
            </p>

        </div>
    `;

    try {

        const response =
            await fetch(

                API_URL +
                "/student-exams/course/" +
                courseId,

                {
                    method:
                        "GET",

                    headers: {

                        Authorization:
                            "Bearer " +
                            token
                    }
                }
            );

        const data =
            await response.json();

        if (
            response.status === 401
        ) {

            logout();
            return;
        }

        if (
            response.status ===
                403 &&
            data.requiresPurchase
        ) {

            examCard.innerHTML = `

                <div class="teacher-empty-state">

                    <p>
                        يجب شراء الكورس أولًا لعرض الاختبارات.
                    </p>

                </div>
            `;

            return;
        }

        if (!response.ok) {

            examCard.innerHTML = `

                <div class="teacher-empty-state">

                    <p>
                        ${escapeHTML(
                            data.message ||
                            "تعذر تحميل الاختبارات."
                        )}
                    </p>

                </div>
            `;

            return;
        }

        const exams =
            Array.isArray(
                data.exams
            )

                ? data.exams

                : [];

        showStudentCourseExams(
            exams
        );

    } catch (error) {

        console.error(
            "Load student exams error:",
            error
        );

        examCard.innerHTML = `

            <div class="teacher-empty-state">

                <p>
                    تعذر الاتصال بالسيرفر.
                </p>

            </div>
        `;
    }
}

// =====================================================
// STUDENT - SHOW EXAMS
// =====================================================

function showStudentCourseExams(
    exams
) {

    if (!examCard) {
        return;
    }

    examCard.innerHTML =
        "";

    if (
        exams.length === 0
    ) {

        examCard.innerHTML = `

            <div class="teacher-empty-state">

                <p>
                    لا توجد اختبارات متاحة حاليًا.
                </p>

            </div>
        `;

        return;
    }

    exams.forEach(
        function (exam) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "teacher-course-card";

            const examType =
                exam.lectureId

                    ? "اختبار على محاضرة"

                    : "اختبار عام على الكورس";

            const lectureText =
                exam.lectureTitle

                    ? `
                        <p>
                            <strong>
                                المحاضرة:
                            </strong>

                            ${escapeHTML(
                                exam.lectureTitle
                            )}
                        </p>
                    `

                    : "";

            // =================================================
            // ALREADY ATTEMPTED
            // =================================================

            if (
                exam.attempted &&
                exam.result
            ) {

                const statusText =
                    exam.result.passed

                        ? "ناجح"

                        : "لم يجتز";

                card.innerHTML = `

                    <h3>
                        ${escapeHTML(
                            exam.title
                        )}
                    </h3>

                    <p>
                        <strong>
                            نوع الاختبار:
                        </strong>

                        ${examType}
                    </p>

                    ${lectureText}

                    <p>
                        <strong>
                            المدة:
                        </strong>

                        ${exam.duration}
                        دقيقة
                    </p>

                    <p>
                        <strong>
                            درجة النجاح:
                        </strong>

                        ${exam.passingGrade}%
                    </p>

                    <p>
                        <strong>
                            نتيجتك:
                        </strong>

                        ${exam.result.score}%
                    </p>

                    <p>
                        <strong>
                            الحالة:
                        </strong>

                        ${statusText}
                    </p>

                    <p>
                        لقد أديت هذا الاختبار من قبل.
                        لا توجد محاولة أخرى.
                    </p>
                `;

            }

            // =================================================
            // NOT ATTEMPTED
            // =================================================

            else {

                card.innerHTML = `

                    <h3>
                        ${escapeHTML(
                            exam.title
                        )}
                    </h3>

                    <p>
                        <strong>
                            نوع الاختبار:
                        </strong>

                        ${examType}
                    </p>

                    ${lectureText}

                    <p>
                        <strong>
                            مدة الاختبار:
                        </strong>

                        ${exam.duration}
                        دقيقة
                    </p>

                    <p>
                        <strong>
                            درجة النجاح:
                        </strong>

                        ${exam.passingGrade}%
                    </p>

                    <a
                        class="az"
                        href="student-exam.html?examId=${exam.id}"
                    >
                        ابدأ الاختبار
                    </a>
                `;
            }

            examCard.appendChild(
                card
            );
        }
    );
}

// =====================================================
// TEACHER / ADMIN - LOAD EXAMS
// =====================================================

async function loadTeacherCourseExams() {

    if (!examCard) {
        return;
    }

    examCard.innerHTML = `

        <div class="teacher-empty-state">

            <p>
                جاري تحميل الاختبارات...
            </p>

        </div>
    `;

    try {

        const response =
            await fetch(

                API_URL +
                "/exams/teacher",

                {
                    method:
                        "GET",

                    headers: {

                        Authorization:
                            "Bearer " +
                            token
                    }
                }
            );

        const data =
            await response.json();

        if (
            response.status === 401
        ) {

            logout();
            return;
        }

        if (!response.ok) {

            examCard.innerHTML = `

                <div class="teacher-empty-state">

                    <p>
                        ${escapeHTML(
                            data.message ||
                            "تعذر تحميل الاختبارات."
                        )}
                    </p>

                </div>
            `;

            return;
        }

        const allExams =
            Array.isArray(
                data.exams
            )

                ? data.exams

                : [];

        const exams =
            allExams.filter(
                function (exam) {

                    return (
                        Number(
                            exam.courseId
                        ) ===
                        Number(
                            courseId
                        )
                    );
                }
            );

        showTeacherCourseExams(
            exams
        );

    } catch (error) {

        console.error(
            "Load teacher exams error:",
            error
        );

        examCard.innerHTML = `

            <div class="teacher-empty-state">

                <p>
                    تعذر الاتصال بالسيرفر.
                </p>

            </div>
        `;
    }
}

// =====================================================
// TEACHER / ADMIN - SHOW EXAMS
// =====================================================

function showTeacherCourseExams(
    exams
) {

    if (!examCard) {
        return;
    }

    examCard.innerHTML =
        "";

    if (
        exams.length === 0
    ) {

        examCard.innerHTML = `

            <div class="teacher-empty-state">

                <p>
                    لا توجد اختبارات لهذا الكورس حتى الآن.
                </p>

            </div>
        `;

        return;
    }

    exams.forEach(
        function (exam) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "teacher-course-card";

            const examType =
                exam.lectureId

                    ? "اختبار على محاضرة"

                    : "اختبار عام على الكورس";

            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        exam.title
                    )}
                </h3>

                <p>
                    <strong>
                        نوع الاختبار:
                    </strong>

                    ${examType}
                </p>

                ${
                    exam.lectureTitle

                        ? `
                            <p>
                                <strong>
                                    المحاضرة:
                                </strong>

                                ${escapeHTML(
                                    exam.lectureTitle
                                )}
                            </p>
                        `

                        : ""
                }

                <p>
                    <strong>
                        المدة:
                    </strong>

                    ${exam.duration}
                    دقيقة
                </p>

                <p>
                    <strong>
                        درجة النجاح:
                    </strong>

                    ${exam.passingGrade}%
                </p>
            `;

            examCard.appendChild(
                card
            );
        }
    );
}

// =====================================================
// PURCHASE REQUIRED
// =====================================================

function showPurchaseRequired(
    data
) {

    if (courseTitle) {

        courseTitle.textContent =
            "هذا الكورس يحتاج إلى تفعيل";
    }

    if (courseDescription) {

        courseDescription.textContent =
            data.message ||
            "يجب دفع قيمة الكورس ثم تفعيله من الإدارة.";
    }

    if (courseStudyYear) {
        courseStudyYear.textContent =
            "-";
    }

    if (courseStudyTerm) {
        courseStudyTerm.textContent =
            "-";
    }

    if (lessonsContainer) {

        lessonsContainer.innerHTML = `

            <div class="teacher-empty-state">

                <h3>
                    الكورس غير مفعّل لحسابك
                </h3>

                <p>
                    سعر الكورس:

                    <strong>
                        ${
                            Number(
                                data.price ||
                                0
                            )
                        }
                        جنيه
                    </strong>
                </p>

                <p>
                    بعد إتمام الدفع،
                    سيقوم الأدمن بتفعيل الكورس لحسابك.
                </p>

            </div>
        `;
    }

    if (materialsContainer) {

        materialsContainer.innerHTML =
            "<p>الملفات ستظهر بعد تفعيل الكورس.</p>";
    }

    if (examCard) {

        examCard.innerHTML =
            "<p>الاختبارات ستظهر بعد تفعيل الكورس.</p>";
    }
}

// =====================================================
// ACCESS ERROR
// =====================================================

function showAccessError(
    message
) {

    if (courseTitle) {

        courseTitle.textContent =
            "لا يمكن فتح الكورس";
    }

    if (courseDescription) {

        courseDescription.textContent =
            message;
    }

    if (courseStudyYear) {
        courseStudyYear.textContent =
            "-";
    }

    if (courseStudyTerm) {
        courseStudyTerm.textContent =
            "-";
    }

    if (lessonsContainer) {
        lessonsContainer.innerHTML =
            "";
    }

    if (materialsContainer) {
        materialsContainer.innerHTML =
            "";
    }

    if (examCard) {
        examCard.innerHTML =
            "";
    }
}

// =====================================================
// COURSE NOT FOUND
// =====================================================

function showCourseNotFound() {

    if (courseTitle) {

        courseTitle.textContent =
            "الكورس غير موجود";
    }

    if (courseDescription) {

        courseDescription.textContent =
            "لم يتم العثور على بيانات هذا الكورس.";
    }

    if (courseStudyYear) {
        courseStudyYear.textContent =
            "-";
    }

    if (courseStudyTerm) {
        courseStudyTerm.textContent =
            "-";
    }

    if (lessonsContainer) {
        lessonsContainer.innerHTML =
            "";
    }

    if (materialsContainer) {
        materialsContainer.innerHTML =
            "";
    }

    if (examCard) {
        examCard.innerHTML =
            "";
    }
}

// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

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
// START
// =====================================================

startCoursePage();