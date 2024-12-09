const catchAsync = (fn) => {
    return errorHandler = (req, res, next) => {
        fn(req, res, next).catch((err) => {
            next(err);
        });
    }
}

module.exports = catchAsync;