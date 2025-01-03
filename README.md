# PIPEDRIVE - AUTOMATION QE TASK
# Prerequisites
### 1) Install latest versions of
1. [x] Node.js
2. [x] NPM
3. [x] Cypress
### 2) Clone the repo into local
`git clone git@github.com:marzpeople1/piped.git`
### 3) Navigate to the root folder and run
`npm install`
### 4) Make sure `/cypress/fixtures/user.json` has valid account data
- Valid email address and password (`email` & `pass`)
- Company domain (`companyDomain`) associated to that email address

# How to run Cypress scripts
While on the root directory:
#### Option A: Run the entire suite directly with
`npm run cy:test`
> Note that the `--no-exit` flag has been added to the scripts so Cypress doesn't
close the browser after test has been executed. Please close the browser
before running the next test (alternatively, remove `--no-exit` from scripts definition
within `/package.json` so the window closes automatically).

#### Option B: Open Cypress runner
1. `npx cypress open`
2. Select E2E Testing
3. Select Chrome (preferably) and click **Start E2E Testing in Chrome**
4. Go to **Specs** tab and select _add-person.cy.js_

# How to run Postman Collections
1. Import /postman-collections.json into a local workspace
2. At this point it is important to consider

> "1. Get pipe-verify" request must be double-checked/updated to ensure the right test account is set. 
To achieve this, go to Scripts => Post-response, and update `login`, `password` and `companyDomain` 
> values accordingly.

> Script generates a random person name on each run, along with static `phone`, `email`, and `visible_to` values.
> To override this, open the "3. Add person" request, then Scripts => Pre-request and update `personPayload` object
> before running the collection.

2. Select the newly imported collection and click **Run** on the top-right banner
3. Verify all requests have been selected (**Select all** button should have them all checked) 
and Run order shows the correct sequence (from 1 to 4) 
4. On the right pane, select the Functional tab, then choose Run manually
5. Finally, run the collection by clicking on **Run Pipep**