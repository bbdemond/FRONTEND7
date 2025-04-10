// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const notesList = document.getElementById('notes-list');
    const noteInput = document.getElementById('note-input');
    const addNoteBtn = document.getElementById('add-note-btn');
    const offlineStatus = document.getElementById('offline-status');

    // Инициализация данных
    let notes = loadNotes();
    let editingId = null;

    // Загрузка заметок из хранилища
    function loadNotes() {
        try {
            const data = localStorage.getItem('notes');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Ошибка загрузки заметок:', e);
            return [];
        }
    }

    // Сохранение заметок
    function saveNotes() {
        try {
            localStorage.setItem('notes', JSON.stringify(notes));
            renderNotes();
        } catch (e) {
            console.error('Ошибка сохранения заметок:', e);
        }
    }

    // Отображение заметок
    function renderNotes() {
        notesList.innerHTML = notes.map(note => `
            <div class="note-item">
                <div class="note-text">${escapeHTML(note.text)}</div>
                <button class="delete-btn" data-id="${note.id}">Удалить</button>
            </div>
        `).join('');

        // Обработчики удаления
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                notes = notes.filter(note => note.id !== parseInt(btn.dataset.id)); 
                saveNotes();
            });
        });

        // Обработчики редактирования
        document.querySelectorAll('.note-text').forEach(textEl => {
            textEl.addEventListener('click', () => {
                const note = notes.find(n => n.id === parseInt(textEl.nextElementSibling.dataset.id));
                if (note) {
                    noteInput.value = note.text;
                    editingId = note.id;
                    addNoteBtn.textContent = 'Сохранить';
                    noteInput.focus();
                }
            });
        });
    }

    // Экранирование HTML
    function escapeHTML(str) {
        return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Обработчик добавления/редактирования
    addNoteBtn.addEventListener('click', () => {
        const text = noteInput.value.trim();
        if (!text) return;

        if (editingId !== null) {
            const note = notes.find(n => n.id === editingId);
            if (note) note.text = text;
            editingId = null;
            addNoteBtn.textContent = 'Добавить';
        } else {
            notes.push({
                id: Date.now(),
                text: text,
                created: new Date().toISOString()
            });
        }

        noteInput.value = '';
        saveNotes();
    });

    // Проверка онлайн-статуса
    function updateOnlineStatus() {
        offlineStatus.classList.toggle('visible', !navigator.onLine);
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // Инициализация Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then(registration => console.log('SW registered:', registration))
            .catch(error => console.log('SW registration failed:', error));
    }

    // Первоначальный рендеринг
    renderNotes();
});