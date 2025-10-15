// Приложение Проводник
class Explorer {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.currentPath = '/';
        this.selectedItems = new Set();
        this.viewMode = 'icons'; // icons, list, details
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.navigateTo('/');
    }

    render() {
        this.container.innerHTML = `
            <div class="explorer-app">
                <div class="explorer-toolbar">
                    <div class="explorer-nav">
                        <button class="explorer-btn" id="explorer-back" title="Назад">←</button>
                        <button class="explorer-btn" id="explorer-forward" title="Вперед">→</button>
                        <button class="explorer-btn" id="explorer-up" title="Вверх">↑</button>
                        <button class="explorer-btn" id="explorer-refresh" title="Обновить">⟳</button>
                    </div>
                    
                    <div class="explorer-address">
                        <input type="text" class="explorer-path" id="explorer-path" readonly>
                    </div>
                    
                    <div class="explorer-actions">
                        <button class="explorer-btn" id="explorer-new-folder" title="Новая папка">📁</button>
                        <button class="explorer-btn" id="explorer-view" title="Изменить вид">👁️</button>
                        <button class="explorer-btn" id="explorer-sort" title="Сортировка">⇅</button>
                    </div>
                </div>
                
                <div class="explorer-content">
                    <div class="explorer-sidebar">
                        <div class="sidebar-section">
                            <h4>Быстрый доступ</h4>
                            <div class="sidebar-item active" data-path="/">
                                <span class="sidebar-icon">🏠</span>
                                <span class="sidebar-text">Рабочий стол</span>
                            </div>
                            <div class="sidebar-item" data-path="/documents">
                                <span class="sidebar-icon">📄</span>
                                <span class="sidebar-text">Документы</span>
                            </div>
                            <div class="sidebar-item" data-path="/images">
                                <span class="sidebar-icon">🖼️</span>
                                <span class="sidebar-text">Изображения</span>
                            </div>
                            <div class="sidebar-item" data-path="/music">
                                <span class="sidebar-icon">🎵</span>
                                <span class="sidebar-text">Музыка</span>
                            </div>
                            <div class="sidebar-item" data-path="/downloads">
                                <span class="sidebar-icon">📥</span>
                                <span class="sidebar-text">Загрузки</span>
                            </div>
                        </div>
                        
                        <div class="sidebar-section">
                            <h4>Этот компьютер</h4>
                            <div class="sidebar-item" data-path="/system">
                                <span class="sidebar-icon">💻</span>
                                <span class="sidebar-text">Локальный диск (C:)</span>
                            </div>
                            <div class="sidebar-item" data-path="/data">
                                <span class="sidebar-icon">💾</span>
                                <span class="sidebar-text">Локальный диск (D:)</span>
                            </div>
                            <div class="sidebar-item" data-path="/network">
                                <span class="sidebar-icon">🌐</span>
                                <span class="sidebar-text">Сетевое окружение</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="explorer-main">
                        <div class="explorer-breadcrumb" id="explorer-breadcrumb"></div>
                        
                        <div class="explorer-files" id="explorer-files">
                            <!-- Files will be loaded here -->
                        </div>
                    </div>
                </div>
                
                <div class="explorer-statusbar">
                    <span id="status-selected">Выбрано: 0</span>
                    <span id="status-total">Всего: 0</span>
                    <span id="status-size">Размер: 0 Б</span>
                </div>
            </div>
        `;

        this.filesContainer = this.container.querySelector('#explorer-files');
        this.breadcrumbContainer = this.container.querySelector('#explorer-breadcrumb');
        this.pathInput = this.container.querySelector('#explorer-path');
        this.statusSelected = this.container.querySelector('#status-selected');
        this.statusTotal = this.container.querySelector('#status-total');
        this.statusSize = this.container.querySelector('#status-size');
    }

    setupEventListeners() {
        // Навигационные кнопки
        this.container.querySelector('#explorer-back').addEventListener('click', () => this.goBack());
        this.container.querySelector('#explorer-forward').addEventListener('click', () => this.goForward());
        this.container.querySelector('#explorer-up').addEventListener('click', () => this.goUp());
        this.container.querySelector('#explorer-refresh').addEventListener('click', () => this.refresh());
        
        // Действия
        this.container.querySelector('#explorer-new-folder').addEventListener('click', () => this.createNewFolder());
        this.container.querySelector('#explorer-view').addEventListener('click', () => this.toggleView());
        this.container.querySelector('#explorer-sort').addEventListener('click', () => this.toggleSort());
        
        // Боковая панель
        this.container.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                const path = item.getAttribute('data-path');
                this.navigateTo(path);
            });
        });

        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                this.selectAll();
            } else if (e.key === 'Delete') {
                e.preventDefault();
                this.deleteSelected();
            } else if (e.key === 'F5') {
                e.preventDefault();
                this.refresh();
            }
        });
    }

    navigateTo(path) {
        this.currentPath = path;
        this.pathInput.value = path;
        this.updateBreadcrumb();
        this.loadFiles();
        this.updateSidebar();
    }

    updateBreadcrumb() {
        const parts = this.currentPath.split('/').filter(part => part);
        let currentPath = '';
        
        this.breadcrumbContainer.innerHTML = '';
        
        // Добавляем корневой элемент
        const rootItem = document.createElement('span');
        rootItem.className = 'breadcrumb-item';
        rootItem.textContent = '🏠';
        rootItem.addEventListener('click', () => this.navigateTo('/'));
        this.breadcrumbContainer.appendChild(rootItem);
        
        // Добавляем остальные части пути
        parts.forEach((part, index) => {
            currentPath += '/' + part;
            
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = ' › ';
            this.breadcrumbContainer.appendChild(separator);
            
            const breadcrumbItem = document.createElement('span');
            breadcrumbItem.className = 'breadcrumb-item';
            breadcrumbItem.textContent = this.getFolderName(part);
            breadcrumbItem.addEventListener('click', () => this.navigateTo(currentPath));
            this.breadcrumbContainer.appendChild(breadcrumbItem);
        });
    }

    updateSidebar() {
        this.container.querySelectorAll('.sidebar-item').forEach(item => {
            const itemPath = item.getAttribute('data-path');
            item.classList.toggle('active', itemPath === this.currentPath);
        });
    }

    loadFiles() {
        const files = this.getFilesForPath(this.currentPath);
        this.renderFiles(files);
        this.updateStatusBar(files);
    }

    getFilesForPath(path) {
        // Демо-данные файловой системы
        const fileSystem = {
            '/': [
                { name: 'Документы', type: 'folder', path: '/documents', size: 0, modified: '2024-01-15' },
                { name: 'Изображения', type: 'folder', path: '/images', size: 0, modified: '2024-01-15' },
                { name: 'Музыка', type: 'folder', path: '/music', size: 0, modified: '2024-01-15' },
                { name: 'Загрузки', type: 'folder', path: '/downloads', size: 0, modified: '2024-01-15' },
                { name: 'readme.txt', type: 'file', path: '/readme.txt', size: 1024, modified: '2024-01-10' },
                { name: 'приветствие.doc', type: 'file', path: '/приветствие.doc', size: 2048, modified: '2024-01-12' }
            ],
            '/documents': [
                { name: 'Работа', type: 'folder', path: '/documents/работа', size: 0, modified: '2024-01-14' },
                { name: 'Учеба', type: 'folder', path: '/documents/учеба', size: 0, modified: '2024-01-13' },
                { name: 'проект.pdf', type: 'file', path: '/documents/проект.pdf', size: 5120, modified: '2024-01-14' },
                { name: 'отчет.docx', type: 'file', path: '/documents/отчет.docx', size: 3072, modified: '2024-01-13' }
            ],
            '/images': [
                { name: 'Фото отпуска', type: 'folder', path: '/images/отпуск', size: 0, modified: '2024-01-11' },
                { name: 'скриншот.png', type: 'file', path: '/images/скриншот.png', size: 15360, modified: '2024-01-10' },
                { name: 'обои.jpg', type: 'file', path: '/images/обои.jpg', size: 20480, modified: '2024-01-09' }
            ],
            '/music': [
                { name: 'Рок', type: 'folder', path: '/music/рок', size: 0, modified: '2024-01-08' },
                { name: 'Классика', type: 'folder', path: '/music/классика', size: 0, modified: '2024-01-07' },
                { name: 'песня.mp3', type: 'file', path: '/music/песня.mp3', size: 4096, modified: '2024-01-06' }
            ],
            '/downloads': [
                { name: 'программа.exe', type: 'file', path: '/downloads/программа.exe', size: 10240, modified: '2024-01-05' },
                { name: 'архив.zip', type: 'file', path: '/downloads/архив.zip', size: 5120, modified: '2024-01-04' }
            ]
        };

        return fileSystem[path] || [];
    }

    renderFiles(files) {
        // Сортировка файлов
        const sortedFiles = this.sortFiles(files);
        
        this.filesContainer.innerHTML = '';
        
        if (this.viewMode === 'icons') {
            this.renderIconsView(sortedFiles);
        } else if (this.viewMode === 'list') {
            this.renderListView(sortedFiles);
        } else {
            this.renderDetailsView(sortedFiles);
        }
    }

    renderIconsView(files) {
        const grid = document.createElement('div');
        grid.className = 'files-grid';
        
        files.forEach(file => {
            const fileElement = this.createFileElement(file);
            grid.appendChild(fileElement);
        });
        
        this.filesContainer.appendChild(grid);
    }

    renderListView(files) {
        const list = document.createElement('div');
        list.className = 'files-list';
        
        files.forEach(file => {
            const fileElement = this.createFileElement(file, 'list');
            list.appendChild(fileElement);
        });
        
        this.filesContainer.appendChild(list);
    }

    renderDetailsView(files) {
        const table = document.createElement('div');
        table.className = 'files-table';
        
        // Заголовок таблицы
        const header = document.createElement('div');
        header.className = 'table-header';
        header.innerHTML = `
            <div class="table-col name" data-sort="name">Имя</div>
            <div class="table-col type" data-sort="type">Тип</div>
            <div class="table-col size" data-sort="size">Размер</div>
            <div class="table-col modified" data-sort="modified">Изменен</div>
        `;
        
        // Добавляем обработчики сортировки для заголовков
        header.querySelectorAll('.table-col').forEach(col => {
            col.addEventListener('click', () => {
                const sortField = col.getAttribute('data-sort');
                this.setSort(sortField);
            });
        });
        
        table.appendChild(header);
        
        // Файлы
        files.forEach(file => {
            const fileElement = this.createFileElement(file, 'details');
            table.appendChild(fileElement);
        });
        
        this.filesContainer.appendChild(table);
    }

    createFileElement(file, view = 'icons') {
        const element = document.createElement('div');
        element.className = `file-item ${view}-view ${file.type}`;
        element.setAttribute('data-path', file.path);
        
        const icon = this.getFileIcon(file);
        const size = file.type === 'folder' ? '' : Utils.formatFileSize(file.size);
        const modified = new Date(file.modified).toLocaleDateString('ru-RU');
        
        if (view === 'icons') {
            element.innerHTML = `
                <div class="file-icon">${icon}</div>
                <div class="file-name">${file.name}</div>
            `;
        } else if (view === 'list') {
            element.innerHTML = `
                <div class="file-icon">${icon}</div>
                <div class="file-name">${file.name}</div>
                <div class="file-size">${size}</div>
                <div class="file-modified">${modified}</div>
            `;
        } else {
            element.innerHTML = `
                <div class="table-col name">
                    <span class="file-icon">${icon}</span>
                    <span class="file-name">${file.name}</span>
                </div>
                <div class="table-col type">${this.getFileType(file)}</div>
                <div class="table-col size">${size}</div>
                <div class="table-col modified">${modified}</div>
            `;
        }
        
        // Обработчики событий
        element.addEventListener('click', (e) => {
            if (!e.ctrlKey && !e.shiftKey) {
                this.selectedItems.clear();
            }
            this.toggleSelection(file.path);
        });
        
        element.addEventListener('dblclick', () => {
            if (file.type === 'folder') {
                this.navigateTo(file.path);
            } else {
                this.openFile(file);
            }
        });
        
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY, file);
        });
        
        return element;
    }

    getFileIcon(file) {
        const icons = {
            'folder': '📁',
            'file': '📄',
            'pdf': '📕',
            'doc': '📘',
            'jpg': '🖼️',
            'png': '🖼️',
            'mp3': '🎵',
            'exe': '⚙️',
            'zip': '📦'
        };
        
        if (file.type === 'folder') return icons.folder;
        
        const extension = file.name.split('.').pop().toLowerCase();
        return icons[extension] || icons.file;
    }

    getFileType(file) {
        if (file.type === 'folder') return 'Папка';
        
        const extensions = {
            'txt': 'Текстовый документ',
            'doc': 'Документ Word',
            'pdf': 'PDF документ',
            'jpg': 'Изображение JPEG',
            'png': 'Изображение PNG',
            'mp3': 'Аудио файл',
            'exe': 'Приложение',
            'zip': 'Архив'
        };
        
        const extension = file.name.split('.').pop().toLowerCase();
        return extensions[extension] || 'Файл';
    }

    getFolderName(path) {
        const names = {
            '/': 'Рабочий стол',
            '/documents': 'Документы',
            '/images': 'Изображения',
            '/music': 'Музыка',
            '/downloads': 'Загрузки',
            '/system': 'Локальный диск (C:)',
            '/data': 'Локальный диск (D:)',
            '/network': 'Сетевое окружение'
        };
        
        return names[path] || path.split('/').pop() || 'Рабочий стол';
    }

    toggleSelection(filePath) {
        if (this.selectedItems.has(filePath)) {
            this.selectedItems.delete(filePath);
        } else {
            this.selectedItems.add(filePath);
        }
        
        this.updateSelectionUI();
    }

    selectAll() {
        const allFiles = this.filesContainer.querySelectorAll('.file-item');
        allFiles.forEach(fileElement => {
            const filePath = fileElement.getAttribute('data-path');
            this.selectedItems.add(filePath);
        });
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        // Снимаем выделение со всех элементов
        this.filesContainer.querySelectorAll('.file-item').forEach(element => {
            element.classList.remove('selected');
        });
        
        // Выделяем выбранные элементы
        this.selectedItems.forEach(filePath => {
            const element = this.filesContainer.querySelector(`[data-path="${filePath}"]`);
            if (element) element.classList.add('selected');
        });
        
        this.updateStatusBar();
    }

    updateStatusBar(files = null) {
        if (!files) {
            files = this.getFilesForPath(this.currentPath);
        }
        
        const selectedCount = this.selectedItems.size;
        const totalCount = files.length;
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        
        this.statusSelected.textContent = `Выбрано: ${selectedCount}`;
        this.statusTotal.textContent = `Всего: ${totalCount}`;
        this.statusSize.textContent = `Размер: ${Utils.formatFileSize(totalSize)}`;
    }

    sortFiles(files) {
        return files.sort((a, b) => {
            let aValue = a[this.sortBy];
            let bValue = b[this.sortBy];
            
            // Для имени приводим к нижнему регистру
            if (this.sortBy === 'name') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    setSort(field) {
        if (this.sortBy === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = field;
            this.sortOrder = 'asc';
        }
        this.loadFiles();
    }

    // Навигация
    goBack() {
        // В упрощенной версии - переходим на уровень выше
        this.goUp();
    }

    goForward() {
        // В упрощенной версии не реализовано
        Utils.showNotification('Проводник', 'Функция "Вперед" не доступна', 'info');
    }

    goUp() {
        if (this.currentPath !== '/') {
            const parentPath = this.currentPath.split('/').slice(0, -1).join('/') || '/';
            this.navigateTo(parentPath);
        }
    }

    refresh() {
        this.loadFiles();
        Utils.showNotification('Проводник', 'Содержимое обновлено', 'success');
    }

    // Действия с файлами
    createNewFolder() {
        const folderName = prompt('Введите название новой папки:', 'Новая папка');
        if (folderName) {
            Utils.showNotification('Проводник', `Папка "${folderName}" создана`, 'success');
            // В реальном приложении здесь бы создавалась папка
            this.refresh();
        }
    }

    deleteSelected() {
        if (this.selectedItems.size === 0) return;
        
        const count = this.selectedItems.size;
        if (confirm(`Удалить выбранные элементы (${count})?`)) {
            Utils.showNotification('Проводник', `Удалено элементов: ${count}`, 'success');
            this.selectedItems.clear();
            this.refresh();
        }
    }

    openFile(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        
        if (extension === 'txt') {
            WindowManager.openWindow('notepad', { file: file });
        } else if (['jpg', 'png'].includes(extension)) {
            Utils.showNotification('Проводник', `Открытие изображения: ${file.name}`, 'info');
        } else if (extension === 'pdf') {
            Utils.showNotification('Проводник', `Открытие PDF: ${file.name}`, 'info');
        } else {
            Utils.showNotification('Проводник', `Неизвестный тип файла: ${file.name}`, 'warning');
        }
    }

    toggleView() {
        const views = ['icons', 'list', 'details'];
        const currentIndex = views.indexOf(this.viewMode);
        this.viewMode = views[(currentIndex + 1) % views.length];
        this.loadFiles();
        
        const viewNames = {
            'icons': 'Значки',
            'list': 'Список',
            'details': 'Таблица'
        };
        
        Utils.showNotification('Проводник', `Режим просмотра: ${viewNames[this.viewMode]}`, 'info');
    }

    toggleSort() {
        const fields = ['name', 'type', 'size', 'modified'];
        const currentIndex = fields.indexOf(this.sortBy);
        this.sortBy = fields[(currentIndex + 1) % fields.length];
        this.loadFiles();
        
        const fieldNames = {
            'name': 'Имя',
            'type': 'Тип',
            'size': 'Размер',
            'modified': 'Дата изменения'
        };
        
        Utils.showNotification('Проводник', `Сортировка по: ${fieldNames[this.sortBy]}`, 'info');
    }

    showContextMenu(x, y, file) {
        const menuItems = [
            { text: 'Открыть', action: () => this.openFile(file) },
            { text: 'Открыть в новом окне', action: () => WindowManager.openWindow('explorer', { path: file.path }) },
            { separator: true },
            { text: 'Копировать', action: () => this.copyFile(file) },
            { text: 'Вырезать', action: () => this.cutFile(file) },
            { text: 'Вставить', action: () => this.pasteFile() },
            { separator: true },
            { text: 'Удалить', action: () => this.deleteFile(file) },
            { text: 'Переименовать', action: () => this.renameFile(file) },
            { separator: true },
            { text: 'Свойства', action: () => this.showProperties(file) }
        ];

        this.createContextMenu(x, y, menuItems);
    }

    createContextMenu(x, y, items) {
        const menu = document.createElement('div');
        menu.className = 'explorer-context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            box-shadow: var(--shadow);
            z-index: 1000;
            min-width: 200px;
        `;

        items.forEach(item => {
            if (item.separator) {
                const separator = document.createElement('div');
                separator.style.cssText = 'height: 1px; background: var(--border-color); margin: 4px 0;';
                menu.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'context-menu-item';
                menuItem.textContent = item.text;
                menuItem.style.cssText = `
                    padding: 8px 12px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    font-size: 13px;
                `;
                menuItem.addEventListener('mouseenter', () => {
                    menuItem.style.background = 'var(--bg-secondary)';
                });
                menuItem.addEventListener('mouseleave', () => {
                    menuItem.style.background = 'transparent';
                });
                menuItem.addEventListener('click', () => {
                    item.action();
                    menu.remove();
                });
                menu.appendChild(menuItem);
            }
        });

        document.body.appendChild(menu);

        // Закрытие при клике вне меню
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 100);
    }

    copyFile(file) {
        Utils.showNotification('Проводник', `Скопировано: ${file.name}`, 'success');
    }

    cutFile(file) {
        Utils.showNotification('Проводник', `Вырезано: ${file.name}`, 'success');
    }

    pasteFile() {
        Utils.showNotification('Проводник', 'Вставка файлов', 'info');
    }

    deleteFile(file) {
        if (confirm(`Удалить "${file.name}"?`)) {
            Utils.showNotification('Проводник', `Удалено: ${file.name}`, 'success');
            this.refresh();
        }
    }

    renameFile(file) {
        const newName = prompt('Введите новое имя:', file.name);
        if (newName && newName !== file.name) {
            Utils.showNotification('Проводник', `Переименовано в: ${newName}`, 'success');
            this.refresh();
        }
    }

    showProperties(file) {
        const props = `
            <strong>${file.name}</strong><br>
            Тип: ${this.getFileType(file)}<br>
            Размер: ${Utils.formatFileSize(file.size)}<br>
            Изменен: ${new Date(file.modified).toLocaleString('ru-RU')}<br>
            Путь: ${file.path}
        `;
        
        Utils.showNotification('Свойства', props, 'info', 5000);
    }
}

// Добавляем CSS для проводника
const explorerStyles = `
    .explorer-app {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--bg-primary);
    }

    .explorer-toolbar {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-bottom: 1px solid var(--border-color);
        background: var(--bg-secondary);
        gap: 10px;
    }

    .explorer-nav {
        display: flex;
        gap: 4px;
    }

    .explorer-btn {
        padding: 6px 10px;
        border: 1px solid var(--border-color);
        background: var(--bg-primary);
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
        color: var(--text-primary);
    }

    .explorer-btn:hover {
        background: var(--bg-tertiary);
        border-color: var(--primary-color);
    }

    .explorer-address {
        flex: 1;
    }

    .explorer-path {
        width: 100%;
        padding: 6px 10px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 13px;
        background: var(--bg-primary);
        color: var(--text-primary);
    }

    .explorer-actions {
        display: flex;
        gap: 4px;
    }

    .explorer-content {
        flex: 1;
        display: flex;
        overflow: hidden;
    }

    .explorer-sidebar {
        width: 250px;
        background: var(--bg-secondary);
        border-right: 1px solid var(--border-color);
        padding: 16px 0;
        overflow-y: auto;
    }

    .sidebar-section {
        margin-bottom: 20px;
    }

    .sidebar-section h4 {
        padding: 0 16px 8px;
        margin: 0;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
    }

    .sidebar-item {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        cursor: pointer;
        transition: background-color 0.2s;
        gap: 8px;
    }

    .sidebar-item:hover {
        background: var(--bg-tertiary);
    }

    .sidebar-item.active {
        background: var(--primary-color);
        color: white;
    }

    .sidebar-icon {
        font-size: 16px;
        width: 20px;
        text-align: center;
    }

    .sidebar-text {
        font-size: 13px;
    }

    .explorer-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .explorer-breadcrumb {
        padding: 8px 16px;
        border-bottom: 1px solid var(--border-color);
        background: var(--bg-secondary);
        font-size: 13px;
    }

    .breadcrumb-item {
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 3px;
        transition: background-color 0.2s;
    }

    .breadcrumb-item:hover {
        background: var(--bg-tertiary);
    }

    .breadcrumb-separator {
        margin: 0 4px;
        color: var(--text-secondary);
    }

    .explorer-files {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
    }

    .files-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 16px;
    }

    .files-list, .files-table {
        display: flex;
        flex-direction: column;
    }

    .file-item {
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid transparent;
    }

    .file-item.selected {
        background: rgba(0, 120, 212, 0.1);
        border-color: var(--primary-color);
    }

    .file-item.icons-view {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px 8px;
        border-radius: 6px;
        text-align: center;
    }

    .file-item.list-view {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-radius: 4px;
        gap: 12px;
    }

    .file-item.details-view {
        display: grid;
        grid-template-columns: 3fr 1fr 1fr 1fr;
        padding: 8px 12px;
        border-radius: 4px;
        align-items: center;
    }

    .file-item:hover {
        background: var(--bg-secondary);
    }

    .file-icon {
        font-size: 32px;
        margin-bottom: 8px;
    }

    .list-view .file-icon {
        font-size: 20px;
        margin-bottom: 0;
    }

    .details-view .file-icon {
        font-size: 16px;
        margin-bottom: 0;
        margin-right: 8px;
    }

    .file-name {
        font-size: 12px;
        font-weight: 500;
        word-break: break-word;
    }

    .list-view .file-name {
        flex: 1;
    }

    .file-size, .file-modified {
        font-size: 11px;
        color: var(--text-secondary);
        min-width: 80px;
    }

    .table-header {
        display: grid;
        grid-template-columns: 3fr 1fr 1fr 1fr;
        padding: 8px 12px;
        background: var(--bg-secondary);
        border-radius: 4px;
        margin-bottom: 4px;
        font-weight: 600;
        font-size: 12px;
    }

    .table-col {
        padding: 4px 8px;
        cursor: pointer;
        transition: background-color 0.2s;
        border-radius: 3px;
    }

    .table-col:hover {
        background: var(--bg-tertiary);
    }

    .details-view .table-col {
        display: flex;
        align-items: center;
    }

    .explorer-statusbar {
        display: flex;
        justify-content: space-between;
        padding: 6px 16px;
        border-top: 1px solid var(--border-color);
        background: var(--bg-secondary);
        font-size: 11px;
        color: var(--text-secondary);
    }
`;

const explorerStyle = document.createElement('style');
explorerStyle.textContent = explorerStyles;
document.head.appendChild(explorerStyle);

window.Explorer = Explorer;
