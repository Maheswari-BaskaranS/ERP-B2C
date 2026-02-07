import { gql } from "@apollo/client";

export const B2C_CUSTOMER_LOGIN = gql`
  query B2CCustomerLogin($userName: String!, $password: String!) {
    b2cCustomerLogin(userName: $userName, password: $password) {
      isSuccess
      errorMessage
      b2cCustomer{
        b2cCustomerId
        countryId
        stateId
        userName
        password
        b2CCustomerName
        b2cCustomerCode
        postalCode
        isApproved
        unitNo
        floorNo
        isActive
        totalCount
        orgId
        branchId
        mobileNo
        emailId
        addressLine1
        addressLine2
        addressLine3
        deliveryAddresses{
          b2cDeliveryAddressId
          countryId
          stateId
          postalCode
          faxNo
          floorNo
          unitNo
          isDefault
          isActive
          orgId
          totalCount
          branchId
          b2cCustomerId
          emailId
          mobileNo
          phoneNo
          addressLine1
          addressLine2
          addressLine3
        }
      }
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  query b2cCustomerForgotPassword($userName: String!) {
    b2cCustomerForgotPassword(userName: $userName) {
      isSuccess
      errorMessage
    }
  }
`;