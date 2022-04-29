// 1.导入:
const redux = require("redux");

// 2. 引入reducer
import reducer from "./reducer";

// 3.创建一个store
const store = redux.createStore(reducer)

export default store;
