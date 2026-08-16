/**
 * SureSlip - Admin Fixture Manager
 *
 * Controls the administrator's review of discovered fixtures.
 *
 * Workflow:
 *
 * PENDING
 *    ↓
 * VERIFIED / REJECTED
 *    ↓
 * SELECTED
 *    ↓
 * STATISTICS
 *    ↓
 * POISSON ENGINE PRO
 */

class FixtureManager {

    constructor() {
        this.fixtures = [];
    }

    /**
     * Load fixtures discovered by the
     * Match Discovery system.
     */
    loadFixtures(fixtures) {

        if (!Array.isArray(fixtures)) {
            throw new Error(
                "Fixtures must be an array."
            );
        }

        this.fixtures = fixtures.map(
            fixture => ({
                ...fixture,

                status:
                    fixture.status ||
                    "pending",

                adminNote:
                    fixture.adminNote ||
                    null,

                verifiedAt:
                    fixture.verifiedAt ||
                    null,

                selectedAt:
                    fixture.selectedAt ||
                    null
            })
        );

        return this.fixtures;
    }

    /**
     * Get all fixtures.
     */
    getAll() {
        return this.fixtures;
    }

    /**
     * Get fixtures by status.
     */
    getByStatus(status) {

        return this.fixtures.filter(
            fixture =>
                fixture.status === status
        );
    }

    /**
     * Find fixture.
     */
    find(fixtureId) {

        return this.fixtures.find(
            fixture =>
                fixture.id === fixtureId
        );
    }

    /**
     * Verify fixture.
     */
    verify(fixtureId, adminNote = null) {

        const fixture =
            this.find(fixtureId);

        if (!fixture) {
            throw new Error(
                "Fixture not found."
            );
        }

        fixture.status = "verified";

        fixture.verifiedAt =
            new Date().toISOString();

        fixture.adminNote =
            adminNote;

        return fixture;
    }

    /**
     * Reject fixture.
     */
    reject(fixtureId, adminNote = null) {

        const fixture =
            this.find(fixtureId);

        if (!fixture) {
            throw new Error(
                "Fixture not found."
            );
        }

        fixture.status = "rejected";

        fixture.adminNote =
            adminNote;

        return fixture;
    }

    /**
     * Select verified fixture for analysis.
     */
    select(fixtureId) {

        const fixture =
            this.find(fixtureId);

        if (!fixture) {
            throw new Error(
                "Fixture not found."
            );
        }

        if (
            fixture.status !==
            "verified"
        ) {

            throw new Error(
                "Only verified fixtures can be selected."
            );
        }

        fixture.status = "selected";

        fixture.selectedAt =
            new Date().toISOString();

        return fixture;
    }

    /**
     * Remove a fixture.
     */
    remove(fixtureId) {

        const originalLength =
            this.fixtures.length;

        this.fixtures =
            this.fixtures.filter(
                fixture =>
                    fixture.id !== fixtureId
            );

        return (
            this.fixtures.length <
            originalLength
        );
    }

    /**
     * Return fixtures ready
     * for statistical analysis.
     */
    getSelectedFixtures() {

        return this.getByStatus(
            "selected"
        );
    }

    /**
     * Dashboard summary.
     */
    getSummary() {

        return {
            total:
                this.fixtures.length,

            pending:
                this.getByStatus(
                    "pending"
                ).length,

            verified:
                this.getByStatus(
                    "verified"
                ).length,

            rejected:
                this.getByStatus(
                    "rejected"
                ).length,

            selected:
                this.getByStatus(
                    "selected"
                ).length
        };
    }
}

module.exports =
    FixtureManager;
