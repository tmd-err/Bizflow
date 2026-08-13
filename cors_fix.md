# Fix Customer PATCH CORS Issue

We have a Laravel backend and Next.js frontend.

## Problem

Updating a customer from the frontend using

```text
PATCH http127.0.0.18000apicustomers{id}
```

fails in the browser with

```text
Access to XMLHttpRequest at 'http127.0.0.18000apicustomers3'
from origin 'httplocalhost3000' has been blocked by CORS policy
Method PATCH is not allowed by Access-Control-Allow-Methods in preflight response.
```

The frontend origin is

```text
httplocalhost3000
```

The Laravel API is

```text
http127.0.0.18000
```

## Important finding

Laravel's CORS configuration appears correct.

The current `configcors.php` contains

```php
'paths' = ['api', 'sanctumcsrf-cookie'],

'allowed_methods' = [''],

'allowed_origins' = [
    'httplocalhost3000',
],

'allowed_origins_patterns' = [],

'allowed_headers' = [''],

'exposed_headers' = [],

'max_age' = 0,

'supports_credentials' = true,
```

A manual preflight test was performed

```powershell
curl.exe -i -X OPTIONS http127.0.0.18000apicustomers3 `
  -H Origin httplocalhost3000 `
  -H Access-Control-Request-Method PATCH `
  -H Access-Control-Request-Headers authorization,content-type
```

Laravel returns

```text
HTTP1.0 204 No Content

Access-Control-Allow-Origin httplocalhost3000
Access-Control-Allow-Credentials true
Access-Control-Allow-Methods GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers authorization,content-type
```

Therefore the Laravel CORS configuration itself is working.

## Your task

Investigate and fix the issue completely.

### Step 1 — Inspect the frontend API client

Find where Axiosfetch is configured.

Look for

```text
axios.create(...)
```

or the API service used by the customer update functionality.

Check whether the frontend is manually setting any of these response-only headers

```text
Access-Control-Allow-Origin
Access-Control-Allow-Methods
Access-Control-Allow-Headers
Access-Control-Allow-Credentials
```

These must NOT be manually set by the frontend.

Remove them if present.

The frontend should only send normal request headers such as

```text
Accept applicationjson
Content-Type applicationjson
Authorization Bearer ...
```

### Step 2 — Inspect the customer update request

Find the code responsible for

```text
PATCH apicustomers{id}
```

Verify it uses the existing API client consistently.

Do not create a second Axios instance just for customers.

Expected pattern

```ts
api.patch(`customers${id}`, data)
```

Adapt to the project's existing API architecture.

### Step 3 — Inspect Axios interceptors

Check request and response interceptors.

Make sure no interceptor is modifying CORS-related headers.

Especially search the frontend for

```text
Access-Control-Allow
```

and remove inappropriate client-side usage.

### Step 4 — Check base URLs

Verify that the frontend API configuration is intentionally using

```text
http127.0.0.18000api
```

or the project's existing backend URL.

Do not randomly switch between

```text
localhost
```

and

```text
127.0.0.1
```

unless there is a clear reason.

The frontend origin is

```text
httplocalhost3000
```

and this must remain allowed by Laravel.

### Step 5 — Inspect the actual browser preflight

Use DevTools Network.

For the customer update, verify

```text
OPTIONS apicustomers3
PATCH   apicustomers3
```

The OPTIONS response should contain

```text
Access-Control-Allow-Origin httplocalhost3000
Access-Control-Allow-Methods GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers authorization,content-type
```

If the browser receives something different from the manual curl request, determine why.

### Step 6 — Search for duplicate CORS handling

Search the Laravel project for

```text
Access-Control-Allow-Methods
Access-Control-Allow-Origin
Access-Control-Allow-Headers
HandleCors
```

Check for

```text
custom CORS middleware
bootstrapapp.php
appHttpMiddleware
```

There must not be another middleware overriding Laravel's CORS configuration.

Do not add another CORS middleware if one already exists.

### Step 7 — Check Laravel configurationcache

Make sure the current configuration is actually being loaded.

Run

```bash
php artisan optimizeclear
```

Then restart Laravel.

Do not modify unrelated authentication, RBAC, customer, or permission code.

### Step 8 — Check the route

Verify the customer update route

```text
PATCH apicustomers{customer}
```

exists and points to the correct controller method.

Run

```bash
php artisan routelist --path=apicustomers
```

The route should support PATCH.

### Step 9 — Test without the frontend

Use a direct API request with the same Bearer token to verify the backend update itself works.

For example, test the PATCH endpoint independently from the browser.

If the direct request succeeds and the browser fails, keep the investigation focused on the frontendCORSpreflight path.

### Step 10 — Fix, don't work around

Do NOT

 disable CORS
 use a browser CORS extension
 remove authorization
 change PATCH to POST just to bypass the problem
 disable browser security
 add `Access-Control-Allow-` headers to Axios requests
 create duplicate CORS middleware

The goal is to make the normal

```text
Next.js
httplocalhost3000
        ↓
PATCH
        ↓
Laravel
http127.0.0.18000
```

flow work correctly.

## Final verification

After fixing

1. Open the Customers page.
2. Edit customer ID 3.
3. Submit the update.
4. Confirm the browser performs

   ```text
   OPTIONS → successful
   PATCH → successful
   ```
5. Confirm the customer is actually updated.
6. Confirm authentication still works.
7. Confirm permissions still work.
8. Confirm CreateViewDelete customers still work.
9. Do not introduce regressions into RBAC or company isolation.

At the end, report

```text
Root cause
Files changed
Changes made
PATCH test result
OPTIONS test result
Customer update result
Any other affected functionality
```
