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
        this.themeToggle = document.getElementById('theme-toggle'); // New theme toggle element

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
                        this.addMessage('assistant', assistantMsg.content);
                    }
                }

                // Render the chart
                this.renderChart(result.config, result.data);
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

        // Helper to update title
        if (config.title && this.chartTitle) {
            this.chartTitle.textContent = config.title;
        }

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

        // Robust resize handling for flex container
        if (!this.resizeObserver) {
            this.resizeObserver = new ResizeObserver(() => {
                this.chart && this.chart.resize();
            });
            this.resizeObserver.observe(this.chartContainer);
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
            if (option.tooltip && option.tooltip.formatter) {
                // Remove restrictive formatters - let ECharts use its default multi-series tooltip
                if (typeof option.tooltip.formatter === 'string' &&
                    (option.tooltip.formatter.includes('{b0}') || option.tooltip.formatter.includes('{c0}'))) {
                    delete option.tooltip.formatter;
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
                        if (series.type === 'scatter' || series.type === 'effectScatter' || series.type === 'heatmap') {
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
                const firstSeries = option.series[0];
                if (firstSeries.type === 'scatter' || firstSeries.type === 'effectScatter') {
                    option.series = option.series.map(series => {
                        // Handle both formats: {dataField: [...]} or [{dataField: [...]}]
                        let dataFieldObj = series.data;
                        if (Array.isArray(series.data) && series.data.length > 0 && series.data[0].dataField) {
                            dataFieldObj = series.data[0];
                        }

                        if (dataFieldObj && dataFieldObj.dataField) {
                            const fields = dataFieldObj.dataField;

                            // If dataField is an array of column names [x, y] or [x, y, size]
                            if (Array.isArray(fields)) {
                                console.log('Scatter/bubble chart fields:', fields);

                                // Check if we have enough dimensions for a scatter plot
                                if (fields.length < 2) {
                                    console.warn(`Scatter chart needs at least 2 dimensions, got ${fields.length}. Adding row index as x-axis.`);
                                    // Fallback: use row index as x-axis and the single field as y-axis
                                    series.data = filteredData.map((row, index) => {
                                        const value = row[fields[0]];
                                        const numValue = typeof value === 'string' ? parseFloat(value) : value;
                                        return [index, numValue];
                                    });
                                } else {
                                    // Normal case: 2 or 3 dimensions
                                    series.data = filteredData.map(row => {
                                        // Parse values to numbers (data comes as strings from CSV)
                                        const point = fields.map(field => {
                                            const value = row[field];
                                            const numValue = typeof value === 'string' ? parseFloat(value) : value;
                                            return numValue;
                                        });
                                        return point;
                                    });
                                }

                                console.log('Scatter/bubble data points:', series.data.length);
                                console.log('Sample point:', series.data[0]);

                                // Validate data - filter out invalid points
                                series.data = series.data.filter(point => {
                                    return Array.isArray(point) && point.length >= 2 && point.every(val => !isNaN(val) && val !== null && val !== undefined);
                                });

                                if (series.data.length === 0) {
                                    console.warn('No valid scatter/bubble data points after filtering');
                                }

                                // For bubble charts (3 dimensions), add symbolSize function
                                if (fields.length === 3 && !series.symbolSize && series.data.length > 0) {
                                    // Use the third dimension (size) to scale bubble size
                                    const sizeValues = series.data.map(point => point[2]);
                                    const maxSize = Math.max(...sizeValues);
                                    const minSize = Math.min(...sizeValues);

                                    console.log('Bubble size range:', minSize, 'to', maxSize);

                                    series.symbolSize = function (data) {
                                        // Scale between 10 and 60 pixels based on size value
                                        const normalized = (data[2] - minSize) / (maxSize - minSize);
                                        return 10 + normalized * 50;
                                    };
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
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.hilaApp = new HilaApp();
});
