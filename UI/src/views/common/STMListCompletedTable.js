import { Card, CardHeader, CardTitle, CardBody, Col } from "reactstrap";
import React, { useEffect, useState } from "react";

import { tblSTMUrl } from "../../urlConstants";
import TableComponent from "./TableComponent";
import { taColumns, status } from "../../helper/appHelper";
import Select from "react-select";

const STMListCompletedTable = ({ title, actionCell, postData, hideFilter, actitionColumnWidth,ScreenName }) => {
  let options = [
    { value: postData.vehicleStatus, label: "Default" },
    ...[1, 2, 3, 4, 5, 6, 7, 11, 12].map((k) => ({ label: status[k].title, value: k })),
  ];
  const [filter, setFilter] = useState(postData);
  let [selectedValue, setSelectedValue] = useState(options[0]);
  useEffect(() => {
    setFilter(postData);
    if (postData) {
      setSelectedValue({ value: postData.vehicleStatus, label: "Default" });
    }
  }, [postData]);
  let columns = [];
  if (actionCell) {
    const actionsCol = {
      name: "Actions",
      selector: "status",
      minWidth: actitionColumnWidth || "300px",
      cell: actionCell,
    };
    columns = [...taColumns, actionsCol];
  } else {
    columns = [...taColumns];
  }
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardBody>
          <TableComponent
            postData={filter}
            columns={columns}
            url={tblSTMUrl}
            formType="Completed"
            ScreenName={ScreenName}
            filterRenderor={
              hideFilter
                ? undefined
                : () => {
                    return (
                      <Col className="align-items-center justify-content-start" md="4" sm="12">
                        <Select
                          className="react-select"
                          classNamePrefix="select"
                          options={options}
                          value={selectedValue}
                          onChange={(item) => {
                            setSelectedValue(item);
                            setFilter((p) => ({
                              ...p,
                              vehicleStatus: item.value,
                            }));
                          }}
                        />
                      </Col>
                    );
                  }
            }
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default STMListCompletedTable;
