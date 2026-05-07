PARTNER API
Version 2025.01.01
Table of Contents
Overview 5
Customers and Patients 5
Types of Orders 5
Test Environment Products 6
Order of Record Creation 6
Handling Duplicate Record Creation Requests 6
Order Status Workflow 7
Support and Feature Requests 8
Authentication 9
Errors 9
Versioning 9
Endpoints 10
CUSTOMERS 10
The Customer object 10
Create a Customer 13
REQUEST 13
RESPONSE 14
Success 14
Error 15
Get a Customer 16
REQUEST 16
RESPONSE 16
Success 16
Error 17
Update a Customer 18
REQUEST 18
RESPONSE 19
Success 19
Error 21
Update a Customer’s Address 22
REQUEST 22
RESPONSE 23
Success 23
Error 23
PATIENTS 24
Partner API Documentation 1 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
The Patient object 24
Create a Patient 26
REQUEST 26
RESPONSE 27
Success 27
Error 29
Get a Patient 30
REQUEST 30
RESPONSE 30
Success 30
Error 30
Update a Patient 31
REQUEST 31
RESPONSE 31
Success 31
Error 32
ORDERS 33
The Order object 33
Create an Order 35
Example 1: Create an order with two Prescription products 35
REQUEST 35
RESPONSE 36
Success 36
Error 37
Example 2: Create an order with two Prescription products; one product is a transfer from another
pharmacy 37
REQUEST 37
RESPONSE 38
Success 38
Error 39
Example 3: Create an order with two OTC products 39
REQUEST 39
RESPONSE 40
Success 40
Error 40
Example 4: Create an order with two Prescription products, having multiple patients 41
REQUEST 41
RESPONSE 41
Success 41
Error 42
Partner API Documentation 2 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Example 5: Create an order with both Prescription and OTC items, having multiple patients 42
REQUEST 42
RESPONSE 43
Success 43
Error 44
Example 6: Create an order with a new Prescription included. 45
REQUEST 45
RESPONSE 46
Success 46
Error 48
Example 7: Create an order using an existing (refill) Prescription. 49
REQUEST 49
RESPONSE 49
Success 49
Error 51
Get an Order 52
REQUEST 52
RESPONSE 52
Success 52
Error 54
Cancel an Order 54
REQUEST 54
RESPONSE 54
Success 54
Error 55
Simulating Order Fulfillment Workflows in the Test Environment In the Test environment, orders can be advanced through the workflows to simulate fulfilments. Orders
can be advanced through the Order Status Workflow using the following API call: 55
55
REQUEST 55
RESPONSE 55
Success 55
Error 55
SHIPMENTS 56
The Shipment object 56
Get Shipments 56
REQUEST 56
RESPONSE 56
Success 56
Error 58
REPORTS 59
Partner API Documentation 3 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Order Processing Report 59
REQUEST 59
RESPONSE 59
Daily Orders Report 60
REQUEST 60
RESPONSE 60
NOTIFICATIONS 61
Order Notifications 61
Shipment Notifications 62
Convenience Feature: Nested API Calls Example: Create a Patient (with a Customer) REQUEST 63
RESPONSE 65
Example: Create an Order (with a Customer and/or a Patient) Example: Creating a Customer, a Patient, and an Order (all Prescription products) REQUEST 68
RESPONSE 70
Example: Creating a Customer and an Order (all OTC products) REQUEST 72
RESPONSE 74
Example: Creating a Customer, a Patient, and an Order (Prescription and OTC products) REQUEST 77
RESPONSE 79
Example: Creating a Patient and an Order 63
63
67
67
72
76
83
REQUEST 84
RESPONSE 85
Appendix A — Child Object Definitions 88
Address 88
Line Item 90
Transfer 90
Transfer Pharmacy 91
Transfer Prescriber 91
Prescription 92
Prescription Patient Info 93
Prescription Medication 94
Prescription Prescriber 94
Metadata 96
Partner API Documentation 4 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Overview
The HealthWarehouse Partner API is organized around REST principles. The API has predictable
resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses
standard HTTP response codes, authentication, and verbs.
In general, objects created through the API can be retrieved and updated, but not deleted.
Customers and Patients
In terms of the API, the Customer is the billing contact – the person providing payment for an order.
The Patient is the shipping contact – the recipient of the prescription. A Patient is always associated with a
single Customer, by customer
id. In cases where someone is ordering a product for themselves, the
_
Customer and Patient are the same individual.
Types of Orders
Using the API, Orders can be created for two types of products:
●
Prescription: Products that require a prescription to order.
●
OTC (Over-The-Counter): Products that do not require a prescription to order.
Orders containing both Prescription and OTC products will be split into two Orders: one with all Prescription
items and the other with all OTC items. Both orders will be returned in the API response, and full details of this
behavior can be found in the Orders examples.
Orders containing only Prescription products are required to fit exactly one of two cases:
●
Associate a Patient to the entire Order, applying to all Line Items on the Order. This association can be
done one of two ways:
○
By including a patient_id in the Order object.
○
By a Nested API Call, attaching an entire Patient object (in place of the patient_id) to the Order.
■ This case will create the Patient, then the Order, in sequence.
●
Include a Patient for each Line Item on the Order. In this scenario, each order line item will have its own
association to a patient, by patient_id. Note that nested calls cannot be utilized for this case!
Orders containing only OTC products require a Customer for the Order. Such orders do not require a Patient,
and should not have one in the request.
Partner API Documentation 5 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Test Environment Products
In the Test environment, specific product IDs should be used for testing API calls. All examples in this
document use these product IDs. The following are test products and their types:
Product ID (product_id) Type of Product
100 Prescription
101 Prescription
102 Prescription
200 OTC
201 OTC
202 OTC
For product IDs to use in the Production environment, please contact your partner account representative.
Order of Record Creation
The API always creates records in a defined order:
1. Customer
2. Patient – Must be associated with a Customer. Only required for Orders containing Prescription
products.
3. Order – Must be associated with a Customer and a Patient for an Order containing Prescription
products. Must be associated with a Customer for an Order containing only OTC products.
These objects can be created individually or these calls can be combined for convenience and to limit the total
number of required API calls (read more about this in Nested API Calls section below).
Handling Duplicate Record Creation Requests
Metadata containing the partner
_
customer
_
id, partner
_
patient
_
id, and partner
_
order
_
id keys
can be utilized to prevent record duplication. If duplicate record creation requests with the same values for
these keys are received, new records will not be created.
Partner API Documentation 6 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Order Status Workflow
Orders have the following possible status values:
processing Order has been received.
transfer_success (Transfer orders only) Prescription has been successfully transferred.
transfer_failure (Transfer orders only) Prescription has failed to transfer.
complete Order has been fully shipped. This is a terminal state.
canceled Order was canceled (by API call). This is a terminal state.
Orders that do not contain transfer line items adhere to the following workflow:
Partner API Documentation 7 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Orders that do contain transfer line-items have additional order statuses to communicate the status of the
transfer:
Order Notifications and Shipment Notifications are sent on each transition of order and shipment status. On
transfer orders, Order Notifications include order comments made by the Pharmacy during fulfillment.
Shipment Notifications include tracking information from carriers.
Support and Feature Requests
For questions or technical support, or if you have API data issues requiring intervention, please contact your
partner account representative.
Partner API Documentation 8 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
If you have an idea for extended functionality (within or outside the scope of this API), or a feature that your
organization could use, please contact your partner account representative.
Partner API Documentation 9 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Authentication
The HealthWarehouse Partner API uses API keys to authenticate requests. API keys are managed by
HealthWarehouse. To manage your API keys, please contact your partner account representative.
Authentication to the API is performed via HTTP bearer auth.
All API requests must be made over HTTPS. Calls made over plain HTTP will fail. API requests without
authentication will also fail. All API endpoints accept and return JSON-encoded content.
Example
GET /v1/customers/1234
Host: partners.healthwarehouse.com
Authorization: Bearer {your-API-key-here}
Content-Type: application/json
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/1.0 (KHTML, like Gecko;
Gmail Actions)
Errors
HealthWarehouse uses conventional HTTP response codes to indicate the success or failure of an API
request. In general: Codes in the 2xx range indicate success. Codes in the 4xx range indicate error that failed
given the information provided (e.g., a required parameter was omitted in the request, a parameter was in an
invalid format, etc.). Codes in the 5xx range indicate an error with HealthWarehouse’s servers.
Some 4xx errors that could be handled programmatically (e.g., a customer could not be created) include an
error code that briefly explains the error reported.
Versioning
The current API version can be found at the bottom of the title page of this document.
Whenever possible, changes to the API are always backwards-compatible. In cases where breaking changes
are deemed absolutely necessary, notification will be provided no later than 90 days prior to production rollout.
Partner API Documentation 10 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Endpoints
CUSTOMERS
The Customer object
Customer objects allow you to retrieve, create, and update Customers that are associated with your partner
account. You can only retrieve or update Customers that you have created using the API.
Customers have associated billing addresses and shipping addresses, including multiple of each. Customers
must have at least one billing address and at least one shipping address. Sending requests without any billing
or shipping addresses to the API will result in a 400 Bad Request error.
ATTRIBUTES
id
number
REQUIRED FOR GET/UPDATE
prefix
string
first
_
string
REQUIRED
name
middle
string
name
_
last
_
string
REQUIRED
name
suffix
string
email
string
Unique identifier for the customer.
Only set after the creation of the customer.
Customer’s name prefix (e.g. Mr., Mrs., Dr., Fr., Sis., Rev., etc.)
Default: (none)
Customer’s first name.
Customer’s middle name.
Default: (none)
Customer’s last name.
gender
string
dob
string
Customer’s name suﬃx (e.g. Jr., Sr., III, IV, Esq., etc.)
Default: (none)
Customer email address where order notifications will be sent.
Format: email address.
Default: (no email)
Customer’s gender (male, female)
Default: (none)
Customer’s date of birth.
Format: YYYY-MM-DD.
Default: (none)
Partner API Documentation 11 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
billing_
addresses
list of Addresses
REQUIRED: AT LEAST 1
List of billing addresses for a customer.
Child object: Address
shipping_
addresses
list of Address objects
REQUIRED: AT LEAST 1
created
at
_
string
(RESPONSE ONLY)
updated
at
_
string
(RESPONSE ONLY)
metadata
Metadata object
List of shipping addresses for a customer.
Child object: Address
Creation time of customer.
Format: 2020-01-20T12:34:56Z
RFC3339 timestamp in UTC timezone.
Last modified time of customer.
Format: 2020-01-20T12:34:56Z
RFC3339 timestamp in UTC timezone.
Key-value metadata for a customer using predefined keys.
Default: (none)
Child object: Metadata
# The Customer Object
{
"customer": {
"id": 45678,
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "mjefferson3@stanford.edu"
"gender": "male"
,
"dob": "1972-10-22"
,
"billing
addresses": [{
_
"address
id": 7890,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
,
Partner API Documentation 12 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
_
"fax": ""
,
"label": "Home Address"
,
}],
"shipping
addresses": [{
_
"address
id": 7891,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
_
"fax": ""
,
"label": "Work Address"
,
"metadata": { # (Optional) Metadata fields using predefined keys
"partner
customer
id": "123ABC"
_
_
}],
}
}
}
Partner API Documentation 13 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Create a Customer
This endpoint creates a new Customer and any associated Addresses.
REQUEST
POST https://partners.healthwarehouse.com/v1/customers
{
"customer": {
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "mjefferson3@stanford.edu"
"gender": "male"
,
"dob": "1972-10-22"
,
"billing
addresses": [{
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
_
"fax": ""
,
"label": "Home Address"
,
,
}],
"shipping
addresses": [{
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
_
"last
name": "Jefferson"
_
,
,
Partner API Documentation 14 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
_
"fax": ""
,
"label": "Work Address"
,
}]
}
}
RESPONSE
Success
{
"customer": {
"id": 45678,
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "mjefferson3@stanford.edu"
,
"gender": "male"
,
"dob": "1972-10-22"
,
"created
at": "2020-01-20T12:34:56Z"
_
"updated
at": "2020-01-20T12:34:56Z"
_
"billing
addresses": [{
_
"address
id": 7890,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
,
,
Partner API Documentation 15 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Home Address"
,
"created
at": "2020-01-20T12:34:56Z"
_
"updated
at": "2020-01-20T12:34:56Z"
_
,
}],
"shipping
addresses": [{
_
"address
id": 7891,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Work Address"
,
"created
at": "2020-01-20T12:34:56Z"
_
"updated
at": "2020-01-20T12:34:56Z"
_
,
}]
}
}
Error
{
"status": 4xx | 5xx
Partner API Documentation 16 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"message": "Detailed error message here.
"
}
Get a Customer
This endpoint returns information about an existing Customer and all associated Addresses.
REQUEST
GET https://partners.healthwarehouse.com/v1/customers/:id
GET https://partners.healthwarehouse.com/v1/customers/45678
RESPONSE
Success
{
"customer": {
"id": 45678,
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "mjefferson3@stanford.edu"
,
"gender": "male"
,
"dob": "1972-10-22"
,
"created
at": "2020-01-20T12:34:56Z"
_
"updated
at": "2020-01-20T12:34:56Z"
_
"billing
addresses": [{
_
"address
id": 7890,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
,
,
Partner API Documentation 17 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"created
at": "2020-01-20T12:34:56Z"
_
"updated
at": "2020-01-20T12:34:56Z"
_
,
}],
"shipping
addresses": [{
_
"address
id": 7891,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"created
at": "2020-01-20T12:34:56Z"
_
"updated
at": "2020-01-20T12:34:56Z"
_
,
}]
}
}
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Partner API Documentation 18 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Update a Customer
This endpoint is used to update the base information for a Customer.
Do not use this endpoint for modification of Customer Addresses; any addresses sent to this endpoint will be
ignored by the API. To update Customer Addresses, use the endpoint Update a Customer’s Address, below.
REQUEST
POST https://partners.healthwarehouse.com/v1/customers/:id
POST https://partners.healthwarehouse.com/v1/customers/45678
{
"customer": {
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "mjefferson4@stanford.edu"
"gender": "male"
,
"dob": "1972-10-21"
,
"billing
addresses": [{
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "345 Modified St.
"
,
"address2": ""
,
"city": "Erlanger"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41018"
,
_
"phone": "859-777-7777"
,
"phone
evening": "859-777-7778"
_
"fax": "212-212-2121"
,
,
}],
"shipping
addresses": [{
_
Partner API Documentation 19 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "345 Modified St.
"
,
"address2": ""
,
"city": "Erlanger"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41018"
,
_
"phone": "859-777-7777"
,
"phone
evening": "859-777-7778"
_
"fax": "212-212-2121"
,
}]
}
}
RESPONSE
Success
{
"customer": {
"id": 45678,
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "mjefferson4@stanford.edu"
,
"gender": "male"
,
"dob": "1972-10-21"
,
"created
at": "2020-01-20T12:34:56Z"
_
"updated
at": "2020-01-20T12:34:56Z"
_
"billing
addresses": [{
_
"address
id": 7890,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
,
,
Partner API Documentation 20 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Home Address"
,
"created
at": "2020-01-20T12:34:56Z"
,
_
"updated
at": "2020-01-20T12:34:56Z"
_
}],
"shipping
addresses": [{
_
"address
id": 7891,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Work Address"
,
"created
at": "2020-01-20T12:34:56Z"
_
"updated
at": "2020-01-20T12:34:56Z"
_
,
}]
}
}
Partner API Documentation 21 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Partner API Documentation 22 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Update a Customer’s Address
This endpoint is used for updating billing and/or shipping Address information for a Customer.
Change the billing_
address or shipping_
address portion of the URL to select which type of address you
intend to update.
Addresses with a simple change to only their label field are updated in-place, and the address
_
id will not
change.
Addresses with changes to any field other than the label will be created as new addresses by the API. Note that
the address
id returned in the response might be different than the original address
id sent in the request
_
_
URL. This is normal API behavior, and it is the partner’s responsibility to store the address
id’s of any updated
_
addresses. A subsequent Get a Customer call will return all of the Customer information with addresses and
their address
id’s for partner verification.
_
REQUEST
POST https://partners.healthwarehouse.com/v1/customers/:id/billing_
address/:address
id
_
POST https://partners.healthwarehouse.com/v1/customers/:id/shipping_
address/:address
_
id
POST https://partners.healthwarehouse.com/v1/customers/45678/billing_
address/7891
POST https://partners.healthwarehouse.com/v1/customers/45678/shipping_
address/7891
{
"address": {
"address
id": 7891,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "345 Modified St.
"
,
"address2": ""
,
"city": "Erlanger"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41018"
,
_
"phone": "859-777-7777"
,
"phone
evening": "859-777-7778"
_
"fax": "212-212-2121"
,
"label": "Work Address"
,
Partner API Documentation 23 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
}
}
RESPONSE
Success
{
"success": true,
"address": {
"address
id": 7891,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "345 Modified St.
"
,
"address2": ""
,
"city": "Erlanger"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41018"
,
_
"phone": "859-777-7777"
,
"phone
evening": "859-777-7778"
,
_
"fax": "212-212-2121"
,
"label": "Work Address"
,
"created
at": "2020-01-20T12:34:56Z"
_
"updated
at": "2020-01-20T12:34:56Z"
_
,
}
"status": 200,
"message": "success"
}
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Partner API Documentation 24 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
PATIENTS
The Patient object
Patient objects allow you to retrieve, create, and update Patients that are associated with your partner account.
You can only retrieve or update Patients that you have created using the API.
If you are creating a new Patient with a new associated Customer, this can be done in a single step to simplify
API calls. This can be done by calling the Create a Patient endpoint with a full Customer object specified
instead of customer
_
id. See Nested API Calls Example: Create a Patient (with a Customer) for full details.
Note that Nested API Calls are not intended for use when creating Patients associated to existing Customers.
ATTRIBUTES
id
number
REQUIRED FOR GET/UPDATE
customer
Customer object
REQUIRED WHEN ALSO
CREATING NEW CUSTOMER
customer
id
_
number
REQUIRED FOR EXISTING
CUSTOMER ONLY
prefix
string
first
_
string
REQUIRED
name
middle
string
name
_
last
_
string
REQUIRED
name
suffix
string
patient
type
_
string
REQUIRED FOR ANIMAL ONLY
Unique identifier for the patient.
Only set after creation of patient.
Full customer object of new customer associated with patient
(Customer will be created prior to Patient creation).
Child object: Customer
Unique identifier of the (already existing) customer associated
with this patient.
Patient’s name prefix (e.g. Mr., Mrs., Dr., Fr., Sis., Rev., etc.)
Default: (none)
Patient’s first name.
Patient’s middle name.
Default: (none)
Patient’s last name.
Patient’s name suﬃx (e.g. Jr., Sr., III, IV, Esq., etc.)
Default: (none)
Designates species for patients that are animals.
Valid values:
●
canine
●
feline
Partner API Documentation 25 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
●
equine
●
bovine
●
other
Default: (none)
Patient’s maiden name.
Default: (none)
Patient’s gender,
maiden
string
name
_
gender
string
REQUIRED
pregnant
boolean
REQUIRED
dob
string
REQUIRED
safety_
cap
boolean
“female” or “male”
.
Whether the patient is pregnant (true) or not (false).
Patient’s date of birth
Format: YYYY-MM-DD.
Whether to use a safety cap on dispensed medications
(true => use safety cap, false => do not use safety cap).
Default: false
Patient’s drug allergies, as a comma-separated list.
To indicate no known drug allergies, use “none”
.
drug_
allergy
string
REQUIRED
other
_
string
REQUIRED
medications
medical
string
REQUIRED
conditions
_
created
at
_
string
(RESPONSE ONLY)
updated
at
_
string
(RESPONSE ONLY)
metadata
Metadata object
Patient’s other medications, as a comma-separated list.
To indicate no other medications, use “none”
.
Patient’s medical conditions, as a comma-separated list.
To indicate no medical conditions, use “none”
.
Creation time of patient.
Format: 2020-01-20T12:34:56Z
RFC3339 timestamp in UTC timezone.
Last modified time of patient.
Format: 2020-01-20T12:34:56Z
RFC3339 timestamp in UTC timezone.
Key-value metadata for a patient using predefined keys.
Default: (none)
Child object: Metadata
# The Patient Object
{
"patient": {
Partner API Documentation 26 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"id": 54321,
"customer
id": 424242,
_
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
_
"last
name": "Jefferson"
_
"suffix": "III"
,
"maiden
name": "Smith"
,
_
"gender": "female"
,
"pregnant": false,
"dob": "1975-03-04"
,
"safety
cap": false,
_
,
,
"drug
allergy": "codeine"
,
_
"other
medications": "cetirizine, multivitamin"
,
_
"medical
conditions": "none"
,
_
"metadata": { # (Optional) Metadata fields using predefined keys
"partner
patient
id": "123ABC"
_
_
}
}
}
Create a Patient
This endpoint creates a new Patient.
Optionally, an additional shipping_
address parameter (an object of type: Address) can be included with this
request. If present, a single new shipping address will be created for the associated Customer. This is intended
to simplify the creation of a new Patient and a new address without having to make two separate API calls. If a
new shipping address was created, the address will also be present in the response, with a new address
id.
_
Do not include the shipping_
address parameter if making a nested call to also create the Customer at the
same time. In this case, a 400 Bad Request error will result. Instead, include the shipping_
address inside of
shipping_
addresses on the Customer object in the nested call.
For details on usage and restrictions of nested calls (e.g. to create a Customer and Patient in a single call), see
Nested API Calls.
REQUEST
POST https://partners.healthwarehouse.com/v1/patients
{
Partner API Documentation 27 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"patient": {
"customer
id": 424242,
_
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
_
"last
name": "Jefferson"
_
"suffix": "III"
,
"maiden
name": "Smith"
,
_
"gender": "female"
,
"pregnant": false,
"dob": "1975-03-04"
,
"safety
cap": false,
_
,
,
"drug
allergy": "codeine"
,
_
"other
medications": "cetirizine, multivitamin"
_
"medical
conditions": "none"
_
,
},
"shipping
address": {
_
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "III"
,
"company": "Testing, Inc.
"
,
"address1": "789 Example St.
"
,
"address2": "Apartment 23"
,
"city": "Crestview Hills"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-666-6666"
,
"phone
evening": "859-666-5556"
,
_
"fax": "123-456-7890"
,
"label": "My New Patient Address"
}
}
RESPONSE
Success
{
"patient": {
Partner API Documentation 28 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"id": 54321,
"customer
id": 424242,
_
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
_
"last
name": "Jefferson"
_
"suffix": "III"
,
"maiden
name": "Smith"
,
_
"gender": "female"
,
"pregnant": false,
"dob": "1975-03-04"
,
"safety
cap": false,
_
,
,
"drug
allergy": "codeine"
,
_
"other
medications": "cetirizine, multivitamin"
_
"medical
conditions": "none"
,
_
"created
at": "2020-01-20T12:34:56Z"
,
_
"updated
at": "2020-01-20T12:34:56Z"
_
,
},
"shipping
address": {
_
"address
id": 7892,
_
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "III"
,
"company": "Testing, Inc.
"
,
"address1": "789 Example St.
"
,
"address2": "Apartment 23"
,
"city": "Crestview Hills"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-666-6666"
,
"phone
evening": "859-666-5556"
,
_
"fax": "123-456-7890"
,
"label": "My New Patient Address"
,
"created
at": "2020-03-05T22:44:28Z"
,
_
"updated
at": "2020-03-05T22:44:28Z"
_
}
}
Partner API Documentation 29 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Partner API Documentation 30 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Get a Patient
This endpoint retrieves information about an existing Patient.
REQUEST
GET https://partners.healthwarehouse.com/v1/patients/:id
GET https://partners.healthwarehouse.com/v1/patients/54321
RESPONSE
Success
{
"patient": {
"id": 54321,
"customer
id": 424242,
_
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
_
"last
name": "Jefferson"
_
"suffix": "III"
,
"maiden
name": "Smith"
,
_
"gender": "female"
,
"pregnant": false,
"dob": "1975-03-04"
,
"safety
cap": false,
_
,
,
"drug
allergy": "codeine"
,
_
"other
medications": "cetirizine, multivitamin"
,
_
"medical
conditions": "none"
,
_
"created
at": "2020-01-20T12:34:56Z"
,
_
"updated
at": "2020-01-20T12:34:56Z"
_
}
}
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Partner API Documentation 31 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Update a Patient
This endpoint updates information for an existing Patient.
REQUEST
POST https://partners.healthwarehouse.com/v1/patients/:id
POST https://partners.healthwarehouse.com/v1/patients/54321
{
"patient": {
"customer
id": 424242,
_
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
_
"last
name": "Jefferson"
_
"suffix": "III"
,
"maiden
name": "Smith"
,
_
"gender": "female"
,
"pregnant": false,
"dob": "1975-03-04"
,
"safety
cap": true,
_
,
,
"drug
allergy": "codeine, morphine"
,
_
"other
medications": "cetirizine, multivitamin, albuterol"
,
_
"medical
conditions": "asthma"
_
}
}
RESPONSE
Success
{
"patient": {
"id": 54321,
"customer
id": 424242,
_
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
_
"last
name": "Jefferson"
_
"suffix": "III"
,
,
,
Partner API Documentation 32 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"maiden
name": "Smith"
,
_
"gender": "female"
,
"pregnant": false,
"dob": "1975-03-04"
,
"safety
cap": true,
_
"drug
allergy": "codeine, morphine"
,
_
"other
medications": "cetirizine, multivitamin, albuterol"
,
_
"medical
conditions": "asthma"
,
_
"created
at": "2020-01-20T12:34:56Z"
,
_
"updated
at": "2020-01-20T12:34:56Z"
_
}
}
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Partner API Documentation 33 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
ORDERS
The Order object
Order objects allow you to retrieve, create, and cancel Orders that are associated with your partner account.
You can only retrieve or cancel Orders that you have created using the API. You can also retrieve Shipment
information associated with a specific Order.
If you are creating a new Order with a new associated Patient and a new associated Customer, this can be
done in a single step to simplify API calls. This can be done by calling the Create an Order endpoint with full
Customer and full Patient objects specified instead of customer
id and patient
id. See Nested API Calls
_
_
Example: Create an Order (with a Patient and a Customer) for full details.
ATTRIBUTES
id
number
REQUIRED FOR GET/CANCEL
customer
Customer object
REQUIRED WHEN ALSO
CREATING NEW CUSTOMER
Unique identifier for the order.
Only set after creation of order.
Full customer object of new customer associated with order.
(Customer will be created prior to order creation).
Do not include the customer.id field; replaces customer_id.
Child object: Customer.
Unique identifier of the (already existing) customer associated
with this patient.
customer
id
_
number
REQUIRED FOR EXISTING
CUSTOMER ONLY
patient
Patient object
REQUIRED WHEN ALSO
CREATING NEW PATIENT
ASSOCIATED TO ALL LINE ITEMS!
patient
id
_
number
REQUIRED FOR EXISTING
PATIENT ONLY
ASSOCIATED TO ALL LINE ITEMS!
billing_
address
id
_
number
REQUIRED FOR CREATE ONLY
Full patient object of new patient associated with order.
(Patient will be created prior to order creation).
Do not include the patient.id field; replaces patient_id.
Do not include on orders with all OTC products.
(See Types of Orders for an explanation and links to examples)
Child object: Patient.
Unique identifier of the (already existing) patient associated
with order.
Usage of this field will associate the patient with all order line
items.
To associate a patient to each order line item, see Line Item.
Do not include on orders with all OTC products.
(See Types of Orders for an explanation and links to examples)
Unique identifier (address_id) of the customer address to use
for billing.
If using a nested call, do not include.
Partner API Documentation 34 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
shipping_
address
id
_
number
REQUIRED FOR CREATE ONLY
order
string
comment
_
shipping_
method
string
REQUIRED
Unique identifier (address_id) of the customer address to use
for shipping.
If using a nested call, do not include.
A free-form text field for adding commentary to an order.
Default: (none)
The shipping method to use for the order.
Valid values:
●
●
free
standard
●
●
●
●
●
●
●
●
●
●
●
usps_first_class
usps_priority
usps_express
ups_ground
ups_2day
ups_nextday
fedex_ground
fedex_home_delivery
fedex_express_saver
fedex_2day
fedex_overnight_standard
List of order line items.
Child object: Line Item.
line
items
_
list of LineItem objects
REQUIRED: AT LEAST 1
status
string
(RESPONSE ONLY)
created
at
_
string
(RESPONSE ONLY)
updated
at
_
string
(RESPONSE ONLY)
metadata
Metadata object
Order’s current status.
Valid order status values (see: Order Status Workflow):
●
processing: Order has been received.
●
dispensed: Order has been dispensed.
●
complete: Order has been fully shipped.
●
canceled: Order was canceled (by API call).
Creation time of order.
Format: 2020-01-20T12:34:56Z
RFC3339 timestamp in UTC timezone.
Last modified time of order.
Format: 2020-01-20T12:34:56Z
RFC3339 timestamp in UTC timezone.
Key-value metadata for an order using predefined keys.
Default: (none)
Child object: Metadata
Partner API Documentation 35 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
# The Order Object
{
"order": {
"id": 87654321,
"customer
id": 424242,
_
"patient
id": 434343,
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"status": "processing"
,
"order
comment": "This is an example order.
_
"
"shipping
method": "free"
,
_
"line
items": [
_
{
,
"product
id": 100,
_
"qty": 60
},
{
"product
_
"qty": 30
id": 101,
}
],
"metadata": { # (Optional) Metadata fields using predefined keys
"partner
order
id": "123ABC"
_
_
}
}
}
Create an Order
This endpoint creates a new Order for a given Customer and Patient.
Creating an order requires billing_
address
_
id and shipping_
address
id to choose which customer
_
address(es) to use for the order’s billing and shipping address. If using a nested call to create a
customer/patient with the order, omit these parameters. If the address
id’s are not known, they can be
_
retrieved via a Get a Customer call.
For details on usage and restrictions of nested calls (e.g. to create a Customer, Patient, and Order in a single
call), see Nested API Calls.
Partner API Documentation 36 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Example 1: Create an order with two Prescription products
REQUEST
POST https://partners.healthwarehouse.com/v1/orders
{
"order": {
"customer
id": 424242,
_
"patient
id": 434343, // Patient is associated with all line items
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"order
comment": "This is an example order.
_
"
,
"shipping
method": "free"
,
_
"line
items": [
_
{
"product
id": 100, // Prescription Product
_
"qty": 60
},
{
"product
_
"qty": 30
id": 101, // Prescription Product
}
]
}
}
RESPONSE
Success
{
"success": true,
"order": {
"id": 87654321,
"customer
id": 424242,
_
"patient
id": 434343,
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"status": "processing"
,
"order
comment": "This is an example order.
_
"
"shipping
method": "free"
,
_
,
Partner API Documentation 37 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"line
items": [
_
{
"product
id": 100,
_
"qty": 60
},
{
"product
id": 101,
_
"qty": 30
}
],
"created
at": "2021-01-20T12:34:56Z"
_
"updated
at": "2021-01-20T12:34:56Z"
_
,
},
"status": 200,
"message": "success"
}
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Example 2: Create an order with two Prescription products; one product is a transfer from another
pharmacy
REQUEST
POST https://partners.healthwarehouse.com/v1/orders
{
"order": {
"customer
id": 424242,
_
"patient
id": 434343, // Patient is associated with all line items
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"order
comment": "This is an example order.
_
"
,
"shipping
method": "free"
,
_
"line
items": [
_
{
Partner API Documentation 38 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"product
id": 100, // Prescription Product
_
"qty": 60
},
{
"product
id": 101, // Prescription Product
_
"qty": 30,
"transfer": {
"pharmacy": {
"phone": "123-123-1234"
},
"prescriber" : {
"first
name": "Bob"
,
_
"last
name": "McDoctor"
,
_
"phone": "555-555-5555"
}
}
}
]
}
}
RESPONSE
Success
{
"success": true,
"order": {
"id": 87654322,
"customer
id": 424242,
_
"patient
id": 434343,
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"status": "processing"
,
"order
comment": "This is an example order.
_
"
,
"shipping
method": "free"
,
_
"line
items": [
_
{
"product
id": 100,
_
"qty": 60
},
Partner API Documentation 39 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
{
"product
id": 101,
_
"qty": 30,
"transfer": {
"pharmacy": {
"phone": "123-123-1234"
},
"prescriber" : {
"first
name": "Bob"
,
_
"last
name": "McDoctor"
_
"phone": "555-555-5555"
,
}
}
}
],
"created
at": "2021-01-20T12:34:56Z"
_
"updated
at": "2021-01-20T12:34:56Z"
_
,
},
"status": 200,
"message": "success"
}
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Example 3: Create an order with two OTC products
REQUEST
POST https://partners.healthwarehouse.com/v1/orders
{
"order": {
"customer
id": 424242,
_
// Note: no patient
id, as there is no associated patient
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
Partner API Documentation 40 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"order
comment": "This is an example order.
_
"
"shipping
method": "free"
,
_
"line
items": [
_
{
"product
id": 200, // OTC Product
_
"qty": 5
},
{
,
"product
_
"qty": 10
id": 201, // OTC Product
}
]
}
}
RESPONSE
Success
{
"success": true,
"order": {
"id": 87654323,
"customer
id": 424242,
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"order
comment": "This is an example order.
_
"
,
"shipping
method": "free"
,
_
"line
items": [
_
{
"product
id": 200,
_
"qty": 5
},
{
"product
id": 201,
_
"qty": 10
}
],
"created
at": "2021-01-20T12:34:56Z"
,
_
"updated
at": "2021-01-20T12:34:56Z"
_
},
Partner API Documentation 41 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"status": 200,
"message": "success"
}
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Example 4: Create an order with two Prescription products, having multiple patients
REQUEST
POST https://partners.healthwarehouse.com/v1/orders
{
"order": {
"customer
id": 424242,
_
// Note: no patient
id here, on line
items instead
_
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"order
comment": "This is an example order.
_
"
,
"shipping
method": "free"
,
_
"line
items": [
_
{
"product
id": 100, // Prescription Product
_
"qty": 60,
"patient
id": 434343 // Patient #1
_
},
{
"product
id": 101, // Prescription Product
_
"qty": 30,
"patient
id": 454545 // Patient #2
_
}
]
}
}
Partner API Documentation 42 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
RESPONSE
Success
{
"success": true,
"order": {
"id": 87654324,
"customer
id": 424242,
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"order
comment": "This is an example order.
_
"shipping
method": "free"
,
_
"line
items": [
_
{
"
,
"product
id": 100,
_
"qty": 60,
"patient
id": 434343
_
},
{
"product
id": 101,
_
"qty": 30,
"patient
id": 454545
_
}
],
"created
at": "2021-01-20T12:34:56Z"
_
"updated
at": "2021-01-20T12:34:56Z"
_
,
},
"status": 200,
"message": "success"
}
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Partner API Documentation 43 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Example 5: Create an order with both Prescription and OTC items, having multiple patients
REQUEST
POST https://partners.healthwarehouse.com/v1/orders
{
"order": {
"customer
id": 424242,
_
// Note: no patient
id here, on line
_
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"order
comment": "This is an example order.
_
"shipping
method": "free"
,
_
"line
items": [
_
{
items instead
"
,
"product
id": 100, // Prescription Product
_
"qty": 60,
"patient
id": 434343 // Patient #1
_
},
{
"product
id": 101, // Prescription Product
_
"qty": 30,
"patient
id": 454545 // Patient #2
_
},
{
"product
"qty": 5
id": 200, // OTC Product
_
},
{
"product
_
"qty": 10
id": 201, // OTC Product
}
]
}
}
RESPONSE
Success
{
Partner API Documentation 44 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"success": true,
"order": {
"id": 87654325,
"customer
id": 424242,
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"status": "processing"
,
"order
comment": "This is an example order.
_
"shipping
method": "free"
,
_
"line
items": [
_
{
"
,
"product
id": 100,
_
"qty": 60,
"patient
id": 434343
_
},
{
"product
id": 101,
_
"qty": 30,
"patient
id": 454545
_
},
],
"created
at": "2021-01-20T12:34:56Z"
,
_
"updated
at": "2021-01-20T12:34:56Z"
_
},
"split
order": {
_
"id": 87654326,
"customer
id": 424242,
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"status": "processing"
,
"order
comment": "This is an example order.
_
"
"shipping
method": "free"
,
_
"line
items": [
_
{
,
"product
id": 200,
_
"qty": 5
},
{
"product
id": 201,
_
"qty": 10
Partner API Documentation 45 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
}
],
"created
at": "2021-01-20T12:34:56Z"
_
"updated
at": "2021-01-20T12:34:56Z"
_
,
},
"status": 200,
"message": "success"
}
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Example 6: Create an order with a new Prescription included.
NOTE: Prescription information should only be included in your requests if you have been explicitly
authorized to do so by your partner account representative. Most orders for prescription items do not
require this information. See Prescription for additional information.
REQUEST
POST https://partners.healthwarehouse.com/v1/orders
{
"order": {
"customer
id": 424242,
_
// Note: no patient
id here, on line
items instead
_
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"order
comment": "This is an example order.
_
"
,
"shipping
method": "free"
,
_
"line
items": [
_
{
"product
id": 101,
_
"qty": 30,
"patient
id": 434343,
_
"prescription": {
"patient
info": {
_
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
,
_
Partner API Documentation 46 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"last
name": "Jefferson"
,
_
"suffix": "III"
,
"address1": "789 Example St.
"address2": "Apartment 23"
,
"city": "Crestview Hills"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"dob": "1975-03-04"
"
,
},
"medication": {
"name": "ibuprofen"
,
"quantity": 30,
"refills": 4,
"daw": false,
"sig
code": "1QD"
,
_
"directions": "Take 1 tablet daily"
"units
dose": "200mg"
,
_
"dose
frequency": "Once daily"
_
,
},
"prescriber" : {
"first
name": "Bob"
,
_
"last
name": "McDoctor"
,
_
"address": "123 Example St.
"
,
"city": "Nowhere"
,
"state": "KS"
,
"postal
code": "54321"
,
_
"phone": "555-555-7777"
,
"fax": "555-555-8888"
,
"npi
number": "0000000000"
,
_
"license
number": "123456"
,
_
"dea
number": "AA1234560"
_
},
"comments
instructions": "This is a free-form text field for any
_
additional instructions or comments.
"
}
}
]
}
}
Partner API Documentation 47 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
RESPONSE
Success
{
"success": true,
"order": {
"id": 87654326,
"customer
id": 424242,
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"status": "processing"
,
"order
comment": "This is an example order.
_
"shipping
method": "free"
,
_
"line
items": [
_
{
"
,
"product
id": 101,
_
"qty": 30,
"patient
id": 434343,
_
"prescription
id": 55555,
_
"prescription": {
"patient
info": {
_
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "III"
,
"address1": "789 Example St.
"address2": "Apartment 23"
,
"city": "Crestview Hills"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"dob": "1975-03-04"
"
,
},
"medication": {
"name": "ibuprofen"
,
"quantity": 30,
"refills": 4,
"daw": false,
Partner API Documentation 48 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"sig
code": "1QD"
,
_
"directions": "Take 1 tablet daily"
,
"units
dose": "200mg"
,
_
"dose
frequency": "Once daily"
_
},
"prescriber" : {
"first
name": "Bob"
,
_
"last
name": "McDoctor"
,
_
"address": "123 Example St.
"city": "Nowhere"
,
"state": "KS"
,
"postal
code": "54321"
,
_
"phone": "555-555-7777"
,
"fax": "555-555-8888"
,
"npi
number": "0000000000"
,
_
"license
number": "123456"
,
_
"dea
number": "AA1234560"
_
"
,
},
"comments
instructions": "This is a free-form text field for any
_
additional prescription instructions or comments.
"
}
}
],
"created
at": "2021-01-20T12:34:56Z"
_
"updated
at": "2021-01-20T12:34:56Z"
_
,
},
"status": 200,
"message": "success"
}
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Partner API Documentation 49 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Example 7: Create an order using an existing (refill) Prescription.
NOTE: Prescription information should only be included in your requests if you have been explicitly
authorized to do so by your partner account representative. Most orders for prescription items do not
require this information. See Prescription for additional information.
REQUEST
POST https://partners.healthwarehouse.com/v1/orders
{
"order": {
"customer
id": 424242,
_
// Note: no patient
id here, on line
items instead
_
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"order
comment": "This is an example order.
_
"
,
"shipping
method": "free"
,
_
"line
items": [
_
{
"product
id": 101,
_
"qty": 30,
"patient
id": 434343,
_
"prescription
id": 55555
_
}
]
}
}
RESPONSE
Success
{
"success": true,
"order": {
"id": 87654326,
"customer
id": 424242,
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"status": "processing"
,
"order
comment": "This is an example order.
_
"
,
"shipping
method": "free"
,
_
Partner API Documentation 50 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"line
items": [
_
{
"product
id": 101,
_
"qty": 30,
"patient
id": 434343,
_
"prescription
id": 55555,
_
"prescription": {
"patient
info": {
_
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "III"
,
"address1": "789 Example St.
"address2": "Apartment 23"
,
"city": "Crestview Hills"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"dob": "1975-03-04"
"
,
},
"medication": {
"name": "ibuprofen"
,
"quantity": 30,
"refills": 4,
"daw": false,
"sig
code": "1QD"
,
_
"directions": "Take 1 tablet daily"
,
"units
dose": "200mg"
,
_
"dose
frequency": "Once daily"
_
},
"prescriber" : {
"first
name": "Bob"
,
_
"last
name": "McDoctor"
,
_
"address": "123 Example St.
"city": "Nowhere"
,
"state": "KS"
,
"postal
code": "54321"
,
_
"phone": "555-555-7777"
,
"fax": "555-555-8888"
,
"
,
Partner API Documentation 51 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"npi
number": "0000000000"
_
"license
number": "123456"
_
"dea
number": "AA1234560"
,
,
_
},
"comments
instructions": "This is a free-form text field for any
_
additional prescription instructions or comments.
"
}
}
],
"created
"updated
_
at": "2021-01-20T12:34:56Z"
at": "2021-01-20T12:34:56Z"
,
_
},
"status": 200,
"message": "success"
}
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Partner API Documentation 52 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Get an Order
This endpoint retrieves information about an existing Order.
REQUEST
GET https://partners.healthwarehouse.com/v1/orders/:id
GET https://partners.healthwarehouse.com/v1/orders/87654321
RESPONSE
Success
{
"order": {
"id": 87654321,
"customer
id": 424242,
_
"patient
id": 434343,
_
"billing
address
id": 7890,
_
_
"shipping
address
id": 7891,
_
_
"status": "processing"
,
"order
comment": "This is an example order.
_
"shipping
method": "free"
,
_
"line
items": [
_
{
"
,
"product
id": 100,
_
"qty": 60
},
{
"product
id": 101,
_
"qty": 30,
"transfer": { // transfer will return for Example 2 only
"pharmacy": {
"phone": "123-123-1234"
},
"prescriber" : {
"first
name": "Bob"
,
_
"last
name": "McDoctor"
_
"phone": "555-555-5555"
,
}
Partner API Documentation 53 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
}
}
],
"created
_
at": "2020-01-20T12:34:56Z"
,
"updated
_
at": "2020-01-20T12:34:56Z"
},
"billing
_
address": {
"address
_
id": 7890,
"prefix": "Mr.
"
,
"first
_
name": "Maxwell"
,
"middle
_
name": "Example"
,
"last
_
name": "Jefferson"
,
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
_
code": "41042"
,
"phone": "859-555-5555"
,
"phone
_
evening": "859-555-5556"
,
"fax": ""
,
"label": "Home Address"
,
"created
_
at": "2020-01-20T12:34:56Z"
,
"updated
_
at": "2020-01-20T12:34:56Z"
},
"shipping
_
address": {
"address
_
id": 7891,
"prefix": "Mr.
"
,
"first
_
name": "Maxwell"
,
"middle
_
name": "Example"
,
"last
_
name": "Jefferson"
,
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
Partner API Documentation 54 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Work Address"
,
"created
at": "2020-01-20T12:34:56Z"
_
"updated
at": "2020-01-20T12:34:56Z"
,
_
},
}
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Cancel an Order
The endpoint cancels an order that was placed via the API.
Note that orders may only be canceled when they have status =
‘processing.
’ Orders that have already been
dispensed or completed cannot be canceled; attempting to do so will result in an API error (unable to cancel
order).
REQUEST
POST https://partners.healthwarehouse.com/v1/orders/:id/cancel
POST https://partners.healthwarehouse.com/v1/orders/87654321/cancel
(empty body)
RESPONSE
Success
{
"success": true,
"order
id": 87654321,
_
"status": 200,
"message": "Order #87654321 was canceled.
"
}
Partner API Documentation 55 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Simulating Order Fulfillment Workflows in the Test Environment
In the Test environment, orders can be advanced through the workflows to simulate fulfilments. Orders can be
advanced through the Order Status Workflow using the following API call:
REQUEST
POST https://partners-test.healthwarehouse.com/v1/orders/:id/status
POST https://partners-test.healthwarehouse.com/v1/orders/87654321/status
{
"status": "dispensed"
}
RESPONSE
Success
{
"success": true,
"order
id": 87654321,
_
"status": 200,
"message": "success"
}
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Partner API Documentation 56 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
SHIPMENTS
The Shipment object
The Shipment object holds information for order shipments. This object is present in a Get Shipments
response.
ATTRIBUTES
items
_
number
shipped
carrier
string
code
_
The quantity of items shipped in a particular shipment.
Abbreviated code representing the shipping carrier associated
with the shipment.
Example: “USPS”
.
The full shipping carrier name associated with the shipment.
Example: “United States Postal Service.
”
The tracking number associated with the shipment.
carrier
title
_
string
tracking_
number
string
billing_
address
Address object
shipping_
address
Address object
Billing address on the order being checked for shipments.
Child object: Address
Shipping address on the order being checked for shipments.
Child object: Address
Get Shipments
This endpoint retrieves information about Shipments and Address information for an existing Order.
REQUEST
GET https://partners.healthwarehouse.com/v1/shipments/:order
_
id
GET https://partners.healthwarehouse.com/v1/shipments/87654321
RESPONSE
Success
{
"shipments": [
{
"items
shipped": 30,
_
Partner API Documentation 57 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"carrier
code": "usps"
,
_
"carrier
title": "United States Postal Service"
_
"tracking
number": "99999999999999999998"
_
,
},
{
"items
shipped": 60,
_
"carrier
code": "usps"
,
_
"carrier
title": "United States Postal Service"
_
"tracking
number": "99999999999999999999"
_
,
}
],
"billing
address": {
_
"address
id": 7890,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Home Address"
,
"created
at": "2020-01-20T12:34:56Z"
_
"updated
at": "2020-01-20T12:34:56Z"
_
,
},
"shipping
address": {
_
"address
id": 7891,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
Partner API Documentation 58 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Work Address"
,
"created
at": "2020-01-20T12:34:56Z"
_
"updated
at": "2020-01-20T12:34:56Z"
,
_
}
}
Error
{
"status": 4xx | 5xx
"message": "Detailed error message here.
"
}
Partner API Documentation 59 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
REPORTS
Reports can be generated by sending API requests to the endpoints specified in this section. Reports are
generated as a CSV file, always with a header row as the first row in the response.
Order Processing Report
A report on when specific orders are received and when they ship, allowing for tracking of average order
processing time.
REQUEST
GET
https://partners.healthwarehouse.com/v1/reports/order_processing?start=2021-08-01&end=2021-08-24
PARAMETERS
start
string
REQUIRED
end
string
REQUIRED
RESPONSE
Start date of report range.
Format: YYYY-MM-DD.
End date of report data.
Format: YYYY-MM-DD.
Response format is a CSV file where the first row is a header row.
COLUMNS
Order ID
REQUIRED
Partner Order ID Processing At
REQUIRED
Completed At
REQUIRED
Processing Days
REQUIRED
Order ID of the order for each row.
Format: Integer.
Partner Order ID (if set on order creation as in Handling Duplicate Record Creation
Requests) of the order for each row.
Format: String.
Date and time of order creation.
Format: 2020-01-20T12:34:56Z
RFC3339 timestamp in UTC timezone.
Date and time of order shipment.
Format: 2020-01-20T12:34:56Z
RFC3339 timestamp in UTC timezone.
Number of days that the order spent processing (between Processing At and
Completed At).
Format: Integer.
Partner API Documentation 60 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Tracking Number Carrier’s tracking number for the order’s shipment (if shipped).
Format: String.
Daily Orders Report
A statistical report on how many orders were received, shipped, and held on each day in a given date range.
REQUEST
GET https://partners.healthwarehouse.com/v1/reports/daily_orders?start=2021-08-01&end=2021-08-24
PARAMETERS
start
string
REQUIRED
end
string
REQUIRED
RESPONSE
Start date of report range. Report runs for each day in the range.
Format: YYYY-MM-DD.
End date of report data. Report runs for each day in the range.
Format: YYYY-MM-DD.
Response format is a CSV file where the first row is a header row.
COLUMNS
Report Date
REQUIRED
Orders Received
REQUIRED
Orders Shipped
REQUIRED
Orders Held
REQUIRED
One row per day in the date range from start to end.
Format: YYYY-MM-DD.
Count of orders received on the day Report Date.
Format: Integer.
Count of orders shipped on the day Report Date.
Format: Integer.
Count of orders held on the day Report Date.
Orders can be held for a number of reasons, such as contacting the prescribing
physician on a prescription order.
Format: Integer.
Partner API Documentation 61 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
NOTIFICATIONS
Notifications can be sent unauthenticated or configured for HTTP Basic or Bearer token authentication.
Order Notifications
HealthWarehouse will send an HTTPS POST request whenever the status of an order has been updated.
ATTRIBUTES
order
_
number
status
string
id
Unique identifier for the order.
Order’s updated status.
Valid order status values (see: Order Status Workflow):
●
●
●
processing: Order has been received.
dispensed: Order has been dispensed.
transfer_success: (Transfer orders only) Prescription has been successfully
transferred.
●
●
●
transfer_failure: (Transfer orders only) Prescription has failed to transfer.
complete: Order has been fully shipped.
canceled: Order was canceled (by API call).
Message associated with the status update.
message
string
POST https://{partner-order-notification-url-here}
{
"order_id": 87654321,
"status": "dispensed",
"message": "Order has been dispensed."
}
Partner API Documentation 62 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Shipment Notifications
HealthWarehouse will send an HTTPS POST request with the following payload to an endpoint of your
choosing whenever an order is shipped.
ATTRIBUTES
order
_
number
id
shipment
_
number
id
tracking_
number
string
status
string
Unique identifier for the order.
Unique identifier for the shipment.
Carrier’s tracking number for the package.
Order status.
Valid shipment status values:
●
complete: Order has been fully shipped.
POST https://{partner-shipment-notification-url-here}
{
"order_id": 87654321,
"shipment_id": 67890,
"tracking_number": "1Z2A3Z4Z5A6Z7A8Z"
"status": "complete"
}
Partner API Documentation 63 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Convenience Feature: Nested API Calls
As a convenience, the API provides nested calls for operations commonly done in sequence, such as creating a
Customer and a Patient at the same time. Or, creating an Order, Patient, and Customer all at once.
Example: Create a Patient (with a Customer)
To use this feature, provide a full Customer object to a Create a Patient call, replacing the customer_id
parameter. The Customer object should have the name customer.
This nested call is functionally equivalent to calling Create a Customer, then calling Create a Patient.
Note the defined Order of Record Creation.
Note that the embedded field patient.customer
_
Customer and Patient.
id should be omitted from nested calls that create a
Note that this should not be done for existing Customers. When creating a Patient for an existing
Customer, always refer to the Customer by customer
id.
_
REQUEST
POST https://partners.healthwarehouse.com/v1/patients
{
"patient": {
"customer": {
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "mjefferson3@stanford.edu"
,
"gender": "male"
,
"dob": "1972-10-22"
,
"billing
addresses": [{
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
Partner API Documentation 64 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
_
"fax": ""
,
"label": "Home Address"
,
}],
"shipping
addresses": [{
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
_
"fax": ""
,
"label": "Work Address"
,
}]
},
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
_
"last
name": "Jefferson"
_
"suffix": "III"
,
"maiden
name": "Smith"
,
_
"gender": "female"
,
"pregnant": false,
"dob": "1975-03-04"
,
"safety
cap": false,
_
,
,
"drug
allergy": "codeine"
,
_
"other
medications": "cetirizine, multivitamin"
_
,
Partner API Documentation 65 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"medical
conditions": "none"
_
}
RESPONSE
}
{
"success": true,
"patient": {
"id": 538,
"customer
id": 536,
_
"customer": {
"id": 536,
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "noemail+1612290346224210510@api.healthwarehouse.com"
"gender": "male"
,
"dob": "1972-10-22"
,
"billing
addresses": [
_
{
,
"address
id": 1249,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
_
"fax": ""
,
"label": "Home Address"
,
,
Partner API Documentation 66 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"created
at": "2021-02-02T18:25:46.224209719Z"
_
"updated
at": "2021-02-02T18:25:46.224209719Z"
_
,
}
],
"shipping
{
addresses": [
_
"address
id": 1250,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Work Address"
,
"created
at": "2021-02-02T18:25:46.224209719Z"
,
_
"updated
at": "2021-02-02T18:25:46.224209719Z"
_
}
],
"created
at": "2021-02-02T18:25:46.224209719Z"
,
_
"updated
at": "2021-02-02T18:25:46.224209719Z"
_
},
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
_
"last
name": "Jefferson"
_
"suffix": "III"
,
"maiden
name": "Smith"
,
_
"gender": "female"
,
"pregnant": false,
"dob": "1975-03-04"
,
"safety
cap": false,
_
,
,
Partner API Documentation 67 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"drug
allergy": "codeine"
,
_
"other
medications": "cetirizine, multivitamin"
_
"medical
conditions": "none"
,
_
"created
at": "2021-02-02T18:25:46.25931939Z"
,
_
"updated
at": "2021-02-02T18:25:46.25931939Z"
_
,
},
"status": 200,
"message": "success"
}
Example: Create an Order (with a Customer and/or a Patient)
Example: Creating a Customer, a Patient, and an Order (all Prescription products)
One may also create an Order, Patient, and Customer all in a single Create an Order call. This functions
similarly to the previous example, by providing an entire Patient object replacing the patient
id
_
parameter and an entire Customer object replacing the customer
id parameter. The Patient object
_
should have the name patient; the Customer object should have the name customer.
When all line items on an Order are Prescription products, it is required that there only be a single
Patient associated with all of the order line items. The Patient is put in the order.patient field of the
order itself. Nested calls cannot be utilized if separate patients are required for each line item. (See
Types of Orders for a full explanation)
Note that the embedded field patient.customer
id should be omitted from nested calls that create a
_
Customer and Patient. The API will set this field appropriately once the IDs have been determined
during object creation.
This nested call is functionally equivalent to calling Create a Customer, then calling Create a Patient,
then calling Create an Order. Note the defined Order of Record Creation.
Note that nested calls to create a Customer, Patient, and Order all at once have a limitation regarding
the Customer’s billing_addresses and shipping_addresses. Customers created using nested calls must
only have a single billing address and a single shipping address (these addresses may be the same
address or distinct, as long as there is exactly one of each address type within the Customer).
Otherwise, there is no way to specify which address to use for the billing and shipping addresses on the
Order. Attempting to use nested calls to Create an Order with a Customer having multiple customer
billing or shipping addresses will result in a 400 Bad Request error.
For these cases, use a separate Create a Customer call first, then either Create a Patient and Create an
Order in sequence, or a nested Create an Order to create the patient and order at the same time.
Partner API Documentation 68 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
REQUEST
POST https://partners.healthwarehouse.com/v1/orders
{
"order": {
"customer": {
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "mjefferson3@stanford.edu"
"gender": "male"
,
"dob": "1972-10-22"
,
"billing
addresses": [{
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
_
"fax": ""
,
"label": "Home Address"
,
,
}],
"shipping
addresses": [{
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
"address1": "123 Example St.
"
,
Partner API Documentation 69 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Work Address"
}]
},
"patient": {
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
_
"last
name": "Jefferson"
_
"suffix": "III"
,
"maiden
name": "Smith"
,
_
"gender": "female"
,
"pregnant": false,
"dob": "1975-03-04"
,
"safety
cap": false,
_
,
,
"drug
allergy": "codeine"
,
_
"other
medications": "cetirizine, multivitamin"
,
_
"medical
conditions": "none"
_
},
"order
comment": "This is an example order.
_
"
,
"shipping
method": "free"
,
_
"line
items": [
_
{
"product
id": 100, // Prescription Product
_
"qty": 60
},
{
}
"product
_
"qty": 30
id": 101, // Prescription Product
]
}
}
Partner API Documentation 70 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
RESPONSE
{
"success": true,
"order": {
"id": 1081,
"customer
id": 537,
_
"customer": {
"id": 537,
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "noemail+1612292530087723744@api.healthwarehouse.com"
,
"gender": "male"
,
"dob": "1972-10-22"
,
"billing
addresses": [
_
{
"address
id": 1251,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Home Address"
,
"created
at": "2021-02-02T19:02:10.087723272Z"
_
"updated
at": "2021-02-02T19:02:10.087723272Z"
_
,
}
],
Partner API Documentation 71 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"shipping
addresses": [
_
{
"address
id": 1252,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Work Address"
,
"created
at": "2021-02-02T19:02:10.087723272Z"
_
"updated
at": "2021-02-02T19:02:10.087723272Z"
_
,
}
],
"created
at": "2021-02-02T19:02:10.087723272Z"
,
_
"updated
at": "2021-02-02T19:02:10.087723272Z"
_
},
"patient
id": 539,
_
"patient": {
"id": 539,
"customer
id": 537,
_
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
_
"last
name": "Jefferson"
_
"suffix": "III"
,
"maiden
name": "Smith"
,
_
"gender": "female"
,
"pregnant": false,
"dob": "1975-03-04"
,
"safety
cap": false,
_
,
,
Partner API Documentation 72 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"drug
allergy": "codeine"
,
_
"other
medications": "cetirizine, multivitamin"
,
_
"medical
conditions": "none"
,
_
"created
at": "2021-02-02T19:02:10.119666735Z"
,
_
"updated
at": "2021-02-02T19:02:10.119666735Z"
_
},
"billing
address
id": 1251,
_
_
"shipping
address
id": 1252,
_
_
"status": "processing"
,
"order
comment": "This is an example order.
_
"shipping
method": "free"
,
_
"line
items": [
_
{
"product
id": 100,
_
"qty": 60
},
{
"
,
"product
id": 101,
_
"qty": 30
}
],
"created
at": "2021-02-02T19:02:10.208458883Z"
,
_
"updated
at": "2021-02-02T19:02:10.208458883Z"
_
},
"status": 200,
"message": "success"
}
Example: Creating a Customer and an Order (all OTC products)
This example is similar to the example above, but with all Over-The-Counter (OTC) products. In this
case, there will be no Patient on the Order request or response, as Patients are not valid for Orders
containing all OTC products.
REQUEST
POST https://partners.healthwarehouse.com/v1/orders
{
"order": {
"customer": {
"prefix": "Mr.
"
,
Partner API Documentation 73 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "mjefferson3@stanford.edu"
"gender": "male"
,
"dob": "1972-10-22"
,
"billing
addresses": [{
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
_
"fax": ""
,
"label": "Home Address"
,
,
}],
"shipping
addresses": [{
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
_
,
Partner API Documentation 74 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"fax": ""
,
"label": "Work Address"
}]
},
"order
comment": "This is an example order.
_
"shipping
method": "free"
,
_
"line
items": [
_
{
"product
id": 200, // OTC Product
_
"qty": 10
},
{
"
,
"product
"qty": 8
id": 201, // OTC Product
_
},
{
}
"product
_
"qty": 1
id": 202, // OTC Product
]
}
}
RESPONSE
{
"success": true,
"order": {
"id": 1081,
"customer
id": 537,
_
"customer": {
"id": 537,
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "noemail+1612292530087723744@api.healthwarehouse.com"
,
"gender": "male"
,
"dob": "1972-10-22"
,
Partner API Documentation 75 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"billing
addresses": [
_
{
"address
id": 1251,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Home Address"
,
"created
at": "2021-02-02T19:02:10.087723272Z"
_
"updated
at": "2021-02-02T19:02:10.087723272Z"
_
,
}
],
"shipping
{
addresses": [
_
"address
id": 1252,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
Partner API Documentation 76 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"fax": ""
,
"label": "Work Address"
,
"created
at": "2021-02-02T19:02:10.087723272Z"
_
"updated
at": "2021-02-02T19:02:10.087723272Z"
_
,
}
],
"created
at": "2021-02-02T19:02:10.087723272Z"
,
_
"updated
at": "2021-02-02T19:02:10.087723272Z"
_
},
"billing
address
id": 1251,
_
_
"shipping
address
id": 1252,
_
_
"status": "processing"
,
"order
comment": "This is an example order.
_
"shipping
method": "free"
,
_
"line
items": [
_
{
"product
id": 200,
_
"qty": 10
},
{
"
,
"product
"qty": 8
id": 201,
_
},
{
}
"product
id": 202,
_
"qty": 1
],
"created
at": "2021-02-02T19:02:10.208458883Z"
,
_
"updated
at": "2021-02-02T19:02:10.208458883Z"
_
},
"status": 200,
"message": "success"
}
Example: Creating a Customer, a Patient, and an Order (Prescription and OTC products)
This example combines the previous two examples into a single Order, containing both Prescription and
OTC products. Per Types of Orders, such Orders will be split into two orders: one for all Prescription
items and one for all OTC items.
Partner API Documentation 77 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Note the difference in the response format, particularly the split
order field. The Order containing
_
Prescription items will always be in the order field, followed by the Order containing OTC items in the
split
order field.
_
REQUEST
POST https://partners.healthwarehouse.com/v1/orders
{
"order": {
"customer": {
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "mjefferson3@stanford.edu"
"gender": "male"
,
"dob": "1972-10-22"
,
"billing
addresses": [{
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
_
"fax": ""
,
"label": "Home Address"
,
,
}],
"shipping
addresses": [{
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
_
,
Partner API Documentation 78 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
_
"fax": ""
,
"label": "Work Address"
,
}]
},
"patient": {
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
_
"last
name": "Jefferson"
_
"suffix": "III"
,
"maiden
name": "Smith"
,
_
"gender": "female"
,
"pregnant": false,
"dob": "1975-03-04"
,
"safety
cap": false,
_
,
,
"drug
allergy": "codeine"
,
_
"other
medications": "cetirizine, multivitamin"
,
_
"medical
conditions": "none"
_
},
"order
comment": "This is an example order.
_
"
,
"shipping
method": "free"
,
_
"line
items": [
_
{
"product
id": 100, // Prescription Product
_
"qty": 60
},
{
"product
id": 101, // Prescription Product
_
"qty": 30
Partner API Documentation 79 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
},
{
"product
_
"qty": 10
id": 200, // OTC Product
},
{
"product
id": 201, // OTC Product
_
"qty": 8
},
{
"product
id": 202, // OTC Product
_
"qty": 1
}
]
}
RESPONSE
}
{
"success": true,
"order": {
"id": 1081,
"customer
id": 537,
_
"customer": {
"id": 537,
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "noemail+1612292530087723744@api.healthwarehouse.com"
,
"gender": "male"
,
"dob": "1972-10-22"
,
"billing
addresses": [
_
{
"address
id": 1251,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
_
"last
name": "Jefferson"
_
,
,
Partner API Documentation 80 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Home Address"
,
"created
at": "2021-02-02T19:02:10.087723272Z"
_
"updated
at": "2021-02-02T19:02:10.087723272Z"
_
,
}
],
"shipping
{
addresses": [
_
"address
id": 1252,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Work Address"
,
"created
at": "2021-02-02T19:02:10.087723272Z"
,
_
"updated
at": "2021-02-02T19:02:10.087723272Z"
_
}
],
"created
at": "2021-02-02T19:02:10.087723272Z"
_
,
Partner API Documentation 81 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"updated
at": "2021-02-02T19:02:10.087723272Z"
_
},
"billing
address
id": 1251,
_
_
"shipping
address
id": 1252,
_
_
"status": "processing"
,
"order
comment": "This is an example split Prescription order.
_
"shipping
method": "free"
,
_
"line
items": [
_
{
"product
id": 100,
_
"qty": 60
},
{
"
,
"product
_
"qty": 30
id": 101,
},
],
"created
at": "2021-02-02T19:02:10.208458883Z"
_
"updated
at": "2021-02-02T19:02:10.208458883Z"
_
,
},
"split
order": { // This field is only returned if the order has been split.
_
"id": 1082,
"customer
id": 537,
_
"customer": {
"id": 537,
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "noemail+1612292530087723744@api.healthwarehouse.com"
,
"gender": "male"
,
"dob": "1972-10-22"
,
"billing
addresses": [
_
{
"address
id": 1251,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
Partner API Documentation 82 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Home Address"
,
"created
at": "2021-02-02T19:02:10.087723272Z"
_
"updated
at": "2021-02-02T19:02:10.087723272Z"
_
,
}
],
"shipping
{
addresses": [
_
"address
id": 1252,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Work Address"
,
"created
at": "2021-02-02T19:02:10.087723272Z"
,
_
"updated
at": "2021-02-02T19:02:10.087723272Z"
_
}
],
"created
at": "2021-02-02T19:02:10.087723272Z"
_
,
Partner API Documentation 83 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"updated
at": "2021-02-02T19:02:10.087723272Z"
_
},
"billing
address
id": 1251,
_
_
"shipping
address
id": 1252,
_
_
"status": "processing"
,
"order
comment": "This is an example split OTC order.
_
"shipping
method": "free"
,
_
"line
items": [
_
{
"
,
"product
id": 200,
_
"qty": 10
},
{
"product
"qty": 8
id": 201,
_
},
{
"product
id": 202,
_
"qty": 1
}
],
"created
at": "2021-02-02T19:02:10.208458883Z"
,
_
"updated
at": "2021-02-02T19:02:10.208458883Z"
_
},
"status": 200,
"message": "success"
}
Example: Creating a Patient and an Order
In a similar way, it is also possible to create a new Patient and Order for an existing Customer. For this
usage, provide a customer
id for the existing Customer and an entire patient object replacing the
_
patient
id parameter.
_
Using the nested calls in this way is functionally equivalent to calling Create a Patient, then calling
Create an Order. Note the defined Order of Record Creation.
Note that this should not be done for new Customers on existing Patients. This is not possible via the
API, since Patients are associated with a specific Customer and this association cannot be changed.
Partner API Documentation 84 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Note that Orders containing all OTC products should not have an associated Patient, so this nested call
cannot be used for such orders.
REQUEST
POST https://partners.healthwarehouse.com/v1/orders
{
"order": {
"customer
id": 54321,
_
"patient": {
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
_
"last
name": "Jefferson"
_
"suffix": "III"
,
"maiden
name": "Smith"
,
_
"gender": "female"
,
"pregnant": false,
"dob": "1975-03-04"
,
"safety
cap": false,
_
,
,
"drug
allergy": "codeine"
,
_
"other
medications": "cetirizine, multivitamin"
_
,
"medical
conditions": "none"
_
},
"order
comment": "This is an example order.
_
"shipping
method": "free"
,
_
"line
items": [
_
{
"
,
"product
id": 100, // Prescription Product
_
"qty": 60
},
{
"product
id": 101, // Prescription Product
_
"qty": 30
}
]
}
}
Partner API Documentation 85 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
RESPONSE
{
"success": true,
"order": {
"id": 1084,
"customer
id": 54321,
_
"customer": {
"id": 54321,
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"email": "noemail+1612292530087723744@api.healthwarehouse.com"
,
"gender": "male"
,
"dob": "1972-10-22"
,
"billing
addresses": [
_
{
"address
id": 1251,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": ""
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Home Address"
,
"created
at": "2021-02-02T19:02:10.087723272Z"
_
"updated
at": "2021-02-02T19:02:10.087723272Z"
_
,
}
],
Partner API Documentation 86 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"shipping
addresses": [
_
{
"address
id": 1252,
_
"prefix": "Mr.
"
,
"first
name": "Maxwell"
,
_
"middle
name": "Example"
,
_
"last
name": "Jefferson"
,
_
"suffix": "Esq.
"
,
"company": "Example, Inc.
"
,
"address1": "123 Example St.
"
,
"address2": "Apartment 3"
,
"city": "Florence"
,
"state": "KY"
,
"country": "US"
,
"postal
code": "41042"
,
_
"phone": "859-555-5555"
,
"phone
evening": "859-555-5556"
,
_
"fax": ""
,
"label": "Work Address"
,
"created
at": "2021-02-02T19:02:10.087723272Z"
_
"updated
at": "2021-02-02T19:02:10.087723272Z"
_
,
}
],
"created
at": "2021-02-02T19:02:10.087723272Z"
_
"updated
at": "2021-02-02T19:02:10.087723272Z"
_
,
},
"billing
address
id": 1251,
_
_
"shipping
address
id": 1252,
_
_
"patient
id": 65432,
_
"patient": {
"id": 65432,
"customer
id": 54321,
_
"prefix": "Mrs.
"
,
"first
name": "Atlanta"
,
_
"middle
name": "Example"
_
"last
name": "Jefferson"
_
"suffix": "III"
,
"maiden
name": "Smith"
,
_
"gender": "female"
,
"pregnant": false,
,
,
Partner API Documentation 87 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
"dob": "1975-03-04"
,
"safety
cap": false,
_
"drug
allergy": "codeine"
,
_
"other
medications": "cetirizine, multivitamin"
_
"medical
conditions": "none"
,
_
},
"status": "processing"
,
"order
comment": "This is an example order.
_
"
"shipping
method": "free"
,
_
"line
items": [
_
{
,
"product
_
"qty": 60
id": 100,
},
{
"product
_
"qty": 30
id": 101,
}
],
"created
"updated
at": "2021-02-02T19:02:10.208458883Z"
_
at": "2021-02-02T19:02:10.208458883Z"
,
_
},
"status": 200,
"message": "success"
}
Partner API Documentation 88 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Appendix A — Child Object Definitions
The following objects are child objects of the various object definitions defined in Endpoints, above. Note that
examples of these child objects are shown in the parent object sections above, where appropriate.
Address
The Address object is used wherever a shipping or billing address is needed in the API.
ATTRIBUTES
address
id
_
number
(RESPONSE ONLY)
prefix
string
first
_
string
REQUIRED
name
middle
string
name
_
last
_
string
REQUIRED
name
suffix
string
company
string
address1
string
REQUIRED
address2
string
city
string
REQUIRED
state
string
REQUIRED
Unique identifier for the address.
Present in all responses containing Addresses.
Customer’s name prefix (e.g. Mr., Mrs., Dr., Fr., Sis., Rev., etc.)
for address.
Customer’s first name for address.
Customer’s middle name for address.
Customer’s last name for address.
Customer’s name suﬃx (e.g. Jr., Sr., III, IV, Esq., etc.) for
address.
Company name for address.
Street address line 1.
Street address line 2. Typically Apartment or Unit number.
City for address.
State for address
Format: 2-character postal abbreviation.
Partner API Documentation 89 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
country
string
REQUIRED
Country for address.
Valid values:
●
“US”: United States
●
“GU”: Guam
●
“VI”: US Virgin Islands
Postal code for address.
Typically ZIP or ZIP+4 code.
postal
string
REQUIRED
code
_
phone
string
REQUIRED
phone
string
evening
_
fax
string
label
string
created
at
_
string
(RESPONSE ONLY)
updated
at
_
string
(RESPONSE ONLY)
Phone number (daytime or only) for address.
Format: XXX-XXX-XXXX.
Phone number (evening contact) for address.
Format: XXX-XXX-XXXX.
Fax number for address.
Format: XXX-XXX-XXXX.
Freeform descriptive label for the address.
Example: “My Home Address”
Creation time of address record.
Format: 2020-01-20T12:34:56Z
RFC3339 timestamp in UTC timezone.
Last modified time of address record.
Format: 2020-01-20T12:34:56Z
RFC3339 timestamp in UTC timezone.
Partner API Documentation 90 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Line Item
The Line Item object holds order line item information for a single line on an Order.
ATTRIBUTES
product
_
number
REQUIRED
id
qty
number
REQUIRED
patient
id
_
number
MAY BE REQUIRED
The unique identifier for the product in the line item on an
order.
Product IDs will be provided to partners as a CSV feed.
Quantity of the product in the line item on an order.
This will always be an integer number.
transfer
Transfer object
prescription
Prescription object
prescription
_
number
id
The unique identifier for the Patient associated with this line
item on an order.
This field is required for Prescription products, if there is not a
patient_id on the outer order object.
This field should not be included for OTC products.
(See Types of Orders for an explanation and links to examples)
Only required for transfer orders. Pharmacy and prescriber
information necessary to process a prescription transfer.
Child object: Transfer
Only required for creating a new prescription.
Patient, medication, and prescriber information necessary for
originating a new prescription. [See Example 6 for details]
(Only use this if you have been explicitly authorized to do so)
Child object: Prescription
Only required for creating a refill order from an existing
prescription.
Prescription ID is returned from first order where a prescription
object was included. Use this ID for subsequent orders refilling
from the same prescription. [See Example 7 for details]
(Only use this if you have been explicitly authorized to do so)
Transfer
The Transfer object holds two child objects: Pharmacy and Prescriber.
Transfer information should not be included for Line Items containing OTC products; doing so will result in an
API error.
ATTRIBUTES
Partner API Documentation 91 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
pharmacy
Transfer Pharmacy object
REQUIRED
prescriber
Transfer Prescriber object
REQUIRED
Information about the transferring pharmacy.
Child object: Transfer Pharmacy
Information about the prescriber of the transfer prescription.
Child object: Transfer Prescriber
Transfer Pharmacy
The Transfer Pharmacy object holds information about the transferring pharmacy when a prescription is to be
transferred into HealthWarehouse.
ATTRIBUTES
name
string
phone
string
REQUIRED
fax
string
rx
number
_
string
Transferring pharmacy name.
Phone number for transferring pharmacy.
Format: XXX-XXX-XXXX.
Fax number for transferring pharmacy.
Format: XXX-XXX-XXXX.
Prescription number from transferring pharmacy.
Transfer Prescriber
The Transfer Prescriber object holds information about the prescribing physician for a given prescription.
ATTRIBUTES
first
_
string
REQUIRED
name
last
_
string
REQUIRED
name
address
string
city
string
First name of prescribing physician.
Last name of prescribing physician.
Street address for prescribing physician.
City for prescribing physician.
state State for address
Partner API Documentation 92 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
string Format: 2-character postal abbreviation.
postal
string
code
_
phone
string
REQUIRED
fax
string
Postal code for prescribing physician.
Typically ZIP or ZIP+4 code.
Phone number for prescribing physician.
Format: XXX-XXX-XXXX.
Fax number for prescribing physician.
Format: XXX-XXX-XXXX.
Prescription
The Prescription object is used to electronically transmit a patient prescription from a provider to
HealthWarehouse.
The Prescription object holds three child objects: Patient Info, Medication, and Prescriber.
Prescription information should only be included in your requests if you have been explicitly authorized to do so
by your partner account representative. Most orders for prescription items do not require this information. If you
have any questions regarding what fields are required when sending a prescription, please contact your partner
account representative.
Prescription information should not be included for Line Items containing OTC products. Doing so will result in
an API error.
ATTRIBUTES
patient
info
_
Patient Info object
REQUIRED
medication
Medication object
REQUIRED
prescriber
Prescriber object
REQUIRED
addl
instructions
_
string
Information about the patient for which the prescription is
written.
Child object: Prescription Patient Info
Information about the medication being prescribed.
Child object: Medication
Information about the prescriber of the prescription.
Child object: Prescription Prescriber
Additional instructions or comments for the prescription.
Partner API Documentation 93 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Prescription Patient Info
The Prescription Patient Info object holds information about the patient for which the prescription is written.
ATTRIBUTES
prefix
string
first
_
string
REQUIRED
name
middle
string
name
_
last
_
string
REQUIRED
name
suffix
string
address1
string
REQUIRED
address2
string
city
string
REQUIRED
state
string
REQUIRED
country
string
REQUIRED
Patient’s name prefix (e.g. Mr., Mrs., Dr., Fr., Sis., Rev., etc.) for
prescription.
Patient’s first name for prescription.
Patient’s middle name for prescription.
Patient’s last name for prescription.
Patient’s name suﬃx (e.g. Jr., Sr., III, IV, Esq., etc.) for
prescription.
Patient’s street address line 1 for prescription.
Patient’s street address line 2 for prescription.
Typically Apartment or Unit number.
Patient’s city for prescription.
Patient’s state for prescription
Format: 2-character postal abbreviation.
postal
string
REQUIRED
_
dob
string
REQUIRED
code
Patient’s country for prescription.
Valid values:
●
“US”: United States
●
“GU”: Guam
●
“VI”: US Virgin Islands
Patient’s postal code for prescription.
Typically ZIP or ZIP+4 code.
Patient’s date of birth for prescription.
Format: YYYY-MM-DD.
Partner API Documentation 94 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Prescription Medication
The Prescription Medication object holds information about the medication for which the prescription is
written.
ATTRIBUTES
name
string
REQUIRED
quantity
number
REQUIRED
refills
number
REQUIRED
directions
string
REQUIRED
sig_
code
string
daw
boolean
Name of medication being prescribed (e.g. Ibuprofen).
Quantity of medication being prescribed.
Number of refills on the prescription.
Directions for the prescription label.
Sig code (pharmacy abbreviation) for the prescription
directions (e.g. 1QD).
Whether the prescription must be dispensed as written.
true → dispense as written
false → substitution allowed
Units or dosage of medication being prescribed (e.g. 200mg).
units
string
dose
_
dose
string
frequency
_
How often the prescription should be taken (e.g. once daily)
Prescription Prescriber
The Prescription Prescriber object holds information about the prescriber of the prescription.
ATTRIBUTES
first
_
string
REQUIRED
name
last
_
string
REQUIRED
name
First name of prescribing physician for prescription.
Last name of prescribing physician for prescription.
Partner API Documentation 95 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
address
string
REQUIRED
city
string
REQUIRED
state
string
REQUIRED
postal
string
REQUIRED
code
_
phone
string
REQUIRED
fax
string
REQUIRED
npi
_
string
number
Street address for prescribing physician for prescription.
City for prescribing physician for prescription.
State for address of prescribing physician for prescription.
Format: 2-character postal abbreviation.
Postal code for prescribing physician for prescription.
Typically ZIP or ZIP+4 code.
Phone number for prescribing physician for prescription.
Format: XXX-XXX-XXXX.
Fax number for prescribing physician for prescription.
Format: XXX-XXX-XXXX.
license
number
_
string
dea
number
_
string
REQUIRED FOR CONTROLLED
SUBSTANCES
Prescribing physican’s National Prescriber Identifier (NPI)
number.
Format: 10-digit number
Prescribing physician's license number.
Format: varies by state
Prescribing physician's DEA provider number.
Format: 2 letters, followed by 7 numbers
Partner API Documentation 96 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042
Metadata
The Metadata optionally object holds key-value strings for a single entity, such as a Customer, Patient, or Order.
ATTRIBUTES
{key}
string
REQUIRED
The unique identifier for a metadata value. This can be helpful
in cases where an ID would want to be associated with a
record.
Example: “partner_order_id”
Note: Metadata containing the partner
customer
id,
_
_
partner
patient
id, and partner
order
id keys can
_
_
_
_
be utilized to prevent record duplication. If duplicate record
creation requests with the same values for these keys are
received, new records will not be created.
The value for the metadata for a given key.
{value}
number
REQUIRED
Partner API Documentation 97 Healthwarehouse.com
7107 Industrial Rd
Florence, KY 41042