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
exports.EstateUserContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
const transactionMap = {
    upg100: 100,
    upg500: 500,
    upg1000: 1000
};
const estateStatusMap = {
    requested: 'REQUESTED',
    registered: 'REGISTERED',
    onSale: 'ON_SALE'
};
class EstateUserContract extends fabric_contract_api_1.Contract {
    constructor() {
        super('org.estate-registration-network.estatenetworks.usercontract');
    }
    instantiate(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Estate User Smart Contract Instantiated');
        });
    }
    requestNewUser(ctx, name, email, phoneNo, aadhaarNo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ctx.clientIdentity.mspId !== 'usersMSP') {
                throw new Error('You are not authorized to perform this operation');
            }
            const userKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.user', [name, aadhaarNo]);
            const dataBuffer = yield ctx.stub.getState(userKey);
            if (dataBuffer && dataBuffer.toString()) {
                throw new Error('Invalid User Details. A user with this name & aadhaarNo already exists.');
            }
            const newUserObject = {
                aadhaarNo,
                name,
                email,
                phoneNo,
                state: 'REQUESTED',
                createdBy: ctx.clientIdentity.getID(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            yield ctx.stub.putState(userKey, Buffer.from(JSON.stringify(newUserObject)));
            return newUserObject;
        });
    }
    rechargeUserAccount(ctx, name, aadhaarNo, bankTransactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ctx.clientIdentity.mspId !== 'usersMSP') {
                throw new Error('You are not authorized to perform this operation');
            }
            const userKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.user', [name, aadhaarNo]);
            const dataBuffer = yield ctx.stub.getState(userKey);
            if (!dataBuffer || !dataBuffer.toString()) {
                throw new Error('Invalid User Details. No user exists with the provided name & aadhaarNo combination.');
            }
            if (transactionMap[bankTransactionId]) {
                const userObject = JSON.parse(dataBuffer.toString());
                userObject.upgradCoins += transactionMap[bankTransactionId];
                yield ctx.stub.putState(userKey, Buffer.from(JSON.stringify(userObject)));
                return userObject;
            }
            else {
                throw new Error(`Invalid Bank Transaction ID: ${bankTransactionId}.`);
            }
        });
    }
    viewUser(ctx, name, aadhaarNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const userKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.user', [name, aadhaarNo]);
            const dataBuffer = yield ctx.stub.getState(userKey);
            if (!dataBuffer || !dataBuffer.toString()) {
                throw new Error('Invalid User Details. No user exists with the provided name & aadhaarNo combination.');
            }
            return JSON.parse(dataBuffer.toString());
        });
    }
    estateRegistrationRequest(ctx, estateId, price, status, name, aadhaarNo) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (((_a = ctx.clientIdentity) === null || _a === void 0 ? void 0 : _a.mspId) !== 'usersMSP') {
                throw new Error('You are not authorized to perform this operation');
            }
            const userKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.user', [name, aadhaarNo]);
            const userDataBuffer = yield ctx.stub.getState(userKey);
            if (!userDataBuffer || !userDataBuffer.toString()) {
                throw new Error('Invalid User Details. No user exists with the provided name & aadhaarNo combination.');
            }
            const estateRequestKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.estate.request', [estateId]);
            const estateDataBuffer = yield ctx.stub.getState(estateRequestKey);
            if (estateDataBuffer && estateDataBuffer.toString()) {
                throw new Error('Invalid Estate Details. An estate with this Estate ID already exists.');
            }
            if (!estateStatusMap[status]) {
                throw new Error(`Invalid Estate Status: ${status}.`);
            }
            const newEstateObject = {
                estateId,
                price: parseFloat(price),
                state: estateStatusMap[status],
                owner: userKey,
                createdBy: ctx.clientIdentity.getID(),
                createdAt: new Date().toISOString(),
                updatedBy: ctx.clientIdentity.getID(),
                updatedAt: new Date().toISOString()
            };
            yield ctx.stub.putState(estateRequestKey, Buffer.from(JSON.stringify(newEstateObject)));
            return newEstateObject;
        });
    }
    updateEstate(ctx, estateId, status, name, aadhaarNo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ctx.clientIdentity.mspId !== 'usersMSP') {
                throw new Error('You are not authorized to perform this operation');
            }
            const estateKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.estate', [estateId]);
            const estateDataBuffer = yield ctx.stub.getState(estateKey);
            if (!estateDataBuffer || !estateDataBuffer.toString()) {
                throw new Error('Invalid Estate Details. No estate exists with the given Estate ID');
            }
            const userKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.user', [name, aadhaarNo]);
            const userDataBuffer = yield ctx.stub.getState(userKey);
            if (!userDataBuffer || !userDataBuffer.toString()) {
                throw new Error('Invalid User Details. No user exists with the provided name & aadhaarNo combination.');
            }
            if (!estateStatusMap[status]) {
                throw new Error(`Invalid Estate Status: ${status}.`);
            }
            const estateObject = JSON.parse(estateDataBuffer.toString());
            if (userKey === estateObject.owner) {
                estateObject.status = estateStatusMap[status];
                estateObject.updatedBy = ctx.clientIdentity.getID();
                estateObject.updatedAt = new Date().toISOString();
                yield ctx.stub.putState(estateKey, Buffer.from(JSON.stringify(estateObject)));
                return estateObject;
            }
            else {
                throw new Error('Transaction declined as the requested user is not the owner of the estate.');
            }
        });
    }
    purchaseEstate(ctx, estateId, name, aadhaarNo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ctx.clientIdentity.mspId !== 'usersMSP') {
                throw new Error('You are not authorized to perform this operation');
            }
            const estateKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.estate', [estateId]);
            const estateDataBuffer = yield ctx.stub.getState(estateKey);
            if (!estateDataBuffer || !estateDataBuffer.toString()) {
                throw new Error('Invalid Estate Details.');
            }
            const userKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.user', [name, aadhaarNo]);
            const userDataBuffer = yield ctx.stub.getState(userKey);
            if (!userDataBuffer || !userDataBuffer.toString()) {
                throw new Error('Invalid User Details. No user exists with the provided name & aadhaarNo combination.');
            }
            const estateObject = JSON.parse(estateDataBuffer.toString());
            if (estateObject.status !== estateStatusMap['onSale']) {
                throw new Error('Estate is NOT FOR SALE');
            }
            if (userKey !== estateObject.owner) {
                const userObject = JSON.parse(userDataBuffer.toString());
                if (userObject.upgradCoins >= estateObject.price) {
                    const ownerDataBuffer = yield ctx.stub.getState(estateObject.owner);
                    const ownerUserObject = JSON.parse(ownerDataBuffer.toString());
                    userObject.upgradCoins -= estateObject.price;
                    ownerUserObject.upgradCoins += estateObject.price;
                    estateObject.owner = userKey;
                    estateObject.status = estateStatusMap['registered'];
                    estateObject.updatedBy = ctx.clientIdentity.getID();
                    estateObject.updatedAt = new Date().toISOString();
                    yield ctx.stub.putState(userKey, Buffer.from(JSON.stringify(userObject)));
                    yield ctx.stub.putState(estateKey, Buffer.from(JSON.stringify(estateObject)));
                    return estateObject;
                }
                else {
                    throw new Error('You do not have enough balance to buy this estate.');
                }
            }
            else {
                throw new Error('You already own this estate');
            }
        });
    }
}
exports.EstateUserContract = EstateUserContract;
