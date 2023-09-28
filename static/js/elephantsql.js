var pg = require('pg');
var client = new pg.Client("postgres://gtnzjtpc:mfCGADo9hHXw-1I-qkJkiykHXiaU13PG@rajje.db.elephantsql.com/gtnzjtpc");

client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].theTime);
  });
});

module.exports = client;