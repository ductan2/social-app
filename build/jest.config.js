"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    coverageDirectory: 'coverage',
    collectCoverage: true,
    testPathIgnorePatterns: ['/node_modules/'],
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    },
    testMatch: ['<rootDir>/src/**/test/*.ts'],
    collectCoverageFrom: ['src/**/*.ts', '!src/**/test/*.ts?(x)', '!**/node_modules/**'],
    coverageThreshold: {
        global: {
            branches: 1,
            functions: 1,
            lines: 1,
            statements: 1
        }
    },
    coverageReporters: ['text-summary', 'lcov'],
    moduleNameMapper: {
        "@controllers/(.*)": ["<rootDir>src/controllers/$1"],
        "@models/(.*)": ["<rootDir>src/models/$1"],
        "@services/(.*)": ["<rootDir>src/services/$1"],
        "@utils/(.*)": ["<rootDir>src/utils/$1"],
        "@middlewares/(.*)": ["<rootDir>src/middlewares/$1"],
        "@config/(.*)": ["<rootDir>src/configs/$1"],
        "@interfaces/(.*)": ["<rootDir>src/interfaces/$1"],
        "@root/(.*)": ["<rootDir>src/$1"],
        "@routes/(.*)": ["<rootDir>src/routes/$1"],
        "@queues/(.*)": ["<rootDir>src/queues/$1"],
    }
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map