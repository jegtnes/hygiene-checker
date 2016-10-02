if (window.fetch) {
  const baseURL = 'https://fsaapiwrapper.jegtnes.com/establishments?address=';
  const baseImgURL = 'http://static.jegtnes.co.uk/hygienechecker/';
  let headers = new Headers();
  headers.append('Content-Type', 'application/json');

  let requestSettings = {
    method: 'GET',
    headers: headers,
    mode: 'cors',
  };

  let address = encodeURIComponent(document.querySelector('p.address').innerText);

  let fullURL = baseURL + address;

  fetch(fullURL, requestSettings).then((response) => {
    console.log(response);
    return response.json();
  }).then((responseObject) => {
    if (responseObject.SchemeType === 'FHRS') {
      const ratingValue = parseInt(responseObject.RatingValue, 10);
      console.log(ratingValue);
      // England, Wales, NI

      let justEatRestaurantOverview = document.getElementsByClassName('restaurantOverview')[0];

      if (ratingValue >= 0 && ratingValue <= 5) {
        let container = document.createElement('div');
        container.classList.add('o-card');
        container.style.padding = '16px';

        let image = document.createElement('img');
        image.src = `${baseImgURL}${ratingValue}.jpg`;

        container.appendChild(image);

        justEatRestaurantOverview.parentNode.insertBefore(container, justEatRestaurantOverview.nextSibling);
      }
    } else if (responseObject.SchemeType === 'FHIS') {
      // Scotland

    }
    console.log(responseObject);
  });

} else {
  console.log('stop trying to make fetch happen');
}
