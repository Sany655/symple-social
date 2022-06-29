import { combineReducers, createStore } from "redux";
import AuthReducer from "./reducers/AuthReducer";
import CallReducer from "./reducers/CallReducer";
import InboxReducer from "./reducers/InboxReducer";

const store = createStore(combineReducers({
    auth:AuthReducer,
    inbox:InboxReducer,
    rtc:CallReducer,
}))

export default store;