#!/bin/bash

set -e

# Environment variables
export FABRIC_CFG_PATH=${PWD}/config
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
export ORDERER_CA=${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Install chaincode
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp" peer0.org1.example.com peer chaincode install -n mycc -v 1.0 -p github.com/chaincode/chaincode_example02/go/

# Instantiate chaincode
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp" peer0.org1.example.com peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n mycc -v 1.0 -c '{"Args":["init","a","100","b","200"]}' -P "AND('Org1MSP.peer')"

echo "Chaincode deployed successfully."
