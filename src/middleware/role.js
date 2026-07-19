function role(...allowed) {
  return (req, res, next) => {
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: "Acess denied" });
    }
    next();
  };
}

export default role;
