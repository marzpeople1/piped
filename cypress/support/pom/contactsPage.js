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
    gridCellByDataField= "td.gridRow__cell[data-field='dataField']"
    phoneNumberButtonSelector = "a[data-test='phone-number-button']"

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

    validateSnackbarMsg = name => {
        const successMsg = `New person "${name}" created`
        cy.log('Validate toast message', successMsg)
        cy.get(this.snackbarMsgSelector).invoke('text').should('eq', successMsg)
    }

    fillOutForm = payload => {
        if (payload.name) {
            const setAttrMap = {
                name: this.setPersonName,
                org_id: this.setOrganization,
                phone: this.setPhone,
                email: this.setEmail,
                label_ids: this.setLabel,
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

        cy.wait('@countResponse', {timeout: 6000})
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

    // Note: Needs to be run once mapGridHeaders has been called
    validatePerson = (payload, newPerson=true) => {
        let map = {}
        const nameSelector = this.gridCellByDataField.replace('dataField', 'name')
        const mainSelector = newPerson ? nameSelector + ' a' : nameSelector
        const { name } = payload

        cy.get('@gridMap').then(gridMap => map = gridMap)

        cy.get(mainSelector).contains(name).then(td => {
            cy.wrap(td).parents('tr').within(tr => {
                for (const attr in payload) {
                    const selector = attr === 'name' ?
                        mainSelector : this.gridCellByDataField
                            .replace('dataField', attr)

                    cy.wrap(tr, {log: false}).find(selector)
                        .then(cell => {
                            const expected = payload[attr].toString()
                            const msg = `Verify <b>${map[attr].label}</b> is "${expected}"`
                            const badgeMsg = "Verify NEW badge has been placed"
                            let actual = cell.text().trim()

                            switch (attr) {
                                case 'email':
                                    const addressList = actual
                                        .replace('(Home)', ' ')
                                        .replace('(Work)', ' ')
                                        .replace('(Other)', ' ')
                                        .trim()
                                    expect(expected.replaceAll(',', ' '), msg).to.eq(addressList)
                                    break;
                                case 'phone':
                                    let nbrList = []
                                    cy.wrap(cell)
                                        .find(this.phoneNumberButtonSelector)
                                        .each(phoneNbr => {
                                            nbrList.push(phoneNbr.text())
                                        })

                                    cy.then(() => {
                                        expect(expected.replaceAll(',', ' '), msg)
                                            .to.eq(nbrList.toString().replaceAll(',', ' '))
                                    })
                                    break
                                case 'label_ids':
                                    expect(expected.toUpperCase(), msg).to.eq(actual.toUpperCase())
                                    break;
                                default:
                                    expect(expected, msg).to.eq(actual)
                            }

                            if (attr === 'name') {
                                cy.wrap(cell)
                                    .parents('div.value')
                                    .find("span.badge")
                                    .invoke('text')
                                    .invoke('toUpperCase')
                                    .then(txt => expect(txt, badgeMsg).to.eq('NEW'))

                            }
                        })

                }
            })
        })

    }
}

module.exports = new contactsPage()