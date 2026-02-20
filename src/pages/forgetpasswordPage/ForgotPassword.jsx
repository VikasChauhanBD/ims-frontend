// // src/pages/ForgotPassword.jsx
// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../../AuthContext/AuthContext';

// const ForgotPassword = () => {
//   const { requestPasswordReset } = useAuth();

//   const [email, setEmail] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     const result = await requestPasswordReset(email);

//     if (result.success) {
//       setSuccess(true);
//     } else {
//       setError(result.errors?.message || 'An error occurred');
//     }

//     setLoading(false);
//   };

//   if (success) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
//           <div className="text-center">
//             <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
//               <svg
//                 className="h-10 w-10 text-green-600"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M5 13l4 4L19 7"
//                 />
//               </svg>
//             </div>
//             <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
//               Check Your Email
//             </h2>
//             <p className="text-gray-600 mb-6">
//               If your email is registered with us, you will receive a password reset link shortly.
//             </p>
//             <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md text-left mb-6">
//               <p className="text-sm text-blue-800">
//                 <strong>Note:</strong> The reset link will expire in 24 hours.
//               </p>
//             </div>
//             <Link
//               to="/login"
//               className="inline-flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 transform hover:scale-105"
//             >
//               Back to Login
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
//         {/* Header */}
//         <div className="text-center">
//           <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
//             <svg
//               className="h-10 w-10 text-white"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
//               />
//             </svg>
//           </div>
//           <h2 className="text-3xl font-extrabold text-gray-900">
//             Forgot Password?
//           </h2>
//           <p className="mt-2 text-sm text-gray-600">
//             No worries! Enter your email and we'll send you a reset link
//           </p>
//         </div>

//         {/* Form */}
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {error && (
//             <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
//               <p className="text-sm text-red-800">{error}</p>
//             </div>
//           )}

//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//               Email Address
//             </label>
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <svg
//                   className="h-5 w-5 text-gray-400"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
//                   />
//                 </svg>
//               </div>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
//                 placeholder="Enter your email"
//               />
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 transform hover:scale-105"
//             >
//               {loading ? (
//                 <svg
//                   className="animate-spin h-5 w-5 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//               ) : (
//                 'Send Reset Link'
//               )}
//             </button>
//           </div>

//           <div className="text-center">
//             <Link
//               to="/login"
//               className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 flex items-center justify-center"
//             >
//               <svg
//                 className="h-4 w-4 mr-1"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M10 19l-7-7m0 0l7-7m-7 7h18"
//                 />
//               </svg>
//               Back to Login
//             </Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;

// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';
import './ForgetPassword.css';

const ForgotPassword = () => {
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await requestPasswordReset(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.errors?.message || 'An error occurred while processing your request');
    }

    setLoading(false);
  };

  // ===== SUCCESS STATE =====
  if (success) {
    return (
      <div className="forgot-page">
        <div className="forgot-card">
          <div className="icon-container icon-success">
            <svg className="icon" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="forgot-title">Check Your Email</h2>
          <p className="forgot-message">
            If your email is registered with us, you will receive a password reset link shortly.
          </p>
          <div className="note-box">
            <p className="note-text">
              <strong>Note:</strong> The reset link will expire in 24 hours.
            </p>
          </div>
          <Link to="/login" className="forgot-button">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ===== EMAIL FORM STATE =====
  return (
    <div className="forgot-page">
      <div className="forgot-card">
        {/* Header */}
        <div className="forgot-header">
          <div className="logo-container">
            <svg className="logo-icon" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="forgot-title">Forgot Password?</h2>
          <p className="forgot-subtitle">
            No worries! Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Form */}
        <form className="forgot-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Email Address *
            </label>
            <div className="email-input-wrapper">
              <div className="email-icon">
                <svg className="email-svg" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-input"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? (
              <svg className="spinner" viewBox="0 0 24 24">
                <circle className="spinner-opacity" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="spinner-fill" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Send Reset Link'
            )}
          </button>

          <div className="back-link-container">
            <Link to="/login" className="back-link">
              <svg className="back-icon" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;