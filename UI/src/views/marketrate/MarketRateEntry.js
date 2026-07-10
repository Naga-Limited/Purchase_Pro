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
import { Row, Col, Button } from "reactstrap";
import { ShowToast } from "../../helper/appHelper";

const MarketRateEntry = () => {
  const history = useHistory();
  const { showLoader, hideLoader } = useLoader();
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);

  const isToday = (date) => {
    return moment(date).format(dateFormat) === today;
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
          //bagName: validation.required({ isObject: true }),
          deliveryAt: validation.required({ isObject: true }),
          //loadingDescription: validation.required({ isObject: true }),
          modeOfTransfer: validation.required({ isObject: true }),
          ratePerTon: validation.number({ max: 5, min: 5 }),
          wheatVariety: validation.required({ isObject: true }),
        })
      ),
    }),
    onSubmit: (values) => {
      onUpdate(values);
    },
  });

  const values = form.values;

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
  console.log(form)
  const onUpdate = () => {
    if (!form.isValid) {
      form.setSubmitting(true);
      form.validateForm();
      
      return;
    }

    const { marketRates } = form.values;

    const params = marketRates.map((marketRate) => {
      return {
        SupplierId: form.values.supplierName.value,
        WheatVarietyId: marketRate.wheatVariety.value,
        //LoadingLocation: marketRate.loadingDescription,
        ModeOfTransportId: marketRate.modeOfTransfer.value,
        DeliveryAtId: marketRate.deliveryAt.value,
        // bagTypeId: marketRate.bagName.value,
        RatePerTon: marketRate.ratePerTon,
        Is_Deleted: marketRate.isDeleted || "0",
      };
    });

    showLoader();

    apiPostMethod(`${apiBaseUrl}marketdata/capture/addOrUpdateWheatPriceEntry`, params)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          // ShowToast("Data inseted successfully")
          form.resetForm();
        } else if (data.error) {
          errorToast(data.error);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => {
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
                  // bagName: addOption(result.bagName, result.bagTypeId),
                  deliveryAt: addOption(result.DeliveryAt, result.DeliveryAtId),
                  id: result.marketrateId,
                  isDeleted: result.isDeleted,
                  //loadingDescription:result.loadingDescription,
                  modeOfTransfer: addOption(result.ModeOfTransfer, result.ModeOfTransportId),
                  ratePerTon: isToday(result.dateAdded) ? result.RatePerTon : "",
                  wheatVariety: addOption(result.WheatVariety, result.WheatVarietyId),
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
        .finally(() => {
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
            submitText={"Submit"}
          />
        </CardComponent>
      )}
    </Fragment>
  );
};

export default MarketRateEntry;
