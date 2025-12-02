/**
 * utils.js
 * Pure utility functions with functional programming methods: map(), find(), reduce()
 */

/**
 * Pure function: Validate form fields
 * @param {HTMLFormElement} form - The form to validate
 * @returns {boolean} - True if form is valid
 */
export const validateForm = (form) => !!(form && form.checkValidity());

/**
 * Pure function: Convert FormData to JSON object using reduce
 * @param {FormData} formData - FormData object
 * @returns {object} - JSON object
 */
export const formDataToJSON = (formData) =>
  Array.from(formData.entries()).reduce((acc, [key, value]) => {
    return { ...acc, [key]: value };
  }, {});

/**
 * Pure function: Transform field value (for sanitization/formatting)
 * Used with map to transform multiple fields
 * @param {object} field - Field object with name and value
 * @returns {object} - Transformed field
 */
const transformField = (field) => ({
  ...field,
  value: field.value.trim(),
  isEmpty: field.value.trim().length === 0
});

/**
 * Pure function: Validate single field
 * @param {object} field - Field object
 * @returns {object} - Validation result
 */
const validateField = (field) => ({
  ...field,
  isValid: !field.isEmpty
});

/**
 * Pure function: Filter empty required fields
 * @param {Array} fields - Array of field objects
 * @returns {Array} - Filtered empty required fields
 */
export const findEmptyRequiredFields = (fields) =>
  fields.filter((field) => field.isEmpty && field.required);

/**
 * Pure function: Find first error using find
 * @param {Array} validationResults - Validation results array
 * @returns {object|undefined} - First invalid field
 */
export const findFirstError = (validationResults) =>
  validationResults.find((result) => !result.isValid);

/**
 * Pure function: Transform form data with validation using map
 * @param {object} formData - Raw form data
 * @param {Array} requiredFields - List of required field names
 * @returns {Array} - Transformed and validated fields
 */
export const transformAndValidateFields = (formData, requiredFields = []) =>
  Object.entries(formData)
    .map(([name, value]) => ({
      name,
      value,
      required: requiredFields.includes(name)
    }))
    .map(transformField)
    .map(validateField);

/**
 * Pure function: Create API request payload
 * @param {object} data - Form data
 * @param {string} method - HTTP method
 * @returns {object} - Request payload
 */
const createRequestPayload = (data, method = "POST") => ({
  method,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  },
  body: JSON.stringify(data)
});

/**
 * Pure function: Create response object
 * @param {number} status - HTTP status
 * @param {object} data - Response data
 * @param {Error} error - Optional error
 * @returns {object} - Normalized response
 */
const createResponseObject = (status, data, error = null) => ({
  status,
  success: status === 200,
  message: data?.message || (error ? "Something went wrong!" : "Success"),
  data,
  error
});

/**
 * Submit form data to API with error hand
 * @param {object} data - Form data as object
 * @param {string} url - API endpoint URL
 * @returns {Promise} - Promise with response
 */
export async function submitFormToAPI(data, url) {
  try {
    const payload = createRequestPayload(data);
    const response = await fetch(url, payload);
    const json = await response.json();

    return createResponseObject(response.status, json);
  } catch (error) {
    console.error("API Error:", error);
    return createResponseObject(null, null, error);
  }
}

/**
 * Pure function: Determine if submission should proceed
 * @param {object} formData - Form data
 * @param {Array} requiredFields - Required field names
 * @returns {object} - { shouldProceed: boolean, errors: Array }
 */
export const validateSubmission = (formData, requiredFields = []) => {
  const validationResults = transformAndValidateFields(formData, requiredFields);
  const errors = validationResults.filter((result) => !result.isValid);

  return {
    shouldProceed: errors.length === 0,
    errors: errors.map((err) => err.name),
    validationResults
  };
};

/**
 * Pure function: Create submission workflow steps
 * @param {object} config - Configuration object
 * @returns {Array} - Array of workflow steps
 */
const createWorkflowSteps = (config) => [
  { name: "validate", enabled: config.validate !== false },
  { name: "show-loading", enabled: true },
  { name: "submit", enabled: true },
  { name: "handle-response", enabled: true },
  { name: "reset", enabled: config.reset !== false }
];

/**
 * Handle form submission workflow with pure functions
 * @param {FormHandler} formHandler - FormHandler instance
 * @param {ResponseHandler} responseHandler - ResponseHandler instance
 * @param {string} apiUrl - API endpoint URL
 * @param {object} options - Additional options
 * @returns {Promise} - Promise of submission result
 */
export async function handleFormSubmit(
  formHandler,
  responseHandler,
  apiUrl,
  options = {}
) {
  const { requiredFields = [], resetDelay = 5000 } = options;

  // Validate form
  if (!formHandler.isValid()) {
    formHandler.focusInvalidField();
    formHandler.addValidationClass();
    return false;
  }

  // Show loading state
  responseHandler.showLoading();

  // Get and validate form data
  const formData = formHandler.getFormData();
  const validation = validateSubmission(formData, requiredFields);

  if (!validation.shouldProceed) {
    responseHandler.showError(
      `Missing required fields: ${validation.errors.join(", ")}`
    );
    responseHandler.hideAfter(resetDelay);
    return false;
  }

  // Submit to API
  const result = await submitFormToAPI(formData, apiUrl);

  // Handle response
  if (result.success) {
    responseHandler.showSuccess(result.message);
  } else {
    responseHandler.showError(result.message);
  }

  // Reset form
  formHandler.reset();
  responseHandler.hideAfter(resetDelay);

  return result.success;
}

/**
 * Pure function: Log form submission data (for debugging)
 * @param {object} data - Form data
 * @param {object} metadata - Additional metadata
 * @returns {object} - Logged data (for chaining)
 */
export const logFormData = (data, metadata = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    data,
    metadata
  };
  console.log("Form Submission:", logEntry);
  return logEntry;
};
