import { combineReducers, createStore } from "redux";
import AuthReducer from "./reducers/AuthReducer";
import FriendReducer from "./reducers/FriendReducer";
import InboxReducer from "./reducers/InboxReducer";
import PeopleReducer from "./reducers/PeopleReducer";

const store = createStore(combineReducers({
    auth:AuthReducer,
    friends:FriendReducer,
    peoples:PeopleReducer,
    inbox:InboxReducer
}))

export default store;