import React, { useState, useCallback } from 'react';
import { Form, Row, Col, Button, InputGroup, FormControl, Alert } from 'react-bootstrap';
import { SlCloudUpload } from "react-icons/sl";
import { useDispatch, useSelector } from 'react-redux';
import { registerClub } from '../../../../redux/thunks';
import { ButtonLoading } from '../../../../helpers/loading/Loaders';

const Images = ({ formData, onNext, onBack, updateFormData }) => {
    const dispatch = useDispatch();
    const { clubLoading, clubError } = useSelector(state => state.club);
    const [previewImages, setPreviewImages] = useState([]);
    const MAX_IMAGES = 10;

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        // Check if adding these files would exceed the limit
        if (previewImages.length + files.length > MAX_IMAGES) {
            alert(`You can upload a maximum of ${MAX_IMAGES} images.`);
            return;
        }

        const newPreviewImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setPreviewImages([...previewImages, ...newPreviewImages]);
    };

    const removeImage = (index) => {
        const newPreviewImages = [...previewImages];
        URL.revokeObjectURL(newPreviewImages[index].preview);
        newPreviewImages.splice(index, 1);
        setPreviewImages(newPreviewImages);
    };


    const handleBusinessHoursChange = (day, field, value) => {
        updateFormData({
            businessHours: {
                ...formData.businessHours,
                [day]: {
                    ...formData.businessHours[day],
                    [field]: value
                }
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.termsAccepted) {
            alert('Please accept the Terms and Conditions.');
            return;
        }

        // Prepare FormData for API call
        const apiFormData = new FormData();

        // Add venue details
        apiFormData.append('clubName', formData.courtName);
        apiFormData.append('courtType',
            `${formData.courtTypes.indoor ? 'Indoor' : ''}${formData.courtTypes.indoor && formData.courtTypes.outdoor ? '/' : ''}${formData.courtTypes.outdoor ? 'Outdoor' : ''}`
        );
        apiFormData.append('courtCount', formData.courtCount);
        apiFormData.append('city', formData.city);
        apiFormData.append('state', formData.state);
        apiFormData.append('zipCode', formData.zip);
        apiFormData.append('address', formData.address);
        // apiFormData.append('description', 'test');
        apiFormData.append('location[coordinates][0]', '50.90');
        apiFormData.append('location[coordinates][1]', '80.09');

        // Add features
        Object.entries(formData.features).forEach(([key, value]) => {
            if (value) apiFormData.append('features', key);
        });

        // Add business hours
        apiFormData.append('businessHours', JSON.stringify(
            Object.entries(formData.businessHours).map(([day, times]) => ({
                time: `${times.start} - ${times.end}`,
                day,
            }))
        ));

        // Add images
        previewImages.forEach((image, index) => {
            apiFormData.append(`image`, image.file);
        });

        try {
            await dispatch(registerClub(apiFormData)).unwrap();
            onNext();
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };



    // Helper function to convert AM/PM to 24-hour format for the input
    const convertAmPmTo24Hour = (timeStr) => {
        if (!timeStr) return '';

        try {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':');

            // Ensure hours is a string
            hours = hours.toString();

            if (hours === '12') hours = '00';
            if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();

            return `${hours.padStart(2, '0')}:${minutes}`;
        } catch (error) {
            console.error('Error converting AM/PM to 24-hour:', error);
            return '';
        }
    };

    // Helper function to convert 24-hour to AM/PM format for storage
    const convert24HourToAmPm = (timeStr) => {
        if (!timeStr) return '';

        try {
            let [hours, minutes] = timeStr.split(':');
            hours = parseInt(hours, 10);
            const modifier = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;

            return `${hours.toString().padStart(2, '0')}:${minutes} ${modifier}`;
        } catch (error) {
            console.error('Error converting 24-hour to AM/PM:', error);
            return '';
        }
    };
    const renderBusinessHours = () => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        return days.map((day) => {
            // Safely get times with fallbacks
            const dayHours = formData.businessHours[day] || { start: '06:00 AM', end: '11:00 PM' };
            const startTime24 = convertAmPmTo24Hour(dayHours.start);
            const endTime24 = convertAmPmTo24Hour(dayHours.end);

            return (
                <Row key={day} className="align-items-center mb-1 ms-3">
                    <Col md={3}><span style={{ fontSize: '14px' }}>{day}</span></Col>
                    <Col md={4}>
                        <InputGroup>
                            <FormControl
                                type="time"
                                value={startTime24}
                                onChange={(e) => {
                                    const amPmTime = convert24HourToAmPm(e.target.value);
                                    handleBusinessHoursChange(day, 'start', amPmTime);
                                }}
                                style={{
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB',
                                    fontSize: '14px',
                                    backgroundColor: '#fff',
                                }}
                                className='py-0 px-2'
                            />
                        </InputGroup>
                    </Col>
                    <Col md={1} style={{ textAlign: 'center' }}>To</Col>
                    <Col md={4}>
                        <InputGroup>
                            <FormControl
                                type="time"
                                value={endTime24}
                                onChange={(e) => {
                                    const amPmTime = convert24HourToAmPm(e.target.value);
                                    handleBusinessHoursChange(day, 'end', amPmTime);
                                }}
                                style={{
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB',
                                    fontSize: '14px',
                                    backgroundColor: '#fff',
                                }}
                                className='py-0 px-2'
                            />
                        </InputGroup>
                    </Col>
                </Row>
            );
        });
    };

    return (
        <div className="border-top small">
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={6}>
                        <h5 style={{ fontWeight: 700, color: '#1F2937' }} className='my-3'>Upload Club Images</h5>

                        {/* Image preview gallery */}
                        {previewImages.length > 0 && (
                            <div className="mb-3">
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {previewImages.map((image, index) => (
                                        <div key={index} style={{ position: 'relative' }} className='mb-2'>
                                            <img
                                                src={image.preview}
                                                alt={`Preview ${index}`}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    border: '1px solid #E5E7EB'
                                                }}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage(index);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-8px',
                                                    right: '-8px',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '20px',
                                                    height: '20px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <Alert variant="info" className="py-2">
                                    <small>
                                        {previewImages.length}/{MAX_IMAGES} images selected
                                        {previewImages.length === 0 && ' - Please select at least 1 image'}
                                    </small>
                                </Alert>
                            </div>
                        )}

                        {/* Upload dropzone */}
                        {previewImages.length !== MAX_IMAGES &&
                            <div
                                style={{
                                    border: `2px dashed ${previewImages.length === 0 ? '#EF4444' : '#E5E7EB'}`,
                                    borderRadius: '12px',
                                    padding: previewImages.length > 0 ? '10px' : '50px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    backgroundColor: previewImages.length === 0 ? '#FEF2F2' : '#fff',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => document.getElementById('clubImagesInput').click()}
                            >
                                <SlCloudUpload size={previewImages.length > 0 ? 40 : 80}
                                    color={previewImages.length === 0 ? '#EF4444' : '#6B7280'} />
                                <p style={{
                                    marginTop: '10px',
                                    fontSize: '16px',
                                    color: previewImages.length === 0 ? '#EF4444' : '#1F2937',
                                    fontWeight: 500
                                }}>
                                    {previewImages.length === 0
                                        ? 'Click to upload images (required)'
                                        : 'Click to add more images'}
                                </p>
                                <p style={{ fontSize: '12px', color: '#6B7280' }}>
                                    PNG, JPG, GIF up to 2MB each (max {MAX_IMAGES} images)
                                </p>
                                <input
                                    type="file"
                                    id="clubImagesInput"
                                    multiple
                                    accept="image/png,image/jpeg,image/gif"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                            </div>}
                    </Col>

                    <Col md={6}>
                        <h5 style={{ fontWeight: 700, color: '#1F2937' }} className='my-3 ms-3'>Business Hours</h5>
                        {renderBusinessHours()}
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col>
                        <Form.Check
                            type="checkbox"
                            id="termsCheckbox"
                            checked={formData.termsAccepted}
                            onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
                            label={
                                <span style={{ fontSize: '14px', color: '#1F2937', fontWeight: 500 }}>
                                    I agree to the{' '}
                                    <a href="#" style={{ color: '#22C55E', textDecoration: 'underline' }}>
                                        Terms and conditions
                                    </a>{' '}
                                    and{' '}
                                    <a href="#" style={{ color: '#22C55E', textDecoration: 'underline' }}>
                                        Privacy policy
                                    </a>
                                </span>
                            }
                        />
                    </Col>
                </Row>

                <div className="d-flex justify-content-between mt-4">
                    <span onClick={onBack} style={{ color: '#1F2937', fontWeight: 600, cursor: 'pointer' }} className='d-flex align-items-center'>
                        <i className="bi bi-arrow-left-short fs-4 fw-bold"></i>Back
                    </span>
                    <Button
                        type="submit"
                        style={{
                            backgroundColor: '#22C55E',
                            border: 'none',
                            borderRadius: '30px',
                            padding: '10px 30px',
                            fontWeight: 600,
                            fontSize: '16px',
                            color: '#fff',
                        }}
                        disabled={previewImages.length === 0}
                    >
                        {clubLoading ? <ButtonLoading /> : 'Next'}
                    </Button>
                </div>            </Form>
        </div>
    );
};

export default Images;