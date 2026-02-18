/**
 * Test suite for FormValidation class
 */

import FormValidation from '../src/validation/formValidation.js';

// Mock DOM environment
class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.children = [];
    this.classList = new Set();
    this.attributes = new Map();
    this.style = {};
    this.innerHTML = '';
    this.eventListeners = new Map();
  }

  querySelector(selector) {
    // Simple mock implementation
    if (selector === '.validation-errors') {
      return this.children.find(child => child.classList.has('validation-errors'));
    }
    return null;
  }

  querySelectorAll(selector) {
    // Mock implementation for finding elements by selector
    return [];
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  insertBefore(newNode, referenceNode) {
    const index = referenceNode ? this.children.indexOf(referenceNode) : 0;
    this.children.splice(index, 0, newNode);
    return newNode;
  }

  addEventListener(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  getAttribute(name) {
    return this.attributes.get(name);
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  get firstChild() {
    return this.children[0] || null;
  }

  scrollIntoView() {
    // Mock implementation
  }
}

// Mock document
const mockDocument = {
  createElement: (tagName) => new MockElement(tagName),
  head: new MockElement('head'),
  querySelector: () => null
};

global.document = mockDocument;

describe('FormValidation', () => {
  let mockForm;
  let formValidation;

  beforeEach(() => {
    mockForm = new MockElement('form');
    // Mock form methods
    mockForm.querySelector = jest.fn().mockReturnValue(null);
    mockForm.querySelectorAll = jest.fn().mockReturnValue([]);
    
    formValidation = new FormValidation(mockForm);
  });

  describe('Initialization', () => {
    test('should create error container', () => {
      expect(formValidation.errorContainer).toBeTruthy();
      expect(formValidation.errorContainer.className).toBe('validation-errors');
    });

    test('should bind form events', () => {
      expect(mockForm.eventListeners.has('submit')).toBe(true);
      expect(mockForm.eventListeners.has('input')).toBe(true);
      expect(mockForm.eventListeners.has('change')).toBe(true);
    });
  });

  describe('Field Validation', () => {
    test('should validate player name fields', () => {
      const mockField = new MockElement('input');
      mockField.value = 'John Doe';
      mockField.setAttribute('data-validation-type', 'player-name');
      mockField.setAttribute('data-field-name', 'Player 1');
      
      const result = formValidation.validateField(mockField);
      expect(result).toBe(true);
    });

    test('should validate bid fields', () => {
      const mockField = new MockElement('input');
      mockField.value = '5';
      mockField.setAttribute('data-validation-type', 'bid');
      mockField.setAttribute('data-hands-available', '13');
      mockField.setAttribute('data-field-name', 'Bid');
      
      const result = formValidation.validateField(mockField);
      expect(result).toBe(true);
    });

    test('should validate tricks fields', () => {
      const mockField = new MockElement('input');
      mockField.value = '7';
      mockField.setAttribute('data-validation-type', 'tricks');
      mockField.setAttribute('data-hands-available', '13');
      mockField.setAttribute('data-field-name', 'Tricks');
      
      const result = formValidation.validateField(mockField);
      expect(result).toBe(true);
    });

    test('should validate bonus points fields', () => {
      const mockField = new MockElement('input');
      mockField.value = '10';
      mockField.setAttribute('data-validation-type', 'bonus-points');
      mockField.setAttribute('data-field-name', 'Bonus Points');
      
      const result = formValidation.validateField(mockField);
      expect(result).toBe(true);
    });

    test('should handle empty bonus points fields', () => {
      const mockField = new MockElement('input');
      mockField.value = '';
      mockField.setAttribute('data-validation-type', 'bonus-points');
      
      const result = formValidation.validateField(mockField);
      expect(result).toBe(true); // Empty bonus points should be valid
    });
  });

  describe('Form Validation', () => {
    test('should prevent form submission with invalid data', () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };
      
      // Mock invalid form
      jest.spyOn(formValidation, 'validateForm').mockReturnValue(false);
      jest.spyOn(formValidation, 'displayErrors').mockImplementation(() => {});
      
      const submitHandlers = mockForm.eventListeners.get('submit');
      const result = submitHandlers[0](mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test('should allow form submission with valid data', () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };
      
      // Mock valid form
      jest.spyOn(formValidation, 'validateForm').mockReturnValue(true);
      jest.spyOn(formValidation, 'clearErrorDisplay').mockImplementation(() => {});
      
      const submitHandlers = mockForm.eventListeners.get('submit');
      const result = submitHandlers[0](mockEvent);
      
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });
  });

  describe('Error Display', () => {
    test('should display validation errors', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      formValidation.validator.errors = errors;
      
      formValidation.displayErrors();
      
      expect(formValidation.errorContainer.innerHTML).toContain('Please fix the following errors:');
      expect(formValidation.errorContainer.innerHTML).toContain('Error 1');
      expect(formValidation.errorContainer.innerHTML).toContain('Error 2');
      expect(formValidation.errorContainer.innerHTML).toContain('Error 3');
      expect(formValidation.errorContainer.style.display).toBe('block');
    });

    test('should clear error display when no errors', () => {
      formValidation.validator.errors = [];
      
      formValidation.displayErrors();
      
      expect(formValidation.errorContainer.style.display).toBe('none');
      expect(formValidation.errorContainer.innerHTML).toBe('');
    });

    test('should manually trigger validation', () => {
      jest.spyOn(formValidation, 'validateForm').mockReturnValue(true);
      jest.spyOn(formValidation, 'displayErrors').mockImplementation(() => {});
      
      const result = formValidation.validate();
      
      expect(formValidation.validateForm).toHaveBeenCalled();
      expect(formValidation.displayErrors).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    test('should return validation errors', () => {
      const errors = ['Test error'];
      formValidation.validator.errors = errors;
      
      expect(formValidation.getValidationErrors()).toEqual(errors);
    });

    test('should clear error display', () => {
      formValidation.errorContainer.style.display = 'block';
      formValidation.errorContainer.innerHTML = 'Some content';
      
      formValidation.clearErrorDisplay();
      
      expect(formValidation.errorContainer.style.display).toBe('none');
      expect(formValidation.errorContainer.innerHTML).toBe('');
    });
  });
});