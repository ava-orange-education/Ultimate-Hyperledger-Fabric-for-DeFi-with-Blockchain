import { useState, useEffect } from 'react';
import axios from 'axios';

export const AssetViewer = () => {
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/asset/asset1');
                setAsset(response.data);
            } catch (error) {
                setError('Error fetching asset');
                console.error('Error fetching asset:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAsset();
    }, []);

    if (loading) {
        return <p>Loading asset...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h2>Asset Details</h2>
            <p>ID: {asset.ID}</p>
            <p>Color: {asset.Color}</p>
            <p>Size: {asset.Size}</p>
            <p>Owner: {asset.Owner}</p>
            <p>Appraised Value: {asset.AppraisedValue}</p>
        </div>
    );
};
