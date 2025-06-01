module.exports = {
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    testMatch: ['**/test/**/*.test.ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    collectCoverage: true,
    coverageReporters: ['json', 'html'],
};
