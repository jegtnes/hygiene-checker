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

    const justEatRestaurantOverview = document.getElementsByClassName('restaurantOverview')[0];
    const container = document.createElement('div');
    const image = document.createElement('img');

    container.classList.add('o-card');
    container.style.padding = '16px';

    if (responseObject.SchemeType === 'FHRS') {
      // England, Wales, NI
      const ratingValue = parseInt(responseObject.RatingValue, 10);

      if (ratingValue >= 0 && ratingValue <= 5) {
        image.src = `${baseImgURL}${ratingValue}.jpg`;
      } else {
        console.log('edge case?', ratingValue);
      }
    } else if (responseObject.SchemeType === 'FHIS') {
      if (responseObject.RatingValue === 'Pass') {
        image.src = `${baseImgURL}scot_pass.jpg`
      } else if (responseObject.RatingValue === 'Pass and Eat Safe') {
        image.src = `${baseImgURL}scot_passandeatsafe.jpg`
      } else if (responseObject.RatingValue === 'Improvement Required') {
        image.src = `${baseImgURL}scot_improvementrequired.jpg`
      } else {
        console.log('scottish edge case?', responseObject.RatingValue);
      }
    }

    container.appendChild(image);
    justEatRestaurantOverview.parentNode.insertBefore(container, justEatRestaurantOverview.nextSibling);
  });

} else {
  console.log('stop trying to make fetch happen');
}
