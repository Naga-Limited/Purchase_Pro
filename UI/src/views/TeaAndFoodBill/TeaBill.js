import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Table,
  FormGroup,
  Label,
  Input,
  Button
} from 'reactstrap';
import { errorToast, ShowToast } from '../../helper/appHelper';
import { apiBaseUrl } from '../../urlConstants';
import { CustomDropdownInput, CustomTextInput } from '../forms/custom-form';
import { apiPostMethod } from '@helpers/axiosHelper';
import { useSelector } from 'react-redux';
import confirmDialog from '../../@core/components/confirm/confirmDialog';

const TeaBill = () => {
  const [detailsList, setDetailsList] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const [form, setForm] = useState({
    vendorName: '',
    shift: '',
    inTime: '',
    outTime: '',
    // department:''
  });

  const currentDate = new Date().toISOString().split("T")[0];

  const handleInputChange = (e, field) => {
    setForm(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleVendorChange = (selectedOption) => {
    setForm(prev => ({
      ...prev,
      vendorName: selectedOption
    }));
  };

  const handleShiftChange = (selectedOption) => {
    setForm(prev => ({
      ...prev,
      shift: selectedOption
    }));
  };
  const handleDepartmentChange = (selectedOption) => {
    setForm(prev => ({
      ...prev,
      department: selectedOption
    }));
  };

  const handleQuantityChange = (index, value) => {
    const updated = [...quantities];
    updated[index] = value;
    setQuantities(updated);
  };

  const fetchTeaBillDefinitions = async () => {
    try {
      const response = await apiPostMethod(`${apiBaseUrl}GatePro/Master/getDefinitionsList/33`);
      const { data } = response;

      if (Array.isArray(data?.results) && data.results.length > 0) {
        const labels = data.results.map(item => item.label);
        setDetailsList(labels);
        setQuantities(Array(labels.length).fill('0'));
      } else {
        errorToast("No tea definitions found");
      }
    } catch (err) {
      console.error('Error fetching tea definitions:', err);
      errorToast("Failed to fetch tea details");
    }
  };

  useEffect(() => {
    fetchTeaBillDefinitions();
  }, []);

  const total = quantities.reduce((sum, val) => sum + Number(val || 0), 0);
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

  const handleSubmit = async () => {
    // ✅ Validation
    if (!form.vendorName || !form.shift  || !form.inTime || !form.outTime || quantities.some(q => q === '')) {
      errorToast("All fields including quantity are required");
      return;
    }

    const payload = {
      vendorId: form.vendorName.value,
      vendorName: form.vendorName.label,
      shiftId: form.shift.value,
      shiftName: form.shift.label,
      tea_cost: form.shift.tea_amount,
      // department:form.department.label,
      date: poDetailsData.postingDate || currentDate,
      inTime: form.inTime,
      outTime: form.outTime,
      total,
      gate_id:UserDetails.GATE_ID,
      userId:UserDetails.USERID,
      quantities: quantities.map((q, i) => ({
        detail: detailsList[i],
        qty: Number(q || 0)
      }))
    };

    try {
      const response = await apiPostMethod(`${apiBaseUrl}FoodTeaTokenController/insertTeaBill`, payload);
      if (response?.data?.success) {
        confirmDialog({
          title: `<h5><strong class="text-white">` + response?.data?.message  + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
      }).then(() => {
        setForm({ vendorName: '', shift: '', inTime: '', outTime: '' });
        setQuantities(Array(detailsList.length).fill('0'));
      });
        // Optional: reset form
       
      } else {
        confirmDialog({
          title: `<h5><strong class="text-white">` + response?.data?.message  + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#f50e0a`
      })
      }
    } catch (err) {
      console.error("Submission error:", err);
      errorToast("Error submitting tea bill");
    }
  };
  const [poDetailsData, setPoDetailsData] = useState({
    postingDate: '',
    invoiceDate: ''
  });
  const handleInputChange1 = (value, field) => {
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);
  
    const minDate = threeDaysAgo.toISOString().split("T")[0];
    const maxDate = today.toISOString().split("T")[0];
  
    // Clamp date within range
    if (value < minDate) value = minDate;
    if (value > maxDate) value = maxDate;
  
    setPoDetailsData(prev => ({
      ...prev,
      [field === 'posting' ? 'postingDate' : 'invoiceDate']: value
    }));
  };
  const handleKeyDown = (e) => {
    // Prevent typing anything manually in the input field
    e.preventDefault();
  };
  return (
    <Card>
      <CardHeader>
        <h5 className="text-center">TEA ISSUE SLIP</h5>
      </CardHeader>
      <CardBody>
        <Row className="mb-2">
          <Col md="4">
            <Label>Date</Label>
            {/* <Input type="date" value={currentDate} disabled /> */}
            <Input
                type="date"
                value={poDetailsData.postingDate || new Date().toISOString().split("T")[0]}
                min={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => handleInputChange1(e.target.value, 'posting')}
                onKeyDown={handleKeyDown}
            />
          </Col>

          <Col md="4">
            <FormGroup>
              <CustomDropdownInput
                url={`${apiBaseUrl}FoodTeaTokenController/getVendor/TEA`}
                label="Vendor Name"
                id="vendorName"
                form={{
                  values: { vendorName: form.vendorName },
                  setFieldValue: (_, val) => handleVendorChange(val),
                  setFieldTouched: () => {}
                }}
              />
            </FormGroup>
          </Col>    
          <Col md="4">
            <FormGroup>
              <CustomDropdownInput
                url={`${apiBaseUrl}FoodTeaTokenController/getShift`}
                label="Shift"
                id="shift"
                form={{
                  values: { shift: form.shift },
                  setFieldValue: (_, val) => handleShiftChange(val),
                  setFieldTouched: () => {}
                }}
              />
            </FormGroup>
          </Col>
          <Col md="4">
              <FormGroup>
                 <Label>In Time</Label>
                  <Input
                    type="time"
                    value={form.inTime}
                    onChange={(e) => handleInputChange(e, 'inTime')}
                  />
              </FormGroup>
          </Col>
          <Col md="4">
              <FormGroup>
                  <Label>Out Time</Label>
                  <Input
                    type="time"
                    value={form.outTime}
                    onChange={(e) => handleInputChange(e, 'outTime')}
                  />
              </FormGroup>
          </Col>
          {/* <Col md="4">
            <FormGroup>
              <CustomDropdownInput
                url={`${apiBaseUrl}GatePro/Master/getDefinitionsList/34`}
                label="department"
                id="department"
                form={{
                  values: { department: form.department },
                  setFieldValue: (_, val) => handleDepartmentChange(val),
                  setFieldTouched: () => {}
                }}
              />
            </FormGroup>
          </Col> */}
        </Row>

        <Table bordered>
          <thead className="text-center">
            <tr>
              <th style={{ width: '20px' }}>Sl.No</th>
              <th style={{ width: '100px' }}>Details</th>
              <th style={{ width: '50px' }}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {detailsList.map((label, idx) => (
              <tr key={idx}>
                <td className="text-center">{idx + 1}</td>
                <td>{label}</td>
                <td>
                  <Input
                    type="number"
                    value={quantities[idx] || ''}
                    onChange={(e) => handleQuantityChange(idx, e.target.value)}
                    min="0"
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="2" className="text-right"><strong>Total</strong></td>
              <td>
                <Input type="number" value={total} disabled />
              </td>
            </tr>
          </tbody>
        </Table>

        <Row className="justify-content-center mt-3">
          <Col md="4" className="text-center">
            <Button color="primary" onClick={handleSubmit}>Submit</Button>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default TeaBill;
