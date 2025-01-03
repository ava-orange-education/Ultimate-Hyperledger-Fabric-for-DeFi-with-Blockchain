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
exports.EstateRegistrarContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
const propertyStatusMap = {
    requested: 'REQUESTED',
    registered: 'REGISTERED',
    onSale: 'ON_SALE'
};
class EstateRegistrarContract extends fabric_contract_api_1.Contract {
    constructor() {
        super('org.estate-registration-network.estatenetworks');
    }
    instantiate(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Estate Registrar Smart Contract Instantiated');
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
    approveNewUser(ctx, name, aadhaarNo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ctx.clientIdentity.mspId === 'registrarMSP') {
                const userKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.user', [name, aadhaarNo]);
                const dataBuffer = yield ctx.stub.getState(userKey);
                if (!dataBuffer || !dataBuffer.toString()) {
                    throw new Error('Invalid User Details. No user exists with the provided name & aadhaarNo combination.');
                }
                const userObject = JSON.parse(dataBuffer.toString());
                userObject.upgradCoins = 0;
                userObject.state = 'APPROVED';
                userObject.updatedBy = ctx.clientIdentity.getID();
                userObject.updatedAt = new Date().toISOString();
                yield ctx.stub.putState(userKey, Buffer.from(JSON.stringify(userObject)));
                return userObject;
            }
            else {
                throw new Error('You are not authorized to perform this operation');
            }
        });
    }
    viewEstate(ctx, estateId) {
        return __awaiter(this, void 0, void 0, function* () {
            const estateKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.estate', [estateId]);
            const dataBuffer = yield ctx.stub.getState(estateKey);
            if (!dataBuffer || !dataBuffer.toString()) {
                throw new Error('Invalid Estate Details. No estate exists with the given Estate ID');
            }
            return JSON.parse(dataBuffer.toString());
        });
    }
    approveEstateRegistration(ctx, estateId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ctx.clientIdentity.mspId === 'registrarMSP') {
                const estateRequestKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.estate.request', [estateId]);
                const dataBuffer = yield ctx.stub.getState(estateRequestKey);
                if (!dataBuffer || !dataBuffer.toString()) {
                    throw new Error('Invalid Estate Details. No estate exists with the given Estate ID');
                }
                const estateObject = JSON.parse(dataBuffer.toString());
                estateObject.status = propertyStatusMap['registered'];
                estateObject.updatedBy = ctx.clientIdentity.getID();
                estateObject.updatedAt = new Date().toISOString();
                const estateKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.estate', [estateId]);
                yield ctx.stub.putState(estateKey, Buffer.from(JSON.stringify(estateObject)));
                return estateObject;
            }
            else {
                throw new Error('You are not authorized to perform this operation');
            }
        });
    }
}
exports.EstateRegistrarContract = EstateRegistrarContract;
