/**
 * SureSlip - Poisson Engine Pro
 * --------------------------------
 * Advanced Football Prediction Engine
 *
 * Model:
 * - Poisson distribution
 * - Dixon-Coles low-score correction
 *
 * Features:
 * - 1X2
 * - Double Chance
 * - Draw No Bet
 * - Over/Under
 * - BTTS
 * - BTTS + Result
 * - Asian Handicap
 * - European Handicap
 * - Team goal probabilities
 * - Clean sheets
 * - HT/FT
 * - Full internal correct-score matrix
 * - ONE public Top Exact Score
 *
 * IMPORTANT:
 * The engine calculates the full score matrix internally,
 * but SureSlip displays only the highest-probability score.
 */

class DixonColesEnginePro {

  /**
   * Dixon-Coles Tau correction
   */
  static tau(x, y, lambda, mu, rho) {

    if (x === 0 && y === 0) {
      return 1 - (lambda * mu * rho);
    }

    if (x === 1 && y === 0) {
      return 1 + (mu * rho);
    }

    if (x === 0 && y === 1) {
      return 1 + (lambda * rho);
    }

    if (x === 1 && y === 1) {
      return 1 - rho;
    }

    return 1.0;
  }

  /**
   * Factorial
   */
  static factorial(n) {

    if (n <= 1) {
      return 1;
    }

    let result = 1;

    for (let i = 2; i <= n; i++) {
      result *= i;
    }

    return result;
  }

  /**
   * Poisson Probability Mass Function
   */
  static poissonPmf(k, lambda) {

    if (lambda < 0) {
      throw new Error(
        "Expected goals cannot be negative."
      );
    }

    return (
      Math.pow(lambda, k) *
      Math.exp(-lambda)
    ) / this.factorial(k);
  }

  /**
   * Convert probability to fair decimal odds
   */
  static probToOdds(prob) {

    return prob > 0
      ? Number((1 / prob).toFixed(2))
      : null;
  }

  /**
   * Validate engine inputs
   */
  static validateInputs(
    lambda,
    mu,
    rho,
    maxGoals
  ) {

    if (
      typeof lambda !== "number" ||
      !Number.isFinite(lambda) ||
      lambda < 0
    ) {
      throw new Error(
        "Home expected goals (lambda) must be a valid non-negative number."
      );
    }

    if (
      typeof mu !== "number" ||
      !Number.isFinite(mu) ||
      mu < 0
    ) {
      throw new Error(
        "Away expected goals (mu) must be a valid non-negative number."
      );
    }

    if (
      typeof rho !== "number" ||
      !Number.isFinite(rho)
    ) {
      throw new Error(
        "Dixon-Coles rho must be a valid number."
      );
    }

    if (
      typeof maxGoals !== "number" ||
      !Number.isInteger(maxGoals) ||
      maxGoals < 1
    ) {
      throw new Error(
        "maxGoals must be a positive integer."
      );
    }
  }

  /**
   * Main prediction engine
   *
   * @param {number} lambda Home expected goals
   * @param {number} mu Away expected goals
   * @param {number} rho Dixon-Coles parameter
   * @param {number} maxGoals Matrix goal limit
   */
  static predict(
    lambda,
    mu,
    rho = -0.12,
    maxGoals = 8
  ) {

    this.validateInputs(
      lambda,
      mu,
      rho,
      maxGoals
    );

    /*
     * Full score probability matrix.
     *
     * matrix[homeGoals][awayGoals]
     */
    const matrix = [];

    /*
     * Main result probabilities
     */
    let rawHomeWin = 0;
    let rawDraw = 0;
    let rawAwayWin = 0;

    /*
     * Goal markets
     */
    const totalGoalBuckets = {
      0.5: 0,
      1.5: 0,
      2.5: 0,
      3.5: 0,
      4.5: 0
    };

    /*
     * BTTS
     */
    let bttsYes = 0;

    /*
     * Team props
     */
    let homeCleanSheet = 0;
    let awayCleanSheet = 0;

    const homeGoalsP =
      new Array(maxGoals + 1).fill(0);

    const awayGoalsP =
      new Array(maxGoals + 1).fill(0);

    /*
     * Combination markets
     */
    let homeWinAndBtts = 0;
    let awayWinAndBtts = 0;
    let drawAndBtts = 0;

    /*
     * Internal correct-score collection
     */
    const correctScores = [];

    /*
     * ==========================================
     * BUILD FULL SCORE MATRIX
     * ==========================================
     */

    for (
      let homeGoals = 0;
      homeGoals <= maxGoals;
      homeGoals++
    ) {

      matrix[homeGoals] = [];

      const pHome =
        this.poissonPmf(
          homeGoals,
          lambda
        );

      for (
        let awayGoals = 0;
        awayGoals <= maxGoals;
        awayGoals++
      ) {

        const pAway =
          this.poissonPmf(
            awayGoals,
            mu
          );

        const tauFactor =
          this.tau(
            homeGoals,
            awayGoals,
            lambda,
            mu,
            rho
          );

        const probability =
          pHome *
          pAway *
          tauFactor;

        matrix[homeGoals][awayGoals] =
          probability;

        /*
         * 1X2
         */
        if (homeGoals > awayGoals) {

          rawHomeWin += probability;

        } else if (
          homeGoals === awayGoals
        ) {

          rawDraw += probability;

        } else {

          rawAwayWin += probability;
        }

        /*
         * Goal totals
         */
        const totalGoals =
          homeGoals + awayGoals;

        Object.keys(
          totalGoalBuckets
        ).forEach(line => {

          if (
            totalGoals >
            Number(line)
          ) {

            totalGoalBuckets[line] +=
              probability;
          }
        });

        /*
         * BTTS
         */
        if (
          homeGoals > 0 &&
          awayGoals > 0
        ) {

          bttsYes += probability;

          if (
            homeGoals > awayGoals
          ) {

            homeWinAndBtts +=
              probability;

          } else if (
            awayGoals > homeGoals
          ) {

            awayWinAndBtts +=
              probability;

          } else {

            drawAndBtts +=
              probability;
          }
        }

        /*
         * Clean sheets
         */
        if (awayGoals === 0) {
          homeCleanSheet += probability;
        }

        if (homeGoals === 0) {
          awayCleanSheet += probability;
        }

        /*
         * Exact team goals
         */
        homeGoalsP[homeGoals] +=
          probability;

        awayGoalsP[awayGoals] +=
          probability;

        /*
         * Correct score
         */
        correctScores.push({
          homeGoals,
          awayGoals,
          score:
            `${homeGoals}-${awayGoals}`,
          probability
        });
      }
    }

    /*
     * ==========================================
     * NORMALIZE 1X2
     * ==========================================
     */

    const outcomeTotal =
      rawHomeWin +
      rawDraw +
      rawAwayWin;

    const p1 =
      rawHomeWin / outcomeTotal;

    const pX =
      rawDraw / outcomeTotal;

    const p2 =
      rawAwayWin / outcomeTotal;

    /*
     * ==========================================
     * DOUBLE CHANCE
     * ==========================================
     */

    const dc1X =
      p1 + pX;

    const dc12 =
      p1 + p2;

    const dcX2 =
      pX + p2;

    /*
     * ==========================================
     * DRAW NO BET
     * ==========================================
     */

    const dnbTotal =
      p1 + p2;

    const dnb1 =
      dnbTotal > 0
        ? p1 / dnbTotal
        : 0;

    const dnb2 =
      dnbTotal > 0
        ? p2 / dnbTotal
        : 0;

    /*
     * ==========================================
     * ASIAN HANDICAP
     * ==========================================
     */

    let ahHomeMinus15 = 0;

    for (
      let h = 0;
      h <= maxGoals;
      h++
    ) {

      for (
        let a = 0;
        a <= maxGoals;
        a++
      ) {

        if (
          h - a > 1.5
        ) {

          ahHomeMinus15 +=
            matrix[h][a];
        }
      }
    }

    const ahAwayPlus15 =
      1 - ahHomeMinus15;

    /*
     * ==========================================
     * EUROPEAN HANDICAP -1
     * ==========================================
     */

    let ehHomeWin = 0;
    let ehDraw = 0;
    let ehAwayWin = 0;

    for (
      let h = 0;
      h <= maxGoals;
      h++
    ) {

      for (
        let a = 0;
        a <= maxGoals;
        a++
      ) {

        const probability =
          matrix[h][a];

        const adjustedHome =
          h - 1;

        if (
          adjustedHome > a
        ) {

          ehHomeWin +=
            probability;

        } else if (
          adjustedHome === a
        ) {

          ehDraw +=
            probability;

        } else {

          ehAwayWin +=
            probability;
        }
      }
    }

    /*
     * ==========================================
     * HALF-TIME MODEL
     * ==========================================
     */

    const htLambda =
      lambda * 0.45;

    const htMu =
      mu * 0.45;

    let htHome = 0;
    let htDraw = 0;
    let htAway = 0;

    for (
      let h = 0;
      h <= 5;
      h++
    ) {

      for (
        let a = 0;
        a <= 5;
        a++
      ) {

        const probability =
          this.poissonPmf(
            h,
            htLambda
          ) *
          this.poissonPmf(
            a,
            htMu
          ) *
          this.tau(
            h,
            a,
            htLambda,
            htMu,
            rho
          );

        if (h > a) {

          htHome += probability;

        } else if (h === a) {

          htDraw += probability;

        } else {

          htAway += probability;
        }
      }
    }

    /*
     * HT/FT matrix
     */
    const htftMatrix = {

      "1/1":
        htHome * p1,

      "1/X":
        htHome * pX,

      "1/2":
        htHome * p2,

      "X/1":
        htDraw * p1,

      "X/X":
        htDraw * pX,

      "X/2":
        htDraw * p2,

      "2/1":
        htAway * p1,

      "2/X":
        htAway * pX,

      "2/2":
        htAway * p2
    };

    /*
     * ==========================================
     * TOP EXACT SCORE
     * ==========================================
     *
     * The complete score matrix is calculated
     * above.
     *
     * Only the highest-probability score is
     * exposed to SureSlip users.
     */

    correctScores.sort(
      (a, b) =>
        b.probability -
        a.probability
    );

    const topExactScore =
      correctScores[0];

    /*
     * ==========================================
     * RETURN RESULT
     * ==========================================
     */

    return {

      engine: "Dixon-Coles Poisson Engine Pro",

      version: "SureSlip-1.0",

      inputs: {

        expectedGoalsHome:
          lambda,

        expectedGoalsAway:
          mu,

        rho,

        maxGoals
      },

      /*
       * 1X2
       */
      main1X2: {

        homeWin: {
          prob: p1,
          odds:
            this.probToOdds(p1)
        },

        draw: {
          prob: pX,
          odds:
            this.probToOdds(pX)
        },

        awayWin: {
          prob: p2,
          odds:
            this.probToOdds(p2)
        }
      },

      /*
       * Double Chance
       */
      doubleChance: {

        homeOrDraw: {
          prob: dc1X,
          odds:
            this.probToOdds(dc1X)
        },

        homeOrAway: {
          prob: dc12,
          odds:
            this.probToOdds(dc12)
        },

        drawOrAway: {
          prob: dcX2,
          odds:
            this.probToOdds(dcX2)
        }
      },

      /*
       * Draw No Bet
       */
      drawNoBet: {

        home: {
          prob: dnb1,
          odds:
            this.probToOdds(dnb1)
        },

        away: {
          prob: dnb2,
          odds:
            this.probToOdds(dnb2)
        }
      },

      /*
       * Over / Under
       */
      goalsOverUnder: {

        over05: {
          prob:
            totalGoalBuckets[0.5],
          odds:
            this.probToOdds(
              totalGoalBuckets[0.5]
            )
        },

        under05: {
          prob:
            1 -
            totalGoalBuckets[0.5],
          odds:
            this.probToOdds(
              1 -
              totalGoalBuckets[0.5]
            )
        },

        over15: {
          prob:
            totalGoalBuckets[1.5],
          odds:
            this.probToOdds(
              totalGoalBuckets[1.5]
            )
        },

        under15: {
          prob:
            1 -
            totalGoalBuckets[1.5],
          odds:
            this.probToOdds(
              1 -
              totalGoalBuckets[1.5]
            )
        },

        over25: {
          prob:
            totalGoalBuckets[2.5],
          odds:
            this.probToOdds(
              totalGoalBuckets[2.5]
            )
        },

        under25: {
          prob:
            1 -
            totalGoalBuckets[2.5],
          odds:
            this.probToOdds(
              1 -
              totalGoalBuckets[2.5]
            )
        },

        over35: {
          prob:
            totalGoalBuckets[3.5],
          odds:
            this.probToOdds(
              totalGoalBuckets[3.5]
            )
        },

        under35: {
          prob:
            1 -
            totalGoalBuckets[3.5],
          odds:
            this.probToOdds(
              1 -
              totalGoalBuckets[3.5]
            )
        },

        over45: {
          prob:
            totalGoalBuckets[4.5],
          odds:
            this.probToOdds(
              totalGoalBuckets[4.5]
            )
        },

        under45: {
          prob:
            1 -
            totalGoalBuckets[4.5],
          odds:
            this.probToOdds(
              1 -
              totalGoalBuckets[4.5]
            )
        }
      },

      /*
       * BTTS
       */
      btts: {

        yes: {
          prob: bttsYes,
          odds:
            this.probToOdds(
              bttsYes
            )
        },

        no: {
          prob:
            1 - bttsYes,
          odds:
            this.probToOdds(
              1 - bttsYes
            )
        }
      },

      /*
       * BTTS + Result
       */
      comboMarkets: {

        homeWinAndBtts: {
          prob:
            homeWinAndBtts,
          odds:
            this.probToOdds(
              homeWinAndBtts
            )
        },

        awayWinAndBtts: {
          prob:
            awayWinAndBtts,
          odds:
            this.probToOdds(
              awayWinAndBtts
            )
        },

        drawAndBtts: {
          prob:
            drawAndBtts,
          odds:
            this.probToOdds(
              drawAndBtts
            )
        }
      },

      /*
       * Asian Handicap
       */
      asianHandicap: {

        homeMinus15: {
          prob:
            ahHomeMinus15,
          odds:
            this.probToOdds(
              ahHomeMinus15
            )
        },

        awayPlus15: {
          prob:
            ahAwayPlus15,
          odds:
            this.probToOdds(
              ahAwayPlus15
            )
        }
      },

      /*
       * European Handicap
       */
      europeanHandicap01: {

        homeHandicapMinus1: {
          prob:
            ehHomeWin,
          odds:
            this.probToOdds(
              ehHomeWin
            )
        },

        handicapDraw: {
          prob:
            ehDraw,
          odds:
            this.probToOdds(
              ehDraw
            )
        },

        awayHandicapPlus1: {
          prob:
            ehAwayWin,
          odds:
            this.probToOdds(
              ehAwayWin
            )
        }
      },

      /*
       * Team Props
       */
      teamProps: {

        homeCleanSheet: {
          prob:
            homeCleanSheet,
          odds:
            this.probToOdds(
              homeCleanSheet
            )
        },

        awayCleanSheet: {
          prob:
            awayCleanSheet,
          odds:
            this.probToOdds(
              awayCleanSheet
            )
        },

        homeToScore: {
          prob:
            1 - awayCleanSheet,
          odds:
            this.probToOdds(
              1 - awayCleanSheet
            )
        },

        awayToScore: {
          prob:
            1 - homeCleanSheet,
          odds:
            this.probToOdds(
              1 - homeCleanSheet
            )
        }
      },

      /*
       * HT/FT
       */
      htft:
        Object.fromEntries(
          Object.entries(
            htftMatrix
          ).map(
            ([key, value]) => [
              key,
              {
                prob: value,
                odds:
                  this.probToOdds(
                    value
                  )
              }
            ]
          )
        ),

      /*
       * ONE TOP EXACT SCORE
       *
       * This is the only correct-score
       * prediction exposed to the app.
       */
      topExactScore: {

        score:
          topExactScore.score,

        homeGoals:
          topExactScore.homeGoals,

        awayGoals:
          topExactScore.awayGoals,

        prob:
          topExactScore.probability,

        odds:
          this.probToOdds(
            topExactScore.probability
          )
      },

      /*
       * Internal matrix is deliberately
       * not returned to the public UI.
       *
       * The engine uses it internally to
       * determine the most probable score.
       */
    };
  }
}


/*
 * Export the engine so other SureSlip
 * modules can use it.
 */
module.exports =
  DixonColesEnginePro;
