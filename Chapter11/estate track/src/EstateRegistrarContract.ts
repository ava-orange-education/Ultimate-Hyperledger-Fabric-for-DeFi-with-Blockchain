import { Context, Contract } from 'fabric-contract-api';

const propertyStatusMap = {
  requested: 'REQUESTED',
  registered: 'REGISTERED',
  onSale: 'ON_SALE'
};

export class EstateRegistrarContract extends Contract {
  constructor() {
    super('org.estate-registration-network.estatenetworks');
  }

  async instantiate(ctx: any): Promise<void> {
    console.log('Estate Registrar Smart Contract Instantiated');
  }

  async viewUser(ctx: any, name: string, aadhaarNo: string): Promise<any> {
    const userKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.user', [name, aadhaarNo]);
    const dataBuffer = await ctx.stub.getState(userKey);
    
    if (!dataBuffer || !dataBuffer.toString()) {
      throw new Error('Invalid User Details. No user exists with the provided name & aadhaarNo combination.');
    }

    return JSON.parse(dataBuffer.toString());
  }

  async approveNewUser(ctx: any, name: string, aadhaarNo: string): Promise<any> {
    if (ctx.clientIdentity.mspId === 'registrarMSP') {
      const userKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.user', [name, aadhaarNo]);
      const dataBuffer = await ctx.stub.getState(userKey);
      
      if (!dataBuffer || !dataBuffer.toString()) {
        throw new Error('Invalid User Details. No user exists with the provided name & aadhaarNo combination.');
      }

      const userObject = JSON.parse(dataBuffer.toString());
      userObject.upgradCoins = 0;
      userObject.state = 'APPROVED';
      userObject.updatedBy = ctx.clientIdentity.getID();
      userObject.updatedAt = new Date().toISOString();

      await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(userObject)));
      return userObject;
    } else {
      throw new Error('You are not authorized to perform this operation');
    }
  }

  async viewEstate(ctx: any, estateId: string): Promise<any> {
    const estateKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.estate', [estateId]);
    const dataBuffer = await ctx.stub.getState(estateKey);
    
    if (!dataBuffer || !dataBuffer.toString()) {
      throw new Error('Invalid Estate Details. No estate exists with the given Estate ID');
    }

    return JSON.parse(dataBuffer.toString());
  }

  async approveEstateRegistration(ctx: any, estateId: string): Promise<any> {
    if (ctx.clientIdentity.mspId === 'registrarMSP') {
      const estateRequestKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.estate.request', [estateId]);
      const dataBuffer = await ctx.stub.getState(estateRequestKey);
      
      if (!dataBuffer || !dataBuffer.toString()) {
        throw new Error('Invalid Estate Details. No estate exists with the given Estate ID');
      }

      const estateObject = JSON.parse(dataBuffer.toString());
      estateObject.status = propertyStatusMap['registered'];
      estateObject.updatedBy = ctx.clientIdentity.getID();
      estateObject.updatedAt = new Date().toISOString();

      const estateKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.estate', [estateId]);
      await ctx.stub.putState(estateKey, Buffer.from(JSON.stringify(estateObject)));
      return estateObject;
    } else {
      throw new Error('You are not authorized to perform this operation');
    }
  }
}
