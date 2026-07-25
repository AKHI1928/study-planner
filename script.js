// --- APP STATE & INITIALIZATION ---
let appData = {
    settings: {
        darkMode: true,
        alarmEnabled: true,
        alarmVolume: 0.8,
        notificationsEnabled: true,
        autoStartNextTask: false,
        alarmSound: 'digital', // Added option for alarm sound preset
        alarmRepeats: 'infinite' // Added option for alarm repeat count
    },
    goals: {
        monthly: "",
        weekly: "",
        daily: ""
    },
    days: {} // Keyed by YYYY-MM-DD: { tasks: [], notes: "", goals: "", studyTime: 0 }
};

let activeDateKey = getFormattedDate(new Date());
let activeCalendarDate = new Date();

// Active Timer state (Enhanced with timestamp-based tracking and localStorage persistence)
let currentTimer = {
    taskId: null,
    taskName: "",
    durationSeconds: 0,
    remainingSeconds: 0,
    endTime: null, // Timestamp when timer is scheduled to end
    isRunning: false,
    isPaused: false,
    timerId: null,
    isPomodoro: false
};

// Pomodoro state (Enhanced with timestamp-based tracking and localStorage persistence)
let pomoState = {
    mode: 'focus', // 'focus' or 'break'
    focusMinutes: 25,
    breakMinutes: 5,
    remainingSeconds: 25 * 60,
    endTime: null, // Timestamp when pomodoro session is scheduled to end
    isRunning: false,
    isPaused: false,
    timerId: null
};

// Web Audio API / Audio Element Alarm state
let activeAudioElement = null;
let customAlarmDataUrl = null;
let alarmLoopCount = 0;
let maxAlarmLoops = Infinity;
let alarmInterval = null;

// --- INITIALIZATION ON LOAD ---
document.addEventListener("DOMContentLoaded", () => {
    loadFromLocalStorage();
    initClock();
    initNavigation();
    initCalendar();
    initPlanner();
    initPomodoro();
    initSettings();
    initBackupAndReset();
    initSearch();
    
    // Check and restore timers from persistent localStorage state on page load/refresh
    restoreTimersFromStorage();
    
    renderAll();
});

// --- LOCAL STORAGE ---
function saveToLocalStorage() {
    // Save timer states alongside core app data for persistence across refreshes
    const stateToSave = {
        appData,
        currentTimer: {
            taskId: currentTimer.taskId,
            taskName: currentTimer.taskName,
            durationSeconds: currentTimer.durationSeconds,
            remainingSeconds: currentTimer.remainingSeconds,
            endTime: currentTimer.endTime,
            isRunning: currentTimer.isRunning,
            isPaused: currentTimer.isPaused,
            isPomodoro: currentTimer.isPomodoro
        },
        pomoState: {
            mode: pomoState.mode,
            focusMinutes: pomoState.focusMinutes,
            breakMinutes: pomoState.breakMinutes,
            remainingSeconds: pomoState.remainingSeconds,
            endTime: pomoState.endTime,
            isRunning: pomoState.isRunning,
            isPaused: pomoState.isPaused
        },
        customAlarmDataUrl
    };
    localStorage.setItem("nexusStudyData", JSON.stringify(stateToSave));
    calculateStreak();
}

function loadFromLocalStorage() {
    const rawData = localStorage.getItem("nexusStudyData");
    if (rawData) {
        try {
            const parsed = JSON.parse(rawData);
            // Handle backward compatibility if old format was saved directly
            if (parsed.settings && parsed.days) {
                appData = parsed;
            } else if (parsed.appData) {
                appData = parsed.appData;
                if (parsed.customAlarmDataUrl) customAlarmDataUrl = parsed.customAlarmDataUrl;
                
                // Restore timer objects temporarily for initialization restoration
                if (parsed.currentTimer) {
                    currentTimer.taskId = parsed.currentTimer.taskId;
                    currentTimer.taskName = parsed.currentTimer.taskName;
                    currentTimer.durationSeconds = parsed.currentTimer.durationSeconds;
                    currentTimer.remainingSeconds = parsed.currentTimer.remainingSeconds;
                    currentTimer.endTime = parsed.currentTimer.endTime;
                    currentTimer.isRunning = parsed.currentTimer.isRunning;
                    currentTimer.isPaused = parsed.currentTimer.isPaused;
                    currentTimer.isPomodoro = parsed.currentTimer.isPomodoro;
                }
                if (parsed.pomoState) {
                    pomoState.mode = parsed.pomoState.mode;
                    pomoState.focusMinutes = parsed.pomoState.focusMinutes;
                    pomoState.breakMinutes = parsed.pomoState.breakMinutes;
                    pomoState.remainingSeconds = parsed.pomoState.remainingSeconds;
                    pomoState.endTime = parsed.pomoState.endTime;
                    pomoState.isRunning = parsed.pomoState.isRunning;
                    pomoState.isPaused = parsed.pomoState.isPaused;
                }
            }
        } catch (e) {
            console.error("Failed to parse local storage data", e);
        }
    }
    applyTheme(appData.settings.darkMode);
}

// Restore active timers upon page refresh/reload using precise timestamps
function restoreTimersFromStorage() {
    const now = Date.now();

    // 1. Restore Task Timer if it was running or paused
    if (currentTimer.isRunning && currentTimer.endTime) {
        const secondsLeft = Math.round((currentTimer.endTime - now) / 1000);
        if (secondsLeft > 0) {
            currentTimer.remainingSeconds = secondsLeft;
            // Open modal and resume timer loop
            const task = getDayData(activeDateKey).tasks.find(t => t.id === currentTimer.taskId) || { name: currentTimer.taskName };
            openActiveTimerModal(task, true); // true indicates restoring
            startTaskTimerEngine(false); // resume without resetting endTime
        } else {
            // Timer expired while page was closed/refreshed
            currentTimer.remainingSeconds = 0;
            currentTimer.isRunning = false;
            onTaskTimerFinished();
        }
    } else if (currentTimer.isPaused && currentTimer.remainingSeconds > 0) {
        const task = getDayData(activeDateKey).tasks.find(t => t.id === currentTimer.taskId) || { name: currentTimer.taskName };
        openActiveTimerModal(task, true);
        document.getElementById("active-timer-countdown").textContent = formatSecondsToTime(currentTimer.remainingSeconds);
        document.getElementById("modal-start-btn").style.display = 'none';
        document.getElementById("modal-pause-btn").style.display = 'none';
        document.getElementById("modal-resume-btn").style.display = 'inline-flex';
    }

    // 2. Restore Pomodoro Timer if it was running or paused
    if (pomoState.isRunning && pomoState.endTime) {
        const secondsLeft = Math.round((pomoState.endTime - now) / 1000);
        if (secondsLeft > 0) {
            pomoState.remainingSeconds = secondsLeft;
            switchTab('pomodoro');
            startPomodoroTimerEngine(false);
        } else {
            pomoState.remainingSeconds = 0;
            pomoState.isRunning = false;
            handlePomodoroCycleCompletion();
        }
    } else if (pomoState.isPaused && pomoState.remainingSeconds > 0) {
        document.getElementById("pomo-time").textContent = formatSecondsToTime(pomoState.remainingSeconds);
        document.getElementById("pomo-start-btn").disabled = false;
        document.getElementById("pomo-pause-btn").disabled = true;
    }
}

// --- UTILS & DATE HELPERS ---
function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getDayData(dateKey) {
    if (!appData.days[dateKey]) {
        appData.days[dateKey] = {
            tasks: [],
            notes: "",
            goals: "",
            studyTime: 0
        };
    }
    return appData.days[dateKey];
}

function formatMinutes(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
}

function formatSecondsToTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// --- CLOCK & HEADER ---
function initClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById("live-clock").textContent = now.toLocaleTimeString();
        document.getElementById("live-date").textContent = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }, 1000);
}

// --- NAVIGATION ---
function initNavigation() {
    const navButtons = document.querySelectorAll(".nav-item");
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tab = btn.getAttribute("data-tab");
            switchTab(tab);
        });
    });
}

function switchTab(tabId) {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    
    const targetBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    const targetView = document.getElementById(`${tabId}-view`);
    
    if (targetBtn) targetBtn.classList.add("active");
    if (targetView) targetView.classList.add("active");

    if (tabId === 'calendar') renderCalendar();
    if (tabId === 'planner') renderPlanner();
    if (tabId === 'stats') renderStatistics();
}

// --- STREAK CALCULATION ---
function calculateStreak() {
    let streak = 0;
    let d = new Date();
    while (true) {
        const key = getFormattedDate(d);
        const dayData = appData.days[key];
        if (dayData && dayData.tasks && dayData.tasks.length > 0 && dayData.tasks.every(t => t.completed)) {
            streak++;
            d.setDate(d.getDate() - 1);
        } else if (streak === 0 && key === getFormattedDate(new Date())) {
            d.setDate(d.getDate() - 1);
            const prevKey = getFormattedDate(d);
            const prevData = appData.days[prevKey];
            if (prevData && prevData.tasks && prevData.tasks.length > 0 && prevData.tasks.every(t => t.completed)) {
                streak++;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        } else {
            break;
        }
    }
    document.getElementById("streak-count").textContent = streak;
}

// --- HOME DASHBOARD RENDERING ---
function renderHome() {
    const todayKey = getFormattedDate(new Date());
    const todayData = getDayData(todayKey);

    let todayStudyTimeMins = Math.round(todayData.studyTime / 60);
    document.getElementById("home-today-time").textContent = formatMinutes(todayStudyTimeMins);

    const remainingTasks = todayData.tasks.filter(t => !t.completed).length;
    document.getElementById("home-remaining-tasks").textContent = remainingTasks;

    const totalTasks = todayData.tasks.length;
    const completedTasksToday = todayData.tasks.filter(t => t.completed).length;
    const dailyProg = totalTasks > 0 ? Math.round((completedTasksToday / totalTasks) * 100) : 0;
    document.getElementById("home-daily-progress").textContent = `${dailyProg}%`;

    let weekCompleted = 0;
    let weekTotal = 0;
    for (let i = 0; i < 7; i++) {
        let tempD = new Date();
        tempD.setDate(tempD.getDate() - i);
        let dData = getDayData(getFormattedDate(tempD));
        weekTotal += dData.tasks.length;
        weekCompleted += dData.tasks.filter(t => t.completed).length;
    }
    const weeklyProg = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;
    document.getElementById("home-weekly-progress").textContent = `${weeklyProg}%`;

    let monthCompleted = 0;
    let monthTotal = 0;
    const currentYearMonth = todayKey.substring(0, 7);
    for (let key in appData.days) {
        if (key.startsWith(currentYearMonth)) {
            monthTotal += appData.days[key].tasks.length;
            monthCompleted += appData.days[key].tasks.filter(t => t.completed).length;
        }
    }
    const monthlyProg = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0;
    document.getElementById("home-monthly-bar").style.width = `${monthlyProg}%`;
    document.getElementById("home-monthly-text").textContent = `${monthlyProg}% Completed this month`;

    calculateStreak();
}

// --- CALENDAR MODULE ---
function initCalendar() {
    document.getElementById("prev-month").addEventListener("click", () => {
        activeCalendarDate.setMonth(activeCalendarDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById("next-month").addEventListener("click", () => {
        activeCalendarDate.setMonth(activeCalendarDate.getMonth() + 1);
        renderCalendar();
    });
    document.getElementById("jump-today").addEventListener("click", () => {
        activeCalendarDate = new Date();
        renderCalendar();
    });
}

function renderCalendar() {
    const year = activeCalendarDate.getFullYear();
    const month = activeCalendarDate.getMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById("calendar-month-year").textContent = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const daysContainer = document.getElementById("calendar-days");
    daysContainer.innerHTML = "";

    for (let i = 0; i < firstDayIndex; i++) {
        const blank = document.createElement("div");
        blank.className = "calendar-day";
        blank.style.opacity = "0.2";
        daysContainer.appendChild(blank);
    }

    const todayKey = getFormattedDate(new Date());

    for (let day = 1; day <= totalDays; day++) {
        const dateObj = new Date(year, month, day);
        const dateKey = getFormattedDate(dateObj);
        const dayData = appData.days[dateKey];

        const dayEl = document.createElement("div");
        dayEl.className = "calendar-day";

        if (dateKey === todayKey) {
            dayEl.classList.add("today");
        }

        let completedCount = 0;
        if (dayData && dayData.tasks) {
            completedCount = dayData.tasks.filter(t => t.completed).length;
            if (dayData.tasks.length > 0 && completedCount === dayData.tasks.length) {
                dayEl.classList.add("completed-day");
            }
        }

        dayEl.innerHTML = `
            <span class="calendar-day-number">${day}</span>
            ${completedCount > 0 ? `<span class="calendar-day-badge">${completedCount} done</span>` : ''}
        `;

        dayEl.addEventListener("click", () => {
            activeDateKey = dateKey;
            switchTab('planner');
            renderPlanner();
        });

        daysContainer.appendChild(dayEl);
    }
}

// --- DAILY PLANNER MODULE ---
function initPlanner() {
    document.getElementById("open-add-task-modal").addEventListener("click", () => openTaskModal());
    document.getElementById("close-modal").addEventListener("click", () => closeTaskModal());
    document.getElementById("task-duration-preset").addEventListener("change", (e) => {
        const customWrap = document.getElementById("custom-duration-wrapper");
        if (e.target.value === 'custom') {
            customWrap.style.display = 'block';
        } else {
            customWrap.style.display = 'none';
        }
    });

    document.getElementById("task-form").addEventListener("submit", (e) => {
        e.preventDefault();
        saveTaskFromModal();
    });

    document.getElementById("daily-goals-input").addEventListener("input", (e) => {
        const dayData = getDayData(activeDateKey);
        dayData.goals = e.target.value;
        saveToLocalStorage();
    });

    document.getElementById("daily-notes-input").addEventListener("input", (e) => {
        const dayData = getDayData(activeDateKey);
        dayData.notes = e.target.value;
        saveToLocalStorage();
    });
}

function renderPlanner() {
    const dayData = getDayData(activeDateKey);
    const dateObj = new Date(activeDateKey + 'T00:00:00');
    
    document.getElementById("planner-active-date-title").textContent = `Planner for ${dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}`;
    document.getElementById("daily-goals-input").value = dayData.goals || "";
    document.getElementById("daily-notes-input").value = dayData.notes || "";

    const container = document.getElementById("tasks-container");
    container.innerHTML = "";

    if (!dayData.tasks || dayData.tasks.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary); text-align:center; padding: 20px;">No tasks scheduled for this day. Click 'Add New Task' to begin.</p>`;
        return;
    }

    dayData.tasks.forEach(task => {
        const taskEl = document.createElement("div");
        taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskEl.innerHTML = `
            <div class="task-item-left">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-details">
                    <h4>${escapeHtml(task.name)}</h4>
                    <div class="task-meta">
                        <span><i class="fa-solid fa-clock"></i> ${formatMinutes(task.duration)}</span>
                        <span class="badge ${task.priority}">${task.priority} Priority</span>
                        <span class="badge category">${task.category}</span>
                    </div>
                </div>
            </div>
            <div class="task-item-right">
                <button class="btn primary start-task-timer-btn" title="Start Timer"><i class="fa-solid fa-play"></i> Start Timer</button>
                <button class="btn secondary edit-task-btn" title="Edit Task"><i class="fa-solid fa-pen"></i></button>
                <button class="btn danger delete-task-btn" title="Delete Task"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        taskEl.querySelector(".task-checkbox").addEventListener("change", (e) => {
            task.completed = e.target.checked;
            saveToLocalStorage();
            renderPlanner();
            renderHome();
        });

        taskEl.querySelector(".start-task-timer-btn").addEventListener("click", () => {
            openActiveTimerModal(task);
        });

        taskEl.querySelector(".edit-task-btn").addEventListener("click", () => {
            openTaskModal(task);
        });

        taskEl.querySelector(".delete-task-btn").addEventListener("click", () => {
            dayData.tasks = dayData.tasks.filter(t => t.id !== task.id);
            saveToLocalStorage();
            renderPlanner();
            renderHome();
        });

        container.appendChild(taskEl);
    });
}

function openTaskModal(task = null) {
    const modal = document.getElementById("task-modal");
    modal.classList.add("active");
    if (task) {
        document.getElementById("modal-title").textContent = "Edit Study Task";
        document.getElementById("task-id").value = task.id;
        document.getElementById("task-name").value = task.name;
        document.getElementById("task-priority").value = task.priority;
        document.getElementById("task-category").value = task.category;
        
        const preset = document.getElementById("task-duration-preset");
        const customWrap = document.getElementById("custom-duration-wrapper");
        if ([20, 45, 90, 120, 180].includes(task.duration)) {
            preset.value = task.duration;
            customWrap.style.display = 'none';
        } else {
            preset.value = 'custom';
            customWrap.style.display = 'block';
            document.getElementById("task-custom-duration").value = task.duration;
        }
    } else {
        document.getElementById("modal-title").textContent = "Add Study Task";
        document.getElementById("task-id").value = "";
        document.getElementById("task-form").reset();
        document.getElementById("custom-duration-wrapper").style.display = 'none';
    }
}

function closeTaskModal() {
    document.getElementById("task-modal").classList.remove("active");
}

function saveTaskFromModal() {
    const taskId = document.getElementById("task-id").value;
    const name = document.getElementById("task-name").value;
    const presetVal = document.getElementById("task-duration-preset").value;
    let duration = presetVal === 'custom' ? parseInt(document.getElementById("task-custom-duration").value) || 45 : parseInt(presetVal);
    const priority = document.getElementById("task-priority").value;
    const category = document.getElementById("task-category").value;

    const dayData = getDayData(activeDateKey);

    if (taskId) {
        const task = dayData.tasks.find(t => t.id === taskId);
        if (task) {
            task.name = name;
            task.duration = duration;
            task.priority = priority;
            task.category = category;
        }
    } else {
        const newTask = {
            id: 'task_' + Date.now(),
            name,
            duration,
            priority,
            category,
            completed: false
        };
        dayData.tasks.push(newTask);
    }

    saveToLocalStorage();
    closeTaskModal();
    renderPlanner();
    renderHome();
}

// --- TASK TIMER & FLEXIBLE ALARM MODULE (TASK 1 & TASK 2) ---

function openActiveTimerModal(task, isRestoring = false) {
    currentTimer.taskId = task.id;
    currentTimer.taskName = task.name;
    if (!isRestoring) {
        currentTimer.durationSeconds = task.duration * 60;
        currentTimer.remainingSeconds = currentTimer.durationSeconds;
        currentTimer.endTime = null;
        currentTimer.isRunning = false;
        currentTimer.isPaused = false;
    }
    currentTimer.isPomodoro = false;

    document.getElementById("active-timer-task-name").textContent = task.name;
    document.getElementById("active-timer-countdown").textContent = formatSecondsToTime(currentTimer.remainingSeconds);
    
    document.getElementById("modal-start-btn").style.display = 'inline-flex';
    document.getElementById("modal-start-btn").disabled = false;
    document.getElementById("modal-pause-btn").style.display = 'inline-flex';
    document.getElementById("modal-pause-btn").disabled = true;
    document.getElementById("modal-resume-btn").style.display = 'none';

    document.getElementById("active-timer-modal").classList.add("active");

    document.getElementById("modal-start-btn").onclick = () => startTaskTimer();
    document.getElementById("modal-pause-btn").onclick = () => pauseTaskTimer();
    document.getElementById("modal-resume-btn").onclick = () => resumeTaskTimer();
    document.getElementById("modal-stop-btn").onclick = () => stopTaskTimer();
    document.getElementById("modal-restart-btn").onclick = () => restartTaskTimer();
    document.getElementById("close-timer-modal").onclick = () => {
        document.getElementById("active-timer-modal").classList.remove("active");
    };
}

// Task 1: Timestamp-based Task Timer Engine supporting tab minimization, background sleep/resume & persistence
function startTaskTimer() {
    currentTimer.isRunning = true;
    currentTimer.isPaused = false;
    currentTimer.endTime = Date.now() + (currentTimer.remainingSeconds * 1000);
    saveToLocalStorage();

    document.getElementById("modal-start-btn").style.display = 'none';
    document.getElementById("modal-pause-btn").disabled = false;

    startTaskTimerEngine(true);
}

function startTaskTimerEngine(freshStart = true) {
    if (currentTimer.timerId) clearInterval(currentTimer.timerId);

    currentTimer.timerId = setInterval(() => {
        const now = Date.now();
        const secondsLeft = Math.round((currentTimer.endTime - now) / 1000);

        if (secondsLeft > 0) {
            currentTimer.remainingSeconds = secondsLeft;
            document.getElementById("active-timer-countdown").textContent = formatSecondsToTime(currentTimer.remainingSeconds);
        } else {
            clearInterval(currentTimer.timerId);
            currentTimer.isRunning = false;
            currentTimer.remainingSeconds = 0;
            document.getElementById("active-timer-countdown").textContent = formatSecondsToTime(0);
            saveToLocalStorage();
            onTaskTimerFinished();
        }
    }, 200); // 200ms interval for smooth sub-second catchup accuracy on tab focus return
}

function pauseTaskTimer() {
    currentTimer.isRunning = false;
    currentTimer.isPaused = true;
    clearInterval(currentTimer.timerId);
    currentTimer.endTime = null;
    saveToLocalStorage();

    document.getElementById("modal-pause-btn").style.display = 'none';
    document.getElementById("modal-resume-btn").style.display = 'inline-flex';
}

function resumeTaskTimer() {
    currentTimer.isRunning = true;
    currentTimer.isPaused = false;
    currentTimer.endTime = Date.now() + (currentTimer.remainingSeconds * 1000);
    saveToLocalStorage();

    document.getElementById("modal-resume-btn").style.display = 'none';
    document.getElementById("modal-pause-btn").style.display = 'inline-flex';
    startTaskTimerEngine(false);
}

function stopTaskTimer() {
    clearInterval(currentTimer.timerId);
    currentTimer.isRunning = false;
    currentTimer.isPaused = false;
    currentTimer.endTime = null;
    saveToLocalStorage();
    document.getElementById("active-timer-modal").classList.remove("active");
}

function restartTaskTimer() {
    clearInterval(currentTimer.timerId);
    currentTimer.isRunning = false;
    currentTimer.isPaused = false;
    currentTimer.remainingSeconds = currentTimer.durationSeconds;
    currentTimer.endTime = null;
    saveToLocalStorage();

    document.getElementById("active-timer-countdown").textContent = formatSecondsToTime(currentTimer.remainingSeconds);
    document.getElementById("modal-start-btn").style.display = 'inline-flex';
    document.getElementById("modal-pause-btn").style.display = 'inline-flex';
    document.getElementById("modal-pause-btn").disabled = true;
    document.getElementById("modal-resume-btn").style.display = 'none';
}

function onTaskTimerFinished() {
    const dayData = getDayData(activeDateKey);
    dayData.studyTime += currentTimer.durationSeconds;

    if (currentTimer.taskId) {
        const task = dayData.tasks.find(t => t.id === currentTimer.taskId);
        if (task) {
            task.completed = true;
        }
    }
    saveToLocalStorage();
    renderPlanner();
    renderHome();

    document.getElementById("active-timer-modal").classList.remove("active");
    triggerFlexibleAlarm(`Task Completed: ${currentTimer.taskName}`);
}


// --- TASK 2: FLEXIBLE ALARM SYSTEM ---

function triggerFlexibleAlarm(message) {
    if (!appData.settings.alarmEnabled) return;

    document.getElementById("alarm-task-msg").textContent = message;
    document.getElementById("alarm-overlay").classList.add("active");

    // Browser Notification
    if (appData.settings.notificationsEnabled && "Notification" in window) {
        if (Notification.permission === "granted") {
            new Notification("NexusStudy Alarm", { body: message });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("NexusStudy Alarm", { body: message });
                }
            });
        }
    }

    // Configure repeat limits
    alarmLoopCount = 0;
    const repeatSetting = appData.settings.alarmRepeats;
    if (repeatSetting === '1') maxAlarmLoops = 1;
    else if (repeatSetting === '3') maxAlarmLoops = 3;
    else if (repeatSetting === '5') maxAlarmLoops = 5;
    else maxAlarmLoops = Infinity; // Infinite until stop

    playSelectedAlarmSound();
}

// Play selected built-in or custom alarm sound using Web Audio API or HTML5 Audio
function playSelectedAlarmSound() {
    const soundType = appData.settings.alarmSound;
    const volume = appData.settings.alarmVolume;

    if (soundType === 'custom' && customAlarmDataUrl) {
        playCustomAudio(customAlarmDataUrl, volume);
        return;
    }

    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        const playPattern = () => {
            if (alarmLoopCount >= maxAlarmLoops) {
                stopFlexibleAlarmAudio();
                return;
            }
            alarmLoopCount++;

            if (!audioCtx) return;
            const now = audioCtx.currentTime;

            if (soundType === 'bell') {
                // School Bell simulation: dual harmonic frequencies with long decay
                playTone(audioCtx, 659.25, now, 1.5, 'sine', volume);
                playTone(audioCtx, 523.25, now, 1.5, 'sine', volume * 0.8);
            } else if (soundType === 'digital') {
                // Digital Alarm: alternating pulsing high beeps
                playTone(audioCtx, 880, now, 0.25, 'square', volume);
                playTone(audioCtx, 1046.5, now + 0.3, 0.25, 'square', volume);
            } else if (soundType === 'chime') {
                // Soft Chime: gentle high triangle wave melody
                playTone(audioCtx, 523.25, now, 0.4, 'triangle', volume * 0.7);
                playTone(audioCtx, 659.25, now + 0.2, 0.4, 'triangle', volume * 0.7);
                playTone(audioCtx, 783.99, now + 0.4, 0.6, 'triangle', volume * 0.7);
            } else if (soundType === 'piano') {
                // Piano style arpeggio emulation
                playTone(audioCtx, 440, now, 0.5, 'sawtooth', volume * 0.5);
                playTone(audioCtx, 554.37, now + 0.15, 0.5, 'sawtooth', volume * 0.5);
                playTone(audioCtx, 659.25, now + 0.3, 0.5, 'sawtooth', volume * 0.5);
            } else if (soundType === 'rain') {
                // Rain / White noise gentle pulse
                playWhiteNoiseBurst(audioCtx, now, 0.6, volume * 0.9);
            } else {
                // Classic Beep fallback
                playTone(audioCtx, 880, now, 0.3, 'square', volume);
            }
        };

        playPattern();
        const intervalTime = soundType === 'bell' ? 2500 : (soundType === 'chime' ? 1800 : 1200);
        alarmInterval = setInterval(playPattern, intervalTime);

    } catch (e) {
        console.error("Web Audio API error", e);
    }
}

// Helper tone generator for Web Audio API built-in alarms
function playTone(ctx, freq, startTime, duration, type, volume) {
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    } catch(err) {}
}

// Helper white noise generator for rain sound option
function playWhiteNoiseBurst(ctx, startTime, duration, volume) {
    try {
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, startTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.linearRampToValueAtTime(0.01, startTime + duration);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        whiteNoise.start(startTime);
    } catch(err) {}
}

// Helper for custom uploaded audio playback
function playCustomAudio(dataUrl, volume) {
    try {
        activeAudioElement = new Audio(dataUrl);
        activeAudioElement.volume = volume;
        activeAudioElement.loop = (maxAlarmLoops === Infinity);
        
        let playCount = 0;
        activeAudioElement.onended = () => {
            playCount++;
            if (playCount < maxAlarmLoops) {
                activeAudioElement.play();
            }
        };
        activeAudioElement.play().catch(err => console.error("Custom audio play error", err));
    } catch(e) {
        console.error("Custom audio initialization error", e);
    }
}

function stopFlexibleAlarmAudio() {
    if (alarmInterval) clearInterval(alarmInterval);
    alarmInterval = null;

    if (audioCtx) {
        try { audioCtx.close(); } catch (e) {}
        audioCtx = null;
    }

    if (activeAudioElement) {
        try {
            activeAudioElement.pause();
            activeAudioElement.currentTime = 0;
        } catch (e) {}
        activeAudioElement = null;
    }
}


// --- POMODORO MODULE (Task 1 Timestamp-based Integration) ---
function initPomodoro() {
    const modeBtns = document.querySelectorAll(".pomo-mode-btn");
    modeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            modeBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const time = btn.getAttribute("data-time");
            if (time === 'custom') {
                let customMins = prompt("Enter custom focus duration in minutes:", "30");
                pomoState.focusMinutes = parseInt(customMins) || 25;
                pomoState.breakMinutes = 5;
            } else {
                pomoState.focusMinutes = parseInt(time);
                pomoState.breakMinutes = parseInt(btn.getAttribute("data-break"));
            }
            resetPomodoroTimer();
        });
    });

    document.getElementById("pomo-start-btn").addEventListener("click", startPomodoroTimer);
    document.getElementById("pomo-pause-btn").addEventListener("click", pausePomodoroTimer);
    document.getElementById("pomo-reset-btn").addEventListener("click", resetPomodoroTimer);
}

function resetPomodoroTimer() {
    if (pomoState.timerId) clearInterval(pomoState.timerId);
    pomoState.isRunning = false;
    pomoState.isPaused = false;
    pomoState.endTime = null;
    pomoState.mode = 'focus';
    pomoState.remainingSeconds = pomoState.focusMinutes * 60;
    saveToLocalStorage();
    
    document.getElementById("pomo-time").textContent = formatSecondsToTime(pomoState.remainingSeconds);
    document.getElementById("pomo-status-text").textContent = "Focus Session";
    document.getElementById("pomo-start-btn").disabled = false;
    document.getElementById("pomo-pause-btn").disabled = true;
}

// Task 1: Timestamp-based Pomodoro Timer Engine supporting tab backgrounding and resume
function startPomodoroTimer() {
    pomoState.isRunning = true;
    pomoState.isPaused = false;
    pomoState.endTime = Date.now() + (pomoState.remainingSeconds * 1000);
    saveToLocalStorage();

    document.getElementById("pomo-start-btn").disabled = true;
    document.getElementById("pomo-pause-btn").disabled = false;

    startPomodoroTimerEngine(true);
}

function startPomodoroTimerEngine(freshStart = true) {
    if (pomoState.timerId) clearInterval(pomoState.timerId);

    pomoState.timerId = setInterval(() => {
        const now = Date.now();
        const secondsLeft = Math.round((pomoState.endTime - now) / 1000);

        if (secondsLeft > 0) {
            pomoState.remainingSeconds = secondsLeft;
            document.getElementById("pomo-time").textContent = formatSecondsToTime(pomoState.remainingSeconds);
        } else {
            clearInterval(pomoState.timerId);
            pomoState.isRunning = false;
            pomoState.remainingSeconds = 0;
            document.getElementById("pomo-time").textContent = formatSecondsToTime(0);
            saveToLocalStorage();
            handlePomodoroCycleCompletion();
        }
    }, 200);
}

function pausePomodoroTimer() {
    pomoState.isRunning = false;
    pomoState.isPaused = true;
    clearInterval(pomoState.timerId);
    pomoState.endTime = null;
    saveToLocalStorage();

    document.getElementById("pomo-start-btn").disabled = false;
    document.getElementById("pomo-pause-btn").disabled = true;
}

function handlePomodoroCycleCompletion() {
    if (pomoState.mode === 'focus') {
        const dayData = getDayData(getFormattedDate(new Date()));
        dayData.studyTime += pomoState.focusMinutes * 60;
        saveToLocalStorage();
        renderHome();

        triggerFlexibleAlarm("Focus Session Completed! Time for a break.");
        
        pomoState.mode = 'break';
        pomoState.remainingSeconds = pomoState.breakMinutes * 60;
        document.getElementById("pomo-status-text").textContent = "Break Time ☕";
        document.getElementById("pomo-time").textContent = formatSecondsToTime(pomoState.remainingSeconds);

        if (appData.settings.autoStartNextTask) {
            startPomodoroTimer();
        } else {
            document.getElementById("pomo-start-btn").disabled = false;
            document.getElementById("pomo-pause-btn").disabled = true;
        }
    } else {
        triggerFlexibleAlarm("Break Finished! Ready for next session?");
        pomoState.mode = 'focus';
        pomoState.remainingSeconds = pomoState.focusMinutes * 60;
        document.getElementById("pomo-status-text").textContent = "Focus Session";
        document.getElementById("pomo-time").textContent = formatSecondsToTime(pomoState.remainingSeconds);
        
        document.getElementById("pomo-start-btn").disabled = false;
        document.getElementById("pomo-pause-btn").disabled = true;
    }
}

// --- STATISTICS MODULE ---
function renderStatistics() {
    const todayKey = getFormattedDate(new Date());
    const todayData = getDayData(todayKey);
    document.getElementById("stat-today-time").textContent = formatMinutes(Math.round(todayData.studyTime / 60));

    let weeklyMins = 0;
    let totalCompleted = 0;
    let totalPending = 0;
    for (let i = 0; i < 7; i++) {
        let tempD = new Date();
        tempD.setDate(tempD.getDate() - i);
        let dData = getDayData(getFormattedDate(tempD));
        weeklyMins += Math.round(dData.studyTime / 60);
        totalCompleted += dData.tasks.filter(t => t.completed).length;
        totalPending += dData.tasks.filter(t => !t.completed).length;
    }
    document.getElementById("stat-weekly-time").textContent = formatMinutes(weeklyMins);

    let monthlyMins = 0;
    const currentYearMonth = todayKey.substring(0, 7);
    for (let key in appData.days) {
        if (key.startsWith(currentYearMonth)) {
            monthlyMins += Math.round(appData.days[key].studyTime / 60);
        }
    }
    document.getElementById("stat-monthly-time").textContent = formatMinutes(monthlyMins);

    document.getElementById("stat-completed-count").textContent = totalCompleted;
    document.getElementById("stat-pending-count").textContent = totalPending;

    const totalTasks = totalCompleted + totalPending;
    const compRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    document.getElementById("stat-completion-rate").textContent = `${compRate}%`;

    const graphContainer = document.getElementById("study-graph");
    graphContainer.innerHTML = "";
    
    let maxMins = 60;
    let dailyMinsArr = [];
    for (let i = 6; i >= 0; i--) {
        let tempD = new Date();
        tempD.setDate(tempD.getDate() - i);
        let key = getFormattedDate(tempD);
        let mins = appData.days[key] ? Math.round(appData.days[key].studyTime / 60) : 0;
        if (mins > maxMins) maxMins = mins;
        dailyMinsArr.push({ label: tempD.toLocaleDateString(undefined, { weekday: 'short' }), mins });
    }

    dailyMinsArr.forEach(item => {
        let heightPct = Math.round((item.mins / maxMins) * 100);
        let col = document.createElement("div");
        col.className = "graph-bar-col";
        col.innerHTML = `
            <span style="font-size:0.75rem; margin-bottom:4px;">${item.mins}m</span>
            <div class="graph-bar" style="height: ${Math.max(heightPct, 5)}%;"></div>
            <span class="graph-label">${item.label}</span>
        `;
        graphContainer.appendChild(col);
    });
}

// --- GOALS MODULE ---
function initGoals() {
    ['monthly', 'weekly', 'daily'].forEach(type => {
        const textarea = document.getElementById(`goal-${type}-text`);
        textarea.value = appData.goals[type] || "";
        textarea.addEventListener("input", (e) => {
            appData.goals[type] = e.target.value;
            saveToLocalStorage();
        });
    });
}

// --- SEARCH & FILTER MODULE ---
function initSearch() {
    const triggerSearch = () => {
        const query = document.getElementById("search-input").value.toLowerCase();
        const status = document.getElementById("filter-status").value;
        const priority = document.getElementById("filter-priority").value;
        const category = document.getElementById("filter-category").value;

        const resultsContainer = document.getElementById("search-results-container");
        resultsContainer.innerHTML = "";

        let matchingTasks = [];

        for (let dateKey in appData.days) {
            const dayData = appData.days[dateKey];
            if (dayData && dayData.tasks) {
                dayData.tasks.forEach(task => {
                    let matchesQuery = task.name.toLowerCase().includes(query);
                    let matchesStatus = status === 'all' || (status === 'completed' && task.completed) || (status === 'pending' && !task.completed);
                    let matchesPriority = priority === 'all' || task.priority === priority;
                    let matchesCategory = category === 'all' || task.category === category;

                    if (matchesQuery && matchesStatus && matchesPriority && matchesCategory) {
                        matchingTasks.push({ ...task, dateKey });
                    }
                });
            }
        }

        if (matchingTasks.length === 0) {
            resultsContainer.innerHTML = `<p style="color:var(--text-secondary); text-align:center; padding: 20px;">No matching tasks found.</p>`;
            return;
        }

        matchingTasks.forEach(task => {
            const taskEl = document.createElement("div");
            taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskEl.innerHTML = `
                <div class="task-item-left">
                    <div class="task-details">
                        <h4>${escapeHtml(task.name)}</h4>
                        <div class="task-meta">
                            <span><i class="fa-solid fa-calendar"></i> ${task.dateKey}</span>
                            <span><i class="fa-solid fa-clock"></i> ${formatMinutes(task.duration)}</span>
                            <span class="badge ${task.priority}">${task.priority}</span>
                            <span class="badge category">${task.category}</span>
                        </div>
                    </div>
                </div>
            `;
            resultsContainer.appendChild(taskEl);
        });
    };

    document.getElementById("search-input").addEventListener("input", triggerSearch);
    document.getElementById("filter-status").addEventListener("change", triggerSearch);
    document.getElementById("filter-priority").addEventListener("change", triggerSearch);
    document.getElementById("filter-category").addEventListener("change", triggerSearch);
}

// --- BACKUP & RESET MODULE ---
function initBackupAndReset() {
    document.getElementById("export-btn").addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `nexus_study_backup_${getFormattedDate(new Date())}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
    });

    const fileInput = document.getElementById("import-file-input");
    document.getElementById("import-btn").addEventListener("click", () => fileInput.click());
    
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if (parsed && parsed.settings && parsed.days) {
                    appData = parsed;
                    saveToLocalStorage();
                    renderAll();
                    alert("Planner data successfully imported!");
                } else if (parsed && parsed.appData) {
                    appData = parsed.appData;
                    saveToLocalStorage();
                    renderAll();
                    alert("Planner data successfully imported!");
                } else {
                    alert("Invalid backup file structure.");
                }
            } catch (err) {
                alert("Failed to parse JSON file.");
            }
        };
        reader.readAsText(file);
    });

    document.getElementById("reset-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to reset all planner data? This action cannot be undone.")) {
            localStorage.removeItem("nexusStudyData");
            location.reload();
        }
    });
}

// --- SETTINGS MODULE (Enhanced with Alarm Options & UI bindings) ---
function initSettings() {
    const themeToggle = document.getElementById("settings-theme-toggle");
    const topThemeToggle = document.getElementById("theme-toggle");
    const alarmToggle = document.getElementById("settings-alarm-toggle");
    const volumeSlider = document.getElementById("alarm-volume-slider");
    const notifToggle = document.getElementById("settings-notif-toggle");
    const autoStartToggle = document.getElementById("settings-autostart-toggle");

    // Ensure appData.settings properties exist
    if (!appData.settings.alarmSound) appData.settings.alarmSound = 'digital';
    if (!appData.settings.alarmRepeats) appData.settings.alarmRepeats = 'infinite';

    themeToggle.checked = appData.settings.darkMode;
    alarmToggle.checked = appData.settings.alarmEnabled;
    volumeSlider.value = appData.settings.alarmVolume;
    notifToggle.checked = appData.settings.notificationsEnabled;
    autoStartToggle.checked = appData.settings.autoStartNextTask;

    // Dynamically inject advanced alarm options into the settings card without rewriting HTML structure
    const settingsCard = document.querySelector(".settings-card");
    if (settingsCard && !document.getElementById("alarm-sound-select")) {
        const alarmOptionsDiv = document.createElement("div");
        alarmOptionsDiv.className = "setting-item";
        alarmOptionsDiv.innerHTML = `
            <div>
                <h3>Alarm Sound & Repeats</h3>
                <p>Choose alarm preset tone and repetition limit</p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <select id="alarm-sound-select" style="background-color: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 8px; color: var(--text-primary);">
                    <option value="digital">Digital Alarm</option>
                    <option value="bell">School Bell</option>
                    <option value="chime">Soft Chime</option>
                    <option value="piano">Piano</option>
                    <option value="rain">Rain</option>
                    <option value="classic">Classic Beep</option>
                    <option value="custom">Upload Custom MP3/WAV</option>
                </select>
                <select id="alarm-repeat-select" style="background-color: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 8px; color: var(--text-primary);">
                    <option value="1">1 Time</option>
                    <option value="3">3 Times</option>
                    <option value="5">5 Times</option>
                    <option value="infinite">Infinite (Until Stop)</option>
                </select>
            </div>
        `;
        settingsCard.appendChild(alarmOptionsDiv);

        // Hidden file input for custom alarm upload
        const fileUploadInput = document.createElement("input");
        fileUploadInput.type = "file";
        fileUploadInput.id = "custom-alarm-file-input";
        fileUploadInput.accept = "audio/mp3,audio/wav,audio/*";
        fileUploadInput.style.display = "none";
        document.body.appendChild(fileUploadInput);

        const soundSelect = document.getElementById("alarm-sound-select");
        const repeatSelect = document.getElementById("alarm-repeat-select");
        
        soundSelect.value = appData.settings.alarmSound;
        repeatSelect.value = appData.settings.alarmRepeats;

        soundSelect.addEventListener("change", (e) => {
            const val = e.target.value;
            if (val === 'custom') {
                fileUploadInput.click();
            } else {
                appData.settings.alarmSound = val;
                saveToLocalStorage();
            }
        });

        fileUploadInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    customAlarmDataUrl = event.target.result;
                    appData.settings.alarmSound = 'custom';
                    soundSelect.value = 'custom';
                    saveToLocalStorage();
                    alert("Custom alarm audio loaded successfully!");
                };
                reader.readAsDataURL(file);
            }
        });

        repeatSelect.addEventListener("change", (e) => {
            appData.settings.alarmRepeats = e.target.value;
            saveToLocalStorage();
        });
    }

    const handleThemeChange = (isDark) => {
        appData.settings.darkMode = isDark;
        themeToggle.checked = isDark;
        applyTheme(isDark);
        saveToLocalStorage();
    };

    themeToggle.addEventListener("change", (e) => handleThemeChange(e.target.checked));
    topThemeToggle.addEventListener("click", () => handleThemeChange(!appData.settings.darkMode));

    alarmToggle.addEventListener("change", (e) => {
        appData.settings.alarmEnabled = e.target.checked;
        saveToLocalStorage();
    });

    volumeSlider.addEventListener("input", (e) => {
        appData.settings.alarmVolume = parseFloat(e.target.value);
        saveToLocalStorage();
    });

    notifToggle.addEventListener("change", (e) => {
        appData.settings.notificationsEnabled = e.target.checked;
        if (e.target.checked && "Notification" in window) {
            Notification.requestPermission();
        }
        saveToLocalStorage();
    });

    autoStartToggle.addEventListener("change", (e) => {
        appData.settings.autoStartNextTask = e.target.checked;
        saveToLocalStorage();
    });

    // Ensure Stop Alarm button stops every alarm type (Task 2 requirement)
    const stopAlarmBtn = document.getElementById("stop-alarm-btn");
    if (stopAlarmBtn) {
        // Replace onclick to safely stop audio element, intervals, and web audio oscillators
        stopAlarmBtn.onclick = () => {
            stopFlexibleAlarmAudio();
            document.getElementById("alarm-overlay").classList.remove("active");
        };
    }
}

function applyTheme(isDark) {
    if (isDark) {
        document.documentElement.setAttribute("data-theme", "dark");
        document.getElementById("theme-toggle").innerHTML = `<i class="fa-solid fa-sun"></i>`;
    } else {
        document.documentElement.setAttribute("data-theme", "light");
        document.getElementById("theme-toggle").innerHTML = `<i class="fa-solid fa-moon"></i>`;
    }
}

// --- RENDER ALL ---
function renderAll() {
    renderHome();
    renderCalendar();
    renderPlanner();
    initGoals();
}

// Helper security utility against basic string injection
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
