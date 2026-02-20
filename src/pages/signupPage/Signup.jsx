// // src/pages/Signup.jsx
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../AuthContext/AuthContext';

// const Signup = () => {
//   const navigate = useNavigate();
//   const { signup } = useAuth();

//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     password_confirm: '',
//     first_name: '',
//     last_name: '',
//     department: '',
//     phone_number: '',
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const departments = [
//     { value: '', label: 'Select Department' },
//     { value: 'IT', label: 'Information Technology' },
//     { value: 'HR', label: 'Human Resources' },
//     { value: 'Finance', label: 'Finance' },
//     { value: 'Operations', label: 'Operations' },
//     { value: 'Sales', label: 'Sales' },
//     { value: 'Marketing', label: 'Marketing' },
//   ];

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

//     const result = await signup(formData);

//     if (result.success) {
//       navigate('/dashboard', { replace: true });
//     } else {
//       setErrors(result.errors);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
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
//                 d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
//               />
//             </svg>
//           </div>
//           <h2 className="text-3xl font-extrabold text-gray-900">
//             Create Your Account
//           </h2>
//           <p className="mt-2 text-sm text-gray-600">
//             Join the Inventory Management System
//           </p>
//         </div>

//         {/* Form */}
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {errors.message && (
//             <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
//               <p className="text-sm text-red-800">{errors.message}</p>
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* First Name */}
//             <div>
//               <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
//                 First Name *
//               </label>
//               <input
//                 id="first_name"
//                 name="first_name"
//                 type="text"
//                 required
//                 value={formData.first_name}
//                 onChange={handleChange}
//                 className={`appearance-none relative block w-full px-3 py-3 border ${
//                   errors.first_name ? 'border-red-300' : 'border-gray-300'
//                 } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150`}
//                 placeholder="John"
//               />
//               {errors.first_name && (
//                 <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
//               )}
//             </div>

//             {/* Last Name */}
//             <div>
//               <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
//                 Last Name *
//               </label>
//               <input
//                 id="last_name"
//                 name="last_name"
//                 type="text"
//                 required
//                 value={formData.last_name}
//                 onChange={handleChange}
//                 className={`appearance-none relative block w-full px-3 py-3 border ${
//                   errors.last_name ? 'border-red-300' : 'border-gray-300'
//                 } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150`}
//                 placeholder="Doe"
//               />
//               {errors.last_name && (
//                 <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
//               )}
//             </div>
//           </div>

//           {/* Email */}
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//               Email Address *
//             </label>
//             <input
//               id="email"
//               name="email"
//               type="email"
//               autoComplete="email"
//               required
//               value={formData.email}
//               onChange={handleChange}
//               className={`appearance-none relative block w-full px-3 py-3 border ${
//                 errors.email ? 'border-red-300' : 'border-gray-300'
//               } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150`}
//               placeholder="john.doe@company.com"
//             />
//             {errors.email && (
//               <p className="mt-1 text-sm text-red-600">{errors.email}</p>
//             )}
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Department */}
//             <div>
//               <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
//                 Department
//               </label>
//               <select
//                 id="department"
//                 name="department"
//                 value={formData.department}
//                 onChange={handleChange}
//                 className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
//               >
//                 {departments.map((dept) => (
//                   <option key={dept.value} value={dept.value}>
//                     {dept.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Phone Number */}
//             <div>
//               <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
//                 Phone Number
//               </label>
//               <input
//                 id="phone_number"
//                 name="phone_number"
//                 type="tel"
//                 value={formData.phone_number}
//                 onChange={handleChange}
//                 className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
//                 placeholder="+1234567890"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Password */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password *
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
//                   placeholder="••••••••"
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
//                 Confirm Password *
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
//                 placeholder="••••••••"
//               />
//               {errors.password_confirm && (
//                 <p className="mt-1 text-sm text-red-600">{errors.password_confirm}</p>
//               )}
//             </div>
//           </div>

//           {/* Submit button */}
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
//                 'Create Account'
//               )}
//             </button>
//           </div>

//           {/* Sign in link */}
//           <div className="text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{' '}
//               <Link
//                 to="/login"
//                 className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150"
//               >
//                 Sign in
//               </Link>
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Signup;

// src/pages/Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';
import './Signup.css';
import AnimatedBackground from '../../components/animatedBackground/AnimatedBackground';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    department: '',
    phone_number: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const departments = [
    { value: '', label: 'Select Department' },
    { value: 'IT', label: 'Information Technology' },
    { value: 'HR', label: 'Human Resources' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Marketing', label: 'Marketing' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const result = await signup(formData);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setErrors(result.errors);
    }

    setLoading(false);
  };

  return (
    <div className="signup-page">
      <AnimatedBackground/>
      <div className="signup-card">
        {/* Header */}
        <div className="signup-header">
          <div className="logo-container">
            <svg
              className="logo-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="signup-title">Create Your Account</h2>
          <p className="signup-subtitle">Join the Inventory Management System</p>
        </div>

        {/* Form */}
        <form className="signup-form" onSubmit={handleSubmit}>
          {errors.message && (
            <div className="error-container">
              <p className="error-message">{errors.message}</p>
            </div>
          )}

          <div className="form-row">
            {/* First Name */}
            <div className="form-group">
              <label htmlFor="first_name" className="form-label">
                First Name *
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className={`form-input ${errors.first_name ? 'form-input-error' : ''}`}
                placeholder="John"
              />
              {errors.first_name && (
                <p className="error-text">{errors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label htmlFor="last_name" className="form-label">
                Last Name *
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                className={`form-input ${errors.last_name ? 'form-input-error' : ''}`}
                placeholder="Doe"
              />
              {errors.last_name && (
                <p className="error-text">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              placeholder="john.doe@company.com"
            />
            {errors.email && (
              <p className="error-text">{errors.email}</p>
            )}
          </div>

          <div className="form-row">
            {/* Department */}
            <div className="form-group">
              <label htmlFor="department" className="form-label">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="form-select"
              >
                {departments.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label htmlFor="phone_number" className="form-label">
                Phone Number
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleChange}
                className="form-input"
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div className="form-row">
            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <div className="password-container">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <svg
                    className="eye-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && (
                <p className="error-text">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="password_confirm" className="form-label">
                Confirm Password *
              </label>
              <input
                id="password_confirm"
                name="password_confirm"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password_confirm}
                onChange={handleChange}
                className={`form-input ${errors.password_confirm ? 'form-input-error' : ''}`}
                placeholder="••••••••"
              />
              {errors.password_confirm && (
                <p className="error-text">{errors.password_confirm}</p>
              )}
            </div>
          </div>

          {/* Submit button */}
          <div className="form-submit">
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <svg
                  className="spinner"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="spinner-opacity"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="spinner-fill"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          {/* Sign in link */}
          <div className="signin-link">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="signin-link-text">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;