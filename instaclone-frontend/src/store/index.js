import { configureStore } from "@reduxjs/toolkit"
import authReducer from './slices/authSlice'
import postReducer from './slices/postSlice'
import userReducer from './slices/userSlice'
import storyReducer from './slices/storySlice'
import notificationReducer from './slices/notificationSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    user: userReducer,
    stories: storyReducer,
    notifications: notificationReducer,
  }
})

export default store