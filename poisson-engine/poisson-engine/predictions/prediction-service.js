/**
 * SureSlip - Prediction Service
 *
 * Connects:
 *
 * Selected Fixture
 *       ↓
 * Team Statistics
 *       ↓
 * League Baseline
 *       ↓
 * Lambda Calculator
 *       ↓
 * Poisson Engine Pro
 *
 * The service returns ONE Top Exact Score
 * plus the supported prediction markets.
 */

const TeamStatistics =
    require("../database/team-statistics");

const LeagueBaseline =
    require("../database/league-baseline");

const LambdaCalculator =
    require("../poisson-engine/lambda-calculator");

const PoissonEnginePro =
    require("../poisson-engine/poisson-engine-pro");


class PredictionService {

    constructor(options = {}) {

        this.teamStatistics =
            options.teamStatistics ||
            new TeamStatistics();

        this.leagueBaseline =
            options.leagueBaseline ||
            new LeagueBaseline();

        this.engine =
            options.engine ||
            PoissonEnginePro;
    }


    /**
     * Generate prediction for a selected fixture.
     */
    predict({
        homeTeam,
        awayTeam,
        league,
        rho = -0.12,
        maxGoals = 8
    }) {

        /*
         * ------------------------------------
         * 1. Get team statistics
         * ------------------------------------
         */

        const homeStats =
            this.teamStatistics.get(
                homeTeam,
                league
            );

        const awayStats =
            this.teamStatistics.get(
                awayTeam,
                league
            );

        if (!homeStats) {

            throw new Error(
                `Statistics not found for ${homeTeam}.`
            );
        }

        if (!awayStats) {

            throw new Error(
                `Statistics not found for ${awayTeam}.`
            );
        }


        /*
         * ------------------------------------
         * 2. Get league baseline
         * ------------------------------------
         */

        const baseline =
            this.leagueBaseline.get(
                league
            );

        if (!baseline) {

            throw new Error(
                `League baseline not found for ${league}.`
            );
        }


        /*
         * ------------------------------------
         * 3. Calculate expected goals
         * ------------------------------------
         */

        const lambda =
            LambdaCalculator.calculate({

                homeTeam: homeStats,

                awayTeam: awayStats,

                leagueBaseline: baseline
            });


        const expectedHomeGoals =
            lambda.home.expectedGoals;

        const expectedAwayGoals =
            lambda.away.expectedGoals;


        /*
         * ------------------------------------
         * 4. Run Poisson Engine Pro
         * ------------------------------------
         */

        const prediction =
            this.engine.predict(

                expectedHomeGoals,

                expectedAwayGoals,

                rho,

                maxGoals
            );


        /*
         * ------------------------------------
         * 5. Return unified prediction
         * ------------------------------------
         */

        return {

            match: {

                homeTeam,

                awayTeam,

                league
            },


            expectedGoals: {

                home:
                    expectedHomeGoals,

                away:
                    expectedAwayGoals
            },


            model: {

                rho,

                maxGoals,

                engine:
                    prediction.engine,

                version:
                    prediction.version
            },


            /*
             * ONE exact score only
             */
            topExactScore:
                prediction.topExactScore,


            /*
             * Main markets
             */
            main1X2:
                prediction.main1X2,


            doubleChance:
                prediction.doubleChance,


            drawNoBet:
                prediction.drawNoBet,


            goalsOverUnder:
                prediction.goalsOverUnder,


            btts:
                prediction.btts,


            comboMarkets:
                prediction.comboMarkets,


            asianHandicap:
                prediction.asianHandicap,


            europeanHandicap01:
                prediction.europeanHandicap01,


            teamProps:
                prediction.teamProps,


            htft:
                prediction.htft,


            /*
             * Store the model inputs used.
             */
            calculationDetails: {

                lambdaHome:
                    expectedHomeGoals,

                lambdaAway:
                    expectedAwayGoals,

                homeAttackStrength:
                    lambda.home.attackStrength,

                awayAttackStrength:
                    lambda.away.attackStrength,

                homeDefenceWeakness:
                    lambda.home.defenceWeakness,

                awayDefenceWeakness:
                    lambda.away.defenceWeakness,

                leagueHomeGoalsPerGame:
                    lambda.league.homeGoalsPerGame,

                leagueAwayGoalsPerGame:
                    lambda.league.awayGoalsPerGame
            },

            generatedAt:
                new Date().toISOString()
        };
    }
}


module.exports =
    PredictionService;
