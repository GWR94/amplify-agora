export const convertPoundsToPence = price => parseInt((price * 100).toFixed(0));
export const convertPenceToPounds = price => (price / 100).toFixed(2);
