import { gql } from "@apollo/client";

export const GET_DELIVERY_ADDRESS_BY_ID = gql`
  query GetDeliveryAddressById($addressId: Int!) {
    b2CCustomerDeliveryAddressById(addressId: $addressId) {
      customerAddress {
        b2cDeliveryAddressId
      b2cCustomerId
      addressLine1
      addressLine2
      addressLine3
      countryId
      stateId
      mobileNo
      postalCode
      phoneNo
      createdBy
      createdOn
      emailId
      modifiedBy
      modifiedOn
      faxNo
      floorNo
      isActive
      isDefault
      mobileNo
      orgId
      phoneNo
      postalCode
      stateId
      unitNo
      }
    }
  }
`;

export const GET_DELIVERY_ADDRESSES_BY_CUSTOMER_ID = gql`
  query GetDeliveryAddressesByCustomerId($customerId: Int!) {
    b2CCustomerDeliveryAddressByCustomerId(customerId: $customerId) {
      customerAddress {
        b2cDeliveryAddressId
        countryId
        b2cCustomerId
      }
    }
  }
`;

export const ADD_DELIVERY_ADDRESS = gql`
  mutation AddDeliveryAddress($customerAddress: B2CCustomerDeliveryAddressInput!) {
    addB2CCustomerDeliveryAddress(customerAddress: $customerAddress) {
      isSuccess
      errorMessage
    }
  }
`;

export const UPDATE_DELIVERY_ADDRESS = gql`
  mutation UpdateDeliveryAddress($customerAddress: B2CCustomerDeliveryAddressInput!) {
    updateB2CCustomerDeliveryAddress(customerAddress: $customerAddress) {
      isSuccess
      errorMessage
    }
  }
`;

export const GET_DELIVERY_ADDRESS_BY_ID_FULL = gql`
  query GetDeliveryAddressById($addressId: Int!) {
    b2CCustomerDeliveryAddressById(addressId: $addressId) {
      customerAddress {
        b2cDeliveryAddressId
        b2cCustomerId
        addressLine1
        addressLine2
        addressLine3
        countryId
        stateId
        mobileNo
        postalCode
        phoneNo
        createdBy
        createdOn
        emailId
        modifiedBy
        modifiedOn
        faxNo
        floorNo
        isActive
        isDefault
        orgId
        unitNo
        branchId
      }
    }
  }
`;

export const DEACTIVATE_DELIVERY_ADDRESS = gql`
  mutation DeactivateDeliveryAddress($addressId: Int!) {
    deactivateB2CCustomerDeliveryAddress(addressId: $addressId) {
      isSuccess
      errorMessage
    }
  }
`;
