import { gql } from "@apollo/client";

export const GET_COUNTRIES = gql`
  query {
    allCountry {
      isSuccess
      errorMessage
      country {
        countryID
        countryCode
        countryName
        isStateAvailable
      }
    }
  }
`;

export const GET_STATES = gql`
  query {
    allState {
      state {
        stateID
        stateName
      }
      isSuccess
      errorMessage
    }
  }
`;

export const GET_STATES_BY_COUNTRY_ID = gql`
  query GetStatesByCountryId($countryId: Int!) {
    stateByCountryId(countryId: $countryId) {
      states {
        stateID
        stateName
      }
      isSuccess
      errorMessage
    }
  }
`;
