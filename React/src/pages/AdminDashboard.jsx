import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'
import './AuthPage.css' // We can reuse some styles

const AdminDashboard = ({ navigate }) => {
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    // Check if user is admin
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.role !== 'ADMIN') {
        navigate('/login')
        return
      }
    } else {
      navigate('/login')
      return
    }

    fetchPendingDoctors()
  }, [])

  const fetchPendingDoctors = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'}/admin/pending-doctors`)
      setPendingDoctors(response.data.doctors)
    } catch (error) {
      console.error("Failed to fetch pending doctors:", error)
      setStatusMessage("Failed to load pending registrations.")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (doctorId) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'}/admin/approve-doctor/${doctorId}`)
      setStatusMessage("Doctor approved successfully.")
      fetchPendingDoctors() // Refresh the list
    } catch (error) {
      console.error("Failed to approve doctor:", error)
      setStatusMessage("Failed to approve doctor.")
    }
  }

  const handleReject = async (doctorId) => {
    if (!window.confirm("Are you sure you want to reject this registration?")) return
    
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'}/admin/reject-doctor/${doctorId}`)
      setStatusMessage("Doctor rejected successfully.")
      fetchPendingDoctors() // Refresh the list
    } catch (error) {
      console.error("Failed to reject doctor:", error)
      setStatusMessage("Failed to reject doctor.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onNavigate={navigate} />

      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2>Admin Dashboard</h2>
          <button onClick={handleLogout} className="secondary-btn" style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>
            Logout
          </button>
        </div>

        {statusMessage && (
          <div style={{ padding: '15px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '8px', marginBottom: '20px' }}>
            {statusMessage}
          </div>
        )}

        <section style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.25rem', color: '#1e293b' }}>Pending Doctor Registrations</h3>
          
          {loading ? (
            <p>Loading pending registrations...</p>
          ) : pendingDoctors.length === 0 ? (
            <p style={{ color: '#64748b' }}>No pending doctor registrations found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '12px 16px' }}>Name</th>
                    <th style={{ padding: '12px 16px' }}>Email</th>
                    <th style={{ padding: '12px 16px' }}>Specialty</th>
                    <th style={{ padding: '12px 16px' }}>License No.</th>
                    <th style={{ padding: '12px 16px' }}>Applied On</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDoctors.map((doc) => (
                    <tr key={doc.doctor_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '500' }}>Dr. {doc.first_name} {doc.last_name}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{doc.User?.email || 'N/A'}</td>
                      <td style={{ padding: '12px 16px' }}>{doc.specialization}</td>
                      <td style={{ padding: '12px 16px' }}>{doc.medical_license_number}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {doc.User?.created_at ? new Date(doc.User.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleApprove(doc.doctor_id)}
                            style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleReject(doc.doctor_id)}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <Footer onNavigate={navigate} />
    </div>
  )
}

export default AdminDashboard
