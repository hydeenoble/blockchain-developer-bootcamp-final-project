App = {
    loading: false,
    zeroAddress: "0x0000000000000000000000000000000000000000",
    contracts: {},

    handleRegisteration: async(e) => {

        await App.loadWeb3(true)
        await App.loadContract()

        await App.robin.registerUsers(App.account, e.data.isDoctor, e.data.isPatient, { from: App.account })

        window.location.reload()
    },

    load: async() => {
        await App.loadWeb3()

        if (App.account) {
            await App.loadWeb3()
            await App.loadContract()
            await App.render()

            $('.rb-content').show()
            $('.rb-signin').hide()
        } else {
            $('.option-doctor').on('click', { isDoctor: true, isPatient: false }, App.handleRegisteration)
            $('.option-patient').on('click', { isDoctor: false, isPatient: true }, App.handleRegisteration)
            $('.rb-content').hide()
            $('.rb-signin').show()
        }
    },

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async(connect = false) => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
        } else {
            window.alert("Please connect to Metamask.")
        }

        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            try {
                // Request account access if needed
                // console.log("getAccounts", ()
                App.account = (await web3.eth.getAccounts())[0];

                if (connect) {
                    await ethereum.enable();
                    App.account = (await web3.eth.getAccounts())[0];
                }

                // await ethereum.enable();
                // Acccounts now exposed
                web3.eth.sendTransaction({ /* ... */ });
            } catch (error) {
                // User denied account access...
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            window.web3 = new Web3(web3.currentProvider);
            // Acccounts always exposed
            web3.eth.sendTransaction({ /* ... */ });
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
    },

    loadContract: async() => {
        // Create a JavaScript version of the smart contract
        const robin = await $.getJSON('Robin.json');
        App.contracts.Robin = TruffleContract(robin)
        App.contracts.Robin.setProvider(App.web3Provider)

        // Hydrate the smart contract with values from the blockchain
        App.robin = await App.contracts.Robin.deployed()
    },

    grantAccess: async() => {
        App.setLoading(true);
        const doctorsAddress = $('#doctors-address').val();
        if (doctorsAddress.length > 1) {
            await App.robin.grantAccess(App.account, doctorsAddress, { from: App.account })
        }
        window.location.reload()
    },

    revokeAccess: async(event) => {
        console.log(event.data.pdId);

        alert(`Are you sure you was to revoke access for ${event.data.pdAdrress}?`);

        await App.robin.revokeAccess(App.account, event.data.pdAdrress, event.data.pdId, { from: App.account });
        window.location.reload()
    },

    toggleReportFormDisplay: async() => {
        const isDoctor = await App.robin.doctors(App.account)
        console.log("isDoctor", isDoctor)
        if (!isDoctor) {
            $('#report-contianer').hide()
        }
    },

    getPermittedDoctors: async() => {
        const pdCount = await App.robin.permittedDoctorsCount();

        const $pdTemplate = $('<li class="pd-li list-group-item d-flex justify-content-between align-items-center fs-sm"> </li>')

        for (let i = 1; i <= pdCount; i++) {
            const pd = await App.robin.getPermittedDoctorsList(App.account, i)

            console.log(i, pd)

            if (pd != App.zeroAddress) {
                const $newPdTemplate = $pdTemplate.clone();
                $newPdTemplate.html(
                    `${pd} <i class = "bi bi-trash-fill" > </i>`
                ).on('click', { pdId: i, pdAdrress: pd }, App.revokeAccess);

                $('#pd-ul').append($newPdTemplate)
                $newPdTemplate.show()
            }
        }
    },

    createReport: async() => {
        App.setLoading(true);

        const today = new Date();
        const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        const reportSubject = $('#report-subject').val();
        const patientsAddress = $('#patient-address').val();
        const medicalReport = $('#medical-report').val();

        console.log("reportSubject", reportSubject);
        console.log("patientsAddress", patientsAddress);
        console.log("medicalReport", medicalReport);
        console.log("report date", date);

        try {
            await App.robin.createReport(App.account, patientsAddress, reportSubject, date, medicalReport, { from: App.account })
        } catch (e) {
            alert("Something went wrong! Please confirm you have been granted permission by the patient!")
        }

        window.location.reload()
    },

    getReport: async() => {
        // const reportCount = await App.robin.reportCount();
        const reports = await App.robin.getPastEvents("LogPatientReport", { fromBlock: 0 })

        for (let i = reports.length - 1; i >= 0; i--) {

            const report = reports[i].args.report

            if (report[0] != App.zeroAddress) {
                const $accordionTemplate = `
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="heading${i}">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
                        
                            <span class="fs-md">
                            ${report.subject} 
                            </span>

                            <span class="fs-sm">
                            &nbsp;(${report.date})
                            </span>

                        </button>
                        </h2>
                        <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}" data-bs-parent="#accordion">
                        <div class="accordion-body fs-md">
                            Doctor: ${report.id} </br></br>
                            Report: </br>
                            ${report[3]}
                        </div>
                        </div>
                    </div>
                `
                $('#accordion').append($accordionTemplate);
            }
        }

        const firstAccordionChild = $('.accordion-item').first()
        firstAccordionChild.find('button').removeClass('collapsed');
        firstAccordionChild.find('.accordion-collapse').addClass('show')
    },

    render: async() => {
        // Prevent double render
        if (App.loading) {
            return
        }

        // Update app loading state
        App.setLoading(true)

        // Render Account
        $('#account').html(App.account)

        // Render View
        await App.getPermittedDoctors()

        await App.getReport()

        await App.toggleReportFormDisplay()

        // Update loading state
        t = await App.robin.getPastEvents("LogPatientReport", { fromBlock: 0 })
        console.log("Past", t[0].args.report)
        App.setLoading(false)
    },

    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#main-content')
        if (boolean) {
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    }
}

$(() => {
    $(window).load(() => {
        // $('.rb-content').hide()
        // $('.rb-signin').hide()
        App.load()
    })
})