App = {
    loading: false,
    zeroAddress: "0x0000000000000000000000000000000000000000",
    contracts: {},

    load: async() => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()

        // web3.eth.defaultAccount = web3.eth.accounts[0]
    },

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async() => {
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
                await ethereum.enable();
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

    loadAccount: async() => {
        // Set the current blockchain account
        App.account = (await web3.eth.getAccounts())[0]
    },

    grantAccess: async() => {
        App.setLoading(true);
        const doctorsAddress = $('#doctors-address').val();
        await App.robin.grantAccess(App.account, doctorsAddress, { from: App.account })
        window.location.reload()
    },

    revokeAccess: async(event) => {
        console.log(event.data.pdId);

        alert(`Are you sure you was to revoke access for ${event.data.pdAdrress}?`);

        await App.robin.revokeAccess(App.account, event.data.pdAdrress, event.data.pdId, { from: App.account });
        window.location.reload()
    },

    getPermittedDoctors: async() => {
        const pdCount = await App.robin.permittedDoctorsCount();

        const $pdTemplate = $('<li class="pd-li list-group-item d-flex justify-content-between align-items-center fs-small"> </li>')

        for (let i = 1; i <= pdCount; i++) {
            const pd = await App.robin.permittedDoctorsList(App.account, i)

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

    render: async() => {
        // Prevent double render
        if (App.loading) {
            return
        }

        // Update app loading state
        App.setLoading(true)

        // Render Account
        $('#account').html(App.account)

        // Render Tasks
        await App.getPermittedDoctors()

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