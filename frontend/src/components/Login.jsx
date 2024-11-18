import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import '../assets/static/css/signin.css';  // Custom styles
import Notfound from './Notfound';

// Import the logo image
import logo from '../assets/static/images/logo.svg';

const Login = () => {
    const { tenantName } = useParams(); // Retrieve tenantName from the URL
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [tenantExists, setTenantExists] = useState(true); // Add state for tenant existence check
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the tenant exists when the component loads
        const verifyTenant = async () => {
            try {
                const response = await axios.post(`http://127.0.0.1:8000/api/v1/VerifyTenant/`, {
                    tenant_name: tenantName,
                });
                if (response.status === 200) {
                    console.log("Tenant verified successfully.");
                }
            } catch (error) {
                setTenantExists(false); // Set tenantExists to false if tenant verification fails
                console.log("Tenant verification failed");
            }
        };

        verifyTenant();
    }, [tenantName]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log(tenantName);
        setError(''); // Clear previous error messages

        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/v1/${tenantName}/api/token/`, {
                username,
                password,
                tenantName,
            });
            console.log(response.data);
            const userData = response.data.userData;

            const branchCode = userData.BranchCode;
            const cmpAlias = userData.CmpAlias;
            const cmpId = userData.CmpId;
            const multiBranch = userData.MultiBranch;
            const userId = userData.UserId;
            const userName = userData.UserName;

            const accessToken = response.data.access;
            const refreshToken = response.data.refresh;

            sessionStorage.setItem('userId', userId);
            sessionStorage.setItem('multiBranch', multiBranch);
            sessionStorage.setItem('userName', userName);
            sessionStorage.setItem('cmpId', cmpId);
            sessionStorage.setItem('cmpAlias', cmpAlias);
            sessionStorage.setItem('branchCode', branchCode);
            sessionStorage.setItem('accessToken', accessToken);
            sessionStorage.setItem('refreshToken', refreshToken);

            navigate('/branch');
        } catch (error) {
            console.log("Invalid credentials");
            setError("Invalid credentials. Please try again.");
            sessionStorage.setItem('userId', null);
        } finally {
            setLoading(false);
        }
    };

    if (!tenantExists) {
        return <Notfound />; // Return Notfound component if tenant doesn't exist
    }

    return (
        <div className="login-container d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow-lg" style={{ width: '400px', borderRadius: '10px' }}>
                <div className="card-body p-4">
                    {/* Add logo image here */}
                    <div className="text-center mb-4">
                        <img src={logo} alt="Product Logo" style={{ width: '150px', height: 'auto' }} />
                    </div>
                    {/* <h3 className="text-center mb-4" style={{ fontWeight: '600', color: '#333' }}>Sign In</h3> */}
                    <form onSubmit={handleLogin}>
                        <div className="form-group mb-3">
                            <label htmlFor="username" className="form-label" style={{ fontWeight: '500' }}>Username</label>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoComplete="username"
                            />
                        </div>
                        <div className="form-group mb-4">
                            <label htmlFor="password" className="form-label" style={{ fontWeight: '500' }}>Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                        {error && <div className="alert alert-danger text-center p-2 mb-3" role="alert">{error}</div>}
                        <div className="d-grid gap-2">
                            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ fontWeight: '500' }}>
                                {loading ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin /> Logging in...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
