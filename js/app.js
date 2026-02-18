// Import validation functions (assumed to be available globally from validation.js)
// Real-time input validation implementation

class GameFormValidator {
    constructor() {
        this.hasErrors = false;
        this.initializeValidation();
    }

    initializeValidation() {
        // Get all forms and inputs
        const forms = document.querySelectorAll('form');
        const inputs = document.querySelectorAll('input');

        // Add event listeners to all inputs
        inputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleInputValidation(e));
            input.addEventListener('blur', (e) => this.handleInputValidation(e));
        });

        // Add form submission handlers
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleFormSubmission(e));
        });
    }

    handleInputValidation(event) {
        const input = event.target;
        const inputName = input.name || input.id;
        const value = input.value.trim();
        
        // Clear previous error state
        this.clearInputError(input);
        
        // Validate based on input type and name
        let validationResult = this.validateInput(inputName, value, input.type);
        
        if (!validationResult.isValid) {
            this.showInputError(input, validationResult.message);
        }
        
        // Update global error state
        this.updateGlobalErrorState();
    }

    validateInput(inputName, value, inputType) {
        // Use validation functions if available, otherwise use built-in validation
        switch (inputName) {
            case 'playerName':
            case 'partnerName':
                return this.validateName(value, inputName === 'playerName');
            
            case 'bidAmount':
                return this.validateBidAmount(value);
            
            case 'actualTricks':
                return this.validateTricks(value);
            
            case 'bonusPoints':
                return this.validateBonusPoints(value);
            
            case 'bonusReason':
                return this.validateBonusReason(value);
            
            default:
                return { isValid: true, message: '' };
        }
    }

    validateName(value, required = false) {
        if (required && (!value || value.length === 0)) {
            return { isValid: false, message: 'Player name is required' };
        }
        
        if (value && value.length > 0 && value.length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters' };
        }
        
        if (value && value.length > 50) {
            return { isValid: false, message: 'Name must be less than 50 characters' };
        }
        
        if (value && !/^[a-zA-Z\s]+$/.test(value)) {
            return { isValid: false, message: 'Name can only contain letters and spaces' };
        }
        
        return { isValid: true, message: '' };
    }

    validateBidAmount(value) {
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
    }

    validateTricks(value) {
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
    }

    validateBonusPoints(value) {
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
    }

    validateBonusReason(value) {
        if (value && value.length > 100) {
            return { isValid: false, message: 'Bonus reason must be less than 100 characters' };
        }
        
        return { isValid: true, message: '' };
    }

    showInputError(input, message) {
        // Add invalid class to input
        input.classList.add('invalid');
        
        // Show error message
        const errorElement = document.getElementById(`${input.id}-error`) || 
                           document.getElementById(`${input.name}-error`);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    clearInputError(input) {
        // Remove invalid class from input
        input.classList.remove('invalid');
        
        // Hide error message
        const errorElement = document.getElementById(`${input.id}-error`) || 
                           document.getElementById(`${input.name}-error`);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }

    updateGlobalErrorState() {
        // Check if any inputs have errors
        const invalidInputs = document.querySelectorAll('input.invalid');
        this.hasErrors = invalidInputs.length > 0;
        
        // Update submit button states
        const submitButtons = document.querySelectorAll('button[type="submit"]');
        submitButtons.forEach(button => {
            button.disabled = this.hasErrors;
        });
    }

    handleFormSubmission(event) {
        const form = event.target;
        const inputs = form.querySelectorAll('input');
        
        // Validate all inputs in the form
        let formHasErrors = false;
        inputs.forEach(input => {
            const inputName = input.name || input.id;
            const value = input.value.trim();
            const validationResult = this.validateInput(inputName, value, input.type);
            
            if (!validationResult.isValid) {
                this.showInputError(input, validationResult.message);
                formHasErrors = true;
            } else {
                this.clearInputError(input);
            }
        });
        
        // Prevent submission if there are errors
        if (formHasErrors || this.hasErrors) {
            event.preventDefault();
            console.log('Form submission prevented due to validation errors');
            return false;
        }
        
        // Allow form submission
        console.log('Form validation passed, allowing submission');
        return true;
    }
}

// Initialize validation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GameFormValidator();
    console.log('Real-time form validation initialized');
});