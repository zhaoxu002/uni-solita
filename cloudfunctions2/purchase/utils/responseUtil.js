exports.createSuccessResponse = (data) => {
  return {
    success: true,
    data,
  };
};

exports.createPageSuccessResponse = (data, page) => {
  return {
    success: true,
    data: {
      data,
      page,
    },
  };
};

exports.createErrorResponse = (errMsg) => {
  return {
    success: false,
    errMsg,
  };
};
