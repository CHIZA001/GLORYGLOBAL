const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.staff) {
            return res.status(401).json({
                message: "Access denied. Please login first."
            });
        }

        if (!allowedRoles.includes(req.staff.role)) {
            return res.status(403).json({
                message: "Access denied. You do not have permission to perform this action."
            });
        }

        next();
    };
};

module.exports = roleMiddleware;