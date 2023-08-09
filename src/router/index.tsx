import { createBrowserRouter } from "react-router-dom";
import App from "../app";
import ErrorPage from "../pages/errorPage";
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorPage />,

    },
]);

export default router