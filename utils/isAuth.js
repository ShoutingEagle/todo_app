module.exports = (req, res, next) => {
    if (req.session.isAuth) {
        next(); // User is authenticated, proceed to the next middleware or route
    } else {
        res.redirect('/login'); // User is not authenticated, redirect to login
    }
};
