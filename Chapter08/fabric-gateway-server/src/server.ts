import { Gateway, Wallets } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';

const ccpPath = path.resolve(__dirname, 'gateway.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

const app = express();
const port = 4000;

app.get('/api/asset/:id', async (req, res) => {
    try {
        const assetId = req.params.id;

        // Path to the wallet
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        
        // Check if we've already enrolled the user
        const identity = await wallet.get('appUser');
        if (!identity) {
            res.status(500).send('An identity for the user "appUser" does not exist in the wallet');
            return;
        }

        // Create a new gateway for connecting to the peer node
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'appUser',
            discovery: { enabled: true, asLocalhost: true }
        });

        // Get the network (channel) our contract is deployed to
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('basic');

        // Evaluate the specified transaction
        const result = await contract.evaluateTransaction('ReadAsset', assetId);
        res.json(JSON.parse(result.toString()));

        // Disconnect from the gateway
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).send(error.toString());
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
