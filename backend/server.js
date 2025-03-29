const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./src/models/index');
const emailRoutes = require('./src/routes/email.routes');
const rolesRoutes = require('./src/routes/roleRoutes');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/email', emailRoutes);
app.use('/roles', rolesRoutes);

// Database sync
db.sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synchronized');
    const PORT = process.env.PORT || 3500;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database sync error:', err);
    process.exit(1); 
  });

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something broke!' });
});

module.exports = app;