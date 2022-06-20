import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import Spinner from '../../components/Spinner';
const StateChange = ({ children }) => {
    const auth = getAuth()
    const [loading, setLoading] = useState(true)
    const dispatch = useDispatch()
    useEffect(() => {
        onAuthStateChanged(auth, user => {
            if (user) {
                dispatch({
                    type: "auth-check", payload: {
                        uid:user.uid,
                        name: user.displayName,
                        email: user.email,
                        pic: user.photoURL,
                        phone: user.phoneNumber
                    }
                })
            } else {
                dispatch({ type: "auth-check", payload: null })
            }
            setLoading(false)
        })
    }, [auth])

    if (loading) {
        return <Spinner />
    }

    return children;
}

export default StateChange