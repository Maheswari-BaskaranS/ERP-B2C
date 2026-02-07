import omit from 'lodash.omit';

// remove  __typename  key dynamically
export const cleanData: any = (data: any) => {
  if (Array.isArray(data)) {
    return data.map(cleanData);
  } else if (typeof data === 'object' && data !== null) {
    const filteredData = omit(data, '__typename');
    Object.keys(filteredData).forEach((key) => (filteredData[key] = cleanData(filteredData[key])));
    return filteredData;
  }
  return data;
};
