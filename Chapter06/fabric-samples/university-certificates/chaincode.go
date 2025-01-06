package main

import (
    "encoding/json"
    "fmt"
    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// Certificate represents an academic certificate
type Certificate struct {
    CertificateID string `json:"certificateID"`
    StudentName   string `json:"studentName"`
    CourseName    string `json:"courseName"`
    Grade         string `json:"grade"`
    Issuer        string `json:"issuer"`
    IssueDate     string `json:"issueDate"`
}

// SmartContract provides functions for managing certificates
type SmartContract struct {
    contractapi.Contract
}

// IssueCertificate issues a new certificate
func (s *SmartContract) IssueCertificate(ctx contractapi.TransactionContextInterface, certificateID string, studentName string, courseName string, grade string, issuer string, issueDate string) error {
    certificate := Certificate{
        CertificateID: certificateID,
        StudentName:   studentName,
        CourseName:    courseName,
        Grade:         grade,
        Issuer:        issuer,
        IssueDate:     issueDate,
    }
    certificateAsBytes, _ := json.Marshal(certificate)
    return ctx.GetStub().PutState(certificateID, certificateAsBytes)
}

// QueryCertificate queries a certificate by ID
func (s *SmartContract) QueryCertificate(ctx contractapi.TransactionContextInterface, certificateID string) (*Certificate, error) {
    certificateAsBytes, err := ctx.GetStub().GetState(certificateID)
    if err != nil {
        return nil, fmt.Errorf("failed to read from world state: %v", err)
    }
    if certificateAsBytes == nil {
        return nil, fmt.Errorf("certificate %s does not exist", certificateID)
    }
    certificate := new(Certificate)
    _ = json.Unmarshal(certificateAsBytes, certificate)
    return certificate, nil
}

func main() {
    chaincode, err := contractapi.NewChaincode(new(SmartContract))
    if err != nil {
        fmt.Printf("Error create certificate chaincode: %s", err.Error())
        return
    }
    if err := chaincode.Start(); err != nil {
        fmt.Printf("Error starting certificate chaincode: %s", err.Error())
    }
}
