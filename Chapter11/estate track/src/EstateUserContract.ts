import { Contract } from 'fabric-contract-api';

const transactionMap: { [key: string]: number } = {
  upg100: 100,
  upg500: 500,
  upg1000: 1000
};

const estateStatusMap = {
  requested: 'REQUESTED',
  registered: 'REGISTERED',
  onSale: 'ON_SALE'
} as any;

export class EstateUserContract extends Contract {
  constructor() {
    super('org.estate-registration-network.estatenetworks.usercontract');
  }

  async instantiate(ctx: any): Promise<void> {
    console.log('Estate User Smart Contract Instantiated');
  }

  async requestNewUser(ctx: any, name: string, email: string, phoneNo: string, aadhaarNo: string): Promise<any> {
    if (ctx.clientIdentity.mspId !== 'usersMSP') {
      throw new Error('You are not authorized to perform this operation');
    }

    const userKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.user', [name, aadhaarNo]);
    const dataBuffer = await ctx.stub.getState(userKey);
    
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

    await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(newUserObject)));
    return newUserObject;
  }

  async rechargeUserAccount(ctx: any, name: string, aadhaarNo: string, bankTransactionId: string): Promise<any> {
    if (ctx.clientIdentity.mspId !== 'usersMSP') {
      throw new Error('You are not authorized to perform this operation');
    }

    const userKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.user', [name, aadhaarNo]);
    const dataBuffer = await ctx.stub.getState(userKey);
    
    if (!dataBuffer || !dataBuffer.toString()) {
      throw new Error('Invalid User Details. No user exists with the provided name & aadhaarNo combination.');
    }

    if (transactionMap[bankTransactionId]) {
      const userObject = JSON.parse(dataBuffer.toString());
      userObject.upgradCoins += transactionMap[bankTransactionId];
      await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(userObject)));
      return userObject;
    } else {
      throw new Error(`Invalid Bank Transaction ID: ${bankTransactionId}.`);
    }
  }

  async viewUser(ctx: any, name: string, aadhaarNo: string): Promise<any> {
    const userKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.user', [name, aadhaarNo]);
    const dataBuffer = await ctx.stub.getState(userKey);
    
    if (!dataBuffer || !dataBuffer.toString()) {
      throw new Error('Invalid User Details. No user exists with the provided name & aadhaarNo combination.');
    }

    return JSON.parse(dataBuffer.toString());
  }

  async estateRegistrationRequest(ctx: any, estateId: string, price: string, status: string, name: string, aadhaarNo: string): Promise<any> {
    if (ctx.clientIdentity?.mspId !== 'usersMSP') {
      throw new Error('You are not authorized to perform this operation');
    }

    const userKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.user', [name, aadhaarNo]);
    const userDataBuffer = await ctx.stub.getState(userKey);
    
    if (!userDataBuffer || !userDataBuffer.toString()) {
      throw new Error('Invalid User Details. No user exists with the provided name & aadhaarNo combination.');
    }

    const estateRequestKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.estate.request', [estateId]);
    const estateDataBuffer = await ctx.stub.getState(estateRequestKey);
    
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

    await ctx.stub.putState(estateRequestKey, Buffer.from(JSON.stringify(newEstateObject)));
    return newEstateObject;
  }

  async updateEstate(ctx: any, estateId: string, status: string, name: string, aadhaarNo: string): Promise<any> {
    if (ctx.clientIdentity.mspId !== 'usersMSP') {
      throw new Error('You are not authorized to perform this operation');
    }

    const estateKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.estate', [estateId]);
    const estateDataBuffer = await ctx.stub.getState(estateKey);
    
    if (!estateDataBuffer || !estateDataBuffer.toString()) {
      throw new Error('Invalid Estate Details. No estate exists with the given Estate ID');
    }

    const userKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.user', [name, aadhaarNo]);
    const userDataBuffer = await ctx.stub.getState(userKey);
    
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

      await ctx.stub.putState(estateKey, Buffer.from(JSON.stringify(estateObject)));
      return estateObject;
    } else {
      throw new Error('Transaction declined as the requested user is not the owner of the estate.');
    }
  }

  async purchaseEstate(ctx: any, estateId: string, name: string, aadhaarNo: string): Promise<any> {
    if (ctx.clientIdentity.mspId !== 'usersMSP') {
      throw new Error('You are not authorized to perform this operation');
    }

    const estateKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.estate', [estateId]);
    const estateDataBuffer = await ctx.stub.getState(estateKey);
    
    if (!estateDataBuffer || !estateDataBuffer.toString()) {
      throw new Error('Invalid Estate Details.');
    }

    const userKey = ctx.stub.createCompositeKey('org.estate-registration-network.estatenet.user', [name, aadhaarNo]);
    const userDataBuffer = await ctx.stub.getState(userKey);
    
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
        const ownerDataBuffer = await ctx.stub.getState(estateObject.owner);
        const ownerUserObject = JSON.parse(ownerDataBuffer.toString());

        userObject.upgradCoins -= estateObject.price;
        ownerUserObject.upgradCoins += estateObject.price;

        estateObject.owner = userKey;
        estateObject.status = estateStatusMap['registered'];
        estateObject.updatedBy = ctx.clientIdentity.getID();
        estateObject.updatedAt = new Date().toISOString();

        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(userObject)));
        await ctx.stub.putState(estateKey, Buffer.from(JSON.stringify(estateObject)));

        return estateObject;
      } else {
        throw new Error('You do not have enough balance to buy this estate.');
      }
    } else {
      throw new Error('You already own this estate');
    }
  }
}
