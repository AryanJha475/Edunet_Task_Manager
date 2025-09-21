document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskModal = document.getElementById('taskModal');
    const taskForm = document.getElementById('taskForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const modalTitle = document.getElementById('modalTitle');
    const taskIdInput = document.getElementById('taskId');
    const taskNameInput = document.getElementById('taskNameInput');
    const taskDateInput = document.getElementById('taskDateInput');
    const taskTimeInput = document.getElementById('taskTimeInput');
    
    const todayTaskList = document.getElementById('todayTaskList');
    const upcomingTaskList = document.getElementById('upcomingTaskList');
    const completedTaskList = document.getElementById('completedTaskList');

    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // --- Core Functions ---

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = () => {
        todayTaskList.innerHTML = '';
        upcomingTaskList.innerHTML = '';
        completedTaskList.innerHTML = '';

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        // Sort tasks by due date
        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        let todayCount = 0, upcomingCount = 0, completedCount = 0;
        
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            
            if (task.completed) {
                completedTaskList.appendChild(taskElement);
                completedCount++;
            } else {
                const taskDueDate = new Date(task.dueDate).getTime();
                 if (taskDueDate < today) { // Overdue tasks are also shown in "Today"
                    taskElement.classList.add('overdue');
                    todayTaskList.appendChild(taskElement);
                    todayCount++;
                } else if (taskDueDate >= today && taskDueDate < today + 24 * 60 * 60 * 1000) {
                    todayTaskList.appendChild(taskElement);
                    todayCount++;
                } else {
                    upcomingTaskList.appendChild(taskElement);
                    upcomingCount++;
                }
            }
        });

        if (todayCount === 0) todayTaskList.innerHTML = '<p class="empty-message">No tasks for today. Enjoy your day!</p>';
        if (upcomingCount === 0) upcomingTaskList.innerHTML = '<p class="empty-message">No upcoming tasks.</p>';
        if (completedCount === 0) completedTaskList.innerHTML = '<p class="empty-message">No completed tasks yet.</p>';
    };
    
    const createTaskElement = (task) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;
        if(task.completed) li.classList.add('completed');

        const dueDate = new Date(task.dueDate);
        const isOverdue = !task.completed && (new Date() > dueDate);
        if(isOverdue) li.classList.add('overdue');

        const formattedDate = dueDate.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        });
        
        li.innerHTML = `
            <input type="checkbox" class="complete-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <span class="task-name">${task.name}</span>
                <div class="due-date">${formattedDate}</div>
            </div>
            <div class="actions">
                <button class="edit-btn" title="Edit Task"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" title="Delete Task"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        // Event Listeners for task actions
        li.querySelector('.complete-checkbox').addEventListener('change', () => toggleComplete(task.id));
        li.querySelector('.edit-btn').addEventListener('click', () => openModal(task));
        li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

        return li;
    };

    // --- Modal Management ---

    const openModal = (task = null) => {
        taskForm.reset();
        if (task) {
            modalTitle.textContent = 'Edit Task';
            taskIdInput.value = task.id;
            taskNameInput.value = task.name;
            
            // Due date is stored as ISO string, need to format for inputs
            const dateObj = new Date(task.dueDate);
            const date = dateObj.toISOString().split('T')[0];
            const time = dateObj.toTimeString().split(' ')[0].substring(0, 5);
            
            taskDateInput.value = date;
            taskTimeInput.value = time;

        } else {
            modalTitle.textContent = 'Add New Task';
            taskIdInput.value = '';
        }
        taskModal.classList.add('visible');
    };

    const closeModal = () => {
        taskModal.classList.remove('visible');
    };

    // --- Task CRUD Operations ---
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        const id = taskIdInput.value;
        const name = taskNameInput.value.trim();
        const date = taskDateInput.value;
        const time = taskTimeInput.value;
        
        if (!name || !date || !time) {
            // A simple alert is fine for now, but a custom UI message would be more professional
            alert('Please fill all fields.');
            return;
        }

        const dueDate = new Date(`${date}T${time}`).toISOString();

        if (id) { // Editing existing task
            const taskIndex = tasks.findIndex(t => t.id === id);
            if (taskIndex > -1) {
                tasks[taskIndex] = { ...tasks[taskIndex], name, dueDate };
            }
        } else { // Adding new task
            const newTask = {
                id: `task-${new Date().getTime()}`,
                name,
                dueDate,
                completed: false
            };
            tasks.push(newTask);
        }
        
        saveTasks();
        renderTasks();
        closeModal();
    };

    const toggleComplete = (id) => {
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex > -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks();
        }
    };

    const deleteTask = (id) => {
        // A confirmation dialog is good practice for destructive actions
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        }
    };

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', () => openModal());
    cancelBtn.addEventListener('click', closeModal);
    taskForm.addEventListener('submit', handleFormSubmit);
    // Close modal if clicking outside the content
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeModal();
        }
    });

    // --- Initial Render ---
    renderTasks();
});
