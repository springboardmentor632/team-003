import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState("processing");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setErrorMessage(decodeURIComponent(error));
      return;
    }

    if (!token) {
      setStatus("error");
      setErrorMessage("No authentication token received from Google OAuth2.");
      return;
    }

    let isMounted = true;
    loginWithToken(token).then((result) => {
      if (!isMounted) return;
      if (result.success) {
        setStatus("success");
        navigate("/dashboard", { replace: true });
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Failed to finalize session.");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-xl sm:px-10 border border-slate-200 text-center">
          {status === "processing" && (
            <div className="space-y-4">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
              <h2 className="text-xl font-bold text-slate-800">Signing in with Google...</h2>
              <p className="text-sm text-slate-500">Please wait while we finalize your DecisionHub session.</p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl font-bold">
                !
              </div>
              <h2 className="text-xl font-bold text-slate-800">Authentication Failed</h2>
              <p className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
                {errorMessage}
              </p>
              <Link
                to="/login"
                className="inline-flex justify-center w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
