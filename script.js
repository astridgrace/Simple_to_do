// Éléments du DOM
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');

/**
 * Crée un élément de tâche et l'ajoute à la liste.
 * @param {string} text - Intitulé de la tâche.
 */
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const li = document.createElement('li');
  li.className = 'task';

  const label = document.createElement('span');
  label.className = 'task__label';
  label.textContent = trimmed;

  const actions = document.createElement('div');
  actions.className = 'task__actions';

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'task__toggle';
  toggleBtn.textContent = 'Terminer';

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'task__delete';
  deleteBtn.textContent = 'Supprimer';

  actions.appendChild(toggleBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(label);
  li.appendChild(actions);
  taskList.appendChild(li);
}

/**
 * Gère le clic sur le bouton "Ajouter" ou la touche Entrée.
 */
function handleAdd() {
  addTask(taskInput.value);
  taskInput.value = '';
  taskInput.focus();
}

/**
 * Délégation d'événements pour gérer les actions sur les tâches.
 */
function handleListClick(event) {
  const target = event.target;
  const item = target.closest('li');
  if (!item) return;

  if (target.classList.contains('task__delete')) {
    item.remove();
  }

  if (target.classList.contains('task__toggle')) {
    item.classList.toggle('is-done');
  }
}

// Écouteurs
addBtn.addEventListener('click', handleAdd);
taskInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') handleAdd();
});
taskList.addEventListener('click', handleListClick);

