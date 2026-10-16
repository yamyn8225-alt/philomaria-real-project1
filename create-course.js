// =====================================================
// PHILOMARIA - CREATE COURSE
// =====================================================


// =====================================================
// ELEMENTS
// =====================================================

const createCourseForm =
    document.getElementById(
        "create-course-form"
    );


const courseImageInput =
    document.getElementById(
        "course-image"
    );


const courseImagePreviewContainer =
    document.getElementById(
        "course-image-preview-container"
    );


const courseImagePreview =
    document.getElementById(
        "course-image-preview"
    );


const createCourseButton =
    document.getElementById(
        "create-course-button"
    );


// =====================================================
// CHECK LOGIN
// =====================================================

const token =
    localStorage.getItem(
        "token"
    );


const currentUserData =
    localStorage.getItem(
        "currentUser"
    );


let currentUser = null;


if (currentUserData) {

    try {

        currentUser =
            JSON.parse(
                currentUserData
            );

    }

    catch (error) {

        console.error(
            "User data error:",
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
        "غير مسموح لك بإنشاء كورسات."
    );


    window.location.href =
        "student.html";
}


// =====================================================
// IMAGE PREVIEW
// =====================================================

if (courseImageInput) {

    courseImageInput.addEventListener(
        "change",

        function () {

            const file =
                courseImageInput.files[0];


            if (!file) {

                courseImagePreviewContainer.style.display =
                    "none";


                courseImagePreview.src =
                    "";


                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "من فضلك اختر ملف صورة فقط."
                );


                courseImageInput.value =
                    "";


                courseImagePreviewContainer.style.display =
                    "none";


                courseImagePreview.src =
                    "";


                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    courseImagePreview.src =
                        event.target.result;


                    courseImagePreviewContainer.style.display =
                        "block";
                };


            reader.readAsDataURL(
                file
            );
        }
    );
}


// =====================================================
// CREATE COURSE
// =====================================================

if (createCourseForm) {

    createCourseForm.addEventListener(
        "submit",

        async function (event) {

            event.preventDefault();


            // =================================================
            // GET VALUES
            // =================================================

            const title =
                document
                    .getElementById(
                        "course-title"
                    )
                    .value
                    .trim();


            const studyYear =
                document
                    .getElementById(
                        "course-study-year"
                    )
                    .value;


            const studyTerm =
                document
                    .getElementById(
                        "course-study-term"
                    )
                    .value;


            const description =
                document
                    .getElementById(
                        "course-description"
                    )
                    .value
                    .trim();


            const priceValue =
                document
                    .getElementById(
                        "course-price"
                    )
                    .value;


            const price =
                Number(
                    priceValue
                );


            // =================================================
            // VALIDATION
            // =================================================

            if (!title) {

                alert(
                    "اكتب اسم الكورس."
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


            if (!description) {

                alert(
                    "اكتب وصف الكورس."
                );

                return;
            }


            if (
                priceValue === ""
            ) {

                alert(
                    "اكتب سعر الكورس."
                );

                return;
            }


            if (
                Number.isNaN(price) ||
                price < 0
            ) {

                alert(
                    "سعر الكورس غير صحيح."
                );

                return;
            }


            // =================================================
            // CREATE COURSE REQUEST
            // =================================================

            try {

                createCourseButton.disabled =
                    true;


                createCourseButton.textContent =
                    "جاري إنشاء الكورس...";


                const response =
                    await fetch(
                        API_URL +
                        "/courses",

                        {
                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " + token
                            },

                            body:
                                JSON.stringify({

                                    title:
                                        title,

                                    description:
                                        description,

                                    studyYear:
                                        studyYear,

                                    studyTerm:
                                        studyTerm,

                                    price:
                                        price
                                })
                        }
                    );


                const data =
                    await response.json();


                // =================================================
                // UNAUTHORIZED
                // =================================================

                if (
                    response.status === 401
                ) {

                    localStorage.removeItem(
                        "token"
                    );


                    localStorage.removeItem(
                        "currentUser"
                    );


                    alert(
                        "انتهت جلسة تسجيل الدخول. قم بتسجيل الدخول مرة أخرى."
                    );


                    window.location.href =
                        "login.html";


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
                        "غير مسموح لك بإنشاء كورسات."
                    );


                    return;
                }


                // =================================================
                // OTHER ERROR
                // =================================================

                if (!response.ok) {

                    alert(
                        data.message ||
                        "حدث خطأ أثناء إنشاء الكورس."
                    );


                    return;
                }


                // =================================================
                // SUCCESS
                // =================================================

                alert(
                    "تم إنشاء الكورس بنجاح."
                );


                window.location.href =
                    "teacher.html";
            }


            catch (error) {

                console.error(
                    "Create course error:",
                    error
                );


                alert(
                    "تعذر الاتصال بالسيرفر."
                );
            }


            finally {

                createCourseButton.disabled =
                    false;


                createCourseButton.textContent =
                    "إنشاء الكورس";
            }
        }
    );
}