:root {
    --bg-main: #0f1117;
    --bg-sidebar: #161922;
    --card-bg: #1e222f;
    --border-color: #2a2f42;
    --text-primary: #f3f4f6;
    --text-secondary: #9ca3af;
    --accent: #6366f1;
    --accent-hover: #4f46e5;
    --danger: #ef4444;
    --success: #10b981;
    --warning: #f59e0b;
    --radius: 12px;
    --transition: all 0.25s ease;
}

[data-theme="light"] {
    --bg-main: #f8fafc;
    --bg-sidebar: #ffffff;
    --card-bg: #ffffff;
    --border-color: #e2e8f0;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --accent: #4f46e5;
    --accent-hover: #4338ca;
    --danger: #dc2626;
    --success: #059669;
    --warning: #d97706;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

body {
    background-color: var(--bg-main);
    color: var(--text-primary);
    min-height: 100vh;
    overflow-x: hidden;
}

.app-container {
    display: flex;
    min-height: 100vh;
}

/* Sidebar */
.sidebar {
    width: 260px;
    background-color: var(--bg-sidebar);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: fixed;
    height: 100vh;
    z-index: 100;
    transition: var(--transition);
}

.sidebar-header {
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
}

.logo-icon {
    color: var(--accent);
    font-size: 1.4rem;
}

.sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 16px;
    flex-grow: 1;
    overflow-y: auto;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    padding: 12px 16px;
    border-radius: var(--radius);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    text-align: left;
    width: 100%;
}

.nav-item:hover, .nav-item.active {
    background-color: var(--accent);
    color: #ffffff;
}

.sidebar-footer {
    padding: 20px;
    border-top: 1px solid var(--border-color);
}

.streak-badge {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    padding: 12px;
    border-radius: var(--radius);
    font-size: 0.9rem;
    font-weight: 600;
}

.flame-icon {
    color: var(--warning);
    font-size: 1.2rem;
}

/* Main Content */
.main-content {
    flex-grow: 1;
    margin-left: 260px;
    display: flex;
    flex-direction: column;
}

.top-bar {
    height: 70px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-sidebar);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    position: sticky;
    top: 0;
    z-index: 90;
}

.current-date-time {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
    color: var(--text-secondary);
}

.separator {
    color: var(--border-color);
}

.icon-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition);
}

.icon-btn:hover {
    background-color: var(--border-color);
}

.views-container {
    padding: 32px;
    flex-grow: 1;
}

.view {
    display: none;
    animation: fadeIn 0.3s ease;
}

.view.active {
    display: block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Common UI Elements */
.card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 24px;
    margin-bottom: 24px;
}

.btn {
    padding: 10px 20px;
    border-radius: var(--radius);
    border: none;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: var(--transition);
    font-size: 0.95rem;
}

.btn.primary {
    background-color: var(--accent);
    color: #ffffff;
}

.btn.primary:hover {
    background-color: var(--accent-hover);
}

.btn.secondary {
    background-color: var(--border-color);
    color: var(--text-primary);
}

.btn.secondary:hover {
    opacity: 0.85;
}

.btn.danger {
    background-color: var(--danger);
    color: #ffffff;
}

.btn.danger:hover {
    opacity: 0.85;
}

.btn.lg {
    padding: 14px 28px;
    font-size: 1.1rem;
}

/* Dashboard / Home */
.welcome-banner {
    margin-bottom: 24px;
}

.welcome-banner h1 {
    font-size: 1.8rem;
    margin-bottom: 8px;
}

.welcome-banner p {
    color: var(--text-secondary);
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
}

.metric-card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
}

.metric-icon {
    width: 50px;
    height: 50px;
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: #ffffff;
}

.metric-icon.study-time { background-color: #3b82f6; }
.metric-icon.tasks-rem { background-color: #8b5cf6; }
.metric-icon.daily-prog { background-color: #10b981; }
.metric-icon.weekly-prog { background-color: #f59e0b; }

.metric-info h3 {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 4px;
}

.metric-info p {
    font-size: 1.3rem;
    font-weight: 700;
}

.home-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
}

.progress-bar-container {
    background-color: var(--border-color);
    border-radius: 999px;
    height: 12px;
    width: 100%;
    overflow: hidden;
    margin: 16px 0 8px 0;
}

.progress-bar-fill {
    background-color: var(--accent);
    height: 100%;
    border-radius: 999px;
    transition: width 0.4s ease;
}

.quick-actions-flex {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* Calendar */
.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.calendar-nav {
    display: flex;
    align-items: center;
    gap: 16px;
}

.calendar-grid-wrapper {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 24px;
}

.weekdays-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 16px;
}

.days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
}

.calendar-day {
    aspect-ratio: 1;
    background-color: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;
    transition: var(--transition);
}

.calendar-day:hover {
    border-color: var(--accent);
}

.calendar-day.today {
    border-color: var(--accent);
    background-color: rgba(99, 102, 241, 0.08);
}

.calendar-day.completed-day {
    background-color: rgba(16, 185, 129, 0.08);
    border-color: var(--success);
}

.calendar-day-number {
    font-weight: 600;
    font-size: 0.9rem;
}

.calendar-day-badge {
    background-color: var(--accent);
    color: #ffffff;
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 999px;
    align-self: flex-start;
}

/* Daily Planner */
.planner-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.planner-date-selector h2 {
    font-size: 1.5rem;
    margin-bottom: 4px;
}

.planner-date-selector span {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.planner-goals-notes-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.planner-goals-notes-grid textarea {
    width: 100%;
    height: 100px;
    background-color: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 12px;
    color: var(--text-primary);
    resize: none;
    margin-top: 12px;
}

.tasks-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
}

.task-item {
    background-color: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: var(--transition);
}

.task-item.completed {
    opacity: 0.65;
    text-decoration: line-through;
}

.task-item-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.task-checkbox {
    width: 20px;
    height: 20px;
    accent-color: var(--accent);
    cursor: pointer;
}

.task-details h4 {
    font-size: 1rem;
    margin-bottom: 4px;
}

.task-meta {
    display: flex;
    gap: 12px;
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.badge {
    padding: 2px 8px;
    border-radius: 999px;
    font-weight: 600;
}

.badge.High { background-color: rgba(239, 68, 68, 0.15); color: var(--danger); }
.badge.Medium { background-color: rgba(245, 158, 11, 0.15); color: var(--warning); }
.badge.Low { background-color: rgba(16, 185, 129, 0.15); color: var(--success); }
.badge.category { background-color: var(--border-color); color: var(--text-primary); }

.task-item-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

/* Pomodoro */
.pomodoro-container {
    max-width: 600px;
    margin: 40px auto;
    text-align: center;
    padding: 40px;
}

.pomodoro-modes {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 32px;
}

.pomo-mode-btn {
    background-color: var(--bg-main);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 8px 16px;
    border-radius: var(--radius);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
}

.pomo-mode-btn.active {
    background-color: var(--accent);
    color: #ffffff;
    border-color: var(--accent);
}

.pomo-timer-display {
    font-size: 5rem;
    font-weight: 800;
    letter-spacing: -2px;
    margin-bottom: 12px;
}

.pomo-status {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-bottom: 32px;
    font-weight: 500;
}

.pomo-controls {
    display: flex;
    justify-content: center;
    gap: 16px;
}

/* Statistics & Graphs */
.stats-breakdown-flex {
    display: flex;
    gap: 32px;
    font-size: 1.1rem;
    font-weight: 600;
    margin-top: 12px;
}

.study-graph {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    height: 180px;
    padding-top: 20px;
    gap: 16px;
}

.graph-bar-col {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: flex-end;
}

.graph-bar {
    width: 100%;
    max-width: 40px;
    background-color: var(--accent);
    border-radius: 6px 6px 0 0;
    transition: height 0.4s ease;
}

.graph-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 8px;
}

/* Goals */
.goals-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}

.goals-grid textarea {
    width: 100%;
    height: 140px;
    background-color: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 12px;
    color: var(--text-primary);
    resize: none;
    margin: 12px 0;
}

/* Search */
.search-inputs-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 12px;
}

.search-inputs-row input, .search-inputs-row select {
    background-color: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 10px 14px;
    color: var(--text-primary);
    font-size: 0.95rem;
}

/* Backup & Settings */
.backup-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}

.danger-card {
    border-color: rgba(239, 68, 68, 0.3);
}

.settings-card {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.setting-item h3 {
    font-size: 1rem;
    margin-bottom: 4px;
}

.setting-item p {
    font-size: 0.85rem;
    color: var(--text-secondary);
}

/* Toggle Switch */
.switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 28px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: var(--border-color);
    transition: var(--transition);
    border-radius: 999px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: var(--transition);
    border-radius: 50%;
}

input:checked + .slider {
    background-color: var(--accent);
}

input:checked + .slider:before {
    transform: translateX(22px);
}

/* Modals */
.modal {
    display: none;
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 1000;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
}

.modal.active {
    display: flex;
    animation: fadeIn 0.2s ease;
}

.modal-content {
    width: 100%;
    max-width: 500px;
    margin: 20px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--text-secondary);
}

.form-group input, .form-group select {
    width: 100%;
    background-color: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 10px 14px;
    color: var(--text-primary);
    font-size: 0.95rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
}

/* Timer Overlay Modal */
.timer-modal-content {
    text-align: center;
    max-width: 450px;
}

.huge-timer-display {
    font-size: 4.5rem;
    font-weight: 800;
    margin: 24px 0;
    letter-spacing: -2px;
}

.timer-modal-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}

.close-timer-overlay {
    width: 100%;
}

/* Alarm Popup Overlay */
.alarm-modal {
    background-color: rgba(15, 17, 23, 0.85);
}

.alarm-modal-content {
    text-align: center;
    border: 2px solid var(--danger);
    padding: 40px;
}

.alarm-icon-pulse {
    font-size: 3.5rem;
    color: var(--danger);
    margin-bottom: 16px;
    animation: pulse 1s infinite alternate;
}

@keyframes pulse {
    from { transform: scale(1); opacity: 0.8; }
    to { transform: scale(1.15); opacity: 1; }
}

.alarm-modal-content h2 {
    font-size: 1.8rem;
    margin-bottom: 12px;
}

.alarm-modal-content p {
    color: var(--text-secondary);
    margin-bottom: 24px;
}

.pulse-btn {
    animation: pulseBtn 0.8s infinite alternate;
}

@keyframes pulseBtn {
    from { transform: scale(1); }
    to { transform: scale(1.05); }
}

/* Responsive Design */
@media (max-width: 1024px) {
    .sidebar { width: 80px; }
    .sidebar-header h2, .nav-item span, .sidebar-footer { display: none; }
    .main-content { margin-left: 80px; }
    .home-grid, .planner-goals-notes-grid, .goals-grid, .backup-grid, .search-inputs-row { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
    .sidebar { display: none; }
    .main-content { margin-left: 0; }
    .views-container { padding: 16px; }
    .top-bar { padding: 0 16px; }
}
