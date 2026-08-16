/**
 * SureSlip - Match Discovery Engine
 *
 * Purpose:
 * Discover and normalize football fixtures for the current day.
 *
 * IMPORTANT:
 * This module DOES NOT predict matches.
 * It only prepares fixtures for administrator verification.
 */

class MatchDiscoveryEngine {
    constructor() {
        this.fixtures = [];
    }

    /**
     * Normalize a discovered fixture
     */
    normalizeFixture(rawFixture) {
        if (!rawFixture) {
            return null;
        }

        const homeTeam = this.cleanText(rawFixture.homeTeam);
        const awayTeam = this.cleanText(rawFixture.awayTeam);
        const league = this.cleanText(rawFixture.league);
        const country = this.cleanText(rawFixture.country);

        if (!homeTeam || !awayTeam) {
            return null;
        }

        return {
            id: this.generateFixtureId(
                league,
                homeTeam,
                awayTeam,
                rawFixture.date
            ),

            league,
            country,
            homeTeam,
            awayTeam,

            date: rawFixture.date || null,
            kickoffTime: rawFixture.kickoffTime || null,

            source: rawFixture.source || "unknown",
            sourceUrl: rawFixture.sourceUrl || null,

            status: "pending",

            discoveredAt: new Date().toISOString()
        };
    }

    /**
     * Clean text received from external sources
     */
    cleanText(value) {
        if (!value) {
            return "";
        }

        return String(value)
            .trim()
            .replace(/\s+/g, " ");
    }

    /**
     * Generate a consistent fixture ID
     */
    generateFixtureId(league, homeTeam, awayTeam, date) {
        const raw = [
            league,
            homeTeam,
            awayTeam,
            date || ""
        ]
            .join("|")
            .toLowerCase();

        return this.simpleHash(raw);
    }

    /**
     * Simple deterministic hash
     */
    simpleHash(value) {
        let hash = 0;

        for (let i = 0; i < value.length; i++) {
            hash =
                (hash << 5) -
                hash +
                value.charCodeAt(i);

            hash |= 0;
        }

        return Math.abs(hash).toString(36);
    }

    /**
     * Remove duplicate fixtures
     */
    removeDuplicates(fixtures) {
        const uniqueFixtures = new Map();

        for (const fixture of fixtures) {
            if (!fixture) continue;

            const key = [
                fixture.date,
                fixture.league,
                fixture.homeTeam,
                fixture.awayTeam
            ]
                .join("|")
                .toLowerCase();

            if (!uniqueFixtures.has(key)) {
                uniqueFixtures.set(key, fixture);
            }
        }

        return Array.from(uniqueFixtures.values());
    }

    /**
     * Validate fixture data
     */
    validateFixture(fixture) {
        const errors = [];

        if (!fixture.homeTeam) {
            errors.push("Missing home team");
        }

        if (!fixture.awayTeam) {
            errors.push("Missing away team");
        }

        if (!fixture.league) {
            errors.push("Missing league");
        }

        if (!fixture.date) {
            errors.push("Missing match date");
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Process discovered fixtures
     */
    processFixtures(rawFixtures) {
        if (!Array.isArray(rawFixtures)) {
            throw new Error(
                "Fixtures must be provided as an array."
            );
        }

        const normalized = rawFixtures
            .map(fixture =>
                this.normalizeFixture(fixture)
            )
            .filter(Boolean);

        const uniqueFixtures =
            this.removeDuplicates(normalized);

        const processed = uniqueFixtures.map(fixture => {
            const validation =
                this.validateFixture(fixture);

            return {
                ...fixture,
                validation
            };
        });

        this.fixtures = processed;

        return processed;
    }

    /**
     * Return fixtures waiting for admin review
     */
    getPendingFixtures() {
        return this.fixtures.filter(
            fixture =>
                fixture.status === "pending"
        );
    }

    /**
     * Admin verifies a fixture
     */
    verifyFixture(fixtureId) {
        const fixture =
            this.fixtures.find(
                item => item.id === fixtureId
            );

        if (!fixture) {
            throw new Error(
                "Fixture not found."
            );
        }

        fixture.status = "verified";

        return fixture;
    }

    /**
     * Admin rejects a fixture
     */
    rejectFixture(fixtureId) {
        const fixture =
            this.fixtures.find(
                item => item.id === fixtureId
            );

        if (!fixture) {
            throw new Error(
                "Fixture not found."
            );
        }

        fixture.status = "rejected";

        return fixture;
    }

    /**
     * Admin selects a verified fixture
     * for statistical analysis.
     */
    selectFixture(fixtureId) {
        const fixture =
            this.fixtures.find(
                item => item.id === fixtureId
            );

        if (!fixture) {
            throw new Error(
                "Fixture not found."
            );
        }

        if (fixture.status !== "verified") {
            throw new Error(
                "Only verified fixtures can be selected."
            );
        }

        fixture.status = "selected";

        return fixture;
    }

    /**
     * Return fixtures selected for prediction
     */
    getSelectedFixtures() {
        return this.fixtures.filter(
            fixture =>
                fixture.status === "selected"
        );
    }
}

module.exports = MatchDiscoveryEngine;
