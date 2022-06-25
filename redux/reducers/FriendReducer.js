export default (state = {
    list:[],
    requests:[],
    pendings:[],
    loading:true
}, action) => {
    switch (action.type) {
        case "get-friends":
            return {
                ...state,
                loading:false,
                list:action.payload
            }
        case "get-requests":
            return {
                ...state,
                loading:false,
                requests:action.payload
            }
        case "get-pendings":
            return {
                ...state,
                loading:false,
                pendings:action.payload
            }
        default: return state;
    }
}