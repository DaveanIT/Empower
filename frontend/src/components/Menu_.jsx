import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHome } from '@fortawesome/free-solid-svg-icons'; 

const Menu_ = () => {
    const navigate = useNavigate();
    const alias = sessionStorage.getItem('cmpAlias');
  
    const [error, setError] = useState(null); // State to handle errors
    const [menuItems, setMenuItems] = useState([]); // State to store fetched menu items
    const username = sessionStorage.getItem('userName'); // Simulate the logged-in user name
    const userid = sessionStorage.getItem('userId');
    const token = sessionStorage.getItem('accessToken');
    const parentid = sessionStorage.getItem('MnuId');
    
    useEffect(() => {
      const fetchNav = async () => {
          if (userid) {
              try {
                  const userId = sessionStorage.getItem('userId');
                  const cmpId = sessionStorage.getItem('cmpId');
  
                  const response = await fetch('http://127.0.0.1:8000/api/v1/menu/', {
                      method: 'POST',
                      headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                          userid: userId,
                          cmpid: cmpId,
                          parentId: parentid
                      })
                  });
  
                  if (!response.ok) {
                      throw new Error('Network response was not ok');
                  }
  
                  const data = await response.json();
                  console.log("API Response:", data); // Log to verify response structure
  
                  // Use data.menuData directly as it's already an array
                  if (data.menuData) {
                      setMenuItems(data.menuData); // Set menu items correctly
                  } else {
                      setError('Failed to fetch menu items');
                  }
              } catch (err) {
                  setError(err.message);
              }
          } else {
              setError('User ID is not available in session storage');
          }
      };
      fetchNav();
  }, [userid]);
  
  
  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
  
      await fetch('http://127.0.0.1:8000/api/v1/logout/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
  
      sessionStorage.clear();
      navigate(`/${alias}/login`); // Redirect to login with alias
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
    const handleMenuClick = async (e) => {
        e.preventDefault();
        const mnuId = e.target.getAttribute('data-mnuid');
        const ActId = e.target.getAttribute('data-actid');
        sessionStorage.setItem('MnuId', mnuId);
        sessionStorage.setItem('ActionId', ActId);
  
        if (e.target.getAttribute('data-actionbtn') === 'N') { // Use strict equality check
            const template = e.target.getAttribute('data-tmpltid');
            
            navigate(`/${template}`);
  
        } else {
            navigate('/menu_');
        }
    };
    const handleBack = async (e) => {
      e.preventDefault();
      navigate('/menu')
    }

  return (
    
    <div className="container-fluid">
    <header className="d-flex justify-content-between align-items-center p-3">
        <h1 className="h5">{username}</h1> {/* Use Bootstrap h5 class for smaller size */}
        <button onClick={handleLogout} type="submit" className="btn btn-outline-danger">Logout</button>
        
    </header>

    {/* Full viewport height for centering */}
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="container">
            <div className="row justify-content-center">
                {menuItems.map((item) => (
                    <div key={item.MnuId} className="col-6 col-md-3 mb-3">
                        <button 
                            className="btn btn-primary w-100" 
                            data-baseid={item.BaseId} 
                            data-mnuid={item.MnuId}
                            data-actid={item.ActId}
                            data-actionbtn={item.IsTitle}  
                            data-tmpltid={item.TmpltId}  // Pass MnuId in data attribute
                            style={{ backgroundColor: item.Colr }}
                            onClick={handleMenuClick}  // Use onClick to handle button click
                        >
                            {item.MnuName}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
    {error && <div className="alert alert-danger">{error}</div>} {/* Display error message */}

    <button onClick={handleBack}
        className="next-button"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
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
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
</div>
  )
}

export default Menu_