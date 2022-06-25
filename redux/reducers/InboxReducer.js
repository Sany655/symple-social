export default (state = {
    chats: typeof window !== "undefined" && localStorage.getItem("inbox")?JSON.parse(localStorage.getItem("inbox")):[],
    loading: true
}, action) => {
    switch (action.type) {
        case "get-chats":
            localStorage.setItem("inbox",JSON.stringify(action.payload))
            return {
                ...state,
                loading: false,
                chats: action.payload
            }

        default: return state;
    }
}