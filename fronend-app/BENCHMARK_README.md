# API Benchmark Guide

This guide explains how to use the `api-benchmark.js` script and how to interpret the results to ensure your app feels fast and responsive.

## How to Run

1.  Open a terminal in the `fronend-app` directory.
2.  Run the script:
    ```bash
    node api-benchmark.js
    ```
3.  **Optional (For Protected Routes):**
    To test user-specific endpoints (like Orders, Loyalty, Profile), you need a valid Auth Token.
    1.  Log in to your app.
    2.  Check the logs or debugger to copy the `Bearer` token.
    3.  Open `api-benchmark.js` and paste it into the `AUTH_TOKEN` variable at the top.

## Interpreting Results

The script measures the **Response Time** (Latency + Server Processing + Download).

### Quality Standards

| Status | Duration | User Experience | Action |
| :--- | :--- | :--- | :--- |
| 🟢 **Excellent** | **< 200ms** | Instant. The app feels native and snappy. | No action needed. |
| 🟡 **Good** | **200ms - 500ms** | Noticeable but acceptable delay. | Optimize if possible, but not critical. |
| 🟠 **Fair** | **500ms - 1000ms** | Clear delay. Users see loading spinners. | **Needs Optimization.** (Caching, indexing, or reducing payload). |
| 🔴 **Poor** | **> 1000ms (1s)** | Frustrating. Users might abandon the app. | **Critical Fix Required.** |

### Key Metrics to Watch

1.  **HomeScreen Public Data Load**:
    - This simulates the parallel fetching of Products, Categories, and Heroes.
    - **Target**: < 500ms
    - If this is slow, the app startup will feel laggy.

2.  **Single Product Details**:
    - Response time when clicking on a product.
    - **Target**: < 300ms
    - Should be fast to keep browsing fluid.

## Troubleshooting Slow Requests

-   **Cold Start**: The first request might be slow if the server is "sleeping" (common on free hosting tiers like Render). Run the test twice; the second run requires less time.
-   **Large Payload**: If `All Products` is slow, check if you are downloading too many images or fields. Pagination might be needed.
-   **Database queries**: If specific endpoints are slow, the backend might be missing database indexes.
