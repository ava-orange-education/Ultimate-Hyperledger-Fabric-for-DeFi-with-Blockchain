// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./chainlink/interfaces/AggregatorV3Interface.sol";


contract P2PLending {
    AggregatorV3Interface internal priceOracle;
    uint256 public loanToValueRatio = 50; // 50% LTV ratio
    uint256 public interest = 10; // 10% interest rate

    struct LoanRequest {
        address borrower;
        uint256 amount;
        address token;
        uint256 collateral;
        uint256 duration;
        bool isActive;
    }

    LoanRequest[] public loanRequests;
    mapping(address => mapping(address => uint256)) public lenderBalances;

    constructor(address _priceOracle) {
        priceOracle = AggregatorV3Interface(_priceOracle);
    }

    function depositAssets(uint256 amount, address token) external {
        require(amount > 0, "Amount must be greater than zero");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        lenderBalances[msg.sender][token] += amount;
    }

    function requestLoan(uint256 amount, address token, uint256 duration) external payable {
        require(msg.value > 0, "Collateral must be provided");
        LoanRequest memory loanRequest = LoanRequest({
            borrower: msg.sender,
            amount: amount,
            token: token,
            collateral: msg.value,
            duration: duration,
            isActive: true
        });
        loanRequests.push(loanRequest);
    }

    function getCollateralValue(uint256 ethAmount) public view returns (uint256) {
            (,int256 price,,,) = priceOracle.latestRoundData();
            return ethAmount * uint256(price) / 1 ether;
    }

    function assessCollateral(uint256 loanId) internal view {
        LoanRequest storage loan = loanRequests[loanId];
        uint256 collateralValue = getCollateralValue(loan.collateral);
        uint256 requiredCollateral = (loan.amount * 1 ether) / loanToValueRatio;
        require(collateralValue >= requiredCollateral, "Insufficient collateral");
    }

    function issueLoan(uint256 loanId) external {
        assessCollateral(loanId);
        LoanRequest storage loan = loanRequests[loanId];
        require(loan.isActive, "Loan is not active");
        IERC20(loan.token).transfer(loan.borrower, loan.amount);
        loan.isActive = false;
    }

    function repayLoan(uint256 loanId) external payable {
        LoanRequest storage loan = loanRequests[loanId];
        uint256 repaymentAmount = loan.amount + (loan.amount * interest / 100);
        require(msg.value >= repaymentAmount, "Repayment amount insufficient");
        lenderBalances[msg.sender][loan.token] += msg.value;
        releaseCollateral(loanId);
    }

    function releaseCollateral(uint256 loanId) internal {
        LoanRequest storage loan = loanRequests[loanId];
        require(loan.isActive, "Loan is not active");
        loan.isActive = false;
        payable(loan.borrower).transfer(loan.collateral);
    }

    function liquidateCollateral(uint256 loanId) external {
        LoanRequest storage loan = loanRequests[loanId];
        require(block.timestamp > loan.duration, "Loan duration not ended");
        require(loan.isActive, "Loan is not active");
        uint256 collateralValue = getCollateralValue(loan.collateral);
        IERC20(loan.token).transfer(msg.sender, collateralValue);
        loan.isActive = false;
    }

   
}
