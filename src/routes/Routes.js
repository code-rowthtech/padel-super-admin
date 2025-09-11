import { BrowserRouter } from 'react-router-dom';
import { AllRoutes } from './index';
import NetworkHandler from '../helpers/network/NetworkHandler';
import AppWrapper from '../AppWrapper';

const Routes = () => (
    <BrowserRouter future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
    }}>
        <NetworkHandler>
            <AppWrapper>
                <AllRoutes />
            </AppWrapper>
        </NetworkHandler>
    </BrowserRouter>
);

export default Routes;