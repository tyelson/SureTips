SureSlip Match Discovery

Purpose

The Match Discovery module identifies football fixtures scheduled for the current day.

It does not make predictions.

Its responsibility is to discover and normalize fixtures before they are reviewed by the administrator.

Workflow

Internet / Web Sources
        ↓
Match Discovery
        ↓
Fixture Normalization
        ↓
Duplicate Removal
        ↓
Admin Fixture Panel
        ↓
Admin Verification
        ↓
Selected Fixture
        ↓
Team Statistics
        ↓
Poisson Engine Pro

Fixture Information

Where available, the discovery system should collect:

- Competition/League
- Country
- Home Team
- Away Team
- Match Date
- Kickoff Time
- Source
- Source URL
- Fixture Status

Important Rule

Discovered fixtures must NOT automatically become predictions.

Every fixture should first appear in the administrator dashboard.

The administrator decides which fixtures are valid and should be analyzed.

Normalized Fixture Structure

Each fixture should eventually use a structure similar to:

{
  "id": "",
  "league": "",
  "country": "",
  "homeTeam": "",
  "awayTeam": "",
  "date": "",
  "kickoffTime": "",
  "source": "",
  "sourceUrl": "",
  "status": "pending"
}

Fixture Status

Possible statuses:

- "pending"
- "verified"
- "rejected"
- "selected"
- "predicted"

Duplicate Protection

The system should prevent the same fixture from appearing multiple times when it is discovered from different sources.

A fixture should be identified using a combination of:

- Date
- Competition
- Home team
- Away team

Data Quality

The system should flag incomplete fixtures rather than silently creating predictions.

Examples:

- Missing home team
- Missing away team
- Missing match date
- Unclear competition
- Conflicting kickoff times
- Duplicate fixture

Separation of Responsibilities

Match Discovery finds fixtures.

Admin verifies fixtures.

Statistics module provides team and league statistics.

Poisson Engine Pro calculates probabilities.

Prediction module formats the final prediction.

No module should silently replace another module's responsibility.
