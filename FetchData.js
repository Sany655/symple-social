import { collection, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const FetchData = ({ children }) => {
    const user = useSelector(state => state.auth).user
    const dispatch = useDispatch()

    useEffect(() => {
        // getting friends
        if (user) {
            onSnapshot(query(collection(getFirestore(), "chats"), where("members", "array-contains", user.uid)), async (snapshot) => {
                const requests = []
                const pendings = []
                const lists = []
                snapshot.docs.map(async (chat) => {
                    const chatDoc = chat.data()
                    chatDoc.chatId = chat.id;
                    if ((!chatDoc.status) & (chatDoc.createdBy !== user.uid)) {
                        requests.push(chatDoc)
                    } else if ((!chatDoc.status) & (chatDoc.createdBy === user.uid)) {
                        pendings.push(chatDoc)
                    } else {
                        lists.push(chatDoc)
                    }
                })
                dispatch({ type: "get-friends", payload: lists })
                dispatch({ type: "get-pendings", payload: pendings })
                dispatch({ type: "get-requests", payload: requests })

                // getting peoples
                const frndsID = snapshot.docs.map(fr => fr.data().members.find(member => user.uid !== member))
                frndsID.push(user.uid)
                onSnapshot(query(collection(getFirestore(), "users"), where("uid", "not-in", frndsID)),
                    snapshot => {
                        dispatch({ type: "get-peoples", payload: snapshot.docs.map(doc => doc.data()) })
                    })
            })
        }
    }, [user,dispatch])

    return children
}

export default FetchData