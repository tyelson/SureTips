/**
 * SureSlip - Expected Goals (Lambda) Calculator
 *
 * Converts team statistics + league baseline
 * into the expected goals required by
 * Poisson Engine Pro.
 *
 * IMPORTANT:
 * This module calculates the model inputs.
 * It does not calculate match probabilities.
 */

class LambdaCalculator {

    /**
     * Calculate expected goals for a match.
     *
     * Method:
     *
     * Home Attack Strength =
     * Home GF per Home Game /
     * League Home Goals per Game
     *
     * Away Defence Weakness =
     * Away GA per Away Game /
     * League Home Goals per Game
     *
     * Home Lambda =
     * League Home Goals per Game *
     * Home Attack Strength *
     * Away Defence Weakness
     *
     * Away Lambda =
     * League Away Goals per Game *
     * Away Attack Strength *
     * Home Defence Weakness
     */

    static calculate({
        homeTeam,
        awayTeam,
        leagueBaseline
    }) {

        this.validate(
            homeTeam,
            awayTeam,
            leagueBaseline
        );

        /*
         * League scoring averages
         */

        const leagueHomeGoalsPerGame =
            leagueBaseline.homeGoals /
            leagueBaseline.gamesPlayed;

        const leagueAwayGoalsPerGame =
            leagueBaseline.awayGoals /
            leagueBaseline.gamesPlayed;

        if (
            leagueHomeGoalsPerGame <= 0 ||
            leagueAwayGoalsPerGame <= 0
        ) {

            throw new Error(
                "League goal averages must be greater than zero."
            );
        }

        /*
         * Team attacking strengths
         */

        const homeAttackStrength =
            (
                homeTeam.home.GF /
                homeTeam.home.GP
            ) /
            leagueHomeGoalsPerGame;

        const awayAttackStrength =
            (
                awayTeam.away.GF /
                awayTeam.away.GP
            ) /
            leagueAwayGoalsPerGame;

        /*
         * Team defensive weaknesses
         */

        const homeDefenceWeakness =
            (
                homeTeam.home.GA /
                homeTeam.home.GP
            ) /
            leagueAwayGoalsPerGame;

        const awayDefenceWeakness =
            (
                awayTeam.away.GA /
                awayTeam.away.GP
            ) /
            leagueHomeGoalsPerGame;

        /*
         * Expected goals
         */

        const lambdaHome =
            leagueHomeGoalsPerGame *
            homeAttackStrength *
            awayDefenceWeakness;

        const lambdaAway =
            leagueAwayGoalsPerGame *
            awayAttackStrength *
            homeDefenceWeakness;

        return {

            home: {
                expectedGoals:
                    this.round(
                        lambdaHome
                    ),

                attackStrength:
                    this.round(
                        homeAttackStrength
                    ),

                defenceWeakness:
                    this.round(
                        homeDefenceWeakness
                    )
            },

            away: {
                expectedGoals:
                    this.round(
                        lambdaAway
                    ),

                attackStrength:
                    this.round(
                        awayAttackStrength
                    ),

                defenceWeakness:
                    this.round(
                        awayDefenceWeakness
                    )
            },

            league: {

                gamesPlayed:
                    leagueBaseline.gamesPlayed,

                homeGoalsPerGame:
                    this.round(
                        leagueHomeGoalsPerGame
                    ),

                awayGoalsPerGame:
                    this.round(
                        leagueAwayGoalsPerGame
                    )
            }
        };
    }

    /**
     * Validate inputs.
     */
    static validate(
        homeTeam,
        awayTeam,
        leagueBaseline
    ) {

        if (!homeTeam) {
            throw new Error(
                "Home team statistics are required."
            );
        }

        if (!awayTeam) {
            throw new Error(
                "Away team statistics are required."
            );
        }

        if (!leagueBaseline) {
            throw new Error(
                "League baseline is required."
            );
        }

        if (
            homeTeam.home.GP <= 0
        ) {

            throw new Error(
                "Home team must have home games recorded."
            );
        }

        if (
            awayTeam.away.GP <= 0
        ) {

            throw new Error(
                "Away team must have away games recorded."
            );
        }

        if (
            leagueBaseline.gamesPlayed <= 0
        ) {

            throw new Error(
                "League baseline must contain games played."
            );
        }
    }

    /**
     * Round calculations.
     */
    static round(value) {

        return Number(
            value.toFixed(4)
        );
    }
}

module.exports =
    LambdaCalculator;
