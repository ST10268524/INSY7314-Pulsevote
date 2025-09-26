// MongoDB initialization script
db = db.getSiblingDB('pulsevote');

// Create collections with validations
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'password', 'email'],
      properties: {
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30,
          description: 'Username must be a string between 3 and 30 characters'
        },
        password: {
          bsonType: 'string',
          minLength: 6,
          description: 'Password must be a string with at least 6 characters'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address'
        },
        role: {
          enum: ['user', 'admin', 'moderator'],
          description: 'Role must be one of: user, admin, moderator'
        },
        isActive: {
          bsonType: 'bool',
          description: 'isActive must be a boolean'
        }
      }
    }
  }
});

db.createCollection('polls', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'options', 'createdBy'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200,
          description: 'Title must be a string between 1 and 200 characters'
        },
        options: {
          bsonType: 'array',
          minItems: 2,
          items: {
            bsonType: 'object',
            required: ['text'],
            properties: {
              text: {
                bsonType: 'string',
                minLength: 1,
                maxLength: 100
              },
              votes: {
                bsonType: 'number',
                minimum: 0
              }
            }
          }
        },
        createdBy: {
          bsonType: 'objectId',
          description: 'createdBy must be a valid ObjectId'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });

db.polls.createIndex({ createdBy: 1 });
db.polls.createIndex({ createdAt: -1 });
db.polls.createIndex({ isActive: 1 });

print('Database initialized successfully');
