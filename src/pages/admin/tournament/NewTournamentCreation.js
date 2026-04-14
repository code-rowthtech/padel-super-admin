import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import StepProgressTabs from '../../../helpers/StepProgressTabs';
import TournamentBasicInfo from './TournamentBasicInfo';
import TournamentCategories from './TournamentCategories';
import TournamentRules from './TournamentRules';
import { getTournamentById } from '../../../redux/admin/tournament/thunk';
import { clearCurrentTournament } from '../../../redux/admin/tournament/slice';
import { getStates } from '../../../redux/admin/league/thunk';
import { DataLoading } from '../../../helpers/loading/Loaders';

const NewTournament = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { loadingTournament } = useSelector(state => state.tournament);
  const [activeStep, setActiveStep] = useState(location.state?.step !== undefined ? location.state.step : 0);
  const steps = ['Basic Information', 'Categories & Registration', 'Rules & Settings'];

  useEffect(() => {
    if (location.state?.step !== undefined) {
      setActiveStep(location.state.step);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.step, location.pathname, navigate]);

  useEffect(() => {
    if (!id) dispatch(clearCurrentTournament());
    dispatch(getStates());
    if (id) dispatch(getTournamentById(id));
  }, [dispatch, id]);

  useEffect(() => {
    return () => { if (!id) dispatch(clearCurrentTournament()); };
  }, [dispatch, id]);

  return (
    <Container fluid className="p-4 pt-0 overflow-hidden bg-white" style={{ height: '90vh' }}>
      {loadingTournament ? (
        <DataLoading height="60vh" />
      ) : (
        <Row className="h-100">
          <Col style={{ height: '20%' }} sm={12} className="d-flex align-items-center">
            <StepProgressTabs steps={steps} activeStep={activeStep} onStepChange={setActiveStep} allowStepClick={true} />
          </Col>
          <Col style={{ height: '80%', overflowY: 'scroll' }} sm={12}>
            {activeStep === 0 && <TournamentBasicInfo onNext={() => setActiveStep(1)} key={id || 'create'} />}
            {activeStep === 1 && <TournamentCategories onNext={() => { if (id) dispatch(getTournamentById(id)); setActiveStep(2); }} onBack={() => setActiveStep(0)} key={id || 'create'} />}
            {activeStep === 2 && <TournamentRules onBack={() => setActiveStep(1)} key={id || 'create'} />}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default NewTournament;
