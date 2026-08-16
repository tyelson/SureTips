/**
 * SureSlip - League Baseline
 *
 * Calculates league-level scoring baselines.
 */

class LeagueBaseline {

    constructor() {
        this.leagues = new Map();
    }

    /**
     * Save league baseline.
     */
    save(data) {

        this.validate(data);

        const key =
            this.normalizeLeague(
                data.league
            );

        const baseline = {

            league:
                data.league,

            gamesPlayed:
                Number(
                    data.gamesPlayed
                ),

            homeGoals:
                Number(
                    data.homeGoals
                ),

            awayGoals:
                Number(
                    data.awayGoals
                ),

            updatedAt:
                new Date().toISOString()
        };

        this.leagues.set(
            key,
            baseline
        );

        return baseline;
    }

    /**
     * Validate baseline.
     */
    validate(data) {

        if (!data) {
            throw new Error(
                "League baseline is required."
            );
        }

        if (!data.league) {
            throw new Error(
                "League name is required."
            );
        }

        const fields = [
            "gamesPlayed",
            "homeGoals",
            "awayGoals"
        ];

        for (const field of fields) {

            if (
                Number.isNaN(
                    Number(data[field])
                ) ||
                Number(data[field]) < 0
            ) {

                throw new Error(
                    `${field} must be a non-negative number.`
                );
            }
        }

        if (
            Number(data.gamesPlayed) === 0
        ) {

            throw new Error(
                "Games played must be greater than zero."
            );
        }
    }

    /**
     * Calculate average home goals.
     */
    getHomeGoalsPerGame(
        league
    ) {

        const baseline =
            this.get(league);

        if (!baseline) {
            return null;
        }

        return (
            baseline.homeGoals /
            baseline.gamesPlayed
        );
    }

    /**
     * Calculate average away goals.
     */
    getAwayGoalsPerGame(
        league
    ) {

        const baseline =
            this.get(league);

        if (!baseline) {
            return null;
        }

        return (
            baseline.awayGoals /
            baseline.gamesPlayed
        );
    }

    /**
     * Get baseline.
     */
    get(league) {

        return this.leagues.get(
            this.normalizeLeague(
                league
            )
        ) || null;
    }

    /**
     * Normalize league name.
     */
    normalizeLeague(league) {

        return String(league)
            .trim()
            .toLowerCase();
    }

    /**
     * Get all league baselines.
     */
    getAll() {

        return Array.from(
            this.leagues.values()
        );
    }
}

module.exports =
    LeagueBaseline;
