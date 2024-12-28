const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // Configure your E2E tests here
    specPattern: "cypress/e2e/**/*.{cy,spec}.{js,ts}",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'https://app.pipedrive.com/auth/login',
  },
});
