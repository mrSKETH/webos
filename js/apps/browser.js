// Приложение Браузер (расширенная версия)
class Browser {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.tabs = [];
        this.activeTabId = null;
        this.history = [];
        this.bookmarks = [];
        this.downloads = [];
        this.settings = {
            saveHistory: true,
            blockPopups: true,
            enableJavascript: true,
            homePage: 'https://example.com',
            searchEngine: 'google'
        };
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.loadData();
        this.createNewTab('https://example.com', true);
    }

    render() {
        this.container.innerHTML = `
            <div class="browser-app">
                <div class="browser-toolbar">
                    <div class="browser-nav">
                        <button class="browser-nav-btn" id="browser-back" title="Назад">←</button>
                        <button class="browser-nav-btn" id="browser-forward" title="Вперед">→</button>
                        <button class="browser-nav-btn" id="browser-refresh" title="Обновить">⟳</button>
                        <button class="browser-nav-btn" id="browser-home" title="Домашняя страница">🏠</button>
                    </div>
                    
                    <div class="browser-url-bar">
                        <input type="text" class="browser-url" id="browser-url" 
                               placeholder="Введите URL или поисковый запрос">
                        <button class="browser-go" id="browser-go">Перейти</button>
                    </div>
                    
                    <div class="browser-actions">
                        <button class="browser-action-btn" id="browser-bookmark" title="Добавить в закладки">⭐</button>
                        <button class="browser-action-btn" id="browser-history" title="История">📚</button>
                        <button class="browser-action-btn" id="browser-downloads" title="Загрузки">📥</button>
                        <button class="browser-action-btn" id="browser-menu" title="Меню">⋮</button>
                    </div>
                </div>
                
                <div class="browser-content-area">
                    <div class="browser-tabs" id="browser-tabs">
                        <!-- Tabs will be generated dynamically -->
                    </div>
                    
                    <div class="browser-content-container" id="browser-content-container">
                        <!-- Tab contents will be generated dynamically -->
                    </div>
                </div>
                
                <div class="browser-sidebar" id="browser-sidebar" style="display: none;">
                    <div class="sidebar-header">
                        <h4 id="sidebar-title">Закладки</h4>
                        <button class="sidebar-close" id="sidebar-close">✕</button>
                    </div>
                    <div class="sidebar-content" id="sidebar-content"></div>
                </div>

                <div class="browser-popup-blocked" id="popup-blocked" style="display: none;">
                    <div class="popup-message">
                        <span>Всплывающее окно заблокировано</span>
                        <button id="popup-allow">Разрешить</button>
                        <button id="popup-close">✕</button>
                    </div>
                </div>
            </div>
        `;

        this.urlInput = this.container.querySelector('#browser-url');
        this.tabsContainer = this.container.querySelector('#browser-tabs');
        this.contentContainer = this.container.querySelector('#browser-content-container');
        this.sidebar = this.container.querySelector('#browser-sidebar');
        this.sidebarContent = this.container.querySelector('#sidebar-content');
    }

    setupEventListeners() {
        // Навигационные кнопки
        this.container.querySelector('#browser-back').addEventListener('click', () => this.goBack());
        this.container.querySelector('#browser-forward').addEventListener('click', () => this.goForward());
        this.container.querySelector('#browser-refresh').addEventListener('click', () => this.refresh());
        this.container.querySelector('#browser-home').addEventListener('click', () => this.goHome());
        
        // URL бар
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.navigate();
        });
        this.container.querySelector('#browser-go').addEventListener('click', () => this.navigate());
        
        // Действия
        this.container.querySelector('#browser-bookmark').addEventListener('click', () => this.toggleBookmark());
        this.container.querySelector('#browser-history').addEventListener('click', () => this.showHistory());
        this.container.querySelector('#browser-downloads').addEventListener('click', () => this.showDownloads());
        this.container.querySelector('#browser-menu').addEventListener('click', () => this.showMenu());
        
        // Боковая панель
        this.container.querySelector('#sidebar-close').addEventListener('click', () => this.hideSidebar());

        // Глобальные горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                this.createNewTab();
            } else if (e.ctrlKey && e.key === 'w') {
                e.preventDefault();
                this.closeActiveTab();
            } else if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const tabIndex = parseInt(e.key) - 1;
                this.switchToTab(tabIndex);
            }
        });
    }

    createNewTab(url = null, setActive = true) {
        const tabId = 'tab-' + Date.now();
        const tab = {
            id: tabId,
            url: url || this.settings.homePage,
            title: 'Новая вкладка',
            isLoading: false,
            canGoBack: false,
            canGoForward: false,
            history: [],
            historyIndex: -1
        };

        this.tabs.push(tab);
        
        if (setActive) {
            this.switchToTab(this.tabs.length - 1);
        }

        this.renderTabs();
        this.renderTabContent(tab);
        
        if (url) {
            this.navigateInTab(tabId, url);
        }

        return tabId;
    }

    closeTab(tabId) {
        if (this.tabs.length <= 1) {
            Utils.showNotification('Браузер', 'Нельзя закрыть последнюю вкладку', 'warning');
            return;
        }

        const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
        if (tabIndex === -1) return;

        // Удаляем контент вкладки
        const tabContent = this.contentContainer.querySelector(`[data-tab="${tabId}"]`);
        if (tabContent) tabContent.remove();

        // Удаляем вкладку
        this.tabs.splice(tabIndex, 1);

        // Переключаемся на другую вкладку
        if (this.activeTabId === tabId) {
            const newActiveIndex = Math.min(tabIndex, this.tabs.length - 1);
            this.switchToTab(newActiveIndex);
        }

        this.renderTabs();
    }

    switchToTab(tabIndex) {
        if (tabIndex < 0 || tabIndex >= this.tabs.length) return;

        const tab = this.tabs[tabIndex];
        this.activeTabId = tab.id;

        // Обновляем UI
        this.renderTabs();
        this.updateUrlBar();
        this.updateNavigationButtons();

        // Показываем контент вкладки
        document.querySelectorAll('.browser-tab-content').forEach(content => {
            content.style.display = 'none';
        });
        const activeContent = this.contentContainer.querySelector(`[data-tab="${tab.id}"]`);
        if (activeContent) activeContent.style.display = 'block';
    }

    renderTabs() {
        this.tabsContainer.innerHTML = '';

        this.tabs.forEach((tab, index) => {
            const tabElement = document.createElement('div');
            tabElement.className = `browser-tab ${tab.id === this.activeTabId ? 'active' : ''}`;
            tabElement.setAttribute('data-tab', tab.id);
            tabElement.innerHTML = `
                <span class="tab-icon">${tab.isLoading ? '⟳' : '🌐'}</span>
                <span class="tab-title">${tab.title}</span>
                <button class="tab-close" data-tab="${tab.id}">✕</button>
            `;

            tabElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('tab-close')) {
                    this.switchToTab(index);
                }
            });

            const closeBtn = tabElement.querySelector('.tab-close');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeTab(tab.id);
            });

            this.tabsContainer.appendChild(tabElement);
        });

        // Кнопка новой вкладки
        const newTabBtn = document.createElement('button');
        newTabBtn.className = 'browser-new-tab';
        newTabBtn.innerHTML = '+';
        newTabBtn.title = 'Новая вкладка';
        newTabBtn.addEventListener('click', () => this.createNewTab());
        this.tabsContainer.appendChild(newTabBtn);
    }

    renderTabContent(tab) {
        let tabContent = this.contentContainer.querySelector(`[data-tab="${tab.id}"]`);
        
        if (!tabContent) {
            tabContent = document.createElement('div');
            tabContent.className = 'browser-tab-content';
            tabContent.setAttribute('data-tab', tab.id);
            tabContent.style.display = tab.id === this.activeTabId ? 'block' : 'none';
            
            tabContent.innerHTML = `
                <iframe class="browser-content" data-tab="${tab.id}"></iframe>
                <div class="browser-loading" data-tab="${tab.id}" style="display: none;">
                    <div class="loading-spinner"></div>
                    <span>Загрузка...</span>
                </div>
            `;

            this.contentContainer.appendChild(tabContent);

            // Настройка событий iframe
            const iframe = tabContent.querySelector('.browser-content');
            const loadingIndicator = tabContent.querySelector('.browser-loading');

            iframe.addEventListener('load', () => {
                tab.isLoading = false;
                loadingIndicator.style.display = 'none';
                this.updateTabTitle(tab.id, iframe.contentDocument?.title || this.getDomainFromUrl(tab.url));
                this.renderTabs();
                this.updateNavigationButtons();
            });

            iframe.addEventListener('error', () => {
                tab.isLoading = false;
                loadingIndicator.style.display = 'none';
                this.showErrorPage(tab.id);
                this.renderTabs();
            });
        }

        return tabContent;
    }

    navigate() {
        const url = this.urlInput.value.trim();
        if (!url) return;

        if (this.activeTabId) {
            this.navigateInTab(this.activeTabId, url);
        }
    }

    navigateInTab(tabId, url) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        let finalUrl = url;

        // Обработка поисковых запросов
        if (!this.isValidUrl(url)) {
            finalUrl = this.getSearchUrl(url);
        } else if (!url.startsWith('http')) {
            finalUrl = 'https://' + url;
        }

        tab.url = finalUrl;
        tab.isLoading = true;

        // Добавляем в историю
        if (this.settings.saveHistory) {
            this.addToHistory(finalUrl);
        }

        // Обновляем UI
        this.updateUrlBar();
        this.renderTabs();

        // Показываем индикатор загрузки
        const loadingIndicator = this.contentContainer.querySelector(`.browser-loading[data-tab="${tabId}"]`);
        if (loadingIndicator) loadingIndicator.style.display = 'flex';

        // Эмуляция загрузки (в реальном приложении здесь бы загружался реальный URL)
        setTimeout(() => {
            const iframe = this.contentContainer.querySelector(`.browser-content[data-tab="${tabId}"]`);
            if (iframe) {
                try {
                    // Для демо-версии показываем специальную страницу
                    if (finalUrl.includes('example.com') || finalUrl.includes('google.com/search')) {
                        iframe.src = finalUrl;
                    } else {
                        this.showDemoPage(tabId, finalUrl);
                    }
                } catch (error) {
                    this.showErrorPage(tabId);
                }
            }
        }, 1000);
    }

    showDemoPage(tabId, url) {
        const iframe = this.contentContainer.querySelector(`.browser-content[data-tab="${tabId}"]`);
        const domain = this.getDomainFromUrl(url);
        
        iframe.srcdoc = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${domain} - WebOS Browser Demo</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', sans-serif; 
                        margin: 0; 
                        padding: 40px; 
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                    }
                    .demo-container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        text-align: center; 
                    }
                    .demo-icon { 
                        font-size: 64px; 
                        margin-bottom: 20px; 
                    }
                    .demo-url {
                        background: rgba(255,255,255,0.1);
                        padding: 10px;
                        border-radius: 6px;
                        margin: 20px 0;
                        word-break: break-all;
                    }
                </style>
            </head>
            <body>
                <div class="demo-container">
                    <div class="demo-icon">🌐</div>
                    <h1>WebOS Browser Demo</h1>
                    <div class="demo-url">${url}</div>
                    <p>Это демо-страница браузера WebOS. В реальном приложении здесь бы отображался контент сайта.</p>
                    <p>Домен: <strong>${domain}</strong></p>
                    <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                        <h3>Доступные функции:</h3>
                        <ul style="text-align: left; display: inline-block;">
                            <li>Навигация по вкладкам</li>
                            <li>История просмотров</li>
                            <li>Закладки</li>
                            <li>Поиск в интернете</li>
                            <li>Настройки браузера</li>
                        </ul>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    showErrorPage(tabId) {
        const iframe = this.contentContainer.querySelector(`.browser-content[data-tab="${tabId}"]`);
        iframe.srcdoc = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ошибка загрузки</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', sans-serif; 
                        background: #f5f5f5; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        height: 100vh; 
                        margin: 0; 
                    }
                    .error-container { 
                        text-align: center; 
                        padding: 40px; 
                        background: white; 
                        border-radius: 8px; 
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                    }
                    .error-icon { 
                        font-size: 48px; 
                        margin-bottom: 20px; 
                    }
                    button {
                        padding: 10px 20px;
                        background: #0078d4;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        margin: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <div class="error-icon">❌</div>
                    <h2>Не удалось загрузить страницу</h2>
                    <p>Возможные причины:</p>
                    <ul style="text-align: left; display: inline-block;">
                        <li>Нет подключения к интернету</li>
                        <li>Неправильный URL-адрес</li>
                        <li>Сайт временно недоступен</li>
                    </ul>
                    <div style="margin-top: 20px;">
                        <button onclick="window.location.reload()">Повторить</button>
                        <button onclick="window.location.href = 'https://example.com'">Перейти на example.com</button>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    goBack() {
        const tab = this.getActiveTab();
        if (tab && tab.historyIndex > 0) {
            tab.historyIndex--;
            const previousUrl = tab.history[tab.historyIndex];
            this.navigateInTab(tab.id, previousUrl);
        }
    }

    goForward() {
        const tab = this.getActiveTab();
        if (tab && tab.historyIndex < tab.history.length - 1) {
            tab.historyIndex++;
            const nextUrl = tab.history[tab.historyIndex];
            this.navigateInTab(tab.id, nextUrl);
        }
    }

    goHome() {
        this.navigateInTab(this.activeTabId, this.settings.homePage);
    }

    refresh() {
        const tab = this.getActiveTab();
        if (tab) {
            this.navigateInTab(tab.id, tab.url);
        }
    }

    updateUrlBar() {
        const tab = this.getActiveTab();
        if (tab) {
            this.urlInput.value = tab.url;
        }
    }

    updateNavigationButtons() {
        const tab = this.getActiveTab();
        const backBtn = this.container.querySelector('#browser-back');
        const forwardBtn = this.container.querySelector('#browser-forward');

        if (tab) {
            backBtn.disabled = !(tab.historyIndex > 0);
            forwardBtn.disabled = !(tab.historyIndex < tab.history.length - 1);
        } else {
            backBtn.disabled = true;
            forwardBtn.disabled = true;
        }
    }

    updateTabTitle(tabId, title) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (tab) {
            tab.title = title || this.getDomainFromUrl(tab.url);
            this.renderTabs();
        }
    }

    // Закладки
    toggleBookmark() {
        const tab = this.getActiveTab();
        if (!tab) return;

        const isBookmarked = this.bookmarks.some(bookmark => bookmark.url === tab.url);
        
        if (isBookmarked) {
            this.removeBookmark(tab.url);
            Utils.showNotification('Браузер', 'Закладка удалена', 'success');
        } else {
            const title = prompt('Введите название закладки:', tab.title);
            if (title) {
                this.addBookmark(tab.url, title);
                Utils.showNotification('Браузер', 'Страница добавлена в закладки', 'success');
            }
        }
    }

    addBookmark(url, title) {
        this.bookmarks.unshift({
            url: url,
            title: title,
            date: new Date().toISOString()
        });
        this.saveBookmarks();
    }

    removeBookmark(url) {
        this.bookmarks = this.bookmarks.filter(bookmark => bookmark.url !== url);
        this.saveBookmarks();
    }

    // История
    addToHistory(url) {
        const tab = this.getActiveTab();
        if (tab) {
            // Удаляем все записи после текущего индекса
            tab.history = tab.history.slice(0, tab.historyIndex + 1);
            tab.history.push(url);
            tab.historyIndex = tab.history.length - 1;
        }

        // Глобальная история
        this.history.unshift({
            url: url,
            title: this.getDomainFromUrl(url),
            timestamp: new Date().toISOString()
        });

        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }

        this.saveHistory();
    }

    showHistory() {
        this.sidebar.style.display = 'block';
        this.sidebarContent.innerHTML = '<h5>История просмотров</h5>';
        
        if (this.history.length === 0) {
            this.sidebarContent.innerHTML += '<p>История пуста</p>';
            return;
        }
        
        // Группируем по датам
        const groupedHistory = this.groupHistoryByDate();
        
        Object.keys(groupedHistory).forEach(date => {
            const dateHeader = document.createElement('div');
            dateHeader.className = 'history-date';
            dateHeader.textContent = date;
            this.sidebarContent.appendChild(dateHeader);
            
            groupedHistory[date].forEach(entry => {
                const historyItem = this.createHistoryItem(entry);
                this.sidebarContent.appendChild(historyItem);
            });
        });
        
        const clearHistoryBtn = document.createElement('button');
        clearHistoryBtn.className = 'sidebar-action-btn';
        clearHistoryBtn.textContent = 'Очистить историю';
        clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.sidebarContent.appendChild(clearHistoryBtn);
    }

    groupHistoryByDate() {
        const groups = {};
        this.history.forEach(entry => {
            const date = new Date(entry.timestamp).toLocaleDateString('ru-RU');
            if (!groups[date]) groups[date] = [];
            groups[date].push(entry);
        });
        return groups;
    }

    createHistoryItem(entry) {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.innerHTML = `
            <span class="item-icon">🌐</span>
            <div class="item-content">
                <div class="item-title">${entry.title}</div>
                <div class="item-url">${entry.url}</div>
                <div class="item-time">${new Date(entry.timestamp).toLocaleTimeString('ru-RU')}</div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            this.navigateInTab(this.activeTabId, entry.url);
            this.hideSidebar();
        });
        
        return item;
    }

    clearHistory() {
        this.history = [];
        this.tabs.forEach(tab => {
            tab.history = [tab.url];
            tab.historyIndex = 0;
        });
        this.saveHistory();
        this.showHistory();
        Utils.showNotification('Браузер', 'История очищена', 'success');
    }

    showDownloads() {
        this.sidebar.style.display = 'block';
        this.sidebarContent.innerHTML = '<h5>Загрузки</h5>';
        
        if (this.downloads.length === 0) {
            this.sidebarContent.innerHTML += '<p>Загрузок пока нет</p>';
        } else {
            this.downloads.forEach(download => {
                const downloadItem = document.createElement('div');
                downloadItem.className = 'sidebar-item download-item';
                downloadItem.innerHTML = `
                    <span class="item-icon">📥</span>
                    <div class="item-content">
                        <div class="item-title">${download.filename}</div>
                        <div class="item-url">${download.status}</div>
                        <div class="download-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${download.progress}%"></div>
                            </div>
                            <span>${download.progress}%</span>
                        </div>
                    </div>
                `;
                this.sidebarContent.appendChild(downloadItem);
            });
        }
        
        const clearDownloadsBtn = document.createElement('button');
        clearDownloadsBtn.className = 'sidebar-action-btn';
        clearDownloadsBtn.textContent = 'Очистить список';
        clearDownloadsBtn.addEventListener('click', () => this.clearDownloads());
        this.sidebarContent.appendChild(clearDownloadsBtn);
    }

    showBookmarks() {
        this.sidebar.style.display = 'block';
        this.sidebarContent.innerHTML = '<h5>Закладки</h5>';
        
        if (this.bookmarks.length === 0) {
            this.sidebarContent.innerHTML += '<p>Закладок пока нет</p>';
            return;
        }
        
        this.bookmarks.forEach(bookmark => {
            const bookmarkItem = this.createBookmarkItem(bookmark);
            this.sidebarContent.appendChild(bookmarkItem);
        });
        
        const addFolderBtn = document.createElement('button');
        addFolderBtn.className = 'sidebar-action-btn';
        addFolderBtn.textContent = 'Новая папка';
        addFolderBtn.addEventListener('click', () => this.createBookmarkFolder());
        this.sidebarContent.appendChild(addFolderBtn);
    }

    createBookmarkItem(bookmark) {
        const item = document.createElement('div');
        item.className = 'sidebar-item bookmark-item';
        item.innerHTML = `
            <span class="item-icon">⭐</span>
            <div class="item-content">
                <div class="item-title">${bookmark.title}</div>
                <div class="item-url">${bookmark.url}</div>
            </div>
            <button class="item-delete" data-url="${bookmark.url}">✕</button>
        `;
        
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('item-delete')) {
                this.navigateInTab(this.activeTabId, bookmark.url);
                this.hideSidebar();
            }
        });
        
        const deleteBtn = item.querySelector('.item-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeBookmark(bookmark.url);
            this.showBookmarks();
        });
        
        return item;
    }

    createBookmarkFolder() {
        const folderName = prompt('Введите название папки:');
        if (folderName) {
            Utils.showNotification('Браузер', `Папка "${folderName}" создана`, 'success');
        }
    }

    clearDownloads() {
        this.downloads = this.downloads.filter(d => d.status !== 'completed');
        this.showDownloads();
    }

    showMenu() {
        const menuItems = [
            { text: 'Новая вкладка', shortcut: 'Ctrl+T', action: () => this.createNewTab() },
            { text: 'Новое окно', shortcut: 'Ctrl+N', action: () => WindowManager.openWindow('browser') },
            { separator: true },
            { text: 'Закладки', action: () => { this.hideSidebar(); setTimeout(() => this.showBookmarks(), 100); } },
            { text: 'История', action: () => { this.hideSidebar(); setTimeout(() => this.showHistory(), 100); } },
            { text: 'Загрузки', action: () => { this.hideSidebar(); setTimeout(() => this.showDownloads(), 100); } },
            { separator: true },
            { text: 'Настройки', action: () => this.showSettings() },
            { text: 'Расширения', action: () => this.showExtensions() },
            { separator: true },
            { text: 'О браузере', action: () => this.showAbout() }
        ];

        this.showContextMenu(menuItems);
    }

    showSettings() {
        this.sidebar.style.display = 'block';
        this.sidebarContent.innerHTML = `
            <h5>Настройки браузера</h5>
            <div class="settings-group">
                <h6>Основные</h6>
                <label>
                    <input type="checkbox" id="save-history" ${this.settings.saveHistory ? 'checked' : ''}>
                    Сохранять историю
                </label>
                <label>
                    <input type="checkbox" id="block-popups" ${this.settings.blockPopups ? 'checked' : ''}>
                    Блокировать всплывающие окна
                </label>
                <label>
                    <input type="checkbox" id="enable-javascript" ${this.settings.enableJavascript ? 'checked' : ''}>
                    Включить JavaScript
                </label>
            </div>
            <div class="settings-group">
                <h6>Домашняя страница</h6>
                <input type="text" id="home-page" value="${this.settings.homePage}" class="settings-input">
            </div>
            <div class="settings-group">
                <h6>Поисковая система</h6>
                <select id="search-engine" class="settings-select">
                    <option value="google" ${this.settings.searchEngine === 'google' ? 'selected' : ''}>Google</option>
                    <option value="bing" ${this.settings.searchEngine === 'bing' ? 'selected' : ''}>Bing</option>
                    <option value="yandex" ${this.settings.searchEngine === 'yandex' ? 'selected' : ''}>Yandex</option>
                </select>
            </div>
            <button class="sidebar-action-btn" id="clear-data">Очистить все данные</button>
        `;

        // Обработчики изменений настроек
        ['save-history', 'block-popups', 'enable-javascript'].forEach(id => {
            this.sidebar.querySelector(`#${id}`).addEventListener('change', (e) => {
                this.settings[id.replace('-', '')] = e.target.checked;
                this.saveSettings();
            });
        });

        this.sidebar.querySelector('#home-page').addEventListener('change', (e) => {
            this.settings.homePage = e.target.value;
            this.saveSettings();
        });

        this.sidebar.querySelector('#search-engine').addEventListener('change', (e) => {
            this.settings.searchEngine = e.target.value;
            this.saveSettings();
        });

        this.sidebar.querySelector('#clear-data').addEventListener('click', () => {
            if (confirm('Очистить всю историю, куки, кэш и другие данные?')) {
                this.clearAllData();
            }
        });
    }

    showExtensions() {
        this.sidebar.style.display = 'block';
        this.sidebarContent.innerHTML = `
            <h5>Расширения</h5>
            <p>Установленные расширения:</p>
            <div class="extension-item">
                <div class="extension-icon">🔧</div>
                <div class="extension-info">
                    <div class="extension-name">WebOS Tools</div>
                    <div class="extension-desc">Инструменты для разработки</div>
                </div>
                <button class="extension-toggle">Вкл</button>
            </div>
            <div class="extension-item">
                <div class="extension-icon">🎨</div>
                <div class="extension-info">
                    <div class="extension-name">Dark Reader</div>
                    <div class="extension-desc">Темная тема для сайтов</div>
                </div>
                <button class="extension-toggle">Вкл</button>
            </div>
            <button class="sidebar-action-btn">Магазин расширений</button>
        `;
    }

    showAbout() {
        this.sidebar.style.display = 'block';
        this.sidebarContent.innerHTML = `
            <h5>О браузере</h5>
            <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 48px; margin-bottom: 16px;">🌐</div>
                <h3>WebOS Browser</h3>
                <p>Версия 2.0.0</p>
                <p>Демо-версия с ограниченной функциональностью</p>
                <div style="margin-top: 20px; padding: 16px; background: var(--bg-secondary); border-radius: 8px;">
                    <p><strong>Возможности:</strong></p>
                    <ul style="text-align: left;">
                        <li>Многовадковый просмотр</li>
                        <li>История и закладки</li>
                        <li>Поиск в интернете</li>
                        <li>Настройки браузера</li>
                        <li>Горячие клавиши</li>
                    </ul>
                </div>
            </div>
        `;
    }

    showContextMenu(items) {
        // Реализация контекстного меню (аналогично предыдущей версии)
        // ... (код из предыдущей версии)
    }

    hideSidebar() {
        this.sidebar.style.display = 'none';
    }

    // Вспомогательные методы
    getActiveTab() {
        return this.tabs.find(tab => tab.id === this.activeTabId);
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    getSearchUrl(query) {
        const engines = {
            google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
            yandex: `https://yandex.ru/search/?text=${encodeURIComponent(query)}`
        };
        return engines[this.settings.searchEngine] || engines.google;
    }

    getDomainFromUrl(url) {
        try {
            return new URL(url).hostname;
        } catch {
            return url;
        }
    }

    closeActiveTab() {
        if (this.activeTabId) {
            this.closeTab(this.activeTabId);
        }
    }

    // Сохранение и загрузка данных
    loadData() {
        this.settings = Utils.storage.get('browser-settings', this.settings);
        this.history = Utils.storage.get('browser-history', []);
        this.bookmarks = Utils.storage.get('browser-bookmarks', [
            { url: 'https://example.com', title: 'Example Domain', date: new Date().toISOString() },
            { url: 'https://www.google.com', title: 'Google', date: new Date().toISOString() },
            { url: 'https://github.com', title: 'GitHub', date: new Date().toISOString() }
        ]);
    }

    saveSettings() {
        Utils.storage.set('browser-settings', this.settings);
    }

    saveHistory() {
        Utils.storage.set('browser-history', this.history);
    }

    saveBookmarks() {
        Utils.storage.set('browser-bookmarks', this.bookmarks);
    }

    clearAllData() {
        Utils.storage.remove('browser-history');
        Utils.storage.remove('browser-settings');
        Utils.storage.remove('browser-bookmarks');
        
        this.history = [];
        this.bookmarks = [];
        this.settings = {
            saveHistory: true,
            blockPopups: true,
            enableJavascript: true,
            homePage: 'https://example.com',
            searchEngine: 'google'
        };
        
        this.hideSidebar();
        Utils.showNotification('Браузер', 'Все данные очищены', 'success');
    }
}

window.Browser = Browser;
