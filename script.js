// --- DOM --------------------------------------------------------------------
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const filters = document.querySelectorAll('.filter');
const prioritySelect = document.getElementById('task-priority');
const themeToggle = document.getElementById('theme-toggle');
const exportBtn = document.getElementById('export-btn');
const importInput = document.getElementById('import-input');
const reloadBtn = document.getElementById('reload-btn');

// --- État -------------------------------------------------------------------
const STORAGE_KEY = 'todo_tasks';
const THEME_KEY = 'todo_theme';
let tasks = [];
let currentFilter = 'all';
let currentTheme = 'dark';

// --- Storage ---------------------------------------------------------------
const saveTasks = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const loadTasks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Impossible de charger les tâches :', error);
    return [];
  }
};

const loadTheme = () => localStorage.getItem(THEME_KEY) || 'dark';

const saveTheme = (theme) => localStorage.setItem(THEME_KEY, theme);

// --- Data helpers -----------------------------------------------------------
const createTaskData = (text, priority) => ({
  id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
  text,
  done: false,
  priority,
});

const addTaskData = (text, priority) => {
  tasks = [...tasks, createTaskData(text, priority)];
  saveTasks();
};

const removeTaskById = (id) => {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
};

const toggleTaskById = (id) => {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, done: !task.done } : task
  );
  saveTasks();
};

const getFilteredTasks = () => {
  if (currentFilter === 'active') return tasks.filter((task) => !task.done);
  if (currentFilter === 'completed') return tasks.filter((task) => task.done);
  return tasks;
};

const normalizeTask = (task) => {
  if (!task || typeof task.text !== 'string') return null;
  const cleanText = task.text.trim();
  if (!cleanText) return null;
  return {
    id: task.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
    text: cleanText,
    done: Boolean(task.done),
    priority: ['low', 'normal', 'high'].includes(task.priority) ? task.priority : 'normal',
  };
};

const normalizeTasks = (list) =>
  (Array.isArray(list) ? list : [])
    .map(normalizeTask)
    .filter(Boolean);

// --- UI helpers -------------------------------------------------------------
const wrapSrOnly = (text) => `<span class="sr-only">${text}</span>`;

const createIcon = (name) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('icon');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  if (name === 'trash') {
    path.setAttribute(
      'd',
      'M9 3h6l.5 2H19a1 1 0 110 2h-1v11a2 2 0 01-2 2H8a2 2 0 01-2-2V7H5a1 1 0 010-2h3L8.5 3H9zm1 6a1 1 0 10-2 0v8a1 1 0 102 0V9zm4 0a1 1 0 10-2 0v8a1 1 0 102 0V9z'
    );
  } else if (name === 'check') {
    path.setAttribute(
      'd',
      'M20.285 6.708a1 1 0 00-1.57-1.25L9.5 15.1l-3.2-3.2a1 1 0 10-1.4 1.428l4 4a1 1 0 001.42-.02l10-10.6z'
    );
  }

  svg.appendChild(path);
  return svg.outerHTML;
};

/**
 * Fabrique un élément de tâche à partir d'un objet.
 * @param {{ id: string, text: string, done: boolean }} task
 * @returns {HTMLLIElement}
 */
const createTaskElement = (task) => {
  const li = document.createElement('li');
  li.className = `task${task.done ? ' is-done' : ''}`;
  li.dataset.id = task.id;

  const label = document.createElement('span');
  label.className = 'task__label';
  label.textContent = task.text;

  const meta = document.createElement('div');
  meta.className = 'task__meta';

  const priority = document.createElement('span');
  priority.className = `task__priority priority--${task.priority || 'normal'}`;
  priority.innerHTML = `<span class="task__priority-dot"></span>${task.priority === 'high' ? 'Haute' : task.priority === 'low' ? 'Faible' : 'Normale'}`;

  const actions = document.createElement('div');
  actions.className = 'task__actions';

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'task__toggle';
  toggleBtn.innerHTML = `${createIcon('check')}${wrapSrOnly(task.done ? 'Rétablir' : 'Terminer')}`;

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'task__delete';
  deleteBtn.innerHTML = `${createIcon('trash')}${wrapSrOnly('Supprimer')}`;

  actions.appendChild(toggleBtn);
  actions.appendChild(deleteBtn);

  meta.appendChild(priority);
  meta.appendChild(label);

  li.appendChild(meta);
  li.appendChild(actions);

  return li;
};

const renderTasks = () => {
  taskList.innerHTML = '';

  const visibleTasks = getFilteredTasks();

  if (!visibleTasks.length) {
    const empty = document.createElement('li');
    empty.className = 'task-list__empty';
    empty.textContent = tasks.length
      ? 'Aucune tâche pour ce filtre.'
      : 'Aucune tâche pour le moment.';
    taskList.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  visibleTasks.forEach((task) => {
    fragment.appendChild(createTaskElement(task));
  });

  taskList.appendChild(fragment);
};

const setFilter = (filter) => {
  currentFilter = filter;
  filters.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.filter === filter);
  });
  renderTasks();
};

const setTheme = (theme) => {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? 'Mode clair' : 'Mode sombre';
  saveTheme(theme);
};

const toggleTheme = () => {
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
};

// --- Event handlers ---------------------------------------------------------
const handleAddTask = () => {
  const value = taskInput.value.trim();
  if (!value) return;
  const priority = prioritySelect.value || 'normal';
  addTaskData(value, priority);
  renderTasks();
  taskInput.value = '';
  prioritySelect.value = 'normal';
  taskInput.focus();
};

const handleDelete = (taskItem) => {
  if (!taskItem) return;
  const id = taskItem.dataset.id;
  taskItem.classList.add('is-removing');

  const finalize = () => {
    removeTaskById(id);
    renderTasks();
  };

  taskItem.addEventListener('animationend', finalize, { once: true });
  setTimeout(finalize, 260);
};

const handleToggle = (taskItem) => {
  if (!taskItem) return;
  const id = taskItem.dataset.id;
  toggleTaskById(id);
  renderTasks();
};

const handleListClick = (event) => {
  const deleteBtn = event.target.closest('.task__delete');
  if (deleteBtn) {
    handleDelete(deleteBtn.closest('.task'));
    return;
  }

  const toggleBtn = event.target.closest('.task__toggle');
  const labelClick = event.target.closest('.task__label');
  if (toggleBtn || labelClick) {
    handleToggle((toggleBtn || labelClick).closest('.task'));
  }
};

const handleExport = () => {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'tasks.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const handleImport = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const imported = normalizeTasks(parsed);
      if (!imported.length) return;
      tasks = imported;
      saveTasks();
      renderTasks();
    } catch (error) {
      console.warn('Fichier JSON invalide :', error);
    } finally {
      importInput.value = '';
    }
  };
  reader.readAsText(file);
};

const handleReload = () => {
  tasks = normalizeTasks(loadTasks());
  renderTasks();
};

// --- Wiring -----------------------------------------------------------------
addBtn.addEventListener('click', handleAddTask);
taskInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') handleAddTask();
});
filters.forEach((btn) =>
  btn.addEventListener('click', () => setFilter(btn.dataset.filter))
);
taskList.addEventListener('click', handleListClick);
themeToggle.addEventListener('click', toggleTheme);
exportBtn.addEventListener('click', handleExport);
importInput.addEventListener('change', handleImport);
reloadBtn.addEventListener('click', handleReload);

// --- Init -------------------------------------------------------------------
tasks = loadTasks();
// Normalise les anciennes tâches sans priorité
tasks = normalizeTasks(tasks);
renderTasks();
setTheme(loadTheme());

