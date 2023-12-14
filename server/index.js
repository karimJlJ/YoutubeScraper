const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const scrapers = require('./scraper/scrapers');
const scrapeVideos = require('./scraper/video-scrape');
const db = require('./db');
const { EmailUniqueFunction , insertUser } = require('./db'); // Assurez-vous que le chemin est correct
const jwt = require('jsonwebtoken');
const config = require('./config');
const path = require("path")

app.use(express.static(path.resolve(__dirname, "../client/build")))

app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

//app.use('/auth', authRoutes);

app.get('/creators', async (req, res) => {
  try {
    const creators = await db.getAllCreators();
    res.send(creators);
  } catch (error) {
    console.error('Erreur lors de la récupération des créateurs :', error);
    res.sendStatus(500); // Erreur interne du serveur
  }
});

app.post('/creators', async (req, res) => {
  console.log('Requête POST pour ajouter un créateur :', req.body);

  try {
    const channelData = await scrapers.scrapeChannel(req.body.channelURL);
    const creators = await db.insertCreator(channelData.name, channelData.avatarURL,channelData.subscriberCount,
      channelData.videosCount, req.body.channelURL);
    res.send(creators);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du créateur :', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour vérifier l'unicité de l'e-mail
app.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    // Vous devrez mettre en place la logique de vérification de l'e-mail ici.
    // Par exemple, en interrogeant votre base de données.
    const isEmailUnique = await EmailUniqueFunction(email);

    if (!isEmailUnique) {
      return res.status(400).json({ success: false, error: 'Cet e-mail est déjà enregistré.' });
    }

    res.json({ isEmailUnique });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'e-mail :', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

//--------------------------  Route pour l'inscription -----------------------// 
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('Received data:', username, email, password);

    const token = jwt.sign({ email }, config.secretKey);

    const savedUser = await insertUser(username, email, password);

    res.status(201).json({ user: savedUser , token });
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// -------------------   Route d'authentification  ----------------------- //
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Vérifiez si l'utilisateur existe dans la base de données
  const user = await db.getUserByEmail(email);

  if (!user) {
    return res.status(401).json({ success: false, message: 'L\'utilisateur n\'existe pas.' });
  }

  const isPasswordValid = await db.validateUserPassword(user, password);

  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: 'Mot de passe incorrect.' });
  }

  // Générez le jeton JWT
  const token = jwt.sign({ email }, config.secretKey);

  // Renvoyez le jeton JWT au client
  res.status(200).json({ success: true, token });
});

// --------------------   Route pour valider le jeton JWT -------------------------- // 

app.post('/validate-token', (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Aucun jeton n\'a été fourni.' });
  }

  // Vérifiez le jeton JWT
  jwt.verify(token, config.secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, error: 'Le jeton n\'est pas valide.' });
    }

    // Si le jeton est valide, vous pouvez renvoyer un succès
    res.status(200).json({ success: true, email: decoded.email });
  });
});

 //----------------------        appel du scraper video  ------------------------------------   //

app.get('/api/scrapeVideo',  async  (req, res) => {
  const url = req.query.url;
  const data = await scrapeVideos.scrapeVideo(url);
  res.json(data);
})

// ------------     requete delete          ------------------------------------
app.delete('/creators/:id', async (req, res) => {
    const creatorId = Number(req.params.id); // Convertissez l'ID en nombre

    console.log('Requête DELETE pour supprimer le créateur avec ID :', creatorId);

    // Vérifiez si l'ID est une valeur numérique
    if (isNaN(creatorId)) {
        console.log('ID non numérique :', req.params.id);
        res.sendStatus(400); // Mauvaise demande
        return;
    }

    const connection = await db.getConnection();

    try {
        const creatorRepo = connection.getRepository(db.Creator);

        // Utilisez creatorId comme condition de sélection pour trouver le créateur
        console.log('Avant la recherche de créateur avec ID :', creatorId);
        const creator = await creatorRepo.findOne({where: creatorId});

        if (creator) {
            console.log('Créateur trouvé :', creator);
            await creatorRepo.remove(creator);
            console.log('Créateur supprimé avec succès :', creator);
            res.sendStatus(200);
        } else {
            console.log('Créateur non trouvé.');
            res.sendStatus(404); // Créateur non trouvé
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du créateur :', error);
        res.sendStatus(500); // Erreur interne du serveur
    } finally {
        connection.close();
    }
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "signup.html"))
}
);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

