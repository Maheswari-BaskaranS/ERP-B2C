import { gql } from "@apollo/client";

export const GET_B2CPRODUCTS = gql`
  query GetAllB2CProduct($pageNo: Int!, $pageSize: Int!) {
    allB2CProduct(pageNo: $pageNo, pageSize: $pageSize) {
    isSuccess
    errorMessage
    totalCount
    product{
      productId
      productCode
      productName
      categoryName
      uomName
      usualPrice
      stockqty
      taxPerc
      orgId
      branchId
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

export const GET_PODUCT_BY_ID = gql`
  query GetProductById($productId: Int!, $orgId: Int!, $branchId: Int!) {
    productById(productId: $productId, orgId: $orgId, branchId: $branchId) {
      product {
        productId
        stockqty
        productName
        productCode
        productWeight
        hsnsacCode
        description
        branchId
        productType
        categoryId
        subCategoryId
        orgId
        uomName
        baseUOMId
        isActive
        brandId
        taxPerc
        isVAT
        vatPer
        isCess
        cessPer
        topBaseQty
        productBarCode {
          barCodeId
          branchId
          orgId
          productId
          productDetailId
          barcode
          isActive
        }
        productPriceSetting {
          orgId
          branchId
          productId
          productDetailId
          priceSettingId
          sellingPrice
          minimumPrice
          retailSellingPrice
          b2CSellingPrice
          retailMinimumPrice
          b2CMinimumPrice
          b2BMinimumPrice
          b2BSellingPrice
          unitCost
        }
        productDetails {
          productId
          productDetailId
          orgId
          branchId
          isActive
          detailItemCode
          detailType
          detailKey
          detailValue
          productWeight
          itemRemarks
          stockQty
          itemName
          uomName
          productDetailUOMId
          productBarCode {
            barCodeId
            branchId
            orgId
            productId
            productDetailId
            barcode
            isActive
          }
          productPriceSetting {
            orgId
            branchId
            productId
            productDetailId
            priceSettingId
            sellingPrice
            minimumPrice
            retailSellingPrice
            retailMinimumPrice
            b2CMinimumPrice
            b2BMinimumPrice
            b2CSellingPrice
            b2BSellingPrice
            unitCost
          }
          galleryImages {
            orgId
            branchId
            productId
            slNo
            isDefault
            productDetailId
            productImageName
            galleryImg_Base64String
            productImagePath
            productImageID
          }
        }
        productConfiguration {
          orgId
          branchId
          saleAccountNo
          inventoryAccountNo
          cogAccountNo
          productId
          isStockTracked
          productConfigurationId
          showPOSDisplay
          showOnECommerce
          showOnB2B
          showOnPOS
          isStockTracked
          haveExpiryDate
          haveMfDate
          haveWeight
          haveSerialNo
          haveBatch
        }
        galleryImages {
          productId
          orgId
          branchId
          slNo
          isDefault
          productDetailId
          productImageName
          galleryImg_Base64String
          productImagePath
          productImageID
        }
      }
    }
  }
`;