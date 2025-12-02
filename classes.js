/**
 * classes.js
 * Contains class definitions for form management with functional programming principles
 */

/**
 * Pure function: Convert FormData entries to object using reduce
 * @param {FormData} formData - FormData object
 * @returns {object} - Form data as object
 */
const formDataToObject = (formData) =>
  Array.from(formData.entries()).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

/**
 * Pure function: Get all invalid fields
 * @param {HTMLFormElement} form - The form element
 * @returns {Array} - Array of invalid fields
 */
const getInvalidFields = (form) =>
  form ? Array.from(form.querySelectorAll(":invalid")) : [];

/**
 * Pure function: Get classes to remove based on current state
 * @param {DOMTokenList} classList - The class list
 * @param {Array} classesToRemove - Classes to remove
 * @returns {Array} - Filtered classes that exist
 */
const getClassesToRemove = (classList, classesToRemove) =>
  classesToRemove.filter((cls) => classList.contains(cls));

/**
 * FormHandler class - Manages form submission and validation
 */
export class FormHandler {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    this.resultElement = null;
    this.isSubmitting = false;
  }

  /**
   * Set the result display element
   * @param {HTMLElement} element - Element to display results
   */
  setResultElement(element) {
    this.resultElement = element;
  }

  /**
   * Get the form element
   */
  getForm() {
    return this.form;
  }

  /**
   * Check if form is valid
   */
  isValid() {
    return this.form && this.form.checkValidity();
  }

  /**
   * Reset form to initial state
   */
  reset() {
    if (this.form) {
      this.form.reset();
      this.form.classList.remove("was-validated");
    }
  }

  /**
   * Add validation visual class
   */
  addValidationClass() {
    if (this.form) {
      this.form.classList.add("was-validated");
    }
  }

  /**
   * Focus on first invalid field using find()
   */
  focusInvalidField() {
    const invalidField = getInvalidFields(this.form).find((field) => field);
    if (invalidField) {
      invalidField.focus();
    }
  }

  /**
   * Get form data as object using reduce
   */
  getFormData() {
    const formData = new FormData(this.form);
    return formDataToObject(formData);
  }

  /**
   * Get all form inputs
   * @returns {Array} - Array of form input elements
   */
  getInputs() {
    return this.form ? Array.from(this.form.querySelectorAll("input")) : [];
  }

  /**
   * Validate multiple fields and return results using map
   * @returns {Array} - Array of validation results
   */
  validateAllFields() {
    return this.getInputs().map((input) => ({
      name: input.name,
      value: input.value,
      valid: input.checkValidity(),
      error: input.validationMessage
    }));
  }

  /**
   * Find first invalid input using find
   * @returns {object|null} - First invalid input info or null
   */
  findFirstInvalidInput() {
    const validationResults = this.validateAllFields();
    return validationResults.find((result) => !result.valid) || null;
  }
}

/**
 * Pure function: Update element classes based on status
 * @param {DOMTokenList} classList - The class list to update
 * @param {object} classConfig - Configuration of classes to add/remove
 * @returns {object} - Config object (for chaining or documentation)
 */
const updateElementClasses = (classList, classConfig) => {
  const { toRemove = [], toAdd = [] } = classConfig;
  toRemove.forEach((cls) => classList.remove(cls));
  toAdd.forEach((cls) => classList.add(cls));
  return classConfig;
};

/**
 * Pure function: Get CSS class configuration based on status
 * @param {string} status - Status type: 'loading', 'success', or 'error'
 * @returns {object} - Classes configuration object
 */
const getClassConfig = (status) => {
  const classConfigs = {
    loading: {
      toRemove: ["text-green-500", "text-red-500"],
      toAdd: ["text-gray-500"]
    },
    success: {
      toRemove: ["text-gray-500", "text-red-500"],
      toAdd: ["text-green-500"]
    },
    error: {
      toRemove: ["text-gray-500", "text-green-500"],
      toAdd: ["text-red-500"]
    }
  };
  return classConfigs[status] || classConfigs.error;
};

/**
 * Pure function: Create message object
 * @param {string} content - Message content
 * @param {string} status - Message status
 * @returns {object} - Message object
 */
const createMessage = (content, status) => ({
  content,
  status,
  timestamp: new Date().getTime()
});

/**
 * ResponseHandler class - Manages API response display with functional methods
 */
export class ResponseHandler {
  constructor(resultElementId) {
    this.resultElement = document.getElementById(resultElementId);
    this.messageHistory = [];
  }

  /**
   * Display message with status using pure function
   * @param {string} message - Message to display
   * @param {string} status - Status: 'loading', 'success', or 'error'
   */
  displayMessage(message, status) {
    if (!this.resultElement) return;

    const messageObj = createMessage(message, status);
    this.messageHistory = [...this.messageHistory, messageObj];

    this.resultElement.innerHTML = message;
    this.resultElement.style.display = "block";

    const classConfig = getClassConfig(status);
    updateElementClasses(this.resultElement.classList, classConfig);
  }

  /**
   * Display loading message
   */
  showLoading() {
    this.displayMessage("Please wait...", "loading");
  }

  /**
   * Display success message
   * @param {string} message - Success message
   */
  showSuccess(message) {
    this.displayMessage(message, "success");
  }

  /**
   * Display error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.displayMessage(message, "error");
  }

  /**
   * Get message history filtered by status using filter and map
   * @param {string} status - Filter by status
   * @returns {Array} - Filtered messages
   */
  getMessageHistory(status) {
    return this.messageHistory
      .filter((msg) => !status || msg.status === status)
      .map((msg) => msg.content);
  }

  /**
   * Get last message using find with reverse logic
   * @returns {object|null} - Last message or null
   */
  getLastMessage() {
    return this.messageHistory.length > 0
      ? this.messageHistory[this.messageHistory.length - 1]
      : null;
  }

  /**
   * Hide result message after delay
   * @param {number} delay - Delay in milliseconds
   */
  hideAfter(delay = 5000) {
    setTimeout(() => {
      if (this.resultElement) {
        this.resultElement.style.display = "none";
      }
    }, delay);
  }
}
