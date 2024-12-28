// import {authApi} from "../../support/auth";

describe("Add person automation", () => {

    beforeEach("", () => {
        // Suppresses xhr/fetch logs
        cy.intercept({ resourceType: /xhr|fetch/ }, { log: false })
        // cy.intercept('GET', '**/auth/*')

        cy.loginToPortal()
        cy.visit('https://personal4.pipedrive.com/persons/list/user/everyone')
    })

    it("Close add person modal", () => {
        cy.log('User navigates to Contacts')
        cy.get(".fe-root-Breadcrumbs__parent-title")
            .should('have.text', 'Contacts')
    })
})