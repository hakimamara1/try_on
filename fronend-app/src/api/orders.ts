import client from './client';

export const createOrder = async (orderData: any) => {
    try {
        const response = await client.post('/orders', orderData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMyOrders = async () => {
    try {
        const response = await client.get('/orders/myorders');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getOrderById = async (id: string) => {
    try {
        const response = await client.get(`/orders/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const scanOrderQR = async (qrCode: string) => {
    try {
        const response = await client.post('/orders/scan-qr', { qrCode });
        return response.data;
    } catch (error) {
        console.error('Error scanning QR:', error);
        throw error;
    }
};
