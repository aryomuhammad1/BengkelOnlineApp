export let map;
export let userCoords;

export const getLocationPromise = () => {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};
export const loadMap = function (position, mapId) {
  const { latitude, longitude } = position.coords;
  userCoords = [longitude, latitude];
  console.log("loadMap function. . .");
  console.log("mapId :", mapId);

  mapboxgl.accessToken =
    "pk.eyJ1IjoiYXJ5b211aGFtbWFkLWRldiIsImEiOiJjbDR3OXhjc3QxaHYzM2NudXkxNjE1cjl6In0.Pn0BSM87Vv_JWFiXZg7doQ";
  map = new mapboxgl.Map({
    container: `${mapId}`, // container ID
    style: "mapbox://styles/mapbox/streets-v11", // style URL
    center: userCoords, // starting position [lng, lat]
    // pitch: 68, // pitch in degrees
    // bearing: 0, // bearing in degrees
    zoom: 14, // starting zoom
  });
  return map;
};

// LOGOUT
export const removeMap = function () {
  if (map) {
    map.remove();
    console.log("map removed!");
  }
};
