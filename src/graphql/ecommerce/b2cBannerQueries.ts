import { gql } from "@apollo/client";

// ✅ Get All Banner Images
export const GET_ALL_B2C_BANNER_IMAGES = gql`
  query {
    allB2CBannerImage {
      isSuccess
      errorMessage
      bannerImage {
        bannerId
        bannerCode
        orgId
        branchId
        title
        description
        additionDesc
        bannerImageName
        bannerImageFilePath
        displayOrder
        isActive
        createdBy
        createdOn
        modifiedBy
        modifiedOn
      }
    }
  }
`;

// ✅ Get Banner Image by Id
export const GET_B2C_BANNER_IMAGE_BY_ID = gql`
  query GetB2CBannerImageById($bannerId: Int!) {
    b2CBannerImageById(bannerId: $bannerId) {
      isSuccess
      errorMessage
      bannerImage {
        bannerId
        bannerCode
        orgId
        branchId
        title
        description
        additionDesc
        bannerImageName
        bannerImageFilePath
        displayOrder
        isActive
        createdBy
        createdOn
        modifiedBy
        modifiedOn
      }
    }
  }
`;

// ✅ Add Banner Image
export const ADD_B2C_BANNER_IMAGE = gql`
  mutation AddB2CBannerImage($bannerImage: B2CBannerImageInput!) {
    addB2CBannerImage(bannerImage: $bannerImage) {
      isSuccess
      errorMessage
    }
  }
`;

// ✅ Update Banner Image
export const UPDATE_B2C_BANNER_IMAGE = gql`
  mutation UpdateB2CBannerImage($bannerImage: B2CBannerImageInput!) {
    updateB2CBannerImage(bannerImage: $bannerImage) {
      isSuccess
      errorMessage
    }
  }
`;

// ✅ Deactivate Banner Image
export const DEACTIVATE_B2C_BANNER_IMAGE = gql`
  mutation DeactivateB2CBannerImage($bannerId: Int!) {
    deactivateB2CBannerImage(bannerId: $bannerId) {
      isSuccess
      errorMessage
    }
  }
`;
