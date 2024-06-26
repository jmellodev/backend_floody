module.exports = createFieldChecker = (requiredFields) => {
  return (body) => {
    const missingFields = requiredFields.filter(field => !body[field]);
    return missingFields;
  };
};