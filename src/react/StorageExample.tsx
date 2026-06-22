import React, { useEffect, useState } from 'react';
import { useStorageContext } from '../react';

/**
 * Example React component using the storage service
 */
export function StorageExample() {
  const { 
    token, 
    tokenLoading, 
    tokenError, 
    requestToken, 
    getItem, 
    saveItem,
    logout 
  } = useStorageContext();

  const [itemData, setItemData] = useState<any>(null);
  const [itemError, setItemError] = useState<Error | null>(null);
  const [itemLoading, setItemLoading] = useState(false);

  // Request token on mount
  useEffect(() => {
    if (!token) {
      requestToken();
    }
  }, []);

  // Fetch an item
  const handleGetItem = async () => {
    setItemLoading(true);
    setItemError(null);
    const result = await getItem('my-item-id');
    if (result.error) {
      setItemError(result.error);
    } else {
      setItemData(result.data);
    }
    setItemLoading(false);
  };

  // Save an item
  const handleSaveItem = async () => {
    const dataToSave = { name: 'Test Item', value: 42 };
    setItemLoading(true);
    setItemError(null);
    const result = await saveItem('my-item-id', dataToSave);
    if (result.error) {
      setItemError(result.error);
    } else {
      setItemData(result.data);
    }
    setItemLoading(false);
  };

  return (
    <div>
      <h1>Storage Service Example</h1>

      {/* Token Section */}
      <section>
        <h2>Authentication</h2>
        {tokenLoading && <p>Loading token...</p>}
        {tokenError && <p style={{ color: 'red' }}>Error: {tokenError.message}</p>}
        {token && <p>✓ Authenticated with token: {token.substring(0, 20)}...</p>}
        <button onClick={() => requestToken()} disabled={tokenLoading}>
          {token ? 'Refresh Token' : 'Get Token'}
        </button>
        {token && <button onClick={logout}>Logout</button>}
      </section>

      {/* Item Operations */}
      <section>
        <h2>Item Operations</h2>
        {itemLoading && <p>Loading...</p>}
        {itemError && <p style={{ color: 'red' }}>Error: {itemError.message}</p>}
        {itemData && (
          <pre>{JSON.stringify(itemData, null, 2)}</pre>
        )}
        <button onClick={handleGetItem} disabled={!token || itemLoading}>
          Get Item
        </button>
        <button onClick={handleSaveItem} disabled={!token || itemLoading}>
          Save Item
        </button>
      </section>
    </div>
  );
}
