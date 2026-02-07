import { gql } from "@apollo/client";

// ✅ Get All Riders
export const GET_ALL_RIDERS = gql`
  query {
    allB2CRider {
      isSuccess
      errorMessage
      rider {
        reiderId
        orgId
        branchId
        riderCode
        riderName
        emailId
        password
        mobileNo
        addressLine1
        addressLine2
        addressLine3
        countryId
        stateId
        postalCode
        isApproved
        isAvailabilityStatus
        isActive
        createdBy
        createdOn
        modifiedBy
        modifiedOn
      }
    }
  }
`;

// ✅ Get Rider by Id
export const GET_RIDER_BY_ID = gql`
  query GetRiderById($riderId: Int!) {
    b2CRiderById(riderId: $riderId) {
      isSuccess
      errorMessage
      rider {
        reiderId
        orgId
        branchId
        riderCode
        riderName
        emailId
        password
        mobileNo
        addressLine1
        addressLine2
        addressLine3
        countryId
        stateId
        postalCode
        isApproved
        isAvailabilityStatus
        isActive
        createdBy
        createdOn
        modifiedBy
        modifiedOn
      }
    }
  }
`;

// ✅ Add Rider
export const ADD_RIDER = gql`
  mutation AddRider($rider: B2cRiderRegistrationDtoInput!) {
    addB2CRider(rider: $rider) {
      isSuccess
      errorMessage
    }
  }
`;


// ✅ Update Rider
export const UPDATE_RIDER = gql`
  mutation UpdateRider($rider: B2cRiderRegistrationDtoInput!) {
    updateB2CRider(rider: $rider) {
      isSuccess
      errorMessage
    }
  }
`;

// ✅ Deactivate Rider
export const DEACTIVATE_RIDER = gql`
  mutation DeactivateRider($riderId: Int!) {
    deactivateB2CRider(riderId: $riderId) {
      isSuccess
      errorMessage
    }
  }
`;
