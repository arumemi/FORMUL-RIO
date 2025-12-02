/**
 * app.js
 * Main application entry point - Orchestrates form handling
 */

import { FormHandler, ResponseHandler } from "./classes.js";
import { handleFormSubmit } from "./utils.js";

/**
 * Initialize the application
 */
function initializeApp() {
  "use strict";

  // Configuration
  const CONFIG = {
    formSelector: ".contact-form",
    resultElementId: "password", // Note: Consider renaming this to "result" in HTML
    apiUrl: "https://api.web3forms.com/submit"
  };

  // Initialize handlers
  const formHandler = new FormHandler(CONFIG.formSelector);
  const responseHandler = new ResponseHandler(CONFIG.resultElementId);

  // Check if form exists
  if (!formHandler.getForm()) {
    console.error("Form not found with selector:", CONFIG.formSelector);
    return;
  }

  // Attach form submission event
  formHandler.getForm().addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await handleFormSubmit(formHandler, responseHandler, CONFIG.apiUrl);
    } catch (error) {
      console.error("Submission error:", error);
      responseHandler.showError("An unexpected error occurred");
      responseHandler.hideAfter(5000);
    }
  });

  console.log("Application initialized successfully");
}

// Initialize app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
