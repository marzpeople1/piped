declare namespace Cypress {
    interface Chainable<Subject = any> {
        loginToPortal(): void
    }
}