
exports.successResponse = (res, message = "Success", data = {}) => {
    res.status(200).json({message, data, status: true});
};

exports.errorResponse = (res, message = "Error", data = {}) => {
    res.status(400).json({message, data, status: false});
};

module.exports = exports;