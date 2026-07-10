import { useFormik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react';
import { Row, Col, Button, FormGroup, InputGroupText, Input, InputGroup, Label, Card, CardHeader, CardTitle, CardBody } from 'reactstrap';
import { apiBaseUrl } from '../../urlConstants';
import { CardComponent } from '../common/CardComponent';
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { CustomTextInput, Yup, CustomDropdownInput, validation } from '../forms/custom-form';
import { HrLine } from '../common/HrLine';
import { useLoader } from "../../utility/hooks/useLoader";
import { errorToast, ShowToast } from '../../helper/appHelper';
//import Receivelist from './receivelist';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { extendWith } from 'lodash';
import TableComponent from '../common/TableComponent';

export const taColumns = [
  {
    name: "Segment",
    selector: "Segment",
    sortable: true,
    minWidth: "170px",
  }, {
    name: "WheatVariety",
    selector: "WheatVariety",
    sortable: true,
    minWidth: "30px",
  },
  {
    name: "State",
    selector: "State",
    sortable: true,
    minWidth: "130px",
  },
  {
    name: "Zone",
    selector: "Zone",
    sortable: true,
    minWidth: "80px",
  }, {
    name: "SeedVariety",
    selector: "SeedVariety",
    sortable: true,
    minWidth: "80px",
  }, {
    name: "MaterialCode ",
    selector: "MaterialCode",
    sortable: true,
    minWidth: "80px",
  },
];


function Consignmentnumber() {
  const history = useHistory();
  let { Id } = useParams();
  let refid = '';
  if (Id) {
    refid = Id.replace(":", "");
  }
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  let { showLoader, hideLoader } = useLoader();
  // console.log(refid);
  useEffect(() => {
    if (Id) {
      onFetchCourierdetailsById();
    }
  }, [Id]);
  const onFetchCourierdetailsById = () => {
    let fdata = {
      id: refid,
    }
    //   console.log(fdata);
    showLoader();
    apiPostMethod(apiBaseUrl + "CourierMaster/getsegmentdetailsBYID", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            Id: data.results[0].Id,
            segment: data.results[0].Segment,
            wheatvariety: data.results[0].WheatVariety,
            States: data.results[0].State,
            Zone: data.results[0].Zone,
            City: data.results[0].City,
            SeedVariety: data.results[0].SeedVariety,
            MaterialCode: data.results[0].MaterialCode,
          })
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  }
  const [data, setData] = useState([]);
  const dateFormat = "YYYY-MM-DD";
  const today = moment().format(dateFormat);

  const isToday = (date) => {
    return moment(date).format(dateFormat) == today;
  };


  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      rows: Yup.array().of(
        Yup.object().shape({
          courier_company_id: Yup.string().required("Courier Company Name is required"),
          entry_date: Yup.string().required("Receiving Date is required"),
          from_person: Yup.string().required("From Person is required"),
        })
      ),
    }),
    onSubmit(values) { },
  });

  const handlesubmitButtonClick = () => {

    const formData = form.values;

    const postData = {
      segment: formData.segment,
      wheatvariety: formData.wheatvariety,
      States: formData.States,
      Zone: formData.Zone,
      City: formData.City,
      SeedVariety: formData.SeedVariety,
      MaterialCode: formData.MaterialCode,
      created_by: UserDetails.USERID,

    }
    if (refid == "") {
      if (postData.segment == "" || postData.segment == undefined) {
        errorToast('Please Enter segment')
        return false
      } else if (postData.wheatvariety == "" || postData.wheatvariety == undefined) {
        errorToast('Please Select wheatvariety')
        return false
      } else if (postData.States == "" || postData.States == undefined) {
        errorToast('Please Enter State')
        return false
      } else if (postData.City == "" || postData.City == undefined) {
        errorToast('Please Enter City')
        return false
      } else if (postData.SeedVariety == "" || postData.SeedVariety == undefined) {
        errorToast('Please Enter SeedVariety')
        return false
      } else if (postData.MaterialCode == "" || postData.MaterialCode == undefined) {
        errorToast('Please Enter MaterialCode')
        return false
      } else if (postData.Zone == "" || postData.Zone == undefined) {
        errorToast('Please Enter Zone')
        return false
      }
      console.log(postData)
      // console.log(postData);return  false;
      showLoader();
      apiPostMethod(apiBaseUrl + "CourierMaster/InsertSegmentdetails", postData)
        .then((response) => {
          const { data } = response;
          console.log(response)
          if (data.success == true) {
            ShowToast("Save Successfully...");
            window.setTimeout(function () {
              window.location.reload();
            }, 2000);
          } else if (data.success == 0) {
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

    else if (refid != "0") {
      const formData = form.values;
      const FrmData = {
        courier_name: formData.courier_name,
        updated_by: UserDetails.USERID,
      };
      const postdata = {
        Id: formData.Id,

        segment: formData.segment,
        wheatvariety: formData.wheatvariety,
        States: formData.States,
        Zone: formData.Zone,
        City: formData.City,
        SeedVariety: formData.SeedVariety,
        MaterialCode: formData.MaterialCode,
        created_by: UserDetails.USERID,


      };
      showLoader();
      apiPostMethod(apiBaseUrl + "CourierMaster/updatesegmentdetails", postdata)
        .then((response) => {
          const { data } = response;
          console.log(JSON.stringify(response))
          let RespId = data.success;
          if (RespId && RespId >= 1) {
            ShowToast("Saved Successfully...");
            window.setTimeout(function () {
              window.location.reload();
            }, 2000);
            history.push("/segment");

            if (document.getElementById("id").value == "") {
              history.push("/master/segment:0");
            }
            else {
              history.push("/master/segment");
            }
          }
          else {
            if (data.ErrorMsg) {
              errorToast(data.ErrorMsg);
            }
            else {
              errorToast("Unable to update record");
            }
          }
        })
        .finally((a) => {
          hideLoader();
        });
    };
  }

  const actionsCol = {
    name: "Actions",
    selector: "Edit",
    minWidth: "120px",
    cell: (row) => {
      return (
        <>

          <Button.Ripple
            color="primary"
            onClick={() => {
              history.push('/segment:' + row.Id);
            }}
          >
            {"View"}
          </Button.Ripple>
          &nbsp;
        </>
      );
    },
  };
  const columns = [...taColumns,
    actionsCol
  ];

  return (
    <div>
      <div>
        <Fragment>
          <CardComponent header="Segment Screen">
            <h5>Segment Details</h5>
            <Row>
              <Col md="4" sm="12">
                <CustomTextInput label={"Segment"} id="segment" name="segment" form={form} type="text"
                />
              </Col>
              <Col md="4" sm="12">
                {/* <CustomTextInput label={"WheatVariety"} id="wheatvariety" name="wheatvariety" form={form} type="text"
                /> */}
                <Label for="MaterialCode">Wheat Variety</Label>
                <Input
                  id="wheatvariety"
                  name="wheatvariety"
                  type="text"
                  value={form.values.wheatvariety}
                  onChange={form.handleChange}
                />
              </Col>
              <Col md="4" sm="12">
                <CustomTextInput label={"State"} id="States" name="States" form={form} type="text"
                /></Col>
            </Row>
            <Row>
              <Col md="3" sm="12">
                <CustomTextInput label={"Zone"} id="Zone" name="Zone" form={form} type="text" />
              </Col>
              <Col md="3" sm="12">
                <CustomTextInput label={"City"} id="City" name="City" form={form} type="text" />
              </Col>
              <Col md="3" sm="12">
                <CustomTextInput label={"SeedVariety"} id="SeedVariety" name="SeedVariety" form={form} type="text" />
              </Col>
              <Col md="3" sm="12">
                <Label for="MaterialCode">Material Code</Label>
                <Input
                  id="MaterialCode"
                  name="MaterialCode"
                  type="text"
                  value={form.values.MaterialCode}
                  onChange={form.handleChange}
                />
              </Col>
            </Row>

            <Col sm="12">
              <FormGroup className="d-flex mb-0 justify-content-end">
                <Button.Ripple color="primary" type="submit" onClick={handlesubmitButtonClick} >
                  Submit
                </Button.Ripple>
              </FormGroup>
            </Col>
            <HrLine />
          </CardComponent>
        </Fragment>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Segment details</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent columns={columns} url={apiBaseUrl + `CourierMaster/getsegmentdetails`} formType="getSender" data={data} />
        </CardBody>
      </Card>
    </div>
  );

}


export default Consignmentnumber;
