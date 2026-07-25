:root {
    --bg-main: #0f172a;
    --bg-sidebar: #1e293b;
    --card-bg: rgba(30, 41, 59, 0.70);
    --border-color: rgba(255, 255, 255, 0.08);
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --accent-primary: #6366f1;
    --accent-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    --success: #22c55e;
    --warning: #f59e0b;
    --danger: #ef4444;
    --sidebar-width: 260px;
    --header-height: 70px;
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.light {
    --bg-main: #f1f5f9;
    --bg-sidebar: #ffffff;
    --card-bg: rgba(255, 255, 255, 0.85);
    --border-color: rgba(0, 0, 0, 0.08);
    --text-primary: #0f172a;
    --text-secondary: #64748b;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Plus Jakarta Sans', sans-serif;
}

body {
    background-color: var(--bg-main);
    color: var(--text-primary);
    min-height: 100vh;
    overflow-x: hidden;
}

/* App Layout */
.app-layout {
    display: flex;
    min-height: 100vh;
}

/* Sidebar */
.sidebar {
    width: var(--sidebar-width);
    background-color: var(--bg-sidebar);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    z-index: 100;
    transition: var(--transition);
}

.sidebar-header {
    height: var(--header-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.app-logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.25rem;
    font-weight: 700;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.mobile-close-btn {
    display: none;
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: 1.2rem;
    cursor: pointer;
}

.sidebar-menu {
    padding: 1.5rem 1rem;
    flex: 1;
    overflow-y: auto;
}

.menu-category {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 1.25rem 0 0.5rem 0.75rem;
}

.nav-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: var(--text-secondary);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    margin-bottom: 0.25rem;
}

.nav-item:hover, .nav-item.active {
    background: var(--accent-gradient);
    color: #fff;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.sidebar-footer {
    padding: 1rem;
    border-top: 1px solid var(--border-color);
}

.user-profile-mini {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--accent-gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-weight: 600;
    font-size: 0.9rem;
}

.user-status {
    font-size: 0.75rem;
    color: var(--success);
}

/* Main Content */
.main-content {
    flex: 1;
    margin-left: var(--sidebar-width);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    transition: var(--transition);
}

.top-navbar {
    height: var(--header-height);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    background: var(--card-bg);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 90;
}

.nav-left, .nav-right {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.menu-toggle {
    display: none;
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: 1.2rem;
    cursor: pointer;
}

.view-title {
    font-size: 1.25rem;
    font-weight: 700;
}

.search-bar-top {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--border-color);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    width: 240px;
}

.search-bar-top input {
    background: none;
    border: none;
    color: var(--text-primary);
    outline: none;
    width: 100%;
    font-size: 0.9rem;
}

.icon-btn {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--card-bg);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition);
}

.icon-btn:hover {
    background: var(--accent-primary);
    color: #fff;
    border-color: transparent;
}

/* Views Wrapper */
.views-wrapper {
    padding: 2rem;
    flex: 1;
}

.app-view {
    display: none;
    animation: fadeIn 0.4s ease-in-out;
}

.app-view.active {
    display: block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Glass Cards & Elements */
.card, .welcome-banner, .metric-card {
    background: var(--card-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
}

.welcome-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
}

.welcome-text h1 {
    font-size: 1.75rem;
    font-weight: 800;
    margin-bottom: 0.25rem;
}

.quote-box {
    margin-top: 1rem;
    font-style: italic;
    color: var(--text-secondary);
    display: flex;
    gap: 0.55rem;
    align-items: center;
}

.weather-widget {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--card-bg);
    padding: 1rem 1.5rem;
    border-radius: 12px;
}

.weather-icon {
    font-size: 2rem;
    color: var(--warning);
}

/* Metrics Grid */
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.metric-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
}

.metric-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: #fff;
}

.metric-icon.blue { background: #3b82f6; }
.metric-icon.green { background: #22c55e; }
.metric-icon.orange { background: #f59e0b; }
.metric-icon.purple { background: #a855f7; }

.metric-info h3 {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.metric-info span {
    font-size: 1.5rem;
    font-weight: 700;
}

.dashboard-split {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
}

/* Buttons */
.btn-primary, .btn-primary-sm {
    background: var(--accent-gradient);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary { padding: 0.75rem 1.25rem; font-size: 0.95rem; }
.btn-primary-sm { padding: 0.5rem 1rem; font-size: 0.85rem; }
.btn-lg { padding: 1rem 2rem; font-size: 1.1rem; }

.btn-primary:hover, .btn-primary-sm:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
    background: var(--border-color);
    color: var(--text-primary);
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.25rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
}

.btn-secondary:hover {
    background: var(--text-secondary);
    color: #fff;
}

/* Action Toolbar */
.action-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.filter-group {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.filter-chip {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
}

.filter-chip.active, .filter-chip:hover {
    background: var(--accent-primary);
    color: #fff;
    border-color: transparent;
}

.select-box {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    outline: none;
}

/* Tasks Grid */
.tasks-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.task-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
    transition: var(--transition);
}

.task-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

.task-card.completed {
    opacity: 0.6;
    text-decoration: line-through;
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.task-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    font-weight: 700;
}

.badge-High { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
.badge-Medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.badge-Low { background: rgba(34, 197, 94, 0.2); color: #22c55e; }

/* Modals */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(5px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-backdrop.active {
    display: flex;
}

.modal-card {
    background: var(--bg-sidebar);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    width: 100%;
    max-width: 450px;
    padding: 2rem;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleUp {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.form-group {
    margin-bottom: 1.25rem;
}

.form-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
}

.form-group input, .form-group select {
    width: 100%;
    padding: 0.75rem;
    background: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-primary);
    outline: none;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
}

/* Timer View */
.timer-container-card {
    text-align: center;
    max-width: 600px;
    margin: 0 auto 2rem auto;
    padding: 3rem 2rem;
    background: var(--card-bg);
    border-radius: 20px;
    border: 1px solid var(--border-color);
    backdrop-filter: blur(15px);
}

.timer-tabs {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.timer-tab {
    background: var(--border-color);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    color: var(--text-secondary);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
}

.timer-tab.active, .timer-tab:hover {
    background: var(--accent-primary);
    color: #fff;
}

.timer-display-circle {
    font-size: 5rem;
    font-weight: 800;
    margin: 1.5rem 0;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: flex;
    flex-direction: column;
}

#timerModeLabel {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-secondary);
    -webkit-text-fill-color: var(--text-secondary);
    margin-top: 0.5rem;
}

.timer-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.active { transform: translateX(0); }
    .main-content { margin-left: 0; }
    .menu-toggle { display: block; }
    .mobile-close-btn { display: block; }
    .dashboard-split { grid-template-columns: 1fr; }
    .welcome-banner { flex-direction: column; gap: 1rem; align-items: flex-start; }
}
