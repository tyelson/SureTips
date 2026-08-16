/**
 * SureSlip - Web Search Adapter
 *
 * This module provides the interface between SureSlip
 * and an external web/search provider.
 *
 * IMPORTANT:
 * No API keys should ever be placed directly in this file.
 *
 * API keys belong in environment variables.
 */

class WebSearchAdapter {
    constructor(options = {}) {
        this.provider =
            options.provider ||
            process.env.SEARCH_PROVIDER ||
            "manual";

        this.apiKey =
            options.apiKey ||
            process.env.SEARCH_API_KEY ||
            null;

        this.baseUrl =
            options.baseUrl ||
            process.env.SEARCH_BASE_URL ||
            null;
    }

    /**
     * Build a football fixture search query
     */
    buildFixtureQuery({
        date,
        league,
        country
    } = {}) {

        const parts = [
            "football fixtures"
        ];

        if (date) {
            parts.push(date);
        }

        if (league) {
            parts.push(league);
        }

        if (country) {
            parts.push(country);
        }

        return parts.join(" ");
    }

    /**
     * Execute a search.
     *
     * The actual provider implementation will be
     * connected later.
     */
    async search(query) {

        if (!query) {
            throw new Error(
                "Search query is required."
            );
        }

        if (this.provider === "manual") {
            return {
                provider: "manual",
                query,
                results: []
            };
        }

        if (!this.apiKey) {
            throw new Error(
                "SEARCH_API_KEY is not configured."
            );
        }

        /*
         * Provider-specific implementation will
         * be added here.
         *
         * Example:
         *
         * const response = await fetch(
         *     `${this.baseUrl}?q=${encodeURIComponent(query)}`,
         *     {
         *         headers: {
         *             Authorization:
         *                 `Bearer ${this.apiKey}`
         *         }
         *     }
         * );
         *
         * return response.json();
         */

        throw new Error(
            `Search provider "${this.provider}" is not implemented yet.`
        );
    }

    /**
     * Search for today's football fixtures
     */
    async searchTodaysFixtures({
        date,
        league,
        country
    } = {}) {

        const query =
            this.buildFixtureQuery({
                date,
                league,
                country
            });

        return this.search(query);
    }
}

module.exports = WebSearchAdapter;
