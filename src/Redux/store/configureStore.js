import {createStore, applyMiddleware} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage' ;
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import thunk from 'redux-thunk';
import rootReducer from '../reducers/rootReducer';
import { socketMiddleware } from '../middlewares/socket';

/**
 * Redux Setting
 */
const persistConfig = {
  key: "root",
  storage: storage,
  timeout: 100000,
  stateReconciler: autoMergeLevel2,
};

let middleware = [socketMiddleware(),thunk];
middleware = [...middleware];

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = createStore(persistedReducer, applyMiddleware(...middleware));
const persistor = persistStore(store);

export {store, persistor};

