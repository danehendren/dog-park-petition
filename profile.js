var spicedPg = require('spiced-pg');
if (process.env.DATABASE_URL) {
    dbURL = process.env.DATABASE_URL
} else {
    var info = require('./secrets.json')
    var user = info.username;
    var pass = info.password;
    dbURL = `postgres:${user}:${pass}psql@localhost:5432/petition`
}
var db = spicedPg(dbURL)
//============================================Insert Data into User_Profile Page.
exports.insertProfile = function(age, city, url, user_id) {
    // console.log("about to insert profile", age, city, url);
    return db.query(
        `INSERT INTO user_profiles(age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [ age || null, city || null, url || null, user_id ]
    ).then((results) => {
        // console.log("we areherererer");
        return results.rows[0].id
    }).catch((err) => {
        console.log(err);
    })
}
