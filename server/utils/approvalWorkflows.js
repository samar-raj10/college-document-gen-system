const WORKFLOWS = {
  Bonafide: ["registrar", "admin"],
  LOR: ["faculty", "hod"],
  NOC: ["hod"],
  "No Dues": ["chief-librarian", "chief-warden", "finance", "admin"],
  "Fee Structure": ["finance", "admin"],
};

const getWorkflow = (documentType) => {
  return WORKFLOWS[documentType] || null;
};

module.exports = { WORKFLOWS, getWorkflow };
