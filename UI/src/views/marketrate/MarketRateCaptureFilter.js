import { useFormik } from "formik";
import React, { Fragment, useState } from "react";
import { apiBaseUrl } from "../../urlConstants";

import { CardComponent } from "../common/CardComponent";
import TableComponent from "../common/TableComponent";
import { addColumn, getDropdownValue, getFromDate, getToDate } from "../common/Utils";
import { validation, Yup } from "../forms/custom-form";
import { RefreshBlock } from "../common/RefreshBlock";
import MarketRateCaptureFilterForm from "./MarketRateCaptureFilterForm";

const MarketRateCaptureFilter = () => {
  let [filter, setFilter] = useState();
  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      date: validation.required({ isObject: true }),
    }),
    // validationSchema: () =>
    //   Yup.lazy((values) => {
    //     if (values.toDate || values.fromDate) {
    //       return Yup.object().shape({
    //         toDate: validation.required(),
    //         fromDate: validation.required(),
    //       });
    //     }
    //     return Yup.object().shape({});
    //   }),
    // validationSchema: Yup.object().shape({
    //   toDate: Yup.string().when("fromDate", {
    //     is: (sel) => {
    //       return !!sel;
    //     },
    //     then: validation.required(),
    //   }),
    //   fromDate: Yup.string().when("toDate", {
    //     is: (sel) => {
    //       return !!sel;
    //     },
    //     then: validation.required(),
    //   }),
    // }),
  });

  const onSubmit = () => {
    console.log(form.values);
    let values = form.values;
    setFilter({
      filter: {
        from: getFromDate(values.date),
        to: getToDate(values.date),
        wheatVarietyId: getDropdownValue(values.wheatVariety),
        supplierId: getDropdownValue(values.supplierName),
        supplierCategory: getDropdownValue(values.supplierCategory),
        deliveryAtId: getDropdownValue(values.deliveryAt),
        modeOfTransportId: getDropdownValue(values.modeOfTransport),
        state: getDropdownValue(values.state),
        zone: getDropdownValue(values.zone),
        city: getDropdownValue(values.city),
        seedVariety: getDropdownValue(values.seedVariety),
      },
    });
  };
  return (
    <Fragment>
        <RefreshBlock />
      <CardComponent header="Search Filter">
        <MarketRateCaptureFilterForm form={form} onSubmit={onSubmit} />
      </CardComponent>
      <CardComponent header="Wheat Price View">
        <TableComponent
          /*hideSearch*/
          showDownload
          fileName={"Market Data"}
          sheetName={"Market Data"}
          postData={filter}
          url={`${apiBaseUrl}marketdata/capture/search`}
         
          columns={mrcColumnSpec()}
        />
      </CardComponent>
    </Fragment>
  );
};

export default MarketRateCaptureFilter;

const mrcColumnSpec = () => {
  let dateAddedColumn = (row) => {
    return row.dateAdded.split(" ")[0];
  };
  return [
    addColumn("Wheat Variety", "WheatVariety", "250px"),
    addColumn("Rate Per Ton", "RatePerTon"),
    addColumn("Date", "DateAdded", undefined), //dateAddedColumn, dateAddedColumn),
    addColumn("Supplier Name", "SupplierName", "300px"),
    addColumn("Supplier Category", "SupplierCategory", "180px"),
    addColumn("Loading Location", "loadingdescreption", "200px"),
    addColumn("Delivery At", "DeliveryAt"),
    addColumn("Mode Of Transfer", "ModeOfTransfer", "160px"),
    addColumn("State", "State"),
    addColumn("Zone", "Zone"),
    addColumn("City", "City"),
    addColumn("Seed Variety", "SeedVariety"),
    addColumn("Segment", "Segment"),
  ];
};
