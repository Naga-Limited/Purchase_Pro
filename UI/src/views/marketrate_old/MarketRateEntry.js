import React, { Fragment, useEffect } from "react";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";

import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import { addOption } from "../common/Utils";

import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button";
import { CardComponent } from "../common/CardComponent";
import { RefreshBlock } from "../common/RefreshBlock";
import MarketRateEntryForm from "./MarketRateEntryForm";
import MarketRateEntryRowForm from "./MarketRateEntryRowForm";
import moment from "moment";
import { useHistory } from "react-router";
import { Row, Col,Button } from "reactstrap";

const MarketRateEntry = () => {
  const history = useHistory();
  const { showLoader, hideLoader } = useLoader();
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);
  const isToday = (date) => {
    return moment(date).format(dateFormat) == today;
  };
 
  
  const form = useFormik({
    isInitialValid: false,
    initialValues: {
      date: today,
      supplierName: "",
      supplierCategory: "",
      marketRates: [],
    },
    validationSchema: Yup.object().shape({
      supplierName: validation.required({ isObject: true }),
      marketRates: Yup.array().of(
        Yup.object({
          bagName: validation.required({ isObject: true }),
          deliveryAt: validation.required({ isObject: true }),
          loadingDescription: validation.required({ isObject: true }),
          modeOfTransfer: validation.required({ isObject: true }),
          ratePerTon: validation.number({ max: 5, min: 5 }),
          wheatVariety: validation.required({ isObject: true }),
        })
      ),
    }),
    onSubmit(values) {},
  });
  let values = form.values;

  const onRemove = (e, index) => {
    let newData = [...values.marketRates];
    let selectedItem = values.marketRates[index];
    if (selectedItem.id && isToday(selectedItem.dateAdded)) {
      newData.splice(index, 1, { ...values.marketRates[index], isDeleted: "1" });
    } else {
      newData.splice(index, 1);
    }
    form.setFieldValue("marketRates", newData);
  };

  const onAdd = () => {
    let newData = [...values.marketRates, {}];
    form.setFieldValue("marketRates", newData);
  };
 
  const onUpdate = () => {
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      return;
    }

    const { marketRates } = form.values;

    const params = marketRates.map((marketRate) => {
      return {
        // id: marketRate.isDeleted == "1" ? marketRate.id : undefined,
        // dateAdded: form.values.date,
        supplierId: form.values.supplierName.value,
        wheatVarietyId: marketRate.wheatVariety.value,
        loadingLocationId: marketRate.loadingDescription.value,
        modeOfTransportId: marketRate.modeOfTransfer.value,
        deliveryAtId: marketRate.deliveryAt.value,
        bagTypeId: marketRate.bagName.value,
        ratePerTon: marketRate.ratePerTon,
        isDeleted: marketRate.isDeleted || "0",
      };
    });

    showLoader();

    apiPostMethod(`${apiBaseUrl}marketdata/capture/addOrUpdateWheatPriceEntry`, params)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          form.resetForm();
        } else if (data.error) {
          errorToast(data.error);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };
 
  useEffect(() => {
    if (values.supplierName) {
      showLoader();

      const params = {
        dateAdded: values.date,
        supplierId: +values.supplierName.value,
      };

      apiPostMethod(`${apiBaseUrl}marketdata/capture/getWheatPriceEntry`, params)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            const { results } = data;
            let newVal;

            if (results.length === 0) {
              newVal = {
                ...form.values,
                supplierCategory: values.supplierName.category,
                marketRates: [{}],
              };
            } else {
              newVal = {
                ...form.values,
                supplierCategory: values.supplierName.category,
                marketRates: results.map((result) => ({
                  dateAdded: result.dateAdded,
                  bagName: addOption(result.bagName, result.bagTypeId),
                  deliveryAt: addOption(result.deliveryAt, result.deliveryAtId),
                  id: result.id,
                  isDeleted: result.isDeleted,
                  loadingDescription: addOption(result.loadingDescription, result.loadingLocationId),
                  modeOfTransfer: addOption(result.modeOfTransfer, result.modeOfTransportId),
                  ratePerTon: isToday(result.dateAdded) ? result.ratePerTon : "",
                  wheatVariety: addOption(result.wheatVariety, result.wheatVarietyId),
                })),
              };
            }

            form.setValues((val) => ({ ...val, ...newVal }));
            form.setSubmitting(false);
          } else if (data.error) {
            errorToast(data.error);
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally((a) => {
          hideLoader();
        });
    }
  }, [values.supplierName]);
  const RefreshPage = () => {
     window.location.reload();
   };
  return (
    <Fragment>
       <RefreshBlock />
      <CardComponent header="Wheat Price Entry">
     


        <MarketRateEntryForm form={form} />
       
      </CardComponent>
      
      {form.values.supplierName !== "" && (
        <CardComponent>
          <MarketRateEntryRowForm form={form} handleRemove={onRemove} handleAdd={onAdd} />
        </CardComponent>
      )}
      {form.values.supplierName !== "" && (
        <CardComponent>
          <CancelSubmitButtons
            form={form}
            onCancel={() => {
              form.resetForm();
            }}
            onSubmit={onUpdate}
            cancelText={"Clear"}
          />
        </CardComponent>
      )}
     
  
    </Fragment>
  );
};

export default MarketRateEntry;
