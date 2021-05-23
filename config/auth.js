module.exports = {
    ensureAuthenticated: function(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg','Inicia sesión para ver el Dashboard');
        res.redirect('users/login')
    }
}