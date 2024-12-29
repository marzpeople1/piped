const url = Cypress.config().baseUrl
const userSelfUrl = "https://domain.pipedrive.com/api/v1/fe-navigation-api/user-self"

// Returns pipe-verify cookie
const getPipeVerify = () =>
    cy.request(url)
        .then(res  => {
            expect(res.status).to.eq(200)

            const cookie = res.headers['set-cookie']
                .filter(cookie => cookie.startsWith('pipe-verify'))

            expect(cookie.length).to.eq(1)

            cy.wrap(cookie[0].split(';')[0].split('=')[1])
        })

const verifyLoggedIn = () => cy.fixture('user.json')
    .then(({adminUser}) => {
        const selfUrl = userSelfUrl.replace('domain', adminUser["companyDomain"])
        cy.request(selfUrl)
    })


// Authenticates to Pipedrive via API
const authApi = () => {
    cy.fixture('user')
        .then(({adminUser}) => {
            const {email, pass} = adminUser

            cy.log(`Auth to Pipedrive as ${email}`)

            getPipeVerify()
                .then(pipeVerify => {
                    cy.log('Pipe-verify cooke retrieved')

                    // Actual auth operation
                    cy.request({
                        method: "POST",
                        url,
                        body: {
                            login: email,
                            password: pass,
                            "pipe-verify": pipeVerify
                        }, })
                        .its('status')
                        .should('eq', 200)
                })

            verifyLoggedIn()
                .then(res => {
                    expect(res.status).to.eq(200)
                    const {success, data} = res.body
                    expect(success, "Check response is successful").to.true
                    expect(data.user.email, "check email account logged in").to.eq(email)
                })
        })
}

module.exports = {authApi}