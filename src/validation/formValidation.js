/**
 * Form validation utilities for preventing form submission with invalid data
 * Integrates with InputValidator for comprehensive validation
 */

import InputValidator from './inputValidator.js';

class FormValidation {
  constructor(formElement) {
    this.form = formElement;
    this.validator = new InputValidator();
    this.errorContainer = null;
    this.setupErrorContainer();
    this.bindEvents();
  }

  /**
   * Set up error display container
   */
  setupErrorContainer() {
    // Look for existing error container or create one
    this.errorContainer = this.form.querySelector('.validation-errors');
    
    if (!this.errorContainer) {
      this.errorContainer = document.createElement('div');
      this.errorContainer.className = 'validation-errors';
      this.errorContainer.style.cssText = `
        background-color: #fee;
        border: 1px solid #fcc;
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 15px;
        display: none;
      `;
      this.form.insertBefore(this.errorContainer, this.form.firstChild);
    }
  }

  /**
   * Bind form events
   */
  bindEvents() {
    // Prevent form submission if validation fails
    this.form.addEventListener('submit', (event) => {
      if (!this.validateForm()) {
        event.preventDefault();
        event.stopPropagation();
        this.displayErrors();
        return false;
      }
      this.clearErrorDisplay();
    });

    // Real-time validation on input change
    this.form.addEventListener('input', (event) => {
      this.validateField(event.target);
    });

    this.form.addEventListener('change', (event) => {
      this.validateField(event.target);
    });
  }

  /**
   * Validate individual field
   */
  validateField(field) {
    const fieldName = field.getAttribute('data-field-name') || field.name || 'Field';
    const fieldType = field.getAttribute('data-validation-type');
    
    this.validator.clearErrors();
    let isValid = true;

    switch (fieldType) {
      case 'player-name':
        isValid = this.validator.validatePlayerName(field.value, fieldName);
        break;
        
      case 'bid':
        const handsAvailable = parseInt(field.getAttribute('data-hands-available')) || 13;
        isValid = this.validator.validateBid(field.value, handsAvailable, fieldName);
        break;
        
      case 'tricks':
        const handsForTricks = parseInt(field.getAttribute('data-hands-available')) || 13;
        isValid = this.validator.validateTricksTaken(field.value, handsForTricks, fieldName);
        break;
        
      case 'bonus-points':
        if (field.value !== '') {
          isValid = this.validator.validateBonusPoints(field.value, fieldName);
        }
        break;
    }

    // Update field styling
    this.updateFieldStyling(field, isValid);

    return isValid;
  }

  /**
   * Update field styling based on validation status
   */
  updateFieldStyling(field, isValid) {
    field.classList.remove('validation-error', 'validation-success');
    
    if (field.value.trim() !== '') {
      field.classList.add(isValid ? 'validation-success' : 'validation-error');
    }

    // Add CSS if not already present
    if (!document.querySelector('#validation-styles')) {
      const style = document.createElement('style');
      style.id = 'validation-styles';
      style.textContent = `
        .validation-error {
          border-color: #dc3545 !important;
          background-color: #fff5f5;
        }
        .validation-success {
          border-color: #28a745 !important;
          background-color: #f8fff8;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Validate entire form
   */
  validateForm() {
    this.validator.clearErrors();
    
    // Get hands available for this round
    const handsAvailableElement = this.form.querySelector('[data-hands-available]');
    const handsAvailable = handsAvailableElement ? 
      parseInt(handsAvailableElement.getAttribute('data-hands-available')) : 13;

    // Collect form data
    const formData = {
      playerNames: [],
      bids: [],
      tricksTaken: [],
      bonusPoints: []
    };

    // Collect player names
    const nameFields = this.form.querySelectorAll('[data-validation-type="player-name"]');
    nameFields.forEach(field => {
      formData.playerNames.push(field.value);
    });

    // Collect bids
    const bidFields = this.form.querySelectorAll('[data-validation-type="bid"]');
    bidFields.forEach(field => {
      formData.bids.push(field.value);
    });

    // Collect tricks taken
    const tricksFields = this.form.querySelectorAll('[data-validation-type="tricks"]');
    tricksFields.forEach(field => {
      formData.tricksTaken.push(field.value);
    });

    // Collect bonus points
    const bonusFields = this.form.querySelectorAll('[data-validation-type="bonus-points"]');
    bonusFields.forEach(field => {
      formData.bonusPoints.push(field.value);
    });

    // Validate collected data
    const isValid = this.validator.validateRoundData(formData, handsAvailable);

    // Update field styling for all fields
    this.form.querySelectorAll('input, select').forEach(field => {
      if (field.getAttribute('data-validation-type')) {
        this.validateField(field);
      }
    });

    return isValid;
  }

  /**
   * Display validation errors
   */
  displayErrors() {
    const errors = this.validator.getErrors();
    
    if (errors.length > 0) {
      this.errorContainer.innerHTML = `
        <h4 style="margin-top: 0; color: #721c24;">Please fix the following errors:</h4>
        <ul style="margin-bottom: 0; color: #721c24;">
          ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
      `;
      this.errorContainer.style.display = 'block';
      
      // Scroll to error container
      this.errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      this.clearErrorDisplay();
    }
  }

  /**
   * Clear error display
   */
  clearErrorDisplay() {
    this.errorContainer.style.display = 'none';
    this.errorContainer.innerHTML = '';
  }

  /**
   * Get current validation errors
   */
  getValidationErrors() {
    return this.validator.getErrors();
  }

  /**
   * Manually trigger form validation
   */
  validate() {
    const isValid = this.validateForm();
    this.displayErrors();
    return isValid;
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormValidation;
} else if (typeof window !== 'undefined') {
  window.FormValidation = FormValidation;
}

export default FormValidation;