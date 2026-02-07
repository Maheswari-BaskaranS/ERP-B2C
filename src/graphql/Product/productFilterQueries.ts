import { gql } from "@apollo/client";

export const FETCH_PRODUCT_FILTER_QUERY = gql`
  query FetchProductFilter(
    $orgId: Int!
    $branchId: Int!
    $productId: Int!
    $productName: String!
    $categoryName: String!
    $subCategoryName: String!
    $productType: Int!
    $productCode: String!
  ) {
    productFilterQuery(
      orgId: $orgId
      branchId: $branchId
      productId: $productId
      productCode: $productCode
      productName: $productName
      categoryName: $categoryName
      subCategoryName: $subCategoryName
      productType: $productType
    ) {
      isSuccess
      errorMessage
      productFilter {
        productId
        productCode
        productName
        categoryName
        subCategoryName
        productType
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
 query
{
    allProductCategory
    {
        isSuccess
        errorMessage
        productCategory
        {
            categoryId
            categoryName
            categoryCode
            iconImage
            categoryImage
            categoryshorturl
            isActive 
        }
    }
}
`;

export const GET_PRODUCT_BY_BARCODE = gql`
  query GetProductByBarcode($searchCode: String!) {
    b2CProductByBarCode(searchCode: $searchCode) {
      isSuccess
      errorMessage
      product {
        productId
        productName
        productImagePath
        productCode
        usualPrice
        sellingPrice
        minimumPrice
      }
    }
  }
`;

export const GET_ALL_B2C_PRODUCT_CATEGORIES = gql`
  query GetAllB2CProductCategories {
    allB2CProductCategory {
      isSuccess
      errorMessage
      productCategory {
        categoryId
        categoryCode
        categoryName
        categoryImage
        categoryImageFileName
      }
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY_ID = gql`
  query b2CProductByCategoryId($categoryId: Int!) {
    b2CProductByCategoryId(categoryId: $categoryId) {
      product {
        productId
        productName
        usualPrice
        sellingPrice
        unitCost
         galleryImages {
          galleryImage
          productImagePath
        }
         uomName
       stockqty
       categoryName
      }
    }
  }
`;