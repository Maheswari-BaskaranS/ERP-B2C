import { gql } from "@apollo/client";

// ✅ Add B2C Order
export const ADD_B2C_ORDER = gql`
  mutation AddB2COrder($b2COrder: B2cOrderHeaderDtoInput!) {
    addB2COrder(b2COrder: $b2COrder) {
      isSuccess
      errorMessage
    }
  }
`;

// ✅ Update B2C Order
export const UPDATE_B2C_ORDER = gql`
  mutation UpdateB2COrder($b2COrder: B2cOrderHeaderDtoInput!) {
    updateB2COrder(b2COrder: $b2COrder) {
      isSuccess
      errorMessage
    }
  }
`;

// ✅ Deactivate B2C Order
export const DEACTIVATE_B2C_ORDER = gql`
  mutation DeactivateB2COrder($orderId: Int!) {
    deactivateB2COrder(orderId: $orderId) {
      isSuccess
      errorMessage
    }
  }
`;

// ✅ Fetch All B2C Orders
export const FETCH_ALL_B2C_ORDERS = gql`
  query FetchAllB2COrders {
    allB2COrder {
      isSuccess
      errorMessage
      b2COrder {
        b2cOrderId
        b2cOrderNo
        orgId
        branchId
        b2cOrderDate
        b2cCustomerId
        b2cCustomerName
        billToAddress
        deliveryAddressId
        deliveryAddress
        currencyId
        currencyRate
        taxId
        taxType
        taxPrice
        billDiscount
        billDiscPer
        total
        subTotal
        totalTax
        netTotal
        paidAmount
        balanceAmount
        deliveryAmount
        deliveryDate
        orderStatus
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

// ✅ Get B2C Order by ID
export const GET_B2C_ORDER_BY_ID = gql`
  query B2COrderById($orderId: Int!) {
    b2COrderById(orderId: $orderId) {
      isSuccess
      errorMessage
      orderHeader {
        b2cOrderId
        b2cOrderNo
        orgId
        branchId
        b2cOrderDate
        b2cCustomerId
        b2cCustomerName
        billToAddress
        deliveryAddressId
        deliveryAddress
        currencyId
        currencyRate
        taxId
        taxType
        taxPrice
        billDiscount
        billDiscPer
        total
        subTotal
        totalTax
        netTotal
        paidAmount
        balanceAmount
        deliveryAmount
        deliveryDate
         soDetail{
b2cOrderDetailId
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
b2cOrderId
netTotal
remarks
isActive
createdBy
createdOn
modifiedBy
 modifiedOn
 itemQualityStatus
 pickupDate
 riderId
 orgId

      }
      receiptDetails{
        payModeName
        paymodeId
        paidAmount
        totalAmount
        b2cReceiptId
        totalAmount
        balanceAmount
        referenceNo
        remarks
        isActive
        createdBy
        createdOn
        modifiedBy
        modifiedOn
        b2cReceiptCode
        orgId
        branchId
        b2cReceiptDate
        orderId
        orderDate
        orderNo

      }
        orderStatus
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

// ✅ Get B2C Order Details by ID
export const GET_B2C_ORDER_DETAILS_BY_ID = gql`
  query B2COrderDetailsById($orderId: Int!, $orgId: Int!, $branchId: Int!) {
    b2COrderDetailsById(orderId: $orderId, orgId: $orgId, branchId: $branchId) {
      isSuccess
      errorMessage
      orderDetails {
        b2cOrderDetailId
        b2cOrderId
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
        riderId
        pickupDate
        pickupStatus
        orderBatch {
          orgID
          salesBatchDetailID
          branchID
          tranNo
          tranDate
          tranType
          slNo
          batchNo
          productID
          productDetailID
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
          tranNo
          tranDate
          moduleName
          taxId
          taxName
          taxPrice
          taxPercentage
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

export const GET_ORDERS_BY_CUSTOMER_ID = gql`
  query GetOrdersByCustomerId($customerId: Int!) {
    b2COrderByCustomerId(customerId: $customerId) {
      isSuccess
      errorMessage
      b2COrder {
        orgId
        branchId
        b2cOrderId
        b2cOrderNo
        b2cOrderDate
        b2cCustomerId
        b2cCustomerName
        netTotal
      }
    }
  }
`;
