import '../styles/globals.css'
import "bootstrap/dist/css/bootstrap.min.css"
import { Provider } from 'react-redux'
import "../firebase"
import Header from '../components/Header'
import { useEffect } from 'react'
import store from '../redux/store'
import StateChange from '../redux/StateChange'

function MyApp({ Component, pageProps }) {

    useEffect(() => {
        if (typeof window !== "undefined") require("bootstrap/dist/js/bootstrap.bundle")
    },[])
    return (
        <Provider store={store}>
            <StateChange>
                <Header />
                <Component {...pageProps} />
            </StateChange>
        </Provider>
    )
}

export default MyApp
