class contactsPage {
    url = "https://personal4.pipedrive.com/persons/list/user/everyone"

    titleSelector = ".fe-root-Breadcrumbs > .fe-root-Breadcrumbs__parent-title"
    plusBtnSelector = "[data-test='addButton-button'] > button.cui5-button-group-item--first-child"
    cancelAddPersonBtn = "button[data-test='add-modals-cancel-button']"
    xAddPersonBtn = "div.cui5-compound-modal__wrap > header > button.cui5-compound-modal__close"
    addPersonModalTitleSelector = "div.cui5-compound-modal__wrap > header > [title='Add person']"

    getContactsUrl = () => { return this.url}

    pageTitleHeader = () => cy.get(this.titleSelector)

    addPersonModalTitle = () => cy.get(this.addPersonModalTitleSelector)

    clickPlusPerson = () => cy.get(this.plusBtnSelector).click()

    closeAddPersonModal = (action="cancel") => {
        let selector = action === "cancel" ? this.cancelAddPersonBtn : this.xAddPersonBtn

        if (action === "cancel" || action === "x") {
            cy.log('selector', selector)
            cy.get(selector).click()
        } else {
            cy.get(this.addPersonModalTitleSelector).type('{esc}')
        }
    }
}

module.exports = new contactsPage()