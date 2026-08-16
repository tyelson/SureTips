/**
 * SureSlip - Fixture Sources
 *
 * Defines external sources that may be used for
 * discovering daily football fixtures.
 *
 * This file contains source configuration only.
 * It does not scrape websites by itself.
 */

const SOURCES = [
    {
        id: "source_001",
        name: "Google Search",
        type: "search",
        enabled: true,
        priority: 1
    },

    {
        id: "source_002",
        name: "Bing Search",
        type: "search",
        enabled: true,
        priority: 2
    },

    {
        id: "source_003",
        name: "Football Web Source",
        type: "web",
        enabled: true,
        priority: 3
    }
];

/**
 * Return only active sources
 */
function getActiveSources() {
    return SOURCES
        .filter(source => source.enabled)
        .sort(
            (a, b) =>
                a.priority - b.priority
        );
}

/**
 * Find a source by ID
 */
function getSourceById(sourceId) {
    return SOURCES.find(
        source =>
            source.id === sourceId
    );
}

module.exports = {
    SOURCES,
    getActiveSources,
    getSourceById
};
