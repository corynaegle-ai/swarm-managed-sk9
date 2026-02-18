// Main JavaScript entry point
// Application state and initialization

// Application state
const AppState = {
    initialized: false,
    version: '1.0.0',
    debug: true
};

// Logger utility
const Logger = {
    log: (message, data = null) => {
        if (AppState.debug) {
            console.log(`[App]: ${message}`, data || '');
        }
    },
    error: (message, error = null) => {
        console.error(`[App Error]: ${message}`, error || '');
    }
};

// DOM utility functions
const DOM = {
    ready: (callback) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    },
    getElementById: (id) => document.getElementById(id),
    querySelector: (selector) => document.querySelector(selector),
    querySelectorAll: (selector) => document.querySelectorAll(selector)
};

// Application initialization
const App = {
    init: () => {
        try {
            Logger.log('Initializing application...');
            
            // Verify DOM elements exist
            const appContainer = DOM.getElementById('app');
            const contentContainer = DOM.getElementById('content');
            
            if (!appContainer || !contentContainer) {
                throw new Error('Required DOM elements not found');
            }
            
            // Set initialized state
            AppState.initialized = true;
            
            Logger.log('Application initialized successfully', {
                version: AppState.version,
                timestamp: new Date().toISOString()
            });
            
            // Ready for other modules to extend functionality
            App.onReady();
            
        } catch (error) {
            Logger.error('Failed to initialize application', error);
            AppState.initialized = false;
        }
    },
    
    onReady: () => {
        Logger.log('Application ready for extensions');
        // Hook for other tickets to add functionality
    },
    
    getState: () => ({ ...AppState })
};

// Initialize when DOM is ready
DOM.ready(() => {
    App.init();
});

// Export for other modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, AppState, Logger, DOM };
}