// import './styles/globals.css'
// import "bootstrap/dist/css/bootstrap.min.css"
// import 'bootstrap-icons/font/bootstrap-icons.css';
import { Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import StateChange from './redux/StateChange';
import useCall, { CallProvider } from './service/CallProvider';
import Header from './components/Header';
import AudioCall from './components/AudioCall';
import store from "./redux/store";
import app from "./firebase";
import React from 'react'

function App() {
    return (
        <Provider store={store}>
            <StateChange>
                <CallProvider>
                    <div className="d-flex h-100 flex-column">
                        <Header />
                        <CallWrapper>
                            <Outlet />
                        </CallWrapper>
                    </div>
                </CallProvider>
            </StateChange>
        </Provider>
    )
}

function CallWrapper({ children }) {
    const { call } = useCall()

    return (
        <div className='h-100'>
            <div className={`${(call.calling || call.ringing) ? "d-block" : "d-none"} h-100`}>
                <AudioCall />
            </div>
            <div className={`${(call.calling || call.ringing) ? "d-none" : "d-block"} h-100`}>
                {children}
            </div>
        </div>
    )
}

export default App;
