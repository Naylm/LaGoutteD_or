export function requireEditor(req, res, next) {
  const auth = req.headers.authorization || '';
  const expected = 'Basic ' + Buffer.from(`${process.env.EDITOR_USERNAME}:${process.env.EDITOR_PASSWORD}`).toString('base64');

  if (auth !== expected) {
    return res.status(401).json({ error: 'Accès interdit : identifiants incorrects.' });
  }
  next();
}

export function validateLogin(username, password) {
  return username === process.env.EDITOR_USERNAME && password === process.env.EDITOR_PASSWORD;
}
