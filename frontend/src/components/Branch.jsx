import React, { useState, useEffect } from 'react';
import '../assets/static/css/branch.css';
import { useNavigate } from 'react-router-dom';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Branch = () => {
    const [selectedBranch, setSelectedBranch] = useState('');
    const [branches, setBranches] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const token = sessionStorage.getItem('accessToken');
                const userId = sessionStorage.getItem('userId');
                const cmpId = sessionStorage.getItem('cmpId');
                
                const response = await fetch('http://127.0.0.1:8000/api/v1/branch/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userid: userId,
                        cmpid: cmpId
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setBranches(data.branchDetails);

                    // Set the default branch if available
                    const defaultBranch = data.branchDetails.find(branch => branch.IsDefault === 'Y');
                    if (defaultBranch) {
                        setSelectedBranch(defaultBranch.BranchCode);
                        // Save the default branch details to sessionStorage
                        sessionStorage.setItem('branchCode', defaultBranch.BranchCode);
                        sessionStorage.setItem('BranchName', defaultBranch.BranchName);
                    }
                } else {
                    console.error('Failed to fetch branches:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };

        fetchBranches();
    }, []);

    // Function to handle radio button change and store data in session storage
    const handleBranchSelection = (event) => {
        const branchCode = event.target.dataset.branchCode;
        const branchName = event.target.dataset.branchName;

        // Save selected branch details to sessionStorage
        sessionStorage.setItem('branchCode', branchCode);
        sessionStorage.setItem('BranchName', branchName);

        // Set the selected branch in state
        setSelectedBranch(branchCode);
        navigate('/dashboard');
    };
    const handleNext = async (e) => {
      e.preventDefault();
      navigate('/dashboard')
    }

    return (
        <div className="branch-div container mt-5">
            <h3 className="text-center">Select Branch</h3>
            <div className="d-flex flex-column gap-2 align-items-center">
                {branches.map((branch) => (
                    <label key={branch.BranchCode} className={`chip ${selectedBranch === branch.BranchCode ? 'selected' : ''}`} htmlFor={branch.BranchCode}>
                        <input
                            type="radio"
                            id={branch.BranchCode}
                            name="branch"
                            value={branch.BranchCode}
                            style={{ display: 'none' }}
                            onChange={handleBranchSelection} // Call the function on radio button change
                            data-branch-code={branch.BranchCode}
                            data-branch-name={branch.BranchName}
                            data-cmp-id={branch.CmpId}
                            data-is-default={branch.IsDefault}
                        />
                        {branch.BranchName}
                    </label>
                ))}
            </div>
            
    <button onClick={handleNext}
        className="next-button"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',  // Make the button a square
          height: '60px', // Equal width and height for round shape
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%', // Make the button round
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center', // Center the icon
          fontSize: '24px', // Increase the icon size
        }}
      >
        <FontAwesomeIcon icon={faArrowRight} />
      </button>
        </div>

    );
};

export default Branch;
