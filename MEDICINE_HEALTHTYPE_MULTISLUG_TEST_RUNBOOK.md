# Medicine Multi-HealthTypeSlug API Test Runbook

This runbook tests add/remove behavior for multiple subcategories (`healthTypeSlug`) on a medicine.

## Test Context

- Base URL: `https://mr-telexrs-hw.vercel.app/api/v1`
- Medicine ID: `69f1ce63bd3e913a947bebcd` (Tadalafil)
- Health Category Slug: `mens-health`
- Health Category ID: `69734ff57771d70610b9681e`
- SubCategory 1 (ED Refill):
  - Slug: `ed-refill`
  - ID: `69f0923cb36cc3300bd1094b`
- SubCategory 2 (Erectile Dysfunction):
  - Slug: `erectile-dysfunction`
  - ID: `69734ff57771d70610b9681f`
- Admin Token:
  - `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjBmMzBjZTlmYzE2YzcxOTgxNWIzNyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NzQ3NzYyNSwiZXhwIjoxNzc4MDgyNDI1fQ.aXpoZmbmAxYU81ldug9rDhvPW3D0MabQ_YsaeR6qbig`

---

## 1) Get Health Category + Type IDs

Use this to confirm category/type IDs and slugs before update.

```bash
curl --location 'https://mr-telexrs-hw.vercel.app/api/v1/health/categories/slug/mens-health' \
--header 'accept: application/json'
```

---

## 2) Baseline: Get the Medicine Record

```bash
curl --location 'https://mr-telexrs-hw.vercel.app/api/v1/admin/medicines/69f1ce63bd3e913a947bebcd' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjBmMzBjZTlmYzE2YzcxOTgxNWIzNyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NzQ3NzYyNSwiZXhwIjoxNzc4MDgyNDI1fQ.aXpoZmbmAxYU81ldug9rDhvPW3D0MabQ_YsaeR6qbig'
```

Check:
- `data.healthTypeSlug`
- `data.healthTypeId`
- `data.subCategory`

---

## 3) Baseline: Medicines in `erectile-dysfunction`

```bash
curl --location 'https://mr-telexrs-hw.vercel.app/api/v1/admin/medicines?healthTypeSlug=erectile-dysfunction&limit=100' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjBmMzBjZTlmYzE2YzcxOTgxNWIzNyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NzQ3NzYyNSwiZXhwIjoxNzc4MDgyNDI1fQ.aXpoZmbmAxYU81ldug9rDhvPW3D0MabQ_YsaeR6qbig'
```

Check whether medicine `69f1ce63bd3e913a947bebcd` is present in the returned list.

---

## 4) Add Second SubCategory (Multi-Slug Update)

This adds `erectile-dysfunction` along with `ed-refill`.

```bash
curl --location --request PUT 'https://mr-telexrs-hw.vercel.app/api/v1/admin/medicines/69f1ce63bd3e913a947bebcd' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjBmMzBjZTlmYzE2YzcxOTgxNWIzNyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NzQ3NzYyNSwiZXhwIjoxNzc4MDgyNDI1fQ.aXpoZmbmAxYU81ldug9rDhvPW3D0MabQ_YsaeR6qbig' \
--header 'Content-Type: application/json' \
--data-raw '{
  "_id": "69f1ce63bd3e913a947bebcd",
  "productName": "Tadalafil",
  "brand": "Tadalafil",
  "originalPrice": 29.99,
  "salePrice": 29.99,
  "images": {
    "thumbnail": "https://res.cloudinary.com/dnkvlbwqk/image/upload/v1777454405/yjpsqdcsqn0ag41kr0ac.webp",
    "gallery": [
      "https://res.cloudinary.com/dnkvlbwqk/image/upload/v1777454405/yjpsqdcsqn0ag41kr0ac.webp"
    ]
  },
  "usage": [],
  "description": "",
  "howItWorks": "Tadalafil (Cialis) is a medication used to treat erectile dysfunction. Dosing depends on age, tolerance, and response to the medication.",
  "generics": [
    "Tadalafil"
  ],
  "markup": 0,
  "dosageOptions": [
    {
      "name": "2.5MG Tablets",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebce"
    },
    {
      "name": "5MG Tablet",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebcf"
    },
    {
      "name": "10MG Tablet",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebd0"
    },
    {
      "name": "20MG Tablet",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebd1"
    }
  ],
  "quantityOptions": [
    {
      "name": "30 Tablets (2.5MG Tablets)",
      "priceAdjustment": 29.99,
      "_id": "69f1ce63bd3e913a947bebd2"
    },
    {
      "name": "30 Tablets (10MG Tablet)",
      "priceAdjustment": 29.99,
      "_id": "69f1ce63bd3e913a947bebd4"
    },
    {
      "name": "30 Tablets (20MG Tablet)",
      "priceAdjustment": 39.99,
      "_id": "69f1ce63bd3e913a947bebd5"
    },
    {
      "name": "90 Tablets (2.5MG Tablets)",
      "priceAdjustment": 79.98,
      "_id": "69f1cf5bbd3e913a947bebfc"
    },
    {
      "name": "90 Tablets (10MG Tablet)",
      "priceAdjustment": 79.98,
      "_id": "69f1cf5bbd3e913a947bebfe"
    },
    {
      "name": "90 Tablets (20MG Tablet)",
      "priceAdjustment": 99.98,
      "_id": "69f1cf5bbd3e913a947bebff"
    }
  ],
  "precautions": "",
  "sideEffects": "Consult your healthcare provider for complete side effect information.",
  "drugInteractions": "May interact with other medications. Consult your healthcare provider about all medications you are taking.",
  "indications": "Tadalafil (Cialis) is a medication used to treat erectile dysfunction. Dosing depends on age, tolerance, and response to the medication.",
  "healthCategory": "mens-health",
  "healthTypeSlug": [
    "ed-refill",
    "erectile-dysfunction"
  ],
  "healthTypeId": [
    "69f0923cb36cc3300bd1094b",
    "69734ff57771d70610b9681f"
  ],
  "isTrendy": false,
  "isBestOffer": false,
  "discountPercentage": 0,
  "views": 0,
  "stock": 450,
  "rating": 5,
  "status": "in_stock",
  "visibility": true,
  "isActive": true,
  "createdAt": "2026-04-29T09:24:51.205Z",
  "updatedAt": "2026-04-29T14:44:21.354Z",
  "__v": 6,
  "subCategory": [
    {
      "name": "Erectile Dysfunction",
      "slug": "erectile-dysfunction",
      "description": "Medications and therapies to manage erectile dysfunction and improve sexual wellness.",
      "icon": "",
      "order": 0,
      "isActive": true,
      "_id": "69734ff57771d70610b9681f"
    },
    {
      "name": "ED Refill",
      "slug": "ed-refill",
      "description": "Manage erectile dysfunction with prescription treatment options.",
      "icon": "",
      "order": 3,
      "isActive": true,
      "_id": "69f0923cb36cc3300bd1094b"
    }
  ],
  "precaution": "",
  "dosageOption": [
    {
      "name": "2.5MG Tablets",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebce"
    },
    {
      "name": "5MG Tablet",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebcf"
    },
    {
      "name": "10MG Tablet",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebd0"
    },
    {
      "name": "20MG Tablet",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebd1"
    }
  ],
  "quantityOption": [
    {
      "name": "30 Tablets (2.5MG Tablets)",
      "priceAdjustment": 29.99,
      "_id": "69f1ce63bd3e913a947bebd2"
    },
    {
      "name": "30 Tablets (10MG Tablet)",
      "priceAdjustment": 29.99,
      "_id": "69f1ce63bd3e913a947bebd4"
    },
    {
      "name": "30 Tablets (20MG Tablet)",
      "priceAdjustment": 39.99,
      "_id": "69f1ce63bd3e913a947bebd5"
    },
    {
      "name": "90 Tablets (2.5MG Tablets)",
      "priceAdjustment": 79.98,
      "_id": "69f1cf5bbd3e913a947bebfc"
    },
    {
      "name": "90 Tablets (10MG Tablet)",
      "priceAdjustment": 79.98,
      "_id": "69f1cf5bbd3e913a947bebfe"
    },
    {
      "name": "90 Tablets (20MG Tablet)",
      "priceAdjustment": 99.98,
      "_id": "69f1cf5bbd3e913a947bebff"
    }
  ]
}'
```

Expected:
- `success: true`
- Response `data.healthTypeSlug` contains both slugs.
- Response `data.subCategory` contains both type objects.

---

## 5) Verify Add (Direct Medicine Check)

```bash
curl --location 'https://mr-telexrs-hw.vercel.app/api/v1/admin/medicines/69f1ce63bd3e913a947bebcd' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjBmMzBjZTlmYzE2YzcxOTgxNWIzNyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NzQ3NzYyNSwiZXhwIjoxNzc4MDgyNDI1fQ.aXpoZmbmAxYU81ldug9rDhvPW3D0MabQ_YsaeR6qbig'
```

Expected:
- `data.healthTypeSlug = ["ed-refill","erectile-dysfunction"]`
- `data.healthTypeId` contains both IDs
- `data.subCategory` returns both subcategory objects

---

## 6) Verify Add (Filtered List Check)

```bash
curl --location 'https://mr-telexrs-hw.vercel.app/api/v1/admin/medicines?healthTypeSlug=erectile-dysfunction&limit=100' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjBmMzBjZTlmYzE2YzcxOTgxNWIzNyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NzQ3NzYyNSwiZXhwIjoxNzc4MDgyNDI1fQ.aXpoZmbmAxYU81ldug9rDhvPW3D0MabQ_YsaeR6qbig'
```

Expected:
- Medicine `69f1ce63bd3e913a947bebcd` appears in response `data`.

---

## 7) Remove `erectile-dysfunction` (Keep Only `ed-refill`)

```bash
curl --location --request PUT 'https://mr-telexrs-hw.vercel.app/api/v1/admin/medicines/69f1ce63bd3e913a947bebcd' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjBmMzBjZTlmYzE2YzcxOTgxNWIzNyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NzQ3NzYyNSwiZXhwIjoxNzc4MDgyNDI1fQ.aXpoZmbmAxYU81ldug9rDhvPW3D0MabQ_YsaeR6qbig' \
--header 'Content-Type: application/json' \
--data-raw '{
  "_id": "69f1ce63bd3e913a947bebcd",
  "productName": "Tadalafil",
  "brand": "Tadalafil",
  "originalPrice": 29.99,
  "salePrice": 29.99,
  "images": {
    "thumbnail": "https://res.cloudinary.com/dnkvlbwqk/image/upload/v1777454405/yjpsqdcsqn0ag41kr0ac.webp",
    "gallery": [
      "https://res.cloudinary.com/dnkvlbwqk/image/upload/v1777454405/yjpsqdcsqn0ag41kr0ac.webp"
    ]
  },
  "usage": [],
  "description": "",
  "howItWorks": "Tadalafil (Cialis) is a medication used to treat erectile dysfunction. Dosing depends on age, tolerance, and response to the medication.",
  "generics": [
    "Tadalafil"
  ],
  "markup": 0,
  "dosageOptions": [
    {
      "name": "2.5MG Tablets",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebce"
    },
    {
      "name": "5MG Tablet",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebcf"
    },
    {
      "name": "10MG Tablet",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebd0"
    },
    {
      "name": "20MG Tablet",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebd1"
    }
  ],
  "quantityOptions": [
    {
      "name": "30 Tablets (2.5MG Tablets)",
      "priceAdjustment": 29.99,
      "_id": "69f1ce63bd3e913a947bebd2"
    },
    {
      "name": "30 Tablets (10MG Tablet)",
      "priceAdjustment": 29.99,
      "_id": "69f1ce63bd3e913a947bebd4"
    },
    {
      "name": "30 Tablets (20MG Tablet)",
      "priceAdjustment": 39.99,
      "_id": "69f1ce63bd3e913a947bebd5"
    },
    {
      "name": "90 Tablets (2.5MG Tablets)",
      "priceAdjustment": 79.98,
      "_id": "69f1cf5bbd3e913a947bebfc"
    },
    {
      "name": "90 Tablets (10MG Tablet)",
      "priceAdjustment": 79.98,
      "_id": "69f1cf5bbd3e913a947bebfe"
    },
    {
      "name": "90 Tablets (20MG Tablet)",
      "priceAdjustment": 99.98,
      "_id": "69f1cf5bbd3e913a947bebff"
    }
  ],
  "precautions": "",
  "sideEffects": "Consult your healthcare provider for complete side effect information.",
  "drugInteractions": "May interact with other medications. Consult your healthcare provider about all medications you are taking.",
  "indications": "Tadalafil (Cialis) is a medication used to treat erectile dysfunction. Dosing depends on age, tolerance, and response to the medication.",
  "stock": 450,
  "rating": 5,
  "status": "in_stock",
  "visibility": true,
  "healthCategory": "mens-health",
  "healthTypeSlug": [
    "ed-refill"
  ],
  "healthTypeId": [
    "69f0923cb36cc3300bd1094b"
  ],
  "isTrendy": false,
  "isBestOffer": false,
  "discountPercentage": 0,
  "views": 0,
  "isActive": true,
  "createdAt": "2026-04-29T09:24:51.205Z",
  "updatedAt": "2026-04-29T14:44:21.354Z",
  "__v": 6,
  "subCategory": [
    {
      "name": "ED Refill",
      "slug": "ed-refill",
      "description": "Manage erectile dysfunction with prescription treatment options.",
      "icon": "",
      "order": 3,
      "isActive": true,
      "_id": "69f0923cb36cc3300bd1094b"
    }
  ],
  "precaution": "",
  "dosageOption": [
    {
      "name": "2.5MG Tablets",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebce"
    },
    {
      "name": "5MG Tablet",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebcf"
    },
    {
      "name": "10MG Tablet",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebd0"
    },
    {
      "name": "20MG Tablet",
      "priceAdjustment": 1,
      "_id": "69f1ce63bd3e913a947bebd1"
    }
  ],
  "quantityOption": [
    {
      "name": "30 Tablets (2.5MG Tablets)",
      "priceAdjustment": 29.99,
      "_id": "69f1ce63bd3e913a947bebd2"
    },
    {
      "name": "30 Tablets (10MG Tablet)",
      "priceAdjustment": 29.99,
      "_id": "69f1ce63bd3e913a947bebd4"
    },
    {
      "name": "30 Tablets (20MG Tablet)",
      "priceAdjustment": 39.99,
      "_id": "69f1ce63bd3e913a947bebd5"
    },
    {
      "name": "90 Tablets (2.5MG Tablets)",
      "priceAdjustment": 79.98,
      "_id": "69f1cf5bbd3e913a947bebfc"
    },
    {
      "name": "90 Tablets (10MG Tablet)",
      "priceAdjustment": 79.98,
      "_id": "69f1cf5bbd3e913a947bebfe"
    },
    {
      "name": "90 Tablets (20MG Tablet)",
      "priceAdjustment": 99.98,
      "_id": "69f1cf5bbd3e913a947bebff"
    }
  ]
}'
```

Expected:
- `success: true`
- Response `data.healthTypeSlug` only has `ed-refill`.

---

## 8) Verify Remove (Direct + Filter Checks)

### 8.1 Get Medicine by ID

```bash
curl --location 'https://mr-telexrs-hw.vercel.app/api/v1/admin/medicines/69f1ce63bd3e913a947bebcd' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjBmMzBjZTlmYzE2YzcxOTgxNWIzNyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NzQ3NzYyNSwiZXhwIjoxNzc4MDgyNDI1fQ.aXpoZmbmAxYU81ldug9rDhvPW3D0MabQ_YsaeR6qbig'
```

Expected:
- `data.healthTypeSlug = ["ed-refill"]`
- `data.subCategory` only contains `ed-refill`

### 8.2 Get `erectile-dysfunction` Medicines Again

```bash
curl --location 'https://mr-telexrs-hw.vercel.app/api/v1/admin/medicines?healthTypeSlug=erectile-dysfunction&limit=100' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjBmMzBjZTlmYzE2YzcxOTgxNWIzNyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NzQ3NzYyNSwiZXhwIjoxNzc4MDgyNDI1fQ.aXpoZmbmAxYU81ldug9rDhvPW3D0MabQ_YsaeR6qbig'
```

Expected:
- Medicine `69f1ce63bd3e913a947bebcd` is no longer in this list.

---

## Notes for Frontend Payload Handling

1. `healthTypeSlug` now supports multiple values (array).
2. Removing a subcategory is done by sending only the values to keep in `healthTypeSlug` (and/or `subCategory`).
3. `subCategory` may contain slugs/IDs/object items (backend normalizes them).
4. `healthCategory` may be sent as slug (`mens-health`) or ID.
5. Backend derives and syncs `healthTypeId` and populated `subCategory` from category `types`.
