
# Estate Track Network Setup Guide: Commands Required for the Entire Network
 The network setup is assumed to be you have learned in earlier chapters.

## For Installation
```bash
sudo apt-get update
sudo apt-get install docker-compose
```

## For Root User Login
```bash
sudo -su root
```

---

## 1) Create Certificates for Channel - `cryptogen`
- **Set the path of the `cryptogen` tool:**
```bash
export PATH=/home/shubham/Desktop/shared/estate-track/network/bin:$PATH //set your os path! it is sample of my desktop path 
```
- **Give all access to the file:**
```bash
chmod -R 777 /home/shubham/Desktop/shared/learn/network
```
- **Generate certificates in the network folder:**
```bash
cryptogen generate --config=./crypto-config.yaml
```

- **Certificates generated for:**
  - `registrar.estate-track-network.com`
  - `users.estate-track-network.com`

---

## 2) Create Channel Artifacts - `configtxgen`
- **Create genesis block in channel artifacts:**
```bash
configtxgen -profile OrdererGenesis -channelID shubham-sys-channel -outputBlock ./channel-artifacts/genesis.block
```
- **Create the estate track channel:**
```bash
configtxgen -profile RegistrationChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID registrationnetworks
```
- **Define anchor peer for the organization `registrar`:**
```bash
configtxgen -profile RegistrationChannel -outputAnchorPeersUpdate ./channel-artifacts/registrarMSPanchors.tx -channelID registrationnetworks -asOrg registrarMSP
```
- **Define anchor peer for the organization `users`:**
```bash
configtxgen -profile RegistrationChannel -outputAnchorPeersUpdate ./channel-artifacts/usersMSPanchors.tx -channelID registrationnetworks -asOrg usersMSP
```

---

## 3) Start Docker Containers and Set Up Peers
- **Check existing containers running:**
```bash
docker ps -a
```
- **Kill all other containers if not in use:**
```bash
docker container prune
```
- **Pull Hyperledger Fabric images:**
```bash
docker pull hyperledger/fabric-orderer:2.4
docker pull hyperledger/fabric-tools:2.4
docker pull hyperledger/fabric-peer:2.4
docker pull hyperledger/fabric-ccenv:1.4  # Using version 1.4 due to issues with 2.4
docker pull hyperledger/fabric-ca
```
- **Restart Docker if limit is exceeded:**
```bash
sudo systemctl restart docker
```
- **Remove images if versions are different:**
```bash
docker images
docker rmi -f <imageID>
docker image prune -a
```
- **Rename images to 'latest':**
```bash
docker tag hyperledger/fabric-orderer:2.4 hyperledger/fabric-orderer:latest 
docker tag hyperledger/fabric-tools:2.4 hyperledger/fabric-tools:latest
docker tag hyperledger/fabric-peer:2.4 hyperledger/fabric-peer:latest 
docker tag hyperledger/fabric-ccenv:1.4 hyperledger/fabric-ccenv:latest
```
- **Start Docker containers with Docker Compose:**
```bash
docker-compose -f ./docker-compose.yml up -d 
```
- **Enter the CLI container for Docker:**
```bash
docker exec -it cli /bin/bash
```

---

## 4) Create Channel and Join All Peers
- **Map environment variables for `registrar`:**
```bash
CORE_PEER_LOCALMSPID="registrarMSP"
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/registrar.estate-track-network.com/users/Admin@registrar.estate-track-network.com/msp
CORE_PEER_ADDRESS=peer0.registrar.estate-track-network.com:7051
```
- **Create the channel on the orderer peer (port 7050):**
```bash
peer channel create -o orderer.estate-track-network.com:7050 -c registrationnetworks -f ./channel-artifacts/channel.tx
```
- **Join Peer 0 (`registrar`) to the channel:**
```bash
peer channel join -b registrationnetworks.block
```
- **Join Peer 1 (`registrar`) on port 8051:**
```bash
CORE_PEER_ADDRESS=peer1.registrar.estate-track-network.com:8051
peer channel join -b registrationnetworks.block
```
- **Map environment variables for `users`:**
```bash
CORE_PEER_LOCALMSPID="usersMSP"
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/users.estate-track-network.com/users/Admin@users.estate-track-network.com/msp
CORE_PEER_ADDRESS=peer0.users.estate-track-network.com:9051
```
- **Join Peer 0 (`users`) to the channel:**
```bash
peer channel join -b registrationnetworks.block
```
- **Join Peer 1 (`users`) on port 10051:**
```bash
CORE_PEER_ADDRESS=peer1.users.estate-track-network.com:10051
peer channel join -b registrationnetworks.block
```
- **Join Peer 2 (`users`) on port 11051:**
```bash
CORE_PEER_ADDRESS=peer2.users.estate-track-network.com:11051
peer channel join -b registrationnetworks.block
```
- **Update anchor peer on the channel:**
```bash
peer channel update -o orderer.estate-track-network.com:7050 -c registrationnetworks -f ./channel-artifacts/registrarMSPanchors.tx
```
- **Check logs of peer:**
```bash
docker logs -f peer2.users.estate-track-network.com
```

---

## 5) Chaincode Deployment Process
- **Open the chaincode container:**
```bash
docker exec -it chaincode /bin/bash
```
- **Install Node modules:**
```bash
npm install
```
- **Rebuild the Node app:**
```bash
npm rebuild
```
- **Start the chaincode in dev mode:**
```bash
npm run start-dev
```
