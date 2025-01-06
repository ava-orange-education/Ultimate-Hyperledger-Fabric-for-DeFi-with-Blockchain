"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
const fabric_shim_1 = require("fabric-shim");
class assetContract extends fabric_contract_api_1.Contract {
    Init(stub) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info('=========== Instantiated my chaincode ===========', stub);
            return fabric_shim_1.Shim.success();
        });
    }
    Invoke(stub) {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = stub.getFunctionAndParameters();
            console.info(ret);
            const method = this[ret.fcn];
            if (!method) {
                console.error('no function of name:' + ret.fcn + ' found');
                throw new Error('Received unknown function ' + ret.fcn + ' invocation');
            }
            try {
                const payload = yield method.call(this, stub, ret.params);
                return fabric_shim_1.Shim.success(payload);
            }
            catch (err) {
                console.log(err);
                return fabric_shim_1.Shim.error(err);
            }
        });
    }
    initLedger(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info('============= START : Initialize Ledger ===========');
            const assets = [
                { name: 'asset1', value: 'value1' },
                { name: 'asset2', value: 'value2' }
            ];
            for (let i = 0; i < assets.length; i++) {
                assets[i].docType = 'asset';
                yield ctx.stub.putState('ASSET' + i, Buffer.from(JSON.stringify(assets[i])));
                console.info('Added <--> ', assets[i]);
            }
            console.info('============= END : Initialize Ledger ===========');
        });
    }
    queryAsset(ctx, assetNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetAsBytes = yield ctx.stub.getState(assetNumber);
            if (!assetAsBytes || assetAsBytes.length === 0) {
                throw new Error(`${assetNumber} does not exist`);
            }
            console.log(Buffer.from(assetAsBytes).toString());
            return Buffer.from(assetAsBytes);
        });
    }
    createAsset(ctx, assetNumber, name, value) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info('============= START : Create Asset ===========');
            const asset = { name, value };
            yield ctx.stub.putState(assetNumber, Buffer.from(JSON.stringify(asset)));
            console.info('============= END : Create Asset ===========');
        });
    }
    updateAsset(ctx, assetNumber, name, value) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info('============= START : Update Asset ===========');
            const asset = { name, value };
            yield ctx.stub.putState(assetNumber, Buffer.from(JSON.stringify(asset)));
            console.info('============= END : Update Asset ===========');
        });
    }
    deleteAsset(ctx, assetNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info('============= START : Delete Asset ===========');
            yield ctx.stub.deleteState(assetNumber);
            console.info('============= END : Delete Asset ===========');
        });
    }
}
exports.assetContract = assetContract;
