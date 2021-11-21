const Robin = artifacts.require("Robin");

const VERIFY_PERMISSION_ERROR = "Doctor needs to be granted permission to perform this action!";

const getErrorObject = (data = {}) => {
    const transactionHash = Object.keys(data)[0];
    return data[transactionHash];
};

contract("Robin", function(accounts) {
    const [doctor, patient] = accounts;

    beforeEach(async() => {
        robin = await Robin.new();
    });

    describe("Users", () => {
        it("should be able to register as a doctor", async() => {
            await robin.registerUsers(doctor, true, false);
            assert.equal(await robin.doctors(doctor), true);
        });

        it("should be able to register as a patient", async() => {
            await robin.registerUsers(doctor, false, true);
            assert.equal(await robin.patients(doctor), true);
        });
    });

    describe("Patients", () => {
        it("should be able to grant doctors access", async() => {
            await robin.grantAccess(patient, doctor);
            assert.equal(await robin.permittedDoctors(patient, doctor), true);
        });

        it("should only be able to revoke access fo doctors they have previously granted access", async() => {
            try {
                await robin.revokeAccess(patient, doctor, 0);
            } catch (e) {
                const { error, reason } = getErrorObject(e.data);
                assert.equal(error, "revert");
                assert.equal(reason, VERIFY_PERMISSION_ERROR);
            }
        });

        it("should be able to revoke doctor's access only after grant access previously", async() => {
            await robin.grantAccess(patient, doctor);
            await robin.revokeAccess(patient, doctor, 0);
            assert.equal(await robin.permittedDoctors(patient, doctor), false);
        })

        it("should emit an event with access is grant to a doctor", async() => {
            let eventEmitted = false;
            const transaction = await robin.grantAccess(patient, doctor);

            if (transaction.logs[0].event == "LogPermittedDoctors") {
                eventEmitted = true;
            }

            assert.equal(eventEmitted, true);
        });
    });

    describe("Doctors", () => {

        it("should only be able to create report after getting permission", async() => {
            try {
                await robin.createReport(doctor, patient, "Report Subject #1", "2021-11-21", "Detialed Medical Report #1");
            } catch (e) {
                const { error, reason } = getErrorObject(e.data);
                assert.equal(error, "revert");
                assert.equal(reason, VERIFY_PERMISSION_ERROR);
            }
        });

        it("should emit an event after creating a report", async() => {
            let eventEmitted = false;

            await robin.grantAccess(patient, doctor);
            const transaction = await robin.createReport(doctor, patient, "Report Subject #1", "2021-11-21", "Detialed Medical Report #1");

            if (transaction.logs[0].event == "LogReport") {
                eventEmitted = true;
            }
            assert.equal(eventEmitted, true);
        })
    });
});