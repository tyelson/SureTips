/**
 * Advanced Football Prediction Engine (Poisson + Dixon-Coles)
 * Expanded Betting Markets Edition
 * 
 * Features:
 * - Low-score dependence correction via Dixon-Coles Tau factor
 * - Full Match Outcome (1X2, Double Chance, Draw No Bet)
 * - Over/Under Goals (0.5, 1.5, 2.5, 3.5, 4.5)
 * - Asian Handicap & European Handicap
 * - Both Teams to Score (BTTS) & BTTS + Win combos
 * - Half-Time / Full-Time (HT/FT) Matrix Simulation
 * - Correct Score Probabilities (Top selections)
 * - Team Exact Goals & Clean Sheets
 */

class DixonColesEnginePro {
  /**
   * Dixon-Coles Tau adjustment factor for low goal counts
   */
  static tau(x, y, lambda, mu, rho) {
    if (x === 0 && y === 0) return 1 - (lambda * mu * rho);
    if (x === 1 && y === 0) return 1 + (mu * rho);
    if (x === 0 && y === 1) return 1 + (lambda * rho);
    if (x === 1 && y === 1) return 1 - rho;
    return 1.0;
  }

  /**
   * Poisson Probability Mass Function
   */
  static poissonPmf(k, lambda) {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / DixonColesEnginePro.factorial(k);
  }

  /**
   * Utility: Factorial helper
   */
  static factorial(n) {
    if (n <= 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  /**
   * Helper to format decimal odds from probability
   */
  static probToOdds(prob) {
    return prob > 0 ? parseFloat((1 / prob).toFixed(2)) : null;
  }

  /**
   * Core Engine Execution
   * 
   * @param {number} lambda - Home Expected Goals (xG)
   * @param {number} mu - Away Expected Goals (xG)
   * @param {number} rho - Dixon-Coles dependence parameter (-0.15 to 0.0)
   * @param {number} maxGoals - Goal limit cap for matrix calculation
   */
  static predict(lambda, mu, rho = -0.12, maxGoals = 8) {
    const matrix = [];
    
    // Aggregators for 1X2
    let rawHomeWin = 0;
    let rawDraw = 0;
    let rawAwayWin = 0;

    // Goal totals accumulators
    const totalGoalBuckets = { 0.5: 0, 1.5: 0, 2.5: 0, 3.5: 0, 4.5: 0 };
    
    // Both Teams to Score
    let bttsYes = 0;

    // Team specific accumulators
    let homeCleanSheet = 0;
    let awayCleanSheet = 0;
    const homeGoalsP = new Array(maxGoals + 1).fill(0);
    const awayGoalsP = new Array(maxGoals + 1).fill(0);

    // Combo market accumulators
    let homeWinAndBtts = 0;
    let awayWinAndBtts = 0;
    let drawAndBtts = 0;

    // Correct Scores array
    const correctScores = [];

    // 1. Build Full-Time Joint Probability Matrix
    for (let h = 0; h <= maxGoals; h++) {
      matrix[h] = [];
      const pHome = this.poissonPmf(h, lambda);

      for (let a = 0; a <= maxGoals; a++) {
        const pAway = this.poissonPmf(a, mu);
        const tauFactor = this.tau(h, a, lambda, mu, rho);
        const pJoint = pHome * pAway * tauFactor;

        matrix[h][a] = pJoint;

        // 1X2 Accumulation
        if (h > a) rawHomeWin += pJoint;
        else if (h === a) rawDraw += pJoint;
        else rawAwayWin += pJoint;

        // Over / Under Accumulation
        const totalGoals = h + a;
        Object.keys(totalGoalBuckets).forEach(line => {
          if (totalGoals > parseFloat(line)) {
            totalGoalBuckets[line] += pJoint;
          }
        });

        // Both Teams to Score
        if (h > 0 && a > 0) {
          bttsYes += pJoint;
          if (h > a) homeWinAndBtts += pJoint;
          else if (a > h) awayWinAndBtts += pJoint;
          else drawAndBtts += pJoint;
        }

        // Clean Sheets & Individual Team Goals
        if (a === 0) homeCleanSheet += pJoint;
        if (h === 0) awayCleanSheet += pJoint;
        homeGoalsP[h] += pJoint;
        awayGoalsP[a] += pJoint;

        // Collect Correct Score Data
        correctScores.push({
          score: `${h}-${a}`,
          probability: pJoint
        });
      }
    }

    // Normalize Main Outcome Probabilities (sum to 1.0)
    const normFactor = rawHomeWin + rawDraw + rawAwayWin;
    const p1 = rawHomeWin / normFactor;
    const pX = rawDraw / normFactor;
    const p2 = rawAwayWin / normFactor;

    // 2. Derived Markets Calculation

    // Double Chance
    const dc1X = p1 + pX;
    const dc12 = p1 + p2;
    const dcX2 = pX + p2;

    // Draw No Bet
    const dnb1 = p1 / (p1 + p2);
    const dnb2 = p2 / (p1 + p2);

    // Asian Handicaps (-1.5, -0.5, +0.5, +1.5)
    let ahHomeMinus15 = 0;
    let ahHomePlus05 = p1 + pX; // Same as 1X
    let ahHomeMinus05 = p1;     // Same as Direct Home Win

    for (let h = 0; h <= maxGoals; h++) {
      for (let a = 0; a <= maxGoals; a++) {
        if (h - a > 1.5) ahHomeMinus15 += matrix[h][a];
      }
    }

    // European Handicap 0:1 (Home starts -1 goal behind)
    let ehHomeWin = 0; // Home must win by 2+
    let ehDraw = 0;    // Home must win by exactly 1
    let ehAwayWin = 0; // Away wins or match draws

    for (let h = 0; h <= maxGoals; h++) {
      for (let a = 0; a <= maxGoals; a++) {
        const p = matrix[h][a];
        if (h - 1 > a) ehHomeWin += p;
        else if (h - 1 === a) ehDraw += p;
        else ehAwayWin += p;
      }
    }

    // Half-Time / Full-Time Matrix Estimate (Half-time xG scaled ~ 45%)
    const htLambda = lambda * 0.45;
    const htMu = mu * 0.45;
    let htHome = 0, htDraw = 0, htAway = 0;

    for (let h = 0; h <= 5; h++) {
      for (let a = 0; a <= 5; a++) {
        const pJoint = this.poissonPmf(h, htLambda) * this.poissonPmf(a, htMu) * this.tau(h, a, htLambda, htMu, rho);
        if (h > a) htHome += pJoint;
        else if (h === a) htDraw += pJoint;
        else htAway += pJoint;
      }
    }

    const htftMatrix = {
      "1/1": htHome * p1,
      "1/X": htHome * pX,
      "1/2": htHome * p2,
      "X/1": htDraw * p1,
      "X/X": htDraw * pX,
      "X/2": htDraw * p2,
      "2/1": htAway * p1,
      "2/X": htAway * pX,
      "2/2": htAway * p2
    };

    // Sort Top 8 Correct Scores
    correctScores.sort((a, b) => b.probability - a.probability);
    const topCorrectScores = correctScores.slice(0, 8);

    // 3. Assemble Output Structure
    return {
      inputs: { expectedGoalsHome: lambda, expectedGoalsAway: mu, rho },
      
      main1X2: {
        homeWin: { prob: p1, odds: this.probToOdds(p1) },
        draw: { prob: pX, odds: this.probToOdds(pX) },
        awayWin: { prob: p2, odds: this.probToOdds(p2) }
      },

      doubleChance: {
        homeOrDraw: { prob: dc1X, odds: this.probToOdds(dc1X) },
        homeOrAway: { prob: dc12, odds: this.probToOdds(dc12) },
        drawOrAway: { prob: dcX2, odds: this.probToOdds(dcX2) }
      },

      drawNoBet: {
        home: { prob: dnb1, odds: this.probToOdds(dnb1) },
        away: { prob: dnb2, odds: this.probToOdds(dnb2) }
      },

      goalsOverUnder: {
        over05: { prob: totalGoalBuckets[0.5], odds: this.probToOdds(totalGoalBuckets[0.5]) },
        under05: { prob: 1 - totalGoalBuckets[0.5], odds: this.probToOdds(1 - totalGoalBuckets[0.5]) },
        over15: { prob: totalGoalBuckets[1.5], odds: this.probToOdds(totalGoalBuckets[1.5]) },
        under15: { prob: 1 - totalGoalBuckets[1.5], odds: this.probToOdds(1 - totalGoalBuckets[1.5]) },
        over25: { prob: totalGoalBuckets[2.5], odds: this.probToOdds(totalGoalBuckets[2.5]) },
        under25: { prob: 1 - totalGoalBuckets[2.5], odds: this.probToOdds(1 - totalGoalBuckets[2.5]) },
        over35: { prob: totalGoalBuckets[3.5], odds: this.probToOdds(totalGoalBuckets[3.5]) },
        under35: { prob: 1 - totalGoalBuckets[3.5], odds: this.probToOdds(1 - totalGoalBuckets[3.5]) }
      },

      btts: {
        yes: { prob: bttsYes, odds: this.probToOdds(bttsYes) },
        no: { prob: 1 - bttsYes, odds: this.probToOdds(1 - bttsYes) }
      },

      comboMarkets: {
        homeWinAndBtts: { prob: homeWinAndBtts, odds: this.probToOdds(homeWinAndBtts) },
        awayWinAndBtts: { prob: awayWinAndBtts, odds: this.probToOdds(awayWinAndBtts) },
        drawAndBtts: { prob: drawAndBtts, odds: this.probToOdds(drawAndBtts) }
      },

      asianHandicap: {
        homeMinus15: { prob: ahHomeMinus15, odds: this.probToOdds(ahHomeMinus15) },
        awayPlus15: { prob: 1 - ahHomeMinus15, odds: this.probToOdds(1 - ahHomeMinus15) }
      },

      europeanHandicap01: {
        homeHandicapMinus1: { prob: ehHomeWin, odds: this.probToOdds(ehHomeWin) },
        handicapDraw: { prob: ehDraw, odds: this.probToOdds(ehDraw) },
        awayHandicapPlus1: { prob: ehAwayWin, odds: this.probToOdds(ehAwayWin) }
      },

      teamProps: {
        homeCleanSheet: { prob: homeCleanSheet, odds: this.probToOdds(homeCleanSheet) },
        awayCleanSheet: { prob: awayCleanSheet, odds: this.probToOdds(awayCleanSheet) },
        homeToScore: { prob: 1 - awayCleanSheet, odds: this.probToOdds(1 - awayCleanSheet) },
        awayToScore: { prob: 1 - homeCleanSheet, odds: this.probToOdds(1 - homeCleanSheet) }
      },

      htft: Object.fromEntries(
        Object.entries(htftMatrix).map(([key, val]) => [key, { prob: val, odds: this.probToOdds(val) }])
      ),

      topCorrectScores: topCorrectScores.map(item => ({
        score: item.score,
        prob: item.probability,
        odds: this.probToOdds(item.probability)
      }))
    };
  }
}

// Example Run: Arsenal vs Chelsea (e.g., Expected Home Goals = 1.85, Away Goals = 1.05)
const matchPrediction = DixonColesEnginePro.predict(1.85, 1.05, -0.13);
console.log(JSON.stringify(matchPrediction, null, 2));
window.DixonColesEnginePro = DixonColesEnginePro;
