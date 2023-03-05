exports.createSuccessResponse = (data) => {
  return {
    success: true,
    data,
  };
};

exports.createErrorResponse = (errMsg) => {
  return {
    success: false,
    errMsg,
  };
};
