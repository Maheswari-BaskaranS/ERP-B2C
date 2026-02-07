import { gql } from "@apollo/client";

// ✅ Get All Customer Delivery Addresses
export const GET_ALL_CUSTOMER_DELIVERY_ADDRESS = gql`
  query {
    allB2CCustomerDeliveryAddress {
      isSuccess
      errorMessage
      customerAddress {
        orgId
        branchId
        b2cCustomerId
        emailId
        mobileNo
        addressLine1
        addressLine2
        addressLine3
        countryId
        stateId
        postalCode
        floorNo
        unitNo
        isActive
        createdBy
        createdOn
        modifiedBy
        modifiedOn
      }
    }
  }
`;

// ✅ Get Customer Delivery Address by Id
export const GET_CUSTOMER_DELIVERY_ADDRESS_BY_ID = gql`
  query GetCustomerDeliveryAddressById($addressId: Int!) {
    b2CCustomerDeliveryAddressById(addressId: $addressId) {
      isSuccess
      errorMessage
      customerAddress {
        orgId
        branchId
        b2cCustomerId
        emailId
        mobileNo
        phoneNo
        faxNo
        addressLine1
        addressLine2
        addressLine3
        countryId
        stateId
        postalCode
        floorNo
        unitNo
        isActive
        createdBy
        createdOn
        modifiedBy
        modifiedOn
      }
    }
  }
`;

// ✅ Get Customer Delivery Address by Customer Id
export const GET_CUSTOMER_DELIVERY_ADDRESS_BY_CUSTOMER_ID = gql`
  query GetCustomerDeliveryAddressByCustomerId($customerId: Int!) {
    b2CCustomerDeliveryAddressByCustomerId(customerId: $customerId) {
      isSuccess
      errorMessage
      customerAddress {
        orgId
        branchId
        b2cCustomerId
        emailId
        mobileNo
        b2cDeliveryAddressId
        isDefault
        phoneNo
        faxNo
        addressLine1
        addressLine2
        addressLine3
        countryId
        stateId
        postalCode
        floorNo
        unitNo
        isActive
        createdBy
        createdOn
        modifiedBy
        modifiedOn
      }
    }
  }
`;

// ✅ Add Customer Delivery Address
export const ADD_CUSTOMER_DELIVERY_ADDRESS = gql`
  mutation AddCustomerDeliveryAddress($customerAddress: B2CCustomerDeliveryAddressInput!) {
    addB2CCustomerDeliveryAddress(customerAddress: $customerAddress) {
      isSuccess
      errorMessage
    }
  }
`;

// ✅ Update Customer Delivery Address
export const UPDATE_CUSTOMER_DELIVERY_ADDRESS = gql`
  mutation UpdateCustomerDeliveryAddress($customerAddress: B2CCustomerDeliveryAddressInput!) {
    updateB2CCustomerDeliveryAddress(customerAddress: $customerAddress) {
      isSuccess
      errorMessage
    }
  }
`;

// ✅ Deactivate Customer Delivery Address
export const DEACTIVATE_CUSTOMER_DELIVERY_ADDRESS = gql`
  mutation DeactivateCustomerDeliveryAddress($addressId: Int!) {
    deactivateB2CCustomerDeliveryAddress(addressId: $addressId) {
      isSuccess
      errorMessage
    }
  }
`;
