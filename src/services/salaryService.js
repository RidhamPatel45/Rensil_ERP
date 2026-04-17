import salaries from '../mockData/salaries.json';
import users from '../mockData/users.json';

export const salaryService = {
  // Get salary for a specific user
  getMySalary: (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const salary = salaries.find(s => s.userId === userId);
        resolve(salary || null);
      }, 500);
    });
  },

  // Get all salaries (Admin only)
  getAllSalaries: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Enrich salary data with user names and roles if available
        const enriched = salaries.map(salary => {
          const user = users.find(u => u.id === salary.userId);
          return {
            ...salary,
            userName: user ? user.name : (salary.role || 'Unknown User'),
            userEmail: user ? user.email : 'N/A',
            role: user ? user.role : (salary.role || 'Staff')
          };
        });
        resolve(enriched);
      }, 500);
    });
  },

  // Update payment status (Mock)
  updatePaymentStatus: (userId, status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Updated payout for user ${userId} to ${status}`);
        resolve({ success: true });
      }, 500);
    });
  }
};
