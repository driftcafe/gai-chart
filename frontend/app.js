/**
 * Hila Frontend - Chart rendering and API integration
 * Implements data injection architecture: receives config from backend,
 * injects actual data on the frontend.
 */

const CHART_ICONS = {
    bar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 19.5V13.5963H19.5V19.5H16ZM10.25 19.5V4.5H13.75V19.5H10.25ZM4.5 19.5V9.404H8V19.5H4.5Z" fill="currentColor"/></svg>`,
    line: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.50002 18.1538L2.38477 17.0385L9.53852 9.88477L13.5385 13.8848L20.5808 5.88477L21.6345 6.91927L13.5578 16.1345L9.53852 12.1153L3.50002 18.1538Z" fill="currentColor"/></svg>`,
    scatter: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.406 20.5C13.6802 20.5 13.0625 20.2459 12.553 19.7378C12.0433 19.2298 11.7885 18.6127 11.7885 17.8867C11.7885 17.1609 12.0426 16.5433 12.5507 16.0338C13.0587 15.5241 13.6757 15.2692 14.4015 15.2692C15.1273 15.2692 15.7451 15.5233 16.2548 16.0315C16.7644 16.5395 17.0193 17.1564 17.0193 17.8822C17.0193 18.6082 16.7652 19.226 16.257 19.7355C15.749 20.2452 15.132 20.5 14.406 20.5ZM14.4038 19C14.7128 19 14.9759 18.8913 15.1932 18.674C15.4106 18.4567 15.5193 18.1935 15.5193 17.8845C15.5193 17.5757 15.4106 17.3126 15.1932 17.0953C14.9759 16.8779 14.7128 16.7693 14.4038 16.7693C14.0948 16.7693 13.8317 16.8779 13.6145 17.0953C13.3972 17.3126 13.2885 17.5757 13.2885 17.8845C13.2885 18.1935 13.3972 18.4567 13.6145 18.674C13.8317 18.8913 14.0948 19 14.4038 19ZM16.5 13.5C15.1013 13.5 13.9183 13.0163 12.951 12.049C11.9837 11.0817 11.5 9.89867 11.5 8.5C11.5 7.10133 11.9837 5.91833 12.951 4.951C13.9183 3.98367 15.1013 3.5 16.5 3.5C17.8987 3.5 19.0817 3.98367 20.049 4.951C21.0163 5.91833 21.5 7.10133 21.5 8.5C21.5 9.89867 21.0163 11.0817 20.049 12.049C19.0817 13.0163 17.8987 13.5 16.5 13.5ZM16.5 12C17.4833 12 18.3125 11.6625 18.9875 10.9875C19.6625 10.3125 20 9.48333 20 8.5C20 7.51667 19.6625 6.6875 18.9875 6.0125C18.3125 5.3375 17.4833 5 16.5 5C15.5167 5 14.6875 5.3375 14.0125 6.0125C13.3375 6.6875 13 7.51667 13 8.5C13 9.48333 13.3375 10.3125 14.0125 10.9875C14.6875 11.6625 15.5167 12 16.5 12ZM7.1155 17.6152C6.12117 17.6152 5.27 17.2613 4.562 16.5533C3.854 15.8453 3.5 14.9942 3.5 14C3.5 13.0058 3.854 12.1548 4.562 11.4468C5.27 10.7388 6.12117 10.3848 7.1155 10.3848C8.10967 10.3848 8.96075 10.7388 9.66875 11.4468C10.3768 12.1548 10.7308 13.0058 10.7308 14C10.7308 14.9942 10.3768 15.8453 9.66875 16.5533C8.96075 17.2613 8.10967 17.6152 7.1155 17.6152ZM7.11575 16.1155C7.69758 16.1155 8.19558 15.9083 8.60975 15.494C9.02375 15.0797 9.23075 14.5816 9.23075 13.9998C9.23075 13.4179 9.02358 12.9199 8.60925 12.5058C8.19492 12.0916 7.69683 11.8845 7.115 11.8845C6.53317 11.8845 6.03525 12.0917 5.62125 12.506C5.20708 12.9203 5 13.4184 5 14.0003C5 14.5821 5.20717 15.0801 5.6215 15.4943C6.03583 15.9084 6.53392 16.1155 7.11575 16.1155Z" fill="currentColor"/></svg>`,
    heatmap: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 20.5V19H6V20.5H3.5ZM3.5 16.625V15.125H10.8365V16.625H3.5ZM3.5 12.75V11.25H20.5V12.75H3.5ZM3.5 8.875V7.375H10.8365V8.875H3.5ZM3.5 5V3.5H6V5H3.5ZM8.3365 20.5V19H10.8365V20.5H8.3365ZM8.3365 5V3.5H10.8365V5H8.3365ZM13.1635 20.5V19H15.6635V20.5H13.1635ZM13.1635 16.625V15.125H20.5V16.625H13.1635ZM13.1635 8.875V7.375H20.5V8.875H13.1635ZM13.1635 5V3.5H15.6635V5H13.1635ZM18 20.5V19H20.5V20.5H18ZM18 5V3.5H20.5V5H18Z" fill="currentColor"/></svg>`,
    boxplot: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 19.5V17.5H5.5V6.5H7.5V4.5H9V6.5H11V17.5H9V19.5H7.5ZM7 16H9.5V8H7V16ZM15 19.5V14.6923H13V8.404H15V4.5H16.5V8.404H18.5V14.6923H16.5V19.5H15ZM14.5 13.1923H17V9.90375H14.5V13.1923Z" fill="currentColor"/></svg>`,
    treemap: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.15375 17.8462H11.423V14.077H6.15375V17.8462ZM6.15375 12.923H11.423V6.15375H6.15375V12.923ZM12.577 17.8462H17.8462V11.077H12.577V17.8462ZM12.577 9.923H17.8462V6.15375H12.577V9.923ZM5.30775 20.5C4.80258 20.5 4.375 20.325 4.025 19.975C3.675 19.625 3.5 19.1974 3.5 18.6923V5.30775C3.5 4.80258 3.675 4.375 4.025 4.025C4.375 3.675 4.80258 3.5 5.30775 3.5H18.6923C19.1974 3.5 19.625 3.675 19.975 4.025C20.325 4.375 20.5 4.80258 20.5 5.30775V7.38475H22.2693V8.8845H20.5V11.25H22.2693V12.75H20.5V15.1155H22.2693V16.6152H20.5V18.6923C20.5 19.1974 20.325 19.625 19.975 19.975C19.625 20.325 19.1974 20.5 18.6923 20.5H5.30775ZM5.30775 19H18.6923C18.7693 19 18.8398 18.9679 18.9038 18.9038C18.9679 18.8398 19 18.7693 19 18.6923V5.30775C19 5.23075 18.9679 5.16025 18.9038 5.09625C18.8398 5.03208 18.7693 5 18.6923 5H5.30775C5.23075 5 5.16025 5.03208 5.09625 5.09625C5.03208 5.16025 5 5.23075 5 5.30775V18.6923C5 18.7693 5.03208 18.8398 5.09625 18.9038C5.16025 18.9679 5.23075 19 5.30775 19Z" fill="currentColor"/></svg>`
};

const API_BASE_URL = 'http://localhost:8000';

class HilaApp {
    constructor() {
        this.chart = null;
        this.conversationHistory = [];
        this.currentDataset = 'quarterly_financials';
        this.currentData = null;

        // Interactive History & Drill-down state
        this.chartHistory = []; // Stores { config, data, timestamp }
        this.selectedContext = null; // Stores { name, value, series }

        this.initializeElements();
        this.attachEventListeners();
        this.loadDatasets();
        this.initTheme(); // Initialize theme
        this.initColdStart(); // Load default chart on startup
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.datasetSelect = document.getElementById('dataset-select');
        this.chartElement = document.getElementById('chart');
        this.emptyState = document.getElementById('empty-state');
        this.chartContainer = document.getElementById('chart-container');
        this.chartTitle = document.getElementById('chart-title');
        this.errorContainer = document.getElementById('error-container');
        this.themeToggle = document.getElementById('theme-toggle');
        this.contextChipContainer = document.getElementById('context-chip-container'); // New context chip container

        // Save the original icon HTML (SVG)
        if (this.sendButton) {
            this.sendButtonIconHTML = this.sendButton.innerHTML;
        }
    }

    attachEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });
        this.datasetSelect.addEventListener('change', (e) => {
            this.currentDataset = e.target.value;
        });

        // View Toggles
        document.getElementById('btn-toggle-table').addEventListener('click', () => this.toggleView('table'));
        document.getElementById('btn-toggle-chart').addEventListener('click', () => this.toggleView('chart'));
    }

    toggleView(view) {
        const btnTable = document.getElementById('btn-toggle-table');
        const btnChart = document.getElementById('btn-toggle-chart');
        const chatSection = document.querySelector('.chat-section');

        if (view === 'table') {
            btnTable.classList.add('active');
            btnChart.classList.remove('active');
            this.chartContainer.style.display = 'none';
            document.getElementById('table-container').style.display = 'block';
            if (chatSection) chatSection.style.display = 'none';
            this.renderTable(this.currentData);
        } else {
            btnTable.classList.remove('active');
            btnChart.classList.add('active');
            document.getElementById('table-container').style.display = 'none';
            this.chartContainer.style.display = 'block';
            if (chatSection) chatSection.style.display = 'flex';
            // Resize chart in case container changed size
            if (this.chart) this.chart.resize();
        }
    }

    renderTable(data) {
        const container = document.getElementById('table-container');
        if (!data || data.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No data available</div>';
            return;
        }

        const headers = Object.keys(data[0]);
        let html = '<table class="data-table"><thead><tr>';

        // Headers
        headers.forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';

        // Rows
        data.forEach(row => {
            html += '<tr>';
            headers.forEach(h => {
                let cellValue = row[h];
                let cellClass = '';
                let cellContent = cellValue;

                // Simple formatting logic based on column name or value type
                if (typeof cellValue === 'number') {
                    // Currency formatting
                    if (h.toLowerCase().includes('revenue') || h.toLowerCase().includes('profit') || h.toLowerCase().includes('cost')) {
                        cellContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cellValue);
                    }
                    // Percentage formatting
                    else if (h.toLowerCase().includes('percent') || h.toLowerCase().includes('change')) {
                        const percentVal = (cellValue * 100).toFixed(1) + '%';
                        if (cellValue > 0) {
                            cellContent = `<span class="badge-positive">+${percentVal}</span>`;
                        } else if (cellValue < 0) {
                            cellContent = `<span class="badge-negative">${percentVal}</span>`;
                        } else {
                            cellContent = percentVal;
                        }
                    }
                    // Standard number
                    else {
                        cellContent = cellValue.toLocaleString();
                    }
                }

                // Specific column styling (Currency Code)
                if (h === 'Global Currency' || h === 'Currency') {
                    cellContent = `<span class="currency-badge">${cellValue}</span>`;
                }

                html += `<td class="${cellClass}">${cellContent}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    async loadDatasets() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/datasets`);
            const datasets = await response.json();

            this.datasetSelect.innerHTML = datasets.map(ds =>
                `<option value="${ds}" ${ds === this.currentDataset ? 'selected' : ''}>${this.formatDatasetName(ds)}</option>`
            ).join('');
        } catch (error) {
            console.error('Error loading datasets:', error);
        }
    }

    formatDatasetName(name) {
        return name.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        this.setTheme(initialTheme);

        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.setTheme(newTheme);
            });
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Icons
        const iconSun = `<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M440-760v-160h80v160h-80Zm266 110-56-56 112-112 56 56-112 112Zm-440 0-112-112 56-56 112 112-56 56Zm-86 330H20v-80h160v80Zm720 0H780v-80h160v80ZM440-40v-160h80v160h-80Zm-174-20 56-56 112 112-56 56-112-112Zm492 0-112-112 56 56 112 112-56 56ZM480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280Z"/></svg>`;
        const iconMoon = `<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z"/></svg>`;

        if (this.themeToggle) {
            this.themeToggle.innerHTML = theme === 'dark' ? iconSun : iconMoon;
        }

        if (this.chart && this.lastChartConfig && this.lastChartData) {
            this.renderChart(this.lastChartConfig, this.lastChartData, true);
        }
    }

    async initColdStart() {
        /**
         * Cold Start: Load default chart on page load
         * Fetches /api/init which returns pre-configured chart + data
         */
        try {
            const response = await fetch(`${API_BASE_URL}/api/init`);
            const result = await response.json();

            if (result.success && result.config && result.data) {
                // Store the data for future queries
                this.currentData = result.data;
                this.currentDataset = 'default_data'; // Set dataset to default_data

                // Set conversation history from init
                if (result.conversation_history) {
                    this.conversationHistory = result.conversation_history;

                    // Display the assistant's intro message
                    const assistantMsg = result.conversation_history.find(m => m.role === 'assistant');
                    if (assistantMsg) {
                        // Clear the default welcome message first
                        this.chatMessages.innerHTML = '';

                        // Extract chart type if possible
                        let chartType = null;
                        if (result.config.echartOption && result.config.echartOption.series && result.config.echartOption.series[0]) {
                            chartType = result.config.echartOption.series[0].type;
                        }

                        this.addMessage('assistant', assistantMsg.content, chartType);
                    }
                }

                // Render the chart (this will push to history index 0)
                this.renderChart(result.config, result.data);

                // Make the assistant's first message clickable to restore initial state
                // This allows stepping back to the very first chart
                if (this.chartHistory.length > 0) {
                    const assistantMessages = this.chatMessages.querySelectorAll('.message.assistant');
                    if (assistantMessages.length > 0) {
                        const firstMsg = assistantMessages[0];
                        firstMsg.classList.add('clickable');
                        firstMsg.dataset.historyIndex = 0; // The initial chart is index 0
                        firstMsg.onclick = () => this.restoreHistoryState(0);
                        firstMsg.classList.add('active'); // Initially active
                    }
                }
            } else {
                console.warn('Cold start failed, showing empty state');
            }
        } catch (error) {
            console.error('Cold start error:', error);
            // Silently fail - user can still interact normally
        }
    }

    async handleSendMessage() {
        const query = this.chatInput.value.trim();
        if (!query) return;

        // Add user message to chat
        this.addMessage('user', query);
        this.chatInput.value = '';

        this.setLoading(true);
        this.clearError();

        try {
            // Apply Context (Feature 1)
            // If user selected a data point, append it to the prompt so LLM knows context
            let finalQuery = query;
            if (this.selectedContext) {
                finalQuery += ` (Context: Selected "${this.selectedContext.name}" with value ${this.selectedContext.value})`;
            }

            const response = await fetch(`${API_BASE_URL}/api/generate-chart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: finalQuery,
                    dataset: this.currentDataset,
                    conversation_history: this.conversationHistory
                })
            });

            const result = await response.json();

            if (result.success) {
                // Store conversation history
                this.conversationHistory = result.conversation_history;

                // Store data
                this.currentData = result.data;

                // Determine chart type for icon
                let chartType = null;
                if (result.config && result.config.echartOption && result.config.echartOption.series && result.config.echartOption.series.length > 0) {
                    chartType = result.config.echartOption.series[0].type;
                }

                // Add assistant message with chart icon
                this.addMessage('assistant', result.config.explanation || 'Chart generated successfully', chartType);

                // Render chart with data injection
                this.renderChart(result.config, result.data);
            } else {
                this.showError(result.error || 'Failed to generate chart');
                this.addMessage('assistant', `Error: ${result.error || 'Failed to generate chart'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError(`Network error: ${error.message}`);
            this.addMessage('assistant', `Error: ${error.message}`);
        } finally {
            this.setLoading(false);
        }
    }

    addMessage(role, content, chartType = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const labelDiv = document.createElement('div');
        labelDiv.className = 'message-label';
        labelDiv.textContent = role === 'user' ? 'You' : 'Hila';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        // If it's an assistant message with a chart type, add the icon
        if (role === 'assistant' && chartType) {
            // Map echart type to icon key
            let iconKey = chartType;
            if (chartType === 'effectScatter') iconKey = 'scatter';
            if (!CHART_ICONS[iconKey]) {
                // Try reasonable fallbacks or defaults
                if (chartType === 'scatter') iconKey = 'scatter';
                else iconKey = 'bar'; // Default fallback
            }

            // Allow checking specific chart types if needed (e.g. boxplot might come as 'boxplot' or custom)
            // ECharts uses 'boxplot', 'heatmap', 'treemap' which match our keys.
            // Check if we have an icon for this type
            const iconSvg = CHART_ICONS[iconKey] || CHART_ICONS['bar'];

            contentDiv.innerHTML = `
                <div class="message-flex">
                    <div class="chart-icon-box">
                        ${iconSvg}
                    </div>
                    <div class="message-text">${content}</div>
                </div>
            `;
        } else {
            contentDiv.textContent = content;
        }

        messageDiv.appendChild(labelDiv);
        messageDiv.appendChild(contentDiv);

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    renderChart(config, data, fromHistory = false) {
        // Save state for theme toggling
        this.lastChartConfig = config;
        this.lastChartData = data;

        // History Management (Time Travel)
        // Only push to history if this is a NEW render, not a restoration
        if (!fromHistory) {
            this.chartHistory.push({
                config: JSON.parse(JSON.stringify(config)), // Deep copy to freeze state
                data: JSON.parse(JSON.stringify(data)),
                timestamp: new Date()
            });

            // Mark the latest assistant message as clickable and link to this history item
            const historyIndex = this.chartHistory.length - 1;
            const assistantMessages = this.chatMessages.querySelectorAll('.message.assistant');
            if (assistantMessages.length > 0) {
                const lastAssistantMsg = assistantMessages[assistantMessages.length - 1];
                // Only attach if not already attached
                if (!lastAssistantMsg.dataset.historyIndex) {
                    lastAssistantMsg.classList.add('clickable');
                    lastAssistantMsg.dataset.historyIndex = historyIndex;
                    lastAssistantMsg.onclick = () => this.restoreHistoryState(historyIndex);
                    // Add active class to show it's currently selected
                    this.clearActiveMessages();
                    lastAssistantMsg.classList.add('active');
                }
            }
        }

        // Hide empty state, show chart
        this.emptyState.style.display = 'none';
        this.chartContainer.style.display = 'block';

        // Helper to update title
        if (config.title && this.chartTitle) {
            this.chartTitle.textContent = config.title;
        }

        // Initialize chart if needed
        if (!this.chart) {
            this.chart = echarts.init(this.chartElement);

            // Feature 1: Click-to-Context (Drill Down)
            this.chart.on('click', (params) => this.handleChartClick(params));
        }

        // Inject data into configuration
        let chartOption = this.injectData(config.echartOption, data, config.dataMapping);

        // Apply Premium UI Overrides
        chartOption = this.applyPremiumStyles(chartOption);

        // Render chart
        this.chart.setOption(chartOption, true);

        // Robust resize handling for flex container
        if (!this.resizeObserver) {
            this.resizeObserver = new ResizeObserver(() => {
                this.chart && this.chart.resize();
            });
            this.resizeObserver.observe(this.chartContainer);
        }
    }

    handleChartClick(params) {
        // console.log('Chart clicked:', params);

        if (params && params.name) {
            // Store selected context
            this.selectedContext = {
                name: params.name,
                value: Array.isArray(params.value) ? params.value[params.value.length - 1] : params.value,
                seriesName: params.seriesName
            };

            // Update UI
            this.updateContextChip();

            // Optional: visual feedback in chart (e.g., dispatchAction to highlight)
            // For now, the chip is sufficient feedback
        }
    }

    updateContextChip() {
        if (!this.contextChipContainer) return;

        if (this.selectedContext) {
            this.contextChipContainer.style.display = 'flex';
            this.contextChipContainer.innerHTML = `
                <div class="context-chip">
                    <span>Selected: ${this.selectedContext.name}</span>
                    <div class="remove-btn" onclick="hilaApp.clearContext()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                </div>
            `;
        } else {
            this.contextChipContainer.style.display = 'none';
            this.contextChipContainer.innerHTML = '';
        }
    }

    clearContext() {
        this.selectedContext = null;
        this.updateContextChip();
    }

    clearActiveMessages() {
        const activeMsgs = this.chatMessages.querySelectorAll('.message.active');
        activeMsgs.forEach(msg => msg.classList.remove('active'));
    }

    restoreHistoryState(index) {
        if (index >= 0 && index < this.chartHistory.length) {
            const historyItem = this.chartHistory[index];
            console.log('Restoring history state:', index);

            // Reset selection when rolling back (Constraint)
            this.clearContext();

            // Render without pushing to history again
            this.renderChart(historyItem.config, historyItem.data, true);

            // Update active state in UI
            this.clearActiveMessages();
            // Find the message with this index (could be user or assistant/initial)
            const message = this.chatMessages.querySelector(`.message[data-history-index="${index}"]`);
            if (message) {
                message.classList.add('active');
            }
        }
    }

    injectData(echartOption, data, dataMapping) {
        /**
         * CRITICAL DATA INJECTION LOGIC
         * This is where we inject actual financial data into the LLM-generated config.
         * The LLM only saw the schema, never the actual values.
         */
        try {
            const option = JSON.parse(JSON.stringify(echartOption)); // Deep clone

            // Debug logging to help troubleshoot issues
            console.log('Injecting data into chart config');
            console.log('Chart type:', option.series?.[0]?.type);
            console.log('Data rows:', data.length);
            console.log('Filters:', dataMapping?.filters);

            // Apply filters if specified in dataMapping
            let filteredData = data;
            if (dataMapping && dataMapping.filters) {
                filteredData = data.filter(row => {
                    return dataMapping.filters.every(filter => {
                        const value = row[filter.field];
                        switch (filter.operator) {
                            case 'equals':
                            case '==':
                                return value == filter.value;
                            case 'contains':
                                return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
                            case 'in':
                                // Check if value is in the array
                                return Array.isArray(filter.value) && filter.value.includes(value);
                            case '>':
                                return parseFloat(value) > parseFloat(filter.value);
                            case '<':
                                return parseFloat(value) < parseFloat(filter.value);
                            case '>=':
                                return parseFloat(value) >= parseFloat(filter.value);
                            case '<=':
                                return parseFloat(value) <= parseFloat(filter.value);
                            default:
                                return true;
                        }
                    });
                });
            }

            // Fix tooltip formatters that break multi-series charts
            // The LLM sometimes generates formatters like "{b0}: {c0}" which only work for single series
            // Also catches complex broken formatters like "{c[0]}" seen in bubble charts
            if (option.tooltip && option.tooltip.formatter) {
                // Remove restrictive formatters - let ECharts use its default multi-series tooltip
                if (typeof option.tooltip.formatter === 'string') {
                    const brokenPatterns = ['{b0}', '{c0}', '{c[', '{b['];
                    if (brokenPatterns.some(pattern => option.tooltip.formatter.includes(pattern))) {
                        delete option.tooltip.formatter;
                    }
                }
            }

            // Inject xAxis data
            if (option.xAxis) {
                const axes = Array.isArray(option.xAxis) ? option.xAxis : [option.xAxis];
                axes.forEach(ax => {
                    if (ax.data && ax.data.dataField) {
                        const field = ax.data.dataField;
                        // Handle both string (column name) and array (literal values)
                        if (Array.isArray(field)) {
                            // LLM provided literal values (e.g., ["FY26-Q1", "FY26-Q2", ...])
                            ax.data = field;
                        } else {
                            // LLM provided a column name to look up
                            const extractedData = filteredData.map(row => row[field]);
                            // Validate that we got actual data
                            if (extractedData.length > 0 && extractedData.some(val => val !== undefined && val !== null)) {
                                ax.data = extractedData;
                            } else {
                                console.warn(`No valid data found for xAxis field: ${field}`);
                                // Fallback: use row indices
                                ax.data = filteredData.map((_, idx) => `Item ${idx + 1}`);
                            }
                        }
                    } else if (!ax.data || (Array.isArray(ax.data) && ax.data.length === 0)) {
                        // If no data specified at all, generate default labels
                        if (filteredData.length > 0) {
                            ax.data = filteredData.map((_, idx) => `Item ${idx + 1}`);
                        }
                    }
                    // If ax.data is already an array (hardcoded), leave it as is
                });
            }

            // Inject series data
            if (option.series && Array.isArray(option.series)) {
                // Detect if we're filtering by any categorical field with 'in' operator (for multi-series charts)
                const categoricalFilter = dataMapping && dataMapping.filters &&
                    dataMapping.filters.find(f => f.operator === 'in' && Array.isArray(f.value));

                // For multiple specific categories (using 'in' operator), filter each series to its own data
                if (categoricalFilter) {
                    const filterField = categoricalFilter.field;

                    // Each series should show only its own category's data
                    option.series = option.series.map(series => {
                        // Fix: LLM sometimes generates 'bubble' type which isn't valid in ECharts
                        if (series.type === 'bubble') {
                            series.type = 'scatter';
                        }

                        // Multi-dimensional charts (scatter, heatmap) are handled in dedicated blocks below
                        // We don't process their data here, but we don't skip them entirely
                        const isMultiDimensional = series.type === 'scatter' || series.type === 'effectScatter' || series.type === 'heatmap';

                        if (!isMultiDimensional) {
                            // Filter data to this series' category
                            const seriesData = filteredData.filter(row => row[filterField] === series.name);

                            // Only apply generic mapping if dataField is a STRING (not an array)
                            if (series.data && series.data.dataField && typeof series.data.dataField === 'string') {
                                const field = series.data.dataField;
                                series.data = seriesData.map(row => row[field]);
                            } else if (series.data && series.data.dataField && Array.isArray(series.data.dataField)) {
                                // Handle array of fields (for multi-column data like quarters)
                                const fields = series.data.dataField;
                                // For each row matching this series, extract values from all specified fields
                                if (seriesData.length > 0) {
                                    series.data = fields.map(field => {
                                        const value = seriesData[0][field];
                                        return typeof value === 'string' ? parseFloat(value) : value;
                                    });
                                } else {
                                    series.data = [];
                                }
                            }
                        }
                        return series;
                    });
                } else {
                    // Single category filter or no categorical filter
                    let seriesToRender = option.series;

                    // Check for any single-value categorical filter (equals/contains)
                    const singleCategoryFilter = dataMapping && dataMapping.filters &&
                        dataMapping.filters.find(f => f.operator === 'equals' || f.operator === 'contains');

                    if (singleCategoryFilter) {
                        seriesToRender = option.series.filter(series => {
                            if (singleCategoryFilter.operator === 'equals') {
                                return series.name === singleCategoryFilter.value;
                            } else if (singleCategoryFilter.operator === 'contains') {
                                return series.name && series.name.toLowerCase().includes(singleCategoryFilter.value.toLowerCase());
                            }
                            return true;
                        });
                    }

                    // Inject data into series
                    option.series = seriesToRender.map(series => {
                        // Fix: LLM sometimes generates 'bubble' type which isn't valid in ECharts
                        if (series.type === 'bubble') {
                            series.type = 'scatter';
                        }

                        // Skip multi-dimensional charts here - they are handled in dedicated blocks below
                        if (series.type === 'scatter' || series.type === 'effectScatter' || series.type === 'heatmap' || series.type === 'boxplot') {
                            return series;
                        }

                        // Handle dataField for series data
                        if (series.data && series.data.dataField) {
                            const dataField = series.data.dataField;

                            if (typeof dataField === 'string') {
                                // Single column name - map from filtered data
                                const extractedData = filteredData.map(row => {
                                    const value = row[dataField];
                                    // Parse to number if it's a string
                                    return typeof value === 'string' ? parseFloat(value) : value;
                                });

                                // Validate we got valid numeric data
                                if (extractedData.some(val => !isNaN(val) && val !== null && val !== undefined)) {
                                    series.data = extractedData;
                                } else {
                                    console.warn(`No valid numeric data found for series field: ${dataField}`);
                                    series.data = [];
                                }
                            } else if (Array.isArray(dataField)) {
                                // Array of column names (e.g., quarters) - extract values from each column
                                // For filtered data (e.g., revenue > 5M), extract values from matching rows
                                if (filteredData.length > 0) {
                                    series.data = dataField.map(field => {
                                        const value = filteredData[0][field];
                                        const numValue = typeof value === 'string' ? parseFloat(value) : value;
                                        return isNaN(numValue) ? 0 : numValue;
                                    });
                                } else {
                                    series.data = [];
                                }
                            }
                        }
                        // If series.data is already an array (hardcoded), leave it as is
                        return series;
                    });
                }
            }

            // Handle pie charts (different data structure)
            if (option.series && option.series[0] && option.series[0].type === 'pie') {
                if (option.series[0].data && Array.isArray(option.series[0].data)) {
                    option.series[0].data = option.series[0].data.map(item => {
                        if (item.value && item.value.dataField) {
                            const field = item.value.dataField;
                            // Sum values for pie chart
                            const sum = data.reduce((acc, row) => acc + (row[field] || 0), 0);
                            return { ...item, value: sum };
                        }
                        return item;
                    });
                }
            }

            // Handle scatter and bubble charts (multi-dimensional data points)
            if (option.series && option.series.length > 0) {
                // Fix: Ensure we catch 'bubble' type even if previous loop missed it
                const firstSeries = option.series[0];
                if (firstSeries.type === 'scatter' || firstSeries.type === 'effectScatter' || firstSeries.type === 'bubble') {
                    option.series = option.series.map(series => {
                        // Ensure type is valid ECharts 'scatter'
                        if (series.type === 'bubble') {
                            series.type = 'scatter';
                        }

                        // Handle both formats: {dataField: [...]} or [{dataField: [...]}]
                        let dataFieldObj = series.data;
                        if (Array.isArray(series.data) && series.data.length > 0 && series.data[0].dataField) {
                            dataFieldObj = series.data[0];
                        }

                        if (dataFieldObj && dataFieldObj.dataField) {
                            const fields = dataFieldObj.dataField;

                            // If dataField is an array of column names [x, y] or [x, y, size]
                            // If dataField is an array of column names [x, y] or [x, y, size]
                            if (Array.isArray(fields)) {
                                console.log('Scatter/bubble chart fields:', fields);

                                // Helper to resolve column names (fuzzy match)
                                const availableColumns = filteredData.length > 0 ? Object.keys(filteredData[0]) : [];
                                const resolveField = (name) => {
                                    if (!name) return name;
                                    if (availableColumns.includes(name)) return name;

                                    const normalizedSearch = String(name).toLowerCase().replace(/[^a-z0-9]/g, '');

                                    // 1. Exact normalized match
                                    const exactMatch = availableColumns.find(col => {
                                        const normalizedCol = String(col).toLowerCase().replace(/[^a-z0-9]/g, '');
                                        return normalizedCol === normalizedSearch;
                                    });
                                    if (exactMatch) return exactMatch;

                                    // 2. Partial match heuristic (e.g. "Profit" matches "Gross Profit", "Revenue" matches "Total Revenue")
                                    // This is risky but helps with "No Bubbles" when LLM is slightly off.
                                    const partialMatch = availableColumns.find(col => {
                                        const normalizedCol = String(col).toLowerCase().replace(/[^a-z0-9]/g, '');
                                        return normalizedCol.includes(normalizedSearch) || normalizedSearch.includes(normalizedCol);
                                    });

                                    return partialMatch || name;
                                };

                                // Use resolved fields
                                const validFields = fields.map(f => resolveField(f));
                                console.log('Original Fields:', fields);
                                console.log('Resolved Fields:', validFields);

                                // Check if we have enough dimensions for a scatter plot
                                if (validFields.length < 2) {
                                    console.warn(`Scatter chart needs at least 2 dimensions, got ${validFields.length}. Adding row index as x-axis.`);
                                    series.data = filteredData.map((row, index) => {
                                        const value = row[validFields[0]];
                                        const numValue = typeof value === 'string' ? parseFloat(value) : value;
                                        return [index, numValue];
                                    });
                                } else {
                                    // Standard Numeric/Numeric case
                                    series.data = filteredData.map(row => {
                                        const point = validFields.map(field => {
                                            const value = row[field];
                                            const numValue = typeof value === 'string' ? parseFloat(value) : value;
                                            return numValue;
                                        });
                                        return point;
                                    });
                                }

                                // Validate data - filter out invalid points
                                series.data = series.data.filter(point => {
                                    // Ensure point is an array
                                    if (!Array.isArray(point)) return false;

                                    // X and Y must be valid numbers
                                    const xValid = !isNaN(point[0]) && point[0] !== null && point[0] !== undefined;
                                    const yValid = !isNaN(point[1]) && point[1] !== null && point[1] !== undefined;

                                    return xValid && yValid; // Size (index 2) is optional/handled below
                                });

                                // Check if the 3rd dimension (size) effectively exists
                                // If all sizes are NaN, it means the field mapping was likely wrong (e.g. "Total Revenue" column not found)
                                const hasValidSize = validFields.length === 3 && series.data.some(p => !isNaN(p[2]));

                                // For bubble charts (3 dimensions), add symbolSize function
                                if (hasValidSize && !series.symbolSize && series.data.length > 0) {
                                    // Filter out points with invalid size for the resizing logic ONLY
                                    // (or treat them as min size)
                                    const validSizePoints = series.data.filter(p => !isNaN(p[2]));
                                    if (validSizePoints.length > 0) {
                                        // Use the third dimension (size) to scale bubble size
                                        const sizeValues = validSizePoints.map(point => point[2]);
                                        const maxSize = Math.max(...sizeValues);
                                        const minSize = Math.min(...sizeValues);

                                        console.log('Bubble size range:', minSize, 'to', maxSize);

                                        series.symbolSize = function (data) {
                                            const val = data[2];
                                            if (isNaN(val) || val === null || val === undefined) return 15; // Default larger base

                                            // Safety check for single value or invalid range
                                            if (maxSize === minSize) return 40;

                                            // Scale between 15 and 95 pixels (larger range)
                                            const normalized = (val - minSize) / (maxSize - minSize);
                                            return 15 + normalized * 80;
                                        };
                                    }
                                } else if (fields.length === 3 && !hasValidSize) {
                                    console.warn('Bubble chart requested but 3rd dimension yielded no valid data. Falling back to uniform size.');
                                    // We keep the data as [x, y, NaN], but since we don't set symbolSize function based on index 2,
                                    // ECharts will use default symbolSize.
                                    // Optionally we can slice the data to be just [x, y] to be clean.
                                    series.data = series.data.map(p => [p[0], p[1]]);
                                    // Reset type to scatter explicitly if not already
                                    series.type = 'scatter';
                                    series.symbolSize = 15; // Set a nice default size
                                }
                            }
                            // If dataField is a single column (fallback)
                            else {
                                series.data = filteredData.map((row, index) => {
                                    const value = row[fields];
                                    const numValue = typeof value === 'string' ? parseFloat(value) : value;
                                    return [index, numValue];
                                });
                            }
                        }
                        return series;
                    });
                }
            }

            // Handle heatmap charts (requires [[x, y, value]] format)
            if (option.series && option.series.length > 0 && option.series[0].type === 'heatmap') {
                option.series = option.series.map(series => {
                    if (series.data && series.data.dataField) {
                        const dataField = series.data.dataField;

                        // If dataField is an array of column names (quarters)
                        if (Array.isArray(dataField)) {
                            // Convert to [[x, y, value]] format
                            // x = quarter index, y = product index, value = revenue
                            const heatmapData = [];
                            filteredData.forEach((row, yIndex) => {
                                dataField.forEach((field, xIndex) => {
                                    const value = row[field];
                                    const numValue = typeof value === 'string' ? parseFloat(value) : value;
                                    heatmapData.push([xIndex, yIndex, numValue || 0]);
                                });
                            });
                            series.data = heatmapData;
                        }
                    }
                    return series;
                });
            }

            // Handle boxplot charts
            if (option.series && option.series.some(s => s.type === 'boxplot')) {
                // 1. Identify category field from xAxis
                let categoryField = null;
                if (option.xAxis && !Array.isArray(option.xAxis)) {
                    if (option.xAxis.data && option.xAxis.data.dataField) {
                        categoryField = option.xAxis.data.dataField;
                    }
                } else if (option.xAxis && Array.isArray(option.xAxis) && option.xAxis.length > 0) {
                    if (option.xAxis[0].data && option.xAxis[0].data.dataField) {
                        categoryField = option.xAxis[0].data.dataField;
                    }
                }

                if (categoryField) {
                    // Scenario A: Row-based grouping (e.g. Salary by Department)
                    // 2. Get unique categories
                    const categories = [...new Set(filteredData.map(row => row[categoryField]))].sort();

                    // Update xAxis to show unique categories
                    const xAxisObj = Array.isArray(option.xAxis) ? option.xAxis[0] : option.xAxis;
                    xAxisObj.data = categories;

                    // 3. Process each series
                    option.series.forEach(series => {
                        if (series.type === 'boxplot' && series.data && series.data.dataField) {
                            const valueField = series.data.dataField;

                            // Group data by category
                            const boxData = categories.map(cat => {
                                // Find all values for this category
                                const values = filteredData
                                    .filter(row => row[categoryField] === cat)
                                    .map(row => {
                                        const val = row[valueField];
                                        return typeof val === 'string' ? parseFloat(val) : val;
                                    })
                                    .filter(v => !isNaN(v)); // Filter out invalid

                                // Compute stats
                                return this.calculateBoxplotStats(values);
                            });

                            series.data = boxData;
                        }
                    });
                } else {
                    // Scenario B: Column-based grouping (e.g. Revenue by Quarter)
                    // Check if series has array of fields
                    option.series.forEach(series => {
                        if (series.type === 'boxplot' && series.data && Array.isArray(series.data.dataField)) {
                            const fields = series.data.dataField;

                            // For each field (column), get all values
                            const boxData = fields.map(field => {
                                const values = filteredData.map(row => {
                                    const val = row[field];
                                    return typeof val === 'string' ? parseFloat(val) : val;
                                }).filter(v => !isNaN(v));

                                return this.calculateBoxplotStats(values);
                            });

                            series.data = boxData;
                        }
                    });
                }
            }

            return option;
        } catch (error) {
            console.error('Error injecting data into chart config:', error);
            console.error('Chart config:', echartOption);
            console.error('Data mapping:', dataMapping);

            // Fallback: return original option and let ECharts handle it
            // This prevents complete chart failure
            return echartOption;
        }
    }

    calculateBoxplotStats(values) {
        if (values.length === 0) return [0, 0, 0, 0, 0];

        values.sort((a, b) => a - b);

        const q1 = this.getQuantile(values, 0.25);
        const median = this.getQuantile(values, 0.5);
        const q3 = this.getQuantile(values, 0.75);
        const min = values[0];
        const max = values[values.length - 1];

        return [min, q1, median, q3, max];
    }

    resolveColumnName(name, availableColumns) {
        if (!name || !availableColumns) return name;
        if (availableColumns.includes(name)) return name;

        const normalizedSearch = String(name).toLowerCase().replace(/[^a-z0-9]/g, '');

        // Try to find a match by standardizing both
        const match = availableColumns.find(col => {
            const normalizedCol = String(col).toLowerCase().replace(/[^a-z0-9]/g, '');
            return normalizedCol === normalizedSearch;
        });

        // If no exact fuzzy match, look for "Total" variants or common swaps
        if (!match) {
            // "FY27 Total" vs "Total FY27 Revenue"
            if (name.includes('Total') && name.includes('Revenue')) {
                const year = name.match(/FY\d{2}/)?.[0];
                if (year) {
                    const candidate = `${year} Total`;
                    if (availableColumns.includes(candidate)) return candidate;
                }
            }
        }

        return match || name;
    }

    getQuantile(sorted, q) {
        const pos = (sorted.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    }

    applyPremiumStyles(option) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const premiumFont = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

        // Light vs Dark Palette (Extracted from Design Spec)
        // hila Light Categorical
        const colorsLight = [
            '#2998BD', // .01 Teal
            '#5F4DB2', // .02 Purple
            '#E56910', // .03 Orange
            '#943D73', // .04 Magenta
            '#0A326C', // .05 Dark Blue
            '#8F7EE7', // .06 Soft Purple
            '#50253F', // .07 Dark Maroon
            '#A54800'  // .08 Brown
        ];

        // hila Dark Categorical
        const colorsDark = [
            '#2898BD', // .01 Teal
            '#B8ACF6', // .02 Lavender
            '#E56910', // .03 Orange
            '#F797D2', // .04 Pink
            '#CCE0FF', // .05 Pale Blue
            '#8270DB', // .06 Purple
            '#FDD0EC', // .07 Pale Pink
            '#FEC195'  // .08 Peach
        ];

        const textColor = isDark ? '#f0f6fc' : '#1D1D1F';
        const axisColor = isDark ? '#8b949e' : '#86868B';
        const tooltipBg = isDark ? 'rgba(22, 27, 34, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        const borderColor = isDark ? 'rgba(240, 246, 252, 0.1)' : 'rgba(0,0,0,0.05)';

        // Deep merge/override defaults
        option.textStyle = { fontFamily: premiumFont };
        option.color = isDark ? colorsDark : colorsLight;

        // Detect if this is a bar chart with many categories (for grid spacing)
        const isBarChart = option.series && option.series.some(s => s.type === 'bar');
        // Handle both xAxis as array or single object
        const xAxisData = option.xAxis ?
            (Array.isArray(option.xAxis) ? option.xAxis[0]?.data : option.xAxis.data) : null;
        const categoryCount = xAxisData && Array.isArray(xAxisData) ? xAxisData.length : 0;

        // Detect if this is a heatmap (needs extra space for legend below X-axis)
        const isHeatmap = option.series && option.series.length > 0 && option.series[0].type === 'heatmap';

        // Premium Grid (Clean, less noise)
        option.grid = {
            ...option.grid,
            top: 40,
            right: 30,
            bottom: isHeatmap ? 80 : ((isBarChart && categoryCount > 8) ? 80 : 30), // Extra space for heatmap legend or rotated bar labels
            left: 50,
            containLabel: true,
            borderColor: borderColor,
            show: false // No outer border
        };

        // Premium Tooltip (Shadows, blur)
        // Check for broken formatters one last time before merging
        if (option.tooltip && typeof option.tooltip.formatter === 'string') {
            const brokenPatterns = ['{b0}', '{c0}', '{c[', '{b['];
            if (brokenPatterns.some(pattern => option.tooltip.formatter.includes(pattern))) {
                delete option.tooltip.formatter;
            }
        }

        option.tooltip = {
            ...option.tooltip,
            backgroundColor: tooltipBg,
            borderColor: borderColor,
            borderWidth: 1,
            padding: [12, 16],
            textStyle: {
                color: textColor,
                fontFamily: premiumFont,
                fontSize: 13
            },
            extraCssText: 'box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); border-radius: 12px; backdrop-filter: blur(10px);'
        };

        // Smooth Animations
        option.animation = true;
        option.animationDuration = 800;
        option.animationEasing = 'cubicOut';


        // Axis Cleanup
        if (option.xAxis) {
            const axes = Array.isArray(option.xAxis) ? option.xAxis : [option.xAxis];
            axes.forEach(ax => {
                ax.axisLine = { show: false };
                ax.axisTick = { show: false };
                ax.axisLabel = {
                    color: axisColor,
                    fontFamily: premiumFont,
                    margin: 12
                };

                // For bar charts with many categories, rotate labels and show all
                if (isBarChart && categoryCount > 8) {
                    ax.axisLabel.rotate = 45;
                    ax.axisLabel.interval = 0; // Show all labels
                    ax.axisLabel.margin = 16; // More space for rotated labels
                }

                ax.splitLine = { show: false };
            });
        }

        if (option.yAxis) {
            const axes = Array.isArray(option.yAxis) ? option.yAxis : [option.yAxis];
            axes.forEach(ax => {
                ax.axisLine = { show: false };
                ax.axisTick = { show: false };
                ax.axisLabel = {
                    color: axisColor,
                    fontFamily: premiumFont,
                    margin: 12
                };
                ax.splitLine = {
                    show: true,
                    lineStyle: {
                        color: borderColor,
                        type: 'dashed'
                    }
                };
            });
        }



        // Legend Text
        if (option.legend) {
            option.legend.textStyle = {
                color: textColor,
                fontFamily: premiumFont
            };
        }

        // Treemap-specific styling
        if (option.series && option.series.some(s => s.type === 'treemap')) {
            option.series.forEach(series => {
                if (series.type === 'treemap') {
                    // Ensure levels utilize the color palette
                    series.itemStyle = {
                        borderColor: '#fff',
                        borderWidth: 1,
                        gapWidth: 1
                    };
                    // Remove any hardcoded color that overrides the palette
                    if (series.data) {
                        series.data.forEach(item => {
                            if (item.itemStyle && item.itemStyle.color) {
                                delete item.itemStyle.color;
                            }
                        });
                    }
                    // Configure levels to vary colors
                    series.levels = [
                        {
                            itemStyle: {
                                borderColor: '#fff',
                                borderWidth: 0,
                                gapWidth: 1
                            }
                        },
                        {
                            colorSaturation: [0.35, 0.5],
                            itemStyle: {
                                gapWidth: 1,
                                borderColorSaturation: 0.6
                            }
                        }
                    ];
                }
            });
        }

        // Heatmap-specific styling
        if (option.series && option.series.length > 0 && option.series[0].type === 'heatmap') {
            option.series.forEach(series => {
                // Disable labels in cells to prevent overlap with long numbers
                // Users will see full values in tooltips on hover
                series.label = {
                    show: false
                };

                // Ensure emphasis shows the value in tooltip
                series.emphasis = {
                    ...series.emphasis,
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                };
            });

            // Configure visualMap (color legend) to be horizontal and below the chart
            if (option.visualMap) {
                const visualMaps = Array.isArray(option.visualMap) ? option.visualMap : [option.visualMap];
                visualMaps.forEach(vm => {
                    vm.orient = 'horizontal';
                    vm.left = 'center';
                    vm.top = undefined; // Clear any top positioning
                    vm.bottom = 5; // Position below X-axis labels (grid has 80px bottom margin)
                    vm.textStyle = {
                        color: textColor,
                        fontFamily: premiumFont
                    };
                });
                option.visualMap = visualMaps.length === 1 ? visualMaps[0] : visualMaps;
            }
        }

        // Scatter/Bubble specific enhancements including MarkLine (Quadrants)
        if (option.series) {
            option.series.forEach(series => {
                if (series.type === 'scatter' || series.type === 'bubble' || series.type === 'effectScatter') {


                    // 1. Force MarkLine if it looks like a quadrant chart (e.g. if LLM tried but failed, or simply to improve UX)
                    // Check user intent via Title
                    const titleText = (option.title && option.title.text) ? option.title.text.toLowerCase() : '';
                    // Heuristic: Explicit keywords OR "Revenue vs Profit" scenarios which often imply matrix analysis
                    const needsQuadrants = titleText.includes('quadrant') ||
                        titleText.includes('matrix') ||
                        titleText.includes('benchmark') ||
                        (titleText.includes('revenue') && titleText.includes('profit'));

                    console.log('Checking quadrant intent for series:', series.name, 'Title:', titleText, 'Needs Quadrants:', needsQuadrants);

                    if (needsQuadrants) {
                        console.log('Applying forced MarkLine (Quadrants)');
                        series.markLine = {
                            symbol: ['none', 'none'], // Remove arrowheads
                            label: { show: false },
                            silent: true,
                            animation: false,
                            lineStyle: {
                                type: 'solid',
                                color: '#000000',
                                width: 2
                            },
                            data: [
                                { type: 'average', valueIndex: 0, name: 'Avg X' }, // Vertical Line
                                { type: 'average', valueIndex: 1, name: 'Avg Y' }  // Horizontal Line
                            ]
                        };
                    } else {
                        console.log('Skipping forced MarkLine (No intent detected)');
                    }

                    // 2. Ensure reasonable bubble sizes if not set
                    if (series.type === 'scatter' && !series.symbolSize) {
                        series.symbolSize = 12;
                    }
                }
            });
        }

        return option;
    }

    setLoading(isLoading) {
        this.sendButton.disabled = isLoading;
        this.chatInput.disabled = isLoading;

        // Show/hide chart loading overlay
        const chartLoading = document.getElementById('chart-loading');
        if (chartLoading) {
            chartLoading.style.display = isLoading ? 'flex' : 'none';
        }

        if (isLoading) {
            this.sendButton.innerHTML = '<div class="loading-spinner-small"></div>';
        } else {
            this.sendButton.innerHTML = this.sendButtonIconHTML || 'Generate';
        }
    }

    showError(message) {
        this.errorContainer.innerHTML = `<div class="error-message">${message}</div>`;
    }

    clearError() {
        this.errorContainer.innerHTML = '';
    }
    /**
     * THE "NUCLEAR FIX" APPLIER
     * Adapts user's robust logic to the existing class structure.
     */
    applyNuclearFixes(option) {
        if (!option.series || option.series.length === 0) return option;

        const mainSeries = option.series[0];
        const isScatterOrBubble = mainSeries.type === 'scatter' || mainSeries.type === 'bubble' || mainSeries.type === 'effectScatter';

        if (isScatterOrBubble) {
            console.log("⚡ Applying Scatter/Bubble Nuclear Patches...");

            // FIX A: Prevent "Giant Bubbles" (Scaling)
            // We force a sensible size function if one exists or if it's a bubble chart
            if (mainSeries.type === 'bubble' || (mainSeries.symbolSize && typeof mainSeries.symbolSize === 'function')) {
                mainSeries.symbolSize = function (data) {
                    // Start with a safe base
                    let val = 0;
                    // data is usually [x, y, size] or just [x, y]
                    if (Array.isArray(data) && data.length > 2) {
                        val = data[2];
                    }

                    if (!val || isNaN(val)) return 15; // Safe default base

                    // Simple log scaling to handle massive range differences without "giant bubbles"
                    // Log(val) grows much slower. 
                    // We assume values are positive.
                    const safeVal = Math.max(1, Math.abs(val));
                    const logSize = Math.log(safeVal) * 5;

                    // Cap it safely between 10 and 60
                    return Math.min(Math.max(logSize, 10), 60);
                };
            }

            // FIX B: Force Quadrants (The "MarkLine")
            // We blindly overwrite any existing markLine to guarantee it shows up.
            // Swithing back to `valueIndex` as it is safer for default scatter plots (dim 0 = x, dim 1 = y)
            mainSeries.markLine = {
                silent: true,
                symbol: ['none', 'none'],
                label: { show: false },
                animation: false, // No animation ensures immediate render
                lineStyle: { type: 'solid', color: '#000000', width: 2 }, // Force Black Solid
                data: [
                    { type: 'average', valueIndex: 0, name: 'Avg X' }, // Vertical
                    { type: 'average', valueIndex: 1, name: 'Avg Y' }  // Horizontal
                ]
            };

            console.log("✅ Quadrants Forced");
        }

        return option;
    }

    renderChart(configOrOption, data, isResize = false) {
        try {
            console.log("🔄 renderChart called");

            // Unpack config if it's the backend response wrapper
            let echartOption = configOrOption;
            let dataMapping = null;

            if (configOrOption && configOrOption.echartOption) {
                console.log("📦 Unpacking echartOption from config wrapper");
                echartOption = configOrOption.echartOption;
                dataMapping = configOrOption.dataMapping;

                // Sync top-level title if wrapper has explanation but option doesn't have title
                // or just rely on what's in echartOption.
            }

            // HISTORY MANAGEMENT (Restore Time Travel)
            // Treat 'isResize' as 'skipHistory' to avoid duplicates on resize or restore
            if (!isResize) {
                // 1. Push to History
                this.chartHistory.push({
                    config: JSON.parse(JSON.stringify(configOrOption)), // Deep copy
                    data: data ? JSON.parse(JSON.stringify(data)) : null,
                    timestamp: new Date()
                });

                // 2. Update Previous Assistant Message to be Clickable
                const historyIndex = this.chartHistory.length - 1;
                const assistantMessages = this.chatMessages.querySelectorAll('.message.assistant');
                if (assistantMessages.length > 0) {
                    const lastAssistantMsg = assistantMessages[assistantMessages.length - 1];
                    // Only attach if not already attached
                    if (!lastAssistantMsg.dataset.historyIndex) {
                        lastAssistantMsg.classList.add('clickable');
                        lastAssistantMsg.dataset.historyIndex = historyIndex;
                        lastAssistantMsg.onclick = () => this.restoreHistoryState(historyIndex);

                        // Add active class to show it's currently selected
                        this.clearActiveMessages();
                        lastAssistantMsg.classList.add('active');
                    }
                }
            }

            // Update Chart Title (Missing in new renderChart)
            // Need to check both the wrapper 'configOrOption.title' and 'echartOption.title'
            let titleText = '';
            if (configOrOption && configOrOption.title) {
                titleText = configOrOption.title;
            } else if (echartOption && echartOption.title && echartOption.title.text) {
                titleText = echartOption.title.text;
            }

            if (titleText && this.chartTitle) {
                this.chartTitle.textContent = titleText;
            }

            // Initialize chart if it doesn't exist
            if (!this.chart) {
                this.chart = echarts.init(this.chartElement);
                window.addEventListener('resize', () => this.chart.resize());

                // RESTORED: Click-to-Context (Drill Down) Listener
                this.chart.on('click', (params) => this.handleChartClick(params));
            }

            if (!this.chart) return;

            // SAFETY: Sanitize option structure
            let option = echartOption;
            // Ensure option is an object
            if (!option) {
                console.error("❌ echartOption is null/undefined after unpacking");
                return;
            }

            if (option.title && typeof option.title === 'string') option.title = { text: option.title };
            if (option.xAxis && typeof option.xAxis === 'string') option.xAxis = { data: [] };
            if (option.yAxis && typeof option.yAxis === 'string') option.yAxis = {};

            // If data is provided, inject it
            if (data) {
                console.log(`💉 Injecting data (${data.length} rows)`);
                // Pass dataMapping if we have it
                option = this.injectData(option, data, dataMapping);
            }

            // DEBUG: Check what we are about to render
            if (option.series && option.series[0]) {
                console.log("📊 First Series Data Length:", option.series[0].data ? option.series[0].data.length : 0);
                console.log("📊 First Series Type:", option.series[0].type);
                if (option.series[0].data && option.series[0].data.length > 0) {
                    console.log("Example Point:", option.series[0].data[0]);
                }
            } else {
                console.warn("⚠️ No series found in option!");
            }

            // Apply Premium Styling (Fonts, Colors, Shadows)
            option = this.applyPremiumStyles(option);

            // Apply "Nuclear Fixes" (Quadrants, Scaling)
            option = this.applyNuclearFixes(option);

            // Render
            console.log("🖌️ Calling setOption...");
            this.chart.setOption(option, { notMerge: true });
            console.log("✅ setOption complete");

            // Save state
            this.lastChartConfig = configOrOption; // Save original wrapper for history consistency
            this.lastChartData = data;

            this.setLoading(false);
        } catch (error) {
            console.error("CRITICAL RENDER ERROR:", error);
            if (this.showError) {
                this.showError(`Chart render failed: ${error.message}`);
            }
            this.setLoading(false);
        }
    }



}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.hilaApp = new HilaApp();
});
