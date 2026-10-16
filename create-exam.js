// =====================================================
// PHILOMARIA - CREATE EXAM
// =====================================================


// =====================================================
// YEAR / TERM NAMES
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
// ELEMENTS
// =====================================================

const examForm =
    document.getElementById(
        "exam-form"
    );


const examCourse =
    document.getElementById(
        "exam-course"
    );


const examType =
    document.getElementById(
        "exam-type"
    );


const lectureSelectWrapper =
    document.getElementById(
        "lecture-select-wrapper"
    );


const examLecture =
    document.getElementById(
        "exam-lecture"
    );


const questionsContainer =
    document.getElementById(
        "questions-container"
    );


const addQuestionButton =
    document.getElementById(
        "add-question-button"
    );


let questionCount =
    1;


let teacherCourses =
    [];


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


if (
    currentUserData
) {

    try {

        currentUser =
            JSON.parse(
                currentUserData
            );
    }

    catch (
        error
    ) {

        console.error(
            "Current user error:",
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
    currentUser.role !==
        "teacher" &&
    currentUser.role !==
        "admin"
) {

    alert(
        "غير مسموح لك بإنشاء اختبار."
    );


    window.location.href =
        "login.html";
}


// =====================================================
// COURSE FROM URL
// =====================================================

const params =
    new URLSearchParams(
        window.location.search
    );


const selectedCourseId =
    params.get(
        "courseId"
    );


// =====================================================
// LOAD COURSES
// =====================================================

async function loadCourses() {

    if (
        !examCourse
    ) {

        return;
    }


    examCourse.innerHTML = `

        <option value="">
            جاري تحميل الكورسات...
        </option>

    `;


    examCourse.disabled =
        true;


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
            response.status ===
            401
        ) {

            logout();

            return;
        }


        if (
            response.status ===
            403
        ) {

            alert(
                data.message ||
                "غير مسموح لك بتحميل الكورسات."
            );

            return;
        }


        if (
            !response.ok
        ) {

            examCourse.innerHTML = `

                <option value="">
                    فشل تحميل الكورسات
                </option>

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


        fillCourseSelect();

    }

    catch (
        error
    ) {

        console.error(
            "Load courses error:",
            error
        );


        examCourse.innerHTML = `

            <option value="">
                تعذر الاتصال بالسيرفر
            </option>

        `;
    }
}


// =====================================================
// FILL COURSE SELECT
// =====================================================

function fillCourseSelect() {

    if (
        !examCourse
    ) {

        return;
    }


    examCourse.innerHTML = `

        <option value="">
            اختر الكورس
        </option>

    `;


    if (
        teacherCourses.length ===
        0
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            "";


        option.textContent =
            "لا توجد كورسات. أنشئ كورس أولاً.";


        option.disabled =
            true;


        examCourse.appendChild(
            option
        );


        examCourse.disabled =
            true;


        return;
    }


    examCourse.disabled =
        false;


    teacherCourses.forEach(
        function (
            course
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                course.id;


            const yearName =
                yearNames[
                    String(
                        course.studyYear
                    )
                ] ||
                "";


            const termName =
                termNames[
                    String(
                        course.studyTerm
                    )
                ] ||
                "";


            option.textContent =
                course.title +

                (
                    yearName
                        ? " - " +
                          yearName
                        : ""
                ) +

                (
                    termName
                        ? " - " +
                          termName
                        : ""
                );


            examCourse.appendChild(
                option
            );
        }
    );


    if (
        selectedCourseId
    ) {

        const exists =
            teacherCourses.some(
                function (
                    course
                ) {

                    return (
                        Number(
                            course.id
                        ) ===
                        Number(
                            selectedCourseId
                        )
                    );
                }
            );


        if (
            exists
        ) {

            examCourse.value =
                selectedCourseId;
        }
    }
}


// =====================================================
// LOAD LECTURES
// =====================================================

async function loadLectures(
    courseId
) {

    if (
        !examLecture
    ) {

        return;
    }


    examLecture.innerHTML = `

        <option value="">
            اختر المحاضرة
        </option>

    `;


    if (
        !courseId
    ) {

        examLecture.disabled =
            true;

        return;
    }


    examLecture.disabled =
        true;


    examLecture.innerHTML = `

        <option value="">
            جاري تحميل المحاضرات...
        </option>

    `;


    try {

        const response =
            await fetch(

                API_URL +
                "/course-contents/course/" +
                courseId,

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
            response.status ===
            401
        ) {

            logout();

            return;
        }


        if (
            !response.ok
        ) {

            examLecture.innerHTML = `

                <option value="">
                    ${
                        escapeHTML(
                            data.message ||
                            "فشل تحميل المحاضرات"
                        )
                    }
                </option>

            `;

            return;
        }


        const contents =
            Array.isArray(
                data.contents
            )
                ? data.contents
                : [];


        const lectures =
            contents.filter(
                function (
                    content
                ) {

                    return (
                        content.type ===
                        "lecture"
                    );
                }
            );


        examLecture.innerHTML = `

            <option value="">
                اختر المحاضرة
            </option>

        `;


        if (
            lectures.length ===
            0
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                "";


            option.textContent =
                "لا توجد محاضرات في هذا الكورس";


            option.disabled =
                true;


            examLecture.appendChild(
                option
            );


            examLecture.disabled =
                true;


            return;
        }


        lectures.forEach(
            function (
                lecture
            ) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    lecture.id;


                option.textContent =
                    lecture.title;


                examLecture.appendChild(
                    option
                );
            }
        );


        examLecture.disabled =
            false;

    }

    catch (
        error
    ) {

        console.error(
            "Load lectures error:",
            error
        );


        examLecture.innerHTML = `

            <option value="">
                تعذر الاتصال بالسيرفر
            </option>

        `;
    }
}


// =====================================================
// EXAM TYPE CHANGE
// =====================================================

if (
    examType
) {

    examType.addEventListener(
        "change",

        function () {

            if (
                examType.value ===
                "lecture"
            ) {

                lectureSelectWrapper.style.display =
                    "block";


                examLecture.required =
                    true;


                loadLectures(
                    examCourse.value
                );
            }

            else {

                lectureSelectWrapper.style.display =
                    "none";


                examLecture.required =
                    false;


                examLecture.value =
                    "";
            }
        }
    );
}


// =====================================================
// COURSE CHANGE
// =====================================================

if (
    examCourse
) {

    examCourse.addEventListener(
        "change",

        function () {

            if (
                examType.value ===
                "lecture"
            ) {

                loadLectures(
                    examCourse.value
                );
            }

            else {

                examLecture.value =
                    "";
            }
        }
    );
}


// =====================================================
// ADD QUESTION
// =====================================================

if (
    addQuestionButton &&
    questionsContainer
) {

    addQuestionButton.addEventListener(
        "click",

        function () {

            questionCount++;


            const question =
                document.createElement(
                    "div"
                );


            question.className =
                "question-builder";


            question.dataset.questionNumber =
                questionCount;


            question.innerHTML = `

                <h2>
                    السؤال ${questionCount}
                </h2>


                <label
                    for="question-${questionCount}"
                >
                    السؤال
                </label>


                <input
                    type="text"
                    id="question-${questionCount}"
                    class="question-input"
                    placeholder="اكتب السؤال هنا"
                    required
                >


                <label>
                    الإجابات
                </label>


                <div class="answer-option">

                    <input
                        type="radio"
                        name="correct-answer-${questionCount}"
                        value="1"
                        required
                    >

                    <input
                        type="text"
                        class="answer-input"
                        placeholder="الإجابة الأولى"
                        required
                    >

                </div>


                <div class="answer-option">

                    <input
                        type="radio"
                        name="correct-answer-${questionCount}"
                        value="2"
                    >

                    <input
                        type="text"
                        class="answer-input"
                        placeholder="الإجابة الثانية"
                        required
                    >

                </div>


                <div class="answer-option">

                    <input
                        type="radio"
                        name="correct-answer-${questionCount}"
                        value="3"
                    >

                    <input
                        type="text"
                        class="answer-input"
                        placeholder="الإجابة الثالثة"
                        required
                    >

                </div>


                <div class="answer-option">

                    <input
                        type="radio"
                        name="correct-answer-${questionCount}"
                        value="4"
                    >

                    <input
                        type="text"
                        class="answer-input"
                        placeholder="الإجابة الرابعة"
                        required
                    >

                </div>

            `;


            questionsContainer.appendChild(
                question
            );
        }
    );
}


// =====================================================
// GET QUESTIONS
// =====================================================

function getQuestionsFromForm() {

    const questionBuilders =
        document.querySelectorAll(
            ".question-builder"
        );


    const questions =
        [];


    let hasError =
        false;


    questionBuilders.forEach(
        function (
            builder,
            index
        ) {

            const questionNumber =
                builder.dataset.questionNumber ||
                index + 1;


            const questionInput =
                builder.querySelector(
                    ".question-input"
                ) ||
                builder.querySelector(
                    'input[type="text"]:not(.answer-input)'
                );


            const answerInputs =
                builder.querySelectorAll(
                    ".answer-input"
                );


            const correctAnswer =
                builder.querySelector(
                    `input[name="correct-answer-${questionNumber}"]:checked`
                );


            if (
                !questionInput ||
                !questionInput.value.trim()
            ) {

                hasError =
                    true;

                return;
            }


            if (
                !correctAnswer
            ) {

                hasError =
                    true;

                return;
            }


            const answers =
                [];


            answerInputs.forEach(
                function (
                    input,
                    answerIndex
                ) {

                    const answerText =
                        input.value.trim();


                    answers.push({

                        answerText:
                            answerText,

                        isCorrect:
                            Number(
                                correctAnswer.value
                            ) ===
                            (
                                answerIndex +
                                1
                            )
                    });
                }
            );


            const emptyAnswer =
                answers.some(
                    function (
                        answer
                    ) {

                        return (
                            !answer.answerText
                        );
                    }
                );


            if (
                emptyAnswer
            ) {

                hasError =
                    true;

                return;
            }


            questions.push({

                questionText:
                    questionInput.value.trim(),

                answers:
                    answers
            });
        }
    );


    if (
        hasError
    ) {

        return {

            success:
                false,

            questions:
                []
        };
    }


    return {

        success:
            true,

        questions:
            questions
    };
}


// =====================================================
// CREATE EXAM
// =====================================================

async function createExam(
    examData
) {

    const response =
        await fetch(

            API_URL +
            "/exams",

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
                        examData
                    )
            }
        );


    const data =
        await response.json();


    if (
        response.status ===
        401
    ) {

        logout();


        throw new Error(
            "انتهت جلسة تسجيل الدخول."
        );
    }


    if (
        !response.ok
    ) {

        throw new Error(
            data.message ||
            "فشل إنشاء الاختبار."
        );
    }


    return data.exam;
}


// =====================================================
// ADD QUESTION
// =====================================================

async function addQuestionToExam(
    examId,
    question
) {

    const response =
        await fetch(

            API_URL +
            "/exam-questions",

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
                    JSON.stringify({

                        examId:
                            examId,

                        questionText:
                            question.questionText,

                        answers:
                            question.answers
                    })
            }
        );


    const data =
        await response.json();


    if (
        response.status ===
        401
    ) {

        logout();


        throw new Error(
            "انتهت جلسة تسجيل الدخول."
        );
    }


    if (
        !response.ok
    ) {

        throw new Error(
            data.message ||
            "فشل حفظ أحد الأسئلة."
        );
    }


    return data;
}


// =====================================================
// SUBMIT
// =====================================================

if (
    examForm
) {

    examForm.addEventListener(
        "submit",

        async function (
            event
        ) {

            event.preventDefault();


            const courseId =
                Number(
                    examCourse.value
                );


            const selectedExamType =
                examType.value;


            let lectureId =
                null;


            if (
                selectedExamType ===
                "lecture"
            ) {

                lectureId =
                    Number(
                        examLecture.value
                    );
            }


            const title =
                document
                    .getElementById(
                        "exam-title"
                    )
                    .value
                    .trim();


            const duration =
                Number(
                    document
                        .getElementById(
                            "exam-duration"
                        )
                        .value
                );


            const passingGrade =
                Number(
                    document
                        .getElementById(
                            "passing-grade"
                        )
                        .value
                );


            // =================================================
            // VALIDATION
            // =================================================

            if (
                !courseId
            ) {

                alert(
                    "اختر الكورس أولاً."
                );


                return;
            }


            if (
                !selectedExamType
            ) {

                alert(
                    "اختر نوع الاختبار."
                );


                return;
            }


            if (
                selectedExamType ===
                    "lecture" &&
                !lectureId
            ) {

                alert(
                    "اختر المحاضرة أولاً."
                );


                return;
            }


            if (
                !title
            ) {

                alert(
                    "اكتب اسم الاختبار."
                );


                return;
            }


            if (
                !Number.isFinite(
                    duration
                ) ||
                duration <
                    1
            ) {

                alert(
                    "مدة الاختبار يجب أن تكون دقيقة واحدة على الأقل."
                );


                return;
            }


            if (
                !Number.isFinite(
                    passingGrade
                ) ||
                passingGrade <
                    0 ||
                passingGrade >
                    100
            ) {

                alert(
                    "درجة النجاح يجب أن تكون بين 0 و 100."
                );


                return;
            }


            const questionsResult =
                getQuestionsFromForm();


            if (
                !questionsResult.success
            ) {

                alert(
                    "تأكد من كتابة جميع الأسئلة والإجابات واختيار الإجابة الصحيحة."
                );


                return;
            }


            const questions =
                questionsResult.questions;


            if (
                questions.length ===
                0
            ) {

                alert(
                    "أضف سؤالاً واحدًا على الأقل."
                );


                return;
            }


            const submitButton =
                examForm.querySelector(
                    'button[type="submit"]'
                );


            const oldButtonText =
                submitButton
                    ? submitButton.textContent
                    : "";


            try {

                if (
                    submitButton
                ) {

                    submitButton.disabled =
                        true;


                    submitButton.textContent =
                        "جاري إنشاء الاختبار...";
                }


                const exam =
                    await createExam({

                        courseId:
                            courseId,

                        lectureId:
                            lectureId,

                        title:
                            title,

                        duration:
                            duration,

                        passingGrade:
                            passingGrade
                    });


                for (
                    let index = 0;
                    index <
                    questions.length;
                    index++
                ) {

                    if (
                        submitButton
                    ) {

                        submitButton.textContent =
                            "جاري حفظ السؤال " +
                            (
                                index +
                                1
                            ) +
                            " من " +
                            questions.length;
                    }


                    await addQuestionToExam(
                        exam.id,
                        questions[
                            index
                        ]
                    );
                }


                alert(
                    "تم إنشاء الاختبار وإضافة الأسئلة بنجاح."
                );


                window.location.href =
                    "teacher.html";
            }


            catch (
                error
            ) {

                console.error(
                    "Create exam error:",
                    error
                );


                alert(
                    error.message ||
                    "حدث خطأ أثناء إنشاء الاختبار."
                );
            }


            finally {

                if (
                    submitButton
                ) {

                    submitButton.disabled =
                        false;


                    submitButton.textContent =
                        oldButtonText;
                }
            }
        }
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
// START
// =====================================================

loadCourses();