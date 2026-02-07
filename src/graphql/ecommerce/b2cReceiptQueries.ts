import { gql } from "@apollo/client";

// ✅ Get All B2C Receipts
export const GET_ALL_RECEIPTS = gql`
  query {
    allB2CReceipt {
      isSuccess
      errorMessage
      receipt {
        b2cReceiptId
        b2cReceiptCode
        orgId
        branchId
        b2cReceiptDate
        orderId
        orderDate
        orderNo
        paymodeId
        payModeName
        totalAmount
        paidAmount
        balanceAmount
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

// ✅ Get B2C Receipt by ID
export const GET_RECEIPT_BY_ID = gql`
  query GetReceiptById($receiptId: Int!) {
    b2CReceiptById(receiptId: $receiptId) {
      isSuccess
      errorMessage
      receipt {
        b2cReceiptId
        b2cReceiptCode
        orgId
        branchId
        b2cReceiptDate
        orderId
        orderDate
        orderNo
        paymodeId
        payModeName
        totalAmount
        paidAmount
        balanceAmount
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

// ✅ Add B2C Receipt
export const ADD_RECEIPT = gql`
  mutation AddReceipt($receipt: B2cReceiptDtoInput!) {
    addB2CReceipt(receipt: $receipt) {
      isSuccess
      errorMessage
    }
  }
`;

// ✅ Update B2C Receipt
export const UPDATE_RECEIPT = gql`
  mutation UpdateReceipt($receipt: B2cReceiptDtoInput!) {
    updateB2CReceipt(receipt: $receipt) {
      isSuccess
      errorMessage
    }
  }
`;

// ✅ Deactivate B2C Receipt
export const DEACTIVATE_RECEIPT = gql`
  mutation DeactivateReceipt($receiptId: Int!) {
    deactivateB2CReceipt(receiptId: $receiptId) {
      isSuccess
      errorMessage
    }
  }
`;
