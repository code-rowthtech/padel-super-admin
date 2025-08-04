import { BrowserRouter } from 'react-router-dom';
import { AllRoutes } from './index';
import NetworkHandler from '../helpers/network/NetworkHandler';

const Routes = () => (
    <BrowserRouter future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
    }}>
        <NetworkHandler>
            <AllRoutes />
        </NetworkHandler>
    </BrowserRouter>
);

export default Routes;