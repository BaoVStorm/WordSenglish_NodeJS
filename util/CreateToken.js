import jwt from 'jsonwebtoken';

export const createToken =  (props, expires) => {
    return  jwt.sign(props, process.env.jwtUserSecret, {
        expiresIn: expires
    });
}