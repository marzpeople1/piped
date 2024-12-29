import {default  as contacts} from "../../support/pom/contactsPage"
import {randomizeString} from "../../support/supportFunctions";


describe("Add person feature - Automation suite", () => {

    beforeEach("", () => {
        // Suppresses xhr/fetch logs
        cy.intercept({ resourceType: /xhr|fetch/ }, { log: false })

        cy.loginToPortal()
        contacts.getContactsUrl().then(url => cy.visit(url))
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
        const name = "Auto name"
        const org = "Auto org"

        contacts.clickPlusPerson()
        contacts.addPersonModalTitle().should('exist')

        contacts.setPersonName(name)
        contacts.setOrganization(org)

        // Hit Cancel button
        contacts.closeAddPersonModal()
        contacts.addPersonModalTitle().should('not.exist')
    })

    it("Add new person - Required fields", () => {
        const personName = "Auto required - " + randomizeString(5)
        const successMsg = `New person "${personName}" created`
        contacts.clickPlusPerson()
        contacts.addPersonModalTitle().should('exist')
        contacts.fillOutForm({name: personName})
        contacts.clickSavePerson()
        contacts.getSnackbarMsg().should('eq', successMsg)
    })

    it("Add new person - All fields", () => {
        contacts.clickPlusPerson()
        contacts.addPersonModalTitle().should('exist')

        contacts.fillOutForm({
            name: "Auto optional - " + randomizeString(5),
            organization: "Auto org",
            phone: 123,
            email: 'auto@domain.com',
            label: 'hot lead'
        })

        contacts.clickSavePerson()
    })
})