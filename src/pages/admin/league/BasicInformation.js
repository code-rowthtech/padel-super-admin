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
    console.log({ currentLeague })

    const [formData, setFormData] = useState({ leagueName: '', stateId: '', startDate: '', sportType: 'padel', seasonType: '' });
    const [clubs, setClubs] = useState([{ name: '', location: '' }]);
    const [sponsors, setSponsors] = useState([{ title: '', name: '', category: '', image: null }]);
    const [mobileBanner, setMobileBanner] = useState(null);
    const [webBanner, setWebBanner] = useState(null);

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
                    image: currentLeague.titleSponsor.logo || null
                });
            }
            if (currentLeague.sponsors?.length > 0) {
                currentLeague.sponsors.forEach(sponsor => {
                    allSponsors.push({
                        title: '',
                        name: sponsor.name,
                        category: sponsor.categoryId || '',
                        image: sponsor.logo || null
                    });
                });
            }
            if (allSponsors.length > 0) setSponsors(allSponsors);
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

    const handleSubmit = async () => {
        if (!formData.leagueName || !formData.stateId || !formData.startDate) return;

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
            if (sponsors[0].image instanceof File) {
                formDataPayload.append('titleSponsorLogo', sponsors[0].image);
            } else if (sponsors[0].image && typeof sponsors[0].image === 'string') {
                formDataPayload.append('titleSponsor[logo]', sponsors[0].image);
            }
        }

        sponsors.slice(1).filter(s => s.name).forEach((sponsor, index) => {
            formDataPayload.append(`sponsors[${index}][name]`, sponsor.name);
            if (sponsor.category) formDataPayload.append(`sponsors[${index}][categoryId]`, sponsor.category);
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
            formDataPayload.append('status', 'draft');
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
                    <BsInfoCircle size={20} className="me-2" />
                    <h5 className="mb-0 fw-semibold">League Information</h5>
                </div>

                <Row className="mb-0">
                    <Col md={6} className="mb-3">
                        <Form.Group className='mb-3'>
                            <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>League Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter League Name"
                                value={formData.leagueName}
                                onChange={(e) => setFormData({ ...formData, leagueName: e.target.value })}
                                style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }}
                            />
                        </Form.Group>
                        <Row className="mb-4">
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Location <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={formData.stateId}
                                        onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                                        style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }}
                                    >
                                        <option>Select Location</option>
                                        {Array.isArray(states) && states.map(state => (
                                            <option key={state._id} value={state._id}>{state.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Start Date <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md={6} className="mb-3">
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
                            <Col md={6} className="mb-3">
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
                    <h5 className="mb-0 fw-semibold">Club Selection</h5>
                    <button className="d-flex align-items-center position-relative p-0 border-0" style={{ borderRadius: "20px 10px 10px 20px", background: "none", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", flexShrink: 0 }} onClick={() => setClubs([...clubs, { name: '', location: '' }])}>
                        <div className="p-md-1 p-2 rounded-circle bg-light" style={{ position: "relative", left: "10px" }}>
                            <div className="d-flex justify-content-center align-items-center text-white fw-bold" style={{ backgroundColor: "#1F41BB", width: "36px", height: "36px", borderRadius: "50%", fontSize: "20px" }}>
                                <span className="mb-1">+</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center fw-medium rounded-end-3" style={{ padding: "0 16px", height: "36px", fontSize: "14px", fontFamily: "Nunito, sans-serif", color: "#1F41BB", border: "1px solid #1F41BB" }}>Club</div>
                    </button>
                </div>

                {clubs.map((club, index) => (
                    <Row key={index} className="mb-3 align-items-end">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Club Name</Form.Label>
                                <Form.Select value={club.name} onChange={(e) => handleClubChange(index, e.target.value)} style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }}>
                                    <option>Select Club</option>
                                    {Array.isArray(clubsList) && clubsList.map(club => (
                                        <option key={club._id} value={club._id}>{club.clubName}</option>
                                    ))}
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
                        <span style={{ fontSize: '18px', marginRight: '8px' }}>🏆</span>
                        <h5 className="mb-0 fw-semibold">Sponsors</h5>
                        <span style={{ backgroundColor: '#E0E7FF', color: '#1F41BB', borderRadius: '12px', padding: '2px 12px', fontSize: '12px', fontWeight: '600', marginLeft: '12px' }}>UPTO: 20</span>
                    </div>
                    <button className="d-flex align-items-center position-relative p-0 border-0" style={{ borderRadius: "20px 10px 10px 20px", background: "none", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", flexShrink: 0 }} onClick={() => setSponsors([...sponsors, { title: '', name: '', category: '', image: null }])}>
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
                        <Row className="mb-3 align-items-end">
                            <Col md={4}>
                                <Form.Control type="text" placeholder="Enter Name" value={sponsor.name} onChange={(e) => handleSponsorChange(index, 'name', e.target.value)} style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }} />
                            </Col>
                            <Col md={4}>
                                <Form.Select value={sponsor.category} onChange={(e) => handleSponsorChange(index, 'category', e.target.value)} style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }}>
                                    <option value="">Select Category</option>
                                    {Array.isArray(sponsorCategories) && sponsorCategories.map(cat => (
                                        <option key={cat?._id} value={cat?._id}>{cat?.name}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={4} className='d-flex align-items-center gap-2'>
                                <input type="file" id={`sponsorFile_${index}`} accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={(e) => handleSponsorChange(index, 'image', e.target.files[0])} />
                                <div className='w-100' style={{ position: 'relative' }}>
                                    <div onClick={() => document.getElementById(`sponsorFile_${index}`).click()} style={{ border: '2px dashed #D1D5DB', borderRadius: '8px', padding: '12px', textAlign: 'center', backgroundColor: '#FAFAFA', cursor: 'pointer', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                            <FiUpload size={16} color="#6B7280" style={{ marginBottom: '4px' }} />
                                            <div>{sponsor.image ? (sponsor.image.name || 'Sponsor Logo') : 'Upload File or drag and drop'}</div>
                                            <div style={{ fontSize: '10px', marginTop: '4px' }}>(PNG, JPEG up to 10 MB)</div>
                                        </div>
                                    </div>
                                    {sponsor.image && (
                                        <FiEye size={24} color="#1F41BB" style={{ position: 'absolute', top: '8px', right: '8px', cursor: 'pointer', background: '#2b449c1e', borderRadius: '50%', padding: '4px' }} onClick={(e) => { e.stopPropagation(); window.open(sponsor.image instanceof File ? URL.createObjectURL(sponsor.image) : sponsor.image, '_blank'); }} />
                                    )}
                                </div>
                                {index > 0 && <RiDeleteBin6Fill className='text-danger' style={{ cursor: "pointer" }} size={20} onClick={() => setSponsors(sponsors.filter((_, i) => i !== index))} />}
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
