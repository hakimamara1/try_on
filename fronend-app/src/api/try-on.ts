import client from './client';

export const generateTryOn = async (userImageUri: string, clothImageUrl: string) => {
    try {
        const formData = new FormData();

        // Append user image
        const filename = userImageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('image', {
            uri: userImageUri,
            name: filename,
            type,
        } as any);

        // Append cloth image
        // Check if it's a local file (for "pureImage" picked from gallery)
        if (clothImageUrl && !clothImageUrl.startsWith('http')) {
            const clothFilename = clothImageUrl.split('/').pop();
            const clothMatch = /\.(\w+)$/.exec(clothFilename || '');
            const clothType = clothMatch ? `image/${clothMatch[1]}` : `image`;

            formData.append('productImage', {
                uri: clothImageUrl,
                name: clothFilename,
                type: clothType,
            } as any);
        } else {
            // It's a remote URL (string)
            formData.append('clothImageUrl', clothImageUrl);
        }

        const response = await client.post('/try-on/generate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const saveLook = async (lookData: { generatedImage: string, originalImage: string, productImage: string }) => {
    try {
        const response = await client.post('/try-on/save', lookData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getSavedLooks = async () => {
    try {
        const response = await client.get('/try-on/saved');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteSavedLook = async (id: string) => {
    try {
        const response = await client.delete(`/try-on/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
