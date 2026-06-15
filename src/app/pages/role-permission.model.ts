export interface RolePermission {
     dashboard: boolean;
  staffManagement: boolean;
  personTracking: boolean;
  getDetails: boolean;

  master: {
    addCompany: boolean;
    addLocation: boolean;
    addContractor: boolean;
    addDepartment: boolean;
    addAccessGroup: boolean;
    roleMaster: boolean;
  };

  attendanceManagement: {
    downloadLog: boolean;
    logRecords: boolean;
    organizationUnit: boolean;
  };

  systemSettings: {
    deviceManagement: boolean;
    employeeTransfer: boolean;
    smtpCredentials: boolean;
    smtpEmailId: boolean;
  };

  reports: {
    attendanceReport: boolean;
    multiplePunchReport: boolean;
    masterReport: boolean;
    accessControlReport: boolean;
    accessGrantedReport: boolean;
    auditReport: boolean;
    personTrackingReport: boolean;
  };
}

