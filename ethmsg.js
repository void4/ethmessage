Router.configure({
    layoutTemplate: 'main'
});

Router.route('/', {
    name: 'home',
    template: 'home'
});

Router.route('/register');
Router.route('/login');
Router.route('/about');

var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}

if (Meteor.isClient) {

  events = [];

  Template.comment.events({
    'submit form': function (event) {
      event.preventDefault();
      event.stopPropagation();
      Meteor.call("comment", $("textarea[name=message]").val(), $("input[name=latitude]").val(), $("input[name=longitude]").val());
      var latlng = L.latLng($("input[name=latitude]").val(), $("input[name=longitude]").val());
      var message = $("textarea[name=message]").val();
      map.closePopup();

      if (message.length>4 && message.length<1025) {
        var marker = L.marker(latlng).addTo(map);
        marker.bindPopup(escapeHtml(message));
      }
      return false;
    }
  });

  map = null;

  Template.map.rendered = function() {
    
    map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'void.cig934dsl01xcurm25znp2nw8',
        accessToken: 'pk.eyJ1Ijoidm9pZCIsImEiOiJjaWc5MzRmODEwMXdtdm9sdzd5b2p1bWpwIn0.FsryRobZRlHiXyZhPOn4qg'
    }).addTo(map);

    var circle = L.circle([51.512, -0.08], 500, {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5
    }).addTo(map);

    circle.bindPopup("DEVCON1");
    
      
    function onMapClick(e) {
      var popup = L.popup();
      popup.setLatLng(e.latlng).openOn(map);
      Blaze.renderWithData(Template.comment, {latlong:e.latlng}, popup._contentNode);
    }

    map.on("click", onMapClick);

    function updateData() {
    
      Meteor.call("eventlist", function(err, res) {
        if (!err) {
          
          for (i=events.length;i<res.length;i++) {
            console.log(res[i]);
            var latlng = L.latLng(res[i].latitude,res[i].longitude);
            var marker = L.marker(latlng).addTo(map);
            marker.bindPopup(escapeHtml(res[i].comment));
            /*
            var popup = L.popup();
            
            popup.setLatLng(latlng).openOn(map);//.setContent(Blaze.toHTML(Template.comment))
            Blaze.renderWithData(Template.comment, {msg:events[i].comment, latlong: latlng}, popup._contentNode);
            */
          }//Session.set("events",)
          events = res;
        } else {
          console.log("error");
        }
      });
    }

    Meteor.setInterval(updateData, 1000);
  }

  Template.register.events({
      'submit form': function(event){
          event.preventDefault();
          var email = $('[name=email]').val();
          var password = $('[name=password]').val();
          Accounts.createUser({
              email: email,
              password: password
          }, function(error){
              if(error){
                  console.log(error.reason); // Output error if registration fails
              } else {
                  Router.go("home"); // Redirect user if registration succeeds
              }
          });
      }
  });

  Template.navigation.events({
    'click .logout': function(event){
        event.preventDefault();
    }
  });

  Template.navigation.events({
    'click .logout': function(event){
        event.preventDefault();
        Meteor.logout();
    }
  });

  Template.login.events({
    'submit form': function(event){
        event.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(email, password, function(error){
          if(error){
              console.log(error.reason);
          } else {
              Router.go("home");
          }
        });
    }
  });
}

CommentSchema = new SimpleSchema({
  comment: {
    type: String
  },
  latitude: {
    type: Number,
    decimal: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    decimal: true,
    min: -180,
    max: 180
  }
});

if (Meteor.isServer) {
  eventindex = 12;
  events = [];

  function addq(element) {
    console.log("ADD", element);
    while (events.length>100) {
      events.shift();
    }
    events.push(element);
  }

  Meteor.startup(function () {

    //packages.json: "tmp":"0.0.28",
    /*
    var fs = Npm.require('fs');
    var os = Npm.require('os');
    var path = Npm.require('path');

    var tmp = Meteor.npmRequire('tmp');

    var tmpobj = tmp.fileSync(keep=true);
    console.log("File: ", tmpobj.name);
    console.log("Filedescriptor: ", tmpobj.fd);
    tmpobj.removeCallback();
    */

          update = function() {
        for (;eventindex<hashlist.namecount();eventindex++) {
          //console.log(hashlist.hashes(eventindex));
          cathash = function(hash) {
            ipfs.cat(hash, function(err, res) {
            if(err || !res) return console.error(err, res);
              if(res.readable) {
                //res.pipe(process.stdout) // Returned as a stream
                
                var string = ''
                res.on('data',function(buffer){
                  var part = buffer;//.read().toString();
                  string += part;
                });

                res.on("end", function() {
                  try {
                    var parsed = JSON.parse(string);
                    if (Match.test(parsed, CommentSchema)) {
                      console.log(parsed.comment, parsed.longitude, parsed.latitude);
                      addq(parsed);
                    } else {
                      console.log("Invalid content", parsed, string);
                    }
                  } catch (e) {
                      console.log("Failed to parse JSON", e, string);
                      return false;
                  }
                });
              } else {
                console.log("String", res); // Returned as a string
              }
            })
          }

          /*
          cathash_sync = Meteor.wrapAsync(cathash);
          try {
            cathash_sync(hashlist.hashes(eventindex));
          } catch(e) {
            console.log(e);
          }
          */
          //while (true) {
          //  try {
              cathash(hashlist.hashes(eventindex));
          //    break;
          //  } catch (e) {console.log(e);}
          //}
        }

        return events;
      }

    Meteor.methods({
      comment: function(message, latitude, longitude) {
        success = false;
        console.log(message, latitude, longitude);
        if (message.length>4 && message.length<1025) {
          var files = [new Buffer(JSON.stringify({"comment":message, "latitude": parseFloat(latitude), "longitude": parseFloat(longitude)}))];
          ipfs.add(files, function(err, res) {
          if(err || !res) return console.error(err);

            res.forEach(function(file) {
                console.log(file.Hash);
                console.log(file.Name);
                hashlist.publish(file.Hash, {from:web3.eth.accounts[0], gas:300000});
            })
          });
        }
        return success;
      },
      eventlist: function() {
        return events;
      }
    });

    var ipfsapi = Meteor.npmRequire('ipfs-api');
    var ipfs = ipfsapi('localhost', '5001');

    web3 = new Web3();
    if (!web3.currentProvider) {
      web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
    }
    var hashlistContract = web3.eth.contract([{"constant":false,"inputs":[{"name":"hash","type":"string"}],"name":"publish","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"hashes","outputs":[{"name":"","type":"string"}],"type":"function"},{"constant":true,"inputs":[],"name":"namecount","outputs":[{"name":"number","type":"uint256"}],"type":"function"}]);
    hashlist = hashlistContract.at("0xc89a9ccdbc84d743c22a583d85931bb92c1bb78c")
    console.log("Number of entries: "+hashlist.namecount())

    Meteor.setInterval(update, 5000);
  });
}
