const sendResponse = (res, status, data = [], message, hasError = false) => {
    return res.status(status).json({
        hasError,
        data: data || [],
        message,
        code: status,
    });
};

module.exports = sendResponse;
