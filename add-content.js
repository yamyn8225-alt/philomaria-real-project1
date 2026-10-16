// =====================================================
// PHILOMARIA - ADD CONTENT
// =====================================================


// =====================================================
// ELEMENTS
// =====================================================

const contentForm =
    document.getElementById(
        "content-form"
    );

const courseSelect =
    document.getElementById(
        "content-course"
    );

const contentType =
    document.getElementById(
        "content-type"
    );

const videoField =
    document.getElementById(
        "video-field"
    );

const fileField =
    document.getElementById(
        "file-field"
    );

const videoUrlInput =
    document.getElementById(
        "video-url"
    );

const fileInput =
    document.getElementById(
        "content-file"
    );

const addContentButton =
    document.getElementById(
        "add-content-button"
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

    } catch (error) {

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
    currentUser.role !== "teacher" &&
    currentUser.role !== "admin"
) {

    alert(
        "غير مسموح لك بإضافة محتوى."
    );

    window.location.href =
        "student.html";
}


// =====================================================
// GET COURSE ID FROM URL
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
// LOGOUT ON EXPIRED SESSION
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
// LOAD TEACHER COURSES
// =====================================================

async function loadTeacherCourses() {

    if (!courseSelect) {
        return;
    }


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


        // =================================================
        // SESSION EXPIRED
        // =================================================

        if (
            response.status === 401
        ) {

            alert(
                "انتهت جلسة تسجيل الدخول."
            );

            logout();

            return;
        }


        // =================================================
        // FORBIDDEN
        // =================================================

        if (
            response.status === 403
        ) {

            alert(
                data.message ||
                "غير مسموح لك بتحميل الكورسات."
            );

            return;
        }


        // =================================================
        // OTHER ERROR
        // =================================================

        if (!response.ok) {

            alert(
                data.message ||
                "حدث خطأ أثناء تحميل الكورسات."
            );

            return;
        }


        // =================================================
        // COURSES ARRAY
        // =================================================

        let courses = [];


        if (
            Array.isArray(
                data
            )
        ) {

            courses =
                data;
        }

        else if (
            Array.isArray(
                data.courses
            )
        ) {

            courses =
                data.courses;
        }

        else if (
            Array.isArray(
                data.data
            )
        ) {

            courses =
                data.data;
        }


        // =================================================
        // RESET SELECT
        // =================================================

        courseSelect.innerHTML = `
            <option value="">
                اختر الكورس
            </option>
        `;


        // =================================================
        // NO COURSES
        // =================================================

        if (
            courses.length === 0
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

            courseSelect.appendChild(
                option
            );

            return;
        }


        // =================================================
        // SHOW COURSES
        // =================================================

        courses.forEach(
            function (course) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    course.id;


                const yearName =
                    yearNames[
                        course.studyYear
                    ] ||
                    "";


                const termName =
                    termNames[
                        course.studyTerm
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


                courseSelect.appendChild(
                    option
                );
            }
        );


        // =================================================
        // AUTO SELECT FROM URL
        // =================================================

        if (
            selectedCourseId
        ) {

            courseSelect.value =
                selectedCourseId;
        }

    }

    catch (error) {

        console.error(
            "Load teacher courses error:",
            error
        );

        alert(
            "تعذر الاتصال بالسيرفر."
        );
    }
}


// =====================================================
// SHOW / HIDE FIELDS
// =====================================================

function updateContentFields() {

    if (
        !contentType ||
        !videoField ||
        !fileField
    ) {

        return;
    }


    // =================================================
    // LECTURE
    // =================================================

    if (
        contentType.value ===
        "lecture"
    ) {

        videoField.hidden =
            false;

        fileField.hidden =
            true;


        if (
            videoUrlInput
        ) {

            videoUrlInput.required =
                true;
        }


        if (
            fileInput
        ) {

            fileInput.required =
                false;

            fileInput.value =
                "";
        }
    }


    // =================================================
    // FILE
    // =================================================

    else if (
        contentType.value ===
        "file"
    ) {

        videoField.hidden =
            true;

        fileField.hidden =
            false;


        if (
            videoUrlInput
        ) {

            videoUrlInput.required =
                false;

            videoUrlInput.value =
                "";
        }


        if (
            fileInput
        ) {

            fileInput.required =
                true;
        }
    }


    // =================================================
    // NOTHING SELECTED
    // =================================================

    else {

        videoField.hidden =
            true;

        fileField.hidden =
            true;


        if (
            videoUrlInput
        ) {

            videoUrlInput.required =
                false;

            videoUrlInput.value =
                "";
        }


        if (
            fileInput
        ) {

            fileInput.required =
                false;

            fileInput.value =
                "";
        }
    }
}


// =====================================================
// CONTENT TYPE CHANGE
// =====================================================

if (
    contentType
) {

    updateContentFields();

    contentType.addEventListener(
        "change",
        updateContentFields
    );
}


// =====================================================
// CHECK YOUTUBE URL
// =====================================================

function isYouTubeUrl(
    url
) {

    try {

        const parsedUrl =
            new URL(
                url
            );


        return (

            parsedUrl.hostname.includes(
                "youtube.com"
            )

            ||

            parsedUrl.hostname.includes(
                "youtu.be"
            )
        );

    }

    catch (error) {

        return false;
    }
}


// =====================================================
// SUBMIT CONTENT
// =====================================================

if (
    contentForm
) {

    contentForm.addEventListener(
        "submit",

        async function (event) {

            event.preventDefault();


            const courseId =
                Number(
                    courseSelect.value
                );


            const type =
                contentType.value;


            const title =
                document
                    .getElementById(
                        "content-title"
                    )
                    .value
                    .trim();


            const description =
                document
                    .getElementById(
                        "content-description"
                    )
                    .value
                    .trim();


            // =================================================
            // VALIDATION
            // =================================================

            if (!courseId) {

                alert(
                    "اختر الكورس أولاً."
                );

                return;
            }


            if (!type) {

                alert(
                    "اختر نوع المحتوى."
                );

                return;
            }


            if (!title) {

                alert(
                    "اكتب عنوان المحتوى."
                );

                return;
            }


            // =================================================
            // LECTURE
            // =================================================

            if (
                type ===
                "lecture"
            ) {

                const videoUrl =
                    videoUrlInput

                        ? videoUrlInput
                            .value
                            .trim()

                        : "";


                if (!videoUrl) {

                    alert(
                        "اكتب رابط فيديو YouTube."
                    );

                    return;
                }


                if (
                    !isYouTubeUrl(
                        videoUrl
                    )
                ) {

                    alert(
                        "من فضلك أدخل رابط YouTube صحيح."
                    );

                    return;
                }


                await createLecture(
                    courseId,
                    title,
                    description,
                    videoUrl
                );

                return;
            }


            // =================================================
            // PDF FILE
            // =================================================

            if (
                type ===
                "file"
            ) {

                if (
                    !fileInput ||
                    !fileInput.files ||
                    fileInput.files.length === 0
                ) {

                    alert(
                        "اختر ملف PDF أولاً."
                    );

                    return;
                }


                const file =
                    fileInput.files[0];


                // =============================================
                // CHECK PDF
                // =============================================

                const isPdf =
                    file.type ===
                        "application/pdf"

                    ||

                    file.name
                        .toLowerCase()
                        .endsWith(
                            ".pdf"
                        );


                if (!isPdf) {

                    alert(
                        "مسموح برفع ملفات PDF فقط."
                    );

                    return;
                }


                await uploadPdfFile(
                    courseId,
                    title,
                    description,
                    file
                );

                return;
            }
        }
    );
}


// =====================================================
// CREATE LECTURE
// =====================================================

async function createLecture(
    courseId,
    title,
    description,
    videoUrl
) {

    try {

        addContentButton.disabled =
            true;

        addContentButton.textContent =
            "جاري إضافة المحاضرة...";


        const response =
            await fetch(
                API_URL +
                "/course-contents/lecture",

                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " +
                            token
                    },

                    body:
                        JSON.stringify(
                            {

                                courseId:
                                    courseId,

                                title:
                                    title,

                                description:
                                    description,

                                videoUrl:
                                    videoUrl
                            }
                        )
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

            alert(
                "انتهت جلسة تسجيل الدخول."
            );

            logout();

            return;
        }


        // =================================================
        // FORBIDDEN
        // =================================================

        if (
            response.status === 403
        ) {

            alert(
                data.message ||
                "غير مسموح لك بإضافة محتوى لهذا الكورس."
            );

            return;
        }


        // =================================================
        // ERROR
        // =================================================

        if (!response.ok) {

            alert(
                data.message ||
                "حدث خطأ أثناء إضافة المحاضرة."
            );

            return;
        }


        // =================================================
        // SUCCESS
        // =================================================

        alert(
            data.message ||
            "تم إضافة المحاضرة بنجاح."
        );


        resetContentForm();

    }

    catch (error) {

        console.error(
            "Create lecture error:",
            error
        );


        alert(
            "تعذر الاتصال بالسيرفر."
        );
    }

    finally {

        addContentButton.disabled =
            false;

        addContentButton.textContent =
            "إضافة المحتوى";
    }
}


// =====================================================
// UPLOAD PDF FILE
// =====================================================

async function uploadPdfFile(
    courseId,
    title,
    description,
    file
) {

    try {

        addContentButton.disabled =
            true;

        addContentButton.textContent =
            "جاري رفع الملف...";


        // =================================================
        // FORMDATA
        // =================================================

        const formData =
            new FormData();


        formData.append(
            "courseId",
            String(
                courseId
            )
        );


        formData.append(
            "title",
            title
        );


        formData.append(
            "description",
            description
        );


        formData.append(
            "file",
            file
        );


        // =================================================
        // SEND FILE
        // IMPORTANT:
        // DO NOT SET Content-Type MANUALLY
        // Browser adds multipart boundary automatically
        // =================================================

        const response =
            await fetch(
                API_URL +
                "/course-contents/file",

                {
                    method:
                        "POST",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token
                    },

                    body:
                        formData
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        }

        catch (error) {

            console.error(
                "Upload response parse error:",
                error
            );
        }


        // =================================================
        // SESSION EXPIRED
        // =================================================

        if (
            response.status === 401
        ) {

            alert(
                "انتهت جلسة تسجيل الدخول."
            );

            logout();

            return;
        }


        // =================================================
        // FORBIDDEN
        // =================================================

        if (
            response.status === 403
        ) {

            alert(
                data?.message ||
                "غير مسموح لك برفع ملف لهذا الكورس."
            );

            return;
        }


        // =================================================
        // ERROR
        // =================================================

        if (!response.ok) {

            alert(
                data?.message ||
                "حدث خطأ أثناء رفع ملف PDF."
            );

            return;
        }


        // =================================================
        // SUCCESS
        // =================================================

        alert(
            data?.message ||
            "تم رفع ملف PDF بنجاح."
        );


        resetContentForm();

    }

    catch (error) {

        console.error(
            "Upload PDF error:",
            error
        );


        alert(
            "تعذر الاتصال بالسيرفر أثناء رفع الملف."
        );
    }

    finally {

        addContentButton.disabled =
            false;

        addContentButton.textContent =
            "إضافة المحتوى";
    }
}


// =====================================================
// RESET CONTENT FORM
// =====================================================

function resetContentForm() {

    if (!contentForm) {

        return;
    }


    contentForm.reset();


    updateContentFields();


    if (
        selectedCourseId &&
        courseSelect
    ) {

        courseSelect.value =
            selectedCourseId;
    }
}


// =====================================================
// START
// =====================================================

loadTeacherCourses();