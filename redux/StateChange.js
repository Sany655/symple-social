import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import Spinner from '../components/Spinner';
const StateChange = ({ children }) => {
    const auth = getAuth()
    const [loading, setLoading] = useState(true)
    const dispatch = useDispatch()
    useEffect(() => {
        onAuthStateChanged(auth, user => {
            if (user) {
                if (typeof window !== "undefined") {
                    localStorage.setItem("user", JSON.stringify(user))
                }
                getDoc(doc(getFirestore(), "users", user.uid)).then(userRes => {
                    if (userRes.exists()) {
                        updateDoc(doc(getFirestore(), "users", user.uid), {
                            active: true
                        }).catch(err => console.log(err.message))
                    }
                })
                dispatch({
                    type: "auth-check", payload: user
                })
            } else {
                if (typeof window !== "undefined") {
                    const user = JSON.parse(localStorage.getItem("user"))
                    getDoc(doc(getFirestore(), "users", user.uid)).then(userRes => {
                        if (userRes.exists()) {
                            updateDoc(doc(getFirestore(), "users", user.uid), {
                                active: false
                            }).catch(err => console.log(err.message))
                        }
                    })
                }
                dispatch({ type: "auth-check", payload: null })
            }
            setLoading(false)
        })
    }, [auth, dispatch])

    if (loading) {
        return <Spinner />
    }

    return children;
}

export default StateChange