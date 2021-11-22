const express = require("express");
const con = require("../database/db");
const jwt = require("jsonwebtoken");
const secret = require("../config").secret;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const router = express.Router();


/* ROUTE USER */
/************* Route pour enregistrer un nouveau aidant. *************/
router.post("/sign-up", (req, res) => {
    try {
        bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
            let object = {
                nom: req.body.nom,
                prenom: req.body.prenom,
                email: req.body.email,
                password: hash
            }
            con.query(`INSERT INTO user SET ?`, object,  (err, resultat) => {
                if (err == null) res.status(200).json("Validé");
                else res.status(401).json('Compte non enregistré');
            });
        });
    } catch (error) {
        console.log(error);
    }
});

/***************************** Route pour la connection ***************************/
router.post("/sign-in", (req, res) => {
    try {
        let object = { 
            email: req.body.email 
        }
        con.query(`SELECT * FROM user WHERE ?`, object, (err, result) => {
            if (err == null) bcrypt.compare(req.body.password, result[0].password, (err, resulta) => {
                // console.log(result);
                let token = jwt.sign({ 
                    id_user: result[0].id_user, 
                    nom: result[0].nom, 
                    prenom: result[0].prenom, 
                    email: result[0].email }, 
                    secret, { expiresIn: 86400 });
                if (err == null) res.status(200).send({ auth: true, token: token });
                else res.status(401).json('Le mot de passe ou l\'adresse mail est incorrect.');
            });
            else res.status(401).json('Le mot de passe ou l\'adresse mail est incorrect.');
        });
    } catch (error) {
        console.log(error);
    }
}) 

/***************************** Route pour la suppression d'un utilisateurs ***************************/
router.post('/delete-user', (req, res) => {
    try {
        let id = {
            id_aider: req.body.id_aider
        }
        con.query(`SELECT * FROM user_aider WHERE id_aider = '${req.body.id_aider}'`, (err, result) => {
            if (err == null) con.query(`DELETE FROM user_aider WHERE ?`, id, (err, result) => {
                if (err == null) res.status(200).json('Compte Supprimé')
            });
            else res.status(401).json('Désolé il y a une erreur?');
        })
    } catch (error) {
        console.log(error);
    }
})

/***************************** Route pour enregistrer un nouveau aider. ***************************/
router.post("/sign-up_aider", (req, res) => {
    try {
        bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
            let object = {
                nom: req.body.nom,
                prenom: req.body.prenom,
                email: req.body.email,
                password: hash,
                user_affiliate: req.body.user_affiliate
            }
            con.query(`INSERT INTO user_aider SET ?`, object, (err, resultat) => {
                if (err == null) res.status(200).json("Validé");
                else res.status(401).json('Compte non enregistré');
            });
        });
    } catch (error) {
        console.log(error);
    }
});

/***************************** Route pour la connection des aider ***************************/
router.post("/sign-in_aider", (req, res) => {
    try {
        let email = {
            email: req.body.email
        }
        con.query(`SELECT * FROM user_aider WHERE ? `, email, (err, result) => {
            if (err == null) bcrypt.compare(req.body.password, result[0].password, (err, resulta) => {
                let token = jwt.sign({ 
                    id_aider: result[0].id_aider, 
                    nom: result[0].nom, 
                    prenom: result[0].prenom, 
                    email: result[0].email, 
                    user_affiliate: result[0].user_affiliate }, 
                    secret, { expiresIn: 86400 });
                if (err == null) res.status(200).send({ auth: true, token: token });
                else res.status(401).json('Le mot de passe ou l\'adresse mail est incorrect.');
            });
            else res.status(401).json('Le mot de passe ou l\'adresse mail est incorrect.');
        });
    } catch (error) {
        console.log(error);
    }
})

/* ROUTES POUR CONTACT */
/***************************** Route pour ajouter un nouveau contact ***************************/
router.post('/new-contact', (req, res) => {
    try {
        let contact ={
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,
            telephone: req.body.telephone,
            user_affiliate_user: req.body.user_affiliate_user,
            user_affiliate_aider: req.body.user_affiliate_aider,
        }
        con.query(`INSERT INTO contact SET ?`, contact, (err, result) => {
            console.log(err);
            if (err == null) res.status(200).json('Contact ajouté.');
            else res.status(401).json('Désolé une erreur c\'est produite.');
        });
    } catch (error) {
        console.log(error); 
    }
})


/***************************** Route pour afficher les contacts. ***************************/
router.get('/getcontacts/:id', (req, res) => {
    try {
        con.query(`SELECT * FROM user 
        INNER JOIN contact 
        ON user.id_user = contact.user_affiliate_user 
        WHERE user.id_user = '${req.params.id}'`, (err, result) => {
            if (err == null) res.status(200).json(result)
            else res.status(401).json('Désolé il y a une erreur?');
        })
    } catch (error) {
        console.log(error);
    }
})

/***************************** Route pour supprimer un contact. ***************************/
router.post('/delete-contact/:delContact', (req, res) => {
    try {
        let id = {
            id_contact: req.params.delContact
        }
        con.query(`SELECT * FROM contact WHERE ? `, id, (err, result) => {
            if (err == null) con.query(`DELETE FROM contact WHERE ? `, id, (err, result) => {
                if (err == null) res.status(200).json('Contact Supprimer')
            });
            else res.status(401).json('Désolé il y a une erreur?');
        })
    } catch (error) {
        console.log(error);
    }
})

/***************************** Route pour modifier un contact. ***************************/
router.put('/modifier-contact/:id_contact', (req, res) => {
    try {
        let contact = {
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,
            telephone: req.body.telephone,
        }
            con.query(`UPDATE contact SET ? WHERE id_contact = ${req.params.id_contact}`, contact, (err, result) => {
                if (err == null) res.status(200).json('Contact modifié.')
                else res.status(401).json('Une erreur s\'est produite.')
            }
        )

    } catch (error) {
        console.log(error);
    }
})

module.exports = router;

/* ROUTES POUR LIENS */
/***************************** Route pour ajouter un nouveau lien ***************************/
router.post('/new-lien', (req, res) => {
    try {
        let lien ={
            nom: req.body.nom,
            lien: req.body.lien,
            image: req.body.image,
            user_affiliate_user: req.body.user_affiliate_user,
            user_affiliate_aider: req.body.user_affiliate_aider,
        }
        con.query(`INSERT INTO liens SET ?`, lien, (err, result) => {
            console.log(err);
            if (err == null) res.status(200).json('Liens ajouté.');
            else res.status(401).json('Désolé une erreur c\'est produite.');
        });
    } catch (error) {
        console.log(error); 
    }
})

/***************************** Route pour afficher les liens. ***************************/
router.get('/getLiens/:id', (req, res) => {
    try {
        con.query(`SELECT * FROM user INNER JOIN liens ON user.id_user = liens.user_affiliate_user WHERE user.id_user = '${req.params.id}'`, (err, result) => {
            if (err == null) res.status(200).json(result)
            else res.status(401).json('Désolé il y a une erreur?');
        })
    } catch (error) {
        console.log(error);
    }
})

/***************************** Route pour supprimer un lien. ***************************/
router.post('/delete-lien/:dellien', (req, res) => {
    try {
        let id = {
            id_lien: req.params.dellien
        }
        con.query(`SELECT * FROM liens WHERE ? `, id, (err, result) => {
            if (err == null) con.query(`DELETE FROM liens WHERE ? `, id, (err, result) => {
                if (err == null) res.status(200).json('Lien Supprimer')
            });
            else res.status(401).json('Désolé il y a une erreur?');
        })
    } catch (error) {
        console.log(error);
    }
})