App = {
    loading: false,
    zeroAddress: "0x0000000000000000000000000000000000000000",
    contracts: {},
    createFormIsValid: false,

    handleRegisteration: async(e) => {
        await App.loadWeb3(true)
        await App.loadContract()

        await App.robin.registerUsers(App.account, e.data.isDoctor, e.data.isPatient, { from: App.account })
        window.location.reload()
    },

    loadSampleReport: async() => {
        const reports = await App.robin.getPastEvents("LogReport", {
            filter: { patient: App.account },
            fromBlock: 0
        });

        if (reports.length == 0) {
            const today = new Date();
            const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

            const reportSubject = "Sample Medical Report";
            const medicalReport = `
                Mr Tan was brought to the clinic in a wheel chair. His mood was euthymic (i.e.
                normal, non-depressed and reasonably positive mood) and he did not have any
                psychotic symptoms.
                Orientation to time, place and person
                With regard to his orientation to time, place and person, he was unable to tell that he
                was in a hospital clinic but identified his son and was able to tell his own name and
                the name of his son. After being told he was in a hospital clinic, he identified me as a
                doctor, when asked. However, he could not remember my name, although I have been
                treating him for the last 5 years. He was able to tell correctly how he arrived at the
                clinic. However, when asked some moments later where he was, he said he did not
                know.
                He said that it was 10 February (actual date 20 June) and it was a Wednesday (actual
                day, Monday). He appeared to be just guessing as to what date and day it was. After
                being told what the day and date were, he forgot a few moments later after being
                asked again. He could not answer when asked what year it was.
                When asked what time it was, he said that it was 5pm in the afternoon (actual time,
                3pm). He was not able to tell the time from looking at a watch.
                Basic information
                He gave his age as 50 years old (actually 55 years) and could not answer when asked
                when his birthday was. He correctly said he lived in a flat with his son, but could not
                give the correct address, and also got the area wrong (he said the flat was in Bedok,
                when it was actually in Jurong.) He incorrectly stated that the Prime Minister was Lee
                Kuan Yew.
            `
            await App.robin.createReport(App.account, App.account, reportSubject, date, medicalReport, { from: App.account })
            window.location.reload()
        }

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
        // App.setLoading(true);
        const doctorsAddress = $('#doctors-address').val();

        if (doctorsAddress.length > 1 && App.isValidAddress(doctorsAddress)) {
            await App.robin.grantAccess(App.account, doctorsAddress, { from: App.account });
            window.location.reload();
        } else {
            $('#access-address-error').show();
        }
    },

    revokeAccess: async(event) => {
        alert(`Are you sure you was to revoke access for ${event.data.pdAdrress}?`);

        await App.robin.revokeAccess(App.account, event.data.pdAdrress, event.data.pdId, { from: App.account });
        window.location.reload()
    },

    toggleReportFormDisplay: async() => {
        const isDoctor = await App.robin.doctors(App.account)
        if (!isDoctor) {
            $('#report-contianer').hide()
        }
    },

    displayAccountDetails: async() => {
        const isDoctor = await App.robin.doctors(App.account)
        if (!isDoctor) {
            $('#account').html("(Patient) " + App.account)
        } else {
            $('#account').html("(Doctor) " + App.account)
        }
    },

    getPermittedDoctors: async() => {
        const permittedDoctors = await App.robin.getPastEvents("LogPermittedDoctors", {
            filter: { patient: App.account },
            fromBlock: 0
        });
        const $pdTemplate = $('<li class="pd-li list-group-item d-flex justify-content-between align-items-center fs-sm"> </li>')

        for (let i = 0; i < permittedDoctors.length; i++) {
            const pd = permittedDoctors[i].args.doctor

            const $newPdTemplate = $pdTemplate.clone();
            $newPdTemplate.html(
                `${pd} <i class = "bi bi-trash-fill" > </i>`
            ).on('click', { pdId: i, pdAdrress: pd }, App.revokeAccess);

            $('#pd-ul').append($newPdTemplate)
            $newPdTemplate.show()
        }

    },

    createReport: async() => {
        // App.setLoading(true);

        const today = new Date();
        const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        const reportSubject = $('#report-subject').val();
        const patientsAddress = $('#patient-address').val();
        const medicalReport = $('#medical-report').val();

        const permittedDoctors = await App.robin.getPastEvents("LogPermittedDoctors", {
            filter: { doctor: App.account, patient: patientsAddress },
            fromBlock: 0
        });

        if (reportSubject.length > 0 && medicalReport.length > 0 && App.isValidAddress(patientsAddress) && permittedDoctors.length > 0) {
            App.createFormIsValid = true;
        } else {
            $('#report-address-error').show();
            App.createFormIsValid = false;
        }

        if (App.createFormIsValid) {
            try {
                await App.robin.createReport(App.account, patientsAddress, reportSubject, date, medicalReport, { from: App.account })
            } catch (e) {
                alert("Something went wrong! Please confirm you have been granted permission by the patient!")
            }

            window.location.reload()
        }
    },

    getReport: async() => {

        const reports = await App.robin.getPastEvents("LogReport", {
            filter: { patient: App.account },
            fromBlock: 0
        });

        for (let i = reports.length - 1; i >= 0; i--) {

            const report = reports[i].args.report

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
                            Doctor: ${report.doctor} </br></br>
                            Report: </br>
                            ${ await App.decryptReport(report.report)}
                        </div>
                        </div>
                    </div>
                `
            $('#accordion').append($accordionTemplate);
        }

        const firstAccordionChild = $('.accordion-item').first()
        firstAccordionChild.find('button').removeClass('collapsed');
        firstAccordionChild.find('.accordion-collapse').addClass('show')
    },

    decryptReport: async(report) => {
        // TODO: Do some heavy decryption 
        return report;
    },

    isValidAddress: (address) => {
        return /^(0x)?[0-9a-f]{40}$/.test(address.toLowerCase())
    },

    render: async() => {
        // Prevent double render
        if (App.loading) {
            return
        }
        // Update app loading state
        App.setLoading(true)

        // Render Account
        await App.displayAccountDetails();

        // Render View
        await App.getPermittedDoctors()
        await App.getReport()
        await App.toggleReportFormDisplay()
        await App.loadSampleReport()

        // Update loading state
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
        App.load()
    })
})