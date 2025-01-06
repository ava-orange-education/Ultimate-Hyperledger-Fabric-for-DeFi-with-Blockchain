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
exports.contracts = exports.CertificationContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
class CertificationContract extends fabric_contract_api_1.Contract {
    issueCertification(ctx, certId, holder, authority, issueDate, expiryDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const certification = {
                certId,
                holder,
                authority,
                issueDate,
                expiryDate,
                revoked: false,
            };
            yield ctx.stub.putState(certId, Buffer.from(JSON.stringify(certification)));
            console.log(`Certification ${certId} issued`);
        });
    }
    revokeCertification(ctx, certId) {
        return __awaiter(this, void 0, void 0, function* () {
            const certBytes = yield ctx.stub.getState(certId);
            if (!certBytes || certBytes.length === 0) {
                throw new Error(`Certification ${certId} does not exist`);
            }
            const certification = JSON.parse(certBytes.toString());
            certification.revoked = true;
            yield ctx.stub.putState(certId, Buffer.from(JSON.stringify(certification)));
            console.log(`Certification ${certId} revoked`);
        });
    }
    verifyCertification(ctx, certId) {
        return __awaiter(this, void 0, void 0, function* () {
            const certBytes = yield ctx.stub.getState(certId);
            if (!certBytes || certBytes.length === 0) {
                return `Certification ${certId} is not valid`;
            }
            const certification = JSON.parse(certBytes.toString());
            if (certification.revoked) {
                return `Certification ${certId} is revoked`;
            }
            return `Certification ${certId} is valid`;
        });
    }
}
exports.CertificationContract = CertificationContract;
exports.contracts = [CertificationContract];
