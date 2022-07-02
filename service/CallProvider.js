import { collection, deleteField, doc, getDoc, getDocs, getFirestore, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

const Context = createContext()
export const CallProvider = ({ children }) => {
    const { user } = useSelector(state => state.auth)
    const [call, setCall] = useState({
        calling: false,
        ringing: false,
        onGoing: false,
        type: null,
        sender: {},
        reciever: {},
        restart: false,
        chatId: null,
        timer: null,
        offer: null
    })
    const pc = useRef()
    const dc = useRef()
    const myTrack = useRef()
    const userTrack = useRef()


    // delete callState
    useEffect(() => {
        if (user) {
            async function getFriends() {
                onSnapshot(query(collection(getFirestore(), "chats"), where("members", "array-contains", user.uid), where("callState.status", "==", "cancelled")),
                    friends => {
                        startingPc()
                        cancelCall()
                        friends.docs.map(chat => {
                            updateDoc(doc(getFirestore(), "chats", chat.id), { callState: deleteField() }).then().catch(err => console.log("delete callState ", err.message))
                        })
                    })
            }

            getFriends()
        }
    }, [])

    // getting ring
    useEffect(() => {
        if (user) {
            onSnapshot(query(collection(getFirestore(), "chats"), where("members", "array-contains", user.uid), where("callState.callingTo", "==", user.uid), where("callState.status", "==", "ringing")),
                snapshot => {
                    snapshot.docs.map(snapMap => {
                        getDoc(doc(getFirestore(), "users", snapMap.data().callState.callingFrom)).then(sender => {
                            setCall(prevState => ({
                                ...prevState,
                                sender: sender.data(),
                                reciever: user,
                                chatId: snapMap.id,
                                type: snapMap.data().callState.type,
                                ringing: true,
                                offer: snapMap.data().callState.offer
                            }))
                        }).catch(err => console.log("err gettung user ", err.message))
                    })
                })
        }
    }, [])

    // getting answer
    useEffect(() => {
        if (call.reciever.uid && user.uid) {
            onSnapshot(query(collection(getFirestore(), "chats"), where("members", "array-contains", user.uid), where("callState.status", "==", "answering"), where("callState.callingFrom", "==", user.uid), where("callState.callingTo", "==", call.reciever.uid)),
                snapshot => {
                    snapshot.docs.map(snapMap => {
                        const remoteDesc = new RTCSessionDescription(JSON.parse(snapMap.data().callState.answer));
                        pc.current.setRemoteDescription(remoteDesc).then(() => {
                            console.log("setRemoteDesc first time");
                        }).catch(err => console.log(err.message))
                    })
                })
        }
    }, [call.reciever])

    // getting user track
    useEffect(() => {
        if (pc.current) {
            pc.current.ontrack = e => {
                userTrack.current.srcObject = e.streams[0];
            }
        }
    }, [pc.current, userTrack.current])

    function recievingCall() {
        const calType = call.type === "audio" ? false : "video" && true;
        setMyTrack(calType).then(() => {
            pc.current.ondatachannel = e => {
                dc.current = e.channel;
                dc.current.onopen = () => {
                    console.log("channel opened! what to do next?");
                };
            }
            const remoteDesc = new RTCSessionDescription(JSON.parse(call.offer))
            pc.current.setRemoteDescription(remoteDesc).then(() => {
                pc.current.createAnswer().then(answer => {
                    pc.current.setLocalDescription(answer).then(() => {
                        updateDoc(doc(getFirestore(), "chats", call.chatId), {
                            "callState.answer": JSON.stringify(pc.current.localDescription),
                            "callState.status": "answering",
                            "callState.timestamp": serverTimestamp(),
                            lastMessage: serverTimestamp()
                        }).then((data) => {
                            setCall(pre => ({
                                ...pre,
                                onGoing: true,
                                timer: 0
                            }))
                        })
                    })
                })
            })
        })
    }

    function cancelCall(chatId) {
        startingPc()
        if (chatId) {
            updateDoc(doc(getFirestore(), "chats", chatId), { "callState.status": "cancelled" }).then(() => {

            }).catch(err => console.log("delete callState to cancel call ", err.message))
        } else {
            getDocs(query(collection(getFirestore(), "chats"), where("members", "array-contains", user.uid), where("callState.status", "in", ["ringing", "answering"]))).then(chats => {
                chats.docs.map(chat => {
                    updateDoc(doc(getFirestore(), "chats", chat.id), { "callState.status": "cancelled" }).then(() => {

                    }).catch(err => console.log("delete callState to cancel call ", err.message))
                })
            })
        }
    }

    function startingPc() {
        userTrack.current && userTrack.current.srcObject && userTrack.current.srcObject.getTracks().forEach(track => {
            track.stop()
        })
        myTrack.current && myTrack.current.srcObject && myTrack.current.srcObject.getTracks().forEach(track => {
            track.stop()
        })
        pc.current && pc.current.close();
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
        dc.current = null
        userTrack.current = null
        setCall(pre => ({
            ...pre,
            calling: false,
            ringing: false,
            type: null,
            sender: {},
            reciever: {},
            chatId: null,
            restart: false
        }))
    }

    async function setMyTrack(type) {
        try {
            const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true, video: type })
            stream.getTracks().forEach(track => {
                pc.current.addTrack(track, stream)
            });
            return stream
        } catch (error) {
            console.log(error.message)
        }
    }

    // calling
    function audioCall(friendProfile, inbox) {
        !pc.current && alert("you are not ready to call, reload and try again")
        if (friendProfile.active) {
            getDocs(query(collection(getFirestore(), "chats"), where("members", "array-contains", inbox.chatId), where("callState.status", "in", ["ringing", "answering", "cancelled"]))).then((chat) => {
                if (chat.empty) { // other user callState is emty means he's not in a call!
                    setMyTrack(false).then((stream) => {
                        myTrack.current.srcObject = stream;
                        dc.current = pc.current.createDataChannel("channel")
                        dc.current.onopen = () => {
                            console.log("data channel opened, what to do with it?");
                        };
                        pc.current.createOffer().then(offer => {
                            pc.current.setLocalDescription(offer).then(() => {
                                // pc.current.onicecandidate = e => {
                                updateDoc(doc(getFirestore(), "chats", inbox.chatId), {
                                    callState: {
                                        offer: JSON.stringify(pc.current.localDescription),
                                        callingTo: friendProfile.uid,
                                        callingFrom: user.uid,
                                        status: "ringing",
                                        type: "audio",
                                        timestamp: serverTimestamp(),
                                    },
                                    lastMessage: serverTimestamp()
                                }).then((data) => {
                                    setCall(pre => ({
                                        ...pre,
                                        calling: true,
                                        type: "audio",
                                        reciever: friendProfile,
                                        chatId: inbox.chatId,
                                        sender: user
                                    }))
                                })
                                // }
                            }).catch(err => console.log("error in setLocalDescription ", err.message))
                        }).catch(err => console.log("error in create offer ", err.message))
                    }).finally(() => {

                    })
                } else {
                    alert("user is busy")
                }
            }).catch(err => console.log(err.message))
        } else {
            alert("user is offline")
        }
    }

    return (
        <Context.Provider value={{ call, myTrack, userTrack, cancelCall, audioCall, recievingCall }}>
            {children}
        </Context.Provider>
    )
}

export default function useCall() {
    return useContext(Context)
}