// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// robin = await Robin.deployed()

contract Robin {
    uint256 public permittedDoctorsCount = 0;
    mapping(address => uint256) public reportCount;

    mapping(address => mapping(uint256 => address)) private permittedDoctorsList;
    mapping(address => mapping(address => bool)) private permittedDoctors;
    
    mapping(address => mapping(uint256 => Report)) private patientsReports;

    mapping(address => bool) public doctors;
    mapping(address => bool) public patients;

    address public owner = msg.sender;
    address public txowner = tx.origin;

    /** 
    * enum
    */
    enum UserType { Doctor, Patient }
    /*
     * struct
     */
    struct Report {
        address patient;
        address doctor;
        string subject;
        string date;
        string report;
    }

    /*
     * Events
     */

    event LogPermittedDoctors(address indexed patient, address indexed doctor, bool permitted);
    event LogReport(address indexed patient, address indexed doctor, Report report);

    /*
     * Modifiers
     */

    modifier verifyPermission (address _patient, address _doctor) { 
        if (_patient != _doctor){
            require (permittedDoctors[_patient][_doctor], "You don't have the required permission to create a report for this Patient!");
        }
        _;
    }

    modifier isOwner(address _patient) {
        require(msg.sender == _patient, "This is not the Patient!");
        _;
    }

    constructor() public {}

    function registerUsers(address _address, bool _isDoctor, bool _isPatient) public returns (bool){
        
        doctors[_address] = _isDoctor;

        patients[_address] = _isPatient;

        return true;
    }

    // a patient should not be able to grant his/her self permission
    function grantAccess(address _patient, address _doctor)
        public
        returns (bool)
    {
        permittedDoctorsCount++;

        permittedDoctorsList[_patient][permittedDoctorsCount] = _doctor;
        permittedDoctors[_patient][_doctor] = true;

        emit LogPermittedDoctors(_patient, _doctor, true);

        return permittedDoctors[_patient][_doctor];
    }

    // patienrs should be able to revoke doctors permission as anytime
    function revokeAccess(
        address _patient,
        address _doctor,
        uint256 _pdcount
    ) public verifyPermission(_patient, _doctor) {
        delete permittedDoctorsList[_patient][_pdcount];
        delete permittedDoctors[_patient][_doctor];
    }

    function getPermittedDoctorsList(address _patient, uint _permittedDoctorsCount) public view returns (address) {
        return permittedDoctorsList[_patient][_permittedDoctorsCount];
    }

    // only permitted doctors should be able to create a report
    function createReport(
        address _doctor,
        address _patient,
        string memory _subject,
        string memory _date,
        string memory _report
    ) public verifyPermission(_patient, _doctor) returns (bool) {
        
        reportCount[_patient]++;

        patientsReports[_patient][reportCount[_patient]] = Report({
            patient: _patient,
            doctor: _doctor,
            subject: _subject,
            date: _date,
            report: encryptReport(_report)
        });

        emit LogReport(_patient, _doctor, patientsReports[_patient][reportCount[_patient]]);
        
        return true;
    }

    // report detials should be encrypted before adding them to the blockchain.
    function encryptReport(string memory _report) private pure returns (string memory) {
        // TODO: Do come heavy encryption
        return _report;
    }
}
