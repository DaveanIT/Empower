import React, { useEffect, useState } from 'react';
import '../assets/static/css/dashboard.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const [cmpAlias, setCmpAlias] = useState('');
  const [userName, setUserName] = useState('');
  const [dashboardData, setDashboardData] = useState([]);
  const navigate = useNavigate();
  const alias = sessionStorage.getItem('cmpAlias');


  useEffect(() => {
    // Retrieve company alias and username from session storage
    const name = sessionStorage.getItem('userName');
    if (alias) setCmpAlias(alias);
    if (name) setUserName(name);

    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const userId = sessionStorage.getItem('userId');
        const cmpId = sessionStorage.getItem('cmpId');
        const BranchCode = sessionStorage.getItem('branchCode');

        const response = await fetch('http://127.0.0.1:8000/api/v1/dashboard/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userid: userId,
            cmpid: cmpId,
            branchcode: BranchCode
          })
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data.dashboardData || []);
        } else {
          console.error('Failed to fetch dashboard data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

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
  
      sessionStorage.clear(); // Clear all session data
      navigate(`/${alias}/login`); // Redirect to login with alias
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  const handleMenu = () =>{
    navigate('/menu')
  }
  

  const renderTableRows = (tableId) => {
    return dashboardData
      .filter((item) => item.TableId === tableId)
      .map((item, index) => (
        <tr key={index}>
          <td>{item.Narration}</td>
          <td className="text-right">{item.Amt !== "None" ? item.Amt : '-'}</td>
        </tr>
      ));
  };
  const handleBack = async (e) => {
    e.preventDefault();
    navigate('/branch')
  }

  return (
    <div className="dashboard-div container mt-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="text-primary h5">{cmpAlias || 'None'}</h1>
        <div className="admin">
          <span className="text-muted small">{userName || 'None'}</span>
          <span className="ml-2 text-primary logout-icon" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
              <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
            </svg>
          </span>
        </div>
      </div>
      
      <div className="text-right mb-3">
        <button className="btn btn-outline-primary btn-sm" onClick={handleMenu}>Menu</button>
      </div>

      {/* Opportunities Table */}
      <div className="card mb-3">
        <div className="hhd" style={{ display: 'flex' }}>
          <div className="bg-success text-white text-left" style={{ minWidth: '50%' }}>
            &nbsp;Opportunities
          </div>
          <div style={{ backgroundColor: '#ffffff', minWidth: '50%', borderBottom: '2px solid #28a745' }}></div>
        </div>
        <table className="table table-borderless table-sm mb-0">
          <tbody>{renderTableRows('Tb1')}</tbody>
        </table>
      </div>

      {/* Purchases Table */}
      <div className="card mb-3">
        <div className="hhd" style={{ display: 'flex' }}>
          <div style={{ backgroundColor: '#ffffff', minWidth: '50%', borderBottom: '2px solid #17a2b8' }}></div>
          <div className="bg-info text-white text-right" style={{ minWidth: '50%' }}>
            Purchases &nbsp;
          </div>
        </div>
        <table className="table table-borderless table-sm mb-0">
          <tbody>{renderTableRows('Tb2')}</tbody>
        </table>
      </div>

      {/* Cashflow Table */}
      <div className="card mb-3">
        <div className="hhd" style={{ display: 'flex' }}>
          <div className="bg-danger text-white text-left" style={{ minWidth: '50%' }}>
            &nbsp;Cashflow
          </div>
          <div style={{ backgroundColor: '#ffffff', minWidth: '50%', borderBottom: '2px solid #dc3545' }}></div>
        </div>
        <table className="table table-borderless table-sm mb-0">
          <tbody>{renderTableRows('Tb3')}</tbody>
        </table>
      </div>

      {/* Footer */}
      <footer className="text-center mt-3">
        <p className="text-muted small">
          <img src="img/davean_Business_Logo_final.png" alt="" height="20px" />
        </p>
      </footer>
      
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
  );
};

export default Dashboard;
