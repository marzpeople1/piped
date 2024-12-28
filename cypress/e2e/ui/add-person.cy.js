import {default  as contacts} from "../../support/pom/contactsPage"

describe("Add person automation", () => {

    beforeEach("", () => {
        // Suppresses xhr/fetch logs
        cy.intercept({ resourceType: /xhr|fetch/ }, { log: false })

        cy.loginToPortal()
        cy.visit(contacts.getContactsUrl())

        cy.log('User navigates to Contacts')
        contacts.pageTitleHeader().should('have.text', 'Contacts')
    })

    it("Close Add person modal - No data entered", () => {
        for (const action of ['cancel', 'x', 'esc']) {
            cy.log(`Close popup by doing '${action}'`)
            contacts.clickPlusPerson()
            contacts.addPersonModalTitle().should('exist')

            contacts.closeAddPersonModal(action)
            contacts.addPersonModalTitle().should('not.exist')
        }
    })

    it("Close Add Person modal - Form filled out", () => {
        contacts.clickPlusPerson()
        contacts.addPersonModalTitle().should('exist')
    })
})