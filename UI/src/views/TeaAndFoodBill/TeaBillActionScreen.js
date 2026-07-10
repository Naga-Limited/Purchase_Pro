import React, { useState, useEffect } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Row, Col, FormGroup, Input, Button, Table, Badge
} from 'reactstrap';
import Select from 'react-select';
import { apiPostMethod } from '../utility/api';
import { successToast, errorToast } from '../utility/toast';

const TeaBillActionScreen = ({ show, toggle, rowData, refreshData }) => {
  const [formData, setFormData] = useState({});
  const [detailsList, setDetailsList] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (rowData) {
      setFormData(rowData);
      const initialList = rowData.quantities || [];
      setDetailsList(initialList);
      calculateTotal(initialList);
    }
  }, [rowData]);

  const calculateTotal = (list) => {
    const sum = list.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
    setTotal(sum);
  };

  const handleQuantityChange = (index, value) => {
    const updated = [...detailsList];
    updated[index].quantity = value;
    setDetailsList(updated);
    calculateTotal(updated);
  };

  const updateTeaBill = async (status) => {
    const payload = {
      ...formData,
      status: status,
      total_qty: total,
      quantities: detailsList,
    };

    try {
      const response = await apiPostMethod(`FoodTeaTokenController/updateTeaBill`, payload);
      if (response.success) {
        successToast("Tea Bill Updated Successfully");
        toggle();
        refreshData();
      } else {
        errorToast(response.message);
      }
    } catch (err) {
      errorToast("Error while updating Tea Bill");
    }
  };

  return (
    <Modal isOpen={show} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Tea Bill Action</ModalHeader>
      <ModalBody>
        <Row>
          <Col md="6">
            <FormGroup>
              <label>Vendor</label>
              <Input value={formData.vendor_name || ''} disabled />
            </FormGroup>
          </Col>
          <Col md="3">
            <FormGroup>
              <label>Shift</label>
              <Input value={formData.shift_name || ''} disabled />
            </FormGroup>
          </Col>
          <Col md="3">
            <FormGroup>
              <label>Date</label>
              <Input value={formData.bill_date || ''} disabled />
            </FormGroup>
          </Col>
        </Row>

        <Table bordered>
          <thead>
            <tr className="text-center">
              <th>#</th>
              <th>Item</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {detailsList.map((item, idx) => (
              <tr key={idx}>
                <td className="text-center">{idx + 1}</td>
                <td>{item.label}</td>
                <td>
                  <Input
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) => handleQuantityChange(idx, e.target.value)}
                    min="0"
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="2" className="text-right"><strong>Total</strong></td>
              <td><strong>{total}</strong></td>
            </tr>
          </tbody>
        </Table>
      </ModalBody>
      <ModalFooter>
        {formData.status === '0' && (
          <Button color="warning" onClick={() => updateTeaBill('1')}>Gate Out</Button>
        )}
        {formData.status === '1' && (
          <Button color="primary" onClick={() => updateTeaBill('2')}>Approve</Button>
        )}
        {formData.status >= '1' && (
          <Button color="success" onClick={() => window.print()}>Print</Button>
        )}
        <Button color="secondary" onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default TeaBillActionScreen;
