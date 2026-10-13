/**
 * DEMO DATA FOR COLLEGE LEAVE REQUEST MANAGEMENT SYSTEM
 * NOTE: This is client-side mock data created for demonstration and testing purposes.
 * Real production systems should connect to a secure backend API.
 */

export const DEMO_USERS = {
  student: {
    id: "STU-2024-001",
    name: "Aarav Sharma",
    email: "student@college.edu",
    username: "aarav_student",
    password: "student123", // Demo testing password only
    role: "student",
    rollNumber: "CS-2022-045",
    department: "Computer Science & Engineering",
    semester: "6th Semester",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav"
  },
  admin: {
    id: "ADM-2024-101",
    name: "Dr. Robert Vance (HOD)",
    email: "admin@college.edu",
    username: "admin_hod",
    password: "admin123", // Demo testing password only
    role: "admin",
    designation: "Head of Department",
    department: "Computer Science & Engineering",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert"
  }
};

export const INITIAL_LEAVE_REQUESTS = [
  {
    id: "LV-2026-001",
    studentId: "STU-2024-001",
    studentName: "Aarav Sharma",
    studentRoll: "CS-2022-045",
    department: "Computer Science & Engineering",
    leaveType: "Sick Leave",
    startDate: "2026-10-15",
    endDate: "2026-10-17",
    totalDays: 3,
    reason: "Severe viral fever and physician advised bed rest for 3 days.",
    appliedDate: "2026-10-12",
    status: "Pending", // Pending, Approved, Rejected
    adminRemarks: ""
  },
  {
    id: "LV-2026-002",
    studentId: "STU-2024-001",
    studentName: "Aarav Sharma",
    studentRoll: "CS-2022-045",
    department: "Computer Science & Engineering",
    leaveType: "Academic Leave",
    startDate: "2026-09-20",
    endDate: "2026-09-22",
    totalDays: 3,
    reason: "Selected to present a research paper at the National AI Student Summit.",
    appliedDate: "2026-09-15",
    status: "Approved",
    adminRemarks: "Approved. All the best for your presentation."
  },
  {
    id: "LV-2026-003",
    studentId: "STU-2024-001",
    studentName: "Aarav Sharma",
    studentRoll: "CS-2022-045",
    department: "Computer Science & Engineering",
    leaveType: "Casual Leave",
    startDate: "2026-08-10",
    endDate: "2026-08-14",
    totalDays: 5,
    reason: "Attending elder brother's wedding ceremony in hometown.",
    appliedDate: "2026-08-01",
    status: "Rejected",
    adminRemarks: "Mid-term lab assessments are scheduled during this period. Leave cannot be granted."
  },
  {
    id: "LV-2026-004",
    studentId: "STU-2024-002",
    studentName: "Priya Patel",
    studentRoll: "CS-2022-019",
    department: "Computer Science & Engineering",
    leaveType: "Emergency Leave",
    startDate: "2026-10-14",
    endDate: "2026-10-16",
    totalDays: 3,
    reason: "Family medical emergency requiring travel out of city.",
    appliedDate: "2026-10-13",
    status: "Pending",
    adminRemarks: ""
  },
  {
    id: "LV-2026-005",
    studentId: "STU-2024-003",
    studentName: "Devon Miller",
    studentRoll: "IT-2022-031",
    department: "Information Technology",
    leaveType: "Duty Leave",
    startDate: "2026-10-18",
    endDate: "2026-10-19",
    totalDays: 2,
    reason: "Representing college at Inter-University Football Tournament.",
    appliedDate: "2026-10-11",
    status: "Approved",
    adminRemarks: "Approved through Sports Committee endorsement."
  }
];

export const LEAVE_TYPES = [
  "Sick Leave",
  "Casual Leave",
  "Academic Leave",
  "Emergency Leave",
  "Duty Leave"
];
