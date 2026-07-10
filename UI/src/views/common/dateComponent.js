import React,{ useEffect, useState } from "react";
import { errorToast } from "../../helper/appHelper";
import { apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl } from "../../urlConstants";

export default function DateComponent(page) {
    let min_date = ''
    let max_date = ''
    const [date_control,setdate_control] = useState(0)

    useEffect(() => {
      if(page=='sap'){
      getDateControls()
      }
    }, [page=='sap']);
    useEffect(() => {
      if(page=='fumigation'){
      getDateControl()
      }
    }, [page=='fumigation']);
    useEffect(() => {
      if(page=='invoice'){
      InvoiceValidation()
      }
    }, [page=='invoice']);
    useEffect(() => {
      if(page=='courier'){
        sendingdateValidation()
      }
    }, [page=='courier']);
    const getDateControl = () => {
        apiPostMethod(apiBaseUrl + "Processcancel/FumigationDateGet")
          .then((response) => {
            const { data } = response;
            setdate_control(data.results[0] ? data.results[0].temp_extended_days : 0)
          })
    }
    const getDateControls = () => {
      apiPostMethod(apiBaseUrl + "Loadingunloadingcost/SAP_PostingDate")
        .then((response) => {
          const { data } = response;
          setdate_control(data.results[0]?.sap_posting_date)
        })
    }
    const InvoiceValidation = () => {
      apiPostMethod(apiBaseUrl + "Loadingunloadingcost/SAP_PostingDate")
        .then((response) => {
          const { data } = response;
          setdate_control(data.results[0]?.invoice_posting_date)
        })
    }
    const sendingdateValidation = () => {
      apiPostMethod(apiBaseUrl + "CourierMaster/getsendingdate")
        .then((response) => {
          const { data } = response;
          setdate_control(data.results[0]?.courier_sending_date)
        })
    }
    const getDateXDaysAgo = (numOfDays, date = new Date()) => {
        const daysAgo = new Date(date.getTime());

        daysAgo.setDate(date.getDate() - numOfDays);

        let needed_date = new Date(daysAgo).toISOString().slice(0, 10)

        return needed_date;
    }

    const getDateXDaysBefore = (numOfDays, date = new Date()) => {
        const daysAgo = new Date(date.getTime());

        daysAgo.setDate(date.getDate() + numOfDays);

        let needed_date = new Date(daysAgo).toISOString().slice(0, 10)

        return needed_date;
    }

    let today = new Date().toISOString().slice(0, 10)


    const date = new Date(today);

    /*==========================(Updated Time Source Code Start)============================================*/
    var updated_date = new Date();
    var isoDateTime = new Date(updated_date.getTime() - (updated_date.getTimezoneOffset() * 60000)).toISOString();
    var exact_date = isoDateTime.slice(0, 10)

    const todayDate = new Date(exact_date);
    min_date = getDateXDaysAgo(date_control, todayDate)
    max_date = exact_date
  /*==========================(Updated Time Source Code End)=============================================*/

    let date_component = {}
    
    date_component.min_date = min_date
    date_component.max_date = max_date
    return date_component
}

export const currentDate = () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  const currentDate = year + "-" + month + "-" + date;
  return currentDate;
}

// export const currentDate = () => {
//   const today = new Date().toISOString().slice(0, 10)  
//   return today;
// }

export const minDate = new Date().toISOString().split('T')[0];

const today1 = new Date();
today1.setDate(today1.getDate() - 1); // Add 1 day
export const minDate1 = today1.toISOString().split('T')[0];


export  const getAllowedPastDate = (numOfDays) => {
  const date = new Date()
  const daysAgo = new Date(date.getTime());
  daysAgo.setDate(date.getDate() - numOfDays);
  let needed_date = new Date(daysAgo).toISOString().slice(0, 10)

  return needed_date;
}