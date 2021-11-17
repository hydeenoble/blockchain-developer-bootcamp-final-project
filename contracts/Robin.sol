// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// robin = await Robin.deployed()

contract Robin {
    uint256 public permittedDoctorsCount = 0;
    uint256 public reportCount = 0;
    // address public owner = msg.sender;

    mapping(address => mapping(uint256 => address)) private permittedDoctorsList;
    mapping(address => mapping(address => bool)) private permittedDoctors;
    
    mapping(address => mapping(uint256 => Report)) private patientsReports; //Patients's copy of the report
    // mapping(address => mapping(uint256 => Report)) private doctorsReports; //Doctor's copy of the report

    mapping(address => mapping( address => mapping(uint256 => Report))) private doctorsReports; //Doctor's copy of the report

    // mapping(uint256 => Report)

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
        address id;
        string subject;
        string date;
        string report;
    }

    /*
     * Events
     */

    event LogPermittedDoctors(address patient, address doctor, bool permitted);
    event LogPatientReport(Report report);
    event LogDoctorReport(Report report);

    /*
     * Modifiers
     */

    modifier verifyPermission (address _patient, address _doctor) { 
        require (permittedDoctors[_patient][_doctor], "You don't have the required permission to create a report for this Patient!"); 
        _;
    }

    modifier isOwner(address _patient) {
    require(msg.sender == _patient, "This is not the Patient!");
    _;
  }

    constructor() public {}

    // function getTXOwner() public returns (address) {
    //     return tx.origin;
    // }

    // function getOwner() public returns (address) {
    //     return msg.sender;
    // }

    // function doctorType() public pure returns (UserType){
    //     return UserType.Doctor;
    // }

    // function patientType() public pure returns (UserType){
    //     return UserType.Patient;
    // }

    // function getUserType(address _address) public returns (UserType) {
    //     return users[_address];
    // } 

    // function isDoctor(address _address) public returns (bool) {
    //     return users[_address] == UserType.Doctor;
    // } 

    // function isPatient(address _address) public returns (bool) {
    //     return users[_address] == UserType.Patient;
    // } 

    function registerUsers(address _address, bool _isDoctor, bool _isPatient) public returns (bool){
        
        if (_isDoctor) {
            doctors[_address] = true;
        }

        if (_isPatient) {
            patients[_address] = true;
        }

        // users[_address] = _userType;
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
    ) public {
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
    ) public returns (bool) { //verifyPermission(_patient, _doctor)
        reportCount++;

        patientsReports[_patient][reportCount] = Report({
            id: _doctor,
            subject: _subject,
            date: _date,
            report: encryptReport(_report)
        });

        doctorsReports[_doctor][_patient][reportCount] = Report({
            id: _patient,
            subject: _subject,
            date: _date,
            report: encryptReport(_report)
        });

        emit LogPatientReport(patientsReports[_patient][reportCount]);

        return true;
    }

    // only permitted doctors and owner should be able to list reports
    // isOwner(_patient)
    // function getPatientReports(address _patient, uint _reportCount) public returns (Report memory) {
    //     emit LogPatientReport(patientsReports[_patient][_reportCount]);
    //     return patientsReports[_patient][_reportCount];
    // }

    function getDoctorsReports(address _doctor, address _patient, uint _reportCount) public view verifyPermission(_patient, _doctor) returns (Report memory) {
        return doctorsReports[_doctor][_patient][_reportCount];
    }

    // report detials should be encrypted before adding them to the blockchain.
    function encryptReport(string memory _report) private pure returns (string memory) {
        return _report;
    }
}
