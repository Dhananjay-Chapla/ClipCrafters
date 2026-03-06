/**
 * asyncHandler — wraps async route handlers to forward errors to Express
 * eliminates try/catch boilerplate in every controller
 *
 * @param {Function} fn - async controller function
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
