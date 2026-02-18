// Import validation functions from validation.js
// Real-time input validation implementation

class GameFormValidator {
    constructor() {
        this.formErrors = new Map(); // Track errors per form
        this.initializeValidation();
    }

    initializeValidation() {
        // Get all forms and inputs
        const forms = document.querySelectorAll('form');
        const inputs = document.querySelectorAll('input');

        // Initialize form error tracking
        forms.forEach(form => {
            this.formErrors.set(form.id, new Set());
        });

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
        const form = input.closest('form');
        
        // Clear previous error state
        this.clearInputError(input, form);
        
        // Validate based on input type and name using validation.js functions
        let validationResult = this.validateInput(inputName, value, input.type);
        
        if (!validationResult.isValid) {
            this.showInputError(input, validationResult.message, form);
        }
        
        // Update form-specific error state
        this.updateFormErrorState(form);
    }

    validateInput(inputName, value, inputType) {
        // Use validation functions from validation.js
        if (!window.ValidationUtils) {
            console.error('ValidationUtils not available');
            return { isValid: true, message: '' };
        }

        switch (inputName) {
            case 'playerName':
                return window.ValidationUtils.validatePlayerName(value, true);
            
            case 'partnerName':
                return window.ValidationUtils.validatePlayerName(value, false);
            
            case 'bidAmount':
                return window.ValidationUtils.validateBidAmount(value);
            
            case 'actualTricks':
                return window.ValidationUtils.validateTricksAmount(value);
            
            case 'bonusPoints':
                return window.ValidationUtils.validateBonusPoints(value);
            
            case 'bonusReason':
                return window.ValidationUtils.validateBonusReason(value);
            
            default:
                return { isValid: true, message: '' };
        }
    }

    showInputError(input, message, form) {
        // Add invalid class to input
        input.classList.add('invalid');
        
        // Show error message
        const errorElement = document.getElementById(`${input.id}-error`) || 
                           document.getElementById(`${input.name}-error`);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }

        // Add error to form-specific error tracking
        if (form && this.formErrors.has(form.id)) {
            this.formErrors.get(form.id).add(input.id || input.name);
        }
    }

    clearInputError(input, form) {
        // Remove invalid class from input
        input.classList.remove('invalid');
        
        // Hide error message
        const errorElement = document.getElementById(`${input.id}-error`) || 
                           document.getElementById(`${input.name}-error`);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }

        // Remove error from form-specific error tracking
        if (form && this.formErrors.has(form.id)) {
            this.formErrors.get(form.id).delete(input.id || input.name);
        }
    }

    updateFormErrorState(form) {
        if (!form || !this.formErrors.has(form.id)) return;

        // Check if this form has any errors
        const formHasErrors = this.formErrors.get(form.id).size > 0;
        
        // Update submit button state for this form only
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = formHasErrors;
        }
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
                this.showInputError(input, validationResult.message, form);
                formHasErrors = true;
            } else {
                this.clearInputError(input, form);
            }
        });
        
        // Update form error state
        this.updateFormErrorState(form);
        
        // Prevent submission if THIS form has errors
        if (formHasErrors || (this.formErrors.has(form.id) && this.formErrors.get(form.id).size > 0)) {
            event.preventDefault();
            console.log(`Form ${form.id} submission prevented due to validation errors`);
            return false;
        }
        
        // Allow form submission
        console.log(`Form ${form.id} validation passed, allowing submission`);
        return true;
    }
}

// Initialize validation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GameFormValidator();
    console.log('Real-time form validation initialized');
});