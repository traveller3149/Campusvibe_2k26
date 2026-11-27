// ==========================================
// CAMPUS VIBES 2026 - ADMIN DASHBOARD
// ==========================================

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

const events = Object.keys(eventCapacities);
const STATUS_KEY = "eventRegistrationStatus";
const EVENT_SETTINGS_KEY = "campusVibesEventSettings";

const defaultEventSettings = {
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

const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginMessage = document.getElementById("loginMessage");

const registrationTable = document.getElementById("registrationTable");
const searchInput = document.getElementById("searchInput");
const eventFilter = document.getElementById("eventFilter");
const emptyMessage = document.getElementById("emptyMessage");


// ==========================================
// EVENT SETTINGS
// ==========================================

function getSavedEventSettings() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(EVENT_SETTINGS_KEY) || "{}"
        );

        const result = {};

        events.forEach(eventName => {
            const item = saved[eventName] || {};
            const defaults = defaultEventSettings[eventName];

            result[eventName] = {
                name: typeof item.name === "string" && item.name.trim()
                    ? item.name.trim()
                    : defaults.name,

                description: typeof item.description === "string"
                    ? item.description
                    : defaults.description,

                capacity: Number.isInteger(Number(item.capacity)) &&
                    Number(item.capacity) >= 1
                    ? Number(item.capacity)
                    : defaults.capacity
            };
        });

        return result;
    } catch (error) {
        return { ...defaultEventSettings };
    }
}

function saveAllEventSettings(settings) {
    localStorage.setItem(
        EVENT_SETTINGS_KEY,
        JSON.stringify(settings)
    );

    events.forEach(eventName => {
        eventCapacities[eventName] = settings[eventName].capacity;
    });
}

function getEventDisplayName(eventName) {
    const settings = getSavedEventSettings();
    return settings[eventName]?.name || eventName;
}

// Load saved seat capacities.
(function loadAdminEventSettings() {
    const settings = getSavedEventSettings();

    events.forEach(eventName => {
        eventCapacities[eventName] = settings[eventName].capacity;
    });
})();


// ==========================================
// REGISTRATION DATA
// ==========================================

function getRegistrations() {
    try {
        const data = JSON.parse(
            localStorage.getItem("registrations") || "[]"
        );

        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}


// ==========================================
// EVENT OPEN / CLOSE STATUS
// ==========================================

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

function saveEventStatus(eventName, isOpen) {
    const statuses = getEventStatuses();

    statuses[eventName] = isOpen;

    localStorage.setItem(
        STATUS_KEY,
        JSON.stringify(statuses)
    );

    displayRegistrations();
}


// ==========================================
// CREATE SEAT MANAGEMENT SECTION
// ==========================================

function createSeatSection() {
    let section = document.getElementById("seatManagement");

    if (section) return section;

    section = document.createElement("section");
    section.id = "seatManagement";
    section.className = "seat-management";

    const heading = document.createElement("h2");
    heading.textContent = "Event Seat Management";

    const container = document.createElement("div");
    container.id = "seatCards";
    container.className = "seat-cards";

    section.append(heading, container);

    const adminContent = document.querySelector(".admin-content");
    const statsSection = document.querySelector(".stats-section");

    if (adminContent && statsSection) {
        adminContent.insertBefore(
            section,
            statsSection.nextSibling
        );
    }

    return section;
}


// ==========================================
// UPDATE SEAT MANAGEMENT
// ==========================================

function updateSeatManagement(registrations) {
    createSeatSection();

    const container = document.getElementById("seatCards");
    if (!container) return;

    const settings = getSavedEventSettings();
    container.innerHTML = "";

    events.forEach(eventName => {
        const maximum = settings[eventName].capacity;
        eventCapacities[eventName] = maximum;

        const registered = registrations.filter(student =>
            student.event === eventName
        ).length;

        const available = Math.max(0, maximum - registered);
        const percentage = Math.min(
            100,
            (registered / maximum) * 100
        );

        const card = document.createElement("div");
        card.className = "seat-card";

        const title = document.createElement("h3");
        title.textContent = settings[eventName].name;

        const count = document.createElement("p");
        count.textContent =
            available + " / " + maximum + " seats available";

        const status = document.createElement("p");
        status.className = "seat-card-status";

        if (!isEventOpen(eventName)) {
            status.textContent = "Registration Closed";
            status.style.color = "#ef4444";
        } else if (available === 0) {
            status.textContent = "Event Full";
            status.style.color = "#ef4444";
        } else if (available <= maximum * 0.2) {
            status.textContent = "Few Seats Left";
            status.style.color = "#f59e0b";
        } else {
            status.textContent = "Registration Open";
            status.style.color = "#22c55e";
        }

        const progress = document.createElement("div");
        progress.className = "admin-seat-progress";

        const bar = document.createElement("div");
        bar.className = "admin-seat-bar";
        bar.style.width = percentage + "%";

        if (available === 0) {
            bar.style.background = "#ef4444";
        }

        progress.appendChild(bar);
        card.append(title, count, status, progress);
        container.appendChild(card);
    });
}


// ==========================================
// EVENT EDITING AND REGISTRATION CONTROLS
// ==========================================

function createEventControlSection() {
    let section = document.getElementById(
        "eventRegistrationControls"
    );

    if (section) return section;

    section = document.createElement("section");
    section.id = "eventRegistrationControls";
    section.className = "records-section";
    section.style.marginBottom = "30px";

    const heading = document.createElement("h2");
    heading.textContent = "Event Management";

    const description = document.createElement("p");
    description.textContent =
        "Edit event details, manage seat capacity and control registration.";
    description.style.marginBottom = "18px";
    description.style.color = "#64748b";

    const container = document.createElement("div");
    container.id = "eventControlCards";
    container.style.display = "grid";
    container.style.gridTemplateColumns =
        "repeat(auto-fit, minmax(250px, 1fr))";
    container.style.gap = "16px";

    section.append(heading, description, container);

    const seatSection = document.getElementById("seatManagement");
    const adminContent = document.querySelector(".admin-content");

    if (seatSection && seatSection.parentNode) {
        seatSection.parentNode.insertBefore(
            section,
            seatSection.nextSibling
        );
    } else if (adminContent) {
        adminContent.appendChild(section);
    }

    return section;
}

function updateEventControls() {
    createEventControlSection();

    const container = document.getElementById("eventControlCards");
    if (!container) return;

    const settings = getSavedEventSettings();
    container.innerHTML = "";

    events.forEach(eventName => {
        const config = settings[eventName];
        const isOpen = isEventOpen(eventName);

        const card = document.createElement("div");
        card.style.cssText =
            "background:#fff;padding:18px;border-radius:12px;" +
            "border:1px solid #e2e8f0;" +
            "box-shadow:0 3px 12px rgba(0,0,0,.05);" +
            "display:flex;flex-direction:column;gap:9px;";

        const heading = document.createElement("h3");
        heading.textContent = config.name;
        heading.style.margin = "0";

        const status = document.createElement("p");
        status.textContent = isOpen
            ? "● Registration Open"
            : "● Registration Closed";
        status.style.color = isOpen ? "#16a34a" : "#dc2626";
        status.style.fontWeight = "600";
        status.style.margin = "0";

        const nameLabel = document.createElement("label");
        nameLabel.textContent = "Event name";

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.value = config.name;
        nameInput.maxLength = 60;
        nameInput.style.cssText =
            "width:100%;padding:9px;border:1px solid #cbd5e1;" +
            "border-radius:7px;";

        const descLabel = document.createElement("label");
        descLabel.textContent = "Event description";

        const descInput = document.createElement("textarea");
        descInput.value = config.description;
        descInput.rows = 3;
        descInput.maxLength = 240;
        descInput.style.cssText =
            "width:100%;padding:9px;border:1px solid #cbd5e1;" +
            "border-radius:7px;resize:vertical;";

        const capacityLabel = document.createElement("label");
        capacityLabel.textContent = "Seat capacity";

        const capacityInput = document.createElement("input");
        capacityInput.type = "number";
        capacityInput.min = "1";
        capacityInput.max = "10000";
        capacityInput.step = "1";
        capacityInput.value = config.capacity;
        capacityInput.style.cssText =
            "width:100%;padding:9px;border:1px solid #cbd5e1;" +
            "border-radius:7px;";

        const saveButton = document.createElement("button");
        saveButton.type = "button";
        saveButton.textContent = "Save Event Details";
        saveButton.style.cssText =
            "padding:10px;border:0;border-radius:7px;" +
            "background:#2563eb;color:white;font-weight:600;" +
            "cursor:pointer;";

        saveButton.addEventListener("click", function() {
            const newName = nameInput.value.trim();
            const newDescription = descInput.value.trim();
            const newCapacity = Number(capacityInput.value);

            if (!newName || !newDescription) {
                alert("Please enter both an event name and description.");
                return;
            }

            if (
                !Number.isInteger(newCapacity) ||
                newCapacity < 1 ||
                newCapacity > 10000
            ) {
                alert(
                    "Seat capacity must be a whole number between 1 and 10000."
                );
                return;
            }

            const duplicateName = events.some(other =>
                other !== eventName &&
                settings[other].name.toLowerCase() ===
                newName.toLowerCase()
            );

            if (duplicateName) {
                alert("Another event is already using this name.");
                return;
            }

            settings[eventName] = {
                name: newName,
                description: newDescription,
                capacity: newCapacity
            };

            saveAllEventSettings(settings);
            displayRegistrations();

            alert("Event details updated successfully!");
        });

        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.textContent = isOpen
            ? "Close Registration"
            : "Open Registration";

        toggleButton.style.cssText =
            "padding:10px;border:0;border-radius:7px;" +
            "color:white;font-weight:600;cursor:pointer;" +
            "background:" + (isOpen ? "#dc2626" : "#16a34a") + ";";

        toggleButton.addEventListener("click", function() {
            saveEventStatus(eventName, !isOpen);
        });

        const resetButton = document.createElement("button");
        resetButton.type = "button";
        resetButton.textContent = "Reset Event Details";
        resetButton.style.cssText =
            "padding:9px;border:1px solid #cbd5e1;" +
            "border-radius:7px;background:#f8fafc;cursor:pointer;";

        resetButton.addEventListener("click", function() {
            const confirmed = confirm(
                "Restore the original name, description and seat capacity for this event?"
            );

            if (!confirmed) return;

            settings[eventName] = {
                ...defaultEventSettings[eventName]
            };

            saveAllEventSettings(settings);

            const statuses = getEventStatuses();
            delete statuses[eventName];

            localStorage.setItem(
                STATUS_KEY,
                JSON.stringify(statuses)
            );

            displayRegistrations();
        });

        card.append(
            heading,
            status,
            nameLabel,
            nameInput,
            descLabel,
            descInput,
            capacityLabel,
            capacityInput,
            saveButton,
            toggleButton,
            resetButton
        );

        container.appendChild(card);
    });
}


// ==========================================
// LOGIN
// ==========================================

loginSection.style.display = "flex";
dashboardSection.style.display = "none";

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "campus123") {
        loginSection.style.display = "none";
        dashboardSection.style.display = "block";
        loginMessage.textContent = "";

        displayRegistrations();
    } else {
        loginMessage.textContent =
            "Invalid username or password!";
    }
});


// ==========================================
// DISPLAY REGISTRATIONS
// ==========================================

function displayRegistrations() {
    const registrations = getRegistrations();

    const searchValue = searchInput.value.toLowerCase().trim();
    const selectedEvent = eventFilter.value;

    registrationTable.innerHTML = "";

    const filteredRegistrations = registrations
        .map((student, index) => ({ student, index }))
        .filter(({ student }) => {
            const matchesSearch = [
                student.name,
                student.regNo,
                student.email,
                student.phone,
                student.department,
                student.event,
                getEventDisplayName(student.event)
            ].some(value =>
                String(value ?? "")
                    .toLowerCase()
                    .includes(searchValue)
            );

            const matchesEvent =
                selectedEvent === "All" ||
                student.event === selectedEvent;

            return matchesSearch && matchesEvent;
        });

    filteredRegistrations.forEach(({ student, index }) => {
        const row = document.createElement("tr");

        const values = [
            student.name,
            student.regNo,
            student.email,
            student.phone,
            student.department,
            getEventDisplayName(student.event)
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "";
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {
            deleteRegistration(index);
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        registrationTable.appendChild(row);
    });

    if (registrations.length === 0) {
        emptyMessage.textContent = "No registrations found.";
    } else if (filteredRegistrations.length === 0) {
        emptyMessage.textContent =
            "No matching registrations found.";
    } else {
        emptyMessage.textContent = "";
    }

    updateStatistics(registrations);
    updateSeatManagement(registrations);
    updateEventControls();
}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics(registrations) {
    document.getElementById("totalCount").textContent =
        registrations.length;

    const countIds = {
        "Tech Fest": "techCount",
        "Music Battle": "musicCount",
        "Art Competition": "artCount",
        "Dance Showdown": "danceCount",
        "Photography Contest": "photoCount",
        "Quiz Challenge": "quizCount",
        "Gaming Tournament": "gamingCount",
        "Fashion Fiesta": "fashionCount"
    };

    events.forEach(eventName => {
        const count = registrations.filter(student =>
            student.event === eventName
        ).length;

        const element = document.getElementById(countIds[eventName]);

        if (element) {
            element.textContent = count;
        }
    });
}


// ==========================================
// DELETE REGISTRATION
// ==========================================

function deleteRegistration(index) {
    const confirmed = confirm(
        "Are you sure you want to delete this registration?"
    );

    if (!confirmed) return;

    const registrations = getRegistrations();
    registrations.splice(index, 1);

    localStorage.setItem(
        "registrations",
        JSON.stringify(registrations)
    );

    displayRegistrations();
}


// ==========================================
// SEARCH AND FILTER
// ==========================================

searchInput.addEventListener("input", function() {
    displayRegistrations();
});

eventFilter.addEventListener("change", function() {
    displayRegistrations();
});


// ==========================================
// CSV EXPORT
// ==========================================

document.getElementById("exportBtn").addEventListener("click", function() {
    const registrations = getRegistrations();

    if (registrations.length === 0) {
        alert("No registrations available to download!");
        return;
    }

    const headers = [
        "Student Name",
        "Registration Number",
        "Email",
        "Phone",
        "Department",
        "Event"
    ];

    function csvValue(value) {
        let safe = String(value ?? "");

        if (/^[=+\-@\t\r]/.test(safe)) {
            safe = "'" + safe;
        }

        return '"' + safe.replace(/"/g, '""') + '"';
    }

    const rows = registrations.map(student => [
        student.name,
        student.regNo,
        student.email,
        student.phone,
        student.department,
        getEventDisplayName(student.event)
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(csvValue).join(","))
        .join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Campus_Vibes_Registrations.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
});


// ==========================================
// LOGOUT
// ==========================================

document.getElementById("logoutBtn").addEventListener("click", function() {
    dashboardSection.style.display = "none";
    loginSection.style.display = "flex";

    loginForm.reset();
    loginMessage.textContent = "";
    searchInput.value = "";
    eventFilter.value = "All";
});


// ==========================================
// UPDATE WHEN ANOTHER TAB CHANGES DATA
// ==========================================

window.addEventListener("storage", function(event) {
    if (
        event.key === STATUS_KEY ||
        event.key === "registrations" ||
        event.key === EVENT_SETTINGS_KEY
    ) {
        displayRegistrations();
    }
});