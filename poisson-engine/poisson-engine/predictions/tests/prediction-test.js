/**
 * SureSlip - Prediction Pipeline Test
 *
 * Tests:
 * Team Statistics
 * League Baseline
 * Lambda Calculator
 * Poisson Engine Pro
 * Best Market Selector
 * Prediction Service
 */

const TeamStatistics =
    require("../database/team-statistics");

const LeagueBaseline =
    require("../database/league-baseline");

const PredictionService =
    require("../predictions/prediction-service");


/*
 * ==========================================
 * CREATE TEST DATABASE
 * ==========================================
 */

const teamStatistics =
    new TeamStatistics();

const leagueBaseline =
    new LeagueBaseline();


/*
 * ==========================================
 * TEST LEAGUE BASELINE
 * ==========================================
 *
 * Example:
 *
 * 100 games
 * 145 home goals
 * 110 away goals
 */

leagueBaseline.save({

    league:
        "Test Premier League",

    gamesPlayed:
        100,

    homeGoals:
        145,

    awayGoals:
        110

});


/*
 * ==========================================
 * TEST HOME TEAM
 * ==========================================
 */

teamStatistics.save({

    team:
        "Test United",

    league:
        "Test Premier League",

    GP:
        20,

    GF:
        32,

    GA:
        22,

    homeGP:
        10,

    homeGF:
        20,

    homeGA:
        9,

    awayGP:
        10,

    awayGF:
        12,

    awayGA:
        13

});


/*
 * ==========================================
 * TEST AWAY TEAM
 * ==========================================
 */

teamStatistics.save({

    team:
        "Test City",

    league:
        "Test Premier League",

    GP:
        20,

    GF:
        27,

    GA:
        25,

    homeGP:
        10,

    homeGF:
        15,

    homeGA:
        11,

    awayGP:
        10,

    awayGF:
        12,

    awayGA:
        14

});


/*
 * ==========================================
 * CREATE PREDICTION SERVICE
 * ==========================================
 */

const predictionService =
    new PredictionService({

        teamStatistics,

        leagueBaseline

    });


/*
 * ==========================================
 * RUN PREDICTION
 * ==========================================
 */

try {

    const prediction =
        predictionService.predict({

            homeTeam:
                "Test United",

            awayTeam:
                "Test City",

            league:
                "Test Premier League",

            rho:
                -0.12,

            maxGoals:
                8,

            minMarketProbability:
                0.65

        });


    /*
     * ======================================
     * DISPLAY RESULT
     * ======================================
     */

    console.log(
        "\n===================================="
    );

    console.log(
        "SURESLIP PREDICTION TEST"
    );

    console.log(
        "====================================\n"
    );


    console.log(
        "Match:"
    );

    console.log(
        `${prediction.match.homeTeam} vs ${prediction.match.awayTeam}`
    );


    console.log(
        `League: ${prediction.match.league}`
    );


    console.log(
        "\nExpected Goals:"
    );

    console.log(
        `Home: ${prediction.expectedGoals.home}`
    );

    console.log(
        `Away: ${prediction.expectedGoals.away}`
    );


    /*
     * TOP EXACT SCORE
     */

    console.log(
        "\nTOP EXACT SCORE:"
    );

    console.log(
        prediction.topExactScore.score
    );

    console.log(
        `Probability: ${
            (
                prediction.topExactScore.prob *
                100
            ).toFixed(2)
        }%`
    );

    console.log(
        `Fair Odds: ${
            prediction.topExactScore.odds
        }`
    );


    /*
     * BEST MARKET
     */

    console.log(
        "\nBEST MARKET:"
    );

    if (
        prediction.bestMarket.available
    ) {

        console.log(
            prediction.bestMarket.selection
        );

        console.log(
            `Probability: ${
                prediction.bestMarket.probabilityPercent
            }%`
        );

        console.log(
            `Fair Odds: ${
                prediction.bestMarket.fairOdds
            }`
        );

        console.log(
            `Confidence: ${
                prediction.bestMarket.confidence
            }`
        );

    } else {

        console.log(
            prediction.bestMarket.message
        );

    }


    /*
     * 1X2
     */

    console.log(
        "\n1X2:"
    );

    console.log(
        `Home: ${
            (
                prediction.main1X2.homeWin.prob *
                100
            ).toFixed(2)
        }%`
    );

    console.log(
        `Draw: ${
            (
                prediction.main1X2.draw.prob *
                100
            ).toFixed(2)
        }%`
    );

    console.log(
        `Away: ${
            (
                prediction.main1X2.awayWin.prob *
                100
            ).toFixed(2)
        }%`
    );


    /*
     * BTTS
     */

    console.log(
        "\nBTTS:"
    );

    console.log(
        `Yes: ${
            (
                prediction.btts.yes.prob *
                100
            ).toFixed(2)
        }%`
    );

    console.log(
        `No: ${
            (
                prediction.btts.no.prob *
                100
            ).toFixed(2)
        }%`
    );


    /*
     * ======================================
     * VALIDATION
     * ======================================
     */

    console.log(
        "\n===================================="
    );

    console.log(
        "VALIDATION"
    );

    console.log(
        "===================================="
    );


    /*
     * Check top exact score
     */

    if (
        !prediction.topExactScore ||
        !prediction.topExactScore.score
    ) {

        throw new Error(
            "FAIL: Top exact score missing."
        );

    }

    console.log(
        "✓ Top exact score exists"
    );


    /*
     * Ensure probability is valid
     */

    if (
        prediction.topExactScore.prob <= 0 ||
        prediction.topExactScore.prob > 1
    ) {

        throw new Error(
            "FAIL: Invalid exact-score probability."
        );

    }

    console.log(
        "✓ Exact-score probability valid"
    );


    /*
     * Check expected goals
     */

    if (
        prediction.expectedGoals.home <= 0 ||
        prediction.expectedGoals.away <= 0
    ) {

        throw new Error(
            "FAIL: Invalid expected goals."
        );

    }

    console.log(
        "✓ Expected goals valid"
    );


    /*
     * Check 1X2 total
     */

    const resultTotal =
        prediction.main1X2.homeWin.prob +
        prediction.main1X2.draw.prob +
        prediction.main1X2.awayWin.prob;


    if (
        Math.abs(
            resultTotal - 1
        ) > 0.001
    ) {

        throw new Error(
            `FAIL: 1X2 probabilities do not sum to 1. Total = ${resultTotal}`
        );

    }

    console.log(
        "✓ 1X2 probabilities normalize correctly"
    );


    /*
     * Check BTTS total
     */

    const bttsTotal =
        prediction.btts.yes.prob +
        prediction.btts.no.prob;


    if (
        Math.abs(
            bttsTotal - 1
        ) > 0.001
    ) {

        throw new Error(
            `FAIL: BTTS probabilities do not sum to 1. Total = ${bttsTotal}`
        );

    }

    console.log(
        "✓ BTTS probabilities normalize correctly"
    );


    /*
     * Check market selector
     */

    if (
        !prediction.bestMarket
    ) {

        throw new Error(
            "FAIL: Best market selector did not return a result."
        );

    }

    console.log(
        "✓ Best market selector working"
    );


    /*
     * Final status
     */

    console.log(
        "\n===================================="
    );

    console.log(
        "ALL SURESLIP TESTS PASSED ✓"
    );

    console.log(
        "====================================\n"
    );


} catch (error) {

    console.error(
        "\n❌ TEST FAILED"
    );

    console.error(
        error.message
    );

    process.exitCode = 1;
}
