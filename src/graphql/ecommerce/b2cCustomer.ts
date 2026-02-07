import { gql } from "@apollo/client";

// ✅ Get All Customers
export const GET_ALL_CUSTOMERS = gql`
  query {
    allB2CCustomer {
      isSuccess
      errorMessage
      customer {
        b2cCustomerId
        b2cCustomerCode
        b2CCustomerName
        orgId
        branchId
        mobileNo
        emailId
        addressLine1
        addressLine2
        addressLine3
        countryId
        stateId
        postalCode
        floorNo
        unitNo
        isApproved
        loyaltyPoints
        redeemPoints
        password
        isActive
        createdBy
        createdOn
        modifiedBy
        modifiedOn
      }
    }
  }
`;

// ✅ Get Customer by Id
export const GET_CUSTOMER_BY_ID = gql`
  query GetCustomerById($customerId: Int!) {
    b2CCustomerById(customerId: $customerId) {
      isSuccess
      errorMessage
      customer {
        b2cCustomerId
        b2cCustomerCode
        b2CCustomerName
        userName
        orgId
        branchId
        mobileNo
        emailId
        addressLine1
        addressLine2
        addressLine3
        countryId
        stateId
        postalCode
        floorNo
        unitNo
        isApproved
        loyaltyPoints
        redeemPoints
        password
        isActive
        createdBy
        createdOn
        modifiedBy
        modifiedOn
      }
    }
  }
`;

// ✅ Add Customer
export const ADD_CUSTOMER = gql`
  mutation AddCustomer($customer: B2CCustomerRegistrationInput!) {
    addB2CCustomer(customer: $customer) {
      isSuccess
      errorMessage
    }
  }
`;

// ✅ Update Customer
export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($customer: B2CCustomerRegistrationInput!) {
    updateB2CCustomer(customer: $customer) {
      isSuccess
      errorMessage
    }
  }
`;

// ✅ Deactivate Customer
export const DEACTIVATE_CUSTOMER = gql`
  mutation DeactivateCustomer($customerId: Int!) {
    deactivateB2CCustomer(customerId: $customerId) {
      isSuccess
      errorMessage
    }
  }
`;
