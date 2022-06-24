import { collection, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const FetchData = ({ children }) => {
    const user = useSelector(state => state.auth).user
    const dispatch = useDispatch()

    useEffect(() => {
        // getting friends
        if (user) {
            onSnapshot(query(collection(getFirestore(), "chats"), where("members", "array-contains", user.uid)), async (snapshot) => {
                Promise.all(
                    snapshot.docs.map(async (doc) => {
                        const fndP = await getUser(doc.data().members.filter(member => member !== user.uid)[0],doc.id)
                        // fndP.messages = chats;
                        fndP.status = doc.data().status;
                        fndP.createdAt = doc.data().createdAt;
                        fndP.createdBy = doc.data().createdBy;
                        return fndP;
                    })
                ).then(res => {
                    const requests = []
                    const pendings = []
                    const lists = []
                    res.map(frnd => {
                        if ((!frnd.status) & (frnd.createdBy !== user.uid)) {
                            requests.push(frnd)
                        } else if ((!frnd.status) & (frnd.createdBy === user.uid)) {
                            pendings.push(frnd)
                        } else {
                            lists.push(frnd)
                            console.log(frnd);
                        }
                    })
                    dispatch({ type: "get-friends", payload: lists })
                    dispatch({ type: "get-pendings", payload: pendings })
                    dispatch({ type: "get-requests", payload: requests })

                    // getting peoples
                    const frndsID = res.map(fr => fr.uid)
                    frndsID.push(user.uid)
                    onSnapshot(query(collection(getFirestore(), "users"), where("uid", "not-in", frndsID)),
                        snapshot => {
                            dispatch({ type: "get-peoples", payload: snapshot.docs.map(doc => doc.data()) })
                        })
                }).catch(err => {
                    console.log(err.message);
                })
            })
        }
    }, [user])

    const getUser = async (uid,id) => {
        try {
            const user = await getDoc(doc(getFirestore(), "users", uid))
            // const chat = await getChat(doc.id)
            // console.log(chat);
            if (user.exists()) {
                return user.data();
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    const getChat = async chatId => {
        onSnapshot(collection(getFirestore(), "chats", chatId, "messages"),
            snapshot => {
                return snapshot.docs.map(doc => doc.data());
            })
    }



    return children
}

export default FetchData