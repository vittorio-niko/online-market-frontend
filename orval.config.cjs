module.exports = {
    'api-gateway': {
        input: { target: './docs/openapi/api-gateway/api-gateway-api.yaml' },
        output: {
            mode: 'split',
            target: './src/api/generated/api-gateway-api.ts',
            client: 'react-query',
            override: {
                mutator: {
                    path: './src/api/axios.ts',
                    name: 'customClient',
                },
            },
        },
    },
    'admin-order-service': {
        input: { target: './docs/openapi/order-service/admin-order-service-api.yaml' },
        output: {
            mode: 'split',
            target: './src/api/generated/admin-order-service.ts',
            client: 'react-query',
            override: {
                mutator: {
                    path: './src/api/axios.ts',
                    name: 'customClient',
                },
            },
        },
    },
    'admin-payment-service': {
        input: { target: './docs/openapi/payment-service/admin-payment-service-api.yaml' },
        output: {
            mode: 'split',
            target: './src/api/generated/admin-payment-service.ts',
            client: 'react-query',
            override: {
                mutator: {
                    path: './src/api/axios.ts',
                    name: 'customClient',
                },
            },
        },
    },
    'admin-user-service': {
        input: { target: './docs/openapi/user-service/admin-user-service-api.yaml' },
        output: {
            mode: 'split',
            target: './src/api/generated/admin-user-service.ts',
            client: 'react-query',
            override: {
                mutator: {
                    path: './src/api/axios.ts',
                    name: 'customClient',
                },
            },
        },
    },
    'user-order-service': {
        input: { target: './docs/openapi/order-service/user-order-service-api.yaml' },
        output: {
            mode: 'split',
            target: './src/api/generated/user-order-service.ts',
            client: 'react-query',
            override: {
                mutator: {
                    path: './src/api/axios.ts',
                    name: 'customClient',
                },
            },
        },
    },
    'user-user-service': {
        input: { target: './docs/openapi/user-service/user-user-service-api.yaml' },
        output: {
            mode: 'split',
            target: './src/api/generated/user-user-service.ts',
            client: 'react-query',
            override: {
                mutator: {
                    path: './src/api/axios.ts',
                    name: 'customClient',
                },
            },
        },
    },
};