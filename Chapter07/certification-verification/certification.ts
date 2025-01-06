import { Context, Contract } from 'fabric-contract-api';

export class CertificationContract extends Contract {

    async issueCertification(ctx: Context, certId: string, holder: string, authority: string, issueDate: string, expiryDate: string): Promise<void> {
        const certification = {
            certId,
            holder,
            authority,
            issueDate,
            expiryDate,
            revoked: false,
        };

        await ctx.stub.putState(certId, Buffer.from(JSON.stringify(certification)));
        console.log(`Certification ${certId} issued`);
    }

    async revokeCertification(ctx: Context, certId: string): Promise<void> {
        const certBytes = await ctx.stub.getState(certId);

        if (!certBytes || certBytes.length === 0) {
            throw new Error(`Certification ${certId} does not exist`);
        }

        const certification = JSON.parse(certBytes.toString());
        certification.revoked = true;

        await ctx.stub.putState(certId, Buffer.from(JSON.stringify(certification)));
        console.log(`Certification ${certId} revoked`);
    }

    async verifyCertification(ctx: Context, certId: string): Promise<string> {
        const certBytes = await ctx.stub.getState(certId);

        if (!certBytes || certBytes.length === 0) {
            return `Certification ${certId} is not valid`;
        }

        const certification = JSON.parse(certBytes.toString());

        if (certification.revoked) {
            return `Certification ${certId} is revoked`;
        }

        return `Certification ${certId} is valid`;
    }
}

export const contracts: any[] = [CertificationContract];
