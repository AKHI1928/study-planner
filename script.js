/**
 * Study Planner - Updated script.js
 * Task 1: Timestamp-based timer with Date.now(), persistence in localStorage,
 *         and accuracy across background tabs, sleep, and refreshes.
 * Task 2: Flexible alarm system with multiple built-in sounds, custom file uploads,
 *         volume control, repeat modes, and browser notifications.
 */

// --- Task 1 & 2: State and Configuration Variables ---
// (Preserving all original variable names and IDs)

let taskTimerInterval = null;
let pomodoroTimerInterval = null;

// Persistent state structure for Task Timer
let taskTimerState = JSON.parse(localStorage.getItem('taskTimerState')) || {
    targetTime: null,
    remainingTime: 0,
    isRunning: false,
    isPaused: false,
    duration: 0
};

// Persistent state structure for Pomodoro Timer
let pomodoroTimerState = JSON.parse(localStorage.getItem('pomodoroTimerState')) || {
    targetTime: null,
    remainingTime: 0,
    isRunning: false,
    isPaused: false,
    duration: 0
};

// Audio context & alarm variables
let activeAudioElement = null;
let activeWebAudioOscillator = null;
let activeWebAudioContext = null;

// --- Helper Functions for Timestamp-Based Timers ---

/**
 * Saves current timer state to localStorage to survive page refreshes and browser crashes.
 */
function saveTimerStates() {
    localStorage.setItem('taskTimerState', JSON.stringify(taskTimerState));
    localStorage.setItem('pomodoroTimerState', JSON.stringify(pomodoroTimerState));
}

/**
 * Universal function to trigger browser notifications when a timer completes.
 */
function triggerAlarmNotification(title = "Study Planner Alert", body = "Your timer has finished!") {
    if ("Notification" in window) {
        if (Notification.permission === "granted") {
            new Notification(title, { body: body });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(title, { body: body });
                }
            });
        }
    }
}

// --- Task 2: Flexible Alarm System Implementation ---

/**
 * Stops all currently playing sounds (HTML5 Audio or Web Audio API oscillators).
 */
function stopAllAlarms() {
    if (activeAudioElement) {
        activeAudioElement.pause();
        activeAudioElement.currentTime = 0;
        activeAudioElement = null;
    }
    if (activeWebAudioOscillator) {
        try {
            activeWebAudioOscillator.stop();
        } catch (e) {
            // Ignore if already stopped
        }
        activeWebAudioOscillator = null;
    }
    if (activeWebAudioContext) {
        try {
            activeWebAudioContext.close();
        } catch (e) {
            // Ignore if already closed
        }
        activeWebAudioContext = null;
    }
}

/**
 * Plays the selected alarm option based on user configurations (Volume, Repeat, Type).
 */
function playAlarmSystem() {
    stopAllAlarms();

    // Read user configurations safely with fallbacks to match existing DOM IDs
    const alarmTypeSelect = document.getElementById('alarmType') || document.getElementById('alarm-type') || { value: 'classic' };
    const volumeSlider = document.getElementById('alarmVolume') || document.getElementById('volumeSlider') || { value: 80 };
    const repeatSelect = document.getElementById('alarmRepeat') || document.getElementById('repeatOption') || { value: '1' };
    const customFileInput = document.getElementById('customAlarmFile') || { files: [] };

    const selectedType = alarmTypeSelect.value;
    const volume = parseFloat(volumeSlider.value) / 100; // Normalized 0.0 to 1.0
    const repeatOption = repeatSelect.value; // '1', '3', '5', 'infinite'

    let repeatCount = 0;
    const maxRepeats = repeatOption === 'infinite' ? 999999 : parseInt(repeatOption, 10) || 1;

    // Handle Custom Audio File Upload
    if (selectedType === 'custom' && customFileInput.files && customFileInput.files[0]) {
        const fileURL = URL.createObjectURL(customFileInput.files[0]);
        playAudioFileWithRepeat(fileURL, volume, maxRepeats);
        return;
    }

    // Handle Built-in Sounds using Web Audio API or synthesized patterns
    playSynthesizedAlarm(selectedType, volume, maxRepeats);
}

function playAudioFileWithRepeat(url, volume, maxRepeats) {
    let currentPlayCount = 0;
    
    function playOnce() {
        if (currentPlayCount >= maxRepeats) return;
        activeAudioElement = new Audio(url);
        activeAudioElement.volume = volume;
        activeAudioElement.onended = () => {
            currentPlayCount++;
            playOnce();
        };
        activeAudioElement.play().catch(err => console.log("Audio play blocked/failed:", err));
    }
    playOnce();
}

function playSynthesizedAlarm(type, volume, maxRepeats) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    activeWebAudioContext = new AudioContext();
    let currentLoop = 0;

    function triggerPattern() {
        if (currentLoop >= maxRepeats || !activeWebAudioContext) return;

        const now = activeWebAudioContext.currentTime;
        const gainNode = activeWebAudioContext.createGain();
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.connect(activeWebAudioContext.destination);

        if (type === 'school-bell') {
            // Ringing school bell simulation (dual frequencies)
            const osc1 = activeWebAudioContext.createOscillator();
            const osc2 = activeWebAudioContext.createOscillator();
            osc1.type = 'sine';
            osc2.type = 'sine';
            osc1.frequency.setValueAtTime(800, now);
            osc2.frequency.setValueAtTime(1200, now);
            
            osc1.connect(gainNode);
            osc2.connect(gainNode);
            
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 1.5);
            osc2.stop(now + 1.5);

            setTimeout(() => {
                currentLoop++;
                if (currentLoop < maxRepeats) triggerPattern();
            }, 2000);

        } else if (type === 'digital') {
            // Digital electronic beep pattern
            const osc = activeWebAudioContext.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(2000, now);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.2);

            setTimeout(() => {
                const now2 = activeWebAudioContext.currentTime;
                const osc2 = activeWebAudioContext.createOscillator();
                osc2.type = 'square';
                osc2.frequency.setValueAtTime(2500, now2);
                osc2.connect(gainNode);
                osc2.start(now2);
                osc2.stop(now2 + 0.2);
            }, 250);

            setTimeout(() => {
                currentLoop++;
                if (currentLoop < maxRepeats) triggerPattern();
                else stopAllAlarms();
            }, 800);

        } else if (type === 'soft-chime') {
            // Gentle melodic chime
            const osc = activeWebAudioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 1.2);

            setTimeout(() => {
                currentLoop++;
                if (currentLoop < maxRepeats) triggerPattern();
            }, 1500);

        } else if (type === 'rain') {
            // White noise simulation for rain sound effect
            const bufferSize = activeWebAudioContext.sampleRate * 2;
            const buffer = activeWebAudioContext.createBuffer(1, bufferSize, activeWebAudioContext.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const whiteNoise = activeWebAudioContext.createBufferSource();
            whiteNoise.buffer = buffer;
            
            const filter = activeWebAudioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, now);

            whiteNoise.connect(filter);
            filter.connect(gainNode);
            whiteNoise.start(now);
            whiteNoise.stop(now + 2);

            setTimeout(() => {
                currentLoop++;
                if (currentLoop < maxRepeats) triggerPattern();
            }, 2200);

        } else {
            // Default Classic Beep
            const osc = activeWebAudioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.5);

            setTimeout(() => {
                currentLoop++;
                if (currentLoop < maxRepeats) triggerPattern();
            }, 1000);
        }
    }

    triggerPattern();
}

// Bind universal Stop Alarm handlers to all matching UI buttons
document.addEventListener('DOMContentLoaded', () => {
    const stopButtonSelectors = ['#stopAlarm', '#stop-alarm', '.stop-alarm-btn', '#stopTimer', '#stopPomodoro'];
    stopButtonSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener('click', stopAllAlarms);
        });
    });
});


// --- Task 1: Timestamp-Based Timers (Task Timer & Pomodoro Timer) ---

/**
 * Updates the Task Timer display dynamically using Date.now() timestamp drift correction.
 */
function updateTaskTimer() {
    if (!taskTimerState.isRunning) return;

    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((taskTimerState.targetTime - now) / 1000));
    taskTimerState.remainingTime = remaining;

    // Update DOM element safely if it exists
    const displayElement = document.getElementById('taskTimerDisplay') || document.getElementById('task-timer-display');
    if (displayElement) {
        displayElement.textContent = formatTimeDisplay(remaining);
    }

    saveTimerStates();

    if (remaining <= 0) {
        clearInterval(taskTimerInterval);
        taskTimerState.isRunning = false;
        taskTimerState.isPaused = false;
        saveTimerStates();
        playAlarmSystem();
        triggerAlarmNotification("Task Timer Finished", "Your scheduled task time is complete!");
    }
}

/**
 * Updates the Pomodoro Timer display dynamically using Date.now() timestamp drift correction.
 */
function updatePomodoroTimer() {
    if (!pomodoroTimerState.isRunning) return;

    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((pomodoroTimerState.targetTime - now) / 1000));
    pomodoroTimerState.remainingTime = remaining;

    // Update DOM element safely if it exists
    const displayElement = document.getElementById('pomodoroTimerDisplay') || document.getElementById('pomodoro-timer-display');
    if (displayElement) {
        displayElement.textContent = formatTimeDisplay(remaining);
    }

    saveTimerStates();

    if (remaining <= 0) {
        clearInterval(pomodoroTimerInterval);
        pomodoroTimerState.isRunning = false;
        pomodoroTimerState.isPaused = false;
        saveTimerStates();
        playAlarmSystem();
        triggerAlarmNotification("Pomodoro Timer Finished", "Time for a break!");
    }
}

/**
 * Formats seconds into standard HH:MM:SS or MM:SS string representation.
 */
function formatTimeDisplay(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// --- Enhanced Control Functions (Start, Pause, Resume, Restart, Stop) ---

function startTaskTimer(durationSeconds) {
    clearInterval(taskTimerInterval);
    const duration = durationSeconds || taskTimerState.duration || 1500;
    taskTimerState.duration = duration;
    taskTimerState.targetTime = Date.now() + (duration * 1000);
    taskTimerState.isRunning = true;
    taskTimerState.isPaused = false;
    saveTimerStates();

    taskTimerInterval = setInterval(updateTaskTimer, 2005); // Checked reliably even in background via timestamps
}

function pauseTaskTimer() {
    if (!taskTimerState.isRunning) return;
    clearInterval(taskTimerInterval);
    taskTimerState.remainingTime = Math.max(0, Math.ceil((taskTimerState.targetTime - Date.now()) / 1000));
    taskTimerState.isRunning = false;
    taskTimerState.isPaused = true;
    saveTimerStates();
}

function resumeTaskTimer() {
    if (!taskTimerState.isPaused) return;
    taskTimerState.targetTime = Date.now() + (taskTimerState.remainingTime * 1000);
    taskTimerState.isRunning = true;
    taskTimerState.isPaused = false;
    saveTimerStates();

    taskTimerInterval = setInterval(updateTaskTimer, 2005);
}

function restartTaskTimer() {
    clearInterval(taskTimerInterval);
    startTaskTimer(taskTimerState.duration);
}

function stopTaskTimer() {
    clearInterval(taskTimerInterval);
    taskTimerState.isRunning = false;
    taskTimerState.isPaused = false;
    taskTimerState.remainingTime = 0;
    taskTimerState.targetTime = null;
    saveTimerStates();
    stopAllAlarms();
}


function startPomodoroTimer(durationSeconds) {
    clearInterval(pomodoroTimerInterval);
    const duration = durationSeconds || pomodoroTimerState.duration || 1500;
    pomodoroTimerState.duration = duration;
    pomodoroTimerState.targetTime = Date.now() + (duration * 1000);
    pomodoroTimerState.isRunning = true;
    pomodoroTimerState.isPaused = false;
    saveTimerStates();

    pomodoroTimerInterval = setInterval(updatePomodoroTimer, 2005);
}

function pausePomodoroTimer() {
    if (!pomodoroTimerState.isRunning) return;
    clearInterval(pomodoroTimerInterval);
    pomodoroTimerState.remainingTime = Math.max(0, Math.ceil((pomodoroTimerState.targetTime - Date.now()) / 1000));
    pomodoroTimerState.isRunning = false;
    pomodoroTimerState.isPaused = true;
    saveTimerStates();
}

function resumePomodoroTimer() {
    if (!pomodoroTimerState.isPaused) return;
    pomodoroTimerState.targetTime = Date.now() + (pomodoroTimerState.remainingTime * 1000);
    pomodoroTimerState.isRunning = true;
    pomodoroTimerState.isPaused = false;
    saveTimerStates();

    pomodoroTimerInterval = setInterval(updatePomodoroTimer, 2005);
}

function restartPomodoroTimer() {
    clearInterval(pomodoroTimerInterval);
    startPomodoroTimer(pomodoroTimerState.duration);
}

function stopPomodoroTimer() {
    clearInterval(pomodoroTimerInterval);
    pomodoroTimerState.isRunning = false;
    pomodoroTimerState.isPaused = false;
    pomodoroTimerState.remainingTime = 0;
    pomodoroTimerState.targetTime = null;
    saveTimerStates();
    stopAllAlarms();
}

// --- Automatic State Restoration on Page Load ---
window.addEventListener('load', () => {
    // Restore Task Timer if it was running before refresh/sleep
    if (taskTimerState.isRunning && taskTimerState.targetTime) {
        const now = Date.now();
        if (taskTimerState.targetTime > now) {
            taskTimerInterval = setInterval(updateTaskTimer, 2005);
        } else {
            taskTimerState.isRunning = false;
            taskTimerState.remainingTime = 0;
            saveTimerStates();
            playAlarmSystem();
        }
    }

    // Restore Pomodoro Timer if it was running before refresh/sleep
    if (pomodoroTimerState.isRunning && pomodoroTimerState.targetTime) {
        const now = Date.now();
        if (pomodoroTimerState.targetTime > now) {
            pomodoroTimerInterval = setInterval(updatePomodoroTimer, 2005);
        } else {
            pomodoroTimerState.isRunning = false;
            pomodoroTimerState.remainingTime = 0;
            saveTimerStates();
            playAlarmSystem();
        }
    }
});
