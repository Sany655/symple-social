const inb = typeof window !== "undefined" && localStorage.getItem("inbox")
export default (state = {
    chats: [],
    inbox: (inb&&JSON.parse(inb)) || [],
    loading: true
}, action) => {
    switch (action.type) {
        case "get-chats":
            return {
                ...state,
                loading: false,
                chats: action.payload
            }
        case "get-inbox":
            localStorage.setItem("inbox", JSON.stringify(action.payload))
            return {
                ...state,
                loading: false,
                inbox: action.payload
            }

        default: return state;
    }
}