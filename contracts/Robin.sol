// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// robin = await Robin.deployed()

contract Robin {

  address public owner = msg.sender;
  
  // mapping (address => bool) public permittedDoctors;
  mapping (address => mapping (address => bool)) public ());

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
    address patientId;
    address doctorId;
    string title;
    string date;
    string content;
  }

  /* 
   * Events
   */

   event LogPermittedDoctors(address patient, address doctor, bool permitted)

  constructor() public {
  }

  function grantAccess(address _address) public returns (bool){
      permittedDoctors[owner][_address] = true;

      emit LogPermittedDoctors(owner, _address, true);

      return  permittedDoctors[owner][_address];
    }
  
  function revokeAccess() {}

  function createReport() {}

  function listReport() {}

  function encryptReport() {}
}
