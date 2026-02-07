import { gql } from "@apollo/client";

export const ADD_B2C_CUSTOMER_CART = gql`
  mutation AddB2CCustomerCart($customerCart: CustomerCartInput!) {
    addB2CCustomerCart(customerCart: $customerCart) {
      isSuccess
      errorMessage
    }
  }
`;

export const UPDATE_B2C_CUSTOMER_CART = gql`
  mutation UpdateB2CCustomerCart($customerCart: CustomerCartInput!) {
    updateB2CCustomerCart(customerCart: $customerCart) {
      isSuccess
      errorMessage
    }
  }
`;

export const REMOVE_B2C_CUSTOMER_CART = gql`
  mutation RemoveB2CCustomerCart(
    $customerId: Int!
    $customerType: Int!
    $productId: Int!
    $productDetailId: Int!
  ) {
    reMoveB2CCustomerCart(
      customerId: $customerId
      customerType: $customerType
      productId: $productId
      productdetailId: $productDetailId
    ) {
      isSuccess
      errorMessage
    }
  }
`;

export const GET_B2C_CUSTOMER_CART = gql`
  query GetCustomerCart($customerId: Int!, $customerType: Int!) {
    customerCartByCustomerId(customerId: $customerId, customerType: $customerType) {
      isSuccess
      errorMessage
      customerCart {
        cratId
        cartCode
        customerId
        customerType
        productId
        productImage
        productName
        productDetailId
        qty
        price
      }
    }
  }
`;
