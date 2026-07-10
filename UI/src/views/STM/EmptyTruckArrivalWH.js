import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  FormGroup,
  Row,
  Col,
  Button,
  Label,
  InputGroup,
  InputGroupAddon,
  Input,
  InputGroupText,
} from "reactstrap";
import ReactPaginate from "react-paginate";
import DataTable from "react-data-table-component";
import { ChevronDown } from "react-feather";
import React, { useEffect, useState } from "react";
import { StopCircle, Check, Search } from "react-feather";
import { useHistory } from "react-router-dom";
// ** Store
import { useSelector } from "react-redux";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { apiBaseUrl, evaUrl } from "../../urlConstants";
import { evaWHColumns, getDefaultPlant, actionColumn } from "./columnSpec";
import NumberOnlyInput from "../../@core/components/number-input/number-input";
import { useLoader } from "../../utility/hooks/useLoader";
import { DropdownControl } from "../../@core/components/dropdown";

const EmptyTruckArrivalWH = () => {
  const [Tbldata, setTbldata] = useState([]);
  let { showLoader, hideLoader } = useLoader();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  const history = useHistory();
  const [totalPage, setTotalPage] = useState(0);
  const [screenType] = useState("EVAWH");
  const [formData, setFormaData] = useState(getDefaultPlant(UserDetails.plantids));

  const onTextChange = (e, key) => {
    const { value } = e.target ? e.target : e;
    setFormaData({ ...formData, [key]: value });
  };

  const onPlantChange = (e) => {
    setFormaData({ ...formData, plant: e });
  };

  const onAddTruckDetails = (status) => {
    showLoader();
    let fdata = {
      TRUCK_NO: formData.truckNo,
      DRIVER_NO: formData.driverNo,
      WB_TICKET_NO: formData.wbTicketNo,
      WB_NAME: formData.wbName,
      WB_CHARGES: formData.wbCharges,
      WB_EMPTY_WT: formData.wbEmptyWt,
      SCREEN_TYPE: screenType,
      VEHICLE_STATUS: status,
      PLANT_ID: formData.plant.value,
      PLANT_NAME: formData.plant.label,
      formType: "A",
    };
    apiPostMethod(evaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          let fd = { ...formData };
          Object.keys(fd).forEach((a) => {
            if (a !== "plant") fd[a] = "";
          });
          setFormaData(fd);
          onFetchAllRecords();
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => hideLoader());
  };

  const onFetchAllRecords = (value) => {
    let fdata = {
      plantIds: UserDetails.plantids,
      formType: "F",
      SCREEN_TYPE: screenType,
      startCount: currentPage,
    };
    if (value && value.length) {
      fdata = { ...fdata, searchTxt: value };
    }
    showLoader();
    apiPostMethod(evaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          setTbldata(data.results);
          setTotalPage(data.count);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally(() => hideLoader());
  };

  const onUpdateStatus = (val, id) => {
    if (val == 1) {
      let fdata = { ID: id, VEHICLE_STATUS: 4, formType: "U" };
      showLoader();
      apiPostMethod(evaUrl, fdata)
        .then((response) => {
          const { data } = response;
          if (data.success) {
            onFetchAllRecords();
          }
        })
        .catch((error) => {
          errorToast("Something went wrong, please try again after sometime");
        })
        .finally(() => hideLoader());
    } else if (val == 4) {
      history.push(`/UP:${id}`);
    }
  };
  const handlePagination = (page) => {
    setCurrentPage(page.selected);
    onFetchAllRecords();
  };

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);
  };
  const handleEnterSearch = (e) => {
    const { value } = e.target;
    if (e.charCode === 13) {
      onFetchAllRecords(value);
    }
  };
  // ** Custom Pagination , setTotalPage
  const CustomPagination = () => (
    <ReactPaginate
      previousLabel=""
      nextLabel=""
      forcePage={currentPage}
      onPageChange={(page) => handlePagination(page)}
      pageCount={totalPage / 10 || 1}
      breakLabel="..."
      pageRangeDisplayed={2}
      marginPagesDisplayed={2}
      activeClassName="active"
      pageClassName="page-item"
      breakClassName="page-item"
      breakLinkClassName="page-link"
      nextLinkClassName="page-link"
      nextClassName="page-item next"
      previousClassName="page-item prev"
      previousLinkClassName="page-link"
      pageLinkClassName="page-link"
      containerClassName="pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1"
    />
  );

  useEffect(() => {
    onFetchAllRecords();
  }, []);

  const isFilledAll = () => {
    const fmValues = Object.values(formData);
    return fmValues.length !== 7 || !fmValues.every((x) => x !== null && x !== "");
  };

  const columns = [...evaWHColumns, actionColumn(onUpdateStatus)];
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Empty Vehicle Arrival Warehouse</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>Vehicle No</Label>
                <Input type="text" value={formData.truckNo} maxLength={10} placeholder="Enter Vehicle No" onChange={(e) => onTextChange(e, "truckNo")} />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>Driver No</Label>
                <Input
                  type="text"
                  value={formData.driverNo}
                  maxLength={10}
                  placeholder="Enter Driver Number"
                  onChange={(e) => onTextChange(e, "driverNo")}
                />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>WB Ticket No</Label>
                <Input
                  type="text"
                  value={formData.wbTicketNo}
                  placeholder="Enter WB Ticket No"
                  onChange={(e) => onTextChange(e, "wbTicketNo")}
                />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>WB Name</Label>
                <Input
                  type="text"
                  value={formData.wbName}
                  maxLength={10}
                  placeholder="Enter WB Name"
                  onChange={(e) => onTextChange(e, "wbName")}
                />
              </FormGroup>
            </Col>

            <Col md="4" sm="12">
              <FormGroup>
                <Label>WB Charges</Label>
                <Input
                  type="text"
                  value={formData.wbCharges}
                  maxLength={10}
                  placeholder="Enter WB Charges"
                  onChange={(e) => onTextChange(e, "wbCharges")}
                />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>WB Empty Wt (In Kgs)</Label>
                <NumberOnlyInput
                  maxLength={5}
                  type="text"
                  value={formData.wbEmptyWt}
                  placeholder="Enter WB Empty Wt (In Kgs)"
                  onChange={(e) => onTextChange(e, "wbEmptyWt")}
                />
              </FormGroup>
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <Label>Plant Id</Label>
                <DropdownControl url={`${apiBaseUrl}user/getUserPlants`} value={formData.plant} onChange={(e) => onPlantChange(e)} />
              </FormGroup>
            </Col>
            <Col sm="12">
              <FormGroup className="d-flex justify-content-end mb-0">
                <div className="mr-1">
                  <Button.Ripple outline color="primary" disabled={isFilledAll()} type="button" onClick={(e) => onAddTruckDetails(1)}>
                    <StopCircle size={16} className="mr-1" />
                    Wait Outside
                  </Button.Ripple>
                </div>
                <Button.Ripple color="primary" disabled={isFilledAll()} type="button" onClick={(e) => onAddTruckDetails(4)}>
                  <Check size={16} className="mr-1" />
                  Gate In
                </Button.Ripple>
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Empty Vehicle inside Warehouse</CardTitle>
        </CardHeader>
        <CardBody>
          <Row className="justify-content-end mx-0">
            <Col className="d-flex align-items-center justify-content-end" md="4" sm="12">
              <InputGroup className="input-group-merge mb-2">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <Search size={16} />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="search..."
                  value={searchValue}
                  onChange={(e) => handleFilter(e)}
                  onKeyPress={(e) => {
                    handleEnterSearch(e);
                  }}
                />
              </InputGroup>
            </Col>
          </Row>
          <DataTable
            noHeader
            pagination
            selectableRows={false}
            columns={columns}
            paginationPerPage={50}
            className="react-dataTable"
            sortIcon={<ChevronDown size={10} />}
            paginationDefaultPage={1 + 1}
            paginationComponent={CustomPagination}
            data={Tbldata}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default EmptyTruckArrivalWH;
