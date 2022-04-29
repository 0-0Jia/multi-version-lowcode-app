import { authenticateSuccess, isAuthenticated, logout } from "src/utils/session";

const defaultState = {
    isLogin: false,
    loginUser: {},
}

function reducer(state = defaultState, action: any) {
    switch (action.type) {
        case 'toggleLogin':
            let isLogin;
            if (action.flag) {
              authenticateSuccess(action.info.username)
              localStorage.setItem('loginUser', JSON.stringify(action.info))
              isLogin = true
            } else {
              logout()
              isLogin = false
            }
            return {
                ...state,
                loginUser: action.info,
                isLogin,
              };
        default:
          return state;
      }
}
  
export default reducer;