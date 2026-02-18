// Validation functions for game forms

// Export validation functions to global scope for browser compatibility
window.ValidationUtils = {
    validatePlayerName: function(name, required = false) {
        if (required && (!name || name.trim().length === 0)) {
            return { isValid: false, message: 'Player name is required' };
        }
        
        if (name && name.trim().length > 0 && name.trim().length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters' };
        }
        
        if (name && name.trim().length > 50) {
            return { isValid: false, message: 'Name must be less than 50 characters' };
        }
        
        if (name && !/^[a-zA-Z\s]+$/.test(name.trim())) {
            return { isValid: false, message: 'Name can only contain letters and spaces' };
        }
        
        return { isValid: true, message: '' };
    },

    validateBidAmount: function(value) {
        if (!value && value !== '0') {
            return { isValid: false, message: 'Bid amount is required' };
        }
        
        const numValue = parseInt(value);
        if (isNaN(numValue)) {
            return { isValid: false, message: 'Bid amount must be a number' };
        }
        
        if (numValue < 0) {
            return { isValid: false, message: 'Bid amount cannot be negative' };
        }
        
        if (numValue > 13) {
            return { isValid: false, message: 'Bid amount cannot exceed 13' };
        }
        
        return { isValid: true, message: '' };
    },

    validateTricksAmount: function(value) {
        if (!value && value !== '0') {
            return { isValid: false, message: 'Number of tricks is required' };
        }
        
        const numValue = parseInt(value);
        if (isNaN(numValue)) {
            return { isValid: false, message: 'Tricks must be a number' };
        }
        
        if (numValue < 0) {
            return { isValid: false, message: 'Tricks cannot be negative' };
        }
        
        if (numValue > 13) {
            return { isValid: false, message: 'Tricks cannot exceed 13' };
        }
        
        return { isValid: true, message: '' };
    },

    validateBonusPoints: function(value) {
        if (!value || value === '') {
            return { isValid: true, message: '' }; // Bonus points are optional
        }
        
        const numValue = parseInt(value);
        if (isNaN(numValue)) {
            return { isValid: false, message: 'Bonus points must be a number' };
        }
        
        if (numValue < -100) {
            return { isValid: false, message: 'Bonus points cannot be less than -100' };
        }
        
        if (numValue > 100) {
            return { isValid: false, message: 'Bonus points cannot exceed 100' };
        }
        
        return { isValid: true, message: '' };
    },

    validateBonusReason: function(value) {
        if (value && value.length > 100) {
            return { isValid: false, message: 'Bonus reason must be less than 100 characters' };
        }
        
        return { isValid: true, message: '' };
    }
};