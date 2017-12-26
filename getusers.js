var spicedPg = require('spiced-pg');
//==========================================
if (process.env.DATABASE_URL) {
    dbURL = process.env.DATABASE_URL
} else {
    var info = require('./secrets.json')
    var user = info.username;
    var pass = info.password;
    dbURL = `postgres:${user}:${pass}psql@localhost:5432/petition`
}
//===========================================
var db = spicedPg(dbURL)
//============================================User Registration Information.
exports.userRegistration = function(first, last, email, password) {
    return db.query(
        `INSERT INTO users (first, last, email, hashedpassword)
         VALUES ($1,$2,$3,$4)
         RETURNING id`,
         [ first || null, last || null, email || null, password || null ]
    ).then((results) => {
        return results.rows[0].id;
    })
}

// exports.getUsers = function(results) {
//     return db.query(
//         `SELECT `
//     )
// }
