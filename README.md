# Robin

A decentralized application to manage medical health records.

## Problem Statement
A friend recently relocated to a new country and had to start over some health procedures because his new doctor in the new country doesn't have access to the test, results and medications he has taken over the past few years. He had to do a series of tests for the doctor to draw her own conclusions. 

As if going through all the medical tests again were not enough, he wasn't able to vividly remember all the initial symptoms of the illness because it has been a while. 

This is the reality of some doctors, nurses & health professionals today. They are limited in the level of (immediate) care they can provide because of the inability to view the  complete, accurate health records of a patient. 


## Proposed solution
With the help of a decentralized application based on the ethereum network, patient records can be securely available on the blockchain and only authorized persons can access it anywhere in the world.

## Local installation and Setup
This setup assumes you already have [truffle](https://trufflesuite.com/docs/truffle/getting-started/installation) and [ganache](https://trufflesuite.com/ganache) install globallyon yout local machine.

1. Clone the repository

    ```
    git clone https://github.com/hydeenoble/blockchain-developer-bootcamp-final-project.git
    ```
2. Install Dependencies
    ```
    npm install
    ```

3. Deploy the contract to the local blockchain: 

    *Kindly make sure ganche is running ganache us running, and that you already have [metamask](https://metamask.io) install on your browser.*
    ```
    truffle migrate --reset
    ```

    There result should end with something like this: 

    ```
    Summary
    =======
    > Total deployments:   2
    > Final cost:          0.02422906 ETH
    ```

4. To start the application, run the command below in the root directory onf the application: 
    ```
    npm run dev
    ```

TODO Features
- Report Encryption
- Report Decryption
