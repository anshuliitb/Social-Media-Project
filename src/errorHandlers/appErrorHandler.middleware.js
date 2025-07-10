export default (error, req, res, next) => {
  res.status(error.statusCode).send({
    success: false,
    message: error.message,
    statusCode: error.statusCode,
  });
};
