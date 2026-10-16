// =====================================================
// PHILOMARIA - TEACHER DASHBOARD
// =====================================================


// =====================================================
// YEAR / TERM NAMES
// =====================================================

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


// =====================================================
// ELEMENTS
// =====================================================

const teacherCoursesContainer =
    document.getElementById(
        "teacher-courses-container"
    );


const teacherExamsContainer =
    document.getElementById(
        "teacher-exams-container"
    );


const teacherResultsContainer =
    document.getElementById(
        "teacher-results-container"
    );


const teacherStudyYear =
    document.getElementById(
        "teacher-study-year"
    );


const teacherStudyTerm =
    document.getElementById(
        "teacher-study-term"
    );


const teacherLogout =
    document.getElementById(
        "teacher-logout"
    );


// =====================================================
// AUTH
// =====================================================

const token =
    localStorage.getItem(
        "token"
    );


const currentUserData =
    localStorage.getItem(
        "currentUser"
    );


let currentUser =
    null;


if (currentUserData) {

    try {

        currentUser =
            JSON.parse(
                currentUserData
            );

    }

    catch (error) {

        console.error(
            "Current user read error:",
            error
        );
    }
}


// =====================================================
// PROTECT PAGE
// =====================================================

if (
    !token ||
    !currentUser
) {

    window.location.href =
        "login.html";
}


else if (
    currentUser.role !== "teacher" &&
    currentUser.role !== "admin"
) {

    alert(
        "غير مسموح لك بالدخول إلى لوحة المدرس."
    );


    window.location.href =
        "student.html";
}


// =====================================================
// CACHE
// =====================================================

let teacherCourses =
    [];


let teacherExams =
    [];


// =====================================================
// FILTER
// =====================================================

function getSelectedYear() {

    if (!teacherStudyYear) {

        return "";
    }


    const value =
        teacherStudyYear.value;


    if (
        !value ||
        value === "all" ||
        value === "all-years"
    ) {

        return "";
    }


    return value;
}


function getSelectedTerm() {

    if (!teacherStudyTerm) {

        return "";
    }


    const value =
        teacherStudyTerm.value;


    if (
        !value ||
        value === "all" ||
        value === "all-terms"
    ) {

        return "";
    }


    return value;
}


// =====================================================
// COURSE FILTER
// =====================================================

function courseMatchesFilter(
    course
) {

    const year =
        getSelectedYear();


    const term =
        getSelectedTerm();


    const yearMatches =
        !year ||

        String(
            course.studyYear
        ) ===
        String(
            year
        );


    const termMatches =
        !term ||

        String(
            course.studyTerm
        ) ===
        String(
            term
        );


    return (
        yearMatches &&
        termMatches
    );
}


// =====================================================
// EXAM FILTER
// =====================================================

function examMatchesFilter(
    exam
) {

    const year =
        getSelectedYear();


    const term =
        getSelectedTerm();


    const yearMatches =
        !year ||

        String(
            exam.studyYear
        ) ===
        String(
            year
        );


    const termMatches =
        !term ||

        String(
            exam.studyTerm
        ) ===
        String(
            term
        );


    return (
        yearMatches &&
        termMatches
    );
}


// =====================================================
// LOAD TEACHER COURSES
// =====================================================

async function loadTeacherCourses() {

    if (
        !teacherCoursesContainer
    ) {

        return;
    }


    teacherCoursesContainer.innerHTML = `

        <div class="teacher-empty-state">

            <p>
                جاري تحميل الكورسات...
            </p>

        </div>

    `;


    try {

        const response =
            await fetch(

                API_URL +
                "/teacher-courses",

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
            response.status === 401
        ) {

            logout();

            return;
        }


        if (!response.ok) {

            teacherCoursesContainer.innerHTML = `

                <div class="teacher-empty-state">

                    <p>
                        ${
                            escapeHTML(
                                data.message ||
                                "تعذر تحميل الكورسات."
                            )
                        }
                    </p>

                </div>

            `;


            return;
        }


        if (
            Array.isArray(
                data
            )
        ) {

            teacherCourses =
                data;
        }


        else if (
            Array.isArray(
                data.courses
            )
        ) {

            teacherCourses =
                data.courses;
        }


        else if (
            Array.isArray(
                data.data
            )
        ) {

            teacherCourses =
                data.data;
        }


        else {

            teacherCourses =
                [];
        }


        showTeacherCourses();

        showTeacherExams();

    }

    catch (error) {

        console.error(
            "Load courses error:",
            error
        );


        teacherCoursesContainer.innerHTML = `

            <div class="teacher-empty-state">

                <p>
                    تعذر الاتصال بالسيرفر.
                </p>

            </div>

        `;
    }
}


// =====================================================
// SHOW TEACHER COURSES
// =====================================================

function showTeacherCourses() {

    if (
        !teacherCoursesContainer
    ) {

        return;
    }


    const filteredCourses =
        teacherCourses.filter(
            courseMatchesFilter
        );


    teacherCoursesContainer.innerHTML =
        "";


    if (
        filteredCourses.length === 0
    ) {

        teacherCoursesContainer.innerHTML = `

            <div class="teacher-empty-state">

                <h3>
                    لا توجد كورسات
                </h3>

                <p>
                    لا توجد كورسات مطابقة للسنة والترم المختارين.
                </p>

            </div>

        `;


        return;
    }


    filteredCourses.forEach(
        function (course) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "teacher-course-card";


            const priceText =

                Number(
                    course.price
                ) > 0

                    ? course.price +
                      " جنيه"

                    : "مجاني";


            card.innerHTML = `

                <h3>

                    ${
                        escapeHTML(
                            course.title
                        )
                    }

                </h3>


                <p>

                    ${
                        escapeHTML(
                            course.description ||
                            ""
                        )
                    }

                </p>


                <p>

                    <strong>
                        السنة:
                    </strong>

                    ${
                        yearNames[
                            String(
                                course.studyYear
                            )
                        ] ||
                        "-"
                    }

                </p>


                <p>

                    <strong>
                        الترم:
                    </strong>

                    ${
                        termNames[
                            String(
                                course.studyTerm
                            )
                        ] ||
                        "-"
                    }

                </p>


                <p>

                    <strong>
                        السعر:
                    </strong>

                    ${priceText}

                </p>


                <div class="teacher-actions">

                    <a
                        href="add-content.html?courseId=${course.id}"
                        class="teacher-action-link"
                    >
                        إضافة محتوى
                    </a>


                    <a
                        href="course.html?id=${course.id}"
                        class="teacher-action-link"
                    >
                        عرض الكورس
                    </a>


                    <a
                        href="create-exam.html?courseId=${course.id}"
                        class="teacher-action-link"
                    >
                        إنشاء اختبار
                    </a>


                    <button
                        type="button"
                        class="delete-course-button"
                        data-course-id="${course.id}"
                    >
                        حذف الكورس
                    </button>

                </div>

            `;


            teacherCoursesContainer
                .appendChild(
                    card
                );
        }
    );
}


// =====================================================
// LOAD TEACHER EXAMS
// =====================================================

async function loadTeacherExams() {

    if (
        !teacherExamsContainer
    ) {

        return;
    }


    teacherExamsContainer.innerHTML = `

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

                        "Authorization":
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

            teacherExamsContainer.innerHTML = `

                <div class="teacher-empty-state">

                    <p>

                        ${
                            escapeHTML(
                                data.message ||
                                "تعذر تحميل الاختبارات."
                            )
                        }

                    </p>

                </div>

            `;


            return;
        }


        if (
            Array.isArray(
                data
            )
        ) {

            teacherExams =
                data;
        }


        else if (
            Array.isArray(
                data.exams
            )
        ) {

            teacherExams =
                data.exams;
        }


        else if (
            Array.isArray(
                data.data
            )
        ) {

            teacherExams =
                data.data;
        }


        else {

            teacherExams =
                [];
        }


        showTeacherExams();

    }

    catch (error) {

        console.error(
            "Load exams error:",
            error
        );


        teacherExamsContainer.innerHTML = `

            <div class="teacher-empty-state">

                <p>
                    تعذر الاتصال بالسيرفر.
                </p>

            </div>

        `;
    }
}


// =====================================================
// SHOW TEACHER EXAMS
// =====================================================

function showTeacherExams() {

    if (
        !teacherExamsContainer
    ) {

        return;
    }


    const teacherCourseIds =
        teacherCourses.map(
            function (course) {

                return Number(
                    course.id
                );
            }
        );


    const filteredExams =
        teacherExams.filter(
            function (exam) {

                const belongsToTeacher =
                    teacherCourseIds.includes(
                        Number(
                            exam.courseId
                        )
                    );


                return (
                    belongsToTeacher &&
                    examMatchesFilter(
                        exam
                    )
                );
            }
        );


    teacherExamsContainer.innerHTML =
        "";


    if (
        filteredExams.length === 0
    ) {

        teacherExamsContainer.innerHTML = `

            <div class="teacher-empty-state">

                <h3>
                    لا توجد اختبارات
                </h3>

                <p>
                    لم يتم إنشاء اختبارات للكورسات الحالية حتى الآن.
                </p>

            </div>

        `;


        return;
    }


    filteredExams.forEach(
        function (exam) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "teacher-course-card";


            card.innerHTML = `

                <h3>

                    ${
                        escapeHTML(
                            exam.title
                        )
                    }

                </h3>


                <p>

                    <strong>
                        الكورس:
                    </strong>

                    ${
                        escapeHTML(
                            exam.courseTitle ||
                            "-"
                        )
                    }

                </p>


                <p>

                    <strong>
                        المحاضرة:
                    </strong>

                    ${
                        exam.lectureTitle

                            ? escapeHTML(
                                exam.lectureTitle
                            )

                            : "اختبار عام للكورس"
                    }

                </p>


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


                <div class="teacher-actions">

                    <button
                        type="button"
                        class="exam-results-button"
                        data-exam-id="${exam.id}"
                    >
                        نتائج الطلاب
                    </button>

                </div>

            `;


            teacherExamsContainer
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
        // EXAM RESULTS
        // =================================================

        if (
            event.target.classList.contains(
                "exam-results-button"
            )
        ) {

            const examId =
                Number(
                    event.target.dataset.examId
                );


            if (!examId) {

                return;
            }


            document
                .getElementById(
                    "teacher-results"
                )
                ?.scrollIntoView({

                    behavior:
                        "smooth"
                });


            await loadExamResults(
                examId
            );


            return;
        }


        // =================================================
        // DELETE COURSE
        // =================================================

        if (
            event.target.classList.contains(
                "delete-course-button"
            )
        ) {

            const courseId =
                Number(
                    event.target.dataset.courseId
                );


            if (!courseId) {

                return;
            }


            const confirmed =
                confirm(
                    "هل أنت متأكد أنك تريد حذف هذا الكورس؟ سيتم حذف المحاضرات والملفات والاختبارات والنتائج والاشتراكات المرتبطة به."
                );


            if (!confirmed) {

                return;
            }


            await deleteCourse(
                courseId,
                event.target
            );


            return;
        }
    }
);


// =====================================================
// DELETE COURSE
// =====================================================

async function deleteCourse(
    courseId,
    button
) {

    const oldText =
        button.textContent;


    try {

        button.disabled =
            true;


        button.textContent =
            "جاري الحذف...";


        const response =
            await fetch(

                API_URL +
                "/courses/" +
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


        // =================================================
        // LOGIN EXPIRED
        // =================================================

        if (
            response.status === 401
        ) {

            logout();

            return;
        }


        // =================================================
        // ERROR
        // =================================================

        if (!response.ok) {

            alert(
                data.message ||
                "تعذر حذف الكورس."
            );


            return;
        }


        // =================================================
        // REMOVE COURSE FROM CACHE
        // =================================================

        teacherCourses =
            teacherCourses.filter(
                function (course) {

                    return (
                        Number(
                            course.id
                        ) !==
                        Number(
                            courseId
                        )
                    );
                }
            );


        // =================================================
        // REMOVE COURSE EXAMS FROM CACHE
        // =================================================

        teacherExams =
            teacherExams.filter(
                function (exam) {

                    return (
                        Number(
                            exam.courseId
                        ) !==
                        Number(
                            courseId
                        )
                    );
                }
            );


        // =================================================
        // REFRESH PAGE DATA
        // =================================================

        showTeacherCourses();

        showTeacherExams();

        showInitialResults();


        alert(
            data.message ||
            "تم حذف الكورس بنجاح."
        );

    }

    catch (error) {

        console.error(
            "Delete course error:",
            error
        );


        alert(
            "تعذر الاتصال بالسيرفر."
        );
    }


    finally {

        if (
            document.body.contains(
                button
            )
        ) {

            button.disabled =
                false;


            button.textContent =
                oldText;
        }
    }
}


// =====================================================
// LOAD EXAM RESULTS
// =====================================================

async function loadExamResults(
    examId
) {

    if (
        !teacherResultsContainer
    ) {

        return;
    }


    teacherResultsContainer.innerHTML = `

        <div class="teacher-empty-state">

            <p>
                جاري تحميل النتائج...
            </p>

        </div>

    `;


    try {

        const response =
            await fetch(

                API_URL +
                "/teacher-exam-results/" +
                examId,

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
            response.status === 401
        ) {

            logout();

            return;
        }


        if (!response.ok) {

            teacherResultsContainer.innerHTML = `

                <div class="teacher-empty-state">

                    <p>

                        ${
                            escapeHTML(
                                data.message ||
                                "تعذر تحميل النتائج."
                            )
                        }

                    </p>

                </div>

            `;


            return;
        }


        showExamResults(

            data.exam,

            data.results ||
            []
        );

    }

    catch (error) {

        console.error(
            "Load results error:",
            error
        );


        teacherResultsContainer.innerHTML = `

            <div class="teacher-empty-state">

                <p>
                    تعذر الاتصال بالسيرفر.
                </p>

            </div>

        `;
    }
}


// =====================================================
// SHOW EXAM RESULTS
// =====================================================

function showExamResults(
    exam,
    results
) {

    if (
        !teacherResultsContainer
    ) {

        return;
    }


    teacherResultsContainer.innerHTML =
        "";


    const title =
        document.createElement(
            "div"
        );


    title.className =
        "teacher-course-card";


    title.innerHTML = `

        <h3>

            ${
                escapeHTML(
                    exam.title
                )
            }

        </h3>


        <p>

            الكورس:

            <strong>

                ${
                    escapeHTML(
                        exam.courseTitle
                    )
                }

            </strong>

        </p>


        <p>

            عدد الطلاب الذين أدوا الاختبار:

            <strong>
                ${results.length}
            </strong>

        </p>

    `;


    teacherResultsContainer
        .appendChild(
            title
        );


    if (
        results.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "teacher-empty-state";


        empty.innerHTML = `

            <h3>
                لا توجد نتائج حتى الآن
            </h3>

            <p>
                لم يقم أي طالب بأداء هذا الاختبار بعد.
            </p>

        `;


        teacherResultsContainer
            .appendChild(
                empty
            );


        return;
    }


    results.forEach(
        function (result) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "teacher-course-card";


            const statusText =
                result.passed

                    ? "ناجح"

                    : "لم يجتز";


            const submittedDate =
                result.submittedAt

                    ? new Date(
                        result.submittedAt
                    )
                    .toLocaleString(
                        "ar-EG"
                    )

                    : "-";


            card.innerHTML = `

                <h3>

                    ${
                        escapeHTML(
                            result.studentName
                        )
                    }

                </h3>


                <p>

                    <strong>
                        البريد:
                    </strong>

                    ${
                        escapeHTML(
                            result.studentEmail
                        )
                    }

                </p>


                <p>

                    <strong>
                        الإجابات الصحيحة:
                    </strong>

                    ${result.correctAnswers}
                    /
                    ${result.totalQuestions}

                </p>


                <p>

                    <strong>
                        النتيجة:
                    </strong>

                    ${result.score}%

                </p>


                <p>

                    <strong>
                        الحالة:
                    </strong>

                    ${statusText}

                </p>


                <p>

                    <strong>
                        المخالفات:
                    </strong>

                    ${
                        result.violations ||
                        0
                    }

                </p>


                <p>

                    <strong>
                        سبب التسليم:
                    </strong>

                    ${
                        escapeHTML(
                            result.submissionReason ||
                            "-"
                        )
                    }

                </p>


                <p>

                    <strong>
                        تاريخ التسليم:
                    </strong>

                    ${submittedDate}

                </p>

            `;


            teacherResultsContainer
                .appendChild(
                    card
                );
        }
    );
}


// =====================================================
// INITIAL RESULTS
// =====================================================

function showInitialResults() {

    if (
        !teacherResultsContainer
    ) {

        return;
    }


    teacherResultsContainer.innerHTML = `

        <div class="teacher-empty-state">

            <h3>
                نتائج الطلاب
            </h3>

            <p>
                اضغط "نتائج الطلاب" على أي اختبار لعرض النتائج.
            </p>

        </div>

    `;
}


// =====================================================
// UPDATE DASHBOARD FILTER
// =====================================================

function updateTeacherDashboard() {

    showTeacherCourses();

    showTeacherExams();
}


// =====================================================
// YEAR FILTER
// =====================================================

if (
    teacherStudyYear
) {

    teacherStudyYear.addEventListener(
        "change",
        updateTeacherDashboard
    );
}


// =====================================================
// TERM FILTER
// =====================================================

if (
    teacherStudyTerm
) {

    teacherStudyTerm.addEventListener(
        "change",
        updateTeacherDashboard
    );
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    return String(
        value ??
        ""
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
    teacherLogout
) {

    teacherLogout.addEventListener(
        "click",

        function (event) {

            event.preventDefault();

            logout();
        }
    );
}


// =====================================================
// START
// =====================================================

async function startTeacherDashboard() {

    showInitialResults();

    await loadTeacherCourses();

    await loadTeacherExams();
}


startTeacherDashboard();