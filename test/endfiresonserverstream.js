var getLocalDb = require('./util').getLocalDb;
var through = require('through');
var multilevel = require('..');
var test = require('tape');

test('end should be passed to server from client', function (t) {
  t.plan(1);

  
  var db = getLocalDb();
  var server = multilevel.server(db);
  var client = multilevel.client();


  var fakeConnection = through();
  //var fakeConnection = through(function(data){
  //  console.log(data);
  //  this.queue(data);
  //});

  // get a reference to the server read stream
  db.createReadStream = function () {
    stream = through();
    stream.on('end',function(){
      t.ok("end was called!");
    })

    setImmediate(function(){
      stream.write("hi")
    });
    return stream;
  };


  server.pipe(fakeConnection).pipe(client.createRpcStream()).pipe(server);

  var clientStream = client.createReadStream();

  clientStream.once('data',function(){
    // wait for one data event. tmpstream will end streams that have been ended before replace was called.
    clientStream.end();
  })

});
