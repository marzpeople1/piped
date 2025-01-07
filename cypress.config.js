const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // Configure your E2E tests here
    specPattern: "cypress/e2e/**/*.{cy,spec}.{js,ts}",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // defaultCommandTimeout: 6000,
    // pageLoadTimeout: 70000,
    baseUrl: 'https://app.pipedrive.com/auth/login',
    video: true,
    screenshotOnRunFailure: true
  },
});
