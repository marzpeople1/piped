class contactsPage {
    url = "https://domain.pipedrive.com/persons/list/user/everyone"
    personSummaryUrl = "https://domain.pipedrive.com/api/v1/persons/summary"

    titleSelector = ".fe-root-Breadcrumbs > .fe-root-Breadcrumbs__parent-title"
    plusBtnSelector = "[data-test='addButton-button'] > button.cui5-button-group-item--first-child"
    cancelAddPersonBtn = "button[data-test='add-modals-cancel-button']"
    xAddPersonBtn = "div.cui5-compound-modal__wrap > header > button.cui5-compound-modal__close"
    saveAddPersonBtn = "button[data-test='add-modals-save']"
    addPersonModalTitleSelector = "div.cui5-compound-modal__wrap > header > [title='Add person']"

    // Modal selectors
    addPersonModalNameSelector = "[data-test-key='name'] input[type='text']"
    addPersonOrgSelector = "[data-test-key='org_id'] input[type='text']"
    // Might match multiple elements!
    addPhoneSelector = "[data-test-key='phone'] input[data-testid='compound-input']"
    addEmailSelector = "[data-test-key='email'] input[data-testid='compound-input']"
    addLabelDropdownSelector = "[data-testid='labels-select']"
    popoverLabelSelector = "div[data-testid='labels-option-badge'] span.cui5-label__content"
    snackbarMsgSelector = "div[data-test='snackbar-queue-item'] p.cui5-snackbar__message"
    peopleCountSelector = "span[data-test='list-summary']"
    gridHeaderRowSelector = "div.grid__header table.gridHeader__table tr.gridHeader__row > th.gridHeader__cell"

    getContactsUrl = () => cy.fixture('user.json')
        .then(({adminUser}) => {
            return this.url.replace('domain', adminUser["companyDomain"])
        })

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

    clickSavePerson = () => cy.get(this.saveAddPersonBtn).click()

    setInputField = (value, selector) => cy.get(selector).type(value)

    setPersonName = name => this.setInputField(name, this.addPersonModalNameSelector)

    setOrganization = org => this.setInputField(org, this.addPersonOrgSelector)

    setPhone = phone => this.setInputField(phone, this.addPhoneSelector)

    setEmail = email => this.setInputField(email, this.addEmailSelector)

    setLabel = label => {
        cy.get(this.addLabelDropdownSelector).click()
        cy.get(this.popoverLabelSelector)
            .each(el => {
                if (el.text().trim().toLowerCase() === label.toLowerCase()) {
                    cy.wrap(el).as('pickLabel')
                }
            })
        cy.get('@pickLabel').click({force: true})
    }

    getSnackbarMsg = () => cy.get(this.snackbarMsgSelector).invoke('text')

    fillOutForm = payload => {
        if (payload.name) {
            const setAttrMap = {
                name: this.setPersonName,
                organization: this.setOrganization,
                phone: this.setPhone,
                email: this.setEmail,
                label: this.setLabel,
            }

            for (const attr in payload) {
                const attrValue = payload[attr]
                cy.log(`Set ${attr}: ${attrValue}`)
                setAttrMap[attr](attrValue)
            }
        } else {
            cy.log('Invalid payload - Name is a required field')
        }
    }

    // Creates an 'gridMap' alias containing header names and their position within the column arrangement
    mapGridHeaders = () => {
        let map = {}

        cy.fixture('user.json').then(({adminUser}) => {
            const endpoint = this.personSummaryUrl.replace('domain', adminUser["companyDomain"])
            cy.intercept({method: "GET", url: `${endpoint}**`}).as('countResponse')
        })

        cy.wait('@countResponse')
            .then(({response}) => {
                if (response.body) {
                    const {success, data} = response.body
                    const totalCount = data["total_count"]
                    expect(success).to.be.true
                    cy.log(`${totalCount} contacts found`)

                    // Check count verbiage
                    cy.get(this.peopleCountSelector)
                        .invoke('text')
                        .invoke('split', ' ')
                        .should(arr => {
                            expect(arr[0], "Check total count").to.eq(totalCount.toString())
                            expect(['person', 'people'], "Check person/people").to.include(arr[1])
                        })

                    cy.get(this.gridHeaderRowSelector)
                        .should('have.length.gt', 0)
                        .each((th, idx) => {
                            const dataField = th.attr('data-field')
                            if (dataField) {
                                map = {
                                    ...map,
                                    [dataField]: {
                                        idx,
                                        label: th.text().trim()
                                    }
                                }
                            } else {
                                cy.log('Failed to load data-field for idx=' + idx, 'th: ' + th)
                            }
                        })
                }
            })
            .then(() => cy.wrap(map).as('gridMap') )
    }
}

module.exports = new contactsPage()