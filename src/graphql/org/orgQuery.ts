import { gql } from "@apollo/client";

export const GET_ORG_BY_ID = gql`
  query GetOrgById($orgId: Int!) {
    orgById(orgId: $orgId) {
      isSuccess
      errorMessage
      organization {
        uniqueNo
        name
        businessRegNo
        taxRegNo
        addressLine1
        addressLine2
        addressLine3
        countryId
        stateId
        postalCode
        landMark
        phone
        mobile
        fax
        mail
        website
        logo
        isTax
        taxCode
        currencyId
        isActive
        createdBy
      }
    }
  }
`;
