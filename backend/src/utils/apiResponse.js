export const apiResponse = {
  success: (res, message = 'Operation successful', data = null, statusCode = 200) => {
    const payload = {
      success: true,
      message
    };
    if (data !== null) {
      payload.data = data;
    }
    return res.status(statusCode).json(payload);
  },

  error: (res, message = 'Something went wrong', errors = [], statusCode = 400) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: Array.isArray(errors) ? errors : [errors]
    });
  }
};
