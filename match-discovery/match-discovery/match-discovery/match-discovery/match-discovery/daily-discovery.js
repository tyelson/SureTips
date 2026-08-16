/**
 * SureSlip - Daily Fixture Discovery Service
 *
 * Combines:
 * 1. Fixture sources
 * 2. Web search adapter
 * 3. Match discovery/normalization engine
 *
 * This service discovers candidate fixtures.
 * It DOES NOT make predictions.
 */

const MatchDiscoveryEngine =
    require("./match-discovery");

const WebSearchAdapter =
    require("./web-search");

const {
    getActiveSources
} = require("./sources");

class DailyDiscoveryService {

    constructor(options = {}) {

        this.discoveryEngine =
            options.discoveryEngine ||
            new MatchDiscoveryEngine();

        this.searchAdapter =
            options.searchAdapter ||
            new WebSearchAdapter(options);

        this.sources =
            getActiveSources();
    }

    /**
     * Generate search queries.
     */
    buildQueries({
        date,
        leagues = []
    } = {}) {

        const queries = [];

        if (leagues.length === 0) {

            queries.push(
                this.searchAdapter.buildFixtureQuery({
                    date
                })
            );

        } else {

            for (const league of leagues) {

                queries.push(
                    this.searchAdapter.buildFixtureQuery({
                        date,
                        league
                    })
                );
            }
        }

        return queries;
    }

    /**
     * Discover fixtures for a specific day.
     */
    async discover({
        date,
        leagues = []
    } = {}) {

        if (!date) {
            throw new Error(
                "Discovery date is required."
            );
        }

        const queries =
            this.buildQueries({
                date,
                leagues
            });

        const searchResults = [];

        for (const source of this.sources) {

            for (const query of queries) {

                try {

                    const result =
                        await this.searchAdapter.search(
                            query
                        );

                    searchResults.push({
                        source: source.name,
                        query,
                        result
                    });

                } catch (error) {

                    searchResults.push({
                        source: source.name,
                        query,
                        error: error.message
                    });
                }
            }
        }

        /*
         * At this stage the search adapter returns
         * raw results.
         *
         * A provider-specific parser will later
         * convert those results into raw fixtures.
         */

        const rawFixtures =
            this.extractFixtures(
                searchResults
            );

        const fixtures =
            this.discoveryEngine.processFixtures(
                rawFixtures
            );

        return {
            date,
            sourcesChecked:
                this.sources.length,
            queriesExecuted:
                queries.length,
            fixturesFound:
                fixtures.length,
            fixtures
        };
    }

    /**
     * Convert provider results into normalized
     * raw fixture objects.
     *
     * This is intentionally conservative.
     * We do not guess missing information.
     */
    extractFixtures(searchResults) {

        const fixtures = [];

        for (const item of searchResults) {

            if (!item.result) {
                continue;
            }

            /*
             * Provider-specific parsing will be
             * implemented later.
             *
             * We intentionally avoid inventing
             * football fixtures from unstructured
             * search results.
             */

            if (
                Array.isArray(
                    item.result.fixtures
                )
            ) {

                for (
                    const fixture
                    of item.result.fixtures
                ) {

                    fixtures.push({
                        ...fixture,
                        source:
                            item.source
                    });
                }
            }
        }

        return fixtures;
    }
}

module.exports =
    DailyDiscoveryService;
