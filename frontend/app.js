/**
 * Hila Frontend - Chart rendering and API integration
 * Implements data injection architecture: receives config from backend,
 * injects actual data on the frontend.
 */

const API_BASE_URL = 'http://localhost:8000';

class HilaApp {
    constructor() {
        this.chart = null;
        this.conversationHistory = [];
        this.currentDataset = 'quarterly_financials';
        this.currentData = null;

        this.initializeElements();
        this.attachEventListeners();
        this.loadDatasets();
        this.initTheme(); // Initialize theme
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
        this.themeToggle = document.getElementById('theme-toggle'); // New theme toggle element
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
            this.renderChart(this.lastChartConfig, this.lastChartData);
        }
    }

    async handleSendMessage() {
        const query = this.chatInput.value.trim();
        if (!query) return;

        // Add user message to chat
        this.addMessage('user', query);
        this.chatInput.value = '';

        // Show loading state
        this.setLoading(true);
        this.clearError();

        try {
            const response = await fetch(`${API_BASE_URL}/api/generate-chart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
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

                // Add assistant message
                this.addMessage('assistant', result.config.explanation || 'Chart generated successfully');

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

    addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const labelDiv = document.createElement('div');
        labelDiv.className = 'message-label';
        labelDiv.textContent = role === 'user' ? 'You' : 'Hila';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

        messageDiv.appendChild(labelDiv);
        messageDiv.appendChild(contentDiv);

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    renderChart(config, data) {
        // Save state for theme toggling
        this.lastChartConfig = config;
        this.lastChartData = data;

        // Hide empty state, show chart
        this.emptyState.style.display = 'none';
        this.chartContainer.style.display = 'block';

        // Update chart title
        this.chartTitle.textContent = config.title || 'Financial Chart';

        // Initialize chart if needed
        if (!this.chart) {
            this.chart = echarts.init(this.chartElement);
        }

        // Inject data into configuration
        let chartOption = this.injectData(config.echartOption, data, config.dataMapping);

        // Apply Premium UI Overrides
        chartOption = this.applyPremiumStyles(chartOption);

        // Render chart
        this.chart.setOption(chartOption, true);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.chart.resize();
        });
    }

    injectData(echartOption, data, dataMapping) {
        /**
         * CRITICAL DATA INJECTION LOGIC
         * This is where we inject actual financial data into the LLM-generated config.
         * The LLM only saw the schema, never the actual values.
         */
        const option = JSON.parse(JSON.stringify(echartOption)); // Deep clone

        // Inject xAxis data
        if (option.xAxis && option.xAxis.data && option.xAxis.data.dataField) {
            const field = option.xAxis.data.dataField;
            option.xAxis.data = data.map(row => row[field]);
        }

        // Inject series data
        if (option.series && Array.isArray(option.series)) {
            option.series = option.series.map(series => {
                if (series.data && series.data.dataField) {
                    const field = series.data.dataField;
                    series.data = data.map(row => row[field]);
                }
                return series;
            });
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

        return option;
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

        // Premium Grid (Clean, less noise)
        option.grid = {
            ...option.grid,
            top: 40,
            right: 30,
            bottom: 30,
            left: 50,
            containLabel: true,
            borderColor: borderColor,
            show: false // No outer border
        };

        // Premium Tooltip (Shadows, blur)
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

        return option;
    }

    setLoading(isLoading) {
        this.sendButton.disabled = isLoading;
        this.chatInput.disabled = isLoading;

        if (isLoading) {
            this.sendButton.innerHTML = '<span class="loading"><span class="loading-spinner"></span> Generating...</span>';
        } else {
            this.sendButton.innerHTML = 'Generate';
        }
    }

    showError(message) {
        this.errorContainer.innerHTML = `<div class="error-message">${message}</div>`;
    }

    clearError() {
        this.errorContainer.innerHTML = '';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.hilaApp = new HilaApp();
});
