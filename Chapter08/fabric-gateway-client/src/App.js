import React from 'react';
import './App.css';
import { AssetViewer } from "./componet/AssetViewer";

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Fabric Asset Viewer</h1>
                <AssetViewer />
            </header>
        </div>
    );
}

export default App;
