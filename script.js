/**
 * NexusStudy - Premium Productivity Application
 * Fully optimized frontend engine with robust state management & feature parity.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    let state = {
        currentView: 'dashboard-view',
        tasks: JSON.parse(localStorage.getItem('nexus_tasks')) || [
            { id: 1, title: 'Master Advanced Algorithms', category: 'Academics', priority: 'High', date: '2026-06-10', completed: false },
            { id: 2, title: 'Quantum Physics Lab Report', category: 'Science', priority: 'Medium', date: '2026-06-12', completed: true }
        ],
        notes: JSON.parse(localStorage.getItem('nexus_notes')) || [
            { id: 1, title: 'Design System Rules', content: 'Use glassmorphism, soft shadows and clean typography.', pinned: true, color: '#6366f1' }
        ],
        alarms: JSON.parse(localStorage.getItem('nexus_alarms')) || [],
        timer: {
            mode: 'pomodoro',
            timeLeft: 25 * 60,
            isRunning: false,
            timerId: null
        },
        theme: localStorage.getItem('nexus_theme') || 'dark'
    };

    // --- DOM Elements ---
    const navItems = document.querySelectorAll('.nav-item');
    const appViews = document.querySelectorAll('.app-view');
    const viewTitle = document.getElementById('viewTitle');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const settingsThemeToggle = document.getElementById('settingsThemeToggle');

    // --- Theme Manager ---
    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light');
            document.documentElement.classList.remove('dark');
            if(themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            document.body.classList.remove('light');
            document.documentElement.classList.add('dark');
            if(themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
        localStorage.setItem('nexus_theme', theme);
        state.theme = theme;
    }
    applyTheme(state.theme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            applyTheme(state.theme === 'dark' ? 'light' : 'dark');
        });
    }
    if (settingsThemeToggle) {
        settingsThemeToggle.addEventListener('click', () => {
            applyTheme(state.theme === 'dark' ? 'light' : 'dark');
        });
    }

    // --- Navigation ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const targetId = item.getAttribute('data-target');
            if (!targetId) return;

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            appViews.forEach(view => view.classList.remove('active'));
            const targetView = document.getElementById(targetId);
            if (targetView) targetView.classList.add('active');

            viewTitle.textContent = item.textContent.trim();
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });

    if (menuToggle) menuToggle.addEventListener('click', () => sidebar.classList.add('active'));
    if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', () => sidebar.classList.remove('active'));

    // --- Dashboard & Metrics Engine ---
    function updateDashboardMetrics() {
        const total = state.tasks.length;
        const completed = state.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const score = total > 0 ? Math.round((completed / total) * 100) : 0;

        document.getElementById('dashProdScore').textContent = `${score}%`;
        document.getElementById('dashCompletedTasks').textContent = `${completed}/${total}`;
        document.getElementById('dashPendingTasks').textContent = pending;
        
        // Date display
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDateDisplay').textContent = new Date().toLocaleDateString('en-US', options);
    }

    // --- Planner / Task Management ---
    const taskModal = document.getElementById('taskModal');
    const openTaskModalBtn = document.getElementById('openTaskModalBtn');
    const closeTaskModal = document.getElementById('closeTaskModal');
    const taskForm = document.getElementById('taskForm');
    const tasksListContainer = document.getElementById('tasksListContainer');

    if (openTaskModalBtn) openTaskModalBtn.addEventListener('click', () => taskModal.classList.add('active'));
    if (closeTaskModal) closeTaskModal.addEventListener('click', () => taskModal.classList.remove('active'));

    function renderTasks(filter = 'all', priorityFilterVal = 'all') {
        if (!tasksListContainer) return;
        tasksListContainer.innerHTML = '';

        let filtered = state.tasks.filter(t => {
            if (filter === 'completed' && !t.completed) return false;
            if (filter === 'pending' && t.completed) return false;
            if (priorityFilterVal !== 'all' && t.priority !== priorityFilterVal) return false;
            return true;
        });

        if (filtered.length === 0) {
            tasksListContainer.innerHTML = `<p class="empty-state">No tasks available in this view.</p>`;
            return;
        }

        filtered.forEach(task => {
            const card = document.createElement('div');
            card.className = `task-card ${task.completed ? 'completed' : ''}`;
            card.innerHTML = `
                <div class="task-header">
                    <span class="task-badge badge-${task.priority}">${task.priority}</span>
                    <div class="task-actions-btns">
                        <button onclick="toggleTask(${task.id})" class="icon-btn-sm" title="Toggle"><i class="fa-solid fa-check"></i></button>
                        <button onclick="deleteTask(${task.id})" class="icon-btn-sm danger" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <h4>${task.title}</h4>
                <p class="task-meta"><i class="fa-solid fa-folder"></i> ${task.category} &nbsp;|&nbsp; <i class="fa-solid fa-calendar"></i> ${task.date}</p>
            `;
            tasksListContainer.appendChild(card);
        });
        updateDashboardMetrics();
    }

    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newTask = {
                id: Date.now(),
                title: document.getElementById('taskTitleInput').value,
                category: document.getElementById('taskCategoryInput').value,
                priority: document.getElementById('taskPriorityInput').value,
                date: document.getElementById('taskDateInput').value,
                completed: false
            };
            state.tasks.push(newTask);
            localStorage.setItem('nexus_tasks', JSON.stringify(state.tasks));
            taskModal.classList.remove('active');
            taskForm.reset();
            renderTasks();
        });
    }

    window.toggleTask = function(id) {
        state.tasks = state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        localStorage.setItem('nexus_tasks', JSON.stringify(state.tasks));
        renderTasks();
    };

    window.deleteTask = function(id) {
        state.tasks = state.tasks.filter(t => t.id !== id);
        localStorage.setItem('nexus_tasks', JSON.stringify(state.tasks));
        renderTasks();
    };

    // --- Focus Timer Engine ---
    const timerDisplayTime = document.getElementById('timerDisplayTime');
    const timerStartBtn = document.getElementById('timerStartBtn');
    const timerResetBtn = document.getElementById('timerResetBtn');
    const timerTabs = document.querySelectorAll('.timer-tab');
    const timerModeLabel = document.getElementById('timerModeLabel');

    const timerDurations = { pomodoro: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60, stopwatch: 0 };

    timerTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            timerTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const mode = tab.getAttribute('data-timer-mode');
            state.timer.mode = mode;
            state.timer.timeLeft = timerDurations[mode];
            state.timer.isRunning = false;
            clearInterval(state.timer.timerId);
            timerStartBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
            updateTimerDisplay();
        });
    });

    function updateTimerDisplay() {
        if (!timerDisplayTime) return;
        const mins = Math.floor(state.timer.timeLeft / 60);
        const secs = state.timer.timeLeft % 60;
        timerDisplayTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    if (timerStartBtn) {
        timerStartBtn.addEventListener('click', () => {
            if (state.timer.isRunning) {
                clearInterval(state.timer.timerId);
                state.timer.isRunning = false;
                timerStartBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
            } else {
                state.timer.isRunning = true;
                timerStartBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
                state.timer.timerId = setInterval(() => {
                    if (state.timer.mode === 'stopwatch') {
                        state.timer.timeLeft++;
                        updateTimerDisplay();
                    } else {
                        if (state.timer.timeLeft > 0) {
                            state.timer.timeLeft--;
                            updateTimerDisplay();
                        } else {
                            clearInterval(state.timer.timerId);
                            alert('Focus Session Completed! Take a break.');
                            state.timer.isRunning = false;
                            timerStartBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
                        }
                    }
                }, 1000);
            }
        });
    }

    if (timerResetBtn) {
        timerResetBtn.addEventListener('click', () => {
            clearInterval(state.timer.timerId);
            state.timer.isRunning = false;
            state.timer.timeLeft = timerDurations[state.timer.mode];
            timerStartBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
            updateTimerDisplay();
        });
    }

    // --- Settings & Export/Import Data ---
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataInput = document.getElementById('importDataInput');

    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `nexus_study_planner_backup_${new Date().toISOString().slice(0,10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    }

    if (importDataInput) {
        importDataInput.addEventListener('change', (e) => {
            const fileReader = new FileReader();
            if(e.target.files[0]) {
                fileReader.readAsText(e.target.files[0], "UTF-8");
                fileReader.onload = (event) => {
                    try {
                        const imported = JSON.parse(event.target.result);
                        if (imported.tasks) state.tasks = imported.tasks;
                        if (imported.notes) state.notes = imported.notes;
                        localStorage.setItem('nexus_tasks', JSON.stringify(state.tasks));
                        localStorage.setItem('nexus_notes', JSON.stringify(state.notes));
                        renderTasks();
                        alert('Data successfully imported and synchronized!');
                    } catch (err) {
                        alert('Invalid backup JSON file.');
                    }
                };
            }
        });
    }

    // --- Initial Engine Start ---
    renderTasks();
    updateDashboardMetrics();
});
