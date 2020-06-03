const tweetLocations = document.querySelectorAll('#tweetLocation')
tweetLocations.forEach(tweetLocation => {
  tweetLocation.addEventListener('click', () => {
    let tweetMap
    let { lat, lng, location, id } = event.target.dataset
    const locationId = 'map_' + id
    lat = Number(lat)
    lng = Number(lng)
    let site = document.getElementById(`${locationId}`)
    tweetMap = new google.maps.Map(site, {
      center: {
        lat,
        lng
      },
      zoom: 10,
    });
    new google.maps.Marker({
      map: tweetMap,
      title: location,
      position: { lat, lng },
      animation: google.maps.Animation.DROP
    })
  })
})