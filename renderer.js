const urlInput = document.getElementById('url-input');
const qualitySelect = document.getElementById('quality-select');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const currentPathSpan = document.getElementById('current-path');
const changePathBtn = document.getElementById('change-path-btn');

// Initialize path
window.electronAPI.getDefaultPath().then(path => {
    currentPathSpan.textContent = path;
});

changePathBtn.addEventListener('click', async () => {
    const path = await window.electronAPI.selectDirectory();
    if (path) {
        currentPathSpan.textContent = path;
    }
});

addBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (!url) return;
    
    const quality = qualitySelect.value;
    window.electronAPI.addTask({ url, quality });
    urlInput.value = '';
});

// Event Handlers
window.electronAPI.onTaskAdded(({ taskId, url }) => {
    // Remove empty state if present
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.id = `task-${taskId}`;
    taskItem.innerHTML = `
        <div class="task-info">
            <div class="task-title" title="${url}">${url}</div>
            <div class="task-status">正在取得資訊...</div>
        </div>
        <div class="progress-container">
            <div class="progress-bar"></div>
        </div>
    `;
    taskList.prepend(taskItem);
});

window.electronAPI.onTaskInfo(({ taskId, title }) => {
    const taskItem = document.getElementById(`task-${taskId}`);
    if (taskItem) {
        taskItem.querySelector('.task-title').textContent = title;
        taskItem.querySelector('.task-status').textContent = '準備中...';
    }
});

window.electronAPI.onTaskProgress(({ taskId, progress, status }) => {
    const taskItem = document.getElementById(`task-${taskId}`);
    if (taskItem) {
        const progressBar = taskItem.querySelector('.progress-bar');
        const statusLabel = taskItem.querySelector('.task-status');
        
        progressBar.style.width = `${progress}%`;
        statusLabel.textContent = `${status} (${Math.round(progress)}%)`;
        
        if (status === 'Completed') {
            statusLabel.classList.add('status-completed');
            statusLabel.textContent = '已完成';
        }
    }
});

window.electronAPI.onTaskError(({ taskId, error }) => {
    const taskItem = document.getElementById(`task-${taskId}`);
    if (taskItem) {
        const statusLabel = taskItem.querySelector('.task-status');
        statusLabel.textContent = '錯誤';
        statusLabel.classList.add('status-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'task-error';
        errorDiv.textContent = error;
        taskItem.appendChild(errorDiv);
    }
});
