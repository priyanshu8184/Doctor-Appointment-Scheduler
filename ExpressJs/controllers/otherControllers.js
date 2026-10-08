export const getPaymentsByPatient = (req, res) => {
  res.json({
    payments: [
      {
        payment_id: 201,
        appointment_id: 101,
        total_amount: '65.00',
        payment_type: 'FULL_FEE',
        payment_status: 'COMPLETED',
        created_at: new Date().toISOString()
      }
    ]
  });
};

export const getReviewsByPatient = (req, res) => {
  res.json({
    reviews: [
      {
        review_id: 301,
        appointment_id: 102,
        doctor_id: 102,
        rating: 5,
        comment: 'Excellent doctor and very attentive!',
        created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
      }
    ]
  });
};

export const getPendingDoctors = (req, res) => {
  res.json({ doctors: [] });
};

export const approveDoctor = (req, res) => {
  res.json({ message: 'Doctor approved successfully' });
};

export const rejectDoctor = (req, res) => {
  res.json({ message: 'Doctor rejected' });
};
