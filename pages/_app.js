import '../styles/globals.css'
import "bootstrap/dist/css/bootstrap.min.css"
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Provider } from 'react-redux'
import "../firebase"
import Header from '../components/Header'
import { useEffect } from 'react'
import store from '../redux/store'
import StateChange from '../redux/StateChange'

function MyApp({ Component, pageProps }) {

    useEffect(() => {
        if (typeof window !== "undefined") require("bootstrap/dist/js/bootstrap.bundle")
    }, [])
    return (
        <Provider store={store}>
            <StateChange>
                <div className="d-flex h-100 flex-column">
                    <Header />
                    <Component {...pageProps} />
                </div>
            </StateChange>
        </Provider>
    )
}

export default MyApp
