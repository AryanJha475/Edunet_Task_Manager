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

  const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  // 🔥 Progress Tracker
  const updateProgress = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("progressText").textContent =
      `${percentage}% Completed (${completed} of ${total} tasks)`;
    document.getElementById("progressFill").style.width = `${percentage}%`;
  };

  const renderTasks = () => {
    todayTaskList.innerHTML = '';
    upcomingTaskList.innerHTML = '';
    completedTaskList.innerHTML = '';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    let todayCount = 0, upcomingCount = 0, completedCount = 0;

    tasks.forEach(task => {
      const taskElement = createTaskElement(task);

      if (task.completed) {
        completedTaskList.appendChild(taskElement);
        completedCount++;
      } else {
        const taskDueDate = new Date(task.dueDate).getTime();
        if (taskDueDate < today) {
          taskElement.classList.add('overdue');
          todayTaskList.appendChild(taskElement);
          todayCount++;
        } else if (taskDueDate >= today && taskDueDate < today + 24*60*60*1000) {
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

    // update tracker
    updateProgress();
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
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
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

    li.querySelector('.complete-checkbox').addEventListener('change', () => toggleComplete(task.id));
    li.querySelector('.edit-btn').addEventListener('click', () => openModal(task));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

    return li;
  };

  const openModal = (task = null) => {
    taskForm.reset();
    if (task) {
      modalTitle.textContent = 'Edit Task';
      taskIdInput.value = task.id;
      taskNameInput.value = task.name;

      const dateObj = new Date(task.dueDate);
      taskDateInput.value = dateObj.toISOString().split('T')[0];
      taskTimeInput.value = dateObj.toTimeString().split(' ')[0].substring(0,5);
    } else {
      modalTitle.textContent = 'Add New Task';
      taskIdInput.value = '';
    }
    taskModal.classList.add('visible');
  };

  const closeModal = () => {
    taskModal.classList.remove('visible');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const id = taskIdInput.value;
    const name = taskNameInput.value.trim();
    const date = taskDateInput.value;
    const time = taskTimeInput.value;

    if (!name || !date || !time) {
      alert('Please fill all fields.');
      return;
    }

    const dueDate = new Date(`${date}T${time}`).toISOString();

    if (id) {
      const taskIndex = tasks.findIndex(t => t.id === id);
      if (taskIndex > -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], name, dueDate };
      }
    } else {
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
    if (confirm('Are you sure you want to delete this task?')) {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderTasks();
    }
  };

  // Events
  addTaskBtn.addEventListener('click', () => openModal());
  cancelBtn.addEventListener('click', closeModal);
  taskForm.addEventListener('submit', handleFormSubmit);
  taskModal.addEventListener('click', (e) => { if (e.target === taskModal) closeModal(); });

  // Initial render
  renderTasks();
});
