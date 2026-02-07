import { gql } from '@apollo/client';

// ✅ ADD B2C RETURN
export const ADD_B2C_RETURN = gql`
  mutation AddB2CReturn($b2CReturn: B2cReturnHeaderDtoInput!) {
    addB2CReturn(b2CReturn: $b2CReturn) {
      isSuccess
      errorMessage
    }
  }
`;

// ✅ UPDATE B2C RETURN
export const UPDATE_B2C_RETURN = gql`
  mutation UpdateB2CReturn($b2CReturn: B2cReturnHeaderDtoInput!) {
    updateB2CReturn(b2CReturn: $b2CReturn) {
      isSuccess
      errorMessage
    }
  }
`;

// ✅ DEACTIVATE B2C RETURN
export const DEACTIVATE_B2C_RETURN = gql`
  mutation DeactivateB2CReturn($returnId: Int!) {
    deactivateB2CReturn(returnId: $returnId) {
      isSuccess
      errorMessage
    }
  }
`;

// ✅ FETCH ALL B2C RETURNS
export const FETCH_ALL_B2C_RETURNS = gql`
  query FetchAllB2CReturns {
    allB2CReturn {
      isSuccess
      errorMessage
      return {
        returnId
        returnDate
        returnType
        returnCode
        orgId
        branchId
        orderId
        orderDate
        orderNo
        paymodeId
        payModeName
        totalAmount
        referenceNo
        remarks
        isActive
        createdBy
        createdOn
        modifiedBy
        modifiedOn
      }
    }
  }
`;

// ✅ FETCH B2C RETURN BY ID
export const GET_B2C_RETURN_BY_ID = gql`
  query B2CReturnById($b2CReturnId: Int!) {
    b2CReturnById(b2CReturnId: $b2CReturnId) {
      isSuccess
      errorMessage
      returnHeader {
        returnId
        returnDate
        returnType
        returnCode
        orgId
        branchId
        orderId
        orderDate
        orderNo
        paymodeId
        payModeName
        totalAmount
        referenceNo
        remarks
        isActive
        createdBy
        createdOn
        modifiedBy
        modifiedOn
        returnDetail {
          b2ReturnId
          itemStatus
          returnDetailId
          orgId
          branchId
          productId
          productDetailId
          productName
          qty
          foc
          price
          currencyId
          currencyRate
          taxId
          taxType
          taxPrice
          itemDiscount
          itemDiscPer
          total
          subTotal
          itemTotalTax
          netTotal
          remarks
          isActive
          createdBy
          createdOn
          modifiedBy
          modifiedOn
        }
      }
    }
  }
`;

// ✅ FETCH B2C RETURN DETAILS BY ID
export const GET_B2C_RETURN_DETAILS_BY_ID = gql`
  query B2CReturnDetailsById($b2CReturnId: Int!, $branchId: Int!, $orgId: Int!) {
    b2CReturnDetailsById(b2CReturnId: $b2CReturnId, branchId: $branchId, orgId: $orgId) {
      isSuccess
      errorMessage
      returnDetails {
      riderId
        b2ReturnId
        itemStatus
        returnDetailId
        orgId
        branchId
        productId
        productDetailId
        productName
        qty
        foc
        price
        currencyId
        pickupStatus
        currencyRate
        itemQualityStatus
        taxId
        taxType
        taxPrice
        itemDiscount
        itemDiscPer
        total
        subTotal
        itemTotalTax
        netTotal
        remarks
        isActive
        createdBy
        createdOn
        modifiedBy
        modifiedOn
        returnBatch {
          orgID
          salesBatchDetailID
          branchID
          tranNo
          tranDate
          tranType
          slNo
          productID
          productName
          uom
          qty
          foc
          expiryDate
          mfDate
          serialNo
          createdBy
          createdOn
          modifiedBy
          modifiedOn
        }
        taxDetails {
          orgId
          branchId
          tranHeaderId
          tranDetailId
          customerId
          moduleName
          tranNo
          tranDate
          taxId
          taxName
          taxPercentage
          taxPrice
          isActive
          createdBy
          createdOn
          modifiedOn
          modifiedBy
        }
      }
    }
  }
`;

export const GET_RETURNS_BY_CUSTOMER_ID = gql`
  query GetReturnsByCustomerId($customerId: Int!) {
    b2CReturnByCustomerId(customerId: $customerId) {
      isSuccess
      errorMessage
      return {
        orgId
        branchId
        orderId
        orderNo
        orderDate
          returnId
      totalAmount
        returnCode
        returnDate
     
      }
    }
  }
`;

export const GET_RETURN_BY_ORDER_ID = gql`
  query GetReturnByOrderId($orderId: Int!) {
    b2CReturnByOrderId(orderId: $orderId) {
      isSuccess
      errorMessage
      return {
        orgId
        branchId
        orderId
        orderNo
      }
    }
  }
`;
