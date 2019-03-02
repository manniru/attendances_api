const faker = require("faker");
const fetch = require("node-fetch");

const url = `https://pmy4z2k70.sse.codesandbox.io/api/attendances`;

var randHex = function(len) {
  var maxlen = 8,
    min = Math.pow(16, Math.min(len, maxlen) - 1),
    max = Math.pow(16, Math.min(len, maxlen)) - 1,
    n = Math.floor(Math.random() * (max - min + 1)) + min,
    r = n.toString(16);
  while (r.length < len) {
    r = r + randHex(len - maxlen);
  }
  return r;
};

const testAttendance = data => {
  /*
  fetch("https://pmy4z2k70.sse.codesandbox.io/api/attendances")
    .then(res => res.json())
    .then(json => console.log(json));
  */
  const body = {
    userId: randHex(28),
    deviceId: randHex(16),
    tagId: randHex(8)
  };

  fetch(url, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(json => console.log(json));
};

testAttendance();
