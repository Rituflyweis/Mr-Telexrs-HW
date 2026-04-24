const axios = require('axios');
const config = require('../config/healthwarehouse');

// Axios instance
const client = axios.create({
    baseURL: config.isTest ? config.testBaseURL : config.baseURL,
    timeout: config.timeout,
    headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
    }
});

// ============ CUSTOMER APIs ============


const createCustomer = (customerData) => {
    return client.post('/customers', customerData)
        .then((response) => {
            console.log(response, 'Response from HW Create Customer API');
            return response.data;
        })
        .catch((error) => {
            console.error('HealthWarehouse Create Customer API Error:', error.response?.data || error.message);
            throw error;
        });
};

const getCustomer = async (customerId) => {
    const response = await client.get(`/customers/${customerId}`);
    return response.data;
};

const updateCustomer = (customerId, customerData) => {
    console.log('Updating HW Customer:', {
        customerId,
        customerData: JSON.stringify(customerData, null, 2)
    });

    return client.post(`/customers/${customerId}`, customerData)
        .then((response) => {
            console.log('HW Customer Update Success:', response.status);
            return response.data;
        })
        .catch((error) => {
            if (error.response) {
                console.error('Update Customer Error:', {
                    status: error.response.status,
                    data: error.response.data,
                    customerId: customerId
                });
            } else if (error.request) {
                console.error('Update Customer No Response:', error.request);
            } else {
                console.error('Update Customer Error:', error.message);
            }
            throw error;
        });
};

const updateCustomerAddress = (customerId, addressId, addressData, type = 'billing') => {
    return client.post(`/customers/${customerId}/${type}_address/${addressId}`, addressData)
        .then((response) => {
            console.log('Update Customer Address HW-API', response.status)
            return response.data;
        })
        .catch((error) => {
            console.error('Update Customer Address Error:', error);
            throw error;
        });
};

// ============ PATIENT APIs ============

const createPatient = (patientData) => {
    return client.post('/patients', patientData)
        .then((response) => {
            console.log(response.status, 'Response-API');
            return response.data;
        })
        .catch((error) => {
            console.error('HealthWarehouse API Error:', error.response?.data || error.message);
            throw error;
        });
};

const getPatient = async (patientId) => {
    const response = await client.get(`/patients/${patientId}`);
    return response.data;
};

const updatePatient = (patientId, patientData) => {
    return client.post(`/patients/${patientId}`, patientData)
        .then((response) => {
            console.log('Response Update Patient HW API', response.status)
            return response.data;
        })
        .catch((error) => {
            console.error('Update Patient Error:', error.response?.data || error.message);
            throw error;
        });
};

// ============ ORDER APIs ============

const createOrder = (orderData) => {
    console.log('Creating HW Order with payload:', JSON.stringify(orderData, null, 2));

    return client.post('/orders', orderData)
        .then((response) => {
            console.log('HW Order created successfully:', response.data.order?.id);
            return response.data;
        })
        .catch((error) => {
            const hwError = error.response?.data;
            console.error('Create Order Error:', hwError || error.message);
            const err = new Error(JSON.stringify(hwError) || error.message);
            err.status = error.response?.status;
            throw err;
        });
};

// Get single order with status
const getOrder = (orderId) => {
    console.log(`Getting HW order: ${orderId}`);

    return client.get(`/orders/${orderId}`)
        .then((response) => {
            console.log('Response of GET Order from HW', response.status)
            return response.data;
        })
        .catch((error) => {
            console.error('Get Order Error:', error.response?.data || error.message);
            // throw error;
        });
};


const cancelOrder = (orderId) => {
    return client.post(`/orders/${orderId}/cancel`)
        .then((response) => {
            console.log('Response Cancel Order HW API', response.status);
            return response.data;
        })
        .catch((error) => {
            console.error('Cancel Order Error:', error.response?.data || error.message);
            throw error;
        });
};

// ============ SHIPMENT APIs ============

const getShipments = (orderId) => {
    console.log(`Getting shipments for HW order: ${orderId}`);

    return client.get(`/shipments/${orderId}`)
        .then((response) => {
            console.log('Shipments retrieved successfully', response.status);
            return response.data;
        })
        .catch((error) => {
            console.error('Get Shipments Error:', error.response?.data || error.message);
            //  throw error;
        });
};

// ============ REPORT APIs ============

const getOrderProcessingReport = async (startDate, endDate) => {
    const response = await client.get('/reports/order_processing', {
        params: { start: startDate, end: endDate }
    });
    return response.data;
};

const getDailyOrdersReport = async (startDate, endDate) => {
    const response = await client.get('/reports/daily_orders', {
        params: { start: startDate, end: endDate }
    });
    return response.data;
};

// ============ TEST ENVIRONMENT HELPERS ============

const simulateOrderStatus = async (orderId, status) => {
    if (!config.isTest) {
        throw new Error('Status simulation only available in test environment');
    }
    const response = await client.post(`/orders/${orderId}/status`, { status });
    return response.data;
};

// ============ BUILDING PAYLOADS ============

const buildCustomerPayload = (userData, addresses = {}) => {
    return {
        customer: {
            prefix: userData.prefix || '',
            first_name: userData.firstName,
            middle_name: userData.middleName || '',
            last_name: userData.lastName,
            suffix: userData.suffix || '',
            email: userData.email,
            gender: userData.gender || '',
            dob: userData.dob || '',
            billing_addresses: [{
                "prefix": userData.prefix || '',
                "first_name": userData.firstName,
                "middle_name": userData.middleName || '',
                "last_name": userData.lastName,
                "suffix": userData.suffix || '',
                "company": "",
                "address1": addresses.addressLine1,
                "address2": addresses.addressLine2,
                "city": addresses.city,
                "state": addresses.state,
                "country": addresses.country,
                "postal_code": addresses.postalCode,
                "phone": addresses.phoneNumber,
                "phone_evening": "",
                "fax": "",
                "label": addresses.type
            }] || [],
            shipping_addresses: [{
                "prefix": userData.prefix || '',
                "first_name": userData.firstName,
                "middle_name": userData.middleName || '',
                "last_name": userData.lastName,
                "suffix": userData.suffix || '',
                "company": "",
                "address1": addresses.addressLine1,
                "address2": addresses.addressLine2,
                "city": addresses.city,
                "state": addresses.state,
                "country": addresses.country,
                "postal_code": addresses.postalCode,
                "phone": addresses.phoneNumber,
                "phone_evening": "",
                "fax": "",
                "label": addresses.type
            }] || [],
            // metadata: {
            //     partner_customer_id: userData._id?.toString() || userData.id
            // }
        }
    };
};

const buildPatientPayload = (patientData, customerId) => {
    return {
        patient: {
            customer_id: customerId,
            prefix: patientData.prefix || '',
            first_name: patientData.firstName,
            middle_name: patientData.middleName || '',
            last_name: patientData.lastName,
            suffix: patientData.suffix || '',
            maiden_name: patientData.maidenName || '',
            gender: patientData.gender,
            pregnant: patientData.isPregnant || false,
            dob: patientData.dob,
            safety_cap: patientData.safetyCap || false,
            drug_allergy: Array.isArray(patientData.allergies) ? patientData.allergies.join(', ') : (patientData.allergies || 'none'),
            other_medications: Array.isArray(patientData.otherMeds) ? patientData.otherMeds.join(', ') : (patientData.otherMeds || 'none'),
            medical_conditions: Array.isArray(patientData.conditions) ? patientData.conditions.join(', ') : (patientData.conditions || 'none'),
            // metadata: {
            //     partner_patient_id: patientData._id?.toString() || patientData.id
            // }
        }
    };
};

const buildOrderPayload = (orderData, customerId, patientId) => {
    return {
        order: {
            customer_id: customerId,
            patient_id: patientId,
            billing_address_id: orderData.billingAddressId,
            shipping_address_id: orderData.shippingAddressId,
            order_comment: orderData.notes || '',
            shipping_method: orderData.shippingMethod || 'standard',
            line_items: orderData.items.map(item => ({
                product_id: item.productId,
                qty: item.quantity
            })),
            // metadata: {
            //     partner_order_id: orderData._id?.toString() || orderData.id
            // }
        }
    };
};

// ============ EXPORT ALL FUNCTIONS ============

module.exports = {
    // Customer
    createCustomer,
    getCustomer,
    updateCustomer,
    updateCustomerAddress,

    // Patient
    createPatient,
    getPatient,
    updatePatient,

    // Order
    createOrder,
    getOrder,
    cancelOrder,

    // Shipment
    getShipments,

    // Reports
    getOrderProcessingReport,
    getDailyOrdersReport,

    // Test helpers
    simulateOrderStatus,

    // Payload builders
    buildCustomerPayload,
    buildPatientPayload,
    buildOrderPayload
};