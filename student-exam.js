// =====================================================
// PHILOMARIA - STUDENT EXAM
// =====================================================


// =====================================================
// ELEMENTS
// =====================================================

const examTitle =
    document.getElementById("exam-title");

const examCourseTitle =
    document.getElementById("exam-course-title");

const examDuration =
    document.getElementById("exam-duration");

const examPassingGrade =
    document.getElementById("exam-passing-grade");

const examTimer =
    document.getElementById("exam-timer");

const examMessage =
    document.getElementById("exam-message");

const examForm =
    document.getElementById("student-exam-form");

const questionsContainer =
    document.getElementById(
        "exam-questions-container"
    );

const submitExamButton =
    document.getElementById(
        "submit-exam-button"
    );

const examResult =
    document.getElementById("exam-result");

const resultScore =
    document.getElementById("result-score");

const resultCorrect =
    document.getElementById("result-correct");

const resultTotal =
    document.getElementById("result-total");

const resultStatus =
    document.getElementById("result-status");

const backToCourseButton =
    document.getElementById(
        "back-to-course-button"
    );


// =====================================================
// AUTH
// =====================================================

const token =
    localStorage.getItem("token");

let currentUser =
    null;


// =====================================================
// GET EXAM ID
// =====================================================

const params =
    new URLSearchParams(
        window.location.search
    );

const examId =
    Number(
        params.get("examId")
    );


// =====================================================
// DATA
// =====================================================

let currentExam =
    null;

let timerInterval =
    null;

let remainingSeconds =
    0;

let examSubmitted =
    false;


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
// GET CURRENT USER FROM BACKEND
// =====================================================

async function loadCurrentUser() {

    if (!token) {

        logout();

        return false;
    }

    try {

        const response =
            await fetch(
                API_URL +
                "/auth/me",
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


        // =============================================
        // SESSION EXPIRED
        // =============================================

        if (
            response.status ===
            401
        ) {

            logout();

            return false;
        }


        // =============================================
        // ACCOUNT NOT AVAILABLE
        // =============================================

        if (
            response.status ===
            403
        ) {

            localStorage.removeItem(
                "currentUser"
            );

            alert(
                data.message ||
                "هذا الحساب غير متاح حاليًا."
            );

            window.location.href =
                "login.html";

            return false;
        }


        // =============================================
        // ERROR
        // =============================================

        if (
            !response.ok ||
            !data.user
        ) {

            showExamError(
                data.message ||
                "تعذر تحميل بيانات المستخدم."
            );

            return false;
        }


        currentUser =
            data.user;


        // =============================================
        // UPDATE LOCAL CACHE
        // =============================================

        localStorage.setItem(
            "currentUser",
            JSON.stringify(
                currentUser
            )
        );


        // =============================================
        // STUDENT ONLY
        // =============================================

        if (
            currentUser.role !==
            "student"
        ) {

            alert(
                "هذه الصفحة متاحة للطلاب فقط."
            );

            if (
                currentUser.role ===
                "teacher"
            ) {

                window.location.href =
                    "teacher.html";
            }

            else if (
                currentUser.role ===
                "admin"
            ) {

                window.location.href =
                    "admin.html";
            }

            else {

                logout();
            }

            return false;
        }


        return true;

    }

    catch (error) {

        console.error(
            "Load current user error:",
            error
        );

        showExamError(
            "تعذر الاتصال بالسيرفر أثناء التحقق من المستخدم."
        );

        return false;
    }
}


// =====================================================
// START PAGE
// =====================================================

async function startExamPage() {

    if (!token) {

        logout();

        return;
    }


    if (
        !examId ||
        Number.isNaN(
            examId
        )
    ) {

        showExamError(
            "رقم الامتحان غير صحيح."
        );

        return;
    }


    const userIsValid =
        await loadCurrentUser();


    if (!userIsValid) {

        return;
    }


    await loadExam();
}


// =====================================================
// LOAD EXAM
// =====================================================

async function loadExam() {

    try {

        const response =
            await fetch(
                API_URL +
                "/student-exams/" +
                examId,
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


        // =============================================
        // SESSION EXPIRED
        // =============================================

        if (
            response.status ===
            401
        ) {

            logout();

            return;
        }


        // =============================================
        // ALREADY ATTEMPTED
        // =============================================

        if (
            response.status ===
                403 &&
            data.alreadyAttempted
        ) {

            showPreviousResult(
                data
            );

            return;
        }


        // =============================================
        // EXAM EXPIRED
        // =============================================

        if (
            response.status ===
                403 &&
            data.examExpired
        ) {

            showExpiredExam(
                data.message ||
                "انتهى وقت الامتحان."
            );

            return;
        }


        // =============================================
        // PAYMENT REQUIRED
        // =============================================

        if (
            response.status ===
                403 &&
            data.requiresPurchase
        ) {

            showExamError(
                data.message ||
                "يجب شراء الكورس أولاً."
            );

            return;
        }


        // =============================================
        // OTHER FORBIDDEN
        // =============================================

        if (
            response.status ===
            403
        ) {

            showExamError(
                data.message ||
                "غير مسموح لك بفتح هذا الامتحان."
            );

            return;
        }


        // =============================================
        // OTHER ERROR
        // =============================================

        if (!response.ok) {

            showExamError(
                data.message ||
                "تعذر تحميل الامتحان."
            );

            return;
        }


        currentExam =
            data.exam;


        if (!currentExam) {

            showExamError(
                "بيانات الامتحان غير متاحة."
            );

            return;
        }


        showExam(
            currentExam
        );


        // =============================================
        // IMPORTANT:
        // USE SERVER REMAINING TIME
        // =============================================

        const serverRemainingSeconds =
            Number(
                currentExam
                    .remainingSeconds
            );


        if (
            !Number.isFinite(
                serverRemainingSeconds
            ) ||
            serverRemainingSeconds <=
                0
        ) {

            showExpiredExam(
                "انتهى وقت الامتحان."
            );

            return;
        }


        startTimer(
            serverRemainingSeconds
        );

    }

    catch (error) {

        console.error(
            "Load exam error:",
            error
        );

        showExamError(
            "تعذر الاتصال بالسيرفر."
        );
    }
}


// =====================================================
// SHOW EXAM
// =====================================================

function showExam(
    exam
) {

    if (!exam) {

        return;
    }


    if (examTitle) {

        examTitle.textContent =
            exam.title ||
            "الامتحان";
    }


    if (examCourseTitle) {

        examCourseTitle.textContent =
            exam.courseTitle ||
            "";
    }


    if (examDuration) {

        examDuration.textContent =
            exam.duration ||
            "-";
    }


    if (examPassingGrade) {

        examPassingGrade.textContent =
            exam.passingGrade ||
            "-";
    }


    if (
        backToCourseButton &&
        exam.courseId
    ) {

        backToCourseButton.href =
            "course.html?id=" +
            exam.courseId;
    }


    showQuestions(
        exam.questions ||
        []
    );
}


// =====================================================
// SHOW QUESTIONS
// =====================================================

function showQuestions(
    questions
) {

    if (!questionsContainer) {

        return;
    }


    questionsContainer.innerHTML =
        "";


    if (
        questions.length ===
        0
    ) {

        questionsContainer.innerHTML = `
            <p>
                لا توجد أسئلة في هذا الامتحان.
            </p>
        `;


        if (
            submitExamButton
        ) {

            submitExamButton.disabled =
                true;
        }


        return;
    }


    questions.forEach(
        function (
            question,
            index
        ) {

            const questionCard =
                document.createElement(
                    "div"
                );


            questionCard.className =
                "exam-question-card";


            const answersHTML =
                (
                    question.answers ||
                    []
                )

                    .map(
                        function (
                            answer
                        ) {

                            return `
                                <label
                                    class="exam-answer"
                                >
                                    <input
                                        type="radio"
                                        name="question-${question.id}"
                                        value="${answer.id}"
                                    >

                                    <span>
                                        ${escapeHTML(
                                            answer.answerText
                                        )}
                                    </span>
                                </label>
                            `;
                        }
                    )

                    .join("");


            questionCard.innerHTML = `
                <h3>
                    السؤال ${index + 1}
                </h3>

                <p>
                    ${escapeHTML(
                        question.questionText
                    )}
                </p>

                <div
                    class="exam-answers"
                >
                    ${answersHTML}
                </div>
            `;


            questionsContainer
                .appendChild(
                    questionCard
                );
        }
    );
}


// =====================================================
// START TIMER
// SERVER-SIDE REMAINING SECONDS
// =====================================================

function startTimer(
    secondsFromServer
) {

    // =============================================
    // CLEAR OLD TIMER
    // =============================================

    if (
        timerInterval
    ) {

        clearInterval(
            timerInterval
        );

        timerInterval =
            null;
    }


    // =============================================
    // USE SERVER TIME
    // NOT duration * 60
    // =============================================

    remainingSeconds =
        Math.max(
            0,
            Math.floor(
                Number(
                    secondsFromServer
                ) || 0
            )
        );


    updateTimerDisplay();


    if (
        remainingSeconds <=
        0
    ) {

        handleTimerExpired();

        return;
    }


    timerInterval =
        setInterval(
            function () {

                remainingSeconds--;

                updateTimerDisplay();


                if (
                    remainingSeconds <=
                    0
                ) {

                    clearInterval(
                        timerInterval
                    );

                    timerInterval =
                        null;

                    handleTimerExpired();
                }
            },
            1000
        );
}


// =====================================================
// TIMER EXPIRED
// =====================================================

function handleTimerExpired() {

    if (
        examSubmitted
    ) {

        return;
    }


    remainingSeconds =
        0;


    updateTimerDisplay();


    disableExamInputs();


    alert(
        "انتهى وقت الامتحان وسيتم التسليم تلقائيًا."
    );


    submitExam(
        "timer_expired"
    );
}


// =====================================================
// TIMER DISPLAY
// =====================================================

function updateTimerDisplay() {

    if (!examTimer) {

        return;
    }


    const safeSeconds =
        Math.max(
            0,
            remainingSeconds
        );


    const minutes =
        Math.floor(
            safeSeconds /
            60
        );


    const seconds =
        safeSeconds %
        60;


    examTimer.textContent =
        String(
            minutes
        )
            .padStart(
                2,
                "0"
            )

        +

        ":"

        +

        String(
            seconds
        )
            .padStart(
                2,
                "0"
            );
}


// =====================================================
// FORM SUBMIT
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


            if (
                examSubmitted
            ) {

                return;
            }


            // =============================================
            // CLIENT TIMER CHECK
            // SERVER WILL CHECK AGAIN
            // =============================================

            if (
                remainingSeconds <=
                0
            ) {

                alert(
                    "انتهى وقت الامتحان."
                );

                return;
            }


            // =============================================
            // CHECK ALL QUESTIONS ANSWERED
            // =============================================

            const unansweredQuestions =
                getUnansweredQuestions();


            if (
                unansweredQuestions.length >
                0
            ) {

                alert(
                    "يجب الإجابة على جميع الأسئلة قبل تسليم الامتحان."
                );


                const firstQuestion =
                    document.querySelector(
                        `input[name="question-${unansweredQuestions[0]}"]`
                    );


                if (
                    firstQuestion
                ) {

                    firstQuestion
                        .closest(
                            ".exam-question-card"
                        )
                        ?.scrollIntoView({
                            behavior:
                                "smooth",

                            block:
                                "center"
                        });
                }


                return;
            }


            const confirmed =
                confirm(
                    "هل أنت متأكد من تسليم الامتحان؟"
                );


            if (!confirmed) {

                return;
            }


            await submitExam(
                "manual"
            );
        }
    );
}


// =====================================================
// GET UNANSWERED QUESTIONS
// =====================================================

function getUnansweredQuestions() {

    if (
        !currentExam ||
        !Array.isArray(
            currentExam.questions
        )
    ) {

        return [];
    }


    return currentExam.questions

        .filter(
            function (
                question
            ) {

                const selected =
                    document.querySelector(
                        `input[name="question-${question.id}"]:checked`
                    );


                return !selected;
            }
        )

        .map(
            function (
                question
            ) {

                return question.id;
            }
        );
}


// =====================================================
// COLLECT ANSWERS
// =====================================================

function collectAnswers() {

    if (
        !currentExam ||
        !Array.isArray(
            currentExam.questions
        )
    ) {

        return [];
    }


    return currentExam.questions.map(
        function (
            question
        ) {

            const selectedAnswer =
                document.querySelector(
                    `input[name="question-${question.id}"]:checked`
                );


            return {

                questionId:
                    question.id,

                answerId:
                    selectedAnswer

                        ? Number(
                            selectedAnswer.value
                        )

                        : null
            };
        }
    );
}


// =====================================================
// SUBMIT EXAM
// =====================================================

async function submitExam(
    submissionReason
) {

    if (
        examSubmitted ||
        !currentExam
    ) {

        return;
    }


    const answers =
        collectAnswers();


    try {

        if (
            submitExamButton
        ) {

            submitExamButton.disabled =
                true;

            submitExamButton.textContent =
                "جاري تسليم الامتحان...";
        }


        const response =
            await fetch(
                API_URL +
                "/student-exam-submit",
                {
                    method:
                        "POST",

                    headers: {
                        Authorization:
                            "Bearer " +
                            token,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            examId:
                                examId,

                            answers:
                                answers,

                            violations:
                                0,

                            submissionReason:
                                submissionReason
                        })
                }
            );


        const data =
            await response.json();


        // =============================================
        // SESSION EXPIRED
        // =============================================

        if (
            response.status ===
            401
        ) {

            logout();

            return;
        }


        // =============================================
        // EXAM EXPIRED
        // =============================================

        if (
            response.status ===
                403 &&
            data.examExpired
        ) {

            examSubmitted =
                true;

            stopTimer();

            showExpiredExam(
                data.message ||
                "انتهى وقت الامتحان ولا يمكن تسليمه الآن."
            );

            return;
        }


        // =============================================
        // NO ATTEMPT
        // =============================================

        if (
            response.status ===
                403 &&
            data.noAttempt
        ) {

            stopTimer();

            showExamError(
                data.message ||
                "يجب فتح الامتحان أولاً قبل تسليمه."
            );

            return;
        }


        // =============================================
        // ALREADY ATTEMPTED
        // =============================================

        if (
            response.status ===
                403 &&
            data.alreadyAttempted
        ) {

            examSubmitted =
                true;

            stopTimer();

            showPreviousResult(
                data
            );

            return;
        }


        // =============================================
        // ERROR
        // =============================================

        if (!response.ok) {

            alert(
                data.message ||
                "تعذر تسليم الامتحان."
            );


            if (
                submitExamButton
            ) {

                submitExamButton.disabled =
                    false;

                submitExamButton.textContent =
                    "تسليم الامتحان";
            }


            return;
        }


        // =============================================
        // SUCCESS
        // =============================================

        examSubmitted =
            true;


        stopTimer();


        showResult(
            data.result
        );

    }

    catch (error) {

        console.error(
            "Submit exam error:",
            error
        );


        alert(
            "تعذر الاتصال بالسيرفر."
        );


        if (
            submitExamButton &&
            !examSubmitted
        ) {

            submitExamButton.disabled =
                false;

            submitExamButton.textContent =
                "تسليم الامتحان";
        }
    }
}


// =====================================================
// STOP TIMER
// =====================================================

function stopTimer() {

    if (
        timerInterval
    ) {

        clearInterval(
            timerInterval
        );

        timerInterval =
            null;
    }
}


// =====================================================
// DISABLE EXAM INPUTS
// =====================================================

function disableExamInputs() {

    const inputs =
        document.querySelectorAll(
            '.exam-answer input[type="radio"]'
        );


    inputs.forEach(
        function (
            input
        ) {

            input.disabled =
                true;
        }
    );


    if (
        submitExamButton
    ) {

        submitExamButton.disabled =
            true;
    }
}


// =====================================================
// SHOW RESULT
// =====================================================

function showResult(
    result
) {

    if (!result) {

        return;
    }


    if (
        examForm
    ) {

        examForm.hidden =
            true;
    }


    if (
        examResult
    ) {

        examResult.hidden =
            false;
    }


    if (
        resultScore
    ) {

        resultScore.textContent =
            result.score;
    }


    if (
        resultCorrect
    ) {

        resultCorrect.textContent =
            result.correctAnswers;
    }


    if (
        resultTotal
    ) {

        resultTotal.textContent =
            result.totalQuestions;
    }


    if (
        resultStatus
    ) {

        resultStatus.textContent =
            result.passed

                ? "ناجح"

                : "لم يجتز";
    }


    if (
        examMessage
    ) {

        examMessage.textContent =
            "تم تسليم الامتحان بنجاح.";
    }


    window.scrollTo({
        top:
            0,

        behavior:
            "smooth"
    });
}


// =====================================================
// SHOW PREVIOUS RESULT
// =====================================================

function showPreviousResult(
    data
) {

    examSubmitted =
        true;


    stopTimer();


    if (
        examForm
    ) {

        examForm.hidden =
            true;
    }


    if (
        examResult
    ) {

        examResult.hidden =
            false;
    }


    if (
        examTitle
    ) {

        examTitle.textContent =
            "تم أداء هذا الامتحان سابقًا";
    }


    if (
        examMessage
    ) {

        examMessage.textContent =
            data.message ||
            "لقد قمت بأداء هذا الامتحان من قبل.";
    }


    if (
        data.result
    ) {

        if (
            resultScore
        ) {

            resultScore.textContent =
                data.result.score;
        }


        if (
            resultStatus
        ) {

            resultStatus.textContent =
                data.result.passed

                    ? "ناجح"

                    : "لم يجتز";
        }
    }


    if (
        resultCorrect
    ) {

        resultCorrect.textContent =
            "-";
    }


    if (
        resultTotal
    ) {

        resultTotal.textContent =
            "-";
    }
}


// =====================================================
// SHOW EXPIRED EXAM
// =====================================================

function showExpiredExam(
    message
) {

    examSubmitted =
        true;


    stopTimer();


    remainingSeconds =
        0;


    updateTimerDisplay();


    disableExamInputs();


    if (
        examTitle
    ) {

        examTitle.textContent =
            "انتهى وقت الامتحان";
    }


    if (
        examMessage
    ) {

        examMessage.textContent =
            message ||
            "انتهى وقت الامتحان.";
    }


    if (
        examForm
    ) {

        examForm.hidden =
            true;
    }
}


// =====================================================
// SHOW ERROR
// =====================================================

function showExamError(
    message
) {

    stopTimer();


    if (
        examTitle
    ) {

        examTitle.textContent =
            "لا يمكن فتح الامتحان";
    }


    if (
        examMessage
    ) {

        examMessage.textContent =
            message;
    }


    if (
        questionsContainer
    ) {

        questionsContainer.innerHTML =
            "";
    }


    if (
        submitExamButton
    ) {

        submitExamButton.disabled =
            true;

        submitExamButton.hidden =
            true;
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
// START
// =====================================================

startExamPage();