import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FiUpload, FiEdit2 } from 'react-icons/fi';
import { BsInfoCircle, BsArrowLeft, BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import StepProgressTabs from '../../../helpers/StepProgressTabs';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import RuleSettings from './RuleSettings';
import { LuPencilLine } from "react-icons/lu";


const NewLeague = () => {
    const [activeStep, setActiveStep] = useState(2);
    const [clubs, setClubs] = useState([{ name: '', location: '' }]);
    const [sponsors, setSponsors] = useState([{ title: '', name: '', category: '', image: null }]);
    const [showBasicInfo, setShowBasicInfo] = useState(false);
    const [categories, setCategories] = useState([{ name: 'Game Category', levelA: 2, levelB: 2, mixed: 2, female: 2 }]);

    const steps = ['Basic Information', 'Structure & Categories', 'Rules & Settings'];

    const addClub = () => setClubs([...clubs, { name: '', location: '' }]);
    const removeClub = (index) => setClubs(clubs.filter((_, i) => i !== index));

    const addSponsor = () => setSponsors([...sponsors, { title: '', name: '', category: '', image: null }]);
    const removeSponsor = (index) => setSponsors(sponsors.filter((_, i) => i !== index));
    const addCategory = () => setCategories([...categories, { name: 'Game Category', levelA: 2, levelB: 2, mixed: 2, female: 2 }]);
    const updateCategoryValue = (index, field, value) => {
        const updated = [...categories];
        updated[index][field] = Math.max(0, value);
        setCategories(updated);
    };

    return (
        <Container fluid className="p-4 bg-white" style={{ minHeight: '100vh' }}>
            <Row>
                <Col>
                    <div className="d-flex align-items-center mb-0">
                        <BsArrowLeft size={20} className="me-2" style={{ cursor: 'pointer' }} />
                        <h5 className="mb-0 fw-semibold">New League</h5>
                    </div>

                    <div className="mb-2">
                        <StepProgressTabs
                            steps={steps}
                            activeStep={activeStep}
                            onStepChange={setActiveStep}
                            allowStepClick={true}
                        />
                    </div>

                    {activeStep === 0 && (
                        <>
                            <div className="d-flex align-items-center mb-4">
                                <BsInfoCircle size={20} className="me-2" />
                                <h5 className="mb-0 fw-semibold">League Information</h5>
                            </div>

                            <Row className="mb-0">
                                <Col md={6} className="mb-3">
                                    <Form.Group className='mb-3'>
                                        <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>League Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter League Name"
                                            style={{
                                                backgroundColor: '#F3F4F6',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </Form.Group>
                                    <Row className="mb-4">
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Location</Form.Label>
                                                <Form.Select
                                                    style={{
                                                        backgroundColor: '#F3F4F6',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '12px',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    <option>Select Type</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Start Date</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="MM/DD/YY"
                                                    style={{
                                                        backgroundColor: '#F3F4F6',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '12px',
                                                        fontSize: '14px'
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Upload Tournament banner</Form.Label>
                                    <Row>
                                        <Col xs={6}>
                                            <div
                                                style={{
                                                    border: '2px dashed #D1D5DB',
                                                    borderRadius: '8px',
                                                    padding: '20px',
                                                    textAlign: 'center',
                                                    backgroundColor: '#FAFAFA',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FiUpload size={24} color="#6B7280" />
                                                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                                                    <div style={{ color: '#1F41BB', fontWeight: '500' }}>Upload File</div>
                                                    <div>or drag and drop</div>
                                                    <div style={{ fontSize: '10px', marginTop: '4px' }}>PNG, JPEG up to 10 MB</div>
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px' }}>Mobile Banner</div>
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <div
                                                style={{
                                                    border: '2px dashed #D1D5DB',
                                                    borderRadius: '8px',
                                                    padding: '20px',
                                                    textAlign: 'center',
                                                    backgroundColor: '#FAFAFA',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FiUpload size={24} color="#6B7280" />
                                                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                                                    <div style={{ color: '#1F41BB', fontWeight: '500' }}>Upload File</div>
                                                    <div>or drag and drop</div>
                                                    <div style={{ fontSize: '10px', marginTop: '4px' }}>PNG, JPEG up to 10 MB</div>
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px' }}>Web Banner</div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <hr />

                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h5 className="mb-0 fw-semibold">Club Selection</h5>
                                <button
                                    className="d-flex align-items-center position-relative p-0 border-0"
                                    style={{
                                        borderRadius: "20px 10px 10px 20px",
                                        background: "none",
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        flexShrink: 0,
                                    }}
                                    onClick={addClub}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = "0.9";
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = "1";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <div
                                        className="p-md-1 p-2 rounded-circle bg-light"
                                        style={{ position: "relative", left: "10px" }}
                                    >
                                        <div
                                            className="d-flex justify-content-center align-items-center text-white fw-bold"
                                            style={{
                                                backgroundColor: "#1F41BB",
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "50%",
                                                fontSize: "20px",
                                            }}
                                        >
                                            <span className="mb-1">+</span>
                                        </div>
                                    </div>
                                    <div
                                        className="d-flex align-items-center fw-medium rounded-end-3"
                                        style={{
                                            padding: "0 16px",
                                            height: "36px",
                                            fontSize: "14px",
                                            fontFamily: "Nunito, sans-serif",
                                            color: "#1F41BB", border: "1px solid #1F41BB"
                                        }}
                                    >
                                        Club
                                    </div>
                                </button>
                            </div>

                            {clubs.map((club, index) => (
                                <Row key={index} className="mb-3 align-items-end">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Club Name</Form.Label>
                                            <Form.Select
                                                style={{
                                                    backgroundColor: '#F3F4F6',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <option>Select Type</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className='d-flex align-items-center gap-2'>
                                        <Form.Group className='w-100'>
                                            <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Location</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="City"
                                                style={{
                                                    backgroundColor: '#F3F4F6',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </Form.Group>
                                        {index > 0 && (
                                            <RiDeleteBin6Fill className='text-danger mt-4' style={{ cursor: "pointer" }} size={25} onClick={() => removeClub(index)} />
                                        )}
                                    </Col>

                                </Row>
                            ))}
                            <hr />

                            <div className="d-flex align-items-center justify-content-between mb-3 mt-4">
                                <div className="d-flex align-items-center">
                                    <span style={{ fontSize: '18px', marginRight: '8px' }}>🏆</span>
                                    <h5 className="mb-0 fw-semibold">Sponsors</h5>
                                    <span
                                        style={{
                                            backgroundColor: '#E0E7FF',
                                            color: '#1F41BB',
                                            borderRadius: '12px',
                                            padding: '2px 12px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            marginLeft: '12px'
                                        }}
                                    >
                                        UPTO: 20
                                    </span>
                                </div>
                                <button
                                    className="d-flex align-items-center position-relative p-0 border-0"
                                    style={{
                                        borderRadius: "20px 10px 10px 20px",
                                        background: "none",
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        flexShrink: 0,
                                    }}
                                    onClick={addSponsor}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = "0.9";
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = "1";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <div
                                        className="p-md-1 p-2 rounded-circle bg-light"
                                        style={{ position: "relative", left: "10px" }}
                                    >
                                        <div
                                            className="d-flex justify-content-center align-items-center text-white fw-bold"
                                            style={{
                                                backgroundColor: "#1F41BB",
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "50%",
                                                fontSize: "20px",
                                            }}
                                        >
                                            <span className="mb-1">+</span>
                                        </div>
                                    </div>
                                    <div
                                        className="d-flex align-items-center fw-medium rounded-end-3"
                                        style={{
                                            padding: "0 16px",
                                            height: "36px",
                                            fontSize: "14px",
                                            fontFamily: "Nunito, sans-serif",
                                            color: "#1F41BB", border: "1px solid #1F41BB"
                                        }}
                                    >
                                        Sponsor
                                    </div>
                                </button>
                            </div>

                            {sponsors.map((sponsor, index) => (
                                <div key={index}>
                                    <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
                                        {index === 0 ? 'Title Sponsor Name' : `Sponsor Name ${index}`}
                                    </Form.Label>
                                    <Row className="mb-3 align-items-end">
                                        <Col md={4}>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter Name"
                                                style={{
                                                    backgroundColor: '#F3F4F6',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </Col>
                                        <Col md={4}>
                                            <Form.Select
                                                style={{
                                                    backgroundColor: '#F3F4F6',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <option>Select Category</option>
                                            </Form.Select>
                                        </Col>
                                        <Col md={4} className='d-flex align-items-center gap-2'>
                                            <div className='w-100'
                                                style={{
                                                    border: '2px dashed #D1D5DB',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    textAlign: 'center',
                                                    backgroundColor: '#FAFAFA',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    color: '#6B7280'
                                                }}
                                            >
                                                <FiUpload size={16} color="#6B7280" className="me-2" />
                                                Upload File or drag and drop <span style={{ fontSize: '10px' }}>(PNG, JPEG up to 10 MB)</span>
                                            </div>
                                            {index > 0 && (
                                                <RiDeleteBin6Fill className='text-danger ' style={{ cursor: "pointer" }} size={25} onClick={() => removeSponsor(index)} />
                                            )}
                                        </Col>
                                    </Row>
                                </div>
                            ))}

                            <div className="text-end mt-4">
                                <button className='border-0 rounded-pill text-white'
                                    style={{
                                        backgroundColor: '#3DBE64',
                                        border: 'none',
                                        padding: '12px 32px',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}
                                    onClick={() => setActiveStep(1)}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}

                    {activeStep === 1 && (
                        <>
                            <div className='p-2 rounded' style={{ backgroundColor: "#F1F5F94D" }}>
                                <div className="d-flex align-items-center mb-4">
                                    <BsInfoCircle size={20} className="me-2" />
                                    <h5 className="mb-0 fw-semibold">Players Registration / Fee</h5>
                                </div>

                                <Row className="mb-4">
                                    <Col md={4} className="mb-3">
                                        <Form.Group>
                                            <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Start Date</Form.Label>
                                            <Form.Control type="text" placeholder="MM/DD/YY" style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <Form.Group>
                                            <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>End Date</Form.Label>
                                            <Form.Control type="text" placeholder="MM/DD/YY" style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <Form.Group>
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: 0 }}>Registration fee</Form.Label>
                                                <style>
                                                    {`
                                                        .form-check-input:checked {
                                                            background-color: #34C759 !important;
                                                            border-color: #34C759 !important;
                                                            box-shadow: none !important;
                                                        }
                                                        .form-check-input:focus {
                                                            box-shadow: none !important;
                                                        }
                                                    `}
                                                </style>
                                                <Form.Check type="switch" id="registration-fee-switch" style={{ transform: 'scale(1.2)' }} />
                                            </div>
                                            <Form.Control type="text" placeholder="₹ 300" style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }} />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h5 className="mb-0 fw-semibold">Participation Limit</h5>
                                    <button className="d-flex align-items-center position-relative p-0 border-0" style={{ borderRadius: "20px 10px 10px 20px", background: "none", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", flexShrink: 0 }} onClick={addCategory}>
                                        <div className="p-md-1 p-2 rounded-circle bg-light" style={{ position: "relative", left: "10px" }}>
                                            <div className="d-flex justify-content-center align-items-center text-white fw-bold" style={{ backgroundColor: "#1F41BB", width: "36px", height: "36px", borderRadius: "50%", fontSize: "20px" }}>
                                                <span className="mb-1">+</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center fw-medium rounded-end-3" style={{ padding: "0 16px", height: "36px", fontSize: "14px", fontFamily: "Nunito, sans-serif", color: "#1F41BB", border: "1px solid #1F41BB" }}>
                                            Category
                                        </div>
                                    </button>
                                </div>

                                <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div className="d-flex align-items-center" style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                        <div style={{ flex: 1, padding: '12px 16px', fontWeight: '600', fontSize: '14px' }}>Game Category</div>
                                        <div style={{ width: '180px', padding: '12px 16px', fontWeight: '600', fontSize: '14px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>Level A <LuPencilLine size={14} className="ms-1" style={{ cursor: 'pointer' }} /></div>
                                        <div style={{ width: '180px', padding: '12px 16px', fontWeight: '600', fontSize: '14px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>Level B <LuPencilLine size={14} className="ms-1" style={{ cursor: 'pointer' }} /></div>
                                        <div style={{ width: '180px', padding: '12px 16px', fontWeight: '600', fontSize: '14px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>Mixed <LuPencilLine size={14} className="ms-1" style={{ cursor: 'pointer' }} /></div>
                                        <div style={{ width: '180px', padding: '12px 16px', fontWeight: '600', fontSize: '14px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>Female <LuPencilLine size={14} className="ms-1" style={{ cursor: 'pointer' }} /></div>
                                    </div>

                                    {categories.map((category, index) => (
                                        <div key={index} className="d-flex align-items-center" style={{ borderBottom: index < categories.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                                            <div style={{ flex: 1, padding: '12px 16px', fontSize: '14px' }}>Max Participants per club</div>
                                            <div style={{ width: '180px', padding: '12px 16px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>
                                                <div className="d-flex align-items-center justify-content-center shadow-sm gap-2 ps-0 pe-0 p-2 rounded-3" style={{ backgroundColor: "#F1F5F94D" }}>
                                                    <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(index, 'levelA', category.levelA - 1)}><AiOutlineMinus size={14} /></Button>
                                                    <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '500' }}>{category.levelA}</span>
                                                    <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(index, 'levelA', category.levelA + 1)}><AiOutlinePlus size={14} /></Button>
                                                </div>
                                            </div>
                                            <div style={{ width: '180px', padding: '12px 16px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>
                                                <div className="d-flex align-items-center justify-content-center shadow-sm gap-2 ps-0 pe-0 p-2 rounded-3" style={{ backgroundColor: "#F1F5F94D" }}>
                                                    <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(index, 'levelB', category.levelB - 1)}><AiOutlineMinus size={14} /></Button>
                                                    <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '500' }}>{category.levelB}</span>
                                                    <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(index, 'levelB', category.levelB + 1)}><AiOutlinePlus size={14} /></Button>
                                                </div>
                                            </div>
                                            <div style={{ width: '180px', padding: '12px 16px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>
                                                <div className="d-flex align-items-center justify-content-center shadow-sm gap-2 ps-0 pe-0 p-2 rounded-3" style={{ backgroundColor: "#F1F5F94D" }}>
                                                    <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(index, 'mixed', category.mixed - 1)}><AiOutlineMinus size={14} /></Button>
                                                    <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '500' }}>{category.mixed}</span>
                                                    <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(index, 'mixed', category.mixed + 1)}><AiOutlinePlus size={14} /></Button>
                                                </div>
                                            </div>
                                            <div style={{ width: '180px', padding: '12px 16px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>
                                                <div className="d-flex align-items-center justify-content-center shadow-sm gap-2 ps-0 pe-0 p-2 rounded-3" style={{ backgroundColor: "#F1F5F94D" }}>
                                                    <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(index, 'female', category.female - 1)}><AiOutlineMinus size={14} /></Button>
                                                    <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '500' }}>{category.female}</span>
                                                    <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(index, 'female', category.female + 1)}><AiOutlinePlus size={14} /></Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="d-flex justify-content-end gap-3 mt-4">
                                <button className='border-0 rounded-pill' style={{ backgroundColor: '#E5E7EB', color: '#374151', padding: '12px 32px', fontSize: '16px', fontWeight: '600' }} onClick={() => setActiveStep(0)}>Back</button>
                                <button className='border-0 rounded-pill text-white' style={{ backgroundColor: '#3DBE64', padding: '12px 32px', fontSize: '16px', fontWeight: '600' }} onClick={() => setActiveStep(2)}>Next</button>
                            </div>
                        </>
                    )}

                    {activeStep === 2 && (
                        <RuleSettings onBack={() => setActiveStep(1)} />
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default NewLeague;
