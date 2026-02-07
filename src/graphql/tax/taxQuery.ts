import { gql } from "@apollo/client";

export const GET_TAX_BY_ID = gql`
  query GetTaxById($taxId: Int!) {
    taxById(taxId: $taxId) {
      isSuccess
      errorMessage
      tax {
        taxID
        orgID
        branchID
        taxName
        taxType
        taxPercentage
        isProductBasedTax
        isStateWiseTax
        isActive
        createdBy
        description
        createdOn
        modifiedBy
        modifiedOn
        stateTaxs {
          branchID
          orgID
          taxID
          stateTaxDetailID
          stateTaxDetailName
          splitRatio
          isSameState
          isActive
          createdBy
          createdOn
        }
      }
    }
  }
`;