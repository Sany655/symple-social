import '../styles/globals.css'
import "bootstrap/dist/css/bootstrap.min.css"
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Provider, useSelector } from 'react-redux'
import "../firebase"
import Header from '../components/Header'
import { useEffect } from 'react'
import store from '../redux/store'
import StateChange from '../redux/StateChange'
import AudioCall from '../components/AudioCall';
import VideoCall from '../components/VideoCall';
import useCall, { CallProvider } from '../service/CallProvider';

function MyApp({ Component, pageProps }) {

    useEffect(() => {
        if (typeof window !== "undefined") require("bootstrap/dist/js/bootstrap.bundle")
    }, [])
    return (
        <Provider store={store}>
            <StateChange>
                <CallProvider>
                    <div className="d-flex h-100 flex-column">
                        <Header />
                        <CallWrapper>
                            <Component {...pageProps} />
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
        <div>
            <AudioCall />
            <div className={`d-block ${(call.calling||call.ringing)&&"d-none"} h-100`}>
                {children}
            </div>
        </div>
    )
}

export default MyApp
