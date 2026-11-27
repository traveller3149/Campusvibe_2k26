// ============================================
// CAMPUS VIBES 2026
// STUDENT REGISTRATION AND SEAT MANAGEMENT
// ============================================

const eventCapacities = {
    "Tech Fest": 50,
    "Music Battle": 40,
    "Art Competition": 30,
    "Dance Showdown": 40,
    "Photography Contest": 30,
    "Quiz Challenge": 50,
    "Gaming Tournament": 40,
    "Fashion Fiesta": 30
};

const availableEvents = Object.keys(eventCapacities);

const STATUS_KEY = "eventRegistrationStatus";
const EVENT_SETTINGS_KEY = "campusVibesEventSettings";

const defaultStudentEventSettings = {
    "Tech Fest": {
        name: "Tech Fest",
        description: "Show your technical skills through coding and innovation.",
        capacity: 50
    },
    "Music Battle": {
        name: "Music Battle",
        description: "Celebrate music, creativity and amazing performances.",
        capacity: 40
    },
    "Art Competition": {
        name: "Art Competition",
        description: "Express your imagination through art and creativity.",
        capacity: 30
    },
    "Dance Showdown": {
        name: "Dance Showdown",
        description: "Show your dancing skills and energy in an exciting stage competition.",
        capacity: 40
    },
    "Photography Contest": {
        name: "Photography Contest",
        description: "Capture beautiful moments and showcase your photography skills.",
        capacity: 30
    },
    "Quiz Challenge": {
        name: "Quiz Challenge",
        description: "Test your knowledge and challenge other students in an exciting quiz.",
        capacity: 50
    },
    "Gaming Tournament": {
        name: "Gaming Tournament",
        description: "Bring your competitive spirit and enjoy an exciting gaming competition.",
        capacity: 40
    },
    "Fashion Fiesta": {
        name: "Fashion Fiesta",
        description: "Celebrate fashion, creativity and confidence in a student fashion showcase.",
        capacity: 30
    }
};


// ============================================
// GET EVENT SETTINGS
// ============================================

function getStudentEventSettings() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(EVENT_SETTINGS_KEY) || "{}"
        );

        const result = {};

        availableEvents.forEach(eventName => {
            const defaults = defaultStudentEventSettings[eventName];
            const item = saved[eventName] || {};

            result[eventName] = {
                name:
                    typeof item.name === "string" && item.name.trim()
                        ? item.name.trim()
                        : defaults.name,

                description:
                    typeof item.description === "string"
                        ? item.description
                        : defaults.description,

                capacity:
                    Number.isInteger(Number(item.capacity)) &&
                    Number(item.capacity) >= 1
                        ? Number(item.capacity)
                        : defaults.capacity
            };
        });

        return result;

    } catch (error) {
        return { ...defaultStudentEventSettings };
    }
}


// ============================================
// GET EVENT REGISTRATION STATUS
// ============================================

function getEventStatuses() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STATUS_KEY) || "{}"
        );

        return saved && typeof saved === "object" ? saved : {};

    } catch (error) {
        return {};
    }
}

function isEventOpen(eventName) {
    return getEventStatuses()[eventName] !== false;
}


// ============================================
// GET EXISTING REGISTRATIONS
// ============================================

function getRegistrations() {
    try {
        const data = JSON.parse(
            localStorage.getItem("registrations") || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch (error) {
        console.error("Unable to read registrations:", error);
        return [];
    }
}


// ============================================
// COUNT REGISTERED STUDENTS
// ============================================

function getRegisteredCount(eventName) {
    const registrations = getRegistrations();

    return registrations.filter(student =>
        student.event === eventName
    ).length;
}


// ============================================
// GET AVAILABLE SEATS
// ============================================

function getAvailableSeats(eventName) {
    const maximumSeats = eventCapacities[eventName] || 0;
    const registeredCount = getRegisteredCount(eventName);

    return Math.max(0, maximumSeats - registeredCount);
}


// ============================================
// UPDATE EVENT DROPDOWN
// ============================================

function updateEventDropdown() {
    const dropdown = document.getElementById("event");

    if (!dropdown) return;

    const settings = getStudentEventSettings();

    Array.from(dropdown.options).forEach(option => {
        const eventName = option.value;

        if (!availableEvents.includes(eventName)) return;

        const isOpen = isEventOpen(eventName);
        const availableSeats = getAvailableSeats(eventName);

        option.textContent =
            settings[eventName].name +
            (
                !isOpen
                    ? " (Registration Closed)"
                    : availableSeats <= 0
                        ? " (Event Full)"
                        : ""
            );

        option.disabled = !isOpen || availableSeats <= 0;
    });

    if (
        dropdown.value &&
        availableEvents.includes(dropdown.value) &&
        (
            !isEventOpen(dropdown.value) ||
            getAvailableSeats(dropdown.value) <= 0
        )
    ) {
        dropdown.value = "";
    }
}


// ============================================
// UPDATE SEAT AVAILABILITY
// ============================================

function updateSeatAvailability() {
    const settings = getStudentEventSettings();

    // Apply the latest capacities from admin settings.
    availableEvents.forEach(eventName => {
        eventCapacities[eventName] =
            settings[eventName].capacity;
    });

    const cards = document.querySelectorAll(".event-card");

    cards.forEach((card, index) => {
        const eventName = availableEvents[index];

        if (!eventName) return;

        const config = settings[eventName];
        const maximum = config.capacity;

        const available = getAvailableSeats(eventName);
        const registered = maximum - available;
        const isOpen = isEventOpen(eventName);

        // Update event heading.
        const heading = card.querySelector("h3");

        if (heading) {
            heading.textContent = config.name;
        }

        // Update event description.
        const description = heading
            ? heading.nextElementSibling
            : null;

        if (
            description &&
            description.tagName === "P"
        ) {
            description.textContent = config.description;
        }

        // Create seat information container if missing.
        let seatInfo = card.querySelector(".seat-availability");

        if (!seatInfo) {
            seatInfo = document.createElement("div");
            seatInfo.className = "seat-availability";
            card.appendChild(seatInfo);
        }

        // Create seat count.
        let seatCount = seatInfo.querySelector(".seat-count");

        if (!seatCount) {
            seatCount = document.createElement("p");
            seatCount.className = "seat-count";
            seatInfo.appendChild(seatCount);
        }

        seatCount.textContent =
            "Seats Available: " +
            available +
            " / " +
            maximum;

        // Create status.
        let status = seatInfo.querySelector(".seat-status");

        if (!status) {
            status = document.createElement("p");
            status.className = "seat-status";
            seatInfo.appendChild(status);
        }

        // Create progress bar.
        let progress = seatInfo.querySelector(".seat-progress");

        if (!progress) {
            progress = document.createElement("div");
            progress.className = "seat-progress";

            const bar = document.createElement("div");
            bar.className = "seat-progress-bar";

            progress.appendChild(bar);
            seatInfo.appendChild(progress);
        }

        // Update register button.
        const registerButton = card.querySelector("button");

        if (registerButton) {
            registerButton.disabled =
                !isOpen || available <= 0;

            if (!isOpen) {
                registerButton.textContent =
                    "Registration Closed";
            } else if (available <= 0) {
                registerButton.textContent = "Event Full";
            } else {
                registerButton.textContent = "Register Now";
            }
        }

        // Update event status.
        if (!isOpen) {
            status.textContent = "Registration Closed";
            status.style.color = "#ef4444";

        } else if (available <= 0) {
            status.textContent = "Event Full";
            status.style.color = "#ef4444";

        } else if (available <= maximum * 0.2) {
            status.textContent = "Few Seats Left!";
            status.style.color = "#f59e0b";

        } else {
            status.textContent = "Registration Open";
            status.style.color = "#22c55e";
        }

        // Update progress bar.
        const bar = progress.querySelector(".seat-progress-bar");

        if (bar) {
            const percentage = Math.min(
                100,
                (registered / maximum) * 100
            );

            bar.style.width = percentage + "%";
        }
    });

    updateEventDropdown();
}


// ============================================
// SELECT EVENT
// ============================================

function selectEvent(eventName) {
    const dropdown = document.getElementById("event");

    if (!availableEvents.includes(eventName)) return;

    if (!isEventOpen(eventName)) {
        alert(
            "Registration for this event is currently closed."
        );

        updateSeatAvailability();
        return;
    }

    if (getAvailableSeats(eventName) <= 0) {
        alert("Sorry! This event is full.");

        updateSeatAvailability();
        return;
    }

    dropdown.value = eventName;

    document.getElementById("register").scrollIntoView({
        behavior: "smooth"
    });
}


// ============================================
// STUDENT REGISTRATION
// ============================================

const registrationForm =
    document.getElementById("registrationForm");

registrationForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name =
        document.getElementById("name").value.trim();

    const regNo =
        document.getElementById("regNo").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const department =
        document.getElementById("department").value;

    const selectedEvent =
        document.getElementById("event").value;

    const message =
        document.getElementById("successMessage");


    // CHECK REQUIRED DETAILS

    if (
        !name ||
        !regNo ||
        !email ||
        !phone ||
        !department ||
        !selectedEvent
    ) {
        message.style.color = "#f87171";
        message.textContent =
            "Please fill in all the details.";

        return;
    }


    // CHECK VALID EVENT

    if (!availableEvents.includes(selectedEvent)) {
        message.style.color = "#f87171";
        message.textContent =
            "Please select a valid event.";

        return;
    }


    // CHECK WHETHER REGISTRATION IS OPEN

    if (!isEventOpen(selectedEvent)) {
        message.style.color = "#f87171";

        message.textContent =
            "Registration for this event is currently closed. Please choose another event.";

        updateSeatAvailability();
        return;
    }


    // GET EXISTING REGISTRATIONS

    let registrations = getRegistrations();


    // CHECK DUPLICATE REGISTRATION

    const alreadyRegistered = registrations.some(student => {
        return (
            String(student.regNo || "").toLowerCase() ===
            regNo.toLowerCase() &&
            student.event === selectedEvent
        );
    });

    if (alreadyRegistered) {
        message.style.color = "#f87171";

        message.textContent =
            "You have already registered for this event!";

        return;
    }


    // CHECK SEAT AVAILABILITY

    const availableSeats = getAvailableSeats(selectedEvent);

    if (availableSeats <= 0) {
        message.style.color = "#f87171";

        message.textContent =
            "Sorry! This event is full. Please choose another event.";

        updateSeatAvailability();
        return;
    }


    // CREATE REGISTRATION

    const student = {
        name: name,
        regNo: regNo,
        email: email,
        phone: phone,
        department: department,
        event: selectedEvent
    };


    // SAVE REGISTRATION

    registrations.push(student);

    try {
        localStorage.setItem(
            "registrations",
            JSON.stringify(registrations)
        );

    } catch (error) {
        console.error(
            "Unable to save registration:",
            error
        );

        message.style.color = "#f87171";

        message.textContent =
            "Registration could not be saved. Please try again.";

        return;
    }


    // SHOW SUCCESS MESSAGE

    const settings = getStudentEventSettings();

    message.style.color = "#4ade80";

    message.textContent =
        "Registration Successful! Welcome, " +
        name +
        ". Your event is " +
        settings[selectedEvent].name +
        ". Available seats remaining: " +
        (availableSeats - 1);


    // UPDATE SEAT COUNTS

    updateSeatAvailability();


    // RESET FORM

    registrationForm.reset();
});


// ============================================
// INITIAL PAGE UPDATE
// ============================================

document.addEventListener("DOMContentLoaded", function() {
    updateSeatAvailability();
});


// ============================================
// UPDATE WHEN ANOTHER TAB CHANGES DATA
// ============================================

window.addEventListener("storage", function(event) {
    if (
        event.key === "registrations" ||
        event.key === STATUS_KEY ||
        event.key === EVENT_SETTINGS_KEY
    ) {
        updateSeatAvailability();
    }
});


// ============================================
// END OF CAMPUS VIBES 2026
// ============================================