import moment from "moment";
import { useRef, useState, useEffect } from "react";

export const ElapsedTimer = ({ date,date1 }) => {
//console.log("Start")
  //console.log(date)
 ///console.log(date1)
  if(date1=="" || date1==0 || date1==null){
     date1 = new Date();
 }
 if(date=="" || date==0 || date==null){
  date = new Date();
}
  let [time, setTime] = useState(date ? diffYMDHMS(moment(date),moment(date1)) : "");
 // console.log(time);
  let timRef = useRef();
 useEffect(() => {
    if (date) {
      timRef.current = setInterval(() => {
        setTime(diffYMDHMS(moment(date),moment(date1)));
      }, 1000 );//*60
     /* timRef.current = setTimeout(() => {
        setTime(diffYMDHMS(moment(date),moment(date1)));
      }, 1000 );//*60*/
    }

    return () => {
      if (timRef.current) {
        clearInterval(timRef.current);
      }
    };
  });
  
  return time;
};

const diffYMDHMS = (date2,EndDate) => {
  
 
  
 
 let date1=EndDate;
//  console.log("date1:"+date1)
// console.log("date2:"+date2)

  let years = date1.diff(date2, "year");
  date2.add(years, "years");

  let months = date1.diff(date2, "months");
  date2.add(months, "months");

  let days = date1.diff(date2, "days");
  date2.add(days, "days");

  let hours = date1.diff(date2, "hours");
  date2.add(hours, "hours");

  let minutes = date1.diff(date2, "minutes");
  date2.add(minutes, "minutes");
  let res =
    buildStringFromValues(years, "Year") +
    " " +
    buildStringFromValues(months, "Month") +
    " " +
    buildStringFromValues(days, "Day") +
    " " +
    buildStringFromValues(hours, "Hr") +
    " " +
    buildStringFromValues(minutes, "Min");
  if (res.trim()) {
    return res;
  } else {
    return "Just now";
  }
};
const buildStringFromValues = (num, word) => {
  if (!num) {
    return "";
  }
  return num + " " + (num === 1 ? word : word + "s");
};
