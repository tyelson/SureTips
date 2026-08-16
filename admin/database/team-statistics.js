/**
 * SureSlip - Team Statistics
 *
 * Stores and validates the statistics required
 * by Poisson Engine Pro.
 *
 * Preferred structure:
 *
 * Team | GP | GF | GA |
 * Home GP | Home GF | Home GA |
 * Away GP | Away GF | Away GA
 */

class TeamStatistics {

    constructor() {
        this.teams = new Map();
    }

    /**
     * Add or update team statistics.
     */
    save(stats) {

        this.validate(stats);

        const teamId =
            this.createTeamId(
                stats.team,
                stats.league
            );

        const record = {
            team: stats.team,
            league: stats.league,

            GP: Number(stats.GP || 0),
            GF: Number(stats.GF || 0),
            GA: Number(stats.GA || 0),

            home: {
                GP: Number(
                    stats.homeGP || 0
                ),

                GF: Number(
                    stats.homeGF || 0
                ),

                GA: Number(
                    stats.homeGA || 0
                )
            },

            away: {
                GP: Number(
                    stats.awayGP || 0
                ),

                GF: Number(
                    stats.awayGF || 0
                ),

                GA: Number(
                    stats.awayGA || 0
                )
            },

            updatedAt:
                new Date().toISOString()
        };

        this.teams.set(
            teamId,
            record
        );

        return record;
    }

    /**
     * Validate statistics.
     */
    validate(stats) {

        if (!stats) {
            throw new Error(
                "Statistics are required."
            );
        }

        if (!stats.team) {
            throw new Error(
                "Team name is required."
            );
        }

        if (!stats.league) {
            throw new Error(
                "League is required."
            );
        }

        const numericFields = [
            "GP",
            "GF",
            "GA",
            "homeGP",
            "homeGF",
            "homeGA",
            "awayGP",
            "awayGF",
            "awayGA"
        ];

        for (const field of numericFields) {

            if (
                stats[field] !== undefined &&
                (
                    Number.isNaN(
                        Number(stats[field])
                    ) ||
                    Number(stats[field]) < 0
                )
            ) {
                throw new Error(
                    `${field} must be a non-negative number.`
                );
            }
        }
    }

    /**
     * Create unique team identifier.
     */
    createTeamId(team, league) {

        return [
            league,
            team
        ]
            .join("|")
            .toLowerCase()
            .trim();
    }

    /**
     * Get team statistics.
     */
    get(team, league) {

        const teamId =
            this.createTeamId(
                team,
                league
            );

        return this.teams.get(
            teamId
        ) || null;
    }

    /**
     * Get all teams in a league.
     */
    getLeagueTeams(league) {

        return Array.from(
            this.teams.values()
        ).filter(
            record =>
                record.league
                    .toLowerCase() ===
                league
                    .toLowerCase()
        );
    }

    /**
     * Return statistics in the
     * preferred SureSlip table format.
     */
    getTableData(league) {

        return this.getLeagueTeams(
            league
        ).map(team => ({

            Team:
                team.team,

            GP:
                team.GP,

            GF:
                team.GF,

            GA:
                team.GA,

            "Home GP":
                team.home.GP,

            "Home GF":
                team.home.GF,

            "Home GA":
                team.home.GA,

            "Away GP":
                team.away.GP,

            "Away GF":
                team.away.GF,

            "Away GA":
                team.away.GA
        }));
    }

    /**
     * Delete team statistics.
     */
    delete(team, league) {

        const teamId =
            this.createTeamId(
                team,
                league
            );

        return this.teams.delete(
            teamId
        );
    }

    /**
     * Clear all stored statistics.
     */
    clear() {

        this.teams.clear();
    }
}

module.exports =
    TeamStatistics;
