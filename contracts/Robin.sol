// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// robin = await Robin.deployed()

contract Robin {
    uint public permittedDoctorsCount = 0;
    address public owner = msg.sender;

    // mapping (address => bool) public permittedDoctors;
    // mapping(address => mapping(address => bool)) public permittedDoctors;

    // mapping(address => mapping(uint => mapping(address => bool))) public permittedDoctors;

    mapping(address => mapping(uint => address)) public permittedDoctorsList;
    mapping(address => mapping(address => bool)) public permittedDoctors;

    mapping(address => Report) public reports;

    /*
     * enum
     */

    // enum UserType { Doctor, Patient }

    /*
     * struct
     */

    struct Doctor {
        address id;
    }

    struct Patient {
        address id;
    }

    struct Report {
        // address patientId;
        address doctorId;
        string title;
        string date;
        string content;
    }

    /*
     * Events
     */

    event LogPermittedDoctors(address patient, address doctor, bool permitted);

    /*
     * Modifiers
     */

    //  modifier isNotPatient(uint _sku) {
    //   require(msg.sender == items[_sku].seller);
    //   _;
    // }

    constructor() public {}

    // a patient should not be able to grant his/her self permission
    function grantAccess(address _patient, address _doctor) public returns (bool) {
        permittedDoctorsCount ++;
        
        permittedDoctorsList[_patient][permittedDoctorsCount] = _doctor;
        permittedDoctors[_patient][_doctor] = true;

        emit LogPermittedDoctors(_patient, _doctor, true);

        return permittedDoctors[_patient][_doctor];
    }

    // function getListOfPermittedDoctors(address _patient) public {
    //     // check if this is the patient
        
    //     // delete permittedDoctors[_patient][_doctor];

    // }

    // patienrs should be able to revoke doctors permission as anytime
    function revokeAccess(address _patient, address _doctor, uint _pdcount) public {
        delete permittedDoctorsList[_patient][_pdcount];
        delete permittedDoctors[_patient][_doctor];
    }

    // only permitted doctors should be able to create a report
    function createReport() public {}

    // only permitted doctors and owner should be able to list reports
    function getReports() public {}

    // report detials should be encrypted before adding them to the blockchain.
    function encryptReport() public {}
}
