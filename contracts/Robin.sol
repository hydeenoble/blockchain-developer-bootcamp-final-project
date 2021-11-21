// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

// robin = await Robin.deployed()

/// @title Smart contract for discentralizing medical records
/// @author Idowu Emehinola
/// @notice You can use this contract for only the basic simulation of discentralizing medical records
/// @dev The encryption method has not been implemented yet.

contract Robin is Ownable {
    /// @dev Tracks the number of doctors that has access to a particular patient's medical records.
    uint256 public permittedDoctorsCount = 0;
    /// @dev Tracks the number of report that a patient has.
    mapping(address => uint256) public reportCount;
    /// @dev Tracks the list of permitted doctors;
    mapping(address => mapping(uint256 => address))
        private permittedDoctorsList;
    /// @dev Tracks the list of permitted doctors;
    mapping(address => mapping(address => bool)) public permittedDoctors;
    /// @dev Tracks a list of reports asssociated to a patient.
    mapping(address => mapping(uint256 => Report)) private patientsReports;
    /// @dev Tracks the a list of doctors
    mapping(address => bool) public doctors;
    /// @dev Tracks the a list of patients
    mapping(address => bool) public patients;

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
    /// @notice List of all permitted doctors.
    /// @dev Used as a helper when iterating over the list of doctors in the frontend.
    event LogPermittedDoctors(
        address indexed patient,
        address indexed doctor,
        bool permitted
    );
    /// @notice List of all Report.
    /// @dev Used as a helper when iterating over the list of reports in the frontend.
    event LogReport(
        address indexed patient,
        address indexed doctor,
        Report report
    );

    /*
     * Modifiers
     */

    /// @notice Verfity if a patient has given permission to a doctor.
    modifier verifyPermission(address _patient, address _doctor) {
        if (_patient != _doctor) {
            require(
                permittedDoctors[_patient][_doctor],
                "Doctor needs to be granted permission to perform this action!"
            );
        }
        _;
    }

    // modifier isOwner(address _patient) {
    //     require(msg.sender == _patient, "This is not the Patient!");
    //     _;
    // }

    constructor() {}

    /// @notice Adds a user and maps the right user type based on that is select from the frontend
    /// @param _address the new user to map to user type
    /// @param _isDoctor is `true` is the user is a doctor
    /// @param _isPatient is `true` is the user is a patient
    /// @dev map a user to a specify user type
    function registerUsers(
        address _address,
        bool _isDoctor,
        bool _isPatient
    ) public returns (bool) {
        doctors[_address] = _isDoctor;
        patients[_address] = _isPatient;
        return true;
    }

    // a patient should not be able to grant his/her self permission
    /// @notice Grants access to a doctor to create report for a patient
    /// @param _patient The patient granting access
    /// @param _doctor The doctor being granted access
    /// @dev These address should be valid address
    function grantAccess(address _patient, address _doctor) public {
        permittedDoctorsCount++;

        permittedDoctorsList[_patient][permittedDoctorsCount] = _doctor;
        permittedDoctors[_patient][_doctor] = true;

        emit LogPermittedDoctors(_patient, _doctor, true);
    }

    // patienrs should be able to revoke doctors permission as anytime
    /// @notice Revoke the access of a doctor to create report for a patient
    /// @param _patient The patient revoking access
    /// @param _doctor The doctor whose access is being revoked
    /// @dev These address should be valid address
    function revokeAccess(
        address _patient,
        address _doctor,
        uint256 _pdcount
    ) public verifyPermission(_patient, _doctor) {
        delete permittedDoctorsList[_patient][_pdcount];
        delete permittedDoctors[_patient][_doctor];
    }

    // only permitted doctors should be able to create a report
    /// @notice Add a medical record to the smart contract state
    /// @param _doctor The doctor creating the report
    /// @param _patient The patient whose report is being created
    /// @param _subject subject/title of the report
    /// @param _date the date the report was created
    /// @param _report medical report of the patient
    /// @dev Only doctor's with permission can create a report
    function createReport(
        address _doctor,
        address _patient,
        string memory _subject,
        string memory _date,
        string memory _report
    ) public verifyPermission(_patient, _doctor) {
        reportCount[_patient]++;

        patientsReports[_patient][reportCount[_patient]] = Report({
            patient: _patient,
            doctor: _doctor,
            subject: _subject,
            date: _date,
            report: encryptReport(_report)
        });

        emit LogReport(
            _patient,
            _doctor,
            patientsReports[_patient][reportCount[_patient]]
        );
    }

    /// @notice Encrpt report before adding them to the blockchain
    /// @param _report The report to encrypt
    /// @dev report detials would be encrypted before adding them to the blockchain.
    function encryptReport(string memory _report)
        private
        onlyOwner
        returns (string memory)
    {
        // TODO: Do come heavy encryption :)
        return _report;
    }
}
