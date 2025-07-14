export default (error, req, res, next) => {
  console.log(
    "Error handled by our applevel error handling middleware!\n",
    error
  );

  error.message = error.message || "Server crashed somehow!";
  error.statusCode = error.statusCode || 500;

  res.status(error.statusCode).send({
    success: false,
    message: error.message,
    statusCode: error.statusCode,
  });
};
