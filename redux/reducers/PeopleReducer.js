export default (state = {
    list:[],
    loading:true
}, action) => {
    switch (action.type) {
        case "get-peoples":
            return {
                ...state,
                loading:false,
                list:action.payload
            }
    
        default: return state;
    }
}