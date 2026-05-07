const configuredBaseURL = process.env.HW_API_URL || 'https://partners-test.healthwarehouse.com/v1';
const isHealthWarehouseTestApi = configuredBaseURL.includes('partners-test.healthwarehouse.com');
const isNodeTestMode = process.env.NODE_ENV !== 'production';

const config = {
    // API Configuration
    baseURL: configuredBaseURL,
    apiKey: process.env.HW_API_KEY,
    
    // Test vs Production
    isTest: isNodeTestMode,
    isHealthWarehouseTestApi,
    allowTestJourneyUpdates: isNodeTestMode || isHealthWarehouseTestApi || process.env.HW_TEST_JOURNEY_ENABLED === 'true',
    testBaseURL: 'https://partners-test.healthwarehouse.com/v1',
    
    // Timeouts
    timeout: 30000,
    
    // Test Product IDs
    testProducts: {
        prescription: [100, 101, 102],
        otc: [200, 201, 202]
    }
};

module.exports = config;
