// middleware.js

// Middleware pour vérifier si l'utilisateur est un administrateur
function isAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
      // L'utilisateur est un administrateur, nous laissons passer
      next();
    } else {
      // L'utilisateur n'est pas un administrateur, nous renvoyons une réponse non autorisée
      res.status(403).json({ message: 'Accès interdit. Vous devez être administrateur pour accéder à cette ressource.' });
    }
  }
  
  module.exports = {
    isAdmin
  };
  