// // src/pages/ResetPassword.jsx
// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate, useSearchParams } from 'react-router-dom';
// import { useAuth } from '../../AuthContext/AuthContext';

// const ResetPassword = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const { confirmPasswordReset, verifyResetToken } = useAuth();

//   const [token, setToken] = useState('');
//   const [formData, setFormData] = useState({
//     password: '',
//     password_confirm: '',
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [verifying, setVerifying] = useState(true);
//   const [tokenValid, setTokenValid] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [success, setSuccess] = useState(false);

//   useEffect(() => {
//     const tokenParam = searchParams.get('token');
//     if (tokenParam) {
//       setToken(tokenParam);
//       verifyToken(tokenParam);
//     } else {
//       setVerifying(false);
//       setErrors({ message: 'Invalid or missing reset token' });
//     }
//   }, [searchParams]);

//   const verifyToken = async (tokenToVerify) => {
//     const result = await verifyResetToken(tokenToVerify);
    
//     if (result.success) {
//       setTokenValid(true);
//     } else {
//       setErrors(result.errors);
//     }
    
//     setVerifying(false);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: '',
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors({});
//     setLoading(true);

//     const result = await confirmPasswordReset({
//       token,
//       password: formData.password,
//       password_confirm: formData.password_confirm,
//     });

//     if (result.success) {
//       setSuccess(true);
//       setTimeout(() => {
//         navigate('/login');
//       }, 3000);
//     } else {
//       setErrors(result.errors);
//     }

//     setLoading(false);
//   };

//   if (verifying) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
//         <div className="text-center">
//           <svg
//             className="animate-spin h-12 w-12 text-white mx-auto"
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//           >
//             <circle
//               className="opacity-25"
//               cx="12"
//               cy="12"
//               r="10"
//               stroke="currentColor"
//               strokeWidth="4"
//             ></circle>
//             <path
//               className="opacity-75"
//               fill="currentColor"
//               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//             ></path>
//           </svg>
//           <p className="mt-4 text-white text-lg">Verifying reset token...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!tokenValid) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
//           <div className="text-center">
//             <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
//               <svg
//                 className="h-10 w-10 text-red-600"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </div>
//             <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
//               Invalid Reset Link
//             </h2>
//             <p className="text-gray-600 mb-6">
//               {errors.message || 'This password reset link is invalid or has expired.'}
//             </p>
//             <Link
//               to="/forgot-password"
//               className="inline-flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 transform hover:scale-105"
//             >
//               Request New Link
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

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
//               Password Reset Successfully!
//             </h2>
//             <p className="text-gray-600 mb-6">
//               Your password has been reset. You can now login with your new password.
//             </p>
//             <p className="text-sm text-gray-500">
//               Redirecting to login page...
//             </p>
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
//             Set New Password
//           </h2>
//           <p className="mt-2 text-sm text-gray-600">
//             Enter your new password below
//           </p>
//         </div>

//         {/* Form */}
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {errors.message && (
//             <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
//               <p className="text-sm text-red-800">{errors.message}</p>
//             </div>
//           )}

//           <div className="space-y-4">
//             {/* New Password */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 New Password
//               </label>
//               <div className="relative">
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   required
//                   value={formData.password}
//                   onChange={handleChange}
//                   className={`appearance-none relative block w-full px-3 py-3 pr-10 border ${
//                     errors.password ? 'border-red-300' : 'border-gray-300'
//                   } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150`}
//                   placeholder="Enter new password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                 >
//                   <svg
//                     className="h-5 w-5 text-gray-400 hover:text-gray-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     {showPassword ? (
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
//                       />
//                     ) : (
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                       />
//                     )}
//                   </svg>
//                 </button>
//               </div>
//               {errors.password && (
//                 <p className="mt-1 text-sm text-red-600">{errors.password}</p>
//               )}
//             </div>

//             {/* Confirm Password */}
//             <div>
//               <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 mb-2">
//                 Confirm New Password
//               </label>
//               <input
//                 id="password_confirm"
//                 name="password_confirm"
//                 type={showPassword ? 'text' : 'password'}
//                 required
//                 value={formData.password_confirm}
//                 onChange={handleChange}
//                 className={`appearance-none relative block w-full px-3 py-3 border ${
//                   errors.password_confirm ? 'border-red-300' : 'border-gray-300'
//                 } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150`}
//                 placeholder="Confirm new password"
//               />
//               {errors.password_confirm && (
//                 <p className="mt-1 text-sm text-red-600">{errors.password_confirm}</p>
//               )}
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
//                 'Reset Password'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ResetPassword;
// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';
import './ResetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirmPasswordReset, verifyResetToken } = useAuth();

  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    password_confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      verifyToken(tokenParam);
    } else {
      setVerifying(false);
      setErrors({ message: 'Invalid or missing reset token' });
    }
  }, [searchParams]);

  const verifyToken = async (tokenToVerify) => {
    const result = await verifyResetToken(tokenToVerify);
    
    if (result.success) {
      setTokenValid(true);
    } else {
      setErrors(result.errors || { message: 'Invalid or expired reset token' });
    }
    
    setVerifying(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const result = await confirmPasswordReset({
      token,
      password: formData.password,
      password_confirm: formData.password_confirm,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } else {
      setErrors(result.errors || { message: 'Failed to reset password. Please try again.' });
    }

    setLoading(false);
  };

  // ===== VERIFICATION STATE =====
  if (verifying) {
    return (
      <div className="reset-page">
        <div className="reset-card verifying-card">
          <div className="spinner-wrapper">
            <svg className="spinner-large" viewBox="0 0 24 24">
              <circle className="spinner-opacity" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="spinner-fill" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="verifying-text">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  // ===== INVALID TOKEN STATE =====
  if (!tokenValid) {
    return (
      <div className="reset-page">
        <div className="reset-card">
          <div className="icon-container icon-error">
            <svg className="icon" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="reset-title">Invalid Reset Link</h2>
          <p className="reset-message">
            {errors.message || 'This password reset link is invalid or has expired.'}
          </p>
          <Link to="/forgot-password" className="reset-button">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  // ===== SUCCESS STATE =====
  if (success) {
    return (
      <div className="reset-page">
        <div className="reset-card">
          <div className="icon-container icon-success">
            <svg className="icon" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="reset-title">Password Reset Successfully!</h2>
          <p className="reset-message">
            Your password has been reset. You can now login with your new password.
          </p>
          <p className="redirect-text">Redirecting to login page in 3 seconds...</p>
        </div>
      </div>
    );
  }

  // ===== PASSWORD RESET FORM =====
  return (
    <div className="reset-page">
      <div className="reset-card">
        {/* Header */}
        <div className="reset-header">
          <div className="logo-container">
            <svg className="logo-icon" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="reset-title">Set New Password</h2>
          <p className="reset-subtitle">Enter your new password below</p>
        </div>

        {/* Form */}
        <form className="reset-form" onSubmit={handleSubmit}>
          {errors.message && (
            <div className="error-container">
              <p className="error-message">{errors.message}</p>
            </div>
          )}

          <div className="form-group">
            {/* New Password */}
            <label htmlFor="password" className="form-label">
              New Password *
            </label>
            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <svg className="eye-icon" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
            {errors.password && (
              <p className="error-text">{errors.password}</p>
            )}
          </div>

          <div className="form-group">
            {/* Confirm Password */}
            <label htmlFor="password_confirm" className="form-label">
              Confirm New Password *
            </label>
            <input
              id="password_confirm"
              name="password_confirm"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password_confirm}
              onChange={handleChange}
              className={`form-input ${errors.password_confirm ? 'form-input-error' : ''}`}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
            {errors.password_confirm && (
              <p className="error-text">{errors.password_confirm}</p>
            )}
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
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;