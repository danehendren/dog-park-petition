var spicedPg = require('spiced-pg');
var bcrypt = require('bcryptjs');
//============================================
if (process.env.DATABASE_URL) {
    dbURL = process.env.DATABASE_URL
} else {
    var info = require('./secrets.json')
    var user = info.username;
    var pass = info.password;
    dbURL = `postgres:${user}:${pass}psql@localhost:5432/petition`
}
//============================================
var db = spicedPg(dbURL)
//============================================
exports.signPetition = function(signature, userId) {
    return db.query(
        `INSERT INTO signatures (signature, user_id)
         VALUES ($1, $2)
         RETURNING id`,
        [ signature || null, userId ]
    ).then((results) => {
        return results.rows[0].id;
    })
}

exports.getHashedPassword = function(email) {
    return db.query (
        `SELECT hashedpassword FROM users WHERE email = '${email}'`
    ).then((results) => {
        return results.rows[0].hashedpassword;
    });
}
//============================================Query for retrieving the Email
exports.getUserInfo = function(email) {
    return db.query(
        `SELECT * FROM users WHERE email = $1`, [email]
    ).then((results) => {
        return results.rows[0];
    })
}
//============================================Thanks Page Signature Function for IMAGE.
exports.thanksSignature = function(signatureId) {
    return db.query (
        `SELECT signature FROM signatures WHERE id = $1`, [signatureId]).then((results) =>{
            return results.rows[0].signature;
        }).catch((err) => {
            console.log(err);
        })
    }
    //============================================Signed Page, posting Signatures, all.
exports.getSigners = function() {
    return db.query(
        `SELECT users.first, users.last, user_profiles.age, user_profiles.city,
        user_profiles.url
        FROM users
        LEFT JOIN user_profiles
        ON users.id = user_profiles.user_id
        `).then((results) => {
            return results.rows;
        }).catch((err) => {
            console.log(err);
    });
};
//============================================Edit profile - Auto-population text areas.
exports.getProfileUserInformation = function(userId) {
    return db.query(
        `SELECT users.first, users.last, users.email, user_profiles.age,
        user_profiles.city, user_profiles.url
        FROM users
        JOIN user_profiles
            ON users.id = user_profiles.user_id
        WHERE users.id = $1`,
        [userId]
    ).then((results) => {
        return results.rows[0]
    }).catch((err) => {
        console.log("There was an error inside edit profile user information", err);
    })
}
//============================================Edit Profile - Required Datad
exports.updateUserProfileInformation = function(first, last, email, userId) {
    console.log("this is the array",     [ first, last, email, userId ] );
    return db.query(
        `UPDATE users
        SET first = $1,
        last = $2,
        email = $3
        WHERE id = $4`,
        [ first, last, email, userId ]
    ).then(() => {
        console.log('getpetition.js inside updateUserProfileInformation');
    })
    .catch((err) => {
        console.log("getpetition.js inside updateUserProfileInformation ERR: ", err);
    })
}
//============================================Edit Profile - Optional Data
exports.updateUserOptionalInfo = function(age, city, url, userId) {
    return db.query(
        `UPDATE user_profiles
        SET age = $1,
        city = $2,
        url = $3
        WHERE user_id = $4`,
        [ age, city, url, userId]
    ).then(() => {
        console.log('getpetition.js inside updateUserOptionalInfo');
    })
    .catch((err) => {
        console.log("getpetition.js inside updateUserOptionalInfo ERR: ", err);
    })
}
//============================================Delete Signature DB query
module.exports.deleteSignature = function(userid) {

    return dbUrl.query(

        `DELETE FROM signatures WHERE id = $1;`,
        [userid]

    ).then(() => {
        console.log("getpetition.js made it into deletesignature");
    }).catch((err) => {
        console.log(err);
    });

};
