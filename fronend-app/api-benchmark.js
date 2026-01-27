const BASE_URL = 'https://zed-dream-api.onrender.com/api';

const endpoints = [
    '/products',
    '/products/categories',
    '/heroes'
];

async function measureEndpoint(endpoint) {
    const start = performance.now();
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        await response.json(); // Ensure we read the body
        const end = performance.now();
        console.log(`[OK] ${endpoint}: ${(end - start).toFixed(2)}ms`);
        return end - start;
    } catch (error) {
        const end = performance.now();
        console.error(`[FAIL] ${endpoint}: ${(end - start).toFixed(2)}ms - ${error.message}`);
        return null;
    }
}

async function runBenchmark() {
    console.log('Starting API Benchmark...');
    console.log(`Base URL: ${BASE_URL}\n`);

    // Measure individual endpoints
    console.log('--- Sequential Fetch ---');
    for (const endpoint of endpoints) {
        await measureEndpoint(endpoint);
    }

    console.log('\n--- Parallel Fetch (Simulating HomeScreen) ---');
    const start = performance.now();
    await Promise.all(endpoints.map(endpoint => fetch(`${BASE_URL}${endpoint}`).then(r => r.json())));
    const end = performance.now();
    console.log(`HomeScreen Total Load Time: ${(end - start).toFixed(2)}ms`);
}

runBenchmark();
