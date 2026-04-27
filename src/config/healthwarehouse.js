const config = {
    // API Configuration
    baseURL: process.env.HW_API_URL || 'https://partners-test.healthwarehouse.com/v1',
    apiKey: process.env.HW_API_KEY,
    
    // Test vs Production
    isTest: process.env.NODE_ENV !== 'production',
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