
const form = document.getElementById("studentForm");
const message = document.getElementById("message");
const resultSection = document.getElementById("result");

const STORAGE_KEY = "studentRecords";
const subjectIds = ["m1", "m2", "m3"];

// Load saved students
function getStudents() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const students = data ? JSON.parse(data) : [];
        return Array.isArray(students) ? students : [];
    } catch (error) {
        return [];
    }
}

// Save students in Local Storage
function saveStudents(students) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// Display a message
function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
}

// Handle registration form
form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const name = document.getElementById("name").value.trim();
    const roll = document.getElementById("roll").value.trim();
    const email = document.getElementById("email").value.trim();
    const course = document.getElementById("course").value;

    if (!name || !roll || !email || !course) {
        showMessage("Please fill in all the details.", "error");
        return;
    }

    // Validate student name
    if (!/^[\p{L}\p{M} .'-]+$/u.test(name)) {
        showMessage("Please enter a valid student name.", "error");
        return;
    }

    const students = getStudents();

    // Check for duplicate roll number
    const exists = students.some(function (student) {
        return student.roll.toLowerCase() === roll.toLowerCase();
    });

    if (exists) {
        showMessage("This roll number is already registered.", "error");
        return;
    }

    // Read and validate marks
    const marks = [];

    for (const id of subjectIds) {
        const input = document.getElementById(id);
        const value = input.valueAsNumber;

        if (
            input.value.trim() === "" ||
            !Number.isInteger(value) ||
            value < 0 ||
            value > 100
        ) {
            showMessage(
                "Enter whole-number marks between 0 and 100.",
                "error"
            );
            input.focus();
            return;
        }

        marks.push(value);
    }

    // Calculate total and percentage
    const total = marks.reduce(function (sum, mark) {
        return sum + mark;
    }, 0);

    const percentage = (total / 300) * 100;

    // Pass only if every subject has at least 35 marks
    const status = marks.every(function (mark) {
        return mark >= 35;
    }) ? "Pass" : "Fail";

    // Create the student object
    const student = {
        name: name,
        roll: roll,
        email: email,
        course: course,
        marks: {
            HTML5: marks[0],
            CSS3: marks[1],
            JavaScript: marks[2]
        },
        total: total,
        percentage: percentage.toFixed(2),
        result: status
    };

    // Convert object to JSON and save
    try {
        students.push(student);
        saveStudents(students);
    } catch (error) {
        showMessage(
            "Unable to save data. Check browser storage settings.",
            "error"
        );
        return;
    }

    displayResult(student);
    displayStudents();

    showMessage("Student registered successfully!", "success");
});

// Display calculated result
function displayResult(student) {
    document.getElementById("resultName").textContent = student.name;
    document.getElementById("resultRoll").textContent = student.roll;
    document.getElementById("resultCourse").textContent = student.course;

    document.getElementById("resultTotal").textContent =
        student.total + " / 300";

    document.getElementById("resultPercentage").textContent =
        student.percentage + "%";

    const statusElement = document.getElementById("resultStatus");

    statusElement.textContent = student.result;
    statusElement.className =
        student.result === "Pass" ? "pass" : "fail";

    document.getElementById("jsonOutput").textContent =
        JSON.stringify(student, null, 2);

    resultSection.hidden = false;
}

// Display all saved student records
function displayStudents() {
    const students = getStudents();
    const records = document.getElementById("studentRecords");

    records.replaceChildren();

    if (students.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-message";
        empty.textContent = "No student records yet.";
        records.appendChild(empty);
        return;
    }

    students.forEach(function (student) {
        const item = document.createElement("div");
        item.className = "student-item";

        const info = document.createElement("div");
        info.className = "student-info";

        const studentName = document.createElement("strong");
        studentName.textContent = student.name;

        const details = document.createElement("span");
        details.textContent =
            student.roll + " • " +
            student.percentage + "% • " +
            student.result;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        info.appendChild(studentName);
        info.appendChild(details);

        deleteButton.addEventListener("click", function () {
            const updatedStudents = getStudents().filter(function (record) {
                return record.roll.toLowerCase() !==
                    student.roll.toLowerCase();
            });

            try {
                saveStudents(updatedStudents);

                // Hide the result if its record was deleted
                if (
                    document.getElementById("resultRoll").textContent
                        .toLowerCase() === student.roll.toLowerCase()
                ) {
                    resultSection.hidden = true;
                }

                displayStudents();
                showMessage("Student record deleted.", "success");
            } catch (error) {
                showMessage("Unable to delete this record.", "error");
            }
        });

        item.appendChild(info);
        item.appendChild(deleteButton);
        records.appendChild(item);
    });
}

// Clear messages when the form resets
form.addEventListener("reset", function () {
    message.textContent = "";
    message.className = "";
});

// Load saved records when the page opens
displayStudents();
