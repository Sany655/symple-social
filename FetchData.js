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
                    snapshot.docs.map(async (chat) => {
                        const fndP = await getUser(chat.data().members.filter(member => member !== user.uid)[0])
                        // let fndP = {}

                        // onSnapshot(doc(getFirestore(),"users",chat.data().members.filter(member => member !== user.uid)[0]),(snapUser) => {
                        //     fndP = snapUser
                        // })

                        fndP.status = chat.data().status;
                        fndP.createdAt = chat.data().createdAt;
                        fndP.createdBy = chat.data().createdBy;
                        fndP.chatId = chat.id;
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

    const getUser = async (uid, id) => {
        try {
            let data = {};
            const user = await getDoc(doc(getFirestore(), "users", uid))

            if (user.exists()) {
                data = user.data();
            }

            return data;
        } catch (error) {
            console.log(error.message);
        }
    }

    return children
}

export default FetchData