import client from './client';

export const createOrder = async (orderData: any) => {
    const response = await client.post('/orders', orderData);
    return response.data;
};

export const getMyOrders = async () => {
    const response = await client.get('/orders/myorders');
    return response.data;
};

export const getOrderById = async (id: string) => {
    const response = await client.get(`/orders/${id}`);
    return response.data;
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
