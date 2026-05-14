const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    if (this.connection) return this.connection;

    try {
      mongoose.set('strictQuery', false);
      this.connection = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return this.connection;
    } catch (error) {
      console.error(`MongoDB Connection Error: ${error.message}`);
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      console.log('MongoDB Disconnected');
    }
  }
}

module.exports = new Database();
