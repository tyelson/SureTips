/**
 * SureSlip - Best Market Selector
 *
 * Reviews model probabilities and selects
 * the strongest qualifying betting market.
 *
 * IMPORTANT:
 * - The model probability is not a guarantee.
 * - Markets are ranked by probability.
 * - Exact score is handled separately.
 */

class BestMarketSelector {

    /**
     * Default minimum probability.
     *
     * A market must reach this probability
     * before it can become the recommended pick.
     */
    static DEFAULT_MIN_PROBABILITY = 0.65;


    /**
     * Select the best market.
     */
    static select(
        prediction,
        options = {}
    ) {

        const minProbability =
            options.minProbability ??
            this.DEFAULT_MIN_PROBABILITY;


        const candidates = [];


        /*
         * ------------------------------------
         * 1X2
         * ------------------------------------
         */

        this.addCandidate(
            candidates,
            "Home Win",
            "1X2",
            prediction.main1X2?.homeWin,
            minProbability
        );

        this.addCandidate(
            candidates,
            "Draw",
            "1X2",
            prediction.main1X2?.draw,
            minProbability
        );

        this.addCandidate(
            candidates,
            "Away Win",
            "1X2",
            prediction.main1X2?.awayWin,
            minProbability
        );


        /*
         * ------------------------------------
         * Double Chance
         * ------------------------------------
         */

        this.addCandidate(
            candidates,
            "Home or Draw",
            "Double Chance",
            prediction.doubleChance?.homeOrDraw,
            minProbability
        );

        this.addCandidate(
            candidates,
            "Home or Away",
            "Double Chance",
            prediction.doubleChance?.homeOrAway,
            minProbability
        );

        this.addCandidate(
            candidates,
            "Draw or Away",
            "Double Chance",
            prediction.doubleChance?.drawOrAway,
            minProbability
        );


        /*
         * ------------------------------------
         * Draw No Bet
         * ------------------------------------
         */

        this.addCandidate(
            candidates,
            "Home Draw No Bet",
            "DNB",
            prediction.drawNoBet?.home,
            minProbability
        );

        this.addCandidate(
            candidates,
            "Away Draw No Bet",
            "DNB",
            prediction.drawNoBet?.away,
            minProbability
        );


        /*
         * ------------------------------------
         * Goals
         * ------------------------------------
         */

        this.addCandidate(
            candidates,
            "Over 0.5 Goals",
            "Goals",
            prediction.goalsOverUnder?.over05,
            minProbability
        );

        this.addCandidate(
            candidates,
            "Under 0.5 Goals",
            "Goals",
            prediction.goalsOverUnder?.under05,
            minProbability
        );

        this.addCandidate(
            candidates,
            "Over 1.5 Goals",
            "Goals",
            prediction.goalsOverUnder?.over15,
            minProbability
        );

        this.addCandidate(
            candidates,
            "Under 1.5 Goals",
            "Goals",
            prediction.goalsOverUnder?.under15,
            minProbability
        );

        this.addCandidate(
            candidates,
            "Over 2.5 Goals",
            "Goals",
            prediction.goalsOverUnder?.over25,
            minProbability
        );

        this.addCandidate(
            candidates,
            "Under 2.5 Goals",
            "Goals",
            prediction.goalsOverUnder?.under25,
            minProbability
        );

        this.addCandidate(
            candidates,
            "Over 3.5 Goals",
            "Goals",
            prediction.goalsOverUnder?.over35,
            minProbability
        );

        this.addCandidate(
            candidates,
            "Under 3.5 Goals",
            "Goals",
            prediction.goalsOverUnder?.under35,
            minProbability
        );

        this.addCandidate(
            candidates,
            "Over 4.5 Goals",
            "Goals",
            prediction.goalsOverUnder?.over45,
            minProbability
        );

        this.addCandidate(
            candidates,
            "Under 4.5 Goals",
            "Goals",
            prediction.goalsOverUnder?.under45,
            minProbability
        );


        /*
         * ------------------------------------
         * BTTS
         * ------------------------------------
         */

        this.addCandidate(
            candidates,
            "BTTS - Yes",
            "BTTS",
            prediction.btts?.yes,
            minProbability
        );

        this.addCandidate(
            candidates,
            "BTTS - No",
            "BTTS",
            prediction.btts?.no,
            minProbability
        );


        /*
         * ------------------------------------
         * Asian Handicap
         * ------------------------------------
         */

        this.addCandidate(
            candidates,
            "Home -1.5",
            "Asian Handicap",
            prediction.asianHandicap?.homeMinus15,
            minProbability
        );

        this.addCandidate(
            candidates,
            "Away +1.5",
            "Asian Handicap",
            prediction.asianHandicap?.awayPlus15,
            minProbability
        );


        /*
         * ------------------------------------
         * Sort by probability
         * ------------------------------------
         */

        candidates.sort(
            (a, b) =>
                b.probability -
                a.probability
        );


        /*
         * No qualifying market
         */

        if (candidates.length === 0) {

            return {

                available: false,

                message:
                    "No market reached the minimum confidence threshold.",

                threshold:
                    minProbability
            };
        }


        /*
         * Best market
         */

        const best =
            candidates[0];


        return {

            available: true,

            market:
                best.market,

            selection:
                best.selection,

            probability:
                best.probability,

            probabilityPercent:
                this.toPercent(
                    best.probability
                ),

            fairOdds:
                best.odds,

            confidence:
                this.confidenceLevel(
                    best.probability
                ),

            threshold:
                minProbability
        };
    }


    /**
     * Add a market candidate.
     */
    static addCandidate(
        candidates,
        selection,
        market,
        data,
        minProbability
    ) {

        if (!data) {
            return;
        }

        const probability =
            Number(data.prob);

        if (
            !Number.isFinite(
                probability
            )
        ) {

            return;
        }

        if (
            probability <
            minProbability
        ) {

            return;
        }

        candidates.push({

            selection,

            market,

            probability,

            odds:
                data.odds ?? null
        });
    }


    /**
     * Convert probability to percentage.
     */
    static toPercent(
        probability
    ) {

        return Number(
            (
                probability *
                100
            ).toFixed(2)
        );
    }


    /**
     * Confidence classification.
     */
    static confidenceLevel(
        probability
    ) {

        const percent =
            probability * 100;

        if (percent >= 80) {
            return "Very High";
        }

        if (percent >= 75) {
            return "High";
        }

        if (percent >= 70) {
            return "Good";
        }

        if (percent >= 65) {
            return "Moderate";
        }

        return "Low";
    }
}


module.exports =
    BestMarketSelector;
