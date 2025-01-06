import { Context, Contract } from 'fabric-contract-api';
import { ChaincodeInterface, ChaincodeStub, Shim, ChaincodeResponse } from 'fabric-shim';

interface Asset {
    docType?: string;
    name: string;
    value: string;
}

export class assetContract extends Contract implements ChaincodeInterface {

    async Init(stub: ChaincodeStub): Promise<ChaincodeResponse> {
        console.info('=========== Instantiated my chaincode ===========', stub);
        return Shim.success();
    }

    async Invoke(stub: ChaincodeStub): Promise<ChaincodeResponse> {
        const ret = stub.getFunctionAndParameters();
        console.info(ret);

        const method = (this as any)[ret.fcn];
        if (!method) {
            console.error('no function of name:' + ret.fcn + ' found');
            throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }
        try {
            const payload = await method.call(this, stub, ret.params);
            return Shim.success(payload);
        } catch (err) {
            console.log(err);
            return Shim.error(err as any);
        }
    }

    async initLedger(ctx: Context): Promise<void> {
        console.info('============= START : Initialize Ledger ===========');
        const assets: Asset[] = [
            { name: 'asset1', value: 'value1' },
            { name: 'asset2', value: 'value2' }
        ];

        for (let i = 0; i < assets.length; i++) {
            assets[i].docType = 'asset';
            await ctx.stub.putState('ASSET' + i, Buffer.from(JSON.stringify(assets[i])));
            console.info('Added <--> ', assets[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryAsset(ctx: Context, assetNumber: string): Promise<Buffer> {
        const assetAsBytes = await ctx.stub.getState(assetNumber);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`${assetNumber} does not exist`);
        }
        console.log(Buffer.from(assetAsBytes).toString());
        return Buffer.from(assetAsBytes);
    }

    async createAsset(ctx: Context, assetNumber: string, name: string, value: string): Promise<void> {
        console.info('============= START : Create Asset ===========');

        const asset: Asset = { name, value };

        await ctx.stub.putState(assetNumber, Buffer.from(JSON.stringify(asset)));
        console.info('============= END : Create Asset ===========');
    }

    async updateAsset(ctx: Context, assetNumber: string, name: string, value: string): Promise<void> {
        console.info('============= START : Update Asset ===========');

        const asset: Asset = { name, value };

        await ctx.stub.putState(assetNumber, Buffer.from(JSON.stringify(asset)));
        console.info('============= END : Update Asset ===========');
    }

    async deleteAsset(ctx: Context, assetNumber: string): Promise<void> {
        console.info('============= START : Delete Asset ===========');
        await ctx.stub.deleteState(assetNumber);
        console.info('============= END : Delete Asset ===========');
    }
}
