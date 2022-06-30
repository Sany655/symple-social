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
                getDoc(doc(getFirestore(), "users", user.uid)).then(userRes => {
                    if (userRes.exists()) {
                        if (typeof window !== "undefined") {
                            localStorage.setItem("user", JSON.stringify(userRes.data()))
                        }
                        updateDoc(doc(getFirestore(), "users", user.uid), {
                            active: true
                        }).catch(err => console.log(err.message)).finally(() => {
                            dispatch({
                                type: "auth-check", payload: userRes.data()
                            })
                            setLoading(false)
                        })
                    }
                }).catch(err => console.log("getting user ", err.message))
            } else {
                if (typeof window !== "undefined") {
                    const user = JSON.parse(localStorage.getItem("user"))
                    if (user) {
                        getDoc(doc(getFirestore(), "users", user.uid)).then(userRes => {
                            if (userRes.exists()) {
                                updateDoc(doc(getFirestore(), "users", user.uid), {
                                    active: false
                                }).catch(err => console.log(err.message))
                            }
                        }).finally(() => {
                            setLoading(false)
                        })
                    }else{
                        setLoading(false)
                    }
                }
                dispatch({ type: "auth-check", payload: null })
            }
        })
    }, [auth, dispatch])

    if (loading) {
        return <Spinner />
    }

    return children;
}

export default StateChange