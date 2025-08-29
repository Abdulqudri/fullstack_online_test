exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return next();
  }
  res.status(401).send("Not authorized as Admin");
};

exports.isMember = (req, res, next) => {
  if (req.session && req.session.member) {
    return next();
  }
  res.status(401).send("Not authorized as Member");
};
