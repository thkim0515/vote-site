import Holidays from "date-holidays";
const hd = new Holidays("KR");

export const isHoliday = (date) => {
  return hd.isHoliday(date) !== null;
};
