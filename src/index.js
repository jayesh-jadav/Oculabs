import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { store, persistor } from "./Redux/store/configureStore";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import theme from "./Config/theme";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import BugsnagPerformance from "@bugsnag/browser-performance";
import { Setting } from "./Utils/Setting";

Bugsnag.start({
  apiKey: "8b9090e1bab06ea12336447e3459b519",
  plugins: [new BugsnagPluginReact()],
});
console.log("Setting?.bugsnagKey =======>>>", Setting?.bugsnagKey);

BugsnagPerformance.start({ apiKey: "8b9090e1bab06ea12336447e3459b519" });

const ErrorBoundary = Bugsnag.getPlugin("react").createErrorBoundary(React);

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ThemeProvider theme={theme}>
        <React.StrictMode>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </React.StrictMode>
      </ThemeProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </PersistGate>
  </Provider>,
  document.getElementById("root")
);
