import jwt from 'jsonwebtoken';


export const generateJwt = (user) => {
  const token =  jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  return token;
};

export const verifyToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
};
