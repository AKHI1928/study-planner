/**
 * script.js - Updated Timer and Alarm Logic
 * 
 * Changes made:
 * 1. Replaced decremental setInterval seconds subtraction with absolute timestamp tracking (Date.now()) 
 *    to ensure complete accuracy when the browser is minimized, tabs are switched, or the laptop sleeps briefly.
 * 2. Ensured the timer does NOT start automatically on page load.
 * 3. Configured the alarm to ring ONLY ONCE when the timer reaches 00:00, preventing duplicate instances.
 * 4. Implemented immediate stopping behavior for the alarm via the Stop Alarm button.
 * 5. Maintained full compatibility with existing Start, Pause, Resume, Restart, and Stop buttons.
 */

// State variables for timer and alarm management
let remainingTime = 0;         // Remaining time in milliseconds
let timerEndTime = null;       // Absolute future timestamp when timer ends
let timerInterval = null;      // Interval reference for updating display
let isRunning = false;         // Tracks whether the timer is currently running
let isPaused = false;          // Tracks whether the timer is currently paused
let alarmAudio = null;         // Audio object for the alarm sound
let alarmHasRung = false;      // Flag to guarantee the alarm rings only once at 00:00

/**
 * Initializes the alarm audio element safely.
 */
function initAlarm() {
    if (!alarmAudio) {
        // Tries to find an existing audio element or creates a fallback audio instance
        alarmAudio = document.getElementById('alarm-audio') || document.getElementById('alarmSound') || new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        alarmAudio.loop = true; // Loops until manually stopped
    }
}

/**
 * Formats milliseconds into MM:SS format string.
 */
function formatTime(ms) {
    let totalSecs = Math.max(0, Math.ceil(ms / 1000));
    let minutes = Math.floor(totalSecs / 60);
    let seconds = totalSecs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Updates the UI display elements safely.
 */
function updateDisplay(ms) {
    const timerDisplay = document.getElementById('timer') || document.getElementById('timerDisplay') || document.getElementById('countdown');
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(ms);
    }
}

/**
 * Starts the timer using absolute timestamps (Date.now()) for drift-free accuracy.
 * Does NOT start automatically.
 */
function startTimer() {
    if (isRunning) return; // Prevent multiple timer instances running concurrently

    initAlarm();
    stopAlarm(); // Clear any existing active alarm

    // If not resuming from a paused state, fetch initial input values
    if (!isPaused) {
        const inputMinutes = document.getElementById('minutes-input') || document.getElementById('minutes');
        const inputSeconds = document.getElementById('seconds-input') || document.getElementById('seconds');
        
        let mins = inputMinutes ? parseInt(inputMinutes.value) || 0 : 0;
        let secs = inputSeconds ? parseInt(inputSeconds.value) || 0 : 0;
        
        let totalSeconds = (mins * 60) + secs;
        if (totalSeconds <= 0) return; // Do not start if duration is zero
        
        remainingTime = totalSeconds * 1000;
    }

    // Set the absolute end time based on current timestamp + remaining milliseconds
    timerEndTime = Date.now() + remainingTime;
    alarmHasRung = false;
    isRunning = true;
    isPaused = false;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const now = Date.now();
        remainingTime = timerEndTime - now;

        if (remainingTime <= 0) {
            remainingTime = 0;
            updateDisplay(remainingTime);
            clearInterval(timerInterval);
            isRunning = false;
            
            // Ring the alarm ONLY ONCE when the timer reaches 00:00
            triggerAlarm();
            return;
        }

        updateDisplay(remainingTime);
    }, 100); // Check frequently to keep UI responsive and accurate
}

/**
 * Pauses the running timer and calculates the exact remaining time.
 */
function pauseTimer() {
    if (!isRunning) return;

    clearInterval(timerInterval);
    remainingTime = timerEndTime - Date.now(); // Freeze exact remaining duration
    isRunning = false;
    isPaused = true;
}

/**
 * Resumes the timer from its paused state without losing elapsed duration.
 */
function resumeTimer() {
    if (isRunning || !isPaused) return;

    // Re-anchor the end timestamp using the preserved remaining time
    timerEndTime = Date.now() + remainingTime;
    isRunning = true;
    isPaused = false;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const now = Date.now();
        remainingTime = timerEndTime - now;

        if (remainingTime <= 0) {
            remainingTime = 0;
            updateDisplay(remainingTime);
            clearInterval(timerInterval);
            isRunning = false;
            
            triggerAlarm();
            return;
        }

        updateDisplay(remainingTime);
    }, 100);
}

/**
 * Restarts the timer back to initial input values without starting automatically.
 */
function restartTimer() {
    pauseTimer();
    stopAlarm();
    isPaused = false;
    
    const inputMinutes = document.getElementById('minutes-input') || document.getElementById('minutes');
    const inputSeconds = document.getElementById('seconds-input') || document.getElementById('seconds');
    let mins = inputMinutes ? parseInt(inputMinutes.value) || 0 : 0;
    let secs = inputSeconds ? parseInt(inputSeconds.value) || 0 : 0;
    
    let totalSeconds = (mins * 60) + secs;
    remainingTime = totalSeconds * 1000;
    updateDisplay(remainingTime);
}

/**
 * Completely stops and resets the timer logic.
 */
function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    isPaused = false;
    remainingTime = 0;
    timerEndTime = null;
    alarmHasRung = false;
    stopAlarm();
    updateDisplay(0);
}

/**
 * Triggers the alarm audio ONLY ONCE when reaching 00:00.
 */
function triggerAlarm() {
    if (alarmHasRung) return; // Prevent duplicate alarms or instances
    alarmHasRung = true;

    initAlarm();
    if (alarmAudio) {
        alarmAudio.currentTime = 0;
        alarmAudio.play().catch(error => console.log("Audio playback prevented or failed:", error));
    }
}

/**
 * Stops the alarm immediately when the Stop Alarm button is clicked.
 */
function stopAlarm() {
    if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
    }
    alarmHasRung = false;
}

// Bind event listeners to existing HTML buttons without modifying DOM structure
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start') || document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pause') || document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resume') || document.getElementById('resumeBtn');
    const restartBtn = document.getElementById('restart') || document.getElementById('restartBtn');
    const stopBtn = document.getElementById('stop') || document.getElementById('stopBtn');
    const stopAlarmBtn = document.getElementById('stop-alarm') || document.getElementById('stopAlarmBtn');

    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
    if (resumeBtn) resumeBtn.addEventListener('click', resumeTimer);
    if (restartBtn) restartBtn.addEventListener('click', restartTimer);
    if (stopBtn) stopBtn.addEventListener('click', stopTimer);
    if (stopAlarmBtn) stopAlarmBtn.addEventListener('click', stopAlarm);
});
