const express = require('express')
const app = express()
const hb = require('express-handlebars')
const fs = require('fs')
const bp = require('body-parser')
const cookie = require('cookie-parser')
const getPetitionReq = require('./getpetition')
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs')
const getUsersReq = require('./getusers')
const hashpass = require('./hashpass')
const profile = require('./profile')
// var csurf = require('csurf')
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
const bc = require('./getusers')
var spicedPg = require('spiced-pg');
var db = spicedPg(dbURL)
//============================================APP.USES
app.use(express.static(__dirname + '/public'))
app.engine('handlebars', hb())
app.set('view engine', 'handlebars')
app.use(cookieSession({
    secret: 'a really hard to guess secret',
    maxAge: 1000 * 60 * 60 * 24 * 14
}));

app.use(bp.urlencoded({
    extended: false
}))
//============================================get Register page
app.get('/register',  (req,res) => {
    res.render('register', {
        layout: 'main',
        error: ""
    });
})
//============================================post Register Page
app.post('/register', (req, res) => {
    var firstName = req.body.first;
    var lastName =  req.body.last;
    var email = req.body.email;
    var password = req.body.password;

    hashpass.hashPassword(password).then((hashedPassword) => {
        getUsersReq.userRegistration(firstName, lastName, email, hashedPassword).then(function(userId) {
            req.session.user = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                id: userId
            };
            res.redirect('/profile')
        }).catch(function(err) {
            console.log(err);
            res.render('register', {
                layout: 'main',
                errMsg: 'Please fill out all fields'
            })
        })
    })
})
//============================================Get Profile Page.
app.get('/profile', (req, res) => {
    res.render('profile', {
        layout: 'main',
        error: ""
    });
})
//============================================Post Profile Page
app.post('/profile', (req, res) => {
    var age = req.body.age;
    var city = req.body.city;
    var url = req.body.url;
    profile.insertProfile(age, city, url, req.session.user.id).then(function(userId) {
        res.redirect('/petition')
    }).catch(function(err) {
        // console.log(err);
        res.render('profile', {
            layout: 'main',
            error: 'I do not know how you got this error',
            // csrfToken: req.csrfToken
        });
    });
})
//============================================Get Petition Page
app.get('/petition', function(req, res) {
    if(!req.session.user) {
        res.redirect('/register')
    } else {
        res.render('petition', {
            layout: 'main',
            error: ""
        });
    }
});
//============================================Post Petition Page
app.post('/petition', function(req, res) {

    var signature = req.body.signature;
    getPetitionReq.signPetition(signature, req.session.user.id).then(function(signatureId) {
        req.session.signatureId = signatureId
        res.redirect('/thanks')
    }).catch(function(err) {
        res.render('petition', {
            layout: 'main',
            errMsg: 'Please sign the petition',
        });
    });
});
//============================================Get Thanks Page with Signature Displayed
app.get('/thanks', function(req, res) {
    if(!req.session.user) {
        res.redirect('/register')
    } else {
        var thanks = req.body.signature
        getPetitionReq.thanksSignature(req.session.signatureId).then(signature => {
            res.render('thanks', {
                layout: 'main',
                signature: signature
            });
        })
    }
});
//============================================Get Signed Page with All Signers
app.get('/signed', function(req, res) {
    if(!req.session.user) {
        res.redirect('/register')
    } else {
        getPetitionReq.getSigners().then(results => {
            // console.log('this function is here!');
            res.render('signed', {
                layout: 'main',
                names: results
            });
        })
    }
});
//============================================Get Login Page
app.get('/login', (req, res) => {
    res.render('login', {
        layout: 'main',
        error: ""
    });
})
//============================================Post Login Page
app.post('/login', (req, res) => {

    var email = req.body.email;
    var loginPassword = req.body.password;
    getPetitionReq.getHashedPassword(email).then(function(hashedPasswordFromDatabase) {
        // console.log(hashpass);
        hashpass.checkPassword(loginPassword, hashedPasswordFromDatabase).then(function(doesMatch) {
            if (doesMatch) {
                getPetitionReq.getUserInfo(email).then(function(userInfo) {
                    console.log("results from user info", userInfo);
                    req.session.user = {
                        first: userInfo.first,
                        last: userInfo.last,
                        email: userInfo.email,
                        id: userInfo.id
                    }
                    res.redirect('/petition')
                }).catch(function(err) {
                    res.render('login', {
                        layout: 'main',
                        error: "Please fill out the info"
                    })
                })
            }
        }).catch(function(err) {
            res.render('login', {
                layout: 'main',
                error: "Please fill out correct password"
            });
        })
    }).catch(function(err) {
        res.render('login', {
            layout: 'main',
            error: "please fill out the correct correct password"
        });
    })
})
//============================================Get Edit Profile Page
app.get('/editprofile', (req, res) => {
    if(!req.session.user) {
        res.redirect('/register')
    } else {
        getPetitionReq.getProfileUserInformation(req.session.user.id).then(function(userInfo) {
            // console.log("this is the results from edit profile bum bum bum", userInfo);
            res.render('editprofile', {
                layout: 'main',
                userInfo: userInfo
            })
        })
    }
})
//============================================Post Edit Profile Page
app.post('/editprofile', (req, res) => {
    first = req.body.first
    last = req.body.last
    email = req.body.email
    age = req.body.age
    city = req.body.city
    url = req.body.url

    userId = req.session.user.id

    if(!req.session.user){
        res.redirect('/editprofile')
    } else {
        getPetitionReq.updateUserProfileInformation(first, last, email, userId).then(() => {
            getPetitionReq.updateUserOptionalInfo(age, city, url, userId).then(() => {

                req.session.user.first = first
                req.session.user.last = last
                req.session.user.email = email
                res.redirect('/editprofile')
            })
        })
    }
})


//============================================
app.get('/logout', (req, res) => {
    if(req.session) {
        req.session == null
        res.redirect('/register')
    }
})

//============================================Proposal Get Page
// app.get('/proposal', (req, res) => {
//     res.render('proposal', {
//         layout: 'main',
//         error: ""
//     });
// })
//============================================Get Empty Slash Redirect
app.get('/',  (req,res) => {
    res.redirect('/register')
})
//============================================Listening on heroku and Port 8080
app.listen(process.env.PORT || 8080, () => {
    console.log('petition is listening on 8080');
})
