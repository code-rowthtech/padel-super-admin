import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import StepProgressTabs from '../../../helpers/StepProgressTabs';
import BasicInformation from './BasicInformation';
import StructureCategories from './StructureCategories';
import RuleSettings from './RuleSettings';
import { getStates, getClubsWithState, getSponsorCategories, getLeagueById } from '../../../redux/admin/league/thunk';

const NewLeague = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { loadingLeague, currentLeague } = useSelector(state => state.league);
    const [activeStep, setActiveStep] = useState(location.state?.step !== undefined ? location.state.step : 0);
    const steps = ['Basic Information', 'Structure & Categories', 'Rules & Settings'];

    useEffect(() => {
        if (location.state?.step !== undefined) {
            setActiveStep(location.state.step);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state?.step, location.pathname, navigate]);

    useEffect(() => {
        dispatch(getStates());
        dispatch(getClubsWithState());
        dispatch(getSponsorCategories());
        if (id) {
            dispatch(getLeagueById(id));
        }
    }, [dispatch, id]);

    return (
        <Container fluid className="p-4 pt-0 overflow-hidden bg-white" style={{ height: '90vh' }}>
            {loadingLeague && id && !currentLeague ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <Row className='h-100'>
                    <Col style={{ height: '20%' }} sm={12} className='d-flex align-items-center'>
                        <StepProgressTabs
                            steps={steps}
                            activeStep={activeStep}
                            onStepChange={setActiveStep}
                            allowStepClick={true}
                        />
                    </Col>
                    <Col style={{ height: '80%', overflowY: 'scroll' }} sm={12}>
                        {activeStep === 0 && <BasicInformation onNext={() => setActiveStep(1)} />}
                        {activeStep === 1 && <StructureCategories onNext={() => {
                            if (id) {
                                dispatch(getLeagueById(id));
                            }
                            setActiveStep(2);
                        }} onBack={() => setActiveStep(0)} />}
                        {activeStep === 2 && <RuleSettings onBack={() => setActiveStep(1)} />}
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default NewLeague;
