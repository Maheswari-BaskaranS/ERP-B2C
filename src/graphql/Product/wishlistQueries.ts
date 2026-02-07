import { gql } from "@apollo/client";

export const GET_WISHLIST_BY_CUSTOMER = gql`
  query GetWishListByCustomerId($orgId: Int!, $branchId: Int!, $customerId: Int!) {
    b2CCustomerWishListBYCustomerId(
      orgId: $orgId
      branchId: $branchId
      customerId: $customerId
    ) {
      isSuccess
      errorMessage
      customerWishList {
        wishListId
        wishListCode
        orgId
        branchId
        customerId
        productId
        productDetailId
        productName
        price
        qty
        uom
        isActive
           galleryImages{
        productImageID
        productId
        productDetailId
        productImageName
        productImagePath        
      }
      }
    }
  }
`;

export const GET_WISHLIST_BY_CAPID = gql`
  query GetWishListByCAPId(
    $orgId: Int!
    $branchId: Int!
    $customerId: Int!
    $productId: Int!
    $productDetailId: Int!
  ) {
    b2CCustomerWishListBYCAPId(
      orgId: $orgId
      branchId: $branchId
      customerId: $customerId
      productId: $productId
      productDetailId: $productDetailId
    ) {
      isSuccess
      errorMessage
      customerWishList {
        wishListId
        wishListCode
        orgId
        branchId
        customerId
        productId
        productDetailId
        productName
        price
        qty
        uom
        isActive
      }
    }
  }
`;

export const GET_WISHLIST_BY_ID = gql`
  query GetWishListById($wishListId: Int!) {
    b2CCustomerWishListById(wishListId: $wishListId) {
      isSuccess
      errorMessage
      b2CCustomerWishList {
        wishListId
        wishListCode
        orgId
        branchId
        customerId
        productId
        productDetailId
        productName
        price
        qty
        uom
        isActive
      }
    }
  }
`;

export const ADD_B2C_CUSTOMER_WISHLIST = gql`
  mutation AddB2CCustomerWishList($customerWishList: B2CCusWishListInput!) {
    addB2CCustomerWishList(customerWishList: $customerWishList) {
      isSuccess
      errorMessage
    }
  }
`;

export const UPDATE_WISHLIST_BY_CAPID = gql`
  mutation UpdateB2CCustomerWishListByCAPId($customerWishList: B2CCusWishListInput!) {
    updateB2CCustomerWishListByCAPId(customerWishList: $customerWishList) {
      isSuccess
      errorMessage
    }
  }
`;

export const UPDATE_B2C_CUSTOMER_WISHLIST = gql`
  mutation UpdateB2CCustomerWishList($customerWishList: B2CCusWishListInput!) {
    updateB2CCustomerWishList(customerWishList: $customerWishList) {
      isSuccess
      errorMessage
    }
  }
`;

export const DEACTIVATE_WISHLIST = gql`
  mutation DeactivateWishList($wishListId: Int!) {
    deactivateB2CCustomerWishList(wishListId: $wishListId) {
      isSuccess
      errorMessage
    }
  }
`;

export const DEACTIVATE_WISHLIST_BY_CAPID = gql`
  mutation DeactivateWishListByCAPId(
    $customerId: Int!
    $productId: Int!
    $productDetailId: Int!
    $orgId: Int!
    $branchId: Int!
  ) {
    deactivateB2CCustomerWishListByCAPId(
      customerId: $customerId
      productId: $productId
      productDetailId: $productDetailId
      orgId: $orgId
      branchId: $branchId
    ) {
      isSuccess
      errorMessage
    }
  }
`;
