const BASE_URL = 'https://zed-dream-api.onrender.com/api';

// Optional: Add a valid JWT token here to test protected routes
const AUTH_TOKEN = '';

async function measureEndpoint(endpoint, description, token = null) {
    const start = performance.now();
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, { headers });

        if (!response.ok) {
            // If 401/403, specifically note it
            if (response.status === 401 || response.status === 403) {
                throw new Error(`Auth Failed (${response.status})`);
            }
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const end = performance.now();
        const duration = (end - start).toFixed(2);

        console.log(`[OK] ${description.padEnd(30)} ${endpoint.padEnd(40)} : ${duration}ms`);
        return { duration: end - start, data };
    } catch (error) {
        const end = performance.now();
        console.error(`[FAIL] ${description.padEnd(30)} ${endpoint.padEnd(40)} : ${(end - start).toFixed(2)}ms - ${error.message}`);
        return null;
    }
}

async function runBenchmark() {
    console.log('=============================================');
    console.log('       ZED DREAM API BENCHMARK TOOL');
    console.log('=============================================\n');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Auth Token: ${AUTH_TOKEN ? 'PROVIDED' : 'MISSING (Skipping protected routes)'}\n`);

    const results = {};

    console.log('--- 1. Public List Endpoints ---');
    // 1. Initial Data
    const productsRes = await measureEndpoint('/products', 'All Products');
    const categoriesRes = await measureEndpoint('/products/categories', 'Categories List');
    const heroesRes = await measureEndpoint('/heroes', 'Hero Slides');

    // Store IDs for dynamic testing
    const productId = productsRes?.data?.data?.[0]?._id || productsRes?.data?.[0]?._id;
    // Categories endpoint returns array of objects { _id, name } or similar
    const categoryId = categoriesRes?.data?.data?.[0]?._id || categoriesRes?.data?.[0]?._id;

    console.log('\n--- 2. Public Detail Endpoints (Dynamic) ---');
    if (productId) {
        await measureEndpoint(`/products/${productId}`, 'Single Product');
        await measureEndpoint(`/products/related/${productId}`, 'Related Products');
        await measureEndpoint(`/reviews/${productId}`, 'Product Reviews');
    } else {
        console.log('[SKIP] Could not fetch a Product ID to test details.');
    }

    if (categoryId) {
        await measureEndpoint(`/categories/${categoryId}`, 'Single Category');
    } else {
        console.log('[SKIP] Could not fetch a Category ID to test details.');
    }

    // Protected Routes
    console.log('\n--- 3. Protected Endpoints ---');
    if (AUTH_TOKEN) {
        // Loyalty
        await measureEndpoint('/loyalty/balance', 'Loyalty Balance', AUTH_TOKEN);
        await measureEndpoint('/loyalty/rewards', 'Loyalty Rewards', AUTH_TOKEN);
        // User
        await measureEndpoint('/auth/me', 'User Profile', AUTH_TOKEN);
        // Orders
        await measureEndpoint('/orders/myorders', 'My Orders', AUTH_TOKEN);
        // TryOns
        await measureEndpoint('/try-on/saved', 'Saved Looks', AUTH_TOKEN);
    } else {
        console.log('Skipping protected routes because AUTH_TOKEN is not set.');
        console.log('To test these, edit api-benchmark.js and add a valid token.');
    }

    console.log('\n--- 4. HomeScreen Simulation (Parallel) ---');
    // Simulating the exact calls made in HomeScreen.tsx
    // getProducts(), getCategories(), getHeroes(), and getLoyaltyInfo() (if user exists)

    const parallelEndpoints = [
        '/products',
        '/products/categories',
        '/heroes'
    ];

    // If we had a token, HomeScreen also fetches loyalty info. 
    // We will simulate the public part first which matches the initial loading state for non-logged-in users.

    const start = performance.now();
    await Promise.all(parallelEndpoints.map(url => fetch(`${BASE_URL}${url}`).then(r => r.json())));
    const end = performance.now();
    console.log(`HomeScreen Public Data Load: ${(end - start).toFixed(2)}ms`);

    if (AUTH_TOKEN) {
        const startAuth = performance.now();
        await Promise.all([
            fetch(`${BASE_URL}/loyalty/balance`, { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }),
            fetch(`${BASE_URL}/loyalty/rewards`, { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } })
        ]);
        const endAuth = performance.now();
        console.log(`HomeScreen Loyalty Data Load: ${(endAuth - startAuth).toFixed(2)}ms`);
    }

    console.log('\n=============================================');
    console.log('See BENCHMARK_README.md for results interpretation.');
    console.log('=============================================');
}

runBenchmark();
