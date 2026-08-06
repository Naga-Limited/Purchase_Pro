import React, { Fragment, useEffect, useState } from "react";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast, ShowToast } from "@helpers/appHelper";
import { Card, CardHeader, CardBody, Button } from "reactstrap";
import { RotateCcw } from "react-feather";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { apiBaseUrl } from "../../urlConstants";
import { useLoader } from "../../utility/hooks/useLoader";
import TableComponent from "../common/TableComponent";

const columns = (onReverse) => [
    { name: "PI REF ID", selector: "PI_REFID", sortable: true, minWidth: "100px" },
    { name: "PO NUMBER", selector: "ZPO_NUMBER", sortable: true, minWidth: "140px" },
    { name: "VA NUMBER", selector: "ZVA_NUMBER", sortable: true, minWidth: "140px" },
    { name: "VEHICLE TYPE", selector: "VEHICLE_TYPE", sortable: true, minWidth: "140px" },
    { name: "MIGO APPROVAL DATE", selector: "MIGOApprovalDt", sortable: true, minWidth: "160px" },
    { name: "GRN QTY", selector: "ZQTY", sortable: true, minWidth: "120px" },
    {
        name: "ACTIONS", selector: "PI_REFID", hideInExcel: true, minWidth: "140px",
        cell: (row) => (
            <Button.Ripple color="primary" size="sm" type="button" onClick={() => onReverse(row)}>
                <RotateCcw size={13} /> Reverse
            </Button.Ripple>
        ),
    },
];

const Migo501ReversalList = () => {
    const { showLoader, hideLoader } = useLoader();
    const [list, setList] = useState([]);

    const loadList = () => {
        showLoader();
        apiPostMethod(apiBaseUrl + "CustomMillingMasterController/Migo501ReversalList", {})
            .then(({ data }) => {
                if (data.success === 1 || data.success === true) {
                    setList(data.results || []);
                } else {
                    errorToast(data.message || "Failed to load MIGO 501 reversal list");
                }
            })
            .catch((err) => {
                console.error(err);
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => hideLoader());
    };

    useEffect(() => {
        loadList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onReverse = (row) => {
        confirmDialog({
            title: "Are you sure want to reverse this entry?",
            description: `VA Number - ${row.ZVA_NUMBER} | PO Number - ${row.ZPO_NUMBER}`,
        }).then((res) => {
            if (!res) return;
            showLoader();
            apiPostMethod(apiBaseUrl + "CustomMillingMasterController/Migo501ReversalUpdate", { id: row.PI_REFID })
                .then(({ data }) => {
                    if (data.success === 1 || data.success === true) {
                        ShowToast("Reversed Successfully...");
                        loadList();
                    } else {
                        errorToast(data.message || "Failed to reverse entry");
                    }
                })
                .catch((err) => {
                    console.error(err);
                    errorToast("Something went wrong, please try again after sometime");
                })
                .finally(() => hideLoader());
        });
    };

    return (
        <Fragment>
            <Card>
                <CardHeader>
                    <h5 style={{ margin: 0 }}>MIGO 501 Reversal</h5>
                </CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns(onReverse)} data={list} />
                </CardBody>
            </Card>
        </Fragment>
    );
};

export default Migo501ReversalList;
