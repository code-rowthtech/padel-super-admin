import { BrowserRouter } from 'react-router-dom';
import { AllRoutes } from './index';
import NetworkHandler from '../helpers/network/NetworkHandler';
import AppWrapper from '../AppWrapper';
import { Suspense } from 'react';
import { Loading } from '../helpers/loading/Loaders';

const Routes = () => (
    <BrowserRouter future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
    }}>
        <NetworkHandler>
            <AppWrapper>
                <Suspense fallback={<Loading color="#3dbe64ff" />}>
                    <AllRoutes />
                </Suspense>
            </AppWrapper>
        </NetworkHandler>
    </BrowserRouter>
);

export default Routes;