import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { BsInfoCircle } from 'react-icons/bs';
import { FiUpload, FiEye } from 'react-icons/fi';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createLeague, updateLeague } from '../../../redux/admin/league/thunk';
import { getOwnerFromSession } from '../../../helpers/api/apiCore';

const BasicInformation = ({ onNext }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { states, clubs: clubsList, loading, sponsorCategories, currentLeague } = useSelector(state => state.league);

    const [formData, setFormData] = useState({ leagueName: '', stateId: '', startDate: '', sportType: 'padel', seasonType: '' });
    const [clubs, setClubs] = useState([{ name: '', location: '' }]);
    const [sponsors, setSponsors] = useState([{ title: '', name: '', category: '', image: null, url: '' }]);
    const [titleSponsorBanner, setTitleSponsorBanner] = useState(null);
    const [mobileBanner, setMobileBanner] = useState(null);
    const [webBanner, setWebBanner] = useState(null);
    const [errors, setErrors] = useState({});

    // Reset form when switching between create/update modes
    useEffect(() => {
        if (!id) {
            // Reset to initial state for create mode
            setFormData({ leagueName: '', stateId: '', startDate: '', sportType: 'padel', seasonType: '' });
            setClubs([{ name: '', location: '' }]);
            setSponsors([{ title: '', name: '', category: '', image: null, url: '' }]);
            setTitleSponsorBanner(null);
            setMobileBanner(null);
            setWebBanner(null);
            setErrors({});
        }
    }, [id]);

    useEffect(() => {
        if (currentLeague && id) {
            setFormData({
                leagueName: currentLeague.leagueName || '',
                stateId: currentLeague.stateId?._id || currentLeague.stateId || '',
                startDate: currentLeague.startDate ? new Date(currentLeague.startDate).toISOString().split('T')[0] : '',
                sportType: currentLeague.sportType || 'padel',
                seasonType: currentLeague.seasonType || ''
            });

            if (currentLeague.mobileBanner) setMobileBanner(currentLeague.mobileBanner);
            if (currentLeague.webBanner) setWebBanner(currentLeague.webBanner);
            if (currentLeague.titleSponsor?.titleSponsorBanner) setTitleSponsorBanner(currentLeague.titleSponsor.titleSponsorBanner);

            if (currentLeague.clubs?.length > 0) {
                setClubs(currentLeague.clubs.map(club => ({
                    name: club.clubId?._id || club.clubId || '',
                    location: club.clubId?.locations?.[0]?.state || '',
                    ownerId: club.ownerId || ''
                })));
            }

            const allSponsors = [];
            if (currentLeague.titleSponsor?.name) {
                allSponsors.push({
                    title: 'Title',
                    name: currentLeague.titleSponsor.name,
                    category: currentLeague.titleSponsor.categoryId || '',
                    image: currentLeague.titleSponsor.logo || null,
                    url: currentLeague.titleSponsor.url || ''
                });
            }
            if (currentLeague.sponsors?.length > 0) {
                currentLeague.sponsors.forEach(sponsor => {
                    allSponsors.push({
                        title: '',
                        name: sponsor.name,
                        category: sponsor.categoryId || '',
                        image: sponsor.logo || null,
                        url: sponsor.url || ''
                    });
                });
            }
            if (allSponsors.length > 0) setSponsors(allSponsors);
        } else if (!id) {
            // Ensure clean state for create mode
            setFormData({ leagueName: '', stateId: '', startDate: '', sportType: 'padel', seasonType: '' });
            setClubs([{ name: '', location: '' }]);
            setSponsors([{ title: '', name: '', category: '', image: null, url: '' }]);
            setTitleSponsorBanner(null);
            setMobileBanner(null);
            setWebBanner(null);
            setErrors({});
        }
    }, [currentLeague, id]);

    const handleClubChange = (index, clubId) => {
        const selectedClub = clubsList.find(c => c._id === clubId);
        const updated = [...clubs];
        updated[index] = {
            name: clubId,
            location: selectedClub?.stateId?.name || '',
            ownerId: selectedClub?.ownerId || ''
        };
        setClubs(updated);
    };

    const handleSponsorChange = (index, field, value) => {
        const updated = [...sponsors];
        updated[index][field] = value;
        setSponsors(updated);
    };

    const validateForm = () => {
        const newErrors = {};

        // Basic form validation
        if (!formData.leagueName.trim()) {
            newErrors.leagueName = 'League name is required';
        }
        if (!formData.stateId) {
            newErrors.stateId = 'Location is required';
        }
        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        }

        // Club validation - at least one club is required
        const validClubs = clubs.filter(club => club.name.trim());
        if (validClubs.length === 0) {
            newErrors.clubs = 'At least one club is required';
        }

        // Sponsor validation
        const tier1Sponsors = [];
        sponsors.forEach((sponsor, index) => {
            if (sponsor.name.trim()) {
                if (!sponsor.category) {
                    newErrors[`sponsor_${index}_category`] = 'Category is required when sponsor name is entered';
                }
                if (!sponsor.image) {
                    newErrors[`sponsor_${index}_image`] = 'Logo is required when sponsor name is entered';
                }

                // Check for Tier 1 sponsors
                if (sponsor.category) {
                    const selectedCategory = sponsorCategories.find(cat => cat._id === sponsor.category);
                    if (selectedCategory && selectedCategory.name === 'Tier 1') {
                        tier1Sponsors.push(index);
                    }
                }
            }
        });

        // Validate only one Tier 1 sponsor is allowed
        if (tier1Sponsors.length > 1) {
            tier1Sponsors.forEach(index => {
                newErrors[`sponsor_${index}_tier1`] = 'Only one Tier 1 sponsor is allowed';
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const formDataPayload = new FormData();
        if (id) {
            formDataPayload.append('id', id);
            Object.keys(currentLeague).forEach(key => {
                const value = currentLeague[key];
                if (![
                    '_id',
                    '__v',
                    'createdAt',
                    'updatedAt',
                    'clubs',
                    'titleSponsor',
                    'sponsors',
                    'stateId',
                    'leagueName',
                    'startDate',
                    'sportType',
                    'seasonType',
                    'registration',
                    'priceDistribution',
                    'bounty',
                    'teamOfLeague',
                    'matchRules'
                ].includes(key)) {
                    if (value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
                        if (typeof value === 'object' && !Array.isArray(value)) {
                            Object.keys(value).forEach(subKey => {
                                const subValue = value[subKey];
                                if (subValue !== null && subValue !== undefined && subValue !== '') {
                                    if (typeof subValue === 'object') {
                                        Object.keys(subValue).forEach(nestedKey => {
                                            if (subValue[nestedKey] !== null && subValue[nestedKey] !== undefined && subValue[nestedKey] !== '') {
                                                formDataPayload.append(`${key}[${subKey}][${nestedKey}]`, subValue[nestedKey]);
                                            }
                                        });
                                    } else {
                                        formDataPayload.append(`${key}[${subKey}]`, subValue);
                                    }
                                }
                            });
                        } else if (!Array.isArray(value)) {
                            formDataPayload.append(key, value);
                        }
                    }
                }
            });
        }

        formDataPayload.append('leagueName', formData.leagueName);
        formDataPayload.append('stateId', formData.stateId);
        formDataPayload.append('startDate', formData.startDate);
        formDataPayload.append('sportType', formData.sportType);
        if (formData.seasonType) formDataPayload.append('seasonType', formData.seasonType);
        if (mobileBanner instanceof File) formDataPayload.append('mobileBanner', mobileBanner);
        if (webBanner instanceof File) formDataPayload.append('webBanner', webBanner);

        // clubs.filter(c => c.name).forEach((club, index) => {
        //     formDataPayload.append(`clubs[${index}][clubId]`, club.name);
        //     if (club.ownerId) formDataPayload.append(`clubs[${index}][ownerId]`, club.ownerId);
        // });
        clubs.filter(c => c.name).forEach((club, index) => {
            formDataPayload.append(`clubs[${index}][clubId]`, club.name);

            if (club.ownerId) {
                formDataPayload.append(`clubs[${index}][ownerId]`, club.ownerId);
            }

            // Preserve existing participation limits
            const existingClub = currentLeague?.clubs?.[index];

            if (
                existingClub?.participationLimit?.categoryLimits &&
                existingClub.participationLimit.categoryLimits.length > 0
            ) {
                existingClub.participationLimit.categoryLimits.forEach((limit, catIndex) => {
                    formDataPayload.append(
                        `clubs[${index}][participationLimit][categoryLimits][${catIndex}][categoryType]`,
                        limit.categoryType
                    );

                    formDataPayload.append(
                        `clubs[${index}][participationLimit][categoryLimits][${catIndex}][maxParticipants]`,
                        limit.maxParticipants
                    );
                });
            }
        });
        if (sponsors[0]?.name) {
            formDataPayload.append('titleSponsor[name]', sponsors[0].name);
            if (sponsors[0].category) formDataPayload.append('titleSponsor[categoryId]', sponsors[0].category);
            if (sponsors[0].url) formDataPayload.append('titleSponsor[url]', sponsors[0].url);
            if (sponsors[0].image instanceof File) {
                formDataPayload.append('titleSponsorLogo', sponsors[0].image);
            } else if (sponsors[0].image && typeof sponsors[0].image === 'string') {
                formDataPayload.append('titleSponsor[logo]', sponsors[0].image);
            }
            if (titleSponsorBanner instanceof File) {
                formDataPayload.append('titleSponsorBanner', titleSponsorBanner);
            } else if (titleSponsorBanner && typeof titleSponsorBanner === 'string') {
                formDataPayload.append('titleSponsor[titleSponsorBanner]', titleSponsorBanner);
            }
        }

        sponsors.slice(1).filter(s => s.name).forEach((sponsor, index) => {
            formDataPayload.append(`sponsors[${index}][name]`, sponsor.name);
            if (sponsor.category) formDataPayload.append(`sponsors[${index}][categoryId]`, sponsor.category);
            if (sponsor.url) formDataPayload.append(`sponsors[${index}][url]`, sponsor.url);
            if (sponsor.image instanceof File) {
                formDataPayload.append(`sponsorLogo_${index}`, sponsor.image);
            } else if (sponsor.image && typeof sponsor.image === 'string') {
                formDataPayload.append(`sponsors[${index}][logo]`, sponsor.image);
            }
        });

        if (id) {
            const result = await dispatch(updateLeague({ leagueData: formDataPayload }));
            if (result.meta.requestStatus === 'fulfilled') onNext();
        } else {
            const owner = getOwnerFromSession();
            formDataPayload.append('ownerId', owner?.ownerId || owner?._id);
            const result = await dispatch(createLeague(formDataPayload));
            if (result.meta.requestStatus === 'fulfilled') {
                const newLeagueId = result.payload?.data?._id || result.payload?.id;
                if (newLeagueId) {
                    navigate(`/admin/new-league/${newLeagueId}`, { state: { step: 1 }, replace: true });
                } else {
                    onNext();
                }
            }
        }
    };

    return (
        <div className='h-100 overflow-hidden'>
            <div className='px-1' style={{ height: '90%', overflowX: 'hidden', overflowY: 'scroll' }}>
                <div className="d-flex align-items-center mb-4">
                    <h5 className="mb-0 fw-semibold">League Information</h5>
                </div>

                <Row className="mb-0">
                    <Col md={6}>
                        <Form.Group >
                            <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>League Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter League Name"
                                value={formData.leagueName}
                                onChange={(e) => {
                                    setFormData({ ...formData, leagueName: e.target.value });
                                    if (errors.leagueName) {
                                        setErrors({ ...errors, leagueName: '' });
                                    }
                                }}
                                style={{
                                    backgroundColor: '#F3F4F6',
                                    border: errors.leagueName ? '1px solid #dc3545' : 'none',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    fontSize: '14px'
                                }}
                            />
                            <div style={{ minHeight: '16px', marginTop: '2px' }}>
                                {errors.leagueName && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.leagueName}</div>}
                            </div>
                        </Form.Group>
                        <Row className="mb-0">
                            <Col md={6} >
                                <Form.Group>
                                    <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Location <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={formData.stateId}
                                        onChange={(e) => {
                                            setFormData({ ...formData, stateId: e.target.value });
                                            if (errors.stateId) {
                                                setErrors({ ...errors, stateId: '' });
                                            }
                                        }}
                                        style={{
                                            backgroundColor: '#F3F4F6',
                                            border: errors.stateId ? '1px solid #dc3545' : 'none',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option>Select Location</option>
                                        {Array.isArray(states) && states.map(state => (
                                            <option key={state._id} value={state._id}>{state.name}</option>
                                        ))}
                                    </Form.Select>
                                    <div style={{ minHeight: '16px', marginTop: '2px' }}>
                                        {errors.stateId && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.stateId}</div>}
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6} >
                                <Form.Group>
                                    <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Start Date <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => {
                                            setFormData({ ...formData, startDate: e.target.value });
                                            if (errors.startDate) {
                                                setErrors({ ...errors, startDate: '' });
                                            }
                                        }}
                                        style={{
                                            backgroundColor: '#F3F4F6',
                                            border: errors.startDate ? '1px solid #dc3545' : 'none',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            fontSize: '14px'
                                        }}
                                    />
                                    <div style={{ minHeight: '16px', marginTop: '2px' }}>
                                        {errors.startDate && <div className="text-danger" style={{ fontSize: '12px' }}>{errors.startDate}</div>}
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row >
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Sport Type</Form.Label>
                                    <Form.Select
                                        value={formData.sportType}
                                        onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
                                        style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }}
                                    >
                                        <option value="padel">Padel</option>
                                        <option value="pickle">Pickle</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Season Type</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Season Type"
                                        value={formData.seasonType}
                                        onChange={(e) => setFormData({ ...formData, seasonType: e.target.value })}
                                        style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Col>
                    <Col md={6} className="mb-3">
                        <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Upload Tournament banner</Form.Label>
                        <Row>
                            <Col xs={6}>
                                <input type="file" id="mobileBanner" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={(e) => setMobileBanner(e.target.files[0])} />
                                <div style={{ position: 'relative' }}>
                                    <div onClick={() => document.getElementById('mobileBanner').click()} style={{ border: '2px dashed #D1D5DB', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#FAFAFA', cursor: 'pointer' }}>
                                        <FiUpload size={24} color="#6B7280" />
                                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                                            <div style={{ color: '#1F41BB', fontWeight: '500' }}>Upload File</div>
                                            <div>or drag and drop</div>
                                            <div style={{ fontSize: '10px', marginTop: '4px' }}>PNG, JPEG up to 10 MB</div>
                                        </div>
                                        <small className='text-black fw-medium d-block mt-2'>{mobileBanner ? (mobileBanner.name || 'Mobile Banner') : 'Mobile Banner'}</small>
                                    </div>
                                    {mobileBanner && (
                                        <FiEye size={24} color="#1F41BB" style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', background: '#2b449c1e', borderRadius: '50%', padding: '4px' }} onClick={(e) => { e.stopPropagation(); window.open(mobileBanner instanceof File ? URL.createObjectURL(mobileBanner) : mobileBanner, '_blank'); }} />
                                    )}
                                </div>
                            </Col>
                            <Col xs={6}>
                                <input type="file" id="webBanner" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={(e) => setWebBanner(e.target.files[0])} />
                                <div style={{ position: 'relative' }}>
                                    <div onClick={() => document.getElementById('webBanner').click()} style={{ border: '2px dashed #D1D5DB', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#FAFAFA', cursor: 'pointer' }}>
                                        <FiUpload size={24} color="#6B7280" />
                                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                                            <div style={{ color: '#1F41BB', fontWeight: '500' }}>Upload File</div>
                                            <div>or drag and drop</div>
                                            <div style={{ fontSize: '10px', marginTop: '4px' }}>PNG, JPEG up to 10 MB</div>
                                        </div>
                                        <small className='text-black fw-medium d-block mt-2'>{webBanner ? (webBanner.name || 'Web Banner') : 'Web Banner'}</small>
                                    </div>
                                    {webBanner && (
                                        <FiEye size={24} color="#1F41BB" style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', background: '#2b449c1e', borderRadius: '50%', padding: '4px' }} onClick={(e) => { e.stopPropagation(); window.open(webBanner instanceof File ? URL.createObjectURL(webBanner) : webBanner, '_blank'); }} />
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <hr />
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="mb-0 fw-semibold">Club Selection <span className="text-danger">*</span></h5>
                    <button className="d-flex align-items-center position-relative p-0 border-0" style={{ borderRadius: "20px 10px 10px 20px", background: "none", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", flexShrink: 0 }} onClick={() => setClubs([...clubs, { name: '', location: '' }])}>
                        <div className="p-md-1 p-2 rounded-circle bg-light" style={{ position: "relative", left: "10px" }}>
                            <div className="d-flex justify-content-center align-items-center text-white fw-bold" style={{ backgroundColor: "#1F41BB", width: "36px", height: "36px", borderRadius: "50%", fontSize: "20px" }}>
                                <span className="mb-1">+</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center fw-medium rounded-end-3" style={{ padding: "0 16px", height: "36px", fontSize: "14px", fontFamily: "Nunito, sans-serif", color: "#1F41BB", border: "1px solid #1F41BB" }}>Club</div>
                    </button>
                </div>
                {errors.clubs && <div className="text-danger" style={{ fontSize: '12px', marginBottom: '12px' }}>{errors.clubs}</div>}

                {clubs.map((club, index) => (
                    <Row key={index} className="mb-3 align-items-end">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Club Name <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    value={club.name}
                                    onChange={(e) => {
                                        handleClubChange(index, e.target.value);
                                        if (errors.clubs) {
                                            setErrors({ ...errors, clubs: '' });
                                        }
                                    }}
                                    style={{
                                        backgroundColor: '#F3F4F6',
                                        border: errors.clubs ? '1px solid #dc3545' : 'none',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option>Select Club</option>
                                    {Array.isArray(clubsList) && clubsList.map(clubItem => {
                                        const isSelected = clubs.some((c, i) => i !== index && c.name === clubItem._id);
                                        return (
                                            <option key={clubItem._id} value={clubItem._id} disabled={isSelected}>
                                                {clubItem.clubName} {isSelected ? '(Already Selected)' : ''}
                                            </option>
                                        );  
                                    })}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6} className='d-flex align-items-center gap-2'>
                            <Form.Group className='w-100'>
                                <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Location</Form.Label>
                                <Form.Control type="text" value={club.location} placeholder="City" readOnly style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }} />
                            </Form.Group>
                            {index > 0 && <RiDeleteBin6Fill className='text-danger mt-4' style={{ cursor: "pointer" }} size={20} onClick={() => setClubs(clubs.filter((_, i) => i !== index))} />}
                        </Col>
                    </Row>
                ))}

                <hr />

                <div className="d-flex align-items-center justify-content-between mb-3 mt-4">
                    <div className="d-flex align-items-center">
                        <h5 className="mb-0 fw-semibold">Sponsors</h5>
                        <span style={{ backgroundColor: '#E0E7FF', color: '#1F41BB', borderRadius: '12px', padding: '2px 12px', fontSize: '12px', fontWeight: '600', marginLeft: '12px' }}>Tier 1: Max 1 | Tier 2 & 3: Multiple</span>
                    </div>
                    <button className="d-flex align-items-center position-relative p-0 border-0" style={{ borderRadius: "20px 10px 10px 20px", background: "none", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", flexShrink: 0 }} onClick={() => setSponsors([...sponsors, { title: '', name: '', category: '', image: null, url: '' }])}>
                        <div className="p-md-1 p-2 rounded-circle bg-light" style={{ position: "relative", left: "10px" }}>
                            <div className="d-flex justify-content-center align-items-center text-white fw-bold" style={{ backgroundColor: "#1F41BB", width: "36px", height: "36px", borderRadius: "50%", fontSize: "20px" }}>
                                <span className="mb-1">+</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center fw-medium rounded-end-3" style={{ padding: "0 16px", height: "36px", fontSize: "14px", fontFamily: "Nunito, sans-serif", color: "#1F41BB", border: "1px solid #1F41BB" }}>Sponsor</div>
                    </button>
                </div>

                {sponsors.map((sponsor, index) => (
                    <div key={index}>
                        <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
                            {index === 0 ? 'Title Sponsor Name' : `Sponsor Name ${index}`}
                        </Form.Label>
                        <Row
                            className="mb-3"
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                            }}
                        >
                            {/* Sponsor Name */}
                            <Col md={3}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Name"
                                    value={sponsor.name}
                                    onChange={(e) => {
                                        handleSponsorChange(index, "name", e.target.value);

                                        if (!e.target.value.trim()) {
                                            const newErrors = { ...errors };
                                            delete newErrors[`sponsor_${index}_category`];
                                            delete newErrors[`sponsor_${index}_image`];
                                            setErrors(newErrors);
                                        }
                                    }}
                                    style={{
                                        backgroundColor: "#F3F4F6",
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "10px",
                                        fontSize: "14px",
                                        height: "44px",
                                    }}
                                />

                                <div style={{ minHeight: "16px", marginTop: "4px" }}></div>
                            </Col>

                            {/* Sponsor Category */}
                            <Col md={2}>
                                <Form.Select
                                    value={sponsor.category}
                                    onChange={(e) => {
                                        handleSponsorChange(index, "category", e.target.value);

                                        const newErrors = { ...errors };
                                        delete newErrors[`sponsor_${index}_category`];
                                        delete newErrors[`sponsor_${index}_tier1`];
                                        setErrors(newErrors);
                                    }}
                                    style={{
                                        backgroundColor: "#F3F4F6",
                                        border:
                                            errors[`sponsor_${index}_category`] ||
                                                errors[`sponsor_${index}_tier1`]
                                                ? "1px solid #dc3545"
                                                : "none",
                                        borderRadius: "8px",
                                        padding: "10px",
                                        fontSize: "14px",
                                        height: "44px",
                                    }}>
                                    <option value="">Select Category</option>
                                    {Array.isArray(sponsorCategories) &&
                                        sponsorCategories.map((cat) => {
                                            // For title sponsor (index 0), only show Tier 1
                                            if (index === 0 && cat?.name !== 'Tier 1') {
                                                return null;
                                            }
                                            // For other sponsors, show Tier 2 and Tier 3 only
                                            if (index > 0 && cat?.name === 'Tier 1') {
                                                return null;
                                            }
                                            return (
                                                <option key={cat?._id} value={cat?._id}>
                                                    {cat?.name}
                                                </option>
                                            );
                                        })}
                                </Form.Select>

                                <div style={{ minHeight: "16px", marginTop: "4px" }}>
                                    {errors[`sponsor_${index}_category`] && (
                                        <div className="text-danger" style={{ fontSize: "12px" }}>
                                            {errors[`sponsor_${index}_category`]}
                                        </div>
                                    )}

                                    {errors[`sponsor_${index}_tier1`] && (
                                        <div className="text-danger" style={{ fontSize: "12px" }}>
                                            {errors[`sponsor_${index}_tier1`]}
                                        </div>
                                    )}
                                </div>
                            </Col>

                            {/* URL */}
                            <Col md={3}>
                                <Form.Control
                                    type="text"
                                    placeholder="URL"
                                    value={sponsor.url || ''}
                                    onChange={(e) => handleSponsorChange(index, "url", e.target.value)}
                                    style={{
                                        backgroundColor: "#F3F4F6",
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "10px",
                                        fontSize: "14px",
                                        height: "44px",
                                    }}
                                />
                                <div style={{ minHeight: "16px", marginTop: "4px" }}></div>
                            </Col>

                            {/* Sponsor Logo & Banner (Combined) */}
                            <Col md={4}>
                                <Row className="g-2">
                                    {/* Sponsor Logo */}
                                    <Col xs={index === 0 ? 6 : 12}>
                                        <input
                                            type="file"
                                            id={`sponsorFile_${index}`}
                                            accept="image/png,image/jpeg"
                                            style={{ display: "none" }}
                                            onChange={(e) => {
                                                handleSponsorChange(index, "image", e.target.files[0]);
                                                if (errors[`sponsor_${index}_image`]) {
                                                    const newErrors = { ...errors };
                                                    delete newErrors[`sponsor_${index}_image`];
                                                    setErrors(newErrors);
                                                }
                                            }}
                                        />
                                        <div style={{ position: "relative" }}>
                                            <div
                                                onClick={() => document.getElementById(`sponsorFile_${index}`).click()}
                                                style={{
                                                    border: errors[`sponsor_${index}_image`] ? "2px dashed #dc3545" : "2px dashed #D1D5DB",
                                                    borderRadius: "8px",
                                                    padding: "8px",
                                                    textAlign: "center",
                                                    backgroundColor: "#FAFAFA",
                                                    cursor: "pointer",
                                                    height: "44px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "12px",
                                                    color: "#6B7280",
                                                }}
                                            >
                                                {sponsor.image ? sponsor.image.name || "Sponsor Logo" : "Sponsor Logo"}
                                            </div>
                                            {sponsor.image && (
                                                <FiEye
                                                    size={20}
                                                    color="#1F41BB"
                                                    style={{
                                                        position: "absolute",
                                                        top: "-8px",
                                                        right: "-8px",
                                                        cursor: "pointer",
                                                        background: "#e8edff",
                                                        borderRadius: "50%",
                                                        padding: "4px",
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(
                                                            sponsor.image instanceof File
                                                                ? URL.createObjectURL(sponsor.image)
                                                                : sponsor.image,
                                                            "_blank"
                                                        );
                                                    }}
                                                />
                                            )}
                                        </div>
                                        {errors[`sponsor_${index}_image`] && (
                                            <div className="text-danger" style={{ fontSize: "12px", marginTop: "4px" }}>
                                                {errors[`sponsor_${index}_image`]}
                                            </div>
                                        )}
                                    </Col>

                                    {/* Title Sponsor Banner - Only for first sponsor */}
                                    {index === 0 && (
                                        <Col xs={6}>
                                            <input
                                                type="file"
                                                id="titleSponsorBanner"
                                                accept="image/png,image/jpeg"
                                                style={{ display: "none" }}
                                                onChange={(e) => setTitleSponsorBanner(e.target.files[0])}
                                            />
                                            <div style={{ position: "relative" }}>
                                                <div
                                                    onClick={() => document.getElementById('titleSponsorBanner').click()}
                                                    style={{
                                                        border: "2px dashed #D1D5DB",
                                                        borderRadius: "8px",
                                                        padding: "8px",
                                                        textAlign: "center",
                                                        backgroundColor: "#FAFAFA",
                                                        cursor: "pointer",
                                                        height: "44px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "12px",
                                                        color: "#6B7280",
                                                    }}
                                                >
                                                    {titleSponsorBanner ? titleSponsorBanner.name || "Sponsor Banner" : "Sponsor Banner"}
                                                </div>
                                                {titleSponsorBanner && (
                                                    <FiEye
                                                        size={20}
                                                        color="#1F41BB"
                                                        style={{
                                                            position: "absolute",
                                                            top: "-8px",
                                                            right: "-8px",
                                                            cursor: "pointer",
                                                            background: "#e8edff",
                                                            borderRadius: "50%",
                                                            padding: "4px",
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(
                                                                titleSponsorBanner instanceof File
                                                                    ? URL.createObjectURL(titleSponsorBanner)
                                                                    : titleSponsorBanner,
                                                                "_blank"
                                                            );
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </Col>
                                    )}
                                </Row>
                            </Col>

                            {/* Delete Icon */}
                            <Col md="auto" className="d-flex align-items-start" style={{ paddingTop: "8px" }}>
                                {index > 0 && (
                                    <RiDeleteBin6Fill
                                        className="text-danger"
                                        style={{ cursor: "pointer" }}
                                        size={20}
                                        onClick={() => setSponsors(sponsors.filter((_, i) => i !== index))}
                                    />
                                )}
                            </Col>
                        </Row>
                    </div>
                ))}
            </div>

            <div style={{ height: '10%' }} className="text-end overflow-hidden mt-4">
                <button className='border-0 rounded-pill text-white py-2' disabled={loading} onClick={handleSubmit} style={{ backgroundColor: '#3DBE64', border: 'none', width: '10rem', fontSize: '16px', fontWeight: '600' }}>
                    {loading ? (id ? 'Updating...' : 'Creating...') : (id ? 'Update' : 'Next')}
                </button>
            </div>
        </div>
    );
};

export default BasicInformation;
