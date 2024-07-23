import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';

import { User, Workout, Exercise, sequelize } from '../models/index.js';
import { Op } from 'sequelize';  // Add this line



const signup = (req, res, next) => {
    // checks if email already exists
    User.findOne({ where : {
        email: req.body.email, 
    }})
    .then(dbUser => {
        if (dbUser) {
            return res.status(409).json({message: "email already exists"});
        } else if (req.body.email && req.body.password) {
            // password hash
            bcrypt.hash(req.body.password, 12, (err, passwordHash) => {
                if (err) {
                    return res.status(500).json({message: "couldnt hash the password"}); 
                } else if (passwordHash) {
                    return User.create(({
                        email: req.body.email,
                        name: req.body.name,
                        password: passwordHash,
                    }))
                    .then(() => {
                        res.status(200).json({message: "user created"});
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(502).json({message: "error while creating the user"});
                    });
                };
            });
        } else if (!req.body.password) {
            return res.status(400).json({message: "password not provided"});
        } else if (!req.body.email) {
            return res.status(400).json({message: "email not provided"});
        };
    })
    .catch(err => {
        console.log('error', err);
    });
};


const login = (req, res, next) => {
    // checks if email exists
    User.findOne({ where : {
        email: req.body.email, 
    }})
    .then(dbUser => {
        if (!dbUser) {
            return res.status(404).json({message: "user not found"});
        } else {
            // password hash
            bcrypt.compare(req.body.password, dbUser.password, (err, compareRes) => {
                if (err) { // error while comparing
                    res.status(502).json({message: "error while checking user password"});
                } else if (compareRes) { // password match
                    const token = jwt.sign({ email: req.body.email }, 'secret', { expiresIn: '1h' });
                    res.status(200).json({message: "user logged in", "token": token});
                    console.log("user logged in!");
                } else { // password doesnt match
                    console.log("Database user password:", dbUser.password);
                    console.log("Request body password:", req.body.password);

                    
                    
                    res.status(401).json({message: "invalid credentials"});
                };
            });
        };
    })
    .catch(err => {
        console.log('error', err);
    });
};

const isAuth = (req, res, next) => {
    const authHeader = req.get("Authorization");
    console.log("Auth header:", req.get("Authorization"));
    if (!authHeader) {
        return res.status(401).json({ message: 'not authenticated' });
    };
    const token = authHeader.split(' ')[1];
    let decodedToken; 
    try {
        decodedToken = jwt.verify(token, 'secret');
    } catch (err) {
        return res.status(500).json({ message: err.message || 'could not decode the token' });
    };
    if (!decodedToken) {
        res.status(401).json({ message: 'unauthorized' });
    } else {
        //res.status(200).json({ message: 'here is your resource' });
        req.email = decodedToken.email; // Store email in request for later use
        next(); // Call next() to pass control to the next middleware
    };
};

const getName = (req, res, next) => {
    User.findOne({ where: { email: req.email } })
        .then(dbUser => {
            if (!dbUser) {
                return res.status(404).json({ message: "user not found" });
            }
            res.status(200).json({ name: dbUser.name });
        })
        .catch(err => {
            console.log('error', err);
            res.status(500).json({ message: "error retrieving user name" });
        });
};

const getUsers = async (req, res, next) => {
    try {
        const { keyword } = req.query;
        let users;

        if (keyword) {
            users = await User.findAll({
                where: {
                    name: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                attributes: ['id', 'name', 'email'],
                limit: 50
            });
        } else {
            users = await User.findAll({
                attributes: ['id', 'name', 'email'],
                limit: 50
            });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: "Error fetching users" });
    }
};


// At the end of auth.js
export { signup, login, isAuth, getName, getUsers };