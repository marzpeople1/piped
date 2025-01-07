import {default  as contacts} from "../../support/pom/contactsPage"
import {randomizeString} from "../../support/supportFunctions";

describe("Add person feature - Automation suite", () => {
    let docker
    const addPersonWrapper = (name, optionalAttrs) => {
        const payload = { name, ...optionalAttrs }

        contacts.clickPlusPerson()
        contacts.addPersonModalTitle().should('exist')
        contacts.fillOutForm(payload)
        contacts.clickSavePerson()
        contacts.validateSnackbarMsg(name)
        contacts.validatePerson(payload)
    }

    before("Read run type (host)", () => {
        docker = Cypress.env().host && Cypress.env().host === 'docker' ? '[docker] ' : ''
    })

    beforeEach("Ensure Login to Pipedrive", () => {
        // Suppresses xhr/fetch logs
        cy.intercept({ resourceType: /xhr|fetch/ }, { log: false })

        cy.loginToPortal()
        contacts.getContactsUrl().then(url => cy.visit(url))
        cy.log('User navigates to Contacts')
        contacts.pageTitleHeader().should('have.text', 'Contacts')

        // Map of (header, position) entries is used to validate new person attributes
        contacts.mapGridHeaders()
    })

    it("Close Add person modal - No data entered", {}, () => {
        // for (const action of ['cancel', 'x', 'esc']) {
        for (const action of ['cancel', 'x']) {
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

    it("Add new person - Required fields",() => {
        addPersonWrapper(`${docker}Auto required - ${randomizeString(10)}`)
    })

    it("Add new person - All fields", () => {
        const name = `${docker}Auto optional - ${randomizeString(10)}`
        const optional = {
            org_id: "Auto org",
            phone: "37288886666",
            email: "test1@domain.com",
            label_ids: 'Hot lead'
        }
        addPersonWrapper(name, optional)
    })
})