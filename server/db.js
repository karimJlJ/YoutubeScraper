const typeorm = require('typeorm');

class Creator {
  constructor(id, name, img, ytURL, subscriberCount, videoCount) {
    this.id = id;
    this.name = name;
    this.img = img;
    this.ytURL = ytURL;
    this.subscriberCount = subscriberCount;
    this.videoCount = videoCount;
  }
}

class User {
  constructor(id, username, email, password) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
  }
}

const { EntitySchema } = require('typeorm');

const CreatorSchema = new EntitySchema({
  name: 'Creator',
  target: Creator,
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar',
    },
    img: {
      type: 'text',
    },
    ytURL: {
      type: 'text',
    },
    subscriberCount: {
      type: 'text',
      nullable: true,
    },
    videoCount: {
      type: 'varchar',
      nullable: true,
    },
  },
});

const UserSchema = new EntitySchema({
  name: 'User',
  target: User,
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    username: {
      type: 'varchar',
    },
    email: {
      type: 'varchar',
    },
    password: {
      type: 'varchar',
    },
  },
});

// Créez une connexion globale une seule fois
let globalConnection = null;

async function createGlobalConnection() {
  if (!globalConnection) {
    globalConnection = await typeorm.createConnection({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'youtubecreator',
      synchronize: true,
      logging: false,
      entities: [CreatorSchema, UserSchema],
    });
  }
  return globalConnection;
}

// Fonction pour récupérer tous les créateurs depuis la base de données
async function getAllCreators() {
  const connection = await createGlobalConnection();
  const creatorRepo = connection.getRepository(Creator);
  const creators = await creatorRepo.find();
  return creators;
}

// Fonction pour insérer un nouveau créateur dans la base de données
async function insertCreator(name, img, subscriberCount, videoCount, ytURL) {
  const connection = await createGlobalConnection();

  const creator = new Creator();
  creator.name = name;
  creator.img = img;
  creator.subscriberCount = subscriberCount;
  creator.videoCount = videoCount;
  creator.ytURL = ytURL;

  const creatorRepo = connection.getRepository(Creator);
  const res = await creatorRepo.save(creator);
  console.log('saved', res);

  if (subscriberCount === null) {
    creator.subscriberCount = 0;
  }

  if (videoCount === null) {
    creator.videoCount = 0;
  }

  const allCreators = await creatorRepo.find();
  return allCreators;
}

// Fonction pour insérer un nouvel utilisateur dans la base de données
async function insertUser(username, email, password) {
  const connection = await createGlobalConnection();

  const userRepo = connection.getRepository(User);

  const newUser = new User();
  newUser.username = username;
  newUser.email = email;
  newUser.password = password;

  const savedUser = await userRepo.save(newUser);

  return {
    username: savedUser.username,
    email: savedUser.email,
    password: savedUser.password,
  };
}

// Fonction pour vérifier si l'email est unique
async function EmailUniqueFunction(email) {
  const connection = await createGlobalConnection();

  const userRepo = connection.getRepository(User);
  const existingUser = await userRepo.findOne({ where: { email } });

  return !existingUser;
}

async function getUserByEmail(email) {
    const connection = await createGlobalConnection();
    const userRepo = connection.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    return user;
  }

  async function validateUserPassword(user, password) {  
    if (user && user.password === password) {
      return true;
    } else {
      return false;
    }
  }

module.exports = {
  Creator,
  getAllCreators,
  CreatorSchema,
  UserSchema,
  getConnection: createGlobalConnection,
  User,
  insertUser,
  EmailUniqueFunction,
  insertCreator,
  getUserByEmail,
  validateUserPassword
};



