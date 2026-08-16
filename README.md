SureSlip

SureSlip is a football prediction platform powered by Poisson Engine Pro.

Core System

SureSlip is designed to:

1. Discover football fixtures scheduled for the current day.
2. Present discovered fixtures to the administrator.
3. Allow the administrator to verify and select fixtures.
4. Allow the administrator to enter or verify team statistics.
5. Calculate league baseline statistics.
6. Calculate expected goals (λ) for the home and away teams.
7. Run the Poisson Engine Pro.
8. Generate the complete score-probability matrix.
9. Identify one highest-probability exact score.
10. Calculate major betting-market probabilities.
11. Identify the strongest available market.
12. Present predictions to authorized subscribers.

Prediction Engine

The core prediction model is:

Poisson Engine Pro

The existing engine is located in:

"poisson-engine/poisson-engine-pro.js"

The mathematical model should not be changed unless a specific calculation error is identified and approved.

Planned Modules

- Match Discovery
- Admin Fixture Management
- Team Statistics
- League Baselines
- Poisson Engine Pro
- Prediction Generation
- User Authentication
- Subscription Management
- Premium/VIP Predictions
- Database
- Admin Dashboard
- User Dashboard

Prediction Output

Each selected match should ultimately provide:

- Home Team
- Away Team
- Expected Home Goals
- Expected Away Goals
- Top Exact Score
- Home Win Probability
- Draw Probability
- Away Win Probability
- Over/Under probabilities
- BTTS probability
- Best Market
- Confidence

Subscription

SureSlip will support paid subscription plans.

Initial planned plans:

- Premium — ₦2,000 for 7 days.
  

Payment and subscription activation will be implemented separately from the prediction engine.

Development Principle

The Poisson Engine Pro remains the core mathematical engine.

Application features should be built around the engine without unnecessarily modifying its underlying calculations.
