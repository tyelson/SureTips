/**
 * SureSlip - Poisson Engine Pro Adapter
 *
 * Connects the SureSlip statistics layer to the
 * existing Poisson Engine Pro.
 *
 * IMPORTANT:
 * This adapter does NOT replace or modify the
 * Poisson Engine Pro mathematical model.
 */

const TeamStatistics =
    require("../database/team-statistics");

const LeagueBaseline =
    require("../database/league-baseline");

class PoissonAdapter {

    constructor(options = {}) {

        this.teamStatistics =
            options.teamStatistics ||
            new TeamStatistics();

        this.leagueBaseline =
            options.leagueBaseline ||
            new LeagueBaseline();

        /*
         * The actual Poisson Engine Pro instance
         * will be connected here after we inspect
         * the exported interface of
         * poisson-engine-pro.js.
         */
        this.engine =
            options.engine || null;
    }

    /**
     * Set the existing Poisson Engine Pro.
     */
    setEngine(engine) {

        if (!engine) {
            throw new Error(
                "A Poisson Engine Pro instance is required."
            );
        }

        this.engine = engine;

        return this.engine;
    }

    /**
     * Get all required inputs for a match.
     */
    buildMatchInput({
        homeTeam,
        awayTeam,
        league
    }) {

        if (!homeTeam) {
            throw new Error(
                "Home team is required."
            );
        }

        if (!awayTeam) {
            throw new Error(
                "Away team is required."
            );
        }

        if (!league) {
            throw new Error(
                "League is required."
            );
        }

        const home =
            this.teamStatistics.get(
                homeTeam,
                league
            );

        const away =
            this.teamStatistics.get(
                awayTeam,
                league
            );

        const baseline =
            this.leagueBaseline.get(
                league
            );

        if (!home) {
            throw new Error(
                `Statistics not found for ${homeTeam}.`
            );
        }

        if (!away) {
            throw new Error(
                `Statistics not found for ${awayTeam}.`
            );
        }

        if (!baseline) {
            throw new Error(
                `League baseline not found for ${league}.`
            );
        }

        return {
            match: {
                homeTeam,
                awayTeam,
                league
            },

            homeTeamStats: home,
            awayTeamStats: away,

            leagueBaseline: baseline
        };
    }

    /**
     * Run the existing Poisson Engine Pro.
     *
     * The exact method call will be connected
     * after inspecting the current engine code.
     */
    predict(match) {

        if (!this.engine) {
            throw new Error(
                "Poisson Engine Pro has not been connected."
            );
        }

        const input =
            this.buildMatchInput(
                match
            );

        /*
         * DO NOT invent or modify the engine's
         * mathematical interface here.
         *
         * The exact call will depend on the
         * functions exported by
         * poisson-engine-pro.js.
         */

        if (
            typeof this.engine.predict ===
            "function"
        ) {

            return this.engine.predict(
                input
            );
        }

        if (
            typeof this.engine.calculate ===
            "function"
        ) {

            return this.engine.calculate(
                input
            );
        }

        throw new Error(
            "Poisson Engine Pro does not expose a supported predict or calculate method."
        );
    }
}

module.exports =
    PoissonAdapter;
