import authService from "../services/auth.service.js";

async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!["client", "seller"].includes(role)) {
    return res.status(400).json({ error: "Role must be client or seller" });
  }

  const result = authService.register(name, email, password, role);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(201).json(result);
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const result = authService.login(email, password);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.json(result);
}

export { register, login };
