const mapDocumentToAuthority = (documentType) => {
  const map = {
    Bonafide: 'hod',
    LOR: 'hod',
    NOC: 'registrar',
    'No Dues': 'finance',
    'Fee Structure': 'finance'
  };

  return map[documentType];
};

module.exports = { mapDocumentToAuthority };
