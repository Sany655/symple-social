import { collection, deleteField, doc, getDoc, getDocs, getFirestore, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

const Context = createContext()
export const CallProvider = ({ children }) => {
    const { user } = useSelector(state => state.auth)
    const [call, setCall] = useState({
        calling: false,
        ringing: false,
        type: null,
        sender: {},
        reciever: {},
        restart: false,
        chatId: null
    })
    const pc = useRef()
    const dc = useRef()
    const myTrack = useRef()
    const userTrack = useRef()

    useEffect(() => {
        startingPc()

        onSnapshot(query(collection(getFirestore(), "chats"), where("members", "array-contains", user.uid)),
            snapshot => {
                snapshot.docs.map(snapMap => {
                    const snap = snapMap.data();
                    if ((snap.callState?.callingTo === user.uid) && (snap.callState?.status === "ringing")) {
                        getDoc(doc(getFirestore(), "users", snap.members.find(member => member !== user.uid))).then(sender => {
                            setCall({
                                ...call,
                                sender: sender.data(),
                                ringing: true,
                                reciever: user,
                                chatId: snap.id
                            })
                            if (confirm((sender.data().displayName || sender.data().email) + " is calling you, yould u want to recieve?")) {
                                recievingCall(sender.data())
                            } else {
                                cancelCall(snapMap.id)
                            }
                        })
                    }

                    if (snap.callState?.status === "cancelled") {
                        updateDoc(doc(getFirestore(), "chats", snapMap.id), { callState: deleteField() }).then(() => {
                            // if (call.tracks.mine) {
                            myTrack.current.getTracks().forEach(track => track.stop())
                            // }
                            // setCall({ ...call, restart: true })
                            startingPc()
                        }).catch(err => console.log("delete callState ", err.message))
                    }
                })
            })
    }, [])

    useEffect(() => {
        async function getFriends() {
            getDocs(query(collection(getFirestore(), "chats"), where("members", "array-contains", user.uid), where("callState.status", "==", "ringing"))).then(friends => {
                friends.docs.map(friend => {
                    updateDoc(doc(getFirestore(), "chats", friend.id), { callState: deleteField() }).then().catch(err => console.log("delete callState ", err.message))
                })
            }).finally(() => {
                startingPc()
            })
        }

        getFriends()
    }, [call.restart])

    function recievingCall(sender) {
        console.log(sender);
    }

    function cancelCall(id) {
        updateDoc(doc(getFirestore(), "chats", id), { "callState.status": "cancelled" }).then().catch(err => console.log("delete callState to cancel call ", err.message))
    }

    function startingPc() {
        pc.current = null
        pc.current = new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'stun:numb.viagenie.ca',
                    credential: '@TnaWcnWVWu4QRn',
                    username: 'mazharulalam26@gmail.com'
                },
                {
                    urls: 'turn:numb.viagenie.ca',
                    credential: '@TnaWcnWVWu4QRn',
                    username: 'mazharulalam26@gmail.com'
                },
            ]
        })
        setCall({
            tracks: {
                user: null, mine: null
            },
            calling: false,
            ringing: false,
            type: null,
            sender: {},
            reciever: {},
            chatId: null,
            restart: false
        })
    }

    function setMyTrack(type) {
        if (window.navigator.mediaDevices) {
            return window.navigator.mediaDevices.getUserMedia({ audio: true, video: type }).then(stream => {
                stream.getTracks().forEach(track => {
                    if (track.getConstraints().noiseSuppression) {
                        track.applyConstraints({ noiseSuppression: true })
                    }
                    pc.current.addTrack(track, stream)
                });
                myTrack.current = stream;

            }).catch(err => console.log("track ", err.message))
        }else{
            alert("window.navigator.mediaDevices error")
        }
    }

    function sendingOffer(friendProfile, inbox) {
        dc.current = pc.current.createDataChannel("channel")
        dc.current.onopen = () => {
        };
        pc.current.createOffer().then(offer => {
            pc.current.setLocalDescription(offer).then(() => {
                updateDoc(doc(getFirestore(), "chats", inbox.chatId), {
                    callState: {
                        offer: JSON.stringify(offer),
                        callingTo: friendProfile.uid,
                        status: "ringing",
                        type: "audio",
                        timestamp: serverTimestamp(),
                    },
                    lastMessage: serverTimestamp()
                }).then(() => {
                    // dispatch({ type: "calling", payload: { type:"audio", reciever:friendProfile } })
                    setCall({
                        ...call,
                        calling: true,
                        type: "audio",
                        reciever: friendProfile,
                        chatId: inbox.chatId
                    })
                })
                // pc.onicecandidate = e => {
                //     localDescriptions = pc.localDescription
                //     console.log(localDescriptions);
                // };
            }).catch(err => console.log("error in setLocalDescription ", err.message))
        }).catch(err => console.log("error in create offer ", err.message))
    }

    return (
        <Context.Provider value={{ startingPc, call, setMyTrack, sendingOffer, myTrack: myTrack.current, userTrack: userTrack.current, cancelCall }}>
            {children}
        </Context.Provider>
    )
}

export default function useCall() {
    return useContext(Context)
}